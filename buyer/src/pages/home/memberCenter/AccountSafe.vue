<template>
  <div class="wrapper">
    <card _Title="账户安全"/>
    <div class="safeList">
      <!-- 密码 -->
      <Row class="safeItem">
        <Col :span="2">
          <Icon size="40" type="md-key"/>
        </Col>
        <Col :span="16">
          <div class="setDivItem">登录密码</div>
          <div class="setDivItem theme">互联网账号存在被盗风险，建议您定期更改密码以保护账户安全。</div>
        </Col>
        <Col :span="4">
          <Button @click="modifyPwd">修改密码</Button>
        </Col>
      </Row>

      <Row class="safeItem">
        <Col :span="2">
          <Icon size="40" type="md-link" />
        </Col>
        <Col :span="16">
          <div class="setDivItem">第三方账户绑定</div>
          <div class="setDivItem theme">绑定后可使用第三方账号快捷登录。</div>
          <div class="connectList">
            <div class="connectRow">
              <div class="connectRowLeft">
                <span class="connectName">{{ wechatConnect.label }}</span>
                <Tag v-if="isBound(wechatConnect.type)" color="success">已绑定</Tag>
                <Tag v-else>未绑定</Tag>
              </div>
            </div>
            <Spin size="large" fix v-if="connectLoading"></Spin>
          </div>
        </Col>
        <Col :span="4">
          <Button v-if="!isBound(wechatConnect.type)" type="primary" @click="openBindModal(wechatConnect)">绑定</Button>
          <Button v-else @click="confirmUnbind(wechatConnect)">解绑</Button>
        </Col>
      </Row>
    </div>

    <Modal
      v-model="bindModalVisible"
      title="绑定第三方账户"
      :mask-closable="false"
      :footer-hide="bindForm.type === 'WECHAT'"
      :ok-text="bindModalOkText"
      :loading="bindSubmitLoading"
      @on-ok="submitBind"
      @on-cancel="resetBindForm"
    >
      <Form :label-width="110">
        <FormItem label="类型">
          <Input v-model="bindForm.typeLabel" disabled />
        </FormItem>

        <FormItem v-if="bindForm.type === 'WECHAT'" label="公众号二维码">
          <div class="wechatQrBox">
            <div class="wechatQrImgBox">
              <Spin fix v-if="qrCodeLoading"></Spin>
              <img v-if="qrCodeSrc" class="wechatQrImg" :src="qrCodeSrc" alt="微信公众号二维码" />
              <div v-else class="wechatQrEmpty">二维码获取失败，请刷新重试</div>
            </div>
            <div class="wechatQrActions">
              <Button @click="fetchWechatQrCode">刷新二维码</Button>
              <Button type="primary" @click="submitBind">我已完成绑定</Button>
            </div>
            <div class="wechatQrTip">请使用微信扫码关注/授权，完成后点击“我已完成绑定”检测绑定状态</div>
          </div>
        </FormItem>

        <FormItem v-if="bindForm.type !== 'WECHAT'" label="OpenID/UnionID">
          <Input v-model="bindForm.unionID" placeholder="请输入 OpenID/UnionID" />
        </FormItem>
      </Form>
    </Modal>
  </div>
</template>

<script>
// import { getPwdStatus } from '@/api/account';
import storage from '@/plugins/storage'
import { bindThirdAccount, getThirdAccountBindList, getWechatH5QrCode, unbindThirdAccount } from '@/api/login.js'
export default {
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
        this.$Message.error('未获取到当前用户ID，请重新登录后重试')
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
          this.$Message.error((res && res.message) || '二维码获取失败')
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
              this.$Message.success('绑定成功')
              this.bindModalVisible = false
              this.resetBindForm()
              return
            }
            this.$Message.warning('暂未检测到绑定，请扫码后重试')
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
        this.$Message.error('绑定类型不能为空')
        return
      }
      if (!this.bindForm.unionID) {
        this.$Message.error('OpenID/UnionID 不能为空')
        this.$nextTick(() => {
          this.bindModalVisible = true
        })
        return
      }

      this.bindSubmitLoading = true
      bindThirdAccount({ unionID: this.bindForm.unionID, type: this.bindForm.type })
        .then(() => {
          this.$Message.success('绑定成功')
          this.bindModalVisible = false
          this.resetBindForm()
          this.refreshConnectBinds()
        })
        .finally(() => {
          this.bindSubmitLoading = false
        })
    },
    confirmUnbind (item) {
      this.$Modal.confirm({
        title: '解绑确认',
        content: `<p>确定解绑 ${item.label} 吗？</p>`,
        onOk: () => {
          unbindThirdAccount({ type: item.type }).then(() => {
            this.$Message.success('解绑成功')
            this.refreshConnectBinds()
          })
        }
      })
    }
  }
}
</script>

<style scoped lang="scss">
  ::v-deep .ivu-col-span-2, .ivu-col-span-4 {
    text-align: center;
    color: $theme_color;
  }

  .theme {
    color: $theme_color;
  }

  .setDivItem {
    line-height: 1.75;
  }

  .safeItem {
    border-bottom: 1px solid $border_color;
    padding: 16px 0;

    ::v-deep .ivu-col {
      padding: 8px 0;

    }
  }

  .connectList {
    position: relative;
    margin-top: 8px;
  }

  .connectRow {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 6px 0;
  }

  .connectRowLeft {
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .connectName {
    color: $title_color;
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
    font-size: 12px;
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
    font-size: 12px;
    line-height: 1.6;
  }
</style>
