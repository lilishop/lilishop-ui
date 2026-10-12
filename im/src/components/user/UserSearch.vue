<template>
  <div>
    <div class="lum-dialog-mask" v-show="isShow">
      <el-container class="lum-dialog-box" v-outside="close">
        <el-header class="header" height="50px">
          <p>添加好友</p>
          <p class="tools">
            <legacy-el-icon name="el-icon-close" @click="close" />
          </p>
        </el-header>
        <el-main class="main">
          <el-input
            v-model="mobile"
            id="serach-mobile"
            class="input"
            :prefix-icon="$legacyIcon('el-icon-search')"
            placeholder="请输入对方手机号(精确查找)"
            clearable
            @keyup.enter="onSubmit"
            @input="error = false"
          />
          <p v-show="error" class="error">
            无法找到该用户，请检查搜索内容并重试
          </p>
          <el-button
            type="primary"
            size="small"
            :loading="loading"
            @click="onSubmit"
            >立即查找
          </el-button>
        </el-main>
      </el-container>
    </div>
  </div>
</template>
<script setup>
import { ref, nextTick, getCurrentInstance } from 'vue'
import { ServeSearchContact } from '@/api/contacts'

defineOptions({ name: 'UserSearch' })

const { proxy } = getCurrentInstance()

const loading = ref(false)
const isShow = ref(false)
const mobile = ref('')
const error = ref(false)

// 显示窗口
const open = () => {
  mobile.value = ''
  isShow.value = true
  nextTick(() => {
    document.getElementById('serach-mobile').focus()
  })
}

// 关闭窗口
const close = () => {
  isShow.value = false
}

const onSubmit = () => {
  if (mobile.value == '') return false

  loading.value = true
  ServeSearchContact({
    mobile: mobile.value,
  })
    .then(res => {
      if (res.code == 200) {
        proxy.$user(res.data.id)
        close()
      } else {
        error.value = true
      }
    })
    .finally(() => {
      loading.value = false
    })
}

// 父组件通过 ref 调用 open()（im/src/views/message/index.vue）
defineExpose({ open, close })
</script>
<style lang="less" scoped>
.lum-dialog-box {
  width: 450px;
  max-width: 450px;
  height: 250px;

  .main {
    display: flex;
    justify-content: center;
    align-items: center;
    flex-direction: column;

    .input {
      width: 85%;
    }

    .error {
      width: 85%;
      color: red;
      font-size: 12px;
      height: 50px;
      line-height: 50px;
    }

    button {
      margin-top: 20px;
      width: 100px;
    }
  }
}
</style>
