## 作用：

合成序列帧图片并生成对应的css、scss

## 使用方法：

1. 把包含序列帧图片的文件夹放入 input 内，如 input/test/1.png ~ 10.png

2. 命令行cd 到 image_append/ 目录下，执行 `node index.js`

程序会自动遍历input/下所有（除了_ignore_的）文件夹，并在这些文件夹里面寻找所有（除了文件名包含_max_）的png文件，自动按数字升序排序后，至上而下合并成一个png文件并压缩体积，命名为 `文件夹名_max_.png`,并生成对应的 html 和 scss

## 使用config.json

```json
{
  "step": [0,1,2,3,4,5,6,7,8,9], // 动画每帧对应的图片列表序号，从0开始数，默认是 0 ～ 图片数-1 ， 这里可以重复某些帧或跳帧如：[0,0,0,1,1,1,4,6,9,2,1]
  "rate": 1  // 每帧之间的时间间隔，单位秒，默认0.1
}

```

## (TODO)利用AEdata生成css动画

在json里加入"AEdata"项，数据是来自AE插件bodymovin输出的json，包含 translate（DONE） 、 scale（DONE） 、 rotate（DONE）、opacity（TODO）、Anchor（TODO）的变换，输出`文件夹名_max_.png_ae_.scss`。

关于AE插件bodymovin可以参考：(https://zhuanlan.zhihu.com/p/26304609)[https://zhuanlan.zhihu.com/p/26304609]


```json
{
  "step": [0,1,2,3,4,5,6,7,8,9],  
  "rate": 1,
  "AEdata" : {
  	...
  }
}

```

