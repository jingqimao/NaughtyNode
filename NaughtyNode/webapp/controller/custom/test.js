const app = require('../../../lib/controller');

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


module.exports = app;