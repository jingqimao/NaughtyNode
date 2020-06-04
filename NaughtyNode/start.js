//node start.js --harmony-async-await


/*

	日期：2020/5/24
	作者：惊奇猫/jingqimao
	名称：系统核心模块
	说明：	1.加载设置和资源
			2.将资源放入容器
			3.初始化连接和事件
			4.启动服务处理请求
	版权：个人作品
 
*/


//加载主要模块
const http = require('http');
const iconv = require('iconv-lite');
const fs=require("fs");  
const URL = require('url');
const path = require("path");
const querystring = require('querystring');
const dbUtils = require('./lib/dbUtils');
const redisUtils = require('./lib/redisUtils');
const reflex = require('./lib/reflex');
const yamljs = require('yamljs');
const JSON = require('JSON');
const fsUtils = require('./lib/fsUtils');
const cloud = require('./lib/cloud');
const resBody = require('./lib/resBody');
const cacheUtils = require('./lib/cacheUtils');
const cookieUtils = require('./lib/cookieUtils');
const sessionUtils = require('./lib/sessionUtils');
const log4js = require('log4js');
const htmlTemplate = require('./lib/htmlTemplate');
const _request = require('request');
const bestRequire = require('best-require');
const taskApp = require('./lib/task');
const pathUtils = require('./lib/pathUtils');
const cfUtils = require('./lib/cfUtils');
const sysInfo = require('./lib/sysInfo');


//获取启动路径
const ROOT_PATH = path.join(__dirname,'/');

//读取系统配置
const setting_path='./setting.yml';
if(!fs.existsSync(setting_path)){
	console.error('找不到'+setting_path+'系统配置文件！！！');
	return;
}

const setting = yamljs.parse(fs.readFileSync(setting_path).toString());
const DATA_PATH=setting.data_path.replace(':~',ROOT_PATH);
if(!fs.existsSync(DATA_PATH)){
	console.error('找不到'+DATA_PATH+'项目配置文件！！！');
	return;
}

const config=yamljs.parse(fs.readFileSync(ROOT_PATH+'/conf/config.yml').toString());
const p_config=yamljs.parse(fs.readFileSync(DATA_PATH+'/conf/config.yml').toString());
//合并配置
if(p_config){
	if(p_config.node){
		if(p_config.node.name!=undefined)config.node.name=p_config.node.name;
		if(p_config.node.port!=undefined)config.node.port=p_config.node.port;
		if(p_config.node.replace!=undefined){
			for(let i in p_config.node.replace){
				config.node.replace[i]=p_config.node.replace[i];
			}
		}
		if(p_config.node.forward!=undefined){
			for(let i in p_config.node.forward){
				config.node.forward[i]=p_config.node.forward[i];
			}
		}
		if(p_config.node.redirect!=undefined){
			for(let i in p_config.node.redirect){
				config.node.redirect[i]=p_config.node.redirect[i];
			}
		}
		if(p_config.node.intercept!=undefined){
			for(let i in p_config.node.intercept){
				config.node.intercept[i]=p_config.node.intercept[i];
			}
		}
		if(p_config.node.controller!=undefined){
			for(let i in p_config.node.controller){
				config.node.controller.push(p_config.node.controller[i]);
			}
		}
		if(p_config.node.service){
			for(let i in p_config.node.service){
				config.node.service.push(p_config.node.service[i]);
			}
		}
		if(p_config.node.staticCacheTime!=undefined)config.node.staticCacheTime=p_config.node.staticCacheTime;
		if(p_config.node.center!=undefined)config.node.center=p_config.node.center;
		if(p_config.node.client!=undefined)config.node.client=p_config.node.client;
		if(p_config.node.session!=undefined)config.node.session=p_config.node.session;
		if(p_config.node['404']!=undefined)config.node['404']=p_config.node['404'];
		if(p_config.node.get!=undefined)config.node.get=p_config.node.get;
	}
	if(p_config.db)config.db=p_config.db;
	if(p_config.redis)config.redis=p_config.redis;
}





