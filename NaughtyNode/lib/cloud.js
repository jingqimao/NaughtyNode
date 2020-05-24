
/*

	日期：2020/5/24
	作者：惊奇猫/jingqimao
	名称：云服务模块
	说明：	0.一个系统可以是服务中心、服务提供者、服务消费者
			1.服务中心设置子系统地址，请求服务列表
			2.子系统设置服务中心地址，返回服务列表
			3.消费者请求服务，服务中心根据服务列表找到服务提供方，返回服务结果
	版权：个人作品
 
*/

var http = require('http');
var https = require('https');
var reflex = require('./reflex');
var querystring = require('querystring');
var request = require('request');

var app={
	center_url:'',
	regist_path:'',
	refresh_path:'',
	client_prefix:'',
	center:{},
	client_name:'',
	client:{},
	regist:function(url){
		app.sendHttp('Post',app.center_url+app.regist_path,{
			url:url,
			name:app.client_name,
			client:JSON.stringify(app.client)
		},function(err,res){
			if(res!=null)console.log(JSON.parse(res).msg)
		});
	},
	refresh:function(){
		for(var i in app.center){
			app.sendHttp('Post',app.center[i].url+app.refresh_path,{
				client_list:JSON.stringify(app.center)
			},function(err,res){
				if(res!=null)console.log(JSON.parse(res).msg)
			});
		}
	},
	exc:function(url,args){
		return new Promise((resolve, reject) => {
			let _url=url.split('/');
			let _path=app.client_prefix+'/'+_url[1];
			if(app.center[_path]!=undefined){
				app.sendHttp('Post',app.center[_path].url+_path,{
					ser:_url[2],
					args:JSON.stringify(args)
				},function(err,res){
					if(res!=null){
						res=JSON.parse(res);
						if(res.status){
							resolve(res.data);
						}else{
							resolve(res);
						}
					}else{
						resolve({
							status:false,
							msg:'请求失败！',
							data:null
						});
					}
				});
			}else{
				resolve({
					status:false,
					msg:'找不到对应云接口或未连接服务中心！',
					data:null
				});
			}
			
		});
	},
	sendHttp:function(type,url,args,callback){
		request({
			url: url,
			method: type,
			json: true,
			headers: {
				"content-type": "application/json",
			},
			body: JSON.stringify(args)
		}, function(error, response, body) {
			callback(error,body);
		}); 
	}
}

/*function post(url,path,data,callback){
	let type=url.split('://')[0];
	let host=url.split('://')[1].split(':')[0];
	let port=url.split('://')[1].split(':')[1];
	let req=null;
	data=querystring.stringify(data);
	if(type=='http'){
		req=http.request({
			hostname:host,
			port:port,
			path:path,
			method:'POST',
			headers: {
				'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
				'Content-Length': data.length
			}
		},function(res){
			res.setEncoding('utf8');
			res.on('data',function(data){
				callback(data);
			});
		});
	}else{
		
	}
	req.write(data);
	req.end();
}*/

module.exports = app;

//	作者：惊奇猫/jingqimao