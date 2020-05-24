
/*

	日期：2020/5/24
	作者：惊奇猫/jingqimao
	名称：文件工具
	说明：一些自定义文件操作方法
	版权：个人作品
 
*/

var fs = require('fs');
var path = require('path');

var app={
	
	//递归扫描文件
	scan:function(url,suffix){
		let files=[];
		find(url,suffix);
		function find(url,suffix){
			var pa=fs.readdirSync(url);
			pa.forEach((ele,index)=>{
				var pp = url+"/"+ele;
				var info = fs.statSync(pp); 
				if(info.isFile()){
					if(suffix==undefined||ele.endWith(suffix))files.push(pp);
				}else{
					find(pp,suffix);
				}
			})
		}
		return files;
	},
	//递归扫描目录
	scanTree:function(url,name,fun){
		let r_url='';
		return find(url,r_url,name,0,fun);
		function find(url,r_url,name,level,fun){
			
			let info=fs.statSync(url);
			if(info.isFile()){
				let node={
					type:'file',
					name:name,
					path:url,
					r_path:r_url+'/'+name,
					s_path:r_url,
					level:level,
					size:info.size
				};
				if(fun!=undefined)fun(node);
				return node;
			}else{
				let node={
					type:'dir',
					name:name,
					path:url,
					r_path:level>0?r_url+'/'+name:'',
					s_path:r_url,
					level:level,
					children:[]
				};
				var pa=fs.readdirSync(url);
				pa.forEach((ele,index)=>{
					var c_url = url+"/"+ele;
					node.children.push(find(c_url,node.r_path,ele,level+1,fun));
				})
				if(fun!=undefined)fun(node);
				return node;
			}
		}
	},
	//判断文件路径是否存在
	exist:function(url){
		return new Promise((resolve, reject) => {
			fs.exists(url,function(exists){
				if(exists){
					resolve(true);
				}else{
					resolve(false);
				}
			});
		});
	},
	//获取路径信息
	getStat:function(url){
		return new Promise((resolve, reject) => {
			fs.stat(url, (err, stats) => {
				if(err){
					resolve(false);
				}else{
					resolve(stats);
				}
			})
		})
	},
	//创建路径
	mkdir:function(dir){
		return new Promise((resolve, reject) => {
			fs.mkdir(dir, err => {
				if(err){
					resolve(false);
				}else{
					resolve(true);
				}
			})
		})
	},
	//判断文件路径是否存在,不存在就新建
	dir_exists:async function(dir){
		let isExists = await app.getStat(dir);
		if(isExists && isExists.isDirectory()){
			return true;
		}else if(isExists){
			return false;
		}
		let tempDir = path.parse(dir).dir;
		let status = await app.dir_exists(tempDir);
		let mkdirStatus;
		if(status){
			mkdirStatus = await app.mkdir(dir);
		}
		return mkdirStatus;
	}
}

//后缀判断
String.prototype.endWith=function(str){
	var reg=new RegExp(str+"$");
	return reg.test(this);
}

module.exports = app;

//	作者：惊奇猫/jingqimao