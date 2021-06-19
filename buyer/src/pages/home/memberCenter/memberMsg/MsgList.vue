<template>
  <div class="msg-list">
    <card _Title="我的消息" :_Tabs="status" :_Size="16" />
  </div>
</template>
<script>
import {memberMsgList, readMemberMsg, delMemberMsg} from '@/api/member.js'
export default {
  data() {
    return {
      list: [], // 会员列表
      status: ['未读', '已读', '回收站'],
      params: { // 请求参数
        pageNumber: 1,
        pageSize: 10,
        status: ''
      },
    }
  },
  methods: {
    getList () { // 获取消息列表
      memberMsgList(this.params).then(res => {
        if (res.success) {
          this.list = res.result.records;
        }
      })
    },
    setRead (id) { // 设置消息已读
      readMemberMsg(id).then(res => {

      })
    }
  },
  mounted () {
    this.getList()
  }
}
</script>
<style lang="scss" scoped>
  
</style>