afValueobj = (function() {
	//数据结构注册
	var data;
	var registers = [];

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

		executeNode(data, 0, path, arg, valueobject);
	}

	var executeNode = function(currentNode, nodeIndex, path, arg, valueobject) {

		var maxNodeIndex = null == path ? 0 : path.length - 1;
		if (nodeIndex > maxNodeIndex) return;
		if (nodeIndex == maxNodeIndex) {
			//需要处理 的部分
			arg = arg || '';

			var plug = new basePlug(currentNode, arg, valueobject);
			plug.init();
			return;
		}

		//处理child
		var nextNodeName = path[nodeIndex + 1];
		if (currentNode[nextNodeName] == null)
			currentNode[nextNodeName] = [];
		var child = currentNode[nextNodeName];
		var childLength = child.length;
		for (var i = 0; i < childLength; i++) {
			child[i].parentNode = currentNode;
			executeNode(child[i], nodeIndex + 1, path, arg, valueobject);
		}
	}


	var test = function(_data) {

		data = _data;

		register(function() {
			this.setFormat({
				debug: false,
				namespace: 'lib',
				plug: [],
				entrance: ''
			});

			this.setDefault({
				debug: false,
				namespace: 'lib',
				entrance: this.currentNode.scene[0].name
			})

		})

		//对数据进行处理，及绑定
		register('af.scene', function() {
			this.setFormat({
				name: '',
				action: [],
				checked: false,
				visible: false,
				mode: false
			});
		})


		register('af.scene.action', function() {
			this.setFormat({
				lock: false,
				rewind: false,
				scene: '',
				type: '',
				next: []
			});

			this.setDefault({
				scene: this.currentNode.parentNode.name
			})
		})

		register('af.scene.action.next', function() {
			this.setFormat({
				exit: false,
				jump: false,
				lock: false,
				loop: false,
				once: false,
				prev: false,
				random: false,
				reback: false,
				skip: false,
				toggle: false,
				fragment: []
			})
		})

		register('af.scene.action.next.fragment', function() {
			this.setFormat({
				type: ''
			});
		})

		register('af.scene.code', function() {
			
			this.setFormat({
				src:'',
				scene:''
			})

			this.setDefault({
				scene: this.currentNode.parentNode.name
			})

		})

		register('af.scene.action.next.fragment', 'type', function() {

			this.setFormat({
				type: 'turn',
				direction: '',
				target: '',
				effect: '',
				ease: ''
			});

			this.setDefault({
				type: 'turn',
				effect: 'translation',
				ease: 'cubicInOut'
			});

		})

		register('af.scene.action.next.fragment', 'type', function() {

			this.setFormat({
				type: 'url',
				name: '',
				target: ''
			})

			this.setDefault({
				type: 'url',
				target: '_self'
			})

			this.setFormat({
				type: 'delay',
				sec: ''
			})

			this.setDefault({
				type: 'delay',
				sec: '1'
			})

			this.setFormat({
				type: 'position',
				name: '',
				left: '',
				center: '',
				right: '',
				top: '',
				middle: '',
				bottom: '',
				scale: ''
			})

			this.setDefault({
				type: 'position',
				scale: 'scale'
			})
		})

	}

	return {
		register: register,
		test: test
	};
})();



var basePlug = function(currentNode, arg, valueobject) {
	this.currentNode = currentNode;
	this.condition = arg;
	this.valueobject = valueobject;
}

var p=basePlug.prototype;

p.init = function() {
	this.valueobject();
}
p.setFormat = function(obj) {
	if (this.condition != '') {
		if (this.currentNode[this.condition] == null) return;
		if (this.currentNode[this.condition] != obj[this.condition]) return;
	}

	for (var key in obj) {
		switch (Object.prototype.toString.call(obj[key])) {
			case "[object Boolean]":
				{
					if (this.currentNode[key] == null)
						this.currentNode[key] = obj[key];
					if (this.currentNode[key].length === 0)
						this.currentNode[key] = true;
					break;
				}
			case "[object String]":
				{
					if (this.currentNode[key] == null || this.currentNode[key].length === 0)
						this.currentNode[key] = obj[key];
					break;
				}
			case "[object Array]":
				{
					if (null == this.currentNode[key])
						this.currentNode[key] = [];
					break;
				}
		}
	}
}

p.setDefault = function(obj) {
	if (this.condition != '') {
		if (this.currentNode[this.condition] == null) return;
		if (this.currentNode[this.condition] != obj[this.condition]) return;
	}

	for (var key in obj) {
		if (this.currentNode[key] == null || this.currentNode[key].length === 0)
			this.currentNode[key] = obj[key];
	}
}

p.onInit=function(handler){
	this.init=handler;
}

//0,初始化stage,canvas
//0,内置，外扩

//1,获取数据包，初始化插件引擎，准备工作
//2,加载public
//3,加载依赖
//4,填充依赖
//5，加载执行文件
//6，执行（按照优先级）
//7，解析数据格式 initData
//8，准备工作：加载动态引用的js，执行动态js，其他
//9，加载资源 initImage initSount等
//10，逻辑处理资源
//11，渲染到舞台


//初始化数据
p.initData=function(){
	
}
