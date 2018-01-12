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

依靠[百度云-文字识别](http://ai.baidu.com/tech/ocr)和[百度图片](http://image.baidu.com/)

[点击获取](https://console.bce.baidu.com/ai/?_=1515743332854#/ai/ocr/app/list) `百度云-文字识别` appId/appKey/appSecret, 填入抢票页面中(url默认)

TODO: 正确率还需要进一步提高

## 问题

- 12306登陆自动退出(非插件问题)

## 加入我们

- `git push`

