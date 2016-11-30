var afImgLoad=(function(createjs){
	var _complete;
	var _progress;
	var _file;
	var _loader;
	var load=function(manifest,progressHandler,completeHandler,fileHandler){
		_progress=progressHandler;
		_complete=completeHandler;
		_fileHandler=fileHandler;
		
		images = images || {};
		_loader = new createjs.LoadQueue(false);
		_loader.installPlugin(createjs.Sound);
		_loader.addEventListener("fileload", fileloadHandler);
		_loader.addEventListener("progress", handleProgress);
		_loader.addEventListener("complete", handleComplete);
		
		if(manifest.length>0)
		{
			var reg=af.m.swf.match(/(\.\.\/)+/g);
			if(reg!=null)
			{
				for(var index in manifest)
				{
					var obj=manifest[index];
					obj.src=reg+obj.src;
				}
			}
			_loader.loadManifest(manifest);
			
		}
		else 
			_complete();
	}
	
	var fileloadHandler = function(evt) {
		if (evt.item.type == "image") {
			images[evt.item.id] = evt.result;
			if(_fileHandler){
				_fileHandler(evt.item.id);
			}
		}
	}
	
	var handleProgress=function(event) {
		var value=event.loaded*100>>0;
		_progress(value);
	}
	
	var handleComplete=function(evt) {
		_complete();
	}
	
	return {load:load}
})(window.createjs)
