## 简介

Animation Factory 简写：AF

这套框架以flash为基础，以canvas为主要表现形式  
借助浅显易懂的xml语法，我们能够方便快速的开发出跨平台、自适应、并具有简单互动的web站点。

依赖的第三方框架：
* jquery
* createjs

## 概念

本文档中将多次出现如下这些名词  
* `容器` 表示flash中只有1帧的影片剪辑，像一个布口袋一样，可以装很多的东西，也即as3中的 flash.display.Sprite
* `元件` 容器内部的组成部分，在本框架中，只能是影片剪辑；所有的文本框、按钮、矢量图等，请使用影片剪辑打包外壳后，再放入容器


## flash细则

借助flash cc2014，我们可以轻松的发布符合要求的canvas文档
注意：
1. flash库中提供若干`容器`,在框架中对应`scene`
2. `容器`内部的元件只能是影片剪辑
3. 为了确保这些`容器`会出现在发布的js文档中，可以从库中拖拽一个实例到舞台

## 指令

af框架在dom上自定义了许多指令，大致结构如下：
````javascript
<body>
	<plug></plug>
	<scene>
		<action>
			<next>
				<fragment></fragment>
			<next>
		</action>
	</scene>
	<scene></scene>
</body>
````
flash就像一个大口袋，可以装下许多个**容器**，每一个**容器**又装下了许多的**元件**  
同样，在af框架中也有一个大口袋，就是**body**  
**body**可以装下许多**scene**，每一个**scene**又可以装下许多的**action**

我们可以简单的理解为：  
**body** == **flash**  
**scene** == **容器**

## 入门

确保在html的**head**标签内嵌入依赖的js文件，例：
````javascript
<script src="jquery-1.11.1.min.js"></script>
<script src="createjs.js"></script>
<script src="af.min.js"></script>
````

在**body**标签中定义配置信息：

````javascript
<body swf='game.js' namespace='lib' entrance='mcLoad' debug>
</body>
````

* swf  
	-*flash生成的js文件的地址，必需*
* namespace   
	-*flash发布时设置的命名空间，可以不写，默认是：lib*
* entrance  
	-*作为入口使用的`容器`的名字，被默认添加到舞台；可以不写，默认则自动选择dom结构中第一个scene*
* debug  
	-*打印输出；该选项适用于开发模式，可以不写*
	


### scene

每一个**scene**都对应flash中一个**容器**  
**scene**的name属性，就是flash中这个**容器**在库中的名字
````javascript
<scene name='mcGame' checked>
</scene>
````

**scene**可以使用**action**指令,用于处理容器和元件的动作  
另外，**scene**还为程序开发提供了**code**指令  

### action

````javascript
<action type="init" init='initHandler'></action>
<action type='show'></action>
<action type='click' name='key' click='onkey'></action>
<action type='click' name='logo' click='onlogo'></action>
<action type='socket' data='todo' connect='onConnect' error='onError'></action>
<action type='touch' swipe='swipHandler'></action>
<action type='timeline' name='mc'></action>
````

**action**是实现交互的关键  
根据**type**的不同，提供了不同的回调执行指令    
回调执行指令格式：    target="targetHandler"    
其中**targetHandler**是回调函数  
详细的type定义如下表  

***
| type		| 触发条件			| 目标		| name属性依赖与否	| 回调											|
|:---------	| -------------	| ---------	| -------------	|:---------------------------------------------:|
| init		| 容器被初始化时		| 当前容器		| 否				| init：初始化后立即执行								|
| show		| 容器显示到舞台时	| 当前容器		| 否				| 无												|
| hide 		| 容器从舞台隐藏时	| 当前容器		| 否				| 无												|
| click		| 元件被点击		| 当前容器内元件	| name是元件的名字	| click：被点击后执行								|
| pressDown	| 元件被摁住		| 当前容器内元件	| name是元件的名字	| pressdown:被摁住后执行							|
| pressUp	| 元件摁住后抬起时	| 当前容器内元件	| name是元件的名字	| pressup:摁住后松开时执行							|
| timeline	| 动画集合			| 动画自定义名称	| 是				| 无												|
| resize  	| 浏览器尺寸变化时	|  当前容器	|否				| 无													|
| landscape | 处于横屏状态尺寸变化时| 当前容器 	| 否 				| 无 												|
| portrait 	| 处于竖屏状态尺寸变化时 | 当前容器 	| 否 				| 无 												|
***

