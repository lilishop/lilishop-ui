<style lang="scss" scoped>
@import "./message.scss";
</style>

<template>
  <div class="message-main-con">
    <div class="message-mainlist-con">
      <div>
        <Button @click="setCurrentMesType('unread')" size="large" long type="text">
          <div class="mes-wrap">
            <transition name="mes-current-type-btn">
              <Icon v-show="currentMessageType == 'unread'" type="md-checkmark"></Icon>
            </transition>
            <span class="mes-type-btn-text">未读消息</span>
            <Badge
              class="message-count-badge-outer"
              class-name="message-count-badge-red"
              :count="unreadCount"
            ></Badge>
          </div>
        </Button>
      </div>
      <div>
        <Button @click="setCurrentMesType('hasread')" size="large" long type="text">
          <div class="mes-wrap">
            <transition name="mes-current-type-btn">
              <Icon v-show="currentMessageType == 'hasread'" type="md-checkmark"></Icon>
            </transition>
            <span class="mes-type-btn-text">已读消息</span>
            <Badge
              class="message-count-badge-outer"
              class-name="message-count-badge"
              :count="hasreadCount"
            ></Badge>
          </div>
        </Button>
      </div>
      <div>
        <Button @click="setCurrentMesType('recyclebin')" size="large" long type="text">
          <div class="mes-wrap">
            <transition name="mes-current-type-btn">
              <Icon v-show="currentMessageType == 'recyclebin'" type="md-checkmark"></Icon>
            </transition>
            <span class="mes-type-btn-text">回收站</span>
            <Badge
              class="message-count-badge-outer"
              class-name="message-count-badge"
              :count="recyclebinCount"
            ></Badge>
          </div>
        </Button>
      </div>
    </div>
    <div class="message-content-con">
      <transition name="view-message">
        <div v-if="showMesTitleList" class="message-title-list-con">
          <Table
            ref="messageList"
            :loading="loading"
            :columns="mesTitleColumns"
            :data="currentMesList"
            :no-data-text="noDataText"
          ></Table>
          <Page
            :current="params.pageNumber"
            :total="total"
            :page-size="params.pageSize"
            @on-change="changePage"
            @on-page-size-change="changePageSize"
            :page-size-opts="[5,10]"
            size="small"
            show-total
            show-elevator
            show-sizer
            class="page-fix"
          ></Page>
        </div>
      </transition>
      <transition name="back-message-list">
        <div v-if="!showMesTitleList" class="message-view-content-con">
          <div class="message-content-top-bar">
            <span class="mes-back-btn-con">
              <Button type="text" @click="backMesTitleList">
                <Icon type="ios-arrow-back"></Icon>&nbsp;&nbsp;返回
              </Button>
            </span>
            <h3 class="mes-title">{{ mes.title }}</h3>
          </div>
          <p class="mes-time-con">
            <Icon type="android-time"></Icon>
            &nbsp;&nbsp;{{ mes.time }}
          </p>
          <div class="message-content-body">
            <p class="message-content" v-html="mes.content">{{ mes.content }}</p>
          </div>
        </div>
      </transition>
    </div>
  </div>
</template>

