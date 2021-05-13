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
      <!-- 邮箱 -->
      <!-- <Row class="safeItem">
        <Col :span="2">
          <Icon size="40" type="md-mail" />
        </Col>
        <Col :span="16">
          <div class="setDivItem">
            邮箱验证
          </div>
          <div class="setDivItem " v-if="true">
            您的验证邮箱：<span>xxxxx</span>
          </div>
          <div class="setDivItem " v-else>

          </div>
        </Col>
        <Col :span="4">
          <Button>修改邮箱</Button>
        </Col>
      </Row> -->
      <!-- 手机验证 -->
      <!-- <Row class="safeItem">
        <Col :span="2">
          <Icon size="40" type="ios-phone-portrait" />
        </Col>
        <Col :span="16">
          <div class="setDivItem">
            手机验证
          </div>
          <div class="setDivItem " v-if="true">
            您的手机号：<span>xxxxx</span>
          </div>
          <div class="setDivItem " v-else>

          </div>
        </Col>
        <Col :span="4">
          <Button>立即验证</Button>
        </Col>
      </Row> -->
      <!-- 支付密码 -->
      <!-- <Row class="safeItem">
        <Col :span="2">
          <Icon size="40" type="md-lock" />
        </Col>
        <Col :span="16">
          <div class="setDivItem">
            支付密码
          </div>
          <div class="setDivItem " v-if="true">
            安全认证：<span>xxxxx</span>
          </div>
          <div class="setDivItem " v-else>

          </div>
        </Col>
        <Col :span="4">
          <Button @click="goModifyPwd" v-if="pwdStatus == '设置密码'" type="error">{{pwdStatus}}</Button>
          <Dropdown style="margin-left: 20px" v-if="pwdStatus == '修改密码'" @on-click="selectPwd">
            <Button type="primary">
              修改密码
              <Icon type="ios-arrow-down"></Icon>
            </Button>
            <DropdownMenu slot="list" on-click="selectPwd">
              <DropdownItem name = "1">修改密码</DropdownItem>
              <DropdownItem name = "2">重置密码</DropdownItem>
            </DropdownMenu>
          </Dropdown>
        </Col>
      </Row> -->
      <!-- 实名 -->
      <!-- <Row class="safeItem">
        <Col :span="2">
          <Icon size="40" type="md-card" />
        </Col>
        <Col :span="16">
          <div class="setDivItem">
            实名认证
          </div>
          <div class="setDivItem " v-if="true">
            已认证：<span>xxxxx</span>
          </div>
          <div class="setDivItem " v-else>
            您还未实名认证该账户，立即实名认证可加快提现速度。
          </div>
        </Col>
        <Col :span="4">
          <Button>立即认证</Button>
        </Col>
      </Row> -->
    </div>
  </div>
</template>

<script>
import card from '@/components/card'
import {
  getPwdStatus
} from '@/api/account';
export default {
  name: 'AccountSafe',
  data () {
    return {
      pwdStatus: '' // 密码状态
    }
  },
  components: {card},
  mounted () {
    this.getPwdStatus()
  },
  methods: {
    // 设置支付密码
    goModifyPwd () {
      this.$router.push({name: 'ModifyPwd', query: { status: 2 }})
    },
    selectPwd (value) {
      this.$router.push({name: 'ModifyPwd', query: { status: value }})
    },
    modifyPwd () {
      this.$router.push({name: 'ModifyPwd', query: { status: 1 }})
    },
    // 获取密码状态
    getPwdStatus () {
      getPwdStatus().then(res => {
        if (res) {
          this.pwdStatus = '修改密码'
        } else {
          this.pwdStatus = '设置密码'
        }
      });
    }
  }
}
</script>

<style scoped lang="scss">
  /deep/ .ivu-col-span-2, .ivu-col-span-4 {
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

    /deep/ .ivu-col {
      padding: 8px 0;

    }
  }
</style>
