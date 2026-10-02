<template>
  <div class="wrapper">
    <UserCenterLayout>
      <div class="safe-list">
      <div class="safe-card">
        <div class="safe-icon">
          <el-icon :size="22"><Key /></el-icon>
        </div>
        <div class="safe-body">
          <p class="safe-title">登录密码</p>
          <p class="safe-desc">互联网账号存在被盗风险，建议您定期更改密码以保护账户安全。</p>
        </div>
        <el-button @click="modifyPwd">修改密码</el-button>
      </div>

      <div class="safe-card safe-card-connect">
        <div class="safe-card-main">
          <div class="safe-icon">
            <el-icon :size="22"><Link /></el-icon>
          </div>
          <div class="safe-body">
            <p class="safe-title">第三方账户绑定</p>
            <p class="safe-desc">绑定后可使用第三方账号快捷登录。</p>
          </div>
          <el-button v-if="!isBound(wechatConnect.type)" type="primary" @click="openBindModal(wechatConnect)">绑定</el-button>
          <el-button v-else @click="confirmUnbind(wechatConnect)">解绑</el-button>
        </div>
        <div class="connect-row">
          <span class="connect-name">{{ wechatConnect.label }}</span>
          <span class="connect-status" :class="{ 'is-bound': isBound(wechatConnect.type) }">
            {{ isBound(wechatConnect.type) ? "已绑定" : "未绑定" }}
          </span>
          <el-skeleton v-if="connectLoading" animated class="connect-skeleton" />
        </div>
      </div>
      </div>
    </UserCenterLayout>

    <el-dialog
      v-model="bindModalVisible"
      title="绑定第三方账户"
      :close-on-click-modal="false"
      @closed="resetBindForm"
    >
      <el-form label-width="110px">
        <el-form-item label="类型">
          <el-input v-model="bindForm.typeLabel" disabled />
        </el-form-item>

        <el-form-item v-if="bindForm.type === 'WECHAT'" label="公众号二维码">
          <div class="wechatQrBox">
            <div class="wechatQrImgBox">
              <el-skeleton fix v-if="qrCodeLoading"></el-skeleton>
              <img v-if="qrCodeSrc" class="wechatQrImg" :src="qrCodeSrc" alt="微信公众号二维码" />
              <div v-else class="wechatQrEmpty">二维码获取失败，请刷新重试</div>
            </div>
            <div class="wechatQrActions">
              <el-button :loading="qrCodeLoading" @click="fetchWechatQrCode">刷新二维码</el-button>
              <el-button type="primary" :loading="bindSubmitLoading" @click="submitBind">我已完成绑定</el-button>
            </div>
            <div class="wechatQrTip">请使用微信扫码关注/授权，完成后点击“我已完成绑定”检测绑定状态</div>
          </div>
        </el-form-item>

        <el-form-item v-if="bindForm.type !== 'WECHAT'" label="OpenID/UnionID">
          <el-input v-model="bindForm.unionID" placeholder="请输入 OpenID/UnionID" />
        </el-form-item>
      </el-form>

      <template v-if="bindForm.type !== 'WECHAT'" #footer>
        <el-button @click="bindModalVisible = false">取消</el-button>
        <el-button type="primary" :loading="bindSubmitLoading" @click="submitBind">
          {{ bindModalOkText }}
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script>
import { Message, Modal } from "@/utils/message";
import { Key, Link } from '@element-plus/icons-vue';
// import { getPwdStatus } from '@/api/account';
import storage from '@/plugins/storage'
import { bindThirdAccount, getThirdAccountBindList, getWechatH5QrCode, unbindThirdAccount } from '@/api/login.js'
export default {
  components: { Key, Link },
  name: 'AccountSafe',
  data () {
    return {
      pwdStatus: '',
      connectLoading: false,
      bindModalVisible: false,
      bindSubmitLoading: false,
      connectBoundTypes: [],
      thirdAccountTypes: [
        { type: 'WECHAT', label: '微信' }
      ],
      qrCodeLoading: false,
      qrCodeBase64: '',
      bindForm: {
        type: '',
        typeLabel: '',
        unionID: ''
      }
    }
  },
  computed: {
    wechatConnect () {
      return this.thirdAccountTypes[0]
    },
    qrCodeSrc () {
      if (!this.qrCodeBase64) return ''
      if (this.qrCodeBase64.startsWith('data:image')) return this.qrCodeBase64
      return `data:image/png;base64,${this.qrCodeBase64}`
    },
    bindModalOkText () {
      if (this.bindForm.type === 'WECHAT') return '我已完成绑定'
      return '确定'
    }
  },
  mounted () {
    this.getPwdStatus()
    this.refreshConnectBinds()
  },
  methods: {
    // 设置支付密码
    goModifyPwd () {
      this.$router.push({name: 'ModifyPwd', query: { status: 2 }})
    },
    modifyPwd () { // 修改密码
      this.$router.push({name: 'ModifyPwd', query: { status: 1 }})
    },
    // 获取密码状态
    getPwdStatus () {},
    // getPwdStatus () {
    //   getPwdStatus().then(res => {
    //     if (res) {
    //       this.pwdStatus = '修改密码'
    //     } else {
    //       this.pwdStatus = '设置密码'
    //     }
    //   });
    // }
    isBound (type) {
      return this.connectBoundTypes.includes(type)
    },
    refreshConnectBinds () {
      this.connectLoading = true
      return getThirdAccountBindList()
        .then(res => {
          if (res && res.success) {
            this.connectBoundTypes = Array.isArray(res.result) ? res.result : []
          }
        })
        .finally(() => {
          this.connectLoading = false
        })
    },
    openBindModal (item) {
      this.bindForm.type = item.type
      this.bindForm.typeLabel = item.label
      this.bindForm.unionID = ''
      this.qrCodeBase64 = ''
      this.bindModalVisible = true
      if (item.type === 'WECHAT') {
        this.fetchWechatQrCode()
      }
    },
    resetBindForm () {
      this.bindForm.type = ''
      this.bindForm.typeLabel = ''
      this.bindForm.unionID = ''
      this.qrCodeLoading = false
      this.qrCodeBase64 = ''
      this.bindSubmitLoading = false
    },
    fetchWechatQrCode () {
      if (this.bindForm.type !== 'WECHAT') return
      const rawUserInfo = storage.getItem('userInfo')
      const userInfo = rawUserInfo ? JSON.parse(rawUserInfo) : null
      const userId = userInfo && userInfo.id ? String(userInfo.id) : ''
      if (!userId) {
        this.qrCodeBase64 = ''
        Message.error('未获取到当前用户ID，请重新登录后重试')
        return
      }
      this.qrCodeLoading = true
      getWechatH5QrCode({ scene: userId })
        .then(res => {
          if (res && res.success) {
            this.qrCodeBase64 = res.result || ''
            return
          }
          this.qrCodeBase64 = ''
          Message.error((res && res.message) || '二维码获取失败')
        })
        .catch(() => {
          this.qrCodeBase64 = ''
        })
        .finally(() => {
          this.qrCodeLoading = false
        })
    },
    submitBind () {
      if (this.bindSubmitLoading) return
      if (this.bindForm.type === 'WECHAT' && !this.bindForm.unionID) {
        this.bindSubmitLoading = true
        this.refreshConnectBinds()
          .then(() => {
            if (this.isBound(this.bindForm.type)) {
              Message.success('绑定成功')
              this.bindModalVisible = false
              this.resetBindForm()
              return
            }
            Message.warning('暂未检测到绑定，请扫码后重试')
            this.$nextTick(() => {
              this.bindModalVisible = true
            })
          })
          .finally(() => {
            this.bindSubmitLoading = false
          })
        return
      }
      if (!this.bindForm.type) {
        Message.error('绑定类型不能为空')
        return
      }
      if (!this.bindForm.unionID) {
        Message.error('OpenID/UnionID 不能为空')
        this.$nextTick(() => {
          this.bindModalVisible = true
        })
        return
      }

      this.bindSubmitLoading = true
      bindThirdAccount({ unionID: this.bindForm.unionID, type: this.bindForm.type })
        .then(() => {
          Message.success('绑定成功')
          this.bindModalVisible = false
          this.resetBindForm()
          this.refreshConnectBinds()
        })
        .finally(() => {
          this.bindSubmitLoading = false
        })
    },
    confirmUnbind (item) {
      Modal.confirm({
        title: '解绑确认',
        content: `<p>确定解绑 ${item.label} 吗？</p>`,
        onOk: () => {
          unbindThirdAccount({ type: item.type }).then(() => {
            Message.success('解绑成功')
            this.refreshConnectBinds()
          })
        }
      })
    }
  }
}
</script>

