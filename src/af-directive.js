var afDirective=(function(){
	
	var getDom=function(value){
		var obj={}
		todoObject(obj,value);
		return obj;
	}
	
	var todoObject=function(obj,element){
		var target={};
		
		var attributes= element.attributes;
		for(var i=0;i<attributes.length;i++)
		{
			var a=attributes[i];
			target[a.nodeName.toLowerCase()]=a.value;
		}
		
		var children=element.children;
		for(var i=0;i<children.length;i++)
		{
			var child=children[i];
			todoObject(target,child);
		}
		
		if(obj[element.nodeName.toLowerCase()]==null)
			obj[element.nodeName.toLowerCase()]=[];
		obj[element.nodeName.toLowerCase()].push(target);
	}
	
	return {getDom:getDom};
})()
