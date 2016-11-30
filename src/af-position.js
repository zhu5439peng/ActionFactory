var afPosition = (function() {

	function execute(sceneName, position) {
		var scene = af.s(sceneName);
		var elem = scene.element;
		
		var display = elem[position.name];

		if (position.scale == 'scale') {
			if (af.hasValue(position,'left')) display.x = parseInt(position.left);
			else if (af.hasValue(position,'center')) display.x = af.canvasWidth * 0.5 + parseInt(position.center);
			else if (af.hasValue(position,'right')) display.x = af.canvasWidth - parseInt(position.right);
			if (af.hasValue(position,'top')) display.y = parseInt(position.top);
			else if (af.hasValue(position,'middle')) display.y = af.canvasHeight * 0.5 + parseInt(position.middle);
			else if (af.hasValue(position,'bottom')) display.y = af.canvasHeight - parseInt(position.bottom);
			return;
		}
		
		if(display==null||display.__proto__.nominalBounds==null)
		{
			console.log("非法的格式："+position.name);
			return;
		}
		
		var realyWidth = display.__proto__.nominalBounds.width;
		var realyHeight = display.__proto__.nominalBounds.height;

		display.regX = 0;
		display.regY = 0;

		switch (position.scale) {
			case "cover":
				{
					if (realyWidth / realyHeight > af.canvasWidth / af.canvasHeight) {
						display.scaleX = display.scaleY = af.canvasHeight / realyHeight;
						var currentWidth = realyWidth * (af.canvasHeight / realyHeight);
						display.x = -(currentWidth - af.canvasWidth) * 0.5;
						display.y = 0;
						realyWidth=currentWidth;
						realyHeight = af.canvasHeight;
					} else {
						display.scaleY = display.scaleX = af.canvasWidth / realyWidth;
						var currentHeight = realyHeight * (af.canvasWidth / realyWidth);
						display.y = -(currentHeight - af.canvasHeight) * 0.5;
						display.x = 0;
						realyWidth = af.canvasWidth;
						realyHeight=currentHeight;
					}
					break;
				}
			case "contain":
				{
					if (realyWidth / realyHeight > af.canvasWidth / af.canvasHeight) {
						display.scaleY = display.scaleX = af.canvasWidth / realyWidth;
						var currentHeight = realyHeight * (af.canvasWidth / realyWidth);
						display.y = -(currentHeight - af.canvasHeight) * 0.5;
						display.x = 0;
						realyWidth = af.canvasWidth;
						realyHeight=currentHeight;
					} else {						
						display.scaleX = display.scaleY = af.canvasHeight / realyHeight;
						var currentWidth = realyWidth * (af.canvasHeight / realyHeight);
						display.x = -(currentWidth - af.canvasWidth) * 0.5;
						display.y = 0;
						realyWidth=currentWidth;
						realyHeight = af.canvasHeight;
					}
					break;
				}
			case "no":
				{
					var actualWidth = realyWidth / (af.screenWidth / af.canvasWidth);
					var actualHeight = realyHeight / (af.screenWidth / af.canvasWidth);
					display.scaleX = display.scaleY = actualWidth / realyWidth;
					realyWidth = actualWidth;
					realyHeight = actualHeight;
					break;
				}
			case "autoScale":
				{
					realyWidth*=display.scaleX;
					realyHeight*=display.scaleY;
					break;
				}
			default:
				{
					return;
				}
		}

		if (af.hasValue(position,'left')) display.x = parseInt(position.left);
		else if (af.hasValue(position,'center')) display.x = (af.canvasWidth - realyWidth) * 0.5 + parseInt(position.center);
		else if (af.hasValue(position,'right')) display.x = af.canvasWidth - realyWidth + parseInt(position.right);
		
		if (af.hasValue(position,'top')) display.y = parseInt(position.top);
		else if (af.hasValue(position,'middle')) display.y = (af.canvasHeight - realyHeight) * 0.5 + parseInt(position.middle);
		else if (af.hasValue(position,'bottom')) display.y = af.canvasHeight - realyHeight + parseInt(position.bottom);
	}

	return {
		execute: execute
	}


})()