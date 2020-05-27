
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
	log:null,
	//检查并插入模板
	exc:async function(html,data){
		
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
					
					fs.exists(url,function(exists){
						if(exists){
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
						}else{
							app.log.error("找不到嵌入页面的路径！");
							app.log.error(url);
							
							$(ele).replaceWith('-- Include error --');
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
		
		//渲染节点树
		try{
			html=app.renderTree(html,data);
		}catch(e){
			app.log.error("页面渲染出错！");
			app.log.error(e);
		}
		
		
		return html;
	},
	//变量和条件插值
	replace:function(html,data){
		
		var escape={
			//"&nbsp;":"",
			"&lt;":"<",
			"&gt;":">",
			"&amp;":"&",
			"&quot;":"\"",
			"&copy;":"©"
		};
		
		let reg_rp = /\{#(.+?)#\}/g; 
		let m=html.match(reg_rp);  
		if(m!=null){
			for(let j in m){
				let s=m[j].replace(/\{#/g,'').replace(/#\}/g,'');
				if(s!=null){
					for(let i in escape){
						let reg_s=new RegExp(i,"g");
						s=s.replace(reg_s,escape[i]);
					}
				}
				let reg=m[j].replace(/\[/g,'\\\[').replace(/\]/g,'\\\]').replace(/\*/g,'\\\*').replace(/\+/g,'\\\+').replace(/\=/g,'\\\=').replace(/\?/g,'\\\?').replace(/\'/g,'\\\'').replace(/\"/g,'\\\"').replace(/\(/g,'\\\(').replace(/\)/g,'\\\)');   
				let v=null;
				try{
					v=app.runjs(s,data);
				}catch(e){
					app.log.error("模板变量渲染出错！");
					app.log.error(e);
					v='-- Display error --';
				}
				if(v!=null&&v.replace!=undefined){
					for(let i in escape){
						let reg_s=new RegExp(i,"g");
						v=v.replace(reg_s,escape[i]);
					}
				}
				html=html.replace(new RegExp(reg,"g"),v); 
			}
		}
		return html;
	},
	//动态执行语句并返回结果
	runjs:function(jsstr,data){
		var escape={
			"&apos;":"'",
			"&nbsp;":" ",
			"&lt;":"<",
			"&gt;":">",
			"&amp;":"&",
			"&quot;":"\"",
			"&copy;":"©"
		};
		for(let i in escape){//html转义
			jsstr=jsstr.replace(new RegExp(i,"g"),escape[i]);
		}
		var head="";
		if(data==undefined)data=null;
		var item={
			data:data,
			res:null
		}; 
		for(var i in data){
			if(i.indexOf(".")<0)head+="var "+i+"=item_.data."+i+";";
		}
		var jsstr_t=jsstr.trim();
		if(jsstr_t.charAt(jsstr_t.length-1)!=";"){
			jsstr=head+"(typeof("+jsstr+")!=\"undefined\")?item_.res=("+jsstr+"):null;";
		}else{
			jsstr=head+jsstr+"item_.res=null;";
		}
		function callAnotherFunc(fnFunction, vArgument) { 
			fnFunction(vArgument);
		}
		function checkStr(str){
			var regEn = /[`~!@#$%^&*()_+<>?:"{},.\/;'[\]]/im,regCn = /[·！#￥（——）：；“”‘、，|《。》？、【】[\]]/im;
			if(regEn.test(str) || regCn.test(str)) {
				return false;
			}else{
				return true;
			}
		}
		callAnotherFunc(new Function("item_", jsstr), item);
		return item.res; 
	},
	//生成语法节点树并渲染
	renderTree:function(html,data){
		let nodes={
			'if':{
				end:'eif'
			},
			'for':{
				end:'efor'
			}
		};
		
		let index=0;
		
		let root={
			type:'root',
			args:{},
			child:[]
		};
		
		let target=root;
		
		while(true){
			let matches = html.match(/\{%([^\{%]*?)%\}/);
			let isBlock = matches!=null;
			if(isBlock){
				
				let inner=matches[1].trim();
				
				if(matches.index>0){
					target.child.push({
						type:'text',
						args:{
							content:html.substring(0,matches.index)
						},
						parent:target
					});
				}
				index=matches.index+matches[1].length+4;
				html=html.substring(index);
				
				for(let i in nodes){
					if(inner.indexOf(i)==0){
						new_node={
							type:i,
							args:{
								test:inner.substring(inner.indexOf(i)+i.length).trim()
							},
							child:[],
							parent:target
						}
						target.child.push(new_node);
						target=new_node;
						break;
					}else if(inner.indexOf(nodes[i].end)==0){
						
						target=target.parent;
						break;
					}
				}
			}else{
				target.child.push({
					type:'text',
					args:{
						content:html
					},
					parent:target
				});
				break;
			}
			
		}
		
		let _html=renderHtml(root,data);
		
		//渲染
		function renderHtml(node,dd){
			let res='';
			if(node.type=='root'){
				for(let i in node.child){
					res+=renderHtml(node.child[i],dd);
				}
			}else if(node.type=='text'){
				res+=app.replace(node.args.content,dd);
			}else if(node.type=='if'){
				try{
					if(app.runjs(node.args.test,dd)){
						for(let i in node.child){
							res+=renderHtml(node.child[i],dd);
						}
					}
				}catch(e){
					app.log.error("模板if语句渲染出错！");
					app.log.error(e);
					res+='-- Display error --';
				}
			}else if(node.type=='for'){
				try{
					if(node.args.test.indexOf(' in ')>-1){
						let args=node.args.test.split(' in ')[0].split(',');
						let list=node.args.test.split(' in ')[1].trim();
						list=app.runjs(list,data);
						if(list){
							let index=0;
							for(let n in list){
								let _dd={};
								for(let i in dd){
									_dd[i]=dd[i];
								}
								_dd[args[0]]=list[n];
								if(args[1])_dd[args[1]]=index;
								for(let i in node.child){
									res+=renderHtml(node.child[i],_dd);
								}
								index++;
							}
						}
					}
				}catch(e){
					app.log.error("模板for语句渲染出错！");
					app.log.error(e);
					res+='-- Display error --';
				}
			}
			return res;
		}
		
		return _html;
	}
}

module.exports = app;

//	作者：惊奇猫/jingqimao