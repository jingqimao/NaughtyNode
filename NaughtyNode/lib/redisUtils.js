
/*

	日期：2020/5/24
	作者：惊奇猫/jingqimao
	名称：redis工具
	说明：封装redis的初始化和操作
	版权：个人作品
 
*/

var redis = require('../node_modules/redis');
var validator = require('../node_modules/validator');

var app={
	redis_info:[],
	cliens:{},
	init:function(){
		for(var i in app.redis_info){
			app.cliens[i]=redis.createClient(app.redis_info[i].port,app.redis_info[i].host);
			if(app.redis_info[i].password!=undefined)app.cliens[i].auth(app.redis_info[i].password);
			app.cliens[i].on('connect',(function(err){
				return function(){
					console.log('redis服务'+i+'已连接！');
				}
			})(i));
			//app.cliens[i].on('ready',function(res){});
			app.cliens[i].on('end',(function(err){
				return function(){
					console.log('redis服务'+i+'已断开！');
				}
			})(i));
			app.cliens[i].on('error',(function(err){
				return function(err){
					
					if(err.syscall=='connect'){
						//console.log('redis服务'+i+'连接报错！');
					}else{
						console.log('redis服务'+i+'报错！');
						console.log(err);
					}
					
				}
			})(i));
		}
	},
	set:function(clienName,key,value,time){
		if(typeof value==='object')value=JSON.stringify(value);
		return new Promise((resolve, reject) => {
			app.cliens[clienName].set(key,value,function(err,data){
				if (!err) {
					if(time!=undefined&&time>0)app.cliens[clienName].expire(key,parseInt(time/1000));
	                resolve(true);
	            }else{
	                resolve(false);
	            }
			});
		});
	},
	get:function(clienName,key){
		return new Promise((resolve, reject) => {
			app.cliens[clienName].get(key,function(err,data){
				if (!err) {
					if(typeof data=='string'&&validator.isJSON(data))data=JSON.parse(data);
	                resolve(data);
	            }else{
	                resolve(null);
	            }
			});
		});
	},
	del:function(clienName,key){
		return new Promise((resolve, reject) => {
			app.cliens[clienName].del(key,function(err,data){
				if (!err) {
	                resolve(true);
	            }else{
	                resolve(false);
	            }
			});
		});
	},
	expire:function(clienName,key,time){
		return new Promise((resolve, reject) => {
			app.cliens[clienName].expire(key,time/1000,function(err,data){
				if (!err) {
	                resolve(true);
	            }else{
	                resolve(false);
	            }
			});
		});
	}
}


module.exports = app;

//	作者：惊奇猫/jingqimao