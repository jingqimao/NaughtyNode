const app = require(':lib/task');


app.task('test','30 * * * * *','测试任务',async function() {
	
	console.log( await this.$.ser.test2());
	
}); 

module.exports = app;