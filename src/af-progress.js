var afProgress = (function() {
	var execute = function(handler) {
		afDefaultLoading.execute(handler);
	}

	var completeSWF = function() {
		afDefaultLoading.progress(10);
	}

	var completePlug = function() {
		afDefaultLoading.progress(20);
	}

	var loadImage = function(value) {
		value = (value * 0.8 + 20) >> 0;
		if(value==100)value=99;
		
		afDefaultLoading.progress(value);
			
		console.log("加载：",value);
	}

	var completeImage = function() {
		afDefaultLoading.progress(99);
	}

	var completeAf = function(handler) {

		setTimeout(function() {
			afDefaultLoading.destory();
			handler();
		}, 600)
	}

	return {
		execute: execute,
		completeSWF: completeSWF,
		completePlug: completePlug,
		completeImage: completeImage,
		completeAf: completeAf,
		loadImage: loadImage
	}
})()

var afDefaultLoading = (function() {

	var execute = function(handler) {

		$(af.application).append('<div class="Bars"><div class="BarsDiv"></div></div>');

		$("*").css({
			"margin": "0",
			"padding": "0"
		})

		$(".Bars").css({
			"position": "relative",
			"z-index": "2",
			"width": "100%",
			"border": "0px solid #B1D632"
		})
		$(".BarsDiv").css({
			"display": "block",
			"position": "relative",
			"background": "#00F",
			"color": "#333333",
			"height": "10px",
			"line-height": "10px",
			"background": "#090",
			"width": "0%",
			"transition": "width 0.5s",
			"-moz-transition": "width 0.5s",
			"-webkit-transition": "width 0.5s",
			"-o-transition": "width 0.5s"
		})


		handler();
	}

	var progress = function(value) {
		$(".BarsDiv").css({
			"width": value + "%"
		})
	}

	var destory = function() {
		$(".Bars").css({
			"display": "none"
		});
	}

	return {
		execute: execute,
		progress: progress,
		destory: destory
	}

})()