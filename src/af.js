var af = (function() {
	var _data, _canvas, _stage, _plugin = [];


	$(document).ready(function() {

		if (null != document.getElementById("af")) {
			_data = afDirective.getDom(document.getElementById("af"));
			af.m = _data.div[0];
			af.application = '#af';
		} else {
			_data = afDirective.getDom(document.body);
			af.m = _data.body[0];
			af.application = 'body';
		}

		afValueobj.test(af.m);
		console.log(af.m);

		//初始化af.s，并提供scene的加载依赖关系
		//hasLoading
		af.m.hasLoading=false;
		
		af.sceneCach = {};
		
		var loadScene;
		
		for (var i in af.m.scene) {
			var scene = af.m.scene[i];
			window[scene.name]=window[scene.name]||{};
			af.sceneCach[scene.name] = i;
			console.log("i===",i,",sceneName==",scene.name,",isLoading==",scene.namespace);
			
			if(scene.namespace==null)
			{
				continue;
			}
			else if(scene.namespace=='loading')
			{
				af.m.hasLoading=true;
				scene.prevloading=loadScene?loadScene.name:null;
				if(null!=loadScene)loadScene.nextloading=scene.name;
				loadScene=scene;
				loadScene.willload=[];
				loadScene.isloading=true;
				loadScene.loadingcompleted=false;
			}
			else
			{
				if(loadScene==null)
				{
					console.log("Error::没有发现可用的loading场景");
				}
				else
				{
					loadScene.willload.push(scene.name);
					scene.loading=loadScene.name;
					scene.isloading=false;
				}
			}
		}

		af.s = function(name) {

			if (name == null) return af.m.scene;
			var scene = af.m.scene[af.sceneCach[name]];

			//默认获取所有满足条件的action列表
			if (null == scene.a) scene.a = function(atype, aname) {
				var actions = scene.action;
				var list=[];

				if (null == aname) {
					for (var a in actions)
						if (actions[a].type == atype) 
							list.push(actions[a]);
				} else {
					for (var a in actions)
						if (actions[a].type == atype && actions[a].name == aname)
							list.push(actions[a]);
				}
				return list;
			}

			return scene;
		}
		
		af.e=function(name){
			return af.s(name).element;
		}

		//是否处于模态，模态状态下，取消除自己之外的交互行为
		af.modeViewIndexDictionary = {};
		af.modeViewList = [];
		//如果设置sceneName，判断该场景是否可交互
		//否则，即判断当前是否可交互
		af.ismode = function(sceneName) {
			if (null == sceneName)
				return af.modeViewList.length > 0;
			if (af.modeViewList.length > 0)
				return af.modeViewIndexDictionary[sceneName] == null;
			else
				return false;
		};

		//分支
		afProgress.execute(function(){
			afJsLoad.load(af.m.swf,swfLoadComplete);
		});

	});


	//加载main.js 完成
	var swfLoadComplete = function(error, swf) {

		afProgress.completeSWF();

		if (error != null) {
			console.log("swf文件加载失败");
			return;
		}
		$(af.application).append("<script>" + swf + "</script>");

		bindSwf();
	}

	//执行swf的逻辑绑定
	var bindSwf = function() {

		af.swf = window[af.m.namespace];

		for (var arg in af.swf.properties)
			af.m[arg] = af.swf.properties[arg];

		afCanvas.init(af.m.width, af.m.height, af.m.color);
		af.canvas = _canvas = document.getElementById("canvas");
		af.stage = _stage = new createjs.Stage(_canvas);
		createjs.Ticker.setFPS(af.m.fps);
		createjs.Ticker.addEventListener("tick", tickHandler);

		//初始化舞台尺寸数据
		updateStageSize();

		//加载plug的依赖
		afPlug.load(af.m.plug, plugLoadComplete);

	}

	var updateStageSize = function() {
		var screenWidth = window.innerWidth;
		var screenHeight = window.innerHeight;
		var canvasWidth = af.m.width;
		var canvasHeight = af.m.width / screenWidth * screenHeight;
		_canvas.height = canvasHeight;

		af.screenWidth = screenWidth;
		af.screenHeight = screenHeight;
		af.canvasWidth = canvasWidth;
		af.canvasHeight = canvasHeight;
		af.orient = (screenWidth > screenHeight) ? 'landscape' : 'portrait';
		af.browserType = afUtil.getBrowserType();
	}


	var plugLoadComplete = function() {

		afProgress.completePlug();
		//对plug做处理
		
		if(af.m.hasLoading)
		{
			afJsLoad.load("loading.js",function(err,swf){
				if (err != null) {
					console.log("swf文件加载失败");
					return;
				}
				$(af.application).append("<script>" + swf + "</script>");
				
				//处理loading包含的图片
				af.loading = window['loading'];
				afImgLoad.load(af.loading.properties.manifest,function(value){
					afProgress.loadImage(value);
				},imageLoadComplete);
			});
		}
		else
		{
			afImgLoad.load(af.swf.properties.manifest,function(value){
				afProgress.loadImage(value);
			},imageLoadComplete);
		}

	}
	var imageLoadComplete = function() {
		af.trace("images load complete!");
		afProgress.completeImage();

		explain();
		onresize();
	}
	var explain = function() {
		//初始化影片剪辑
		for (var name in af.sceneCach) {
			var scene = af.m.scene[af.sceneCach[name]];
			if(af.m.hasLoading&&scene.isloading||af.m.hasLoading==false)
			{
				var elem = new af.swf[name]();
				af.asDefault(scene, 'element', elem);
				
				elem.alpha = 0;
				_stage.addChild(scene.element);	
			}
		}

		//执行插件
		afPlug.executeExplain();

		afProgress.completeAf(function() {
			
			//绑定事件
			for (var name in af.sceneCach) {
				var scene=af.m.scene[af.sceneCach[name]];
				if(af.m.hasLoading&&scene.isloading||af.m.hasLoading==false){
					
					afAction.execute(scene);
					scene.element.alpha = 1;
					_stage.removeChild(scene.element);
				}
			}
//			
			afCanvas.show();
			console.log("web complete");
			
			//开启第一个舞台
			showScene(af.m.entrance, true);
		});
	}

	var onresize = function() {
		var time;
		var resizeAble;
		var cacheScreenWidth;
		var cacheScreenHeight;
		
		if (af.m && af.m.unsize)return;
		
		window.onresize = function() {
			if (time != null) {
				resizeAble = true;
				return;
			}
			updateView();
			resizeAble = false;
			cacheScreenWidth = window.innerWidth;
			cacheScreenHeight = window.innerHeight;
			time = setTimeout(function() {
				if (resizeAble && (cacheScreenWidth != window.innerWidth || cacheScreenHeight != window.innerHeight))
					updateView();
				time = null;
				resizeAble = false;				
			}, 1000);
		};
	}

	var tickHandler = function() {
		afTimeline.update();
		_stage.update();
	}

	var showScene = function(sceneName, dispatchAble, direction) {
		var s = af.s(sceneName);
		if (s.visible) return;
		
		//判断加载条件
		if(af.m.hasLoading)
		{
			//目标跳转场景
			var targetScene;
			
			if(s.isloading==false)
			{
				targetScene=s;
				s=af.s(s.loading);
			}
			
			if(s.willload.length<=0)s.loadingcompleted=true;
			
			if(false==s.loadingcompleted)
			{
				showSceneImmediately(s.name,dispatchAble,direction);
				var ns=af.s(s.willload[0]).namespace;
				afJsLoad.load(ns+".js",function(err,swf){
					
					if (err != null) {
						console.log("swf文件加载失败");
						return;
					}
					$(af.application).append("<script>" + swf + "</script>");
					var nsobj=window[ns];
					
					afImgLoad.load(window[ns].properties.manifest,function(value){
						afAction.dispatchOn(s.name,'load',value);
					},function(){
						hideScene(s.name);
						s.loadingcompleted=true;
						
						//对所有已经加载的scene，进行初始化
						
						for(var i=0;i<s.willload.length;i++)
						{
							var scene = af.m.scene[af.sceneCach[s.willload[i]]];
							var elem = new af.swf[s.willload[i]]();
							
							scene.element=elem;
							elem.alpha = 0;
							_stage.addChild(scene.element);							
						}
						
						setTimeout(function(targetScene,s,dispatchAble,direction){
							
							for(var i=0;i<s.willload.length;i++)
							{
								var scene = af.m.scene[af.sceneCach[s.willload[i]]];
								afAction.execute(scene);
								scene.element.alpha = 1;
								_stage.removeChild(scene.element);
							}
							
							
							if(targetScene!=null)
							{
								showSceneImmediately(targetScene.name,dispatchAble,direction);
							}
							else if(s.willload.length>0)
							{
								showSceneImmediately(s.willload[0],dispatchAble,direction);							
							}
							else if(s.nextloading!=null)
							{
								showScene(s.nextloading,dispatchAble,direction);
							}
							
							updateView();
							
							
						},1,targetScene,s,dispatchAble,direction);
						
					});
				});
			}
			else
			{
				if(targetScene!=null)showSceneImmediately(targetScene.name,dispatchAble,direction);
				else if(s.willload.length>0)showSceneImmediately(s.willload[0],dispatchAble,direction);
				else if(s.nextloading!=null)showScene(s.nextloading,dispatchAble,direction);
			}
		}
		else
		{
//			afAction.execute(s);
			showSceneImmediately(sceneName,dispatchAble,direction);
			updateView();
			
			console.log("______________________!!!!!!!!!!!!!!!!!!!!!!!!")
		}
	}
	
	var showSceneImmediately=function(sceneName,dispatchAble,direction){
		
		var s = af.s(sceneName);
		s.visible = true;

		if (s.mode && null == af.modeViewIndexDictionary[sceneName]) {
			af.modeViewList.push(sceneName);
			af.modeViewIndexDictionary[sceneName] = af.modeViewList.length - 1;
		}

		if (direction == 'before')
			_stage.addChildAt(s.element, 0);
		else
			_stage.addChild(s.element);

		if (dispatchAble) afAction.dispatchOn(sceneName, "show");
	}

	var hideScene = function(sceneName, dispatchAble) {
		var s = af.s(sceneName);
		if (false == s.visible) return;
		s.visible = false;

		if (s.mode && null != af.modeViewIndexDictionary[sceneName]) {
			af.modeViewList.splice(af.modeViewIndexDictionary[sceneName], 1);
			af.modeViewIndexDictionary[sceneName] = null;
			delete af.modeViewIndexDictionary[sceneName];
		}

		_stage.removeChild(s.element);

		if (dispatchAble) afAction.dispatchOn(sceneName, "hide");
	}

	/**
	 * 重新渲染视图
	 */
	var updateView = function() {
		//获取最新的舞台尺寸
		updateStageSize();
		afPlug.executeUpdateView();

		//兼容以前的position标签
		for (var name in af.sceneCach) {
			var scene = af.s(name);

			for (var arg in scene.position) {
				var positionItem = scene.position[arg];
				afPosition.execute(name, positionItem);
			}
		}
		
		afAction.dispatch('resize', null, true);
		afAction.dispatch(af.orient, null, true);

		af.trace("view update!" + new Date().getTime());
	}

	var gm = function(funcName) {
		return this[funcName];
	}

	var asBool = function(obj, key) {
		obj[key] = obj[key] != null;
	}

	var asDefault = function(obj, key, value) {
			if (obj[key] == null) obj[key] = value;
		}
		//key=''的情况也排除
	var hasValue = function(obj, key) {
		return obj[key] != null && obj[key].length !== 0;
	}

	var trace = function(value) {
		if (af.m && af.m.debug)
			console.log(JSON.stringify(value));
	}

	var error = function(value) {
		if (af.m && af.m.debug)
			throw new Error(value);
	}

	var alert = function(value) {
		if (af.m && af.m.debug)
			alert(JSON.stringify(value));
	}

	var register = function() {
		var length = arguments.length;
		var path = arguments[0];
		var arg = arguments[1];
		var valueobject = arguments[2];
		if (length == 2) {
			valueobject = arg;
			arg = null;
		} else if (length == 1) {
			valueobject = path;
			path = arg = null;
		} else if (length <= 0) return;

		if (path != null) path = path.split('.');
		_plugin.push({
			path: path,
			arg: arg,
			valueobject: valueobject
		});
	}

	return {
		showScene: showScene,
		hideScene: hideScene,
		updateView: updateView,
		gm: gm,
		asBool: asBool,
		asDefault: asDefault,
		hasValue: hasValue,
		trace: trace,
		error: error,
		alert: alert,
		register: register
	};
})('author:zhangpeng', 'qq:307285468', 'site:www.iduizhan.com', 'version:0.1');

function playSound(id,loop){
	createjs.Sound.play(id,createjs.Sound.INTERRUPT_EARLY,0,0,loop);
}