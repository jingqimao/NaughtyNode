
/*

	日期：2020/5/24
	作者：惊奇猫/jingqimao
	名称：session会话工具
	说明：封装改系统的session，实现本地和redis对接，自计时自刷新，另外还有权限标识容器
	版权：个人作品
 
*/

var crypto = require('crypto');
var re

var app={
	sessionBean:{//底层对象和工具
		type:'--',//默认本地
		local:{},//本地对象
		ext:null,//外部session对象
		refresh:2*60*1000,//session延迟时间
		time:30*60*1000,//session闲置时间
		get:async function(key){
			if(this.type==='--'){
				if(this.local[key]!=undefined){
					if(!this.local[key].timeRefresh)this.local[key].timeRefresh=true;
					return this.local[key];
				}else{
					return null;
				}
			}else if(this.type==='redis'){
				let ses=await this.ext.redisUtils.get(this.ext.redisName,key);
				if(ses!=null&&!ses.timeRefresh)ses.timeRefresh=true;
				return ses;
			}
		},
		set:async function(key,value,time){
			if(this.type==='--'){
				this.local[key]=value;
			}else if(this.type==='redis'){
				if(time!=undefined){
					await this.ext.redisUtils.set(this.ext.redisName,key,value,time);
				}else{console.log(this.time)
					await this.ext.redisUtils.set(this.ext.redisName,key,value,this.time);
				}
				//添加到列表
				let rsl=await this.getRedisSessionList();
				rsl.list[key]=true;
				this.setRedisSessionList(rsl);
			}
		},
		remove:async function(key){
			if(this.type==='--'){
				if(this.local[key]!=undefined)delete this.local[key];
			}else if(this.type==='redis'){
				await this.ext.redisUtils.del(this.ext.redisName,key);
				//从列表删除
				let rsl=await this.getRedisSessionList();
				delete rsl.list[key];
				await this.setRedisSessionList(rsl);
			}
		},
		updateRedisTime:async function(key,time){
			await this.ext.redisUtils.expire(this.ext.redisName,key,time);
		},
		getRedisSessionList:async function(){
			return await this.ext.redisUtils.get(this.ext.redisName,this.ext.sessionListName);
		},
		setRedisSessionList:async function(rsl){
			return await this.ext.redisUtils.set(this.ext.redisName,this.ext.sessionListName,rsl);
		}
	},
	newSession:function(key,time){//生成Session
		let now=new Date().getTime();
		key+=now;
		let sid=crypto.createHash('md5').update(key).digest("hex");
		let session={
			sid:sid,
			data:{},
			authorization:{},
			time:now+time,
			timeRefresh:false
		};
		app.sessionBean.set(sid,session,time);
		return sid;
	},
	get:async function(sid){
		let session=await app.sessionBean.get(sid);
		if(session==null)return session;
		let ses={//封装一层工具
			session:session,
			A_has:function(name){
				if(name instanceof String){
					return this.session.authorization[name]!=null;
				}
				if(name instanceof Array){
					for(let i in name){
						if(this.session.authorization[name[i]]!=null)return true;
					}
					return false;
				}
				
			},
			A_add:function(name){
				this.session.authorization[name]=true;
				return this;
			},
			A_remove:function(name){
				delete this.session.authorization[name];
				return this;
			},
			A_clear:function(){
				for(var i in this.session.authorization){
					this.A_remove(i);
				}
				return this;
			},
			update:function(){
				app.sessionBean.set(this.session.sid,this.session);
			},
			has:function(key){
				return this.session.data[key]!=null;
			},
			get:function(key){
				return this.session.data[key];
			},
			set:function(key,val){
				this.session.data[key]=val;
				return this;
			},
			remove:function(key){
				delete this.session.data[key];
				return this;
			},
			clear:function(){
				for(var i in this.session.data){
					this.remove(i);
				}
				return this;
			}
		};
		return ses;
	},
	clear:function(sid){
		app.sessionBean.remove(sid);
	},
	//本地处理
	timeOutRefresh:function(){//定时延迟session时间
		setInterval(async function(){
			let now=new Date().getTime();
			if(app.sessionBean.type=='--'){
				for(var i in app.sessionBean.local){
					if(app.sessionBean.local[i].timeRefresh){
						app.sessionBean.local[i].timeRefresh=false;
						app.sessionBean.local[i].time=now+app.sessionBean.time;
					}
				}
			}else if(app.sessionBean.type=='redis'){
				let rsl=await app.sessionBean.getRedisSessionList();
				for(var i in rsl.list){
					let ses=await app.sessionBean.get(i);
					if(ses!=null){
						if(ses.timeRefresh){
							ses.timeRefresh=false;
							await app.sessionBean.updateRedisTime(i,now+app.sessionBean.time);
						}
					}else{
						delete rsl.list[i];
					}
				}
				await app.sessionBean.setRedisSessionList(rsl);
			}
			
		},app.sessionBean.refresh);
	},
	timeOut:function(){//定时清理闲置session
		setInterval(function(){
			let now=new Date().getTime();
			for(var i in app.sessionBean.local){
				if(now>app.sessionBean.local[i].time){
					app.clear(app.sessionBean.local[i].sid);
				}
			}
		},app.sessionBean.time);
	}
}

module.exports = app;

//	作者：惊奇猫/jingqimao