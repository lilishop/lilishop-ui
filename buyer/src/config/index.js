module.exports = {
  title: "lili-shop", //配置显示在浏览器标签的title、底部信息、部分信息展示的值
  icpCard: "", // icp证
  company: {
    href: "https://pickmall.cn",
    name: "北京宏业汇成科技有限公司",
  }, //公司信息
  icpMessage: "京ICP备20009696号-1", //icp备案
  /**
   * 高德地图申请链接
   * https://lbs.amap.com/api/javascript-api/guide/abc/prepare
   * 添加成功后，可获取到key值和安全密钥jscode（自2021年12月02日升级，升级之后所申请的 key 必须配备安全密钥 jscode 一起使用)
   * 如果是2021年12月02日之后的需要在main.js中添加如下代码
   * window._AMapSecurityConfig = {
   *   securityJsCode:'您申请的安全密钥',
   * }
   *
   * 如果2021年12月02日之前申请的无视上面代码
   */
  aMapKey: "b440952723253aa9fe483e698057bf7d", //高德web端申请的api key
  enableCDN: false, //生产环境 是否启用cdn加载 vue等js
  port: 10000, //端口
};
