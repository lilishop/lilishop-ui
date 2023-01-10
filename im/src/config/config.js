export default {
  WEBSITE_NAME: process.env.VUE_APP_WEBSITE_NAME || "LiLi IM",
  BASE_API_URL: process.env.VUE_APP_API_BASE_URL || "",
  BASE_WS_URL: process.env.VUE_APP_WEB_SOCKET_URL || "",
  BASE_COMMON: process.env.VUE_APP_COMMON || "",
  PC_URL: process.env.VUE_APP_PC_URL || "https://pc-b2b2c.pickmall.cn",
  STORE_URL: process.env.VUE_APP_PC_ORDER_URL || "http://192.168.0.139:8000/",
  PC_STORE_GOODS: process.env.VUE_APP_PC_STORE_ORDER_URL || '',
  PC_STORE_ORDER: process.env.VUE_APP_PC_STORE_ORDER || '',
  PC_USER_ORDER: process.env.VUE_APP_PC_USER_ORDER || '',
};
