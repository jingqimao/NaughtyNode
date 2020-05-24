const app = require(':lib/service');
const fs=require("fs");  
const pU = require(':lib/pathUtils');
const cfUtils = require(':lib/cfUtils');
const cacheUtils = require(':lib/cacheUtils');

app.init('init_sys',async function() {
	
	let $=this.$;
	
	//设置路径
	pU.set({
		setting:$.ROOT_PATH+'webapp/view/backstage/setting',
		material:$.ROOT_PATH+'webapp/view/data/material',
	});
	
	
	//将映射文件引用加入缓存
	cfUtils.add('_SYS_Urlmap',pU.p(':setting/url.json'));
	//录入扩展数据
	let ext_urlMap=cfUtils.get('_SYS_Urlmap').data;
	for(let i in ext_urlMap){
		if(ext_urlMap[i].type=='replace'){
			$.sys.replace[ext_urlMap[i].url]=ext_urlMap[i].file;
		}
		if(ext_urlMap[i].type=='forward'){
			$.sys.forward[ext_urlMap[i].url]=ext_urlMap[i].file;
		}
		if(ext_urlMap[i].type=='redirect'){
			$.sys.redirect[ext_urlMap[i].url]=ext_urlMap[i].file;
		}
	}
	
	//将设置文件引用加入缓存
	cfUtils.add('_SYS_Setting',pU.p(':setting/setting.json'));
	let setting=cfUtils.get('_SYS_Setting').data;
	if(setting.sys_base==undefined){//初始化设置
		setting={
			sys_base:{
				title:'',
				domain:'',
				message:'',
				begin_time:'',
				recode:'',
				blacklist:[],
				whitelist:[],
				session_time:30
			},
			sys_email:{
				host:'',
				user:'',
				pass:'',
				from:''
			},
			sys_sms:{
				
			},
			sys_message:{
				
			}
		};
		cfUtils.get('_SYS_Setting').set(setting).save();
	}
	
	//将素材引用加入缓存
	cfUtils.add('_SYS_Material',pU.p(':setting/material.json'));
	
	//素材文件映射
	let list=cfUtils.get('_SYS_Material').data;
	let _SYS_Material={};
	for(let i in list){
		_SYS_Material[list[i].key]=list[i].file;
	}
	cacheUtils.set('_SYS_Material',_SYS_Material);
	
	//将角色列表引用加入缓存
	cfUtils.add('_SYS_Role',pU.p(':setting/role.json'));
	
	//将管理员列表引用加入缓存
	cfUtils.add('_SYS_Manager',pU.p(':setting/manager.json'));
	
	//将内容设置引用加入缓存
	cfUtils.add('_SYS_Business',pU.p(':setting/business.json'));
	
});

module.exports = app;