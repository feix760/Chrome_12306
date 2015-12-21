# 12306 Chrome插件

# 开发

使用[fis3](http://fis.baidu.com/fis3/docs/beginning/intro.html)构建:

```sh
npm install -g fis3
```

之后运行:

```sh
fis3 release -w dev
```

提示某些插件未安装, 安装插件例如:

```sh
npm install -g  fis3-parser-sass
```

# 安装

chrome浏览器 -> settings -> extensions ->  load unpacked extension -> 选择`dev`目录

# 问题

-  12306登陆自动退出(非插件问题)

# doing

使用百度云ocr、百度图片自动识别验证码(`code分支`)

