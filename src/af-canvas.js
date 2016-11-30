
var afCanvas = (function($) {
	var init = function(width,height,bgcolor) {
		$(af.application).append('<div id="panels"><canvas style="overflow: hidden;" id="canvas" width="'+width+'" height="'+height+'"></canvas></div>');

		$("html,body").css({
			"height": "100%",
			"width": "100%",
			"background-color": "#ffffff",
			'margin': "0 auto"
		})
		$("#canvas").css({
			"width": "100%",
			"display": "block"
		})

		$("#panels").css({
			"width": "100%",
			"background": bgcolor,
			"z-index": "0",
			"position": "absolute",
			"left": "0%",
			"margin":"0 auto",
			"display":"none"
		})
	}
	
	var show=function(){
		$("#panels").css({
			"display":"block"
		});
	}

	return {
		init: init,show:show
	};

})(window.$);