const defaultAvatar = require('@/assets/image/detault-avatar.jpg')

// 根级别的 state
const state = {
  socketStatus: false,
  website_name: process.env.VUE_APP_WEBSITE_NAME,
  // 头像加载失败后的默认头像
  defaultAvatar: "this.src='" + defaultAvatar + "'",
}

export default state
