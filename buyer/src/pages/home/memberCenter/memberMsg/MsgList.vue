<template>
  <div class="msg-list">
    <UserCenterLayout
      :tabs="status"
      :active-tab="activeStatusIndex"
      @tab-change="statusChange"
    >

      <empty v-if="!(messageData.records || []).length" />
      <div v-else class="msg-table" :class="{ 'is-recycle': params.status === 'ALREADY_REMOVE' }">
        <div class="msg-head">
          <span>消息标题</span>
          <span>消息内容</span>
          <span>发送时间</span>
          <span v-if="params.status !== 'ALREADY_REMOVE'">操作</span>
        </div>
        <div
          class="msg-row"
          v-for="row in messageData.records"
          :key="row.id"
          :class="{ unread: row.status === 'UN_READY' }"
        >
          <div class="msg-title" @click="openDetail(row)">
            <i v-if="row.status === 'UN_READY'" class="unread-dot"></i>
            <span>{{ row.title }}</span>
          </div>
          <div class="msg-content" @click="openDetail(row)">{{ row.content }}</div>
          <div class="msg-time">{{ row.createTime }}</div>
          <div class="msg-ops" v-if="params.status !== 'ALREADY_REMOVE'">
            <button type="button" class="text-link" @click="openDetail(row)">查看</button>
            <button v-if="row.status === 'UN_READY'" type="button" class="text-link" @click="setRead(row.id)">已读</button>
            <button type="button" class="text-link" @click="removeMessage(row.id)">删除</button>
          </div>
        </div>
      </div>
      <div class="msg-pagination" v-if="messageData.total">
        <el-pagination
          v-model:current-page="params.pageNumber"
          v-model:page-size="params.pageSize"
          :total="messageData.total"
          @current-change="changePage"
          @size-change="changePageSize"
          :page-sizes="[20, 50, 100]"
          layout="total, sizes, prev, pager, next, jumper"
        />
      </div>
    </UserCenterLayout>
  </div>
</template>
<script>
import { Message, Modal } from "@/utils/message";
import {memberMsgList, readMemberMsg, delMemberMsg} from '@/api/member.js'
export default {
  data() {
    return {
      messageData: {},
      status: ['未读', '已读', '回收站'],
      params: {
        pageNumber: 1,
        pageSize: 20,
        status: 'UN_READY'
      },
    }
  },
  computed: {
    activeStatusIndex () {
      const map = ['UN_READY', 'ALREADY_READY', 'ALREADY_REMOVE'];
      const index = map.indexOf(this.params.status);
      return index > -1 ? index : 0;
    }
  },
  methods: {
    statusChange (index) {
      if (index === 0) { this.params.status = 'UN_READY' }
      if (index === 1) { this.params.status = 'ALREADY_READY' }
      if (index === 2) { this.params.status = 'ALREADY_REMOVE' }
      this.params.pageNumber = 1
      this.getList()
    },
    changePage (v) {
      this.params.pageNumber = v;
      this.getList();
    },
    changePageSize (v) {
      this.params.pageNumber = 1
      this.params.pageSize = v;
      this.getList();
    },
    openDetail (row) {
      sessionStorage.setItem('buyer-member-message', JSON.stringify(row))
      this.$router.push({ name: 'MsgDetail', query: { id: row.id } })
    },
    getList () {
      memberMsgList(this.params).then(res => {
        if (res.success) {
          this.messageData = res.result;
          if (this.params.status === 'UN_READY') {
            this.$store.commit('SET_UNREAD_MSG', Number(res.result.total) || 0);
          }
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
      Modal.confirm({
        title: '确认删除',
        content: '确认要删除此消息?',
        loading: true,
        onOk: () =>
          delMemberMsg(id).then((res) => {
            if (res.success) {
              Message.success('消息已成功放入回收站');
              this.getList();
            }
          }),
      });
    }
  },
  mounted () {
    this.getList()
  }
}
</script>
<style lang="scss" scoped>
.msg-table {
  --msg-cols: minmax(140px, 1.1fr) minmax(0, 2.2fr) 180px 168px;
  padding-top: 8px;
}

.msg-table.is-recycle {
  --msg-cols: minmax(140px, 1.1fr) minmax(0, 2.2fr) 180px;
}

.msg-head,
.msg-row {
  display: grid;
  grid-template-columns: var(--msg-cols);
  column-gap: 16px;
  align-items: start;
}

.msg-head {
  padding: 0 8px 10px;
  color: #999;
  font-size: 13px;

  span:last-child {
    text-align: center;
  }
}

.msg-row {
  padding: 14px 8px;
  border-top: 1px solid #f0f0f0;
  font-size: 14px;
  line-height: 22px;
}

.msg-title {
  display: flex;
  align-items: center;
  min-width: 0;
  color: #171A26;
  cursor: pointer;

  &:hover span {
    color: $theme_color;
  }

  span {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
}

.unread .msg-title {
  font-weight: 600;
}

.unread-dot {
  width: 6px;
  height: 6px;
  margin-right: 8px;
  border-radius: 50%;
  background: $theme_color;
  flex-shrink: 0;
}

.msg-content {
  min-width: 0;
  color: #666;
  cursor: pointer;
  white-space: pre-wrap;
  word-break: break-all;
  line-height: 22px;
}

.msg-time {
  color: #171A26;
}

.msg-ops {
  display: flex;
  justify-content: center;
  gap: 16px;
}

.text-link {
  border: none;
  background: none;
  padding: 0;
  color: #171A26;
  font-family: inherit;
  font-size: 14px;
  line-height: 22px;
  cursor: pointer;

  &:hover {
    color: $theme_color;
  }
}

.msg-pagination {
  display: flex;
  justify-content: flex-end;
  margin-top: 16px;

  :deep(.el-pagination) {
    justify-content: flex-end;
  }
}
</style>
