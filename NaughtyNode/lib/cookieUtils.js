
/*

	日期：2020/5/24
	作者：惊奇猫/jingqimao
	名称：cookie操作工具
	说明：简单存取方法
	版权：个人作品
 
*/

var app={
	get:function(req){
		let _cookie={};
		let cookies = req.headers.cookie ? req.headers.cookie.split(';') : [];
		if (cookies.length > 0) {
			cookies.forEach(item => {
			  if (item) {
				let cookieArray = item.split('=');
				if (cookieArray && cookieArray.length > 0) {
				  let key = cookieArray[0].trim();
				  let value = cookieArray[1] ? cookieArray[1].trim() : undefined;
				  _cookie[key] = value;
				}
			  }
			})
		}
		return _cookie;
	},
	set:function(res,sid,time){
		if(time){
			var date=new Date();
			date.setTime(date.getTime()+time); 
			res.setHeader('Set-Cookie', 'sid='+sid+';Path=/;HttpOnly;expires='+date.toGMTString());
		}else{
			res.setHeader('Set-Cookie', 'sid='+sid+';Path=/;HttpOnly;');
		}
		
	}
}

module.exports = app;

//	作者：惊奇猫/jingqimao