var afJsLoad = (function(createjs,$) {
	var _complete;
	var load = function(path, oncomplete) {
		_complete = oncomplete;

		var queue = new createjs.LoadQueue(true);
		queue.on("fileload", loadHandler);
		queue.on("error", errorHandler);
		queue.loadFile({
			id: path,
			type:'text',
			src: path
		});
	}

	var loadHandler = function(event) {
		var item = event.item;
		var id = item.id;
		var result = event.result;
		_complete(null,result);
	}

	var errorHandler = function(event) {
		_complete("error");
	}

	return {
		load: load
	};
})(window.createjs,window.$);

