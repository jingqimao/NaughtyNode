
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

var app={
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
						console.log("数据库连接失败:"+app.urls[i]);
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
								console.log('执行SQL语句报错：'+err.sql);
								console.log('原因：'+err.sqlMessage);
								connection.rollback(function(err) {
									if(err){
										console.log('语句回滚失败！');
										console.log(err);
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
									return new Promise((resolve, reject) => {
										con.connection.query(sql ,arg, function(err,rows,fields) {
								            if (!err) {
								                resolve(rows);
								            }else{
												console.log('执行SQL语句报错：'+err.sql);
												console.log('原因：'+err.sqlMessage);
								                reject(err);
								            }
								        });
									});
								}
							};
							res=await fun(con);
							connection.commit(function(err){
								if(err)console.log('语句提交失败！');
							});
						}catch(err){
							console.log(app.dbs[db_name].type+'事务报错！');
							console.log(err);
							connection.rollback(function(err) {
								if(err){
									console.log('事务回滚失败！');
									console.log(err);
								}else{
									console.log('事务已回滚！');
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