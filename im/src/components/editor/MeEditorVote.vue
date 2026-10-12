<template>
  <div class="lum-dialog-mask animated fadeIn">
    <el-container class="lum-dialog-box">
      <el-header class="header no-select" height="60px">
        <p>发起投票</p>
        <p class="tools">
          <legacy-el-icon name="el-icon-close" @click="$emit('close')" />
        </p>
      </el-header>
      <el-main class="main no-padding vote-from">
        <div class="vote-title">投票方式</div>
        <div>
          <el-radio-group v-model="mode">
            <el-radio :label="0">单选</el-radio>
            <el-radio :label="1">多选</el-radio>
          </el-radio-group>
        </div>
        <div class="vote-title">投票主题</div>
        <div>
          <el-input
            size="default"
            clear="vote-input"
            v-model.trim="title"
            placeholder="请输入投票主题，最多50字"
            :maxlength="50"
          />
        </div>

        <div class="vote-title">投票选项</div>
        <div>
          <div class="vote-options" v-for="(option, index) in options">
            <div class="lbox">
              <el-input
                size="default"
                clear="vote-input"
                v-model.trim="option.value"
                placeholder="请输入选项内容"
                :maxlength="120"
              >
                <template #prefix>
                  <span
                    style="margin-left:7px;"
                    v-text="String.fromCharCode(65 + index)"
                  />
                </template>
              </el-input>
            </div>
            <div class="rbox">
              <legacy-el-icon name="el-icon-close" @click="removeOption(index)" />
            </div>
          </div>

          <h6 class="pointer add-option" @click="addOption">
            <legacy-el-icon name="el-icon-plus" /> 添加选项
          </h6>
        </div>
      </el-main>
      <el-footer class="footer">
        <el-button plain size="small">取消</el-button>
        <el-button
          type="primary"
          size="small"
          :disabled="isCheck"
          :loading="loading"
          @click="submit"
          >发起投票</el-button
        >
      </el-footer>
    </el-container>
  </div>
</template>
<script setup>
import { computed, ref } from 'vue'
import { ServeSendVote } from '@/api/chat'
import { ElNotification } from '@/utils/message'
import { useDialogueStore } from '@/stores/dialogue'

defineOptions({
  name: 'MeEditorVote',
})

const props = defineProps({
  group_id: {
    type: [String, Number],
    default: 0,
  },
})

const emit = defineEmits(['close'])

const dialogueStore = useDialogueStore()

const loading = ref(false)
const mode = ref(0)
const title = ref('')
const options = ref([
  {
    value: '',
  },
  {
    value: '',
  },
  {
    value: '',
  },
])

const isCheck = computed(() => {
  if (title.value == '') return true

  return options.value.some(option => option.value == '')
})

function submit() {
  let items = []
  const { receiver_id } = dialogueStore
  options.value.forEach(option => {
    items.push(option.value)
  })

  loading.value = true

  ServeSendVote({
    receiver_id,
    mode: mode.value,
    title: title.value,
    options: items,
  })
    .then(res => {
      if (res.code == 200) {
        emit('close')
        ElNotification({
          title: '友情提示',
          message: '发起投票成功!',
          type: 'success',
        })
      } else {
        ElNotification({
          title: '友情提示',
          message: res.message,
          type: 'warning',
        })
      }
    })
    .catch(() => {
      loading.value = false
    })
}

function addOption() {
  if (options.value.length >= 6) {
    return false
  }

  options.value.push({
    value: '',
  })
}

function removeOption(index) {
  if (options.value.length <= 2) {
    return false
  }

  options.value.splice(index, 1)
}
</script>
<style lang="less" scoped>
.lum-dialog-box {
  height: 600px;
  max-width: 450px;

  .vote-from {
    box-sizing: border-box;
    padding: 15px 25px;
    overflow: hidden;

    .vote-title {
      margin: 20px 0 10px;
      &:first-child {
        margin-top: 0;
      }
    }

    .vote-options {
      display: flex;
      min-height: 30px;
      margin: 10px 0;

      .lbox {
        width: 100%;

        :deep(.el-input__prefix ) {
          height: 36px;
          line-height: 36px;
        }
      }

      .rbox {
        flex-basis: 50px;
        display: flex;
        justify-content: center;
        align-items: center;
        i {
          font-size: 18px;
          cursor: pointer;
          &:hover {
            color: red;
          }
        }
      }
    }

    .add-option {
      margin-top: 5px;
      font-weight: 400;
      color: #3370ff;
    }
  }

  .footer {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    padding-right: 32px;
  }
}

:deep(.el-radio__input.is-checked + .el-radio__label ) {
  color: #606266;
}
</style>
