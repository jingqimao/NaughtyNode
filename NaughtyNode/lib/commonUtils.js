
/*

	日期：2020/6/3
	作者：惊奇猫/jingqimao
	名称：通用工具库
	说明：封装一些常用工具和方法
	版权：个人作品
 
*/


var app={
	//判断是否为数字
	isNumber:function(val) {
	    var regPos = /^\d+(\.\d+)?$/;
	    var regNeg = /^(-(([0-9]+\.[0-9]*[1-9][0-9]*)|([0-9]*[1-9][0-9]*\.[0-9]+)|([0-9]*[1-9][0-9]*)))$/;
	    return (regPos.test(val) || regNeg.test(val));
    },
	//遍历数组根据属性值获取对象
	getItemByArr:function(k,v,arr){
		for(var i in arr){
			if(arr[i][k]==v)return arr[i]; 
		}
		return null;
	},
	//遍历数组判断是否存在属性值
	isItemByArr:function(k,v,arr){
		for(var i in arr){
			if(arr[i][k]==v)return true; 
		}
		return false;
	},
	//根据字符串获取时间
	getTime:function(str){
		str=str.replace(/-/g,"/");
		return new Date(str).getTime();
	},
	//格式化时间
	fmTime:function(str,fm){
		if(typeof str == 'string'){
			str=str.replace(/-/g,"/");
			return format(new Date(str),fm);
		}else{
			return format(new Date(str),fm);
		}
		function format(time,format){
			var date = new Date(time);
			var year = date.getFullYear(),
				month = date.getMonth()+1,
				day = date.getDate(),
				hour = date.getHours(),
				min = date.getMinutes(),
				sec = date.getSeconds();
			var preArr = Array.apply(null,Array(10)).map(function(elem, index) {
				return '0'+index;
			});
			var newTime = format.replace(/yyyy/g,year)
								.replace(/MM/g,preArr[month]||month)
								.replace(/dd/g,preArr[day]||day)
								.replace(/HH/g,preArr[hour]||hour)
								.replace(/mm/g,preArr[min]||min)
								.replace(/ss/g,preArr[sec]||sec);

			return newTime;
		}
	},
	//获取当前时间字符串
	now:function(){
		var date = new Date();
	    var seperator1 = "-";
	    var seperator2 = ":";
	    var month = date.getMonth() + 1;
	    var strDate = date.getDate();
	    if (month >= 1 && month <= 9) {
	        month = "0" + month;
	    }
	    if (strDate >= 0 && strDate <= 9) {
	        strDate = "0" + strDate;
	    }
	    var currentdate = date.getFullYear() + seperator1 + month + seperator1 + strDate
	            + " " + date.getHours() + seperator2 + date.getMinutes()
	            + seperator2 + date.getSeconds();
	    return currentdate;
	},
	//深度克隆对象
	clone:function(obj){
		function isClass(o){
            return Object.prototype.toString.call(o).slice(8,-1)
        }
		var result,oClass = isClass(obj);
	    if(oClass==='Object'){
	        result = {};
	    }else if(oClass==='Array'){
	        result = [];
	    }else{
	        return obj
	    }
	    if(oClass==='Object'){
	        for(var key in obj){
	            result[key]  = this.clone(obj[key]);
	        }
	    }else if(oClass==="Array"){
	        for(var i=0;i<obj.length;i++){
	             result.push(this.clone(obj[i]));
	        }
	    }
	
	    return result
	},
	//编码
	encode:function(str){
		//return encodeURI(str);
		return encodeURIComponent(str);
	},
	//解码
	uncode:function(str){
		//return decodeURI(str);
		return decodeURIComponent(str);
	},
	//生成唯一ID
	uuid:function(len, radix) {
		len=len||32;
		radix=radix||16;
	    var chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'.split('');
	    var uuid = [], i;
	    radix = radix||chars.length;
	    if(len){
			for (i = 0; i < len; i++) uuid[i] = chars[0 | Math.random()*radix];
	    }else {
			var r;
			uuid[8] = uuid[13] = uuid[18] = uuid[23] = '-';
			uuid[14] = '4';
	  
			for (i = 0; i < 36; i++) {
				if (!uuid[i]) {
				r = 0 | Math.random()*16;
				uuid[i] = chars[(i == 19) ? (r & 0x3) | 0x8 : r];
				}
			}
	     }
	     return uuid.join('');
	 },
	 //查找树节点
	 stree:function(tree,key,val,children){
		return sstree(tree);
		function sstree(node){
			if(node[key]==val){
				return node;
			}
			if(node[children]!=undefined&&node[children].length>0){
				for(let i in node[children]){
					let res=sstree(node[children][i]);
					if(res)return res;
				}
			}
			return false;
		}
	 },
}

module.exports = app;

//	作者：惊奇猫/jingqimao