在同一**容器**内，type值应尽可能唯一

**action**自身也有一套动画机制，结构如下  


````javascript
<action type='click' name='btn'>
	<next>
		<fragment type='stop' name='txt' frame='0'></fragment>
		<fragment type='play' name='txt' start='49' end='69'></fragment>
	</next>
	<next>
		<fragment type='hide'></fragment>
		<fragment type='show' name='mcGame'></fragment>
	</next>
</action>
````


* **action**内部指令是**next**，**next**内部指令是**fragment**  
* **fragment**用来显示一副固定动画片段  
* **next**是许多副动画片段的集合，内部的**fragment**同时执行  
* 当**action**触发了回调，就会开始播放内部的**next**动画集合  
* **next**内部所有的**fragment**执行完毕后，**action**依次执行下一条**next**动画指令，直到全部动画完毕



上面的代码片段就可以解读为  
1. 名叫“btn”的元件被点击
2. 执行第一个“next”动画
	- 名叫“txt”的元件停止在第0帧
	- 名叫“txt”的元件跳转到第49帧，并一直播放到第69帧，然后停止播放。
3. 执行第二个“next”动画
	- 当前容器隐藏
	- 名叫“mcGame”的容器显示到舞台
	
**action**拥有一个可以控制内部动画倒播的参数：**rewind**  
例如:  
````javascript
<action type='click' name='btn' rewind>
	<next>
		<fragment type='loop' name='txt' start='10' end='20'></fragment>
	</next>
	<next>
		<fragment type='play' name='txt' start='40' end='50'></fragment>
	</next>
</action>
````
一旦在**action**中声明了**rewind**，上述代码将解读为：  

1. 名为“btn”的元件被点击
2. 执行最后一个“next”动画
	- 名为“txt”的元件跳转到第50帧，并一直倒着播放到第40帧，然后停止播放
3. 执行倒数第二个“next”动画
	- 名为“txt”的元件跳转到第20帧，倒播到第10帧，然后循环往复播放下去  


**timeline**类型适合创建动画组合  
下面的代码同上面的案例效果等同：   
 
````javascript
<action type='timeline' name='btn_gif'>
	<next>
		<fragment type='loop' name='txt' start='10' end='20'></fragment>
	</next>
	<next>
		<fragment type='play' name='txt' start='40' end='50'></fragment>
	</next>
</action>
<action type='click' name='btn' timeline='btn_gif' rewind>
</action>
````

使用**timeline**的优势就是，可以把许多**action**相同的动画，合并成一个  
比如：  
````javascript
<action type='timeline' name='btn_gif'>
	<next>
		<fragment type='loop' name='txt' start='10' end='20'></fragment>
	</next>
	<next>
		<fragment type='play' name='txt' start='40' end='50'></fragment>
	</next>
</action>
<action type='click' name='btn' timeline='btn_gif' rewind></action>
<action type='click' name='btn2' timeline='btn_gif'></action>
<action type='click' name='btn3' timeline='btn_gif'></action>
````

	
为了便于更灵活的控制动画的播放，**next**增加了若干指令：

//动画执行前判断
* skip：当前动画自动跳过，不播放任何内容
* lock：锁定动画,保证动画的完整播放，在动画播放过程中，将不再触发当前所在的**action**事件
* random：随机播放队列中某一个fragment，其他的不播放
优先级：
lock > skip > random

//动画执行后判断
* once：当前动画集将只播放一次
* toggle：当前动画完毕，下一次播放将直接跳过，然后恢复，如此往复
* exit：当前动画集播放完毕，不在执行后续next指令
* jump:当前动画完毕，跳过下一个next，进入下下一个next
* reback：当前动画完毕后，将返回第一个next动画集，并播放
* loop：循环播放动画  
* prev：返回上一档动画播放
优先级：
exit > once > reback > loop = prev = jump > toggle

