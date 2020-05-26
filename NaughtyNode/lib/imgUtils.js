
/*

	日期：2020/5/26
	作者：惊奇猫/jingqimao
	名称：图片工具
	说明：封装图片处理方法
	版权：个人作品
 
*/

const jimp = require('jimp');
const svgCaptcha = require('svg-captcha');

var app={
	
	//生成预览图(缩小图片)
	preview:async function(size,img_url,save_url){
		let img=await jimp.read(img_url);
		if(img.bitmap.width>size){
			await img.resize(size, jimp.AUTO);
		}
		await img.writeAsync(save_url);
	},
	
	//添加水印(style可以设置水印大小\相对定位\透明度，还有全屏水印)
	addMark:async function(mark_url,img_url,save_url,style){
		let img=await jimp.read(img_url);
		let mark=await jimp.read(mark_url);
		
		style=style||{size:120,pos:'right-bottom',posX:'5%',posY:'5%',opacity:0.7};
		if(style.size==undefined)style.size=120;
		if(style.pos==undefined)style.pos='right-bottom';
		if(style.posX==undefined)style.posX='5%';
		if(style.posY==undefined)style.posY='5%';
		if(style.opacity==undefined)style.opacity=0.7;
		
		if(isNaN(style.size)&&style.size.indexOf('%')>-1)
			style.size=parseInt(parseInt(style.size.replace(/%/g,''))/100*img.bitmap.width);
		if(isNaN(style.posX)&&style.posX.indexOf('%')>-1)
			style.posX=parseInt(parseInt(style.posX.replace(/%/g,''))/100*img.bitmap.width);
		if(isNaN(style.posY)&&style.posY.indexOf('%')>-1)
			style.posY=parseInt(parseInt(style.posY.replace(/%/g,''))/100*img.bitmap.width);
		
		await mark.resize(style.size, jimp.AUTO);
		await mark.opacity(style.opacity);
		
		if(style.full!=undefined&&!isNaN(style.full))
			await mark.rotate(style.full);
		
		if(isNaN(style.posX)&&style.posX.indexOf('center')>-1)
			style.posX=parseInt((img.bitmap.width-mark.bitmap.width)/2);
		if(isNaN(style.posY)&&style.posY.indexOf('center')>-1)
			style.posY=parseInt((img.bitmap.height-mark.bitmap.height)/2);
		
		let center=[0,0];
		if(style.pos=='left-bottom'){
			center[1]=img.bitmap.height;
			style.posY=center[1]-style.posY-mark.bitmap.height;
		}else if(style.pos=='right-bottom'){
			center[0]=img.bitmap.width;
			center[1]=img.bitmap.height;
			style.posX=center[0]-style.posX-mark.bitmap.width;
			style.posY=center[1]-style.posY-mark.bitmap.height;
		}else if(style.pos=='right-top'){
			center[0]=img.bitmap.width;
			style.posX=center[0]-style.posX-mark.bitmap.width;
		}
		
		if(style.full!=undefined&&!isNaN(style.full)){
			let space=0.3;
			let xm=mark.bitmap.width*(1+space);
			let ym=mark.bitmap.height*(1+space);
			let xn=parseInt(img.bitmap.width/xm)+1;
			let yn=parseInt(img.bitmap.height/ym)+1;
			let s_xn=-parseInt(mark.bitmap.width/2);
			let s_yn=-parseInt(mark.bitmap.height/2);
			for(let y=0;y<yn;y++){
				for(let x=0;x<xn;x++){
					let px=x*xm+s_xn;
					let py=y*ym+s_yn;
					await img.composite(mark,px,py,[
						{
							mode:jimp.BLEND_SOURCE_OVER,
							opacitySource: 0.1,
							opacityDest: 1
						}
					]);
				}
			}
		}else{
			await img.composite(mark,style.posX,style.posY,[
				{
					mode:jimp.BLEND_SOURCE_OVER,
					opacitySource: 0.1,
					opacityDest: 1
				}
			]);
		}
		
		await img.writeAsync(save_url);
	},
	
	//获取两张图片汉明距离
	distance:async function(image1,image2){
		return await Jimp.distance(image1, image2);
	},
	
	//生成验证码图片
	codeImg:function(type,config){
		
		if(type=='code'){
			config=config||{
				size:4,
				ignoreChars: '0o1i',
				noise: 1,
				color:true,
				background:'#f9f9f9'
			}
			return svgCaptcha.create(config);
		}else if(type=='math'){
			config=config||{
				mathMin:1,
				mathMax:9,
				mathOperator:'+-',
				noise: 1,
				color:true,
				background:'#f9f9f9'
			}
			return svgCaptcha.createMathExpr(config);
		}
		
	}
}

module.exports = app;

//	作者：惊奇猫/jingqimao