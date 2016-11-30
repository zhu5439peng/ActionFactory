var afUtil = (function() {

	function getUrlVars() {
		var vars = [],
			hash;
		var hashes = window.location.href.slice(window.location.href.indexOf('?') + 1).split('&');
		for (var i = 0; i < hashes.length; i++) {
			hash = hashes[i].split('=');
			vars.push(hash[0]);
			vars[hash[0]] = hash[1];
		}
		return vars;
	}

	//	if (/(iPhone|iPad|iPod|iOS)/i.test(navigator.userAgent)) {
	//  //alert(navigator.userAgent);  
	//  window.location.href ="iPhone.html";
	//} else if (/(Android)/i.test(navigator.userAgent)) {
	//  //alert(navigator.userAgent); 
	//  window.location.href ="Android.html";
	//} else {
	//  window.location.href ="pc.html";
	//};

	function getBrowserType() {
		var sUserAgent = navigator.userAgent.toLowerCase();
		var bIsIpad = sUserAgent.match(/ipad/i) == "ipad";
		var bIsIphoneOs = sUserAgent.match(/iphone os/i) == "iphone os";
		var bIsMidp = sUserAgent.match(/midp/i) == "midp";
		var bIsUc7 = sUserAgent.match(/rv:1.2.3.4/i) == "rv:1.2.3.4";
		var bIsUc = sUserAgent.match(/ucweb/i) == "ucweb";
		var bIsAndroid = sUserAgent.match(/android/i) == "android";
		var bIsCE = sUserAgent.match(/windows ce/i) == "windows ce";
		var bIsWM = sUserAgent.match(/windows mobile/i) == "windows mobile";
		if (bIsIpad || bIsIphoneOs || bIsAndroid || bIsMidp || bIsUc7 || bIsUc || bIsCE || bIsWM) {
			return 'mb';
		}
		return 'pc';
	}

	function fGetQuery(name) {
		var sUrl = window.location.search.substr(1);
		var r = sUrl.match(new RegExp("(^|&)" + name + "=([^&]*)(&|$)"));
		return (r == null ? null : unescape(r[2]));
	};


	function isBoolean(obj) {
		return obj === true || obj === false || Object.prototype.toString.call(obj) === '[object Boolean]';
	};

	function isNaN(obj) {
		return isNumber(obj) && obj !== +obj;
	};

	function isArray(obj) {
		return Object.prototype.toString.call(obj) === '[object Array]';
	};

	function isNumber(obj) {
		return Object.prototype.toString.call(obj) === '[object Number]';
	};

	function isString(obj) {
		return Object.prototype.toString.call(obj) === '[object String]';
	};

	function isFunction(obj) {
		return Object.prototype.toString.call(obj) === '[object Function]';
	};


	return {
		getUrlVars: getUrlVars,
		getBrowserType: getBrowserType,
		isBoolean: isBoolean,
		isNaN: isNaN,
		isArray: isArray,
		isNumber: isNumber,
		isString: isString,
		isFunction: isFunction
	}


})()