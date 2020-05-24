const app = require(':lib/controller');
const fs = require('fs');
const path = require('path');
const fsUtils = require(':lib/fsUtils');
const pU = require(':lib/pathUtils');
const cfUtils = require(':lib/cfUtils');


app.setPrefix('/common');


app.get('/get_sys_setting',async function($,name) {
	
	let m=cfUtils.get('_SYS_Setting').data;
	
	let res={
		title:m.sys_base.title,
		domain:m.sys_base.domain,
		message:m.sys_base.message,
		begin_time:m.sys_base.begin_time,
		recode:m.sys_base.recode
	};
	$.out(res[name]);
});




module.exports = app;