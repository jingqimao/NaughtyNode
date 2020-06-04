
/*

	日期：2020/5/24
	作者：惊奇猫/jingqimao
	名称：反射工具
	说明：这个工具可有可无吧。。
	版权：个人作品
 
*/

var os = require('os');


var app={
	//获取函数所有参数名
	getArgs:function(func){
		var args = func.toString().match(/function\((.+?)\)/);
		if(args!=null){
			args=args[1];
			return args.split(",").map(function(arg) {
				return arg.replace(/\/\*.*\*\//, "").trim();
				}).filter(function(arg) {
				return arg;
			});
		}else{
			return '';
		}
	},
	//获取本机IP
	getIPAdress:function(){
		var interfaces = os.networkInterfaces();
		for (var devName in interfaces) {
			var iface = interfaces[devName];
			for (var i = 0; i < iface.length; i++) {
				var alias = iface[i];
				if (alias.family === 'IPv4' && alias.address !== '127.0.0.1' && !alias.internal) {
					return alias.address;
				}
			}
		}
	}
}

module.exports = app;

//	作者：惊奇猫/jingqimao