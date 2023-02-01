export default {
  WEBSITE_NAME: process.env.VUE_APP_WEBSITE_NAME || "LiLi IM",
  BASE_API_URL: process.env.VUE_APP_API_BASE_URL || "",
  BASE_WS_URL: process.env.VUE_APP_WEB_SOCKET_URL || "",
  BASE_COMMON: process.env.VUE_APP_COMMON || "",
  BASE_BUYER: process.env.VUE_APP_BUYER || "",
  BASE_SELLER: process.env.VUE_APP_SELLER || "",
  PC_URL: process.env.VUE_APP_PC_URL || "https://pc-b2b2c.pickmall.cn",
  PC_STORE: process.env.VUE_APP_PC_STORE || 'https://store-b2b2c.pickmall.cn',
};