//设置别名路径
let path_set={
	'~~':ROOT_PATH,
	conf:ROOT_PATH+'conf',
	lib:ROOT_PATH+'lib',
	sys_view:ROOT_PATH+'webapp\\view',
	sys_static:ROOT_PATH+'webapp\\view\\static',
	'~':DATA_PATH,
	node_modules:DATA_PATH+'node_modules',
	logs:DATA_PATH+'logs',
	controller:DATA_PATH+'controller',
	service:DATA_PATH+'service',
	uilter:DATA_PATH+'uilter',
	upload:DATA_PATH+'upload',
	view:DATA_PATH+'view',
	static:DATA_PATH+'view\\static',
	temp:DATA_PATH+'temp'
};
bestRequire(ROOT_PATH,path_set);
pathUtils.set(path_set);

//读取文件类型
const contentTypeJson=require(ROOT_PATH+'/conf/contentType.json');

//初始化参数
const sysArgs={
	name:config.node!=undefined&&config.node.name!=undefined?config.node.name:'node_sys_x',//节点名称
	port:config.node!=undefined&&config.node.port!=undefined?config.node.port:8888,//端口
	cons_path:[ROOT_PATH+'/webapp/controller',DATA_PATH+'/controller'],//控制器位置
	sers_path:[ROOT_PATH+'/webapp/service',DATA_PATH+'/service'],//服务块位置
	tasks_path:[ROOT_PATH+'/webapp/task',DATA_PATH+'/task'],//服务块位置
	cons:[],//控制器容器
	sers:[],//服务容器
	sers_list:[],//服务信息列表
	inits:[],//服务初始化事件容器
	con_inits:[],//控制器初始化容器
	tasks:[],//定时任务容器
	intercepts:[],//权限拦截列表
	staticCacheTime:60 * 60 * 1000,//静态文件缓存时间
	cacheTime:5*1000,//缓存过期检查时间
	isSession:false,//是否开启session
	sessionTime:20*60*1000,//session过期检查时间
	sessionRefreshTime:2*60*1000,//session刷新时间
	sessionRedisListPrefix:'__sessionlist_',
	tokenTime:2*60*1000,//token刷新时间
	contentTypes:contentTypeJson!=undefined?contentTypeJson:{
		htm:{type:'text/html;charset=utf-8',isStream:false},
		html:{type:'text/html;charset=utf-8',isStream:false},
		css:{type:'text/css;charset=utf-8',isStream:true},
		js:{type:'application/x-javascript;charset=utf-8',isStream:true},
		jpg:{type:'image/jpeg',isStream:true},
		jpeg:{type:'image/jpeg',isStream:true},
		png:{type:'image/png',isStream:true},
		gif:{type:'image/gif',isStream:true},
		pdf:{type:'application/pdf',isStream:true},
		txt:{type:'text/plain;charset=utf-8',isStream:false},
		json:{type:'application/json;charset=utf-8',isStream:false},
	},//可访问文件资源类型
	replace:{
		'/stay': DATA_PATH+'/webapp/upload'
		
	},//替换路径
	forward:{//转发映射
		'/favicon.ico': DATA_PATH+'/favicon.ico' 
	},
	redirect:{},//重定向跳转
	db_args:{},//数据库参数,
	redis_args:{},//redis参数
	cloud_center_regist:'/__cloud_center_regist',//服务中心注册接口
	cloud_client_refresh:'/__cloud_client_refresh',//服务列表刷新接口
	cloud_client_prefix:'/__cloud_api',//云接口前缀
	other_api:{//静态第三方请求
		get:{},
		post:{}
	},
	sys_root:ROOT_PATH,//系统根目录
	root:DATA_PATH,//根目录
	global_response_data:{},//全局响应数据
	response_data:{}//单次请求响应数据
	
}

//添加替换
if(config.node!=undefined&&config.node.replace!=undefined){
	for(let i in config.node.replace){
		sysArgs.replace[i]=config.node.replace[i];
	}
}
//添加映射
if(config.node!=undefined&&config.node.forward!=undefined){
	for(let i in config.node.forward){
		sysArgs.forward[i]=config.node.forward[i];
	}
}
//添加跳转
if(config.node!=undefined&&config.node.redirect!=undefined){
	for(let i in config.node.redirect){
		sysArgs.redirect[i]=config.node.redirect[i];
	}
}

