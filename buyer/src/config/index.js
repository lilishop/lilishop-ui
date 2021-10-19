export default {
  /**
   * @description 配置显示在浏览器标签的title、底部信息、部分信息展示的值
   */
  title: "lili-shop",
  /**
   * @description icp证
   */
  icpCard: "",

  company:{
    href:"https://pickmall.cn",
    name:"北京宏业汇成科技有限公司"
  },
  /**
   * @description icp备案号
   */
  icpMessage: "京ICP备20009696号-1",
  /**
   * @description token在Cookie中存储的天数，默认1天
   */
  cookieExpires: 1,
  /**
   * @description 是否使用国际化，默认为false
   *              如果不使用，则需要在路由中给需要在菜单中展示的路由设置meta: {title: 'xxx'}
   *              用来在菜单中显示文字
   */
  useI18n: false,
  /**
   * @description 高德web端申请的api key
   */
  aMapKey: "b440952723253aa9fe483e698057bf7d",
  /**
   * @description 需要加载的插件
   */
  plugin: {
    "error-store": {
      showInHeader: true, // 设为false后不会在顶部显示错误日志徽标
      developmentOff: true // 设为true后在开发环境不会收集错误信息，方便开发中排查错误
    }
  }
};
