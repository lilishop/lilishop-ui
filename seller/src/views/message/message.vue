<template>
  <div class="message-main-con">
    <div class="message-mainlist-con">
      <div>
        <el-button size="large" text style="width: 100%" @click="setCurrentMesType('unread')">
          <div class="mes-wrap">
            <transition name="mes-current-type-btn">
              <el-icon v-show="currentMessageType == 'unread'"><Check /></el-icon>
            </transition>
            <span class="mes-type-btn-text">未读消息</span>
            <el-badge :value="unReadCount" class="message-count-badge-outer" />
          </div>
        </el-button>
      </div>
      <div>
        <el-button size="large" text style="width: 100%" @click="setCurrentMesType('read')">
          <div class="mes-wrap">
            <transition name="mes-current-type-btn">
              <el-icon v-show="currentMessageType == 'read'"><Check /></el-icon>
            </transition>
            <span class="mes-type-btn-text">已读消息</span>
          </div>
        </el-button>
      </div>
      <div>
        <el-button size="large" text style="width: 100%" @click="setCurrentMesType('recycleBin')">
          <div class="mes-wrap">
            <transition name="mes-current-type-btn">
              <el-icon v-show="currentMessageType == 'recycleBin'"><Check /></el-icon>
            </transition>
            <span class="mes-type-btn-text">回收站</span>
          </div>
        </el-button>
      </div>
    </div>
    <div class="message-content-con">
      <transition name="view-message">
        <div v-if="showMesTitleList" class="message-title-list-con">
          <el-table
            ref="messageList"
            v-loading="loading"
            class="mt_10"
            :data="currentMesList"
            :empty-text="noDataText"
            style="width: 100%"
          >
            <el-table-column label=" " min-width="300">
              <template #default="{ row }">
                <a class="link-text mes-title-link" @click="openMessage(row)">{{ row.title }}</a>
              </template>
            </el-table-column>
            <el-table-column label=" " width="190" align="center">
              <template #default="{ row }">
                <el-icon style="margin-right: 5px; vertical-align: middle"><Clock /></el-icon>
                <span>{{ row.createTime }}</span>
              </template>
            </el-table-column>
            <el-table-column label=" " width="210" align="center">
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
          <div class="page-fix mt_10" style="display: flex; justify-content: flex-end">
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
      </transition>
      <transition name="back-message-list">
        <div v-if="!showMesTitleList" class="message-view-content-con">
          <div class="message-content-top-bar">
            <span class="mes-back-btn-con">
              <el-button type="primary" link @click="backMesTitleList">
                <el-icon><ArrowLeft /></el-icon>&nbsp;&nbsp;返回
              </el-button>
            </span>
            <h3 class="mes-title">{{ mes.title }}</h3>
          </div>
          <p class="mes-time-con">
            <el-icon><Clock /></el-icon>
            &nbsp;&nbsp;{{ mes.time }}
          </p>
          <div class="message-content-body">
            <p class="message-content" v-html="mes.content"></p>
          </div>
        </div>
      </transition>
    </div>
  </div>
</template>

<script>
import { Check, Clock, ArrowLeft } from "@element-plus/icons-vue";
import * as API_Index from "@/api/index";

export default {
  name: "message_index",
  components: { Check, Clock, ArrowLeft },
  data() {
    return {
      loading: true,
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
      let status = "UN_READY";
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
