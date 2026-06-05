<template>
  <div class="msg-list">
    <card _Title="我的消息" :_Tabs="status" :_Size="16"  @_Change="statusChange"/>

    <el-table v-if="params.status != 'ALREADY_REMOVE'" :data="messageData.records || []">
      <el-table-column prop="title" label="消息标题" align="left" show-overflow-tooltip />
      <el-table-column prop="content" label="消息内容" align="left" show-overflow-tooltip />
      <el-table-column prop="createTime" label="发送时间" align="left" width="240" />
      <el-table-column label="操作" align="center" fixed="right" width="150">
        <template #default="{ row }">
          <el-button
            v-if="row.status === 'UN_READY'"
            type="primary"
            size="small"
            style="margin-right: 5px"
            @click="setRead(row.id)"
          >已读</el-button>
          <el-button type="danger" size="small" @click="removeMessage(row.id)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>
    <el-table v-else :data="messageData.records || []">
      <el-table-column prop="title" label="消息标题" align="left" show-overflow-tooltip />
      <el-table-column prop="content" label="消息内容" align="left" show-overflow-tooltip />
      <el-table-column prop="createTime" label="发送时间" align="left" width="240" />
    </el-table>
    <el-pagination
      style="float:right;margin-top:10px"
      :current-page="params.pageNumber"
      :total="messageData.total"
      :page-size="params.pageSize"
      @current-change="changePage"
      @size-change="changePageSize"
      :page-sizes="[10, 20, 50]"
      small
      layout="total, prev, pager, next, jumper"
    />
  </div>
</template>
<script>
import {memberMsgList, readMemberMsg, delMemberMsg} from '@/api/member.js'
export default {
  data() {
    return {
      messageData: {},
      status: ['未读', '已读', '回收站'],
      params: {
        pageNumber: 1,
        pageSize: 10,
        status: 'UN_READY'
      },
    }
  },
  methods: {
    statusChange (index) {
      if (index === 0) { this.params.status = 'UN_READY' }
      if (index === 1) { this.params.status = 'ALREADY_READY' }
      if (index === 2) { this.params.status = 'ALREADY_REMOVE' }
      this.getList()
    },
    changePage (v) {
      this.params.pageNumber = v;
      this.getList();
    },
    changePageSize (v) {
      this.params.pageSize = v;
      this.getList();
    },
    getList () {
      memberMsgList(this.params).then(res => {
        if (res.success) {
          this.messageData = res.result;
        }
      })
    },
    setRead (id) {
      readMemberMsg(id).then(res => {
        if (res.success) {
          this.getList()
        }
      })
    },
    removeMessage (id) {
      this.$Modal.confirm({
        title: '确认删除',
        content: '确认要删除此消息?',
        loading: true,
        onOk: () => {
          delMemberMsg(id).then((res) => {
            this.$Modal.remove();
            if (res.success) {
              this.$Message.success('消息已成功放入回收站');
              this.getList();
            }
          });
        },
      });
    }
  },
  mounted () {
    this.getList()
  }
}
</script>
<style lang="scss" scoped>

</style>
