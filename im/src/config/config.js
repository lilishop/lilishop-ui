/**
 * ==============================================================================
 * 全局业务配置文件
 * ==============================================================================
 * 
 * 说明：
 * 1. 本文件整合并导出了项目运行所需的全局配置参数，统一由环境变量 process.env 读取。
 * 2. 环境变量定义在项目根目录下的 .env（生产）与 .env.development（开发）文件中。
 * 3. 只有以 VUE_APP_ 开头的环境变量才会被 Vue CLI 编译并暴露给前端客户端代码。
 * 4. 修改 .env 或 .env.development 文件后，必须重新启动开发服务或重新打包构建方可生效。
 * 
 * 核心配置项包含：
 * - 站点名称
 * - 后端 IM 服务 API 接口与 WebSocket 实时通讯地址
 * - 买家端/商家端跨系统接口基准地址
 * - PC 端前台商城与商家端管理后台的外链跳转地址
 */
export default {
  /**
   * 站点/系统标题名称
   * 用于页面 document.title 设置及系统头部品牌展示
   * 默认值: "LiLi IM"
   */
  WEBSITE_NAME: process.env.VUE_APP_WEBSITE_NAME || "LiLi IM",

  /**
   * IM 专属后端 HTTP API 接口基准请求地址
   * 用于 Axios 请求实例 (如获取会话历史、发送单聊/群聊富文本、撤回消息、好友列表等)
   * 对应环境变量: VUE_APP_API_BASE_URL
   */
  BASE_API_URL: process.env.VUE_APP_API_BASE_URL || "",

  /**
   * IM 实时通讯 WebSocket 连接基准地址
   * 用于前端与后端建立长连接，实时收发在线聊天消息、输入状态提示、系统通知等
   * 
   * 【重要提示】协议选用原则：
   * - 本地开发/联调环境（无 SSL 证书）必须使用 "ws://" 协议（如 ws://127.0.0.1:8885/lili/webSocket），切勿写成 wss:// 导致握手失败！
   * - 生产/线上环境配置了 HTTPS/SSL 证书时，必须使用 "wss://" 协议（如 wss://im-api.pickmall.cn/lili/webSocket）
   * 
   * 对应环境变量: VUE_APP_WEB_SOCKET_URL
   */
  BASE_WS_URL: process.env.VUE_APP_WEB_SOCKET_URL || "",

  /**
   * 买家端 (Buyer) 接口基准地址
   * 用于在聊天窗口中查询买家用户信息、买家端商品详情、买家订单卡片数据等
   * 对应环境变量: VUE_APP_BUYER
   */
  BASE_BUYER: process.env.VUE_APP_BUYER || "",

  /**
   * 商家端/卖家端 (Seller) 接口基准地址
   * 用于获取当前店铺信息、客服坐席列表、商家端关联配置等
   * 对应环境变量: VUE_APP_SELLER
   */
  BASE_SELLER: process.env.VUE_APP_SELLER || "",

  /**
   * PC 买家端商城首页/商品详情页面跳转基准前缀
   * 当用户在聊天窗口中点击商品链接或商品卡片时，在新窗口打开对应的商城商品详情页
   * 默认值: "https://pc-b2b2c.pickmall.cn"
   * 对应环境变量: VUE_APP_PC_URL
   */
  PC_URL: process.env.VUE_APP_PC_URL || "https://pc-b2b2c.pickmall.cn",

  /**
   * PC 商家管理后台跳转基准前缀
   * 当客服人员在聊天面板中点击买家咨询的订单卡片时，跳转至商家管理后台对应的订单详情页
   * 默认值: "https://store-b2b2c.pickmall.cn"
   * 对应环境变量: VUE_APP_PC_STORE
   */
  PC_STORE: process.env.VUE_APP_PC_STORE || "https://store-b2b2c.pickmall.cn",
};
