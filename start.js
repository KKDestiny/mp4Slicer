/**
 * @Name	 : Slice a MP4 File
 * @Module	 : FFMPEG operation
 * @Author	 : Linxiaozhou
 * @Date	 : 2017.07.07
 */

	var fs = require('fs');
	var archiver = require('archiver');


	// child_process
	var FFMpegSlice = function(_srcfile, _dstfile, _dstdir, _dstdir_pkg) {
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
				
				// 打包
				console.log("使用[Archiver]对切片文件进行打包...")
				var zip_file_path = _dstdir_pkg + '/' + _srcfile+'.zip';
				var sliced_files_path = _dstdir;
				PackageFiles(zip_file_path, sliced_files_path, function() {
					console.log("=============================================")
					console.log("[Archiver]打包完毕！")
					console.log("  |- 切片文件位置为：["+sliced_files_path+"]")
					console.log("  |- 打包文件位置为：["+zip_file_path+"]")
					console.log("=============================================")
				})
			}
		});
	}



	// NodeFFmpeg
	var NodeFFmpeg = function(_srcfile, _dstfile, _dstdir, _dstdir_pkg) {
		var ffmpeg = require('fluent-ffmpeg');
		console.log("=============================================")
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
				
				// 打包
				console.log("使用[Archiver]对切片文件进行打包...")
				var zip_file_path = _dstdir_pkg + '/' + _srcfile+'.zip';
				var sliced_files_path = _dstdir;
				PackageFiles(zip_file_path, sliced_files_path, function() {
					console.log("=============================================")
					console.log("[Archiver]打包完毕！")
					console.log("  |- 原数据位置为：["+sliced_files_path+"]")
					console.log("  |- zip文件位置为["+zip_file_path+"]")
					console.log("=============================================")
				})
			})
			.save(_dstfile);

	}

	/* 对切片的所有文件进行打包 */
	var PackageFiles = function(_zip_file_path, _sliced_files_path, callback) {
		// 打包
		var output = fs.createWriteStream(_zip_file_path);
		var archive = archiver('zip', {
			zlib: { level: 9 } // Sets the compression level.
		});
		// listen for all archive data to be written
		output.on('close', function() {
		  if(callback) {
			callback();
		  }
		  else {
			console.log(archive.pointer() + ' total bytes');
			console.log('archiver has been finalized and the output file descriptor has closed.');
		  }
		});

		// good practice to catch warnings (ie stat failures and other non-blocking errors)
		archive.on('warning', function(err) {
		  if (err.code === 'ENOENT') {
			  // log warning
		  } else {
			  // throw error
			  console.log(err)
		  }
		});

		// good practice to catch this error explicitly
		archive.on('error', function(err) {
			console.log(err)
		});

		// pipe archive data to the file
		archive.pipe(output);

		// append files from a sub-directory, putting its contents at the root of archive
		archive.directory(_sliced_files_path+'/', false);

		// finalize the archive (ie we are done appending files but streams have to finish yet)
		archive.finalize();
	}



	// Prepare
	var dobj = new Date();
	var month = dobj.getMonth()+1;
	var date = dobj.getDate();
	var datestring = dobj.getFullYear()+""+(month<10?"0"+month:month)+""+(date<10?"0"+date:date)
	var randomstr = parseInt(Math.random()*10000)

	var srcfile = 'cahors.mp4';
	var name = srcfile.split('.')[0];

	// 切片目录
	var root = 'slice';
	var dstdir = root+'/'+ datestring + randomstr + '_'+srcfile;
	var dstfile = dstdir + '/' + name+'.m3u8';
	if(!fs.existsSync(root)) {
		fs.mkdirSync(root);
	}
	if(!fs.existsSync(dstdir)) {
		fs.mkdirSync(dstdir);
	}

	// 打包目录
	var root_pkg = 'package';
	var dstdir_pkg = root_pkg+'/'+ datestring + randomstr + '_'+srcfile;
	if(!fs.existsSync(root_pkg)) {
		fs.mkdirSync(root_pkg);
	}
	if(!fs.existsSync(dstdir_pkg)) {
		fs.mkdirSync(dstdir_pkg);
	}


	// Slice Methods
	var MFn = NodeFFmpeg;	// [FFMpegSlice, NodeFFmpeg]

	// Slice!
	MFn(srcfile, dstfile, dstdir, dstdir_pkg);
