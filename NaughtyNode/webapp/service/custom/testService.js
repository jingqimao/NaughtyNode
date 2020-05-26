const app = require(':lib/service');
const imgUtils = require(':lib/imgUtils');

//测试
app.ser('test',async function(a) {
	
	return await this.$.ser.test2();
	
}); 

app.ser('test2',async function() {
	
	return 'test2 from service';
	
});

app.ser('test3',async function() {
	
	//return a.b;
	return 'test3 from service';
});

app.init('init_test',async function() {
	
	this.$.global.sys_setting={
		recode:'1564564',
		list:['123','456','789'],
		show:false,
		list_node:[
			{name:'苹果'},
			{name:'雪梨'},
			{name:'香蕉'}
		]
	};
	
	//水印测试
	//await imgUtils.addMark('C:/Users/陈海山/Desktop/logo.png','C:/Users/陈海山/Desktop/timg.jpg','C:/Users/陈海山/Desktop/timg_m.jpg');
	
});




module.exports = app;