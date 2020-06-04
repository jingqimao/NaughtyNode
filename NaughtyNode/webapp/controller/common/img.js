const app = require(':lib/controller');
const fs = require('fs');
const uuid = require('uuid');
const path = require('path');
const fsUtils = require(':lib/fsUtils');
const pU = require(':lib/pathUtils');
const imgUtils = require(':lib/imgUtils');


app.setPrefix('/sys/img');


//本地图片缩略图
app.get('/preview',async function($,url) {
	
	for(let j in $.sys.replace){
		if(url.startsWith(j))url=url.replace(j,$.sys.replace[j]);
	}
	if(url.indexOf('./')==0)url=url.replace('./','');
	
	let fname=path.basename(url);
	let head=pU.p(':temp/img/');
	let name='preview_'+fname;
	let extname=path.extname(url);
	if(fs.existsSync(head+name)){
		$.outFile(head+name,false);
	}else{
		let img_path=url=$.sys_root+url;
		if(extname=='.jpg'||extname=='.png'||extname=='.jpeg'){
			let head=pU.p(':temp/img/');
			let name='preview_'+fname;
			fsUtils.dir_exists(head);
			await imgUtils.preview(200,img_path,head+name);
			$.outFile(head+name,false);
		}
	}
	
	
	
});





module.exports = app;