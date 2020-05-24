
/*

	日期：2020/5/24
	作者：惊奇猫/jingqimao
	名称：文件中转工具
	说明：将文件（JSON）加载到内存，快速存取
	版权：个人作品
 
*/

const fs=require("fs");  


var app={
	log:null,
	files:{},
	add:function(name,url){
		let data=null;
		try{
			data=fs.readFileSync(url,'utf-8');
		}catch(e){
			app.log.error("cfUtils缓存文件加载路径错误");
			app.log.error(url);
			return false;
		}
		app.files[name]={
			url:url,
			data:IsJsonString(data)?JSON.parse(data):data,
			set:function(data){
				this.data=data;
				return this;
			},
			save:function(){
				let _data=this.data;
				if(this.url.lastIndexOf('.json')>-1)_data=JSON.stringify(_data,null,'\t');
				fs.writeFile(this.url,_data,function(err){
					if(err)return err;
					return this;
				});
			},
			remove:function(){
				delete app.files[this.name];
			}
		};
		//判断JSON
		function IsJsonString(str) {
			try {
				JSON.parse(str);
			} catch (e) {
				return false;
			}
			return true;
		}
	},
	get:function(name){
		return app.files[name];
	}
}

module.exports = app;

//	作者：惊奇猫/jingqimao