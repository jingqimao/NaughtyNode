
/*

	日期：2020/5/24
	作者：惊奇猫/jingqimao
	名称：系统硬件信息工具
	说明：主要拿到处理器、内存和硬盘的信息
	版权：个人作品
 
*/

const os = require('os');
const osUtils = require('os-utils');
const diskinfo = require('diskinfo');


var app={
	run:false,
	t:null,
	currCPU:0,
	info:{
		cpu:0,
		men:{
			free:0,
			total:0,
			used:0,
			usage:0
		},
		disks:[]
	},
	update:function(){
		updateCPU();
		function updateCPU(){
			setTimeout(function(){
				osUtils.cpuUsage(function (value) {
					app.currCPU = value;
					if(app.run)updateCPU();
				});
			},200);
		}
		updateDisk();
		function updateDisk(){
			setTimeout(function(){
				diskinfo.getDrives(function(err, aDrives) {
					for (var i = 0; i < aDrives.length; i++) {
						if(app.info.disks[aDrives[i].mounted]==undefined)app.info.disks[aDrives[i].mounted]={
							total:0,
							used:0,
							free:0,
							usage:0
						};
						app.info.disks[aDrives[i].mounted].total=(aDrives[i].blocks /1024 /1024 /1024).toFixed(2) + "G";
						app.info.disks[aDrives[i].mounted].used=(aDrives[i].used /1024 /1024 /1024).toFixed(2) + "G";
						app.info.disks[aDrives[i].mounted].free=(aDrives[i].available /1024 /1024 /1024).toFixed(2) + "G";
						app.info.disks[aDrives[i].mounted].usage=aDrives[i].capacity;
					}
					if(app.run)updateDisk();
				});
			},200);
		}
		app.info.cpu=(app.currCPU * 100.0).toFixed(2) + "%",
		app.info.men.free=os.freemem()/1024/1024/1024;
		app.info.men.total=os.totalmem()/1024/1024/1024;
		app.info.men.used=(app.info.men.total-app.info.men.free).toFixed(2)+"G";
		app.info.men.usage=((app.info.men.total-app.info.men.free)/app.info.men.total*100).toFixed(2)+"%";
		app.info.men.free=app.info.men.free.toFixed(2)+"G";
		app.info.men.total=app.info.men.total.toFixed(2)+"G";
	},
	getInfo:function(){
		return app.info;
	},
	start:function(){
		if(!app.run){
			app.run=true;
			app.t=setInterval(function(){
				app.update();
			},1000);
			return true;
		}
		return false;
	},
	stop:function(){
		if(app.run){
			app.run=false;
			clearInterval(app.t);
			return true;
		}
		return false;
	}
}

module.exports = app;

//	作者：惊奇猫/jingqimao