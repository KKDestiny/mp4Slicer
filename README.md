# Mp4Slicer
Slice a mp4 file into .m3u8

This tool provides two methods to slice:
+ use ffmpeg command directly through `child_process` module
+ use fluent-ffmpeg (github: [https://github.com/fluent-ffmpeg/node-fluent-ffmpeg](https://github.com/fluent-ffmpeg/node-fluent-ffmpeg))

You can choose one of these tools where the parameter `MFn` defines.

---

# Installation

To use fluent-ffmpeg, you need to install it first:

```
npm install fluent-ffmpeg
```

---

# Begin

I provide a demo video file "abc.mp4", so just begin slice with command:

```
node start
```

and you will find sliced files and `.m3u8` file in `/slice/xxxxx/`




