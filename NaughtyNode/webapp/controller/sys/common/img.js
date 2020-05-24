const app = require(':lib/controller');
const fs = require('fs');
const uuid = require('uuid');
const path = require('path');
const fsUtils = require(':lib/fsUtils');
const pU = require(':lib/pathUtils');
//const images = require('images');


app.setPrefix('/common/img');


//图片缩略图
/*app.get('/get_small',async function($,url) {
	
	let extname=path.extname(url);
	if(extname=='.jpg'||extname=='.png'||extname=='.jpeg'){
		url=url.substring(1);
		let head=pU.p(':cache/img/');
		let name=uuid.v1()+extname;
		fsUtils.dir_exists(head);
		images(pU.p(':'+url)).size(200).noProfile().save(head+name,{quality:100});
		$.outFile(head+name,'image/'+extname.replace('.',''),true);
	}
	
	
});*/





module.exports = app;