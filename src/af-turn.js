var afTurn = (function() {
	
	var _turnAble=true;
	
	function exectue(action, fragment, handler) {

		af.asDefault(fragment, 'effect', 'default');
		af.asDefault(fragment, 'ease', 'linear');

		var effect = fragment.effect;
		var ease = getEaseType(fragment.ease);
		var lastScene=action.scene;
		var currentScene=fragment.target;
		
		switch(fragment.direction)
		{
			case "top":
			{
				turnPrev(lastScene,currentScene,effect,ease,handler,false);
				break;
			}
			case "bottom":
			{
				turnNext(lastScene,currentScene,effect,ease,handler,false);
				break;
			}
			case "left":
			{
				turnPrev(lastScene,currentScene,effect,ease,handler,true);
				break;
			}
			case "right":
			{
				turnNext(lastScene,currentScene,effect,ease,handler,true);
				break;
			}
		}
	}

	function getEaseType(value) {
		var Ease = createjs.Ease; // shortcut.
		var dataProvider = [{
			type: Ease.backIn,
			label: "backIn"
		}, {
			type: Ease.backInOut,
			label: "backInOut"
		}, {
			type: Ease.backOut,
			label: "backOut"
		}, {
			type: Ease.bounceIn,
			label: "bounceIn"
		}, {
			type: Ease.bounceInOut,
			label: "bounceInOut"
		}, {
			type: Ease.bounceOut,
			label: "bounceOut"
		}, {
			type: Ease.circIn,
			label: "circIn"
		}, {
			type: Ease.circInOut,
			label: "circInOut"
		}, {
			type: Ease.circOut,
			label: "circOut"
		}, {
			type: Ease.cubicIn,
			label: "cubicIn"
		}, {
			type: Ease.cubicInOut,
			label: "cubicInOut"
		}, {
			type: Ease.cubicOut,
			label: "cubicOut"
		}, {
			type: Ease.elasticIn,
			label: "elasticIn"
		}, {
			type: Ease.elasticInOut,
			label: "elasticInOut"
		}, {
			type: Ease.elasticOut,
			label: "elasticOut"
		}, {
			type: Ease.linear,
			label: "linear"
		}, {
			type: Ease.quadIn,
			label: "quadIn"
		}, {
			type: Ease.quadInOut,
			label: "quadInOut"
		}, {
			type: Ease.quadOut,
			label: "quadOut"
		}, {
			type: Ease.quartIn,
			label: "quartIn"
		}, {
			type: Ease.quartInOut,
			label: "quartInOut"
		}, {
			type: Ease.quartOut,
			label: "quartOut"
		}, {
			type: Ease.quintIn,
			label: "quintIn"
		}, {
			type: Ease.quintInOut,
			label: "quintInOut"
		}, {
			type: Ease.quintOut,
			label: "quintOut"
		}, {
			type: Ease.sineIn,
			label: "sineIn"
		}, {
			type: Ease.sineInOut,
			label: "sineInOut"
		}, {
			type: Ease.sineOut,
			label: "sineOut"
		}];

		for (var i in dataProvider) {
			if (dataProvider[i].label == value)
				return dataProvider[i].type;
		}
		return Ease.linear;
	}

	function turnPrev(lastScene,currentScene,effect,ease,handler,abnormal) {
		//平移，扫描
		//translation,scanning
		if(_turnAble==false)return;
		if(af.ismode(lastScene))return;
		_turnAble=false;
		
		var swipe_effect=effect;
		var ease_type=ease;
		
		if (swipe_effect == 'default') {
			af.hideScene(lastScene, true);
			af.showScene(currentScene, true);
			_turnAble = true;
			handler();
		} else if (swipe_effect == 'translation') {
			af.showScene(currentScene, false, "before");

			var currentDisplay = af.s(currentScene).element;
			currentDisplay.x = abnormal?-af.canvas.width:0;
			currentDisplay.y = abnormal?0:-af.canvas.height;

			var lastDisplay = af.s(lastScene).element;

			afAction.dispatchOn(lastScene, "hide");
			
			var lastDisplayTo=abnormal?{x:af.canvas.width}:{y:af.canvas.height};
			var currentDisplayTo=abnormal?{x:0}:{y:0};

			createjs.Tween.get(lastDisplay)
				.to(lastDisplayTo, 1000, ease_type);

			createjs.Tween.get(currentDisplay)
				.to(currentDisplayTo, 1000, ease_type)
				.call(function() {
					af.hideScene(lastScene);
					afAction.dispatchOn(currentScene, "show");
					_turnAble = true;
					handler();
				});
		} else if (swipe_effect == 'scanning') {
			af.showScene(currentScene);

			var _mask = new createjs.Shape();
			_mask.graphics.beginFill("#0000ff").drawRect(0, 0, af.canvas.width, af.canvas.height);
			_mask.visible = false;
			_mask.x=abnormal?-af.canvas.width:0;
			_mask.y = abnormal?0:-af.canvas.height;
			af.stage.addChild(_mask);

			var currentDisplay = af.s(currentScene).element;
			currentDisplay.mask = _mask;
			
			var _maskTo=abnormal?{x:0}:{y:0}

			createjs.Tween.get(_mask)
				.to(_maskTo, 1000, ease_type)
				.call(function() {
					currentDisplay.mask = null;
					af.stage.removeChild(_mask);
					af.hideScene(lastScene);
					_turnAble = true;
					handler();
				})
		}
	}

	function turnNext(lastScene,currentScene,effect,ease,handler,abnormal) {
		if(_turnAble==false)return;
		if(af.ismode(lastScene))return;
		_turnAble=false;
		
		var swipe_effect=effect;
		var ease_type=ease;
		
		if (swipe_effect == 'default') {
			af.hideScene(lastScene, true);
			af.showScene(currentScene, true);
			_turnAble = true;
			handler();
		} else if (swipe_effect == 'translation') {
			af.showScene(currentScene);

			var currentDisplay = af.s(currentScene).element;
			currentDisplay.x = abnormal?af.canvas.width:0;
			currentDisplay.y = abnormal?0:af.canvas.height;

			var lastDisplay = af.s(lastScene).element;

			afAction.dispatchOn(lastScene, "hide");
			
			var lastDisplayTo=abnormal?{x:-af.canvas.width}:{y:-af.canvas.height};
			var currentDisplayTo=abnormal?{x:0}:{y:0};
			
			createjs.Tween.get(lastDisplay)
				.to(lastDisplayTo, 1000, ease_type);

			createjs.Tween.get(currentDisplay)
				.to(currentDisplayTo, 1000, ease_type)
				.call(function() {
					af.hideScene(lastScene);
					afAction.dispatchOn(currentScene, "show");
					_turnAble = true;
					handler();
				});
		} else if (swipe_effect == 'scanning') {
			af.showScene(currentScene);

			var _mask = new createjs.Shape();
			_mask.graphics.beginFill("#0000ff").drawRect(0, 0, af.canvas.width, af.canvas.height);
			_mask.visible = false;
			_mask.x=abnormal?af.canvas.width:0;
			_mask.y = abnormal?0: af.canvas.height;
			af.stage.addChild(_mask);

			var currentDisplay = af.s(currentScene).element;
			currentDisplay.mask = _mask;
			
			var _maskTo=abnormal?{x:0}:{y:0};

			createjs.Tween.get(_mask)
				.to(_maskTo, 1000, ease_type)
				.call(function() {
					currentDisplay.mask = null;
					af.stage.removeChild(_mask);
					af.hideScene(lastScene);
					_turnAble = true;
					handler();
				})
		}
	}

	return {
		exectue: exectue
	};


})();