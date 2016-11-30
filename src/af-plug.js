var afPlug = (function() {

	var _list;
	var _handler;
	var _listIndex;
	var _plugPath;
	var _public;


	var _plugs = {
		"explain": [],
		"progress": [],
		"action": [],
		"fragment": [],
		"updateView":[]
	};

	var load = function(list, handler) {
		
		_list=[];
		
		for(var n in list[0])
			_list.push(n);
		
		_handler = handler;
		_listIndex = 0;
		_public = {};

		if (_list.length <= 0) {
			_handler();
			return;
		}

		//获取plug所在的 路径
		getPlugPath(loadPublic);
	}

	var loadPublic = function() {

		if (_listIndex == _list.length) {
			loadDepends();
			return;
		}

		afJsLoad.load(getPublicPath(_listIndex), function(err, result) {
			$(af.application).append("<script>(function(){var module=afPlug.getPublic('" + _list[_listIndex] + "');" + result + "})()</script>");
			_listIndex++;
			loadPublic();
		});

	}

	var loadDepends = function() {
		var _depends = [];
		for (var name in _public) {
			var plug = _public[name];
			for (var value in plug.depends) {
				var localUrl=plug.depends[value];
				if('http'==localUrl.slice(0,4))
					_depends.push(localUrl);
				else
					_depends.push(_plugPath + name + "/"+ localUrl);
			}
		}

		var _dependsLength = _depends.length;
		var _dependsIndex = 0;

		depanedsInit();

		function depanedsInit() {
			if (_dependsIndex == _dependsLength) {
				loadExports();
				return;
			}
			afJsLoad.load(_depends[_dependsIndex], function(err, result) {
				$(af.application).append("<script>" + result + "</script>");

				_dependsIndex++;
				depanedsInit();
			})
		}

	}

	var loadExports = function() {
		var _exports = [];
		for (var name in _public)
			_exports = _exports.concat(_plugPath + name + "/" + _public[name].exports);

		var _exportsLength = _exports.length;
		var _exportsIndex = 0;

		exportsInit();

		function exportsInit() {
			if (_exportsIndex == _exportsLength) {
				_handler();
				return;
			}
			afJsLoad.load(_exports[_exportsIndex], function(err, result) {
				$(af.application).append("<script>" + result + "</script>");

				_exportsIndex++;
				exportsInit();
			})
		}

	}

	var getPublic = function(plugName) {
		return _public[plugName] || (_public[plugName] = {});
	}

	var getPlugPath = function(handler) {
		_plugPath = 'plug/';

		afJsLoad.load(getPublicPath(_listIndex), function(err, result) {
			if (err) {
				_plugPath = '../plug/';
				afJsLoad.load(getPublicPath(_listIndex), function(err, result) {
					
					if(err){
						_plugPath = '../../plug/';
						afJsLoad.load(getPublicPath(_listIndex), function(err, result) {
							if (err) af.error("没有匹配的 插件，请 检查插件路径");
							else handler();
						});
					} else handler();
				});
			} else handler();
		});
	}

	var getPublicPath = function(index) {
		return _plugPath + _list[index] + "/public.js";
	}

	var onProgress = function(create, progress, remove) {
		_plugs.progress.push({
			"create": create,
			"progress": progress,
			"remove": remove
		});
	}

	var onExplain = function(handler) {
		_plugs.explain.push(handler);
	}
	var onAction = function(actionType, handler) {
		_plugs.action.push({
			"type": actionType,
			"handler": handler
		});
	}
	
	var onFragment=function(fragmentType,handler){
		_plugs.fragment.push({
			"type": fragmentType,
			"handler": handler
		});
	}
	
	var onUpdateView=function(handler){
		_plugs.updateView.push(handler);
	}

	var executeExplain = function() {
		for (var n in _plugs.explain)
			_plugs.explain[n]();
	}
	
	var fragmentHandler=function(action,fragment,func){
		for (var n in _plugs.fragment) {
			var frag = _plugs.fragment[n];
			if(frag.type==fragment.type)
			{
				frag.handler(action,fragment,func);
				return;
			}
		}
		func();
	}
	
	var executeUpdateView=function(){
		for(var n in _plugs.updateView)
			_plugs.updateView[n]();
	}



	var createLoading = function() {

		if (_plugs.progress.length <= 0) return null;

		for (var n in _plugs.progress)
			_plugs.progress[n].create();
		return {};
	}

	var progressLoading = function(value) {
		for (var n in _plugs.progress)
			_plugs.progress[n].progress(value);
	}

	var removeLoading = function() {
		for (var n in _plugs.progress)
			_plugs.progress[n].remove();
	}


	var dispatch = function(actionType, evt) {
		afAction.dispatch(actionType, evt);
	}

	return {
		load: load,
		getPublic: getPublic,
		onExplain: onExplain,
		onProgress: onProgress,
		onAction: onAction,
		onFragment:onFragment,
		onUpdateView:onUpdateView,
		executeExplain: executeExplain,
		executeUpdateView:executeUpdateView,
		fragmentHandler:fragmentHandler,
		createLoading: createLoading,
		progressLoading: progressLoading,
		removeLoading: removeLoading,
		dispatch:dispatch
	}

})();

var $plug=afPlug;