//添加权限拦截
if(config.node!=undefined&&config.node.intercept!=undefined){
	for(let i in config.node.intercept){
		sysArgs.intercepts[i]=config.node.intercept[i];
		sysArgs.intercepts[i].permit=sysArgs.intercepts[i].permit.split(',');
	}
}

//添加数据库
if(config.db!=undefined){
	for(let i in config.db){
		sysArgs.db_args[i]=config.db[i];
		for(let j in sysArgs.db_args[i]){//强制参数为字符串
			sysArgs.db_args[i][j]=sysArgs.db_args[i][j]+'';
		}
	}
}

dbUtils.dbs=sysArgs.db_args;
dbUtils.initPool();//初始化数据池

//添加redis缓存服务
if(config.redis!=undefined){
	for(let i in config.redis){
		sysArgs.redis_args[i]=config.redis[i];
		for(let j in sysArgs.redis_args[i]){//强制参数为字符串
			if(j=='password')sysArgs.redis_args[i][j]=sysArgs.redis_args[i][j]+'';
		}
	}
	redisUtils.redis_info=sysArgs.redis_args;
	redisUtils.init();//初始化redis连接
}




//加入自定义扫描路径
if(config.node!=undefined&&config.node.controller!=undefined){
	for(let i in config.node.controller){
		sysArgs.cons_path.push(config.node.controller[i]);
	}
}
if(config.node!=undefined&&config.node.service!=undefined){
	for(let i in config.node.service){
		sysArgs.sers_path.push(config.node.service[i]);
	}
}

//添加云服务参数
if(config.node!=undefined&&config.node.name!=undefined&&config.node.client!=undefined){
	cloud.client_name=config.node.name;
	if(config.node.client.center!=undefined)cloud.center_url=config.node.client.center;
}
cloud.regist_path=sysArgs.cloud_center_regist;
cloud.refresh_path=sysArgs.cloud_client_refresh;
cloud.client_prefix=sysArgs.cloud_client_prefix;

//设置静态文件缓存时间(秒)
if(config.node!=undefined&&config.node.staticCacheTime!=undefined){
	sysArgs.staticCacheTime=config.node.staticCacheTime*1000;
}

//设置缓存过期检查时间(秒)
if(config.node!=undefined&&config.node.cacheTime!=undefined){
	sysArgs.cacheTime=config.node.cacheTime*1000;
}

//设置session
if(config.node!=undefined&&config.node.session!=undefined){
	sysArgs.isSession=true;
	if(config.node.session.time!=undefined)sysArgs.sessionTime=config.node.session.time*60*1000;
	if(config.node.session.refresh!=undefined)sysArgs.sessionRefreshTime=config.node.session.refresh*60*1000;
	//对接redis
	if(config.node.session.redis!=undefined){
		sessionUtils.sessionBean.type='redis';
		if(config.redis!=undefined&&redisUtils.cliens[config.node.session.redis]!=undefined){
			let sessionListName=sysArgs.sessionRedisListPrefix+sysArgs.name;
			sessionUtils.sessionBean.ext={
				redisName:config.node.session.redis,
				redisUtils:redisUtils,
				sessionListName:sessionListName
			};
			//添加本节点的session名单
			redisUtils.get(config.node.session.redis,sessionListName).then(function(rsl){
				if(rsl==null)redisUtils.set(config.node.session.redis,sessionListName,{
					sys_name:sysArgs.name,
					list:{}
				});
			});
		}
	}
}

//设置token
if(config.node!=undefined&&config.node.tokenTime!=undefined){
	sysArgs.tokenTime=config.node.tokenTime*60*1000;
}

//设置404页面
if(config.node!=undefined&&config.node['404']!=undefined&&config.node['404'].path!=undefined){
	sysArgs['404']=config.node['404'];
	if(config.node['404'].url!=undefined){
		sysArgs.forward[config.node['404'].url]=config.node['404'].path;
	}else{
		sysArgs.forward['/404']=config.node['404'].path;
	}
}

//设置log4js日志
let log4js_config=yamljs.parse(fs.readFileSync(ROOT_PATH+'/conf/log4js.yml').toString());
log4js_config.appenders.logfile.filename=pathUtils.p(log4js_config.appenders.logfile.filename);
log4js.configure(log4js_config);
const logger=log4js.getLogger();
//传递log4j到其他模块打印报错
taskApp.log=logger;
cfUtils.log=logger;
htmlTemplate.log=logger;
dbUtils.log=logger;


