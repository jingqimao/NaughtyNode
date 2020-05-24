
/*

	日期：2020/5/24
	作者：惊奇猫/jingqimao
	名称：任务封装
	说明：封装系统任务结构和执行方法
	版权：个人作品
 
*/

const schedule = require('node-schedule');

var app={
	log:null,
	tasks:[],
	task:function(name,time,tip,task,run){
		app.tasks.push({
			name:name,
			time:time,
			tip:tip,
			task:task,
			run:run?true:false,
			res:null,
			run_times:0,
			last_time:null,
			hadle:null,
			_run:function(){
				app.run(this);
			},
			_stop:function(){
				app.stop(this);
			}
		})
	},
	run:function(task){
		task.run=true;
		task.hadle=schedule.scheduleJob(task.time,async ()=>{
			task.last_time=new Date().getTime();
			task.run_times++;
			try{
				await task.task();
			}catch(e){
				app.log.error("定时任务报错："+task.name);
				app.log.error(e.stack);
			}
			
		}); 
	},
	stop:function(task){
		task.run=false;
		task.hadle.cancel();
	}
}

module.exports = app;

//	作者：惊奇猫/jingqimao