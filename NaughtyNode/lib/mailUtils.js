
/*

	日期：2020/5/24
	作者：惊奇猫/jingqimao
	名称：邮件工具
	说明：封装邮件发送
	版权：个人作品
 
*/

const nodemailer = require('nodemailer');

var app={
	transporter:null,
	set:function(host,user,pass){
		app.transporter=nodemailer.createTransport({
		    host: host,
		    port: 465,
		    secureConnection: true,
		    auth: {
				user: user,
				pass: pass
			}
		});
	},
	send:function(from,to,subject,message){
		let mailOptions = {
			from:from,
			to:to,
			subject:subject,
			html:message
		};
		return new Promise((resolve, reject) => {
			app.transporter.sendMail(mailOptions, (error, info = {}) => {
				if(error){
					reject(error);
				}else{
					resolve(true);
				}
			});
		});
	}
}

module.exports = app;

//	作者：惊奇猫/jingqimao