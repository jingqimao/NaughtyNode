const app = require(':lib/controller');
const fs = require('fs');
const uuid = require('uuid');
const cfUtils = require(':lib/cfUtils');
const pU = require(':lib/pathUtils');
const cacheUtils = require(':lib/cacheUtils');

app.setPrefix('/sys/content');

const file_dir='webapp/view/data/file/';
const setting_dir='webapp/view/backstage/setting/';
const material_dir='webapp/view/data/material/';

//访问路径
app.get('/get_url',async function($) {
	
	$.out(cfUtils.get('_SYS_Urlmap').data);
	
});

app.get('/add_url',async function($,item) {
	
	item=JSON.parse(item);
	let list=cfUtils.get('_SYS_Urlmap').data;
	list.push(item);
	cfUtils.get('_SYS_Urlmap').set(list).save();
	if(item.type=='replace'){
		$.sys.replace[item.url]=item.file;
	}
	if(item.type=='forward'){
		$.sys.forward[item.url]=item.file;
	}
	if(item.type=='redirect'){
		$.sys.redirect[item.url]=item.file;
	}
	$.out(true);
	
});

app.get('/save_url',async function($,item,index) {
	
	item=JSON.parse(item);
	let list=cfUtils.get('_SYS_Urlmap').data;
	list[index]=item;
	cfUtils.get('_SYS_Urlmap').set(list).save();
	if(item.type=='replace'){
		$.sys.replace[item.url]=item.file;
	}
	if(item.type=='forward'){
		$.sys.forward[item.url]=item.file;
	}
	if(item.type=='redirect'){
		$.sys.redirect[item.url]=item.file;
	}
	$.out(true);
	
});
app.get('/del_url',async function($,index) {
	
	let list=cfUtils.get('_SYS_Urlmap').data;
	if(list[index].type=='replace'){
		delete $.sys.replace[list[index].url];
	}
	if(list[index].type=='forward'){
		delete $.sys.forward[list[index].url];
	}
	if(list[index].type=='redirect'){
		delete $.sys.redirect[list[index].url];
	}
	list.splice(index,1);
	cfUtils.get('_SYS_Urlmap').set(list).save();
	$.out(true);
	
});

//静态素材
app.get('/get_material',async function($) {
	
	$.out(cfUtils.get('_SYS_Material').data);
	
});
app.get('/add_material',async function($,mater,data) {
	
	mater=JSON.parse(mater);
	data=JSON.parse(data);
	let list=cfUtils.get('_SYS_Material').data;
	let file_name=uuid.v1()+'_data.json';
	mater.file=file_name;
	list.push(mater);
	cfUtils.get('_SYS_Material').set(list).save();
	fs.writeFile($.root+material_dir+file_name,JSON.stringify(data,null,'\t'),function(err){
		if(err){
			$.out(false);
		}else{
			let m=cacheUtils.get('_SYS_Material');
			m[mater.key]=mater.file;
			cacheUtils.set('_SYS_Material',m);
			$.out(true);
		}
	});
	
});
app.get('/save_material',async function($,mater,index,data) {
	
	mater=JSON.parse(mater);
	data=JSON.parse(data);
	let list=cfUtils.get('_SYS_Material').data;
	list[index]=mater;
	cfUtils.get('_SYS_Material').set(list).save();
	fs.writeFile($.root+material_dir+mater.file,JSON.stringify(data,null,'\t'),function(err){
		if(err){
			$.out(false);
		}else{
			$.out(true);
		}
	});
	
});
app.get('/del_material',async function($,index) {
	
	let list=cfUtils.get('_SYS_Material').data;
	let file=list[index].file;
	fs.unlink(pU.p(':material/'+file),function(error){
		
		let m=cacheUtils.get('_SYS_Material');
		delete m[list[index].key];
		cacheUtils.set('_SYS_Material',m);
		
		list.splice(index,1);
		cfUtils.get('_SYS_Material').set(list).save();
		$.out(true);
	});
	
});
app.get('/get_material_data',async function($,index) {
	
	let list=cfUtils.get('_SYS_Material').data;
	$.out(fs.readFileSync($.root+material_dir+list[index].file,'utf8'));
	
});
app.get('/m_data',async function($,key) {
	
	let m=cacheUtils.get('_SYS_Material');
	if(m&&m[key]!=undefined){
		let f=JSON.parse(fs.readFileSync(pU.p(':material/'+m[key]),'utf8'));
		$.out(f.data[f.type]);
	}else{
		$.error("请求出错！");
	}
	
});
app.get('/upload_material_img',async function($) {
	
	let fname=uuid.v1()+'_'+$.files[0].name;
	$.files[0].write(pU.p(':upload/img/'+fname));
	$.out('/stay/img/'+fname);
});
app.get('/upload_material_file',async function($) {
	
	let fname=uuid.v1()+'_'+$.files[0].name;
	$.files[0].write(pU.p(':upload/file/'+fname));
	$.out('/stay/file/'+fname);
});

//文件管理
app.get('/get_files',async function($,url) {
	
	let root=$.root+file_dir;
	let files=[];
	let pa=fs.readdirSync(root+url);
	pa.forEach((ele,index)=>{
		let pp = root+url+"/"+ele;
		let info = fs.statSync(pp);
		if(info.isFile()){
			files.push({
					type:'file',
					suffix:ele.indexOf('.')>-1?ele.substring(ele.lastIndexOf("."),ele.length):'',
					name:ele,
					size:info.size,
					url:url+ele,
					ctime:info.birthtime.toLocaleString(),
					utime:info.mtime.toLocaleString()
				});
		}else{
			files.push({
					type:'dir',
					suffix:'',
					name:ele,
					size:'',
					url:url+ele,
					ctime:info.birthtime.toLocaleString(),
					utime:info.mtime.toLocaleString()
				});
		}
	});
	
	$.out(files);
	
});
app.get('/new_dir',async function($,url,dir_name) {
	
	let root=$.root+file_dir;
	fs.mkdir(root+url+dir_name,function(error){
		if(error){
			$.out(error);
		}
		$.out(true);
	});
	
});
app.get('/rename',async function($,url,old_name,new_name) {
	
	let root=$.root+file_dir;
	fs.rename(root+url+old_name,root+url+new_name,function(error){
		if(error){
			$.out(error);
		}
		$.out(true);
	});
	
});
app.get('/del',async function($,url,name,type) {
	
	let root=$.root+file_dir;
	if(type=='dir'){
		fs.rmdir(root+url+name,function(error){
			if(error){
				$.out(error);
			}
			$.out(true);
		});
	}else{
		fs.unlink(root+url+name,function(error){
			if(error){
				$.out(error);
			}
			$.out(true);
		});
	}
});
app.get('/download',async function($,url,name) {
	
	let root=$.root+file_dir;
	$.outFile(root+url+name);
});
app.get('/move',async function($,url,name,new_url) {
	
	let root=$.root+file_dir;
	fs.rename(root+url+name,root+new_url+name,function(error){
		if(error){
			$.out(error);
		}
		$.out(true);
	});
	
});
app.get('/upload',async function($,url) {
	
	let root=$.root+file_dir;
	if(url==undefined){
		$.files[0].write(root+'$filename');
	}else{
		$.files[0].write(root+url+'$filename');
	}
	$.out(true);
});



module.exports = app;