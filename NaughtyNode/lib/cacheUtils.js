
/*

	日期：2020/5/24
	作者：惊奇猫/jingqimao
	名称：缓存工具
	说明：本地缓存工具，方便直接使用
	版权：个人作品
 
*/

var app={
	cache:[],
	set:function(key,value,time){
		app.cache[key]={
			value:value,
			time:time!=undefined?(new Date().getTime()+time):null
		};
		return true;
	},
	get:function(key){
		if(app.cache[key]!=undefined){
			return app.cache[key].value;
		}else{
			return null;
		}
	},
	clear:function(key){
		if(app.cache[key]!=undefined)delete app.cache[key];
		return true;
	},
	timeOut:function(time){//定时清理过期缓存
		setInterval(function(){
			let now=new Date().getTime();
			for(var i in app.cache){
				if(app.cache[i].time!=null&&now>app.cache[i].time){
					app.clear(i);
				}
			}
		},time);
	}
}

module.exports = app;

//	作者：惊奇猫/jingqimao