
/*

	日期：2020/5/24
	作者：惊奇猫/jingqimao
	名称：页面模板工具
	说明：实现标签插入其他页面，分成三部分：头部资源、页面内容、尾部脚本
	版权：个人作品
 
*/

var fs = require("fs");
var path=require('path');
var cheerio = require("../node_modules/cheerio");


var app={
	
	//检查并插入模板
	exc:async function(html){
		
		let $=cheerio.load(html);
		
		let headContent='';
		let bodyContent='';
		//let endContent='';
		
		let ind=$('body').find('include');
		let progress=0;
		if(ind.length>0){
			await new Promise((resolve, reject) => {
				ind.each(function(index,ele){
					let url=path.join(__dirname,'../webapp/')+$(ele).attr('src');
					
					fs.readFile(url,'utf-8',function(err,tmplate){
						if(!err){
							let $$=cheerio.load(tmplate);
							//head内容
							$$('head').find('script,link,style').each(function(_i,_ele){
								headContent+='\n'+$$.html(_ele);
							});
							//body内容
							let body=tmplate.match(/<body([\s\S]+?)\/body>/);
							if(body!=null){
								body=body[1].match(/>([\s\S]+)</);
								bodyContent='\n'+body[1];
							}
							//外部内容
							let end=tmplate.match(/<\/body>([\s\S]+?)<\/html>/);
							if(end!=null){
								//endContent+='\n'+end[1];
								bodyContent+='\n'+end[1];
							}
							
							$(ele).replaceWith(bodyContent);
							progress++;
							if(progress==ind.length){
								resolve();
							}
						}
					});
					
				});
			});
		}
		
		html=$.html();
		
		let xhtml=html.split('</head>');
		html=xhtml[0]+headContent+'</head>'+xhtml[1];
		//xhtml=html.split('</body>');
		//html=xhtml[0]+'</body>'+endContent+xhtml[1];
		
		return html;
	}
}

module.exports = app;

//	作者：惊奇猫/jingqimao