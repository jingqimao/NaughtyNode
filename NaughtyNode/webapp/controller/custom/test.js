const app = require('../../../lib/controller');
const imgUtils = require(':lib/imgUtils');

app.setPrefix('/api');

//测试接口
app.get('/test',async function($,msg) {
	
	//$.out(await $.cloud.exc('/sys_main/test3',{}))
	
	
	//$.cache.set('a',12,5000);
	$.out(await $.ser.test())
	
	//var res= await ($.db.exc)('test','SELECT 1 + ? AS solution',[2]);
	//var res= await ($.db.exc)('test','select * from logger where id=?',[1]);
	
	
	/*var res= await ($.db.unit)('test',async function(con){
		await (con.exc)('insert into logger (log) values (?)',['abc']);
		return await (con.exc)('select count(*) as num from logger',[]);
	}).catch(err=>{
		$.log.error(err);
		$.error('服务查询出错！');
	});
	
	if(res)$.out(res);*/
}); 

/*
上传接口
*/
app.get('/upload',async function($,a) {
	$.files[0].write('./webapp/upload/$filename');
	$.out('{"msg":"suc"}');
	
}); 

app.get('/download',async function($) {
	
	$.outFile('./webapp/upload/vimg.jpg','image/png',true);
	
}); 

app.get('/test_cache',async function($) {
	
	//await $.redis.set('test','a',12);
	
	var res= await $.redis.get('test','a');
	
	$.out(res);
	
});
	
app.get('/test2',async function($) {
	
	$.out($.cache.get('a'));
	
});

app.get('/is_login',async function($) {
	
	$.out($.session.A_has('user'));
	
});

app.get('/login',async function($) {
	
	await $.session.A_add('user').update();
	
	$.out('ok');
	
});

app.get('/login_out',async function($) {
	
	$.session.A_remove('user').update();
	
	$.out('ok');
	
});

app.get('/test_log',async function($) {
	
	//console.log(a.b)
	let res=await $.ser.test3();
	
	$.out(res);
	
});

app.get('/test_page',async function($) {
	
	$.res_data.test_data=(new Date().getTime())+'--获取成功！';
	
	return 'home.html';
	
});

app.get('/test_code',async function($) {
	
	let c=imgUtils.codeImg('code');
	$.session.set('imgcode',c.text.toLowerCase()).update();
	$.out(c.data);
	
});

app.get('/test_check_code',async function($,code) {
	
	if(code&&code.toLowerCase()==$.session.get('imgcode')){
		$.success('验证码匹配成功！');
	}else{
		$.error('验证码匹配失败！');
	}
	
	
});

app.get('/test_sql',async function($) {
	
	let res=await ($.db.getSqlTmp)('SELECT 1 + {num} AS solution{% if show %},{show} as so2{% endif %}',{num:2,show:true});
	
	$.out(res);
	
});

module.exports = app;