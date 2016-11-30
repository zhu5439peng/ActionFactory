var afAction = (function(createjs, $) {

	var isrunning = false;

	//scene:所属场景，action：触发的事件，eventType：createjs侦听的事件，actionHandler：执行的回调函数参数
	var bindButtonAction = function(scene, action, eventType, actionHandler) {
		var display=getDisplayByName(scene.element,action.name);
		
		if (null == display) return;
		display.on(eventType, function(evt) {
			if (af.ismode(scene.name)) return;
			action.event=evt;

			if (null != action.timeline) {
				var target_actions = scene.a('timeline', action.timeline);
				if(target_actions.length<=0)return;
				for(var i=0;i<target_actions.length;i++)
				{
					var target_action=target_actions[i];
					target_action.rewind = action.rewind;
					run(target_action);
				}
			} else
				run(action);

		});
	}
	
	var getDisplayByName=function(display,name){
		var actionNameList=name.split(".");
		var len=actionNameList.length;
		if(len<=0)return null;
		var i=0;
		var target=display;
		while(true)
		{
			var actionName=actionNameList[i];
			if(target[actionName]==null)return null;
			target=target[actionName];
			
			i++;
			if(i==len)
			{
				return target;
			}
		}
	}


	var run = function(action, index) {

//		console.log("action_index::", action.type, index);
		if (true == action.lock) return;

		var nexts = action.next;
		if (null == nexts) {
			action.lock = false;
			return;
		}

		var nextsLength = nexts.length;
		var nextsIndex = index || 0;

		if (nextsLength <= nextsIndex) {
			action.lock = false;
			return;
		}

		var next = action.rewind ? nexts[nextsLength - nextsIndex - 1] : nexts[nextsIndex];

		var fragments = next.fragment;
		if (null == fragments) {
			action.lock = false;
			afterAnimation()
			return;
		}
		var fragmentsLength = fragments.length;
		var fragmentsIndex = 0;

		if (fragmentsLength == 0 || next.skip) {
			action.lock = false;
			afterAnimation();
			return;
		}

		if (next.lock)
			action.lock = true;

		if (next.random) {
			var rand = Math.random() * fragmentsLength >> 0;
			fragments = [fragments[rand]];
			fragmentsLength = 1;
		}

		for (var i in fragments) {
			var fragment = fragments[i];

//			console.log("fragment.type::", fragment.type);

			switch (fragment.type) {
				case 'show':
					{
						if (fragment.name == null) af.showScene(action.scene, true);
						else af.showScene(fragment.name, true);
						checkFragment();
						break;
					}
				case 'hide':
					{
						if (fragment.name == null) af.hideScene(action.scene, true);
						else af.hideScene(fragment.name, true);
						checkFragment();
						break;
					}
				case 'play':
					{
						var element=getDisplayByName(af.s(action.scene).element,fragment.name);

						if (null == element.gotoAndStop) {
							checkFragment();
							continue;
						}
						if (element.aftimeline == null)
							element.aftimeline = new afTimeline(element);

						if (action.rewind) {
							element.aftimeline.gotoAndStop(fragment.end);
							element.aftimeline.rewind();
							element.aftimeline.stopAt(fragment.start, function() {
								checkFragment();
							})
						} else {
							element.aftimeline.gotoAndStop(fragment.start);
							element.aftimeline.stopAt(fragment.end, function() {
								checkFragment();
							})
						}
						break;
					}
				case 'loop':
					{
						var element=getDisplayByName(af.s(action.scene).element,fragment.name);

						if (null == element.gotoAndStop) {
							checkFragment();
							continue;
						}
						if (element.aftimeline == null)
							element.aftimeline = new afTimeline(element);

						if (action.rewind) {
							element.aftimeline.rewind();
							element.aftimeline.gotoAndPlay(fragment.end, fragment.start);
						} else {
							element.aftimeline.gotoAndPlay(fragment.start, fragment.end);
						}
						break;
					}
				case 'stop':
					{
						var element=getDisplayByName(af.s(action.scene).element,fragment.name);
						
						if (null == element.gotoAndStop) {
							checkFragment();
							continue;
						}
						
						if (element.aftimeline == null)
							element.aftimeline = new afTimeline(element);
							
						element.aftimeline.gotoAndStop(fragment.frame);
						checkFragment();
						break;
					}
				case 'url':
					{
						window.open(fragment.name, fragment.target);
						checkFragment();
						continue;
						break;
					}
				case 'delay':
					{
						setTimeout(function() {
							checkFragment();
						}, parseInt(fragment.sec) * 1000)
						break;
					}
				case 'turn':
					{
						afTurn.exectue(action, fragment, function() {
							checkFragment();
						})
						break;
					}
				case 'position':
					{
						afPosition.execute(action.scene, fragment);
						checkFragment();
						break;
					}
				case 'handler':
					{
						window[action.scene][fragment.name]&&window[action.scene][fragment.name](action.event);
						checkFragment();
						break;
					}
				case 'mapping':
					{
						var element = af.s(action.scene).element[fragment.name];
						
						if(null!=element.gotoAndStop)
						{
							if (element.aftimeline == null)
								element.aftimeline = new afTimeline(element);
							element.aftimeline.gotoAndStop(action.event);
							
						}
						else if(null!=element.text)
						{
							element.text=""+action.event;
						}
						checkFragment();
						break;
					}
				case 'music':
					{
						var soundName=fragment.name.split(".")[0];
						if(fragment.state=='play')
						{
							playSound(soundName,-1);
						}
						else if(fragment.state=='stop')
						{
							createjs.Sound.stop(soundName);
						}
						checkFragment();
						break;
					}
				default:
					{
						afPlug.fragmentHandler(action, fragment, function() {
							checkFragment();
						});
						break;
					}
			}
		}

		function checkFragment() {
			fragmentsIndex++;
			if (fragmentsIndex == fragmentsLength) afterAnimation();
		}

		//处理所有的指令
		function afterAnimation() {

//			console.log("下一步动画");

			//默认向下
			nextsIndex++;
			af.trace("default");


			if (next.skip) {
				if (next.toggle)
					next.skip = false;
				if (next.once)
					next.skip = true;
				run(action, nextsIndex);
				return;
			}

			if (next.lock) {
				action.lock = false;
			}

			//当前的next的所有指令
			if (next.toggle) {
				af.trace("toggle");
				next.skip = !next.skip;
			}

			if (next.loop) {
				af.trace("loop");
				nextsIndex--;
			}

			if (next.jump) {
				af.trace("jump");
				nextsIndex++;
			}

			if (next.prev) {
				af.trace("prev");
				nextsIndex -= 2;
				if (nexts.index < 0) nexts.index = 0;
			}

			if (next.reback) {
				af.trace("reback");
				nextsIndex = 0;
			}


			if (next.once) {
				af.trace("once");
				next.skip = true;
			}

			if (next.exit) {
				af.trace("exit");
				return;
			}

			run(action, nextsIndex);
		}
	}

	var execute = function(scene) {
		for (var i in scene.action) {
			var action = scene.action[i];
			switch (action.type) {
				case 'click':
					{
						bindButtonAction(scene, action, 'click', 'click');
						break;
					}
				case 'pressDown':
					{
						bindButtonAction(scene, action, 'mousedown', 'pressDown');
						break;
					}
				case 'pressUp':
					{
						bindButtonAction(scene, action, 'pressup', 'pressUp');
						break;
					}
			}
		}

		//init触发
		afAction.dispatchOn(scene.name, "init");
	}


	/* 触发事件 */
	var dispatchOn = function(sceneName, actionType, evt) {

		if (af.ismode(sceneName)) return;
		var scene = af.s(sceneName);
		var actions = scene.a(actionType);
		if (actions.length<=0) return;
		
		for(var i=0;i<actions.length;i++)
		{
			var action=actions[i];
			action.event=evt;
			
			if (null != action.timeline) {
				var target_actions = scene.a('timeline', action.timeline);
				if(target_actions.length<=0)continue;
				var target_action=target_actions[0];
				target_action.rewind = action.rewind;
				run(target_action);
			} else
				run(action);
		}
	}

	/*广播事件，只对可视化的scene起作用*/
	//entire: 针对全部的scene
	var dispatch = function(actionType, evt, entire) {
		//取出所有可用的scene
		var list = [];
		for (var s in af.sceneCach) {
			if (entire || af.s(s).visible)
				list.push(s);
		}
		for (var n in list)
			dispatchOn(list[n], actionType, evt);
	}

	return {
		execute: execute,
		dispatchOn: dispatchOn,
		dispatch: dispatch
	}
})(window.createjs, window.$)