//设置第三方API
if(config.node!=undefined){
	if(config.node.get!=undefined){
		for(let i in config.node.get){
			sysArgs.other_api.get[i]=config.node.get[i];
		}
	}
	if(config.node.post!=undefined){
		for(let i in config.node.post){
			sysArgs.other_api.post[i]=config.node.post[i];
		}
	}
}


//加载控制器
let is_con_inits=true;
for(let j in sysArgs.cons_path){
	let con_pas=fsUtils.scan(sysArgs.cons_path[j],'.js');
	con_pas.forEach((ele,index)=>{
		let con=require(ele.replace('.js',''));
		let cc=con.cons;
		for(let i in cc){
			sysArgs.cons[cc[i].url]=cc[i];
		}
		if(is_con_inits){
			sysArgs.con_inits=con.inits;
			is_con_inits=false;
		}
	})
}

//加载服务块和初始化事件
let ins={};
for(let j in sysArgs.sers_path){
	let ser_pas=fsUtils.scan(sysArgs.sers_path[j],'.js');
	ser_pas.forEach((ele,index)=>{
		let ser=require(ele.replace('.js',''));
		let ss=ser.sers;
		for(let i in ss){
			let fun_args=reflex.getArgs(ss[i].ser);
			sysArgs.sers[ss[i].name]=async function(...args){
				try{
					return await ss[i].ser.apply(args);
				}catch(e){
					logger.error("请求服务报错："+e);
					logger.error(e.stack);
					throw e;
				}
			};
			sysArgs.sers_list[ss[i].name]=reflex.getArgs(ss[i].ser);
			if(config.node.client)cloud.client[sysArgs.cloud_client_prefix+'/'+ss[i].name]={
				name:ss[i].name,
				args:reflex.getArgs(ss[i].ser)
			};
		}
		let ii=ser.inits;
		for(let i in ii){
			ins[ii[i].name]=ii[i];
		}
	})
}
for(let i in ins){
	sysArgs.inits.push(ins[i]);
}
sysArgs.inits.sort(function(a,b){//事件排序
	return a.weight-b.weight;
});


//加载定时任务
for(let j in sysArgs.tasks_path){
	let task_pas=fsUtils.scan(sysArgs.tasks_path[j],'.js');
	task_pas.forEach((ele,index)=>{
		let tt=require(ele.replace('.js','')).tasks;
		for(let i in tt){
			sysArgs.tasks[tt[i].name]=tt[i];
		}
	})
}

//服务块引用共享资源
sysArgs.sers['$']={
	ROOT_PATH:ROOT_PATH,
	DATA_PATH:DATA_PATH,
	sys:sysArgs,
	ser:sysArgs.sers,
	task:sysArgs.tasks,
	db:dbUtils,
	redis:redisUtils,
	cloud:cloud,
	cache:cacheUtils,
	log:logger,
	global:sysArgs.global_response_data
};

//定时任务引用共享资源
for(let i in sysArgs.tasks){
	sysArgs.tasks[i]['$']=sysArgs.sers['$'];
}

//初始化事件引用共享资源
for(let i in sysArgs.inits){
	sysArgs.inits[i]['$']=sysArgs.sers['$'];
}



//常用工具
const utils={
	fsUtils:fsUtils
}

//启动信息监听
//sysInfo.start();


//启动服务
http.createServer(async function (request, response) {

	try{
		
		let fi=await filter(request,response);
		
		if(fi)fi=other_api(request,response);
	
		if(fi)fi=conter(request,response);
		
		if(fi)fi=callBackClient(request,response);
		
		if(config.node.center&&fi)fi=callBackCenterRegist(request,response);
		
		if(fi)fi=callBackClientRefresh(request,response);
		
		if(fi)callNotFind(request,response);
		
	}catch(err){
		logger.error(err);
		response.end(err.stack);
	}
	
	
}).listen(sysArgs.port);

console.log('服务器已启动！访问端口:'+sysArgs.port);

