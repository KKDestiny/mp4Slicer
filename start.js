/**
 * @Name	 : Slice a MP4 File
 * @Module	 : FFMPEG operation
 * @Author	 : Linxiaozhou
 * @Date	 : 2017.07.07
 */

var fs = require('fs');


// child_process
var FFMpegSlice = function(_srcfile, _dstfile) {
	console.log("=============================================")
	console.log("使用[child_process]方式 -- 文件 ["+_srcfile+"] 开始切片...")
	
	// var ffmpeg_cmd = "ffmpeg -i 123.mp4 -vframes 30 -y -f gif screenshot.gif"
	// var ffmpeg_cmd = "ffmpeg -i 123.mp4 -y -f image2 -ss 10.100 -t 0.001 -s 720X576 screenshot1.jpg"
	// var ffmpeg_cmd = "ffmpeg -i 123.mp4 -y -f image2 -t 0.030 -s 720x576 screenshot.jpg"
	var ffmpeg_cmd = 'ffmpeg -i '+_srcfile+' -c:v libx264 -c:a aac -strict -2 -f hls -hls_list_size 0 '+_dstfile;
	
	var process = require('child_process');
	process.exec(ffmpeg_cmd, function (error, stdout, stderr) {
		if (error !== null) {
			console.log("=============================================")
			console.log("文件 ["+_srcfile+"] 切片失败！！！！")
			console.log('错误信息: ' + error);
			console.log("=============================================")
		}
		else {
			console.log("=============================================")
			console.log("文件 ["+_srcfile+"] 切片成功！")
			console.log("=============================================")
		}
	});
}



// NodeFFmpeg
var NodeFFmpeg = function(_srcfile, _dstfile) {
	var ffmpeg = require('fluent-ffmpeg');
	console.log("使用[NodeFFmpeg]方式 -- 文件 ["+_srcfile+"] 开始切片...")

	ffmpeg(_srcfile)
		.videoCodec('libx264')
		.audioCodec('aac')
		.format('hls')
		.outputOptions('-hls_list_size 0')	// 0-不会自动覆盖(如果不设置，则.m3u8文件只默认存储最后5个切片)
		.on('error', function(err) {
			console.log("=============================================")
			console.log("文件 ["+_srcfile+"] 切片失败！！！！")
			console.log('错误信息: ' + err.message);
			console.log("=============================================")
		})
		.on('end', function() {
			console.log("=============================================")
			console.log("文件 ["+_srcfile+"] 切片成功！位置为："+_dstfile)
			console.log("=============================================")
		})
		.save(_dstfile);

}



// Prepare
var dobj = new Date();
var month = dobj.getMonth()+1;
var date = dobj.getDate();
var datestring = dobj.getFullYear()+""+(month<10?"0"+month:month)+""+(date<10?"0"+date:date)
var randomstr = parseInt(Math.random()*10000)

var srcfile = 'abc.mp4';
var name = srcfile.split('.')[0];

var root = 'slice';
var dstdir = root+'/'+ datestring + randomstr + '_'+srcfile;
var dstfile = dstdir + '/' + name+'.m3u8';

if(!fs.existsSync(root)) {
	fs.mkdirSync(root);
}



// Slice Methods
var MFn = NodeFFmpeg;	// [FFMpegSlice, NodeFFmpeg]



// Slice!
fs.exists(dstdir, function(exists){
	if(exists) {
		MFn(srcfile, dstfile);
	}
	else {
		fs.mkdir(dstdir, function(err){
			if(err) {
				console.log("=============================================")
				console.log("错误：无法创建输出文件夹！")
				console.log(err)
				console.log("=============================================")
			}
			else {
				MFn(srcfile, dstfile);
			}
		})
	}
})
