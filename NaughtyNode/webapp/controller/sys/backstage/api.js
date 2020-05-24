const app = require(':lib/controller');
const fs = require('fs');
const reflex = require(':lib/reflex');

app.setPrefix('/sys/api');

const sys_api_dir='/webapp/controller/sys/api/';
const cus_api_dir='/webapp/controller/custom/';
const cus_ser_dir='/webapp/service/custom/';

const cus_api_temp='/webapp/controller/sys/backstage/cus_api_templete.js';
const cus_ser_temp='/webapp/controller/sys/backstage/cus_ser_templete.js';

//接口管理
app.get('/get_sys_api_list',async function($) {
	
	
	let tree=[];
	
	let root=$.root+sys_api_dir;
	let sys_api=$.utils.fsUtils.scanTree(root,'系统接口',function(node){
		node.title=node.name;
		node.space='sys_api';
		delete node.path;
		if(node.type=='dir'){
			node.expand=false;
			if(node.level==0){
				node.type='root_node';
			}
		}
	});
	tree.push(sys_api);
	
	root=$.root+cus_api_dir;
	let cus_api=$.utils.fsUtils.scanTree(root,'自定义接口',function(node){
		node.title=node.name;
		node.space='cus_api';
		delete node.path;
		if(node.type=='dir'){
			node.expand=false;
			if(node.level==0){
				node.type='root_node';
			}
		}
	});
	tree.push(cus_api);
	
	root=$.root+cus_ser_dir;
	let cus_ser=$.utils.fsUtils.scanTree(root,'自定义服务',function(node){
		node.title=node.name;
		node.space='cus_ser';
		delete node.path;
		if(node.type=='dir'){
			node.expand=false;
			if(node.level==0){
				node.type='root_node';
			}
		}
	});
	tree.push(cus_ser);
	
	$.out(tree);
	
});
app.get('/new_file',async function($,space,url,type,name) {
	
	let root=null;
	if(space=='sys_api')root=$.root+sys_api_dir;
	if(space=='cus_api')root=$.root+cus_api_dir;
	if(space=='cus_ser')root=$.root+cus_ser_dir;
	
	if(root!=null){
		if(type=='dir'){
			let path=root+url+name;
			if(!fs.existsSync(path)){
				fs.mkdir(path,function(error){
					if(error)$.out(error);
					$.out(true);
				});
			}else{
				$.error(name+'已存在！');
			}
			
		}
		if(type=='file'&&space.indexOf('api')>-1){
			let path=root+url+name+'.js';
			if(!fs.existsSync(path)){
				let content=fs.readFileSync($.root+cus_api_temp);
				fs.writeFile(path,content,function(error){
					if(error)$.out(error);
					$.out(true);
				});
			}else{
				$.error(name+'已存在！');
			}
			
		}
		if(type=='file'&&space.indexOf('ser')>-1){
			let path=root+url+name+'Service.js';
			if(!fs.existsSync(path)){
				let content=fs.readFileSync($.root+cus_ser_temp);
				fs.writeFile(path,content,function(error){
					if(error)$.out(error);
					$.out(true);
				});
			}else{
				$.error(name+'已存在！');
			}
		}
	}
	
});
app.get('/del',async function($,space,url,type) {
	
	let root=null;
	if(space=='sys_api')root=$.root+sys_api_dir;
	if(space=='cus_api')root=$.root+cus_api_dir;
	if(space=='cus_ser')root=$.root+cus_ser_dir;
	
	if(type=='dir'){
		fs.rmdir(root+url,function(error){
			if(error)$.out(error);
			$.out(true);
		});
	}else{
		fs.unlink(root+url,function(error){
			if(error)$.out(error);
			$.out(true);
		});
	}
});
app.get('/rename',async function($,space,url,type,old_name,new_name) {
	
	let root=null;
	if(space=='sys_api')root=$.root+sys_api_dir;
	if(space=='cus_api')root=$.root+cus_api_dir;
	if(space=='cus_ser')root=$.root+cus_ser_dir;
	
	fs.rename(root+url+'/'+old_name,root+url+'/'+new_name,function(error){
		if(error){
			$.out(error);
		}
		$.out(true);
	});
});
app.get('/get_api_info',async function($,space,url,name) {
	
	let root=null;
	if(space=='sys_api')root=$.root+sys_api_dir;
	if(space=='cus_api')root=$.root+cus_api_dir;
	
	let path=root+url+'/'+name;
	fs.readFile(path,'utf8',function(error,res){
		if(error)$.out(error);
		
		let prefix=res.match(/app.setPrefix\(\'(.+?)\'\)/);
		if(prefix!=null){
			prefix=prefix[1];
		}else{
			prefix=res.match(/app.setPrefix\(\"(.+?)\"\)/);
			if(prefix!=null)prefix=prefix[1];
		}
		
		let reg=/app.get\(\'(.+?)\',async function\(\$(.*?)\)/g;
		let reg_suffix=/app.get\(\'(.+?)\',/;
		let reg_args=/async function\(\$(.*?)\)/;
		let api=res.match(reg);
		let apis=[];
		for(let i in api){
			let reg_info1=new RegExp('//(.*?)\r\n'+api[i].replace(/\(/g,'\\(').replace(/\)/g,'\\)').replace(/\$/g,'\\$'));
			let tip=res.match(reg_info1);
			if(tip){tip=tip[1];
			}else{
				let reg_info2=new RegExp('/\\*([^/\\*]*?)\\*/\r\n'+api[i].replace(/\(/g,'\\(').replace(/\)/g,'\\)').replace(/\$/g,'\\$'));
				tip=res.match(reg_info2);
				if(tip)tip=tip[1];
			}
			
			let suffix=api[i].match(reg_suffix)[1];
			let args=api[i].match(reg_args)[1];
			args=args.split(',');
			args.shift();
			apis.push({
				tip:tip,
				url:prefix+suffix,
				suffix:suffix,
				args:args
			});
		}
		
		$.out({
			prefix:prefix,
			apis:apis
		});
	});
	
	
});
app.get('/get_ser_info',async function($,space,url,name) {
	
	let root=null;
	if(space=='cus_ser')root=$.root+cus_ser_dir;
	
	let path=root+url+'/'+name;
	fs.readFile(path,'utf8',function(error,res){
		if(error)$.out(error);
		
		let reg=/app.ser\(\'(.+?)\',async function\((.*?)\)/g;
		let reg_name=/app.ser\(\'(.+?)\',/;
		let reg_args=/async function\((.*?)\)/;
		let ser=res.match(reg);
		let sers=[];
		for(let i in ser){
			let reg_info1=new RegExp('//(.*?)\r\n'+ser[i].replace(/\(/g,'\\(').replace(/\)/g,'\\)').replace(/\$/g,'\\$'));
			let tip=res.match(reg_info1);
			if(tip){tip=tip[1];
			}else{
				let reg_info2=new RegExp('/\\*([^/\\*]*?)\\*/\r\n'+ser[i].replace(/\(/g,'\\(').replace(/\)/g,'\\)').replace(/\$/g,'\\$'));
				tip=res.match(reg_info2);
				if(tip)tip=tip[1];
			}
			
			let name=ser[i].match(reg_name)[1];
			let args=ser[i].match(reg_args)[1];
			args=args.split(',');
			sers.push({
				tip:tip,
				name:name,
				args:args
			});
		}
		
		$.out({
			sers:sers
		});
	});
	
	
});
app.get('/get_api_sysinfo',async function($,url,name) {
	
	let root=$.root+sys_api_dir;
	let path=root+url+'/'+name;
	fs.readFile(path,'utf8',function(error,res){
		if(error)$.out(error);
		
		let info=res.match(/\/\* Sys_sett\r\n([\s\S]+?)\r\nSys_sett \*\//);
		if(info){
			$.out(info[1]);
		}else{
			$.error('接口文件出错！');
		}
	});
});
app.get('/set_api_sys_prefix',async function($,url,name,prefix) {
	
	let root=$.root+sys_api_dir;
	let path=root+url+'/'+name;
	fs.readFile(path,'utf8',function(error,res){
		if(error)$.error(error);
		
		res=res.replace(/app.setPrefix\(\'(.+?)\'\)/,'app.setPrefix(\''+prefix+'\')');
		
		fs.writeFile(path,res,function(err){
			if(err){
				$.error(err);
			}else{
				$.out(true);
			}
		});
	});
});
app.get('/set_api_sysinfo',async function($,url,name,info) {
	
	info=JSON.parse(info);
	let root=$.root+sys_api_dir;
	let path=root+url+'/'+name;
	fs.readFile(path,'utf8',function(error,res){
		if(error)$.out(error);
		
		let tmp='';
		for(let i in info){
			let api=info[i];
			let api_tmp="app.get('{url}',async function(${args}) {\r\n{content}\r\n});";
			let args=[];
			let content='';
			
			if(api.type=='db_data'){
				
				if(api.db.type=='select'){
				
					let set_args=[];
					let where_sql=api.db.where.sql;
					let page_sql='';
					let sort_sql='';
					
					let columns=[];
					for(let i in api.db.columns){
						columns.push('`'+api.db.columns[i]+'`');
					}
					
					if(api.db.sort){
						content+='\tlet desc=desc==\"true\"?\"desc\":\"asc\";\r\n';
					}
					content+='\tlet res=await ($.db.exc)(\"'+api.db.name+'\",\"select '+columns.toString()+' from `'+api.db.table+'`';
					if(where_sql!=''){
						for(let i in api.db.where.args){
							args.push(api.db.where.args[i].name);
						}
						let w_args=where_sql.match(/\{(.+?)\}/g);
						for(let i in w_args){
							let w_arg=w_args[i].replace('{','').replace('}','');
							if(isItemByArr('name',w_arg,api.db.where.args)){
								where_sql=where_sql.replace(w_args[i],'?');
								set_args.push(w_arg);
							}
						}
						content+=' where '+where_sql;
					}
					if(api.db.page){
						args.push('page');
						args.push('limit');
						page_sql=' limit \"+((page-1)*limit)+\",\"+limit+\"';
						content+=page_sql;
					}
					if(api.db.sort){
						sort_sql=' order by `'+api.db.sort_key+'` \"+desc+\"';
						content+=sort_sql;
					}
					content+='\",['+set_args.toString()+']);\r\n';
					content+='\t$.out(res);';
				}
				
				if(api.db.type=='add'){
					
					let set_args=[];
					let replace_args=[];
					for(let i in api.db.columns){
						args.push(api.db.columns[i]);
						set_args.push('`'+api.db.columns[i]+'`');
						replace_args.push('?');
					}
					
					content+='\tlet res=await ($.db.exc)(\"'+api.db.name+'\",\"insert into `'+api.db.table+'`('+set_args.toString()+') values ('+replace_args.toString()+')\",['+api.db.columns.toString()+']);\r\n';
					content+='\t$.out(res);';
				}
				
				if(api.db.type=='del'){
					
					let set_args=[];
					let where_sql=api.db.where.sql;
					if(where_sql!=''){
						for(let i in api.db.where.args){
							args.push(api.db.where.args[i].name);
						}
						let w_args=where_sql.match(/\{(.+?)\}/g);
						for(let i in w_args){
							let w_arg=w_args[i].replace('{','').replace('}','');
							if(isItemByArr('name',w_arg,api.db.where.args)){
								where_sql=where_sql.replace(w_args[i],'?');
								set_args.push(w_arg);
							}
						}
					}
					
					content+='\tlet res=await ($.db.exc)(\"'+api.db.name+'\",\"delete from `'+api.db.table+'` where '+where_sql+'\",['+set_args.toString()+']);\r\n';
					content+='\t$.out(res);';
				}
				
				if(api.db.type=='update'){
					
					let set_args=[];
					let key_args=[];
					for(let i in api.db.columns){
						key_args.push('`'+api.db.columns[i]+'`'+'=?');
						set_args.push(api.db.columns[i]);
					}
					let where_sql=api.db.where.sql;
					if(where_sql!=''){
						for(let i in api.db.where.args){
							args.push(api.db.where.args[i].name);
						}
						let w_args=where_sql.match(/\{(.+?)\}/g);
						for(let i in w_args){
							let w_arg=w_args[i].replace('{','').replace('}','');
							if(isItemByArr('name',w_arg,api.db.where.args)){
								where_sql=where_sql.replace(w_args[i],'?');
								set_args.push(w_arg);
							}
						}
					}
					for(let i in api.db.columns){
						args.push(api.db.columns[i]);
					}
					
					content+='\tlet res=await ($.db.exc)(\"'+api.db.name+'\",\"update `'+api.db.table+'` set '+key_args.toString()+' where '+where_sql+'\",['+set_args.toString()+']);\r\n';
					content+='\t$.out(res);';
				}
				
				if(api.db.type=='cus'){
					
					
					
					let set_args=[];
					cus_sql=api.db.cus_sql;
					for(let i in api.db.cus_args){
						args.push(api.db.cus_args[i].name);
					}
					let c_args=cus_sql.match(/\{(.+?)\}/g);
					for(let i in c_args){
						let c_arg=c_args[i].replace('{','').replace('}','');
						if(isItemByArr('name',c_arg,api.db.cus_args)){
							cus_sql=cus_sql.replace(c_args[i],'?');
							set_args.push(c_arg);
						}
					}
					c_args=cus_sql.match(/\[(.+?)\]/g);
					for(let i in c_args){
						let c_arg=c_args[i].replace('[','').replace(']','');
						if(isItemByArr('name',c_arg,api.db.cus_args)){
							cus_sql=cus_sql.replace(c_args[i],'\"+'+c_arg+'\+"');
						}
					}
					
					content+='\tlet res=await ($.db.exc)(\"'+api.db.name+'\",\"'+cus_sql+'\",['+set_args.toString()+']);\r\n';
					content+='\t$.out(res);';
				}
			}
			
			if(api.type=="service"){
				
				for(let i in api.ser.args){
					args.push(api.ser.args[i]);
				}
				content+='\t$.out(await $.ser.'+api.ser.name+'('+api.ser.args.toString()+'))';
			}
			
			if(api.type=="upload"){
				content+='\tlet fname='+(api.upload.uuid?'require("uuid").v1()+"_"+':'')+'$.files[0].name;\r\n'
				content+='\t$.files[0].write(pU.p("'+api.upload.save+'"+fname));\r\n'
				if(api.upload.format==''){
					content+='\t$.out("'+api.upload.url+'"+fname);'
				}else{
					content+='\tlet url="'+api.upload.url+'"+fname;\r\n'
					let res_str=api.upload.format;
					res_str=res_str.replace(/\$name/g,'\'+fname+\'');
					res_str=res_str.replace(/\$url/g,'\'+url+\'');
					content+='\t$.out(\''+res_str+'\');'
				}
				
			}
			
			
			api_tmp=api_tmp.replace('{url}',api.url);
			if(args.length>0){
				api_tmp=api_tmp.replace('{args}',','+args.toString());
			}else{
				api_tmp=api_tmp.replace('{args}','');
			}
			api_tmp=api_tmp.replace('{content}',content);
			
			tmp+='\r\n//'+api.tip+'\r\n'+api_tmp+'\r\n';
		}
		
		res=res.replace(/\/\* Sys_sett\r\n([\s\S]+?)\r\nSys_sett \*\//,'/* Sys_sett\r\n'+JSON.stringify(info,null,'\t')+'\r\nSys_sett */');
		res=res.replace(/\/\* Sys_temp start \*\/\r\n([\s\S]+?)\r\n\/\* Sys_temp end \*\//,'/* Sys_temp start */\r\n'+tmp+'\r\n/* Sys_temp end */');
		
		//$.out(res);
		
		fs.writeFile(path,res,function(err){
			if(err){
				$.out(false);
			}else{
				$.out(true);
			}
		});
		
	});
	
	function isItemByArr(k,v,arr){
		for(var i in arr){
			if(arr[i][k]==v)return true; 
		}
		return false;
	}
});
app.get('/get_ser_list',async function($) {
	
	let list=[];
	for(let i in $.sys.sers_list){
		if(i!='$'){
			list.push({
				name:i,
				key:i,
				args:$.sys.sers_list[i]!=""?$.sys.sers_list[i]:[]
			});
		}
	}
	$.out(list);
	
});
app.get('/download_api',async function($,space,url,name) {
	
	let root=null;
	if(space=='sys_api')root=$.root+sys_api_dir;
	if(space=='cus_api')root=$.root+cus_api_dir;
	if(space=='cus_ser')root=$.root+cus_ser_dir;
	
	$.outFile(root+url+name);
	
});
app.get('/upload_api',async function($,space,url,name) {
	
	let root=null;
	if(space=='sys_api')root=$.root+sys_api_dir;
	if(space=='cus_api')root=$.root+cus_api_dir;
	if(space=='cus_ser')root=$.root+cus_ser_dir;
	
	$.files[0].write(root+url+name);
	
	$.out(true);
	
});


module.exports = app;