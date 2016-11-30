var frameObject = function(target) {
	var target = target;
	var state = 0;
	var frameStop = 0;
	var frameStopHandler;
	var frameStart = 0;
	var frameEnd = 0;
	var time;
	var rewinding = false;
	var playing = false;

	var update = function() {
		if (target == null) return;
		if (playing == false) return;
		var w;
		if (rewinding) {
			w = target.currentFrame - 1;
			if (w < 0) {
				w = target.timeline.duration - 1;
			}
			target.gotoAndStop(w);
		} else {
			w = target.currentFrame + 1;
			if (w >= target.timeline.duration) {
				w = 0;
			}
			target.gotoAndStop(w);
		}

		if (state == 1) {
			if (w == frameStop) {
				state = 0;
				target.gotoAndStop(frameStop);
				playing = false;
				rewinding = false;
				if (frameStopHandler) frameStopHandler();
			}
		} else if (state == 2) {
			if (w == frameEnd) {
				target.gotoAndStop(frameStart);
			}
		}
	}

	var rewind = function() {
		rewinding = true;
	}

	var stopAt = function(_frameStop, _frameStopHandler) {
		state = 1;
		if(null==_frameStop)_frameStop=target.timeline.duration-1;
		
		if (false == isNaN(_frameStop)) {
			frameStop = _frameStop;
		} else {
			frameStop = labelToFrame(target, _frameStop);
		}
		if (frameStop == target.currentFrame) {
			state = 0;
			if (_frameStopHandler) _frameStopHandler();
			rewinding = false;
			return;
		}

		frameStopHandler = _frameStopHandler;
		playing = true;
	};

	var gotoAndPlay = function(_frameStart, _frameEnd) {
		state = 2;
		
		var _frameInit;
		
		if(null==_frameStart){
			_frameStart=0;
			_frameInit=target.currentFrame;
		}
		else if (false == isNaN(_frameStart)) {
			_frameInit=frameStart = _frameStart;
		} else {
			_frameInit=frameStart = labelToFrame(target, _frameStart);
		}
		
		if(null==_frameEnd){
			_frameEnd=target.timeline.duration-1;
		}else if (false == isNaN(_frameEnd)) {
			frameEnd = _frameEnd;
		} else {
			frameEnd = labelToFrame(target, _frameEnd);
		}
		
		target.gotoAndStop(_frameInit);
		playing=true;
	}

	var gotoAndStop = function(_frame) {
		state = 0;
		
		if(null==_frame)_frame=target.currentFrame;
		
		if (false == isNaN(_frame))
			target.gotoAndStop(_frame);
		else
			target.gotoAndStop(labelToFrame(target, _frame));
		playing = false;
		rewinding = false;
	}

	var delay = function(_time, _delayHandler) {
		if (delayHandler != null) {
			clearTimeout(time);
		}

		delayHandler = _delayHandler;
		time = setTimeout(function() {
			if (delayHandler) {
				delayHandler();
				delayHandler = null;
			}
		}, _time);
	}

	var clearDelay = function() {
		if (delayHandler != null) {
			clearTimeout(time);
			delayHandler = null;
		}
	}

	var getDisplayObject = function() {
		return target;
	}

	var labelToFrame = function(mc, label) {
		var labels = mc.timeline.getLabels(label);
		if (labels.length > 0) {
			var frame = -1;
			var len = labels.length;
			for (var i = 0; i < len; i++) {
				if (labels[i].label == label) {
					frame = labels[i].position;
//					console.log(frame);
				}
			}
		}
		return frame;
	}

	return {
		update: update,
		stopAt: stopAt,
		gotoAndPlay: gotoAndPlay,
		gotoAndStop: gotoAndStop,
		delay: delay,
		clearDelay: clearDelay,
		rewind: rewind,
		getDisplayObject: getDisplayObject
	};

}

var afTimeline = function(target) {
	var obj = new frameObject(target);

	target.gotoAndStop(0);
	afTimeline.lists.push(obj);

	return {
		update: obj.update,
		stopAt: obj.stopAt,
		gotoAndPlay: obj.gotoAndPlay,
		gotoAndStop: obj.gotoAndStop,
		delay: obj.delay,
		clearDelay: obj.clearDelay,
		rewind: obj.rewind,
		getDisplayObject: obj.getDisplayObject
	}
}

afTimeline.lists = [];
afTimeline.update = function() {
	for (var i = afTimeline.lists.length - 1; i >= 0; i--)
		afTimeline.lists[i].update();
}