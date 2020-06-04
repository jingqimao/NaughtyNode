
/*

	日期：2020/5/24
	作者：惊奇猫/jingqimao
	名称：控制器模块
	说明：简单的控制器容器
	版权：个人作品
 
*/

var reflex = require('./reflex');

var app={
	prefix:'',
	cons:[],
	setPrefix:function(prefix){
		app.prefix=prefix;
	},
	get:function(url,con){
		app.cons.push({
			url:app.prefix+url,
			con:con,
			args:reflex.getArgs(con)
		})
	},
	inits:[],
	init:function(fun){
		app.inits.push(fun);
	}
}

function getArgs(func) {
	var args = func.toString().match(/function\((.+?)\)/)[1];
  
	return args.split(",").map(function(arg) {
		return arg.replace(/\/\*.*\*\//, "").trim();
		}).filter(function(arg) {
		return arg;
	});
}

module.exports = app;

//	作者：惊奇猫/jingqimao