
/*

	日期：2020/5/24
	作者：惊奇猫/jingqimao
	名称：服务容器
	说明：储存服务
	版权：个人作品
 
*/

var app={
	sers:[],
	ser:function(name,ser){
		app.sers.push({
			name:name,
			ser:ser
		})
	},
	inits:[],
	init:function(name,init,weight){
		app.inits.push({
			name:name,
			init:init,
			weight:weight!=undefined?weight:0
		})
	}
}

module.exports = app;

//	作者：惊奇猫/jingqimao