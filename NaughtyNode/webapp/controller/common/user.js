const app = require(':lib/controller');
const fs = require('fs');
const path = require('path');
const fsUtils = require(':lib/fsUtils');
const pU = require(':lib/pathUtils');
const cfUtils = require(':lib/cfUtils');
const md5 = require('md5-node');


app.setPrefix('/sys/user');


app.get('/login',async function($,user,pass) {
	
	let cc=cfUtils.get('_SYS_Business').data;
	
	let res=await ($.db.exc)(cc.sys.user.db,"select * from `"+cc.sys.user.table+"` where `status`=0 and `account`=? ",[user]);
	if(res&&res.length==1){
		if(pass===res[0].password){
			
			let user_info=res[0];
			
			let roles=user_info.role.split(',');
			for(let i in roles){
				$.session.A_add(roles[i]);
			}
			let info={
				account:user_info.account,
				name:user_info.name,
				mail:user_info.mail,
				sex:user_info.sex,
				role:user_info.role,
				last_time:user_info.last_time
			};
			$.session.set('User_info',info).update()
			
			$.success("登录成功！");
			return;
		}else{
			$.error("用户不存在或密码不对！");
		}
	}else{
		$.error("用户不存在或密码不对！");
	}
	
	
});
app.get('/logout',async function($,user,pass) {
	
	let cc=cfUtils.get('_SYS_Role').data;
	let all_user=[];
	for(let i in cc){
		if(cc[i].type=='user')all_user.push(cc[i].tag);
	}
	
	if($.session.A_has(all_user)){
		for(let i in all_user){
			$.session.A_remove(all_user[i]);
		}
		$.session.remove('User_info').update();
		$.success("注销成功！");
	}else{
		$.error("注销失败！");
	}
	
});
app.get('/get_user',async function($,user,pass) {
	
	if($.session.has('User_info')){
		$.out($.session.get('User_info'));
	}else{
		$.error('未登录！');
	}
	
});
app.get('/register',async function($,account,pass,name,email,phone) {
	
	if(account===''||pass===''){
		$.error("用户名和密码不能为空！");
		return;
	}
	
	let cc=cfUtils.get('_SYS_Business').data;
	
	let res=await ($.db.exc)(cc.sys.user.db,"select account from `"+cc.sys.user.table+"` where `account`=? ",[account]);
	if(res&&res.length==0){
		
		let role='user';
		let res=await ($.db.exc)(cc.sys.user.db,"insert into "+cc.sys.user.table+" (account,password,name,email,phone,role) values (?,?,?,?,?,?)",[account,pass,name,email,phone,role]);
		if(res&&res.affectedRows==1){
			$.success("注册成功！");
		}else{
			$.error("注册失败！");
		}
	}else{
		$.error("注册失败！用户名已存在！");
	}
	
	
});
app.get('/check_user',async function($,user) {
	
	let cc=cfUtils.get('_SYS_Business').data;
	let res=await ($.db.exc)(cc.sys.user.db,"select account from `"+cc.sys.user.table+"` where `account`=? ",[user]);
	if(res&&res.length==0){
		$.success("用户名可用！");
	}else{
		$.error("用户名已被占用！");
	}
});




module.exports = app;