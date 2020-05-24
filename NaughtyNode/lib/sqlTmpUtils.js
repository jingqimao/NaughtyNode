
/*

	日期：2020/5/24
	作者：惊奇猫/jingqimao
	名称：sql模板工具
	说明：未实现
	版权：个人作品
 
*/

const xml2js = require('xml2js').parseString;

var app={
	parse:function(sql){
		
		return new Promise((resolve, reject) => {
			xml2js(sql, function (err, result) {
				
				console.log(result);
				
				resolve(true);
			});
		});
		
	}
}

module.exports = app;

//	作者：惊奇猫/jingqimao