//注册服务
if(config.node!=undefined&&config.node.client!=undefined&&config.node.client.center!=undefined){
	cloud.regist(config.node.client.type+'://'+reflex.getIPAdress()+':'+sysArgs.port);
}

//定时清理缓存
cacheUtils.timeOut(sysArgs.cacheTime);

//定时清理数据缓存
dbUtils.timeOutCD();

if(sysArgs.isSession){
	
	//定时清理本地闲置session
	if(sessionUtils.sessionBean.type==='--'){
		sessionUtils.sessionBean.time=sysArgs.sessionTime;
		sessionUtils.timeOut();
	}

	//定时延迟session时间
	sessionUtils.sessionBean.refresh=sysArgs.sessionRefreshTime;
	sessionUtils.timeOutRefresh();
}

//默认启动的定时任务
async function task_exc(){
	for(let i in sysArgs.tasks){
		try{
			if(sysArgs.tasks[i].run)taskApp.run(sysArgs.tasks[i])
		}catch(e){
			logger.error("启动定时任务报错："+e);
			logger.error(e.stack);
		}
	}
}
task_exc();


//执行初始化事件
async function init_exc(){
	for(let i=0;i<sysArgs.inits.length;i++){
		try{
			await sysArgs.inits[i].init();
		}catch(e){
			logger.error("服务初始化事件报错："+e);
			logger.error(e.stack);
		}
	}
	for(let i in sysArgs.con_inits){
		try{
			await sysArgs.con_inits[i](sysArgs.sers['$']);
		}catch(e){
			logger.error("控制器初始化事件报错："+e);
			logger.error(e.stack);
		}
	}
}
init_exc();


//判断正则表达式
function stripscript(str){
	var pattern = new RegExp("[(){}\\[\\]?!]");
	if (pattern.test(str)){
		return true;
	}else {
		return false;
	}
}

//核心过滤器
async function filter(request,response){
	
	let url=request.url.split("?")[0];
	
	if(sysArgs.isSession){
		
		//设置session
		let cookie=cookieUtils.get(request);
		if(cookie.sid==undefined){
			let sid=sessionUtils.newSession(JSON.stringify(request.headers),sysArgs.sessionTime);
			cookieUtils.set(response,sid);//第三个参数可设置cookie时间，默认关闭浏览器清除
			request['session']=await sessionUtils.get(sid);
		}else{
			let session=await sessionUtils.get(cookie.sid);
			if(session!=null){
				request['session']=session;
			}else{
				let sid=sessionUtils.newSession(JSON.stringify(request.headers),sysArgs.sessionTime);
				cookieUtils.set(response,sid);//同上
				request['session']=await sessionUtils.get(sid);
			}
		}
		
		//拦截请求
		for(let i in sysArgs.intercepts){
			let intps=sysArgs.intercepts[i];
			let reg=new RegExp(i);
			if(reg.test(url)){
				if(!(intps.ignore.indexOf(url)>-1)){
					if(!request['session'].A_has(intps.permit)){
						if(request.method === 'GET'){
							if(intps.redirect){
								response.writeHead(302,{'Location':intps.redirect});
								response.end();
							}else{
								response.writeHead(200, {'Content-Type': 'text/plain;charset=utf-8'});
								response.end(resBody.set(false,"缺少访问权限！"));
							}
							
						}else{
							response.writeHead(200, {'Content-Type': 'text/plain;charset=utf-8'});
							response.end(resBody.set(false,"缺少访问权限！"));
						}
						return false;
					}
				}
			}
		}
	}
	
	//初始化响应数据
	sysArgs.response_data={};
	
	if(request.method === 'GET'){
		
		//跳转
		for(let j in sysArgs.redirect){
			if(url==j){
				response.writeHead(302,{'Location':sysArgs.redirect[j]});
				response.end();
				return false;
			}
		}
		
		//替换路径
		for(let j in sysArgs.replace){
			if(url.startsWith(j))url=url.replace(j,sysArgs.replace[j]);
		}
		
		//转发映射
		for(let j in sysArgs.forward){
			let is_reg=stripscript(j);
			if(is_reg||url==j){
				if(is_reg){
					let reg=new RegExp(j);
					if(reg.test(url)){
						let res=url.match(reg);
						urlx=sysArgs.forward[j];
						for(let i=1;i<=res.length;i++){
							urlx=urlx.replace('{$'+i+'}',res[1]);
						}
						url=urlx;
						break;
					}
				}else{
					url=sysArgs.forward[j];
					break;
				}
			}
		}
		
		//文件直接访问
		return await toFile(request,response,url);
		
	}
	
	return true;
}

