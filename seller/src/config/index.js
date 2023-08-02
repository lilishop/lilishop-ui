
module.exports = {
  title: "lilishop", //配置显示在浏览器标签的title
  /**
   * 高德地图申请链接
   * https://lbs.amap.com/api/javascript-api/guide/abc/prepare
   * 添加成功后，可获取到key值和安全密钥jscode（自2021年12月02日升级，升级之后所申请的 key 必须配备安全密钥 jscode 一起使用)
   */
  //FIXME 请检查当前高德key创建的日期，如果2021年12月02日之前申请的 无需填写安全密钥
  aMapSecurityJsCode: "2bd0fbf621881f4c77be74f0e76495f3", // 高德web端js申请的安全密钥
  aMapKey: "7f11113750315d8543daaf5c3ba353ca", //高德web端js申请的api key
  website: "https://www.pickmall.cn", //官网地址
  aMapSwitch:false, //是否开启高德定位
  enableCDN: true, //生产环境 是否启用cdn加载 vue等js
  port: 10002, //端口
  inputMaxLength: "140", //全局输入框默认最大输入长度字
  /**
   * 如需更换主题请修改此处以及theme.less中修改
   */
  mainColor: "#ff5c58", //主题色
  setting: {
    isUseTabsRouter: true, //多标签Tab页模式
  },
};