<style scoped lang="scss">
  .safe-list {
    display: flex;
    flex-direction: column;
    gap: 12px;
    padding-top: 4px;
  }

  .safe-card,
  .safe-card-main {
    display: flex;
    align-items: center;
    gap: 16px;
  }

  .safe-card {
    padding: 20px;
    border: 1px solid #f0f0f0;
    border-radius: 8px;
  }

  .safe-card-connect {
    display: block;
    padding: 0;
  }

  .safe-card-main {
    padding: 20px 20px 16px;
  }

  .safe-icon {
    flex-shrink: 0;
    width: 48px;
    height: 48px;
    border-radius: 8px;
    background: #fff5f4;
    color: $theme_color;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .safe-body {
    flex: 1;
    min-width: 0;
  }

  .safe-title {
    margin: 0;
    color: #171A26;
    font-size: 16px;
    font-weight: 600;
    line-height: 24px;
  }

  .safe-desc {
    margin: 6px 0 0;
    color: #999;
    font-size: 13px;
    line-height: 20px;
  }

  .connect-row {
    position: relative;
    display: flex;
    align-items: center;
    gap: 10px;
    margin: 0 20px 16px 84px;
    padding-top: 12px;
    border-top: 1px solid #f5f5f5;
  }

  .connect-name {
    color: #171A26;
    font-size: 14px;
    line-height: 22px;
  }

  .connect-status {
    height: 22px;
    padding: 0 8px;
    border-radius: 4px;
    background: #f5f5f5;
    color: #999;
    font-size: 12px;
    line-height: 22px;
  }

  .connect-status.is-bound {
    background: #f0faf3;
    color: #1f9d55;
  }

  .connect-skeleton {
    width: 120px;
    height: 22px;
  }

  .wechatQrBox {
    width: 100%;
  }

  .wechatQrImgBox {
    position: relative;
    width: 180px;
    height: 180px;
    border: 1px solid $border_color;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #fff;
  }

  .wechatQrImg {
    width: 168px;
    height: 168px;
    object-fit: contain;
  }

  .wechatQrEmpty {
    color: $light_sub_color;
    font-size: 14px;
    text-align: center;
    padding: 0 8px;
  }

  .wechatQrActions {
    margin-top: 10px;
    display: flex;
    gap: 10px;
  }

  .wechatQrTip {
    margin-top: 10px;
    color: $light_sub_color;
    font-size: 14px;
    line-height: 1.6;
  }
</style>
