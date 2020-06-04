const app = require(':lib/controller');
const fs = require('fs');
const uuid = require('uuid');
const pU = require(':lib/pathUtils');

app.setPrefix('/backstage_api/db');

let dbs_dir;
let tables_dir;
let article_img_dir;
let sqlcard_dir;

app.init(async function($){
	dbs_dir=pU.p(':dbs');
	tables_dir=pU.p(':tables');
	article_img_dir=pU.p(':article');
	sqlcard_dir=pU.p(':sqlcard');
});

//数据库
app.get('/get_dbs',async function($) {
	
	let dbs=$.db.dbs;
	let res=[];
	
	let root=dbs_dir;
	
	for(let i in dbs){
		let struct=null;
		let path=root+dbs[i].database+'.json';
		if(fs.existsSync(path)){
			struct=JSON.parse(fs.readFileSync(path,'utf8'));
		}
		res.push({
			type:dbs[i].type,
			host:dbs[i].host,
			name:dbs[i].database,
			struct:struct
		});
	}
	$.out(res);
	
});
app.get('/init_db',async function($,db) {
	
	let root=dbs_dir;
	
	let res={
		tables:[],
		table_keys:{},
		table_json:{}
	};
	
	let path=root+db+'.json';
	if(fs.existsSync(path)){
		res=JSON.parse(fs.readFileSync(path,'utf8'));
	}
	
	res.tables=await ($.db.exc)(db,"SELECT TABLE_NAME as table_name FROM information_schema.tables WHERE table_schema = ? AND table_type = 'BASE TABLE' ",[db]);
	
	for(let i in res.tables){
		let keys=await ($.db.exc)(db,"	SELECT COLUMN_NAME,COLUMN_TYPE,DATA_TYPE,CHARACTER_MAXIMUM_LENGTH,IS_NULLABLE,COLUMN_DEFAULT,COLUMN_COMMENT FROM INFORMATION_SCHEMA.COLUMNS where table_schema = ? AND table_name  = ?",[db,res.tables[i].table_name]);
		
		let tkeys=[];
		for(let j in keys){
			tkeys.push({
				name:keys[j].COLUMN_NAME,
				type:keys[j].COLUMN_TYPE,
				dtype:keys[j].DATA_TYPE,
				length:keys[j].CHARACTER_MAXIMUM_LENGTH,
				is_null:keys[j].IS_NULLABLE,
				def:keys[j].COLUMN_DEFAULT,
				comment:keys[j].COLUMN_COMMENT
			});
		}
		res.table_keys[res.tables[i].table_name]=tkeys;
	}
	
	let json=JSON.stringify(res,null,'\t');
	fs.writeFile(root+db+'.json',json,function(err){
		if(err){
			$.out(false);
		}else{
			$.out(true);
		}
	});
});

