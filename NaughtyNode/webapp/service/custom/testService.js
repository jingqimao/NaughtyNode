const app = require(':lib/service');

//测试
app.ser('test',async function(a) {
	
	return await this.$.ser.test2();
	
}); 

app.ser('test2',async function() {
	
	return 'test2 from service';
	
});

app.ser('test3',async function() {
	
	//return a.b;
	return 'test3 from service';
});



module.exports = app;