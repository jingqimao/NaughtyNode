const app = require(':lib/controller');
const fs = require('fs');
const cfUtils = require(':lib/cfUtils');

app.setPrefix('/sys/business');

const sys_setting_dir='webapp/view/backstage/setting/';

//业务管理
app.get('/get_sys_business',async function($) {
	
	let cc=cfUtils.get('_SYS_Business').data;
	$.out(cc.sys);
	
});
app.get('/get_ext_business',async function($) {
	
	let cc=cfUtils.get('_SYS_Business').data;
	$.out(cc.ext);
	
});

//用户管理
app.get('/init_user_table',async function($,db,table) {
	
	if($.db.dbs[db]!=undefined){
		let init_user_sql=fs.readFileSync($.root+sys_setting_dir+'sql/init_user.sql','utf8');
		init_user_sql=init_user_sql.replace('?','`'+table+'`')
		let res=await ($.db.exc)(db,init_user_sql,[]);
		if(res.warningCount==0){
			
			let cc=cfUtils.get('_SYS_Business').data;
			if(cc){
				cc.sys.user.db=db;
				cc.sys.user.table=table;
				cfUtils.get('_SYS_Business').set(cc).save();
				$.out(true);
			}else{
				$.out(false);
			}
			
		}else{
			$.out(false);
		}
	}
	
});
app.get('/get_user_data',async function($,page,limit,desc) {
	
	let cc=cfUtils.get('_SYS_Business').data;
	
	desc=desc=='true'?'desc':'asc';
	let n=(page-1)*limit;
	let test=await ($.db.exc)(cc.sys.user.db,"select count(*) as max_size from "+cc.sys.user.table,[]);
	let res=await ($.db.exc)(cc.sys.user.db,"select * from "+cc.sys.user.table+" order by id "+desc+" limit "+n+","+limit,[]);
	
	$.out({
		total:test[0].max_size,
		data:res
	});
	
});
app.get('/add_user_data',async function($,data) {
	
	let cc=cfUtils.get('_SYS_Business').data;
	
	data=JSON.parse(data);
	let keys=[];
	let vv=[];
	let vals=[];
	for(let i in data){
		keys.push(i);
		vv.push('?');
		vals.push(data[i]);
	}
	let res=await ($.db.exc)(cc.sys.user.db,"insert into "+cc.sys.user.table+" ("+keys.toString()+") values ("+vv.toString()+")",vals);
	$.out(res);
	
});
app.get('/save_user_data',async function($,data,id) {
	
	let cc=cfUtils.get('_SYS_Business').data;
	
	data=JSON.parse(data);
	let keys=[];
	let vals=[];
	for(let i in data){
		keys.push(i+' = ?');
		vals.push(data[i]);
	}
	vals.push(id);
	let res=await ($.db.exc)(cc.sys.user.db,"update "+cc.sys.user.table+" set "+keys.toString()+" where id = ?" ,vals);
	$.out(res);
	
});
app.get('/del_user_data',async function($,id) {
	
	let cc=cfUtils.get('_SYS_Business').data;
	
	let res=await ($.db.exc)(cc.sys.user.db,"delete from "+cc.sys.user.table+" where id = ?" ,id);
	$.out(res);
	
});

//消息中心
app.get('/init_sys_message_table',async function($,db,table) {
	
	if($.db.dbs[db]!=undefined){
		let init_user_sql=fs.readFileSync($.root+sys_setting_dir+'sql/init_sys_message.sql','utf8');
		init_user_sql=init_user_sql.replace('?','`'+table+'`')
		let res=await ($.db.exc)(db,init_user_sql,[]);
		if(res.warningCount==0){
			
			let cc=cfUtils.get('_SYS_Business').data;
			if(cc){
				cc.sys.sys_message.db=db;
				cc.sys.sys_message.table=table;
				cfUtils.get('_SYS_Business').set(cc).save();
				$.out(true);
			}else{
				$.out(false);
			}
			
		}else{
			$.out(false);
		}
	}
	
});
app.get('/get_sys_message_data',async function($,where,page,limit,desc) {
	
	let cc=cfUtils.get('_SYS_Business').data;
	
	desc=desc=='true'?'desc':'asc';
	let n=(page-1)*limit;
	let test=await ($.db.exc)(cc.sys.sys_message.db,"select count(*) as max_size from "+cc.sys.sys_message.table+" "+where,[]);
	let res=await ($.db.exc)(cc.sys.sys_message.db,"select * from "+cc.sys.sys_message.table+" "+where+" order by id "+desc+" limit "+n+","+limit,[]);
	
	$.out({
		total:test[0].max_size,
		data:res
	});
	
});
app.get('/add_sys_message',async function($,type,title,content) {
	
	let cc=cfUtils.get('_SYS_Business').data;
	let res=await ($.db.exc)(cc.sys.sys_message.db,"insert into "+cc.sys.sys_message.table+" (`type`,`title`,`content`) values (?,?,?)",[type,title,content]);
	if(res.affectedRows==1){
		$.success('添加成功！');
	}else{
		$.error('添加失败！');
	}
	
	
});
app.get('/set_sys_message_status',async function($,id,status) {
	
	let cc=cfUtils.get('_SYS_Business').data;
	let res=await ($.db.exc)(cc.sys.sys_message.db,"update "+cc.sys.sys_message.table+" set `status`=? where id = ?" ,[status,id]);
	if(res.affectedRows==1){
		$.success('修改成功！');
	}else{
		$.error('修改失败！');
	}
	
});

module.exports = app;