<script>
import Cookies from "js-cookie";
import {
  getMessageSendData,
  editMessageSend,
  deleteMessageSend
} from "@/api/index";
export default {
  name: "message_index",
  data() {
    const markAsreadBtn = (h, params) => {
      return h(
        "Button",
        {
          props: {
            icon: "md-eye-off",
            size: "small"
          },
          on: {
            click: () => {
              // 标记已读
              let v = params.row;
              // 转换null为""
              for (let attr in v) {
                if (v[attr] == null) {
                  v[attr] = "";
                }
              }
              let str = JSON.stringify(v);
              let data = JSON.parse(str);
              data.status = 1;
              this.loading = true;
              editMessageSend(data).then(res => {
                this.loading = false;
                if (res.success) {
                  this.$Message.success("操作成功");
                  this.unreadCount -= 1;
                  this.hasreadCount += 1;
                  this.$store.commit("setMessageCount", this.unreadCount);
                  this.refreshMessage();
                }
              });
            }
          }
        },
        "标为已读"
      );
    };
    const deleteMesBtn = (h, params) => {
      return h(
        "Button",
        {
          props: {
            icon: "md-trash",
            size: "small",
            type: "error"
          },
          on: {
            click: () => {
              // 移除
              let v = params.row;
              // 转换null为""
              for (let attr in v) {
                if (v[attr] == null) {
                  v[attr] = "";
                }
              }
              let str = JSON.stringify(v);
              let data = JSON.parse(str);
              data.status = 2;
              this.loading = true;
              editMessageSend(data).then(res => {
                this.loading = false;
                if (res.success) {
                  this.$Message.success("操作成功");
                  this.hasreadCount -= 1;
                  this.recyclebinCount += 1;
                  this.refreshMessage();
                }
              });
            }
          }
        },
        "删除"
      );
    };
    const restoreBtn = (h, params) => {
      return h(
        "Button",
        {
          props: {
            icon: "md-redo",
            size: "small"
          },
          style: {
            margin: "0 5px 0 0"
          },
          on: {
            click: () => {
              // 还原
              let v = params.row;
              // 转换null为""
              for (let attr in v) {
                if (v[attr] == null) {
                  v[attr] = "";
                }
              }
              let str = JSON.stringify(v);
              let data = JSON.parse(str);
              data.status = 1;
              this.loading = true;
              editMessageSend(data).then(res => {
                this.loading = false;
                if (res.success) {
                  this.$Message.success("操作成功");
                  this.recyclebinCount -= 1;
                  this.hasreadCount += 1;
                  this.refreshMessage();
                }
              });
            }
          }
        },
        "还原"
      );
    };
    const deleteRealBtn = (h, params) => {
      return h(
        "Button",
        {
          props: {
            icon: "md-trash",
            size: "small",
            type: "error"
          },
          on: {
            click: () => {
              // 彻底删除
              let v = params.row;
              this.loading = true;
              deleteMessageSend(v.id).then(res => {
                this.loading = false;
                if (res.success) {
                  this.$Message.success("操作成功");
                  this.recyclebinCount -= 1;
                  this.refreshMessage();
                }
              });
            }
          }
        },
        "彻底删除"
      );
    };
    return {
      loading: true, // 加载状态
      params: { // 请求参数
        userId: JSON.parse(Cookies.get("userInfo")).id,
        status: 0,
        pageNumber: 1, // 当前页数
        pageSize: 10, // 页面大小
        sort: "createTime", // 默认排序字段
        order: "desc" // 默认排序方式
      },
      total: 0, // 消息总数
      totalUnread: 0, // 所有未读消息数
      totalRead: 0, // 所有已读消息数
      totalRemove: 0, // 所有回收站消息数
      currentMesList: [], // 当前消息列表
      unreadMesList: [], // 未读消息列表
      hasreadMesList: [], // 已读消息列表
      recyclebinList: [], // 回收站消息
      currentMessageType: "unread", // 展示消息类型
      showMesTitleList: true, // 展示消息列表
      unreadCount: 0, // 未读数
      hasreadCount: 0, // 已读数
      recyclebinCount: 0, // 回收站消息数量
      noDataText: "暂无未读消息", // 无消息提示
      mes: { // 信息表单
        title: "",
        time: "",
        content: ""
      },
      mesTitleColumns: [
        {
          type: "index",
          width: 50,
          align: "center"
        },
        {
          title: " ",
          key: "title",
          align: "left",
          ellipsis: true,
          render: (h, params) => {
            return h("span", [
              h(
                "a",
                {
                  style: {
                    margin: "0 30px 0 0"
                  },
                  on: {
                    click: () => {
                      this.showMesTitleList = false;
                      this.mes.title = params.row.title;
                      this.mes.time = params.row.createTime;
                      this.getContent(params.row);
                    }
                  }
                },
                "【" + params.row.type + "】 " + params.row.title
              )
            ]);
          }
        },
        {
          title: " ",
          key: "time",
          align: "center",
          width: 190,
          render: (h, params) => {
            return h("span", [
              h("Icon", {
                props: {
                  type: "md-time",
                  size: 16
                },
                style: {
                  margin: "0 5px 3px 0"
                }
              }),
              h("span", params.row.createTime)
            ]);
          }
        },
        {
          title: " ",
          key: "asread",
          align: "center",
          width: 210,
          render: (h, params) => {
            if (this.currentMessageType == "unread") {
              return h("div", [markAsreadBtn(h, params)]);
            } else if (this.currentMessageType == "hasread") {
              return h("div", [deleteMesBtn(h, params)]);
            } else {
              return h("div", [
                restoreBtn(h, params),
                deleteRealBtn(h, params)
              ]);
            }
          }
        }
      ]
    };
  },
  methods: {
    changePage(v) {
      this.params.pageNumber = v;
      this.refreshMessage();
    },
    changePageSize(v) {
      this.params.pageSize = v;
      this.refreshMessage();
    },
    refreshMessage() {
      let status = 0;
      let type = this.currentMessageType;
      if (type == "unread") {
        status = 0;
      } else if (type == "hasread") {
        status = 1;
      } else {
        status = 2;
      }
      this.params.status = status;
      this.loading = true;
      getMessageSendData(this.params).then(res => {
        this.loading = false;
        if (res.success) {
          this.currentMesList = res.result.records;
          this.total = res.result.total;
        }
      });
    },
    initMessage() {
      this.params.status = 0;
      getMessageSendData(this.params).then(res => {
        if (res.success) {
          this.unreadCount = res.result.total;
          this.initReadMessage();
        }
      });
    },
    initReadMessage() {
      this.params.status = 1;
      getMessageSendData(this.params).then(res => {
        if (res.success) {
          this.hasreadCount = res.result.total;
          this.initRemoveMessage();
        }
      });
    },
    initRemoveMessage() {
      this.params.status = 2;
      getMessageSendData(this.params).then(res => {
        if (res.success) {
          this.recyclebinCount = res.result.total;
          this.setCurrentMesType("unread");
        }
      });
    },
    editMessage(status) {
      editMessageSend().then(res => {
        if (res.success) {
          this.$Message.success("操作成功");
        }
      });
    },
    deleteMessage(id) {
      deleteMessageSend(id).then(res => {
        if (res.success) {
          this.$Message.success("删除成功");
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
      if (type == "unread") {
        this.noDataText = "暂无未读消息";
      } else if (type == "hasread") {
        this.noDataText = "暂无已读消息";
      } else {
        this.noDataText = "回收站无消息";
      }
      this.params.pageNumber = 1;
      this.refreshMessage();
    },
    getContent(v) {
      this.mes.content = v.content;
    }
  },
  mounted() {
    this.initMessage();
  },
  watch: {
    // 监听路由变化通过id获取数据
    $route(to, from) {
      if (to.name == "message_index") {
        this.initMessage();
      }
    }
  }
};
</script>