//文件直接访问
async function toFile(request,response,url,isStream){
	if(url.indexOf(':')>-1)url=pathUtils.p(url);
	if(await fsUtils.exist(url)){
		for(let i in sysArgs.contentTypes){//按文件类型访问
			if(path.extname(url)=='.'+i){
				isStream=isStream||sysArgs.contentTypes[i].isStream;
				callBackFileResponse(url,request,response,sysArgs.contentTypes[i].type,isStream);
				return false;
			}
		}
		//其他类型统一二进制下载
		callBackFileResponse(url,request,response,'application/octet-stream',true);
		return false;
	}else{
		//logger.error("找不到请求页面的路径！");
		//logger.error(url);
		return true;
	}
}

//响应文件请求
function callBackFileResponse(url,request,response,contentType,isStream){
	
	response.writeHead(200, {
		'Content-Type': contentType,
		'Expires':new Date(Date.now() + sysArgs.staticCacheTime).toUTCString(),//静态文件缓存
		'Cache-Control':'max-age='+(sysArgs.staticCacheTime/1000)
	});
	fs.readFile(url,'utf-8',async function(err,html){
			if(err){
				logger.error("请求文件读取出错！");
				logger.error(url);
			}else{
				if(isStream==undefined||isStream==false){
					if(contentType.indexOf('html')!=-1){//html模板渲染
						if(Object.keys(sysArgs.response_data).length>0){
							for(let i in sysArgs.global_response_data){
								if(sysArgs.response_data[i]==undefined){
									sysArgs.response_data[i]=sysArgs.global_response_data[i];
								}
							}
							html=await htmlTemplate.exc(path.dirname(url),html,sysArgs.response_data);
						}else{
							html=await htmlTemplate.exc(path.dirname(url),html,sysArgs.global_response_data);
						}
					}
					response.end(html);
				}else{
					let stream = fs.createReadStream(url);
					let responseData = [];
					if (stream) {
						stream.on( 'data', function( chunk ) {
						  responseData.push( chunk );
						});
						stream.on( 'end', function() {
						   let finalData = Buffer.concat( responseData );
						   response.end(finalData);
						});
					}         
				}
			}
		}
	)
}

//第三方API处理
function other_api(request,response){
	
	let url=request.url.split("?")[0];
	let lst='';
	if(request.url.indexOf('?')>-1)lst='?'+request.url.split("?")[1];
	
	if(sysArgs.other_api.get[url]!=undefined||sysArgs.other_api.post[url]!=undefined){
		if(request.method === 'POST'){
			var data='';
			request.on('data', function (chunk){
				data+=chunk;
			});
			request.on('end', function (){
				let args=JSON.parse(data);
				cloud.sendHttp('POST',sysArgs.other_api.get[url],args,function(err,res){
					if(!err){
						response.writeHead(200, {'Content-Type': 'text/plain;charset=utf-8'});
						response.end(JSON.stringify(res));
					}else{
						response.writeHead(200, {'Content-Type': 'text/plain;charset=utf-8'});
						response.end(JSON.stringify(err));
					}
				});
			});
		}else{
			let args=URL.parse(request.url, true).query;
			cloud.sendHttp('GET',sysArgs.other_api.get[url]+lst,args,function(err,res){
				if(!err){
					response.writeHead(200, {'Content-Type': 'text/plain;charset=utf-8'});
					response.end(JSON.stringify(res));
				}else{
					response.writeHead(200, {'Content-Type': 'text/plain;charset=utf-8'});
					response.end(JSON.stringify(err));
				}
			});
		}
		return false;
	}
	return true;	
}

