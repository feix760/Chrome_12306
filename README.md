# 12306 Chrome插件, 已实现验证码自动识别

## 开发

首先你应该具备`Web前端`和[Node](https://nodejs.org/en/)开发的能力

```sh
npm install
```

之后运行:

```sh
npm start
```

## 安装

Chrome打开[扩展程序管理页](chrome://extensions/), 勾选`开发者模式`, 点击`加载已解压的扩展程序`选择构建生成的`dist`目录

## 验证码自动识别

*现不支持使用, 需要等待升级接口*

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
node index.js
```

## 问题

- 12306登陆自动退出(非插件问题)

## 加入我们

- `git push`

