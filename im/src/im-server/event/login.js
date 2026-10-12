import Base from './base'
import { useNotifyStore } from '@/stores/notify'

/**
 * 好友状态事件
 */
class Login extends Base {
  /**
   * @var resource 资源
   */
  resource

  /**
   * 初始化构造方法
   *
   * @param {Object} resource Socket消息
   */
  constructor(resource) {
    super()

    this.resource = resource
  }

  handle() {
    useNotifyStore().ACT_UPDATE_FRIEND_STATUS({
      status: this.resource.status,
      friend_id: parseInt(this.resource.user_id),
    })
  }
}

export default Login
