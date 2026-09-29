<template>
  <div class="msg-detail-page">
    <UserCenterLayout title="消息详情">
      <div v-if="detail.id" class="msg-detail">
        <div class="msg-detail-head">
          <h2>{{ detail.title || '站内消息' }}</h2>
          <p>{{ detail.createTime }}</p>
        </div>
        <div class="msg-detail-content">{{ detail.content || '暂无内容' }}</div>
        <div class="msg-detail-actions">
          <el-button @click="goBack">返回</el-button>
          <el-button v-if="detail.status !== 'ALREADY_REMOVE'" type="danger" @click="removeMessage">删除</el-button>
        </div>
      </div>
      <div v-else-if="loaded">
        <empty _Title="消息不存在或已失效" />
        <div class="msg-detail-actions is-empty">
          <el-button @click="goBack">返回消息列表</el-button>
        </div>
      </div>
    </UserCenterLayout>
  </div>
</template>

<script>
import { Message, Modal } from "@/utils/message";
import { delMemberMsg, getMemberMessage, readMemberMsg } from '@/api/member.js';

const CACHE_KEY = 'buyer-member-message';

export default {
  name: 'MsgDetail',
  data () {
    return {
      detail: {},
      loaded: false
    }
  },
  mounted () {
    this.loadDetail()
  },
  methods: {
    loadDetail () {
      const id = this.$route.query.id
      if (!id) {
        this.loaded = true
        return
      }
      const cached = this.readCache(id)
      if (cached) this.detail = cached
      getMemberMessage(id).then(res => {
        if (res && res.success && res.result && res.result.id) {
          this.detail = res.result
          sessionStorage.setItem(CACHE_KEY, JSON.stringify(res.result))
        }
      }).catch(() => {}).finally(() => {
        this.loaded = true
        this.markRead()
      })
    },
    readCache (id) {
      try {
        const raw = sessionStorage.getItem(CACHE_KEY)
        if (!raw) return null
        const message = JSON.parse(raw)
        return message && String(message.id) === String(id) ? message : null
      } catch (e) {
        return null
      }
    },
    markRead () {
      if (!this.detail.id || this.detail.status !== 'UN_READY') return
      readMemberMsg(this.detail.id).then(res => {
        if (res && res.success) this.detail.status = 'ALREADY_READY'
      }).catch(() => {})
    },
    goBack () {
      this.$router.push({ name: 'MsgList' })
    },
    removeMessage () {
      Modal.confirm({
        title: '确认删除',
        content: '确认要删除此消息?',
        loading: true,
        onOk: () =>
          delMemberMsg(this.detail.id).then((res) => {
            if (res.success) {
              Message.success('消息已成功放入回收站')
              this.goBack()
            }
          })
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.msg-detail-head {
  padding-bottom: 16px;
  border-bottom: 1px solid #f0f0f0;

  h2 {
    margin: 0;
    color: #171A26;
    font-size: 18px;
    font-weight: 600;
    line-height: 1.5;
  }

  p {
    margin: 8px 0 0;
    color: #999;
    font-size: 14px;
    line-height: 22px;
  }
}

.msg-detail-content {
  padding: 20px 0 8px;
  color: #333;
  font-size: 14px;
  line-height: 1.8;
  white-space: pre-wrap;
  word-break: break-all;
}

.msg-detail-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 24px;

  &.is-empty {
    justify-content: center;
  }
}
</style>
