var BASE = {
  /**
   * @description api请求基础路径
   */
  API_DEV: {
<<<<<<< HEAD
    common: "http://192.168.0.102:8890",
    buyer: "https://buyer-api.pickmall.cn",
    seller: "http://192.168.0.102:8889",
    manager: "https://admin-api.pickmall.cn"
=======
    // common: "http://localhost:8890",
    // buyer: "http://localhost:8888",
    // seller: "http://localhost:8889",
    // manager: "http://localhost:8887"
    common:"http://192.168.0.113:8890",
    buyer:"http://192.168.0.113:8888",
    manager:"http://192.168.0.113:8887",
    seller:"http://192.168.0.113:8889"
>>>>>>> 32336decc6e9e0ae8a0e67033f8ca66a89bbd372
  },
  API_PROD: {
    common: "https://common-api.pickmall.cn",
    buyer: "https://buyer-api.pickmall.cn",
    seller: "https://store-api.pickmall.cn",
    manager: "https://admin-api.pickmall.cn"
  },
  /**
   * @description // 跳转买家端地址 pc端
   */
  PC_URL: "https://pc-b2b2c.pickmall.cn",
  /**
   * @description  // 跳转买家端地址 wap端
   */
  WAP_URL: "https://m-b2b2c.pickmall.cn",
  /**
   *  @description api请求基础路径前缀
   */
  PREFIX: "/store"
};
