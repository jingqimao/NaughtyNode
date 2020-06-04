
/*

	日期：2020/5/24
	作者：惊奇猫/jingqimao
	名称：路径工具
	说明：	1.设置路径映射
			2.替换路径字符
	版权：个人作品
 
*/

var app={
	paths:{},
	set:function(arr){
		for(let i in arr){
			app.paths[':'+i]=arr[i];
		}
	},
	p:function(url){
		for(let i in app.paths){
			if(url.indexOf(i)>-1){
				return url.replace(i,app.paths[i]);
			}
		}
		return url;
	}
}

module.exports = app;

//	作者：惊奇猫/jingqimao