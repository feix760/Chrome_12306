# 12306 Chrome插件, 已实现验证码自动识别

## 开发

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

## 验证码自动识别

依靠[百度云ocr](http://bce.baidu.com/solution/image.html)和[百度图片](http://image.baidu.com/)

`百度云ocr`需要用户认证信息(现阶段使用免费), 使用步骤如下: 

- 注册
- 实名认证
- [控制台](https://console.bce.baidu.com/?_=1450796271208#/index/overview)开通`对象存储 BOS`服务
- 获取`ak`(access key)和`sk`(secret key), 填入抢票页面中(url默认)

### 启动识图服务

识图服务不在`Chrome`中运行, 换用`node`服务, 进入目录

```sh
npm install
node app.js
```

## 安装

Chrome浏览器 -> settings -> extensions ->  load unpacked extension -> 选择`dev`目录(参考`开发`生成)

## 问题

- 12306登陆自动退出(非插件问题)

## 加入我们

- `git push`

