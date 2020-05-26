
/*

	日期：2020/5/24
	作者：惊奇猫/jingqimao
	名称：数据库操作工具
	说明：	1.初始化各种数据库
			2.封装同步方法和操作事务
	版权：个人作品
 
*/

var mysql = require('../node_modules/mysql');
var MongoClient = require('mongodb').MongoClient;
var htmlTemplate=require('./htmlTemplate');

var app={
	log:null,
	dbs:[],
	pools:{},
	urls:{},
	initPool:function(){//数据池获取/URL初始化
		for(var i in app.dbs){
			if(app.dbs[i].type==='mysql'){
				app.pools[i]=mysql.createPool(app.dbs[i]);
			}
			if(app.dbs[i].type==='mongodb'){
				app.urls[i]='mongodb://'+app.dbs[i].host+':27017';
				MongoClient.connect(app.urls[i],{useNewUrlParser: true},function(err,client){
					if(err){
						app.log.error("数据库连接失败:"+app.urls[i]);
						return false;
					}
					client.close();
				});
			}
		}
	},
	/*getCon:function(db_name){//直接获取连接
		var connection = mysql.createConnection(app.dbs[db_name]);
		connection.connect();
		return connection
	},*/
	exc:function(db_name,sql,arg){
		if(app.dbs[db_name].type==='mysql'){
			if(arg&&typeof arg == 'object'){//若参数为对象，使用模板解析
				let tmp=app.getSqlTmp(sql,arg);
				sql=tmp.sql;
				arg=tmp.arg;
			}
			return new Promise((resolve, reject) => {
				app.pools[db_name].getConnection(function(err, connection){
					connection.beginTransaction(async function(err){
						connection.query(sql ,arg, function(err,rows,fields) {
				            if (!err) {
								connection.commit(function(err){
									if(err)console.log('语句提交失败！');
								});
				                resolve(rows);
				            }else{
								app.log.error('执行SQL语句报错：'+err.sql);
								app.log.error('原因：'+err.sqlMessage);
								connection.rollback(function(err) {
									if(err){
										app.log.error('语句回滚失败！');
										app.log.error(err);
									}
								});
				                resolve(null);
				            }
							connection.release();
				        });
					});
				});
			});
		}
	},
	find:function(db_name,sql,arg){
		if(app.dbs[db_name].type==='mysql'){
			if(arg&&typeof arg == 'object'){//若参数为对象，使用模板解析
				let tmp=app.getSqlTmp(sql,arg);
				sql=tmp.sql;
				arg=tmp.arg;
			}
			return new Promise((resolve, reject) => {
				app.pools[db_name].getConnection(function(err, connection){
					connection.query(sql ,arg, function(err,rows,fields) {
			            if (!err) {
			                resolve(rows);
			            }else{
			                reject(err);
			            }
						connection.release();
			        });
				});
			});
		}
	},
	unit:function(db_name,fun){
		if(app.dbs[db_name].type==='mysql'){
			return new Promise((resolve, reject) => {
				app.pools[db_name].getConnection(function(err, connection){
					connection.beginTransaction(async function(err){
						if(err)throw err;
						let res=null;
						try{
							let con={
								connection,
								exc:function(sql,arg){
									if(arg&&typeof arg == 'object'){//若参数为对象，使用模板解析
										let tmp=app.getSqlTmp(sql,arg);
										sql=tmp.sql;
										arg=tmp.arg;
									}
									return new Promise((resolve, reject) => {
										con.connection.query(sql ,arg, function(err,rows,fields) {
								            if (!err) {
								                resolve(rows);
								            }else{
												app.log.error('执行SQL语句报错：'+err.sql);
												app.log.error('原因：'+err.sqlMessage);
								                reject(err);
								            }
								        });
									});
								}
							};
							res=await fun(con);
							connection.commit(function(err){
								if(err)app.log.error('语句提交失败！');
							});
						}catch(err){
							console.log(app.dbs[db_name].type+'事务报错！');
							console.log(err);
							connection.rollback(function(err) {
								if(err){
									app.log.error('事务回滚失败！');
									app.log.error(err);
								}else{
									app.log.info('事务已回滚！');
								}
							});
							reject(err);
							//resolve(res);
						}finally{
							connection.release();
						}
						resolve(res);
					});
				});
			});
		}
	},
	client:function(db_name,fun){
		if(app.dbs[db_name].type==='mongodb'){
			return new Promise((resolve, reject) => {
				MongoClient.connect(app.urls[db_name], {useNewUrlParser: true, useUnifiedTopology: true},async function(err, client) {
					if (err) throw err;
					let db=client.db(db_name);
					let res=null;
					try{
						res=await fun(db);
					}catch(err){
						reject(err);
					}finally{
						client.close();
					}
					resolve(res);
				});
			});
		}
		return null;
	},
	//解析模板生成语句和参数
	getSqlTmp:function(sql,arg){
		
		let nodes={
			'if':{
				end:'eif'
			},
			'for':{
				end:'efor'
			}
		};
		
		let index=0;
		
		let root={
			type:'root',
			args:{},
			child:[]
		};
		
		let target=root;
		
		while(true){
			let matches = sql.match(/\{%([^\{%]*?)%\}/);
			let isBlock = matches!=null;
			if(isBlock){
				
				let inner=matches[1].trim();
				
				if(matches.index>0){
					target.child.push({
						type:'text',
						args:{
							content:sql.substring(0,matches.index)
						},
						parent:target
					});
				}
				index=matches.index+matches[1].length+4;
				sql=sql.substring(index);
				
				for(let i in nodes){
					if(inner.indexOf(i)==0){
						new_node={
							type:i,
							args:{
								test:inner.substring(inner.indexOf(i)+i.length).trim()
							},
							child:[],
							parent:target
						}
						target.child.push(new_node);
						target=new_node;
						break;
					}else if(inner.indexOf(nodes[i].end)==0){
						
						target=target.parent;
						break;
					}
				}
			}else{
				target.child.push({
					type:'text',
					args:{
						content:sql
					},
					parent:target
				});
				break;
			}
			
		}
		
		let _sql=renderSql(root,arg);
		
		//渲染
		function renderSql(node,dd){
			let res='';
			if(node.type=='root'){
				for(let i in node.child){
					res+=renderSql(node.child[i],dd);
				}
			}else if(node.type=='text'){
				res+=node.args.content;
			}else if(node.type=='if'){
				try{
					if(htmlTemplate.runjs(node.args.test,dd)){
						for(let i in node.child){
							res+=renderSql(node.child[i],dd);
						}
					}
				}catch(e){
					app.log.error("sql模板if语句渲染出错！");
					throw e;
				}
			}else if(node.type=='for'){
				try{
					if(node.args.test.indexOf(' in ')>-1){
						let args=node.args.test.split(' in ')[0].split(',');
						let list=node.args.test.split(' in ')[1].trim();
						list=htmlTemplate.runjs(list,data);
						if(list){
							let index=0;
							for(let n in list){
								let _dd={};
								for(let i in dd){
									_dd[i]=dd[i];
								}
								_dd[args[0]]=list[n];
								if(args[1])_dd[args[1]]=index;
								for(let i in node.child){
									res+=renderSql(node.child[i],_dd);
								}
								index++;
							}
						}
					}
				}catch(e){
					app.log.error("sql模板for语句渲染出错！");
					throw e;
				}
			}
			return res;
		}
		
		//替换和插入变量
		let _arg=[];
		let c_args=_sql.match(/\{(.+?)\}/g);
		for(let i in c_args){
			let arg_name=c_args[i].replace('{','').replace('}','');
			if(arg[arg_name]!=undefined){
				_sql=_sql.replace(c_args[i],'?');
				_arg.push(arg[arg_name]);
			}else{
				app.log.error("sql模板变量渲染出错！");
				app.log.error(c_args[i]);
			}
		}
		c_args=_sql.match(/\[(.+?)\]/g);
		for(let i in c_args){
			let arg_name=c_args[i].replace('[','').replace(']','');
			if(arg[arg_name]!=undefined){
				_sql=_sql.replace(c_args[i],arg[arg_name]);
			}else{
				app.log.error("sql模板变量渲染出错！");
				app.log.error(c_args[i]);
			}
		}
		
		
		return {
			sql:_sql,
			arg:_arg
		}
	}
}


function sleep(ms) {
    for(var t = Date.now();Date.now() - t <= ms;);
}

function waitCheck(arg){
	for(var i=0;i<arg.num;i++){
		if(arg.check())break;
		sleep(arg.times);
	}
	return arg;
}


module.exports = app;

//	作者：惊奇猫/jingqimao