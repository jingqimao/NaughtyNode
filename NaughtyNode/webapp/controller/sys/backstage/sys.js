const app = require(':lib/controller');
const fs = require('fs');
const cfUtils = require(':lib/cfUtils');
const fsUtils = require(':lib/fsUtils');
const pU = require(':lib/pathUtils');

app.setPrefix('/sys/sys');

const sys_setting_dir='webapp/view/backstage/setting/';

//菜单
app.get('/get_menu',async function($) {
	
	let cc='[]';
	if($.session.get('Manager_info').role.indexOf('super_manager')>-1){
		cc=fs.readFileSync($.root+sys_setting_dir+'backstage-menu-super.json','utf8');
	}else{
		cc=fs.readFileSync($.root+sys_setting_dir+'backstage-menu.json','utf8');
	}
	
	$.out(cc);
	
});

//权限角色
app.get('/get_role_list',async function($) {
	
	$.out(cfUtils.get('_SYS_Role').data);
	
});
app.get('/save_role_list',async function($,d) {
	
	cfUtils.get('_SYS_Role').set(JSON.parse(d)).save();
	$.out(true);
	
});
app.get('/get_manager_role_name_list',async function($) {
	
	let cc=cfUtils.get('_SYS_Role').data;
	let name_list=[];
	for(let i in cc){
		if(cc[i].type=='manager')name_list.push({
			tag:cc[i].tag,
			name:cc[i].name
		});
	}
	$.out(name_list);
	
});
app.get('/get_user_role_name_list',async function($) {
	
	let cc=cfUtils.get('_SYS_Role').data;
	let name_list=[];
	for(let i in cc){
		if(cc[i].type=='user')name_list.push({
			tag:cc[i].tag,
			name:cc[i].name
		});
	}
	$.out(name_list);
	
});

//管理员
app.get('/get_manager_list',async function($) {
	
	$.out(cfUtils.get('_SYS_Manager').data);
	
});
app.get('/save_manager_list',async function($,d) {
	
	cfUtils.get('_SYS_Manager').set(JSON.parse(d)).save();
	$.out(true);
	
});
app.get('/login',async function($,user,pass) {
	
	let list=cfUtils.get('_SYS_Manager').data;
	for(let i in list){
		if(user===list[i].account&&pass===list[i].password){
			
			for(let j in list[i].role){
				$.session.A_add(list[i].role[j]);
			}
			let info={
				account:list[i].account,
				name:list[i].name,
				mail:list[i].mail,
				role:list[i].role,
				last_time:list[i].last_time,
			};
			$.session.set('Manager_info',info).update()
			$.out(true);
			return;
		}
	}
	$.out(false);
	
});
app.get('/logout',async function($) {
	
	let cc=cfUtils.get('_SYS_Role').data;
	let all_mangager=[];
	for(let i in cc){
		if(cc[i].type=='manager')all_mangager.push(cc[i].tag);
	}
	
	if($.session.A_has(all_mangager)){
		for(let i in all_mangager){
			$.session.A_remove(all_mangager[i]);
		}
		$.session.remove('Manager_info').update();
		$.out(true);
	}else{
		$.out(false);
	}
	
});
app.get('/get_user',async function($) {
	
	if($.session.has('Manager_info')){
		$.out($.session.get('Manager_info'));
	}else{
		$.error('未登录！');
	}
	
	
});


//系统任务
app.get('/get_task_list',async function($) {
	
	let list=[];
	for(let i in $.task){
		list.push({
			name:$.task[i].name,
			tip:$.task[i].tip,
			time:$.task[i].time,
			run:$.task[i].run,
			run_times:$.task[i].run_times,
			last_time:$.task[i].last_time
		});
	}
	$.out(list);
	
});
app.get('/run_task',async function($,task) {
	
	if(!$.task[task].run){
		$.task[task]._run();
		$.out(true);
	}else{
		$.out(false);
	}
});
app.get('/stop_task',async function($,task) {
	
	if($.task[task].run){
		$.task[task]._stop();
		$.out(true);
	}else{
		$.out(false);
	}
});

//系统设置
app.get('/get_setting',async function($) {
	
	$.out(cfUtils.get('_SYS_Setting').data);
});
app.get('/save_setting_base',async function($,base) {
	
	base=JSON.parse(base);
	let setting=cfUtils.get('_SYS_Setting').data;
	setting.sys_base=base;
	cfUtils.get('_SYS_Setting').set(setting).save();
	$.out(true);
});
app.get('/save_setting_email',async function($,email) {
	
	email=JSON.parse(email);
	let setting=cfUtils.get('_SYS_Setting').data;
	setting.sys_email=email;
	cfUtils.get('_SYS_Setting').set(setting).save();
	$.out(true);
});


//系统日志
app.get('/get_logs_list',async function($) {
	
	let files=fsUtils.scanTree(pU.p(':logs'),'root');
	$.out(files);
	
});
app.get('/look_log',async function($,name) {
	
	$.out(fs.readFileSync(pU.p(':logs/'+name),'utf-8'));
	
});




module.exports = app;