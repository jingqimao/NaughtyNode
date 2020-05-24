/**
 * 
 * 4.基础工具
 * 引入各种简化小工具
 * 
 *
 *作者：陈海山
 *上次更新日期：2019/3/22
 *更新日期：2020/2/19
 */





//小工具
var WheelTool={
	//请求服务
	get:function(url,data,isJson,isEdit){
		//直接请求URL
		if(typeof url == "string"){
			if(data==undefined)data={};
			var jq_res=$.ajax({url:url,data:data,async:false,type:"POST"});
			var res=jq_res.responseText;
			if(jq_res.status!="200")res='{"code":'+jq_res.status+',"msg":"net error '+jq_res.status+'","data":"error"}';
			if(res!=undefined){
				if(isJson!=undefined&&isJson==false)return res;
				//if(isHtml!=undefined&&isHtml==true)res=res.replace(/\r/g,"").replace(/\n/g,"<br>").replace(/\\/g,"\\\\");
				if(WheelTool.isJSON(res)){
					res=WheelTool.toJSON(res);
					if(res.code!=undefined&&res.code==-1&&res.msg!=undefined)console.error("请求报错:"+url+"\n原因："+res.msg);
					if(isEdit!=undefined&&isEdit==true){
						res=exc(res);
						function exc(obj){
							for(var i in obj){
								if(typeof obj[i] == "string"){
									obj[i]=obj[i].replace(/<br>/g,"\n").replace(/&nbsp;/g,"\t");
								}
								if(typeof obj[i] == "object"){
									obj[i]=exc(obj[i]);
								}
							}
							return obj;
						}
					}
					return res; 
				}else{
					return res; 
				}
			}else{
				console.error(url+" 请求出错！返回结果：undefined");   
			}
		//参数请求
		}else if(typeof url == 'object' && url ){
			if(url.url!=undefined&&url.url!=null){
				var data=url.data||{};
				if(url.success!=undefined&&typeof url.success == "function"){
					$.ajax(url);
				}else{
					var type=url.type||"POST";
					var jq_res=$.ajax({url:url.url,data:data,async:false,type:type});
					var res=jq_res.responseText;
					if(jq_res.status!="200")res='{"code":'+jq_res.status+',"msg":"net error '+jq_res.status+'","data":"error"}';
					if(res!=undefined){
						if(isJson!=undefined&&isJson==false)return res;
						//if(isHtml!=undefined&&isHtml==true)res=res.replace(/\r/g,"").replace(/\n/g,"<br>").replace(/\\/g,"\\\\");
						if(WheelTool.isJSON(res)){
							res=WheelTool.toJSON(res);
							if(res.code!=undefined&&res.code==-1&&res.msg!=undefined)console.error("后台报错："+res.msg);
							if(isEdit!=undefined&&isEdit==true){
								res=exc(res);
								function exc(obj){
									for(var i in obj){
										if(typeof obj[i] == "string"){
											obj[i]=obj[i].replace(/<br>/g,"\n").replace(/&nbsp;/g,"\t");
										}
										if(typeof obj[i] == "object"){
											obj[i]=exc(obj[i]);
										}
									}
									return obj;
								}
							}
							return res; 
						}else{
							return res; 
						}
					}else{
						console.error(url+" 请求出错！返回结果：undefined");   
					}
				}
			}
		}
	},
	//判断字符串是否JSON格式
	isJSON:function(str) {
	    if (typeof str == 'string') {
	        try {
	            var obj=JSON.parse(str);
	            if(typeof obj == 'object' && obj ){
	                return true;
	            }else{
	                return false;
	            }

	        } catch(e) {
	            return false;
	        }
	    }else{
	    	return false;
	    }
	},
	//字符串转JSON对象
	toJSON:function(str,isUncode){
		if(isUncode!=undefined&&isUncode==true){
			str=WheelTool.uncode(str);
		}
		if(str!=undefined&&str!=null&&WheelTool.isJSON(str)){
			return JSON.parse(str);
		}else{
			console.error("转换失败！非JSON字符串:"+str);
			return;
		}
	},
	//字符串转JSON对象
	toSTR:function(json,isEncode){
		if(json!=undefined&&json!=null){
			if(isEncode!=undefined&&isEncode==true){
				return WheelTool.encode(JSON.stringify(json));
			}else{
				return JSON.stringify(json);
			}
			
		}else{
			console.error("转换失败！非JSON对象:"+json);
			return;
		}
	},
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
	//获取URL
	getUrl:function(){
		return document.location.toString(); 
	},
	//获取URL参数合集
	getUrlArg:function(){ 
		var para=[];
		var url = document.location.toString();
		if(url.indexOf("?")>0){
			var ps = url.split("?")[1].split("#")[0].split("&");
			for(var i in ps){
				var pss=ps[i].split("="); 
				para[decodeURI(pss[0])]=decodeURI(pss[1]);    
			}
		}
		return para; 
	},
	//传参跳转页面
	jump:function(url,para){
		if(para!=undefined){
			var pp="";
			for(var i in para){
				if(pp.length==0){
					pp+="?"+para[i];
				}else{
					pp+="&"+para[i];
				}
			}
			url+=pp;
		}
		window.location.href=url; 
	},
	//新窗口传参跳转页面
	jumpNew:function(url,para){
		if(para!=undefined){
			var pp="";
			for(var i in para){
				if(pp.length==0){
					pp+="?"+para[i];
				}else{
					pp+="&"+para[i];
				}
			}
			url+=pp;
		}
		window.open(url,"_blank"); 
	},
	//根据正则表达式获取URL参数
	getUrlItem:function(reg){
		var url = document.location.toString(); 
		pattern =new RegExp(reg,"i");  
		var arr=url.match(pattern);
		if(arr!=null&&arr.length>1){
			return arr[1];
		}else{
			return null;
		}
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
	//插入脚本
	joinJS:function(src,call){
		var script=document.createElement("script"); 
		script.type="text/javascript";
		script.src=src;
		document.getElementsByTagName('head')[0].appendChild(script);
		script.onload=script.onreadystatechange=function(){
			if(call!=undefined)call();
		}
	},
	//插入多个文件
	joinFile:function(src_list,call){
		var src_n=0;
		for(var i in src_list){
			var src=src_list[i];
			var type=src.substring(src.lastIndexOf('.')+1,src.length);
			if(type=="js"){
				var script=document.createElement("script"); 
				script.type="text/javascript";
				script.src=src;
				document.getElementsByTagName('head')[0].appendChild(script);
				script.onload=script.onreadystatechange=function(){
					src_n++;
					if(call!=undefined&&src_n==src_list.length)call();
				}
			}else if(type=="css"){
				var link=document.createElement("link"); 
				link.rel="stylesheet";
				link.href=src;
				document.getElementsByTagName('head')[0].appendChild(link);
				link.onload=link.onreadystatechange=function(){
					src_n++;
					if(call!=undefined&&src_n==src_list.length)call();
				}
			}
		}
	},
	//数组转字符串
	arr2str:function(arr,sp,sl,sr){
		var str="";
		var ssp=sp!=undefined?sp:",";
		var ssl=sl!=undefined?sl:"";
		var ssr=sr!=undefined?sr:"";
		for(var i=0;i<arr.length;i++){
			if(str.length==0){
				str+=ssl+arr[i]+ssr;
			}else{
				str+=ssp+ssl+arr[i]+ssr;
			}
		}
		return str;
	},
	//纵轴滚动聚焦
	focus:function(item,speed,y){
		var sd=speed||800;
		var yy=y||50;
		var top=$(item).offset().top-yy;
		if(top<0)top=0;
		$('html,body').animate({scrollTop:top}, sd);
	},
	//session缓存
	cache:function(key,val){
		if(val===undefined){
			if(sessionStorage[key]!=undefined&&sessionStorage[key]!=null){
				var val=sessionStorage[key];
				if(this.isJSON(val)){
					return JSON.parse(val);
				}else{
					return val;
				}
			}else{
				return null;
			}
		}else{
			if(val!=null){
				if(typeof val=="object"){
					sessionStorage[key]=JSON.stringify(val);
				}else if(typeof val=="string"){
					sessionStorage[key]=val;
				}else{
					sessionStorage[key]=val;
				}
			}else{
				delete sessionStorage[key];
			}
		}
	},
	//本地缓存
	cache_loc:function(key,val){
		if(val===undefined){
			if(localStorage[key]!=undefined&&localStorage[key]!=null){
				var val=localStorage[key];
				if(this.isJSON(val)){
					return JSON.parse(val);
				}else{
					return val;
				}
			}else{
				return null;
			}
		}else{
			if(val!=null){
				if(typeof val=="object"){
					localStorage[key]=JSON.stringify(val);
				}else if(typeof val=="string"){
					localStorage[key]=val;
				}else{
					localStorage[key]=val;
				}
			}else{
				delete localStorage[key];
			}
		}
	},
	//文本转html
	txt2html:function(txt){
		return txt.replace(/\r\n/,"<br/>").replace(/\n/,"<br/>");
	},
	//对象属性赋值
	setObj:function(obj,set_data){
		if(obj==undefined||obj==null||set_data==undefined||set_data==null)return;
		for(var i in set_data){
			if(obj[i]!=undefined&&set_data[i]!=undefined){
				obj[i]=set_data[i];
			}
		}
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
	//上传文件
	upload:function(url,formData,callback,async){
		async=async!=undefined?async:true;
		$.ajax({
	        type: "POST",
	        url: url , 
	        data: formData,
	        async:async,
	        cache: false,
	        processData: false,
	 	    contentType: false,
	        success:function(d){
	        	var res=wt.toJSON(d);
	        	if(res.msg=="suc"){
	        		callback(res);
	        	}
	        }
		});
	},
	//刷新页面
	reload:function(time){
		if(time!=undefined){
			setTimeout(function(){
				window.location.reload();
			},time);
		}else{
			window.location.reload();
		}
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
	//IP转Int
	 ip2int:function(ip){
		 var num = 0;
		 ip = ip.split(".");
		 num = Number(ip[0]) * 256 * 256 * 256 + Number(ip[1]) * 256 * 256 + Number(ip[2]) * 256 + Number(ip[3]);
		 num = num >>> 0;
		 return num;
	 },
	//Int转IP
	 int2ip:function(num) {
		 var str;
		 var tt = new Array();
		 tt[0] = (num >>> 24) >>> 0;
		 tt[1] = ((num << 8) >>> 24) >>> 0;
		 tt[2] = (num << 16) >>> 24;
		 tt[3] = (num << 24) >>> 24;
		 str = String(tt[0]) + "." + String(tt[1]) + "." + String(tt[2]) + "." + String(tt[3]);
		 return str;
	 },
	 //等待全部加载完成
	 allLoad:function(files,progress,callback){
		 var n=0;
		 for(var i in files){
			 if(files[i].tagName=="IMG"){
				 files[i].onload=wait;
			 }else if(files[i].tagName=="AUDIO"){
				 files[i].oncanplay=wait;
			 }else{
				 wait();
			 }
		 }
		 function wait(){
			 n++;
			 progress(((n/files.length)*100).toFixed(2),files.length,n);
			 if(n==files.length){
				 callback();
			 }
		 }
		 if(files.length==0){
			 progress(100,files.length,n);
			 callback();
		 }
	 },
	 //html转text
	 html2text:function(str){
		 var RexStr = /\<|\>|\"|\'|\&|　| /g
		 str = str.replace(RexStr,function (MatchStr) {
			switch (MatchStr) {
				case "<":
				     return "&lt;";
				     break;
				case ">":
				     return "&gt;";
				     break;
				case "\"":
				     return "&quot;";
				     break;
				case "'":
				     return "&#39;";
				     break;
				case "&":
				     return "&amp;";
				     break;
				case " ":
				     return "&ensp;";
				     break;
				case "　":
			         return "&emsp;";
			         break;
			    default:
			         break;
			    }
		});
		return str.replace(/\&lt\;br[\&ensp\;|\&emsp\;]*[\/]?\&gt\;|\r\n|\n/g, "<br/>");;
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
	 //全屏显示
	 fullscreen:function(exit) {
		if(exit){
			if (document.exitFullscreen) {
			  document.exitFullscreen()
			 } else if (document.msExitFullscreen) {
			  document.msExitFullscreen()
			 } else if (document.mozCancelFullScreen) {
			  document.mozCancelFullScreen()
			 } else if (document.webkitExitFullscreen) {
			  document.webkitExitFullscreen()
			 }
		}else{
			let element=document.documentElement;
			if (element.requestFullscreen) {
				element.requestFullscreen()
			} else if (element.mozRequestFullScreen) {
			  element.mozRequestFullScreen()
			} else if (element.msRequestFullscreen) {
			  element.msRequestFullscreen()
			} else if (element.webkitRequestFullscreen) {
			  element.webkitRequestFullScreen()
			}
		}
	},
	//判断全屏
	isFullScreen:function() {
		return document.isFullScreen || document.mozIsFullScreen || document.webkitIsFullScreen
	},
	//复制到粘贴板
	copyText:function(text) {
            var textarea = document.createElement("textarea");
            var currentFocus = document.activeElement;
            document.body.appendChild(textarea);
            textarea.value = text;
            textarea.focus();
            if (textarea.setSelectionRange) {
                textarea.setSelectionRange(0, textarea.value.length);
            } else {
                textarea.select();
            }
            try {
                var flag = document.execCommand("copy");
            } catch (eo) {
                var flag = false;
            }
            document.body.removeChild(textarea);
            currentFocus.focus();
            return flag;
        }
};
window['wt']=WheelTool;