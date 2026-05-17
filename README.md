## Lilishop B2B2C商城系统


#### PS： **演示站点所有环境均部署master分支。如果有演示站点问题，可以反馈，如果演示站点没问题本地运行有问题，需自行处理** 

-   **[在线客服](https://work.weixin.qq.com/kfid/kfc4d8dc24a73c15f44)**
-   **微信交流1群（已满）**
-   **微信交流2群**:
    ![微信群](https://lilishop-wechat.oss-cn-beijing.aliyuncs.com/wechat.jpg)

##### 体验 公众号/小程序/APP 体验，扫描二维码

![image-20210511171611793](https://static.pickmall.cn/images/h5-qrcode.png)

[![star](https://gitee.com/beijing_hongye_huicheng/lilishop/badge/star.svg?theme=dark)](https://gitee.com/beijing_hongye_huicheng/lilishop/stargazers)
&nbsp;&nbsp;![github](https://img.shields.io/github/stars/hongyehuicheng/lilishop.svg?style=social&logo=#181717)

## 2025-10-10日更新
兼容更高的node版本16

这里我用的是node版本 v16.20.2

npm版本 8.19.4

使用yarn install 然后执行 yarn dev

yarn 安装/启动
```
// 如果没有 yarn 安装yarn
npm install yarn -g

// 切换源
yarn config set registry https://registry.npmmirror.com

// 以buyer项目为例
cd buyer

yarn install

yarn dev
```




没有二开过的项目直接拉最新代码即可，二开项目可以跟着提交记录一起同步修改 install出现问题检查的话删除 "package-lock.json" 重新install

Q&A 为什么不升级更高的node版本？ :因为高node版本 OpenSSL 改动 导致旧版本 Webpack 插件会失效 试了好几次如果兼容的话 需要升级Webpack5以及其他的插件 升级内容较多 为了更稳定的还是尽量少动为主

****


## 如何在本地环境运行lilishop-ui部署视频
https://www.bilibili.com/video/BV1B28EeJEnP/

## 如何在服务器上部署lilishop-ui
https://www.bilibili.com/video/BV1WD87eoE9F/


## 开发项目

#### 安装Node.js

保证`node`版本`14`,推荐 14.17.0

2025-10-10日拉的代码之后不限制于node版本为14，这里只是以14版本为例子

可以使用 `yarn` 或者 `npm` 进行安装

#### yarn 安装/启动
```
// 如果没有 yarn 安装yarn
npm install yarn -g

// 切换源
yarn config set registry https://registry.npmmirror.com

// 以buyer项目为例
cd buyer

yarn install

yarn dev
```


#### FAQ

##### npmmirror镜像源报错 451 Unavailable For Legal Reasons
```
//切换其他的镜像源

// npm
npm config set registry http://mirrors.cloud.tencent.com/npm/

// yarn
yarn config set registry http://mirrors.cloud.tencent.com/npm/
```

##### 安装不上去

可以按照这个思路排查一下

```
1. 看下Node.js 是否是14.17.0
2. 项目目录下是否有 package-lock.json 或者 .npmrc 或者 .yarnrc 设置了镜像源， 如果有可以删除重新install
3. 切换当前 npm 或者 yarn 镜像源重试
```


### 商城介绍
**官网**：https://pickmall.cn

Lilishop商城系统支持商家入驻，后端基于SpringBoot 研发，前端使用 Vue、uniapp开发， **系统全端全部代码开源**

前后端分离，支持分布式部署，支持Docker，各个API独立，并且有独立的消费者。

### 商城 API/消费者 聚合版
api不需要单独部署，只需启动一个jar包就可以正常运转 如有需要，可以点击跳转
https://gitee.com/beijing_hongye_huicheng/lilishop-simplify

### 开发/使用/常见问题 帮助文档

https://docs.pickmall.cn

### 项目地址

gitee : https://gitee.com/beijing_hongye_huicheng

github 镜像: https://github.com/lilishop?tab=repositories

商城UI 项目下3个文件夹 
buyer：买家PC端，seller：商家端，manager：后台管理端


### 演示地址
PS：手机验证码为 ‘111111’

**平台管理端**：https://admin-b2b2c.pickmall.cn 账号：admin/123456

**店铺管理端**：https://store-b2b2c.pickmall.cn 账号：13011111111/111111

**商城PC页面**：https://pc-b2b2c.pickmall.cn

**商城 小程序/公众号/APP**：扫描二维码

![image-20210511171611793](https://static.pickmall.cn/images/h5-qrcode.png)

### 快速本地部署

[点击跳转](https://docs.pickmall.cn/deploy/%E8%BF%90%E8%A1%8C%E7%8E%AF%E5%A2%83%E5%87%86%E5%A4%87.html)

**商城数据库**
使用docker-compose部署数据库，自动初始化数据库，不需要手动下载等操作

如果手动部署，才需要获取sql [点击跳转](https://gitee.com/beijing_hongye_huicheng/docker/tree/master/init/mysql) （PS：这里有与tag版本一致的sql，如果是历史版本，则docker项目也切换至历史版本获取sql即可，历史版本升级则根据java相聚的根目录DB目录下的升级sql，按需执行）。



### 功能列表



#### 平台管理端功能

![平台管理端功能](https://static.pickmall.cn/images/other/managerList1.jpg)



#### 卖家功能

![商家端功能](https://static.pickmall.cn/images/other/storeList.jpg)


### 商城前端功能展示

#### 商城移动端

<img src="https://static.pickmall.cn/images/other/app.gif" alt="移动端功能展示" style="zoom:50%;" />

#### 平台管理端

![管理端功能展示](https://static.pickmall.cn/images/other/manager.gif)


### 技术选型

#### 架构图

![技术选型](https://lili-system.oss-cn-beijing.aliyuncs.com/docs/%E6%9E%B6%E6%9E%84.png)

##### 后台技术选型

| 说明           | 框架            | 说明           |               |
| -------------- | --------------- | -------------- | ------------- |
| 基础框架       | Spring Boot     | MVC框架        | Spring MVC    |
| 持久框架       | Mybatis-Plus    | 程序构建       | Maven         |
| 关系型数据库   | MySQL           | 消息中间件AMQP | RocketMQ      |
| 缓存           | Redis +MongoDB  | 搜索引擎       | Elasticsearch |
| 安全框架       | Spring Security | 数据库连接池   | Druid         |
| 数据库分库分表 | sharding        | 定时任务       | xxl-job       |
| 负载均衡       | Nginx           | 静态资源       | 阿里云OSS     |
| 短信           | 阿里云短信      | 认证           | JWT           |
| 日志处理       | Log4j           | 接口规范       | RESTful       |

##### 前端-运营后台、店铺后台

| 说明       | 框架       | 说明       | 框架    |
| ---------- | ---------- | ---------- | ------- |
| 构建工具   | webpack    | JS版本     | ES6     |
| 基础JS框架 | Vue.js     | 视频播放器 | Dplayer |
| 路由管理   | Vue Router | 状态管理   | Vuex    |
| 基础UI库   | iView      | UI界面基于 | iView   |
| 网络请求   | axios      |            |         |

##### 前端-移动端

| 说明      | 架构    | 说明     | 架构    |
| --------- | ------- | -------- | ------- |
| 基础UI库  | uViewui | 基础框架 | uni-app |
| CSS预处理 | scss    | 地图引擎 | amap    |

### 版本升级

```
系统后续会提供多场景解决方案。
更多架构：微服务、Saas、中台等，都会支持。 支持差价升级商业授权
```

### 商业授权
商业版本与开源版本代码一致，没有区分

商业使用需要授权，授权方式可选择联系官网客服，或者qq群联系群主。

商业授权模式为永久授权，支持永久升级。

商业案例由于涉及部分多层二开关系，如需了解可以咨询销售。


### 开源须知
1.仅允许用于个人学习研究使用.

2.禁止将本开源的代码和资源进行任何形式任何名义的出售.

3.软件受国家计算机软件著作权保护（登记号：2021SR0805085）。

4.限制商用，如果需要商业使用请联系我们。QQ3409056806.或者加入qq群联系群主。

### 附录
有人有自己的学习视频、学习记录文档、希望宣传关联开源项目等均可以私聊仓库所有者。

类似：

清晨敲代码同学的分析: https://blog.csdn.net/vaevaevae233/category_12103567.html
