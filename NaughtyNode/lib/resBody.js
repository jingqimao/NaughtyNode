
/*

	日期：2020/5/24
	作者：惊奇猫/jingqimao
	名称：返回值结构体
	说明：为了更懒一点，当然也为了专业
	版权：个人作品
 
*/

var app={
	set:function(status=true,msg='',data){
		if(data!=undefined){
			return JSON.stringify({
				status:status,
				msg:msg,
				data:data
			});
		}else{
			return JSON.stringify({
				status:status,
				msg:msg
			});
		}
		
	}
}

module.exports = app;

//	作者：惊奇猫/jingqimao