用法：
````javascript
<action type='click' name='btn'>
	<next></next>
	<next toggle>
		<fragment type='play' name='txt' start='0' end='10'></fragment>
	</next>
	<next ></next>
	<next>
		<fragment type='play' name='txt' start='49' end='69'></fragment>
	</next>
	<next reback></next>
</action>
````


**fragment**指令的详细参数如下表：  

***
| type |动画效果| name属性 | 扩展参数 |
|------|--------|-------|------|
|stop|停止到某帧|当前容器内元件名称|frame：停止到的帧的帧数或帧标签，若未设置，则为当前帧|
|play|从起始帧开始播放，  直到播放到结束帧停止|当前容器内元件名称|start：起始帧的帧数或帧标签，若未设置，默认为0；  end：结束帧的帧数或帧标签，若未设置，默认为最后一帧|
|loop|从起始帧开始，一直播放到结束帧，然后循环执行|当前容器内元件名称|start：起始帧的帧数或帧标签，若未设置，默认为0；end：结束帧的帧数或帧标签，若未设置，默认为最后一帧|
|show|显现|容器名字，未设置则默认为当前容器|无|
|hide|隐藏|容器名字，未设置则默认为当前容器|无|
|url|打开一个网页|网络地址|target：开启的方式，默认为**_self**|  
|delay|延迟|无|sec：秒数，默认为1|
|turn|两个容器切换|无| direction：新容器进入的方向；target：新容器的名称；effect：播放的效果；ease：缓动方式，[演示](spark/index.html) |
|position|定位元件|当前容器内元件名称|scale：缩放类型，默认为‘scale’；left,center,right：水平定位；top,middle,bottom：垂直定位	|
***

**position**主要用于元件的自适应定位  
以下是**position**的使用案例   

````javascript
<action type='resize'>
	<next>
		<fragment type='position' scale='no' center='0' bottom='0'></fragment>
	</next>
</action>
````
**position**的参数比较多，具体用法如下：  

* name 当前容器内某元件的名字（不是库中的名字）
* scale 元件的缩放模式  
	- no  不随浏览器缩放。
	- scale 随浏览器的大小等比缩放。默认。
	- cover 把元件扩展至足够大，以使元件完全覆盖浏览器。元件的某些部分也许无法显示在浏览器可视区域中。
	- contain 把元件扩展至最大尺寸，以使其宽度和高度完全适应浏览器。
* 水平定位，优先级为：left>center>right
	- left 元件相对于浏览器左边框的水平距离
	- center 元件相对于浏览器中心的水平距离
	- right 元件相对于浏览器右边框的水平距离
* 垂直定位，优先级为：top>middle>bottom
	- top 元件相对于浏览器上边框的垂直距离
	- middle 元件相对于浏览器中心的垂直距离
	- bottom 元件相对于浏览器下边框的垂直距离


### code
````javascript
<code src='test.js'></code>
<code>
	//$main,$scene,$element
	
	function dataHandler(data){
		
	}
	
	function connectHandler(){
		alert("connect");
	}
</code>
````

**code** 用于扩展代码，使用方式类似于 dom中的 **script** 标签  
需要着重强调的是，所有的回调函数，都需要指向this  
而且，**code**的作用域属于当前**容器**，API封装了一些便捷变量供使用  

* $element
	-*当前容器在createjs中的实例*
* $scene
	-*当前容器的数据对象*
* $main
	-*af框架总的数据对象，包含全局变量、全部容器的数据对象*

此外，还可以使用af框架公开的一些api：  

````javascript

//flash生成的js文件
af.swf;

//af框架总的数据包，等同于$main，也可以理解为dom中的body
af.m;

//获取容器“mcGame”的数据。
//在“mcGame”内部的code作用域内，等同于$scene
af.s("mcGame");

//获取容器“mcGame”在createjs中的实例。
//在“mcGame”内部的code作用域内，等同于$element
af.s("mcGame").element;

//获取容器“mcGame”类型为“init”的唯一动作对象：慎用
af.s("mcGame").a("init");

````

### 预加载

大部分项目都需要一个加载页面，我们提供了一套新的指令  
格式如下：  

````javascript
<loading swf='loading.js' name='main' namespace='loading'> 
	<position name='bg' scale='cover'></position>
	<position name='logo' center='0' middle='-60'></position>
	<position name='bar' middle='100' center='-220'></position>
	<progress name='bar'></progress>
</loading>
````

**loading**指令作为内置插件使用，放在**body**作用域内  
语法同**scene**非常类似，主要不同点如下:  
1. 设置独立的swf标签，指向一个独立的flash文档  
2. 新增**progress**指令，name指向一个总帧数100的元件  
3. 不支持action和code指令   
4. 需要显著声明namespace标签，并且不能同**body**中的声明相同   

### 插件
本框架将提供丰富的插件，用于日常定制开发的需要
插件声明如下：

````javascript
<plug touch socket></plug>
````
插件开发，是对af框架强有力的补充  
所有的插件都以文件夹的形式，放入本地plug文件夹下   
插件的入口文件命名  public.js  
以socket为例，声明如下：

````javascript
//插件名称
module.name = "socket";
//插件作者的名字
module.author='zhangpeng';
//功能描述
module.description="这是一个支持socket的插件";
//依赖的第三方js文件
module.depends = ["socket.io-1.3.5.js","easy_server.js"];
//执行文件
module.exports = "socket.js";
````

在可执行文件中，可以使用$plug参数，处理大部分需要扩展的逻辑  
$plug的api指令包括：  

````javascript
//注册项目加载事件
$plug.onProgress();
//注册项目初始化事件
$plug.onExplain();
//注册项目侦听的action事件
$plug.onAction();
//派发指定的action事件
$plug.dispatch();
//基于action事件，执行侦听的函数
$plug.trigger();

````

### 唯一js模式

由于部分平台限制了js加载的个数，为了兼容这些需求，AF引擎还支持唯一js模式，即把所有需要的js打包成一份js  

这种模式下，我们需要对现有结构做一些微调  
1. **body**中不设置 swf 标签，则默认已经引入了必须的 flash文档  
2. **loading**中不设置 swf 标签，则默认已经引入了必须的 flash文档
3. **loading** 中的namespace为必填项，不能同**body**中的namespace值相同  
4. **plug** 指令不填写插件名称，只需要把插件中除 public.js之外的js文件引入，该插件的所有功能即可正常使用  


## 插件简介
插件使用的语法包含：**顶级语法**，**action语法**，**fragment语法**  
**顶级语法**放在af作用域内，与scene同级  
**action语法**作为action指令的扩展使用  
**fragment语法**作为fragment指令的扩展使用  

### touch

这是一个支持鼠标划动的插件，主要用于手机上的一些拖动逻辑处理  

**顶级语法**  
````javascript
//自动使队列内的scene作为拖动的序列执行
<swipe effect='translation' ease='cubicInOut'>
	<scene name='win_1'></scene>
	<scene name='win_2'></scene>
	<scene name='win_3'></scene>
	<scene name='win_4'></scene>
</swipe>

````

**action**语法  

````javascript
//只要有划动就会触发
<action type='touch' swipe='handler'></action>
//向左划动的时候触发
<action type='swipe_left'></action>
//向右划动的时候触发
<action type='swipe_right'></action>
//向上划动的时候触发
<action type='swipe_top'></action>
//向下划动的时候触发
<action type='swipe_bottom'></action>

````


### shake

摇一摇，支持手机摇一摇进行互动  

**action**语法  

````javascript

//摇一摇的时候触发
<action type='shake' shake='handler'></action>

````

### socket  

提供自动连接即时通讯服务器的功能，常用于多屏互动等处理  

**顶级语法**  

````javascript

//指定连接的socket服务器地址
<socket url='112.126.70.193:8899'></socket>

````

**action**语法  

````javascript

//服务器收到数据时执行data回调 服务器连接成功后执行complete回调
<action type='socket' data='handler' complete='handler'></action>

````
### component

### weixin

1. 提供了微信分享可用的顶级语法  
2. 需要提供一个300x300的图片，名称：share.jpg，放在根目录，用于显示分享logo  
3. 这个插件需要放置在经过工信部认证的域名服务器下才能看到效果  

**顶级语法**  

````javascript

//微信分享内容
<weixin title='标题' description='描述'></weixin>

````

