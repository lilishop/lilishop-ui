<template>
  <!-- 登录消息 -->
  <div class="login-message">
    <h4>登录操作通知</h4>
    <p>登录时间：{{ datetime }} (CST)</p>
    <p>IP地址：{{ ip }}</p>
    <p>登录地点：{{ address }}</p>
    <p>登录设备：{{ platform }}</p>
    <p>异常原因：{{ reason }}</p>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { parseTime } from '@/utils/functions'

defineOptions({ name: 'LoginMessage' })

const props = defineProps({
  detail: {
    type: Object,
    required: true,
  },
})

const datetime = ref('')
const ip = ref('')
const address = ref('')
const platform = ref('')
const reason = ref('常用设备登录')

// 原 created 生命周期逻辑，setup 顶层直接执行
ip.value = props.detail.ip
datetime.value = parseTime(
  props.detail.created_at,
  '{y}年{m}月{d}日 {h}:{i}:{s}'
)
address.value = props.detail.address
reason.value = props.detail.reason

platform.value =
  getExploreName(props.detail.agent) +
  ' / ' +
  getExploreOs(props.detail.agent)

function getExploreName(userAgent = '') {
  if (userAgent.indexOf('Opera') > -1 || userAgent.indexOf('OPR') > -1) {
    return 'Opera'
  } else if (
    userAgent.indexOf('compatible') > -1 &&
    userAgent.indexOf('MSIE') > -1
  ) {
    return 'IE'
  } else if (userAgent.indexOf('Edge') > -1) {
    return 'Edge'
  } else if (userAgent.indexOf('Firefox') > -1) {
    return 'Firefox'
  } else if (
    userAgent.indexOf('Safari') > -1 &&
    userAgent.indexOf('Chrome') == -1
  ) {
    return 'Safari'
  } else if (
    userAgent.indexOf('Chrome') > -1 &&
    userAgent.indexOf('Safari') > -1
  ) {
    return 'Chrome'
  } else {
    return 'Unkonwn'
  }
}

function getExploreOs(userAgent = '') {
  if (userAgent.indexOf('Mac OS') > -1) {
    return 'Mac OS'
  } else {
    return 'Windows'
  }
}
</script>
<style lang="less" scoped>
.login-message {
  width: 300px;
  min-height: 50px;
  background: #f7f7f7;
  border-radius: 5px;
  padding: 15px;

  p {
    font-size: 13px;
    margin: 10px 0;
    &:last-child {
      margin-bottom: 0;
    }
  }
}
</style>