app.get('/init_table',async function($,db,table,struct) {
	
	let root_tables=tables_dir;
	let root_dbs=dbs_dir;
	
	let json=JSON.stringify(JSON.parse(struct),null,'\t');
	let path_table=root_tables+db+'-'+table+'.json';
	fs.writeFile(path_table,json,function(err){
		if(err){
			$.out(false);
		}else{
			let path_db=root_dbs+db+'.json';
			let struct_json=JSON.parse(fs.readFileSync(path_db,'utf8'));
			struct_json.table_json[table]=db+'-'+table+'.json';
			fs.writeFile(path_db,JSON.stringify(struct_json,null,'\t'),function(err){
				if(err){
					$.out(false);
				}else{
					$.out(true);
				}
			});
		}
	});
	
});
app.get('/get_table_json',async function($,db,table) {
	
	let root_dbs=dbs_dir;
	let path_db=root_dbs+db+'.json';
	let struct_json=JSON.parse(fs.readFileSync(path_db,'utf8'));
	
	let path_table=struct_json.table_json[table];
	let tb_json=JSON.parse(fs.readFileSync(tables_dir+path_table,'utf8'));
	
	$.out(tb_json);
	
});
app.get('/get_table_data',async function($,db,table,keys,page,limit,desc) {
	
	keys=JSON.parse(keys);
	let n=(page-1)*limit;
	desc=desc=='true'?'desc':'asc';
	let test=await ($.db.exc)(db,"select count(*) as max_size from "+table,[]);
	let _keys=[];
	for(let i in keys){
		_keys.push('`'+keys[i]+'`');
	}
	let res=await ($.db.exc)(db,"select "+_keys.toString()+" from `"+table+"` order by `id` "+desc+" limit "+n+","+limit,[]);
	
	$.out({
		total:test[0].max_size,
		data:res
	});
});
app.get('/add_table_data',async function($,db,table,data) {
	
	data=JSON.parse(data);
	let keys=[];
	let vv=[];
	let vals=[];
	for(let i in data){
		keys.push('`'+i+'`');
		vv.push('?');
		vals.push(data[i]);
	}
	let res=await ($.db.exc)(db,"insert into `"+table+"` ("+keys.toString()+") values ("+vv.toString()+")",vals);
	$.out(res);
	
});
app.get('/save_table_data',async function($,db,table,data,id) {
	
	data=JSON.parse(data);
	let keys=[];
	let vals=[];
	for(let i in data){
		keys.push('`'+i+'` = ?');
		vals.push(data[i]);
	}
	vals.push(id);
	let res=await ($.db.exc)(db,"update `"+table+"` set "+keys.toString()+" where `id` = ?" ,vals);
	$.out(res);
	
});
app.get('/del_table_data',async function($,db,table,id) {
	
	let res=await ($.db.exc)(db,"delete from `"+table+"` where `id` = ?" ,id);
	$.out(res);
	
});
app.get('/upload_article_img',async function($) {
	
	let root=article_img_dir;
	let res='';
	for(var i in $.files){
		let uid=uuid.v1();
		$.files[i].write(root+uid+'-$filename');
		res='/article/img/'+uid+'-'+$.files[i].name;
	}
	$.out({error:false,path:res});
});
app.get('/get_relate_data',async function($,db,row,sql,key,title) {
	
	row=JSON.parse(row);
	let sql_ok=true;
	let args=[];
	if(row&&Object.keys(row).length>0){
		let c_args=sql.match(/\{(.+?)\}/g);
		for(let i in c_args){
			let arg_name=c_args[i].replace('{','').replace('}','');
			if(row[arg_name]!=undefined){
				sql=sql.replace(c_args[i],'?');
				args.push(row[arg_name]);
			}else{
				$.log.error("数据库关联sql模板变量渲染出错！");
				$.log.error(c_args[i]);
				sql_ok=false;
			}
		}
		c_args=sql.match(/\[(.+?)\]/g);
		for(let i in c_args){
			let arg_name=c_args[i].replace('[','').replace(']','');
			if(row[arg_name]!=undefined){
				sql=sql.replace(c_args[i],row[arg_name]);
			}else{
				$.log.error("数据库关联sql模板变量渲染出错！");
				$.log.error(c_args[i]);
				sql_ok=false;
			}
		}
	}
	
	if(sql_ok){
		let res=await ($.db.exc)(db,sql,args);
		if(res&&res.length>0){
			if(title!=undefined){
				let sels=[];
				for(let i in res){
					sels.push({
						key:res[i][key],
						title:res[i][title]
					});
				}
				$.out(sels);
			}else{
				$.out({
					key:res[0][key]
				});
			}
		}else{
			$.out({});
		}
	}else{
		$.out({});
	}
	
	
});

//数据监控
app.get('/get_sql_card',async function($) {
	
	let root_sqlcard=sqlcard_dir;
	
	let res=[];
	let path=root_sqlcard+'cards.json';
	if(fs.existsSync(path)){
		res=JSON.parse(fs.readFileSync(path,'utf8'));
	}
	$.out(res);
	
});
app.get('/save_sql_card',async function($,cards) {
	
	let root_sqlcard=sqlcard_dir;
	
	let path=root_sqlcard+'cards.json';
	fs.writeFile(path,JSON.stringify(JSON.parse(cards),null,'\t'),function(err){
		if(err){
			$.out(false);
		}else{
			$.out(true);
		}
	});
	
});
app.get('/get_sql_data',async function($,db,sql) {
	
	let res=await ($.db.exc)(db,sql,{});
	$.out(res);
	
});

module.exports = app;