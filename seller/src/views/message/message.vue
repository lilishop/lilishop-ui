<template>
  <div class="message-main-con">
    <div class="message-mainlist-con">
      <div
        v-for="item in mesTypeList"
        :key="item.type"
        class="mes-type-item"
        :class="{ active: currentMessageType === item.type }"
        @click="setCurrentMesType(item.type)"
      >
        <span class="mes-type-btn-text">{{ item.title }}</span>
        <el-badge
          v-if="item.type === 'unread' && unReadCount > 0"
          :value="unReadCount"
          class="message-count-badge-outer"
        />
      </div>
    </div>
    <div class="message-content-con">
      <div v-if="showMesTitleList" class="message-title-list-con">
        <el-table
          ref="messageList"
          v-loading="loading"
          :data="currentMesList"
          :empty-text="noDataText"
          :show-header="false"
          style="width: 100%"
        >
          <el-table-column min-width="300">
            <template #default="{ row }">
              <a class="link-text mes-title-link" @click="openMessage(row)">{{ row.title }}</a>
            </template>
          </el-table-column>
          <el-table-column width="200" align="center">
            <template #default="{ row }">
              <el-icon class="mes-time-icon"><Clock /></el-icon>
              <span>{{ row.createTime }}</span>
            </template>
          </el-table-column>
          <el-table-column width="180" align="center">
            <template #default="{ row }">
              <template v-if="currentMessageType == 'unread'">
                <a class="link-text" @click="markAsRead(row)">标为已读</a>
              </template>
              <template v-else-if="currentMessageType == 'read'">
                <a class="link-text" @click="deleteMes(row)">删除</a>
              </template>
              <template v-else>
                <a class="link-text" @click="restoreMes(row)">还原</a>
                <span class="op-split">|</span>
                <a class="link-text" @click="deleteReal(row)">彻底删除</a>
              </template>
            </template>
          </el-table-column>
        </el-table>
        <div class="page-bar">
          <el-pagination
            v-model:current-page="params.pageNumber"
            v-model:page-size="params.pageSize"
            :page-sizes="[5, 10]"
            :total="total"
            layout="total, sizes, prev, pager, next, jumper"
            size="small"
            @current-change="changePage"
            @size-change="changePageSize"
          />
        </div>
      </div>
      <div v-else class="message-view-content-con">
        <div class="message-content-top-bar">
          <el-button type="primary" link @click="backMesTitleList">
            <el-icon><ArrowLeft /></el-icon>返回
          </el-button>
          <h3 class="mes-title">{{ mes.title }}</h3>
        </div>
        <p class="mes-time-con">
          <el-icon class="mes-time-icon"><Clock /></el-icon>{{ mes.time }}
        </p>
        <div class="message-content-body">
          <p class="message-content" v-html="$filters.xssFilter(mes.content)"></p>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { Clock, ArrowLeft } from "@element-plus/icons-vue";
import * as API_Index from "@/api/index";

export default {
  name: "message_index",
  components: { Clock, ArrowLeft },
  data() {
    return {
      loading: true,
      mesTypeList: [
        { type: "unread", title: "未读消息" },
        { type: "read", title: "已读消息" },
        { type: "recycleBin", title: "回收站" },
      ],
      params: {
        status: "UN_READY",
        pageNumber: 1,
        pageSize: 10,
        sort: "createTime",
        order: "desc",
      },
      total: 0,
      currentMesList: [],
      currentMessageType: "unread",
      showMesTitleList: true,
      unReadCount: 0,
      noDataText: "暂无未读消息",
      mes: {
        title: "",
        time: "",
        content: "",
      },
    };
  },
  methods: {
    changePage() {
      this.refreshMessage();
    },
    changePageSize() {
      this.refreshMessage();
    },
    refreshMessage() {
      let status;
      const type = this.currentMessageType;
      if (type == "unread") status = "UN_READY";
      else if (type == "read") status = "ALREADY_READY";
      else status = "ALREADY_REMOVE";
      this.params.status = status;
      this.loading = true;
      API_Index.getMessageSendData(this.params).then((res) => {
        this.loading = false;
        if (res.success) {
          this.currentMesList = res.result.records;
          this.total = res.result.total;
        }
      });
    },
    getAll() {
      API_Index.getAllMessage(this.params).then((res) => {
        this.loading = false;
        if (res.success) {
          this.unReadCount = res.result.UN_READY.total;
          this.currentMesList = res.result.UN_READY.records;
        }
      });
    },
    backMesTitleList() {
      this.showMesTitleList = true;
    },
    setCurrentMesType(type) {
      if (this.currentMessageType !== type) {
        this.showMesTitleList = true;
      }
      this.currentMessageType = type;
      if (type == "unread") this.noDataText = "暂无未读消息";
      else if (type == "read") this.noDataText = "暂无已读消息";
      else this.noDataText = "回收站无消息";
      this.params.pageNumber = 1;
      this.refreshMessage();
    },
    openMessage(row) {
      this.showMesTitleList = false;
      this.mes.title = row.title;
      this.mes.time = row.createTime;
      this.getContent(row);
    },
    markAsRead(v) {
      this.loading = true;
      API_Index.read(v.id).then((res) => {
        this.loading = false;
        if (res.success) this.getAll();
      });
    },
    deleteMes(v) {
      this.loading = true;
      API_Index.deleteMessage(v.id).then((res) => {
        this.loading = false;
        if (res.success) this.refreshMessage();
      });
    },
    restoreMes(v) {
      API_Index.reductionMessage(v.id).then((res) => {
        this.loading = false;
        if (res.success) this.refreshMessage();
      });
    },
    deleteReal(v) {
      this.loading = true;
      API_Index.clearMessage(v.id).then((res) => {
        this.loading = false;
        if (res.success) this.refreshMessage();
      });
    },
    getContent(v) {
      this.mes.content = v.content;
      API_Index.read(v.id).then((res) => {
        this.loading = false;
        if (res.success) this.getAll();
      });
    },
  },
  mounted() {
    this.getAll();
  },
  watch: {
    $route(to) {
      if (to.name == "message_index") this.getAll();
    },
  },
};
</script>

<style lang="scss" scoped>
@import "./message.scss";
.link-text {
  color: #409eff;
  cursor: pointer;
  text-decoration: none;
}
.op-split {
  margin: 0 8px;
  color: #dcdee2;
}
.mes-title-link {
  margin-right: 30px;
}
</style>