//核心控制器
function conter(request,response){
	
	Buffer.prototype.split=Buffer.prototype.split||function (spl){
		let arr=[];
		let cur=0;
		let n=0;
		while((n=this.indexOf(spl,cur))!=-1){
			arr.push(this.slice(cur,n));
			cur=n+spl.length
		}
		arr.push(this.slice(cur))
		return arr
	}
	
	//选择控制器
	let url_head=request.url.split('?')[0];
	if(sysArgs.cons[url_head]!=undefined){
		let fun_args=reflex.getArgs(sysArgs.cons[url_head].con);
		var args=[];
		var post_args={};
		var get_args={};
		var files=[];
		if(request.method === 'POST'){
			let str='';
			let arr=[];
			request.on('data', function (chunk){
				str+=chunk;
				arr.push(chunk);
			});
			request.on('end', function (){
				if(str.indexOf('------')==-1){
					post_args=querystring.parse(str);
					end();
				}else{
					let data=Buffer.concat(arr);
					let boundary=request.headers['content-type'].split('; ')[1];
					boundary='--'+boundary.split('=')[1];
					let data_items=data.split(boundary);
					data_items.shift();
					data_items.pop();
					data_items=data_items.map(buffer=>buffer.slice(2,buffer.length-2))
					for(let i in data_items){
						let n=data_items[i].indexOf('\r\n\r\n');
						let d_info=data_items[i].slice(0,n).toString();
						let content=data_items[i].slice(n+4)
						if(d_info.indexOf('\r\n')==-1){
							content=content.toString();
							let d_key=d_info.match(/name=\"(.+?)\"/)[1];
							post_args[d_key]=content;
						}else{
							d_info=d_info.split('\r\n');
							files.push({
								name:d_info[0].match(/filename=\"(.+?)\"/)[1],
								type:d_info[1].split(':')[1].trim(),
								data:content,
								write:function(url,set,callback){
									url=url.replace('$filename',this.name);
									if(set!=undefined){
										if(typeof set=='function'){
											fs.writeFile(url,this.data,err=>{
												set(err);
											})
										}else{
											fs.writeFile(url,this.data,set,err=>{
												if(callback!=undefined)callback(err);
											})
										}
									}else{
										fs.writeFile(url,this.data,err=>{
										})
									}
								}
							});
						}
					}
					end();
				}
				
			});
		}else{
			get_args=URL.parse(request.url, true).query;
			end();
		}
		async function end(){
			for(let i in fun_args){
				if(fun_args[i]=='$'){
					args[i]={
						req:request,
						res:response,
						ser:sysArgs.sers,
						task:sysArgs.tasks,
						db:dbUtils,
						redis:redisUtils,
						cloud:cloud,
						cache:cacheUtils,
						log:logger,
						utils:utils,
						sys:sysArgs,
						sys_root:sysArgs.sys_root,
						root:sysArgs.root,
						global:sysArgs.global_response_data,
						res_data:sysArgs.response_data,
						out:function(_data){
							if(_data==undefined){
								this.res.writeHead(503, {'Content-Type': 'text/plain;charset=utf-8'});
								this.res.end(resBody.set(false,'503服务不可用！请联系管理员解决。'));
							}
							if(typeof _data=='string'){
								this.res.writeHead(200, {'Content-Type': 'text/plain;charset=utf-8'});
								this.res.end(_data);
							}else{
								this.res.writeHead(200, {'Content-Type': 'text/plain;charset=utf-8'});
								this.res.end(JSON.stringify(_data));
							}
							
						},
						outFile:function(_file,isDownload){
							if(isDownload!=undefined&&isDownload==false){
								toFile(this.req,this.res,_file,true);
							}else{
								let _contentType='application/octet-stream';
								let _res=this.res;
								fs.exists(_file,function(exists){
									if(!exists)return
									_res.writeHead(200, {
										'Content-Type': _contentType,
										'Content-Disposition':'attachment;filename='+path.basename(_file)
									});
									fs.createReadStream(_file).pipe(_res);
								});
							}
							
							
						},
						success:function(msg){
							this.res.writeHead(200, {'Content-Type': 'text/plain;charset=utf-8'});
							this.res.end(resBody.set(true,msg));
						},
						error:function(msg,code=200){
							this.res.writeHead(code, {'Content-Type': 'text/plain;charset=utf-8'});
							this.res.end(resBody.set(false,msg));
						},
						files:files
					};
					if(sysArgs.isSession){
						args[i]['session']=request['session'];
					}
				}else{
					if(request.method === 'POST'){
						if(post_args[fun_args[i]]!=undefined)args[i]=post_args[fun_args[i]];
					}else{
						if(get_args[fun_args[i]]!=undefined)args[i]=get_args[fun_args[i]];
					}
				}
			}
			var con=sysArgs.cons[url_head].con;
			try{
				let res=await con.apply(this,args);
				if(res){
					let url=pathUtils.p(':view/'+res);
					toFile(request,response,url);
				}
			}catch(e){
				logger.error("请求报错："+e);
				logger.error("请求路径："+url_head);
				logger.error(e.stack);
				
				response.writeHead(200, {'Content-Type': 'text/plain;charset=utf-8'});
				response.end(resBody.set(false,"请求出错！"));
			}
			
		}
		return false;
	}
	return true;
}

//响应服务注册
function callBackCenterRegist(request,response){
	
	if(request.url===sysArgs.cloud_center_regist&&request.method === 'POST'){
		
		var post_args={};
		var data='';
		request.on('data', function (chunk){
			data+=chunk;
		});
		request.on('end', function (){
			post_args=JSON.parse(data);
			post_args.client=JSON.parse(post_args.client);
			cloud.center[sysArgs.cloud_client_prefix+'/'+post_args.name]={
				url:post_args.url,
				ser:post_args.client
			};
			cloud.refresh();
			
		});
		
		response.writeHead(200, {'Content-Type': 'text/plain;charset=utf-8'});
		response.end(resBody.set(true,'成功连接服务中心！'));
		
		return false;
	}
	return true;
}

//响应服务列表刷新
function callBackClientRefresh(request,response){
	
	if(request.url===sysArgs.cloud_client_refresh&&request.method === 'POST'){
		
		var post_args={};
		var data='';
		request.on('data', function (chunk){
			data+=chunk;
		});
		request.on('end', function (){
			post_args=JSON.parse(data);
			cloud.center=JSON.parse(post_args.client_list);
			
			let n=0;
			for(let i in cloud.center)n++;
			response.writeHead(200, {'Content-Type': 'text/plain;charset=utf-8'});
			response.end(resBody.set(true,'云服务列表已刷新，当前在线系统：'+n));
			console.log('已从服务中心接入最新服务！当前在线系统：'+n);
		});
		
		return false;
	}
	return true;
}

//响应云请求
function callBackClient(request,response){
	
	if(request.url.indexOf(cloud.client_prefix)===0&&request.method === 'POST'){
		
		var post_args={};
		var data='';
		request.on('data', function (chunk){
			data+=chunk;
		});
		request.on('end',async function (){
			post_args=JSON.parse(data);
			post_args.args=JSON.parse(post_args.args);
			let ser=sysArgs.sers[post_args.ser];
			if(ser!=undefined){
				let result=await ser.apply(post_args.args);
				if(result!=undefined){
					response.writeHead(200, {'Content-Type': 'text/plain;charset=utf-8'});
					response.end(resBody.set(true,'请求成功！',result));
				}else{
					response.writeHead(200, {'Content-Type': 'text/plain;charset=utf-8'});
					response.end(resBody.set(true,'请求无返回值！'));
				}
			}else{
				response.writeHead(200, {'Content-Type': 'text/plain;charset=utf-8'});
				response.end(resBody.set(false,'找不到相应请求！'));
			}
			
		});
		
		return false;
	}
	return true;
}


//响应404
function callNotFind(request,response){
	
	if(request.method === 'POST'){
		response.writeHead(404, {'Content-Type': 'text/plain;charset=utf-8'});
		response.end(resBody.set(false,'404找不到相关资源或请求'));
	}else{
		if(sysArgs['404']){
			if(sysArgs['404'].url!=undefined){
				response.writeHead(302,{'Location':sysArgs['404'].url});
				response.end();
			}else{
				response.writeHead(302,{'Location':'/404'});
				response.end();
			}
		}else{
			response.writeHead(404, {'Content-Type': 'text/plain;charset=utf-8'});
			response.end('404找不到相关资源或请求');
		}
	}
	
}

//	作者：惊奇猫/jingqimao
