<template>
  <div class="wrapper">
    <MainLayout :idx="0" ref="mainLayout">
      <el-container slot="container" class="full-height">
        <!-- 左侧侧边栏 -->
        <el-aside width="320px" class="aside-box">
          <el-container class="full-height" direction="vertical">
            <!-- 搜索栏 -->
            <el-header height="60px" class="header">
              <div class="user-login" v-popover:usercard>
                <div class="user-box">
                  <face :text="face" :name="name" class="user-face"></face>
                </div>
              </div>
              <p class="user-status">
                <span v-if="name">{{ name }}</span>
                <span v-else>用户名称</span>
              </p>
            </el-header>
            <el-header height="60px" class="header">
              <div class="from-search">
                <el-input v-model="input" prefix-icon="el-icon-search" placeholder="搜索好友" size="small" />
              </div>
            </el-header>
            <!-- <el-header height="118px" class="logo-header">

          </el-header> -->
            <!-- 置顶栏 -->
            <el-header v-show="loadStatus == 1 && topItems.length > 0" class="subheader"
              :class="{ shadow: subHeaderShadow }" :height="subHeaderPx">
              <div v-for="item in topItems" :key="item.index_name" class="top-item" @click="clickTab(item.index_name)"
                @contextmenu.prevent="topItemsMenu(item, $event)">
                <el-tooltip effect="dark" placement="top-start" :content="item.name ? item.name : item.name">
                  <div class="avatar">
                    <span v-show="!item.face">
                      {{ (item.name ? item.name : item.name).substr(0, 1) }}
                    </span>
                    <img v-show="item.face" :src="item.face" :onerror="$store.state.defaultAvatar" v-if="item.face" />
                    <face-null :text="item.name" v-else></face-null>
                  </div>
                </el-tooltip>

                <div class="name" :class="{ active: index_name === item.id }">
                  {{ item.name ? item.name : item.name }}
                </div>
              </div>
            </el-header>

            <!-- 对话列表栏 -->
            <el-scrollbar tag="section" ref="menusScrollbar" class="full-height" :native="false">
              <el-main class="main">
                <p v-show="loadStatus === 0" class="empty-data">
                  <i class="el-icon-loading" /> 数据加载中...
                </p>

                <p v-show="loadStatus === 1 && talkNum === 0" class="empty-data">
                  暂无聊天消息
                </p>

                <p v-show="loadStatus === 1 && talkNum > 0" class="main-menu">
                  <span class="title">对话记录({{ talkNum }})</span>

                  <!-- <el-tag size="mini" type="danger" v-if="myUnreadNum"
                    >未读：{{ myUnreadNum }}</el-tag
                  > -->
                </p>
                <!-- 对话列表 -->
                <template v-if="loadStatus === 1">
                  <div v-for="(item, index) in userTalkItem" :key="item.id" class="talk-item pointer"
                    :class="{ active: activeIndex == index }" @click="clickTab(item.userId, item, index)">
                    <div class="avatar-box">
                      <face :text="item.face" v-if="item.face"></face>
                      <face-null :text="item.name" v-else></face-null>
                      <div v-show="item.is_top == 0" class="top-mask" @click.stop="topChatItem(item)">
                        <i class="el-icon-top" />
                      </div>
                    </div>
                    <div class="card-box">
                      <div class="title">
                        <div class="card-name">
                          <p class="nickname">
                            {{
                              item.remark_name ? item.remark_name : item.name
                            }}
                          </p>
                          <div v-show="item.unread" class="larkc-tag">
                            {{ item.unread }}条未读
                          </div>
                          <div v-show="item.is_top" class="larkc-tag top">
                            TOP
                          </div>

                          <div v-show="item.is_robot" class="larkc-tag top">
                            BOT
                          </div>

                          <div v-show="item.talk_type == 2" class="larkc-tag group">
                            群组
                          </div>
                          <div v-show="item.is_disturb" class="larkc-tag disturb">
                            <i class="iconfont icon-xiaoximiandarao" />
                          </div>
                        </div>
                        <div class="card-time">
                          {{ beautifyTime(item.lastTalkTime) }}
                        </div>
                      </div>
                      <div class="talk-message">
                        <span v-if="item.lastMessageType === 'MESSAGE'">{{ item.lastTalkMessage }}</span>
                        <span v-if="item.lastMessageType === 'GOODS'">[商品链接]</span>
                        <span v-if="item.lastMessageType === 'ORDER'">[订单链接]</span>
                      </div>
                      <div class="content">
                        <template v-if="
                          index_name != item.index_name && item.draft_text
                        ">
                          <span class="draft-color">[草稿]</span>
                          <span>{{ item.draft_text }}</span>
                        </template>
                        <template v-else>
                          <template v-if="item.is_robot == 0">
                            <span v-if="item.talk_type == 1" :class="{ 'online-color': item.is_online == 1 }">
                              [{{ item.is_online == 1 ? "在线" : "离线" }}]
                            </span>
                            <span v-else>[群消息]</span>
                          </template>

                          <span>{{ item.msg_text }}</span>
                        </template>
                      </div>
                    </div>
                  </div>
                </template>
              </el-main>
            </el-scrollbar>
          </el-container>
        </el-aside>

        <!-- 聊天面板容器 -->
        <el-main class="main-box ov-hidden full-height no-padding flex">
          <WelcomeModule class="flex-8" v-if="index_name == null" />
          <TalkPanel v-else class="full-height flex-8" :params="params" :goodsParams="goodsParams"
            :is-online="isFriendOnline" @change-talk="changeTalk" @close-talk="closeTalk" />
          <!-- <OtherLink :toUser="toUser" :goodsParams="goodsParams" :id="id" class="flex-4"/> -->
        </el-main>
      </el-container>
    </MainLayout>

    <!-- 用户查询组件 -->
    <UserSearch ref="searchUsers" />
  </div>
</template>
<script>
import { mapGetters, mapState } from "vuex";
import MainLayout from "@/views/layout/MainLayout";
import WelcomeModule from "@/components/layout/WelcomeModule";
import TalkPanel from "@/components/chat/panel/TalkPanel";
import UserSearch from "@/components/user/UserSearch";
import OtherLink from "@/components/chat/panel/OtherLink.vue";
import {
  ServeGetTalkList,
  ServeDeleteTalkList,
  ServeTopTalkList,
  ServeSetNotDisturb,
  ServeCreateTalkList,
} from "@/api/chat";
import { ServeDeleteContact, ServeEditContactRemark } from "@/api/contacts";
import { beautifyTime } from "@/utils/functions";
import { formatTalkItem, findTalkIndex, getCacheIndexName } from "@/utils/talk";
import { setToken } from "@/utils/auth";

const title = document.title;

export default {
  name: "MessagePage",
  components: {
    MainLayout,
    TalkPanel,
    UserSearch,
    OtherLink,
    WelcomeModule,
  },
  data () {
    return {
      activeIndex: 9999999, //默认样式索引
      subHeaderShadow: false,
      launchGroupShow: false,

      // 对话面板的传递参数
      params: {
        talk_type: 0,
        receiver_id: 0,
        nickname: "",
        clickFlag: true,
      },

      goodsParams: {
        goodsId: '',
        skuId: '',
      },

      // 查询关键词
      input: "",

      // header 工具菜单
      subMenu: false,

      // 对话消息列表加载状态[0:加载中;1:加载完成;2:加载失败;]
      loadStatus: 0,

      // 消息未读数计时器
      interval: null,
      userTalkItem: [],
    };
  },
  computed: {
    ...mapGetters(["topItems", "talkItems", "unreadNum", "talkNum"]),
    ...mapState({
      face: (state) => state.user.face,
      name: (state) => state.user.name,
      talks: (state) => state.talks.items,
      id: (state) => state.user.id,
      index_name: (state) => state.dialogue.index_name,
      monitorFriendsStatus: (state) => state.notify.friendStatus,
      myUnreadNum: (state) => state.notify.unreadNum,
      toUser: (state) => state.user.toUser,
    }),
    // 计算置顶栏目的高度
    subHeaderPx () {
      const n = 7; // 一排能显示的用户数
      const num = this.topItems.length;
      let len = 60;

      if (num > n) {
        len = (Math.floor(num / n) + (num % n > 0 ? 1 : 0)) * len;
      }

      return `${len}px`;
    },

    // 当前对话好友在线状态
    isFriendOnline () {
      let index = findTalkIndex(this.index_name);
      return index >= 0 && this.talks[index].is_online == 1;
    },
  },
  watch: {
    talkItems (val) {
      val ? this.$set(this, "userTalkItem", val) : "";
    },
    // 搜索用户的时候 根据当前用户表进行模糊搜索
    input (val, oldVal) {
      console.log(val, oldVal);
      if (val) {
        let str = ["", ...val, ""].join(".*");
        let reg = new RegExp(str);
        this.userTalkItem = this.talkItems.filter((item) =>
          reg.test(item.name)
        );
      } else {
        this.userTalkItem = this.talkItems;
      }
    },
    unreadNum (value) {
      clearInterval(this.interval);
      // console.log("%c 更新未读消息", "color:#32ccbc");
      this.$store.commit("SET_UNREAD_NUM", value);

      if (value > 0) {
        this.interval = setInterval(() => {
          document.title =
            document.title == title ? `【新消息】${title}` : title;
        }, 2000);
      } else {
        document.title = title;
      }
    },

    // 监听好友在线状态
    monitorFriendsStatus (value) {
      this.$store.commit("UPDATE_TALK_ITEM", {
        index_name: `1_${value.friend_id}`,
        is_online: value.status,
      });
    },
  },

  beforeRouteUpdate (to, from, next) {
    let index_name = getCacheIndexName();
    if (index_name) this.clickTab(index_name);
    next();
  },
  beforeCreate () {
    setToken(this.$route.query.token);
  },
  async created () {
    await this.initialize();
    await this.loadUserSetting();
    /**
     * 如果说有id 说明是用户点击 “联系客服” 进入的该页面
     * 所以创建会话 并请求用户列表
     * 如果没有id说明当前商家登录 直接请求用户列表
     */

  },

  mounted () {
    this.scrollEvent();
  },
  destroyed () {
    document.title = title;
    clearInterval(this.interval);
    this.clearTalk();
  },
  methods: {
    // 美化时间格式
    beautifyTime,

    //创建会话
    async createTalk (id) {
      await ServeCreateTalkList(id);

      await this.loadChatList();
    },
    // header 功能栏隐藏事件
    closeSubMenu () {
      this.subMenu = false;
    },

    // 清除当前对话
    clearTalk () {
      this.params = {
        talk_type: 0,
        receiver_id: 0,
        nickname: "",
        clickFlag: true
      };

      this.$store.commit("UPDATE_DIALOGUE_MESSAGE", {
        talk_type: 0,
        receiver_id: 0,
        is_robot: 0,
      });
    },

    // 工具栏事件
    triggerSubMenu (type) {
      this.closeSubMenu();

      if (type == 1) {
        this.launchGroupShow = true;
      } else {
        this.$refs.searchUsers.open();
      }
    },

    // 监听自定义滚动条事件
    scrollEvent () {
      let scrollbarEl = this.$refs.menusScrollbar.wrap;
      scrollbarEl.onscroll = () => {
        this.subHeaderShadow = scrollbarEl.scrollTop > 0;
      };
    },
    // 获取用户对话列表
    loadChatList () {
      this.loadStatus = this.talkNum == 0 ? 0 : 1;

      ServeGetTalkList()
        .then(({ code, result }) => {
          if (code !== 200) return false;
          this.$store.commit("SET_UNREAD_NUM", 0);
          this.$store.commit("SET_TALK_ITEMS", {
            items: result.map((item) => formatTalkItem(item)),
          });

          // 判断
          if (this.$route.query.id) {
            let takeData, takeIndex;
            console.log("用户result", result)
            this.talkItems.forEach((take, index) => {
              if (take.userId == this.$route.query.id) {
                takeData = take;
                takeIndex = index;
              }
            });
            this.$nextTick(() =>
              this.clickTab(this.$route.query.id, takeData, takeIndex)
            );
          }
        })
        .finally(() => {
          this.loadStatus = 1;
        });
    },

    // 切换聊天栏目
    clickTab (id, val, index) {
      if (!id) return;
      this.activeIndex = index;
      let item =
        this.talks.find((item) => {
          return item.userId == id;
        }) || {};
      // 点击当前栏目存储当前用户的信息
      this.$store.state.user.toUser = val;

      let nickname = item.name;

      this.params = {
        talk_type: 1,
        receiver_id: item.userId,
        nickname,
        is_robot: item.is_robot,
        talkId: item.id, //聊天对话的id
        clickFlag: true
      };

      // 更新信息
      this.$store.commit("UPDATE_DIALOGUE_MESSAGE", {
        talk_type: 1,
        receiver_id: item.userId,
        is_robot: item.is_robot,
      });

      this.$nextTick(() => {
        if (id == this.index_name.split("_")[1]) {
          this.$store.commit("UPDATE_TALK_ITEM", {
            userId: id,
            index_name: "MESSAGE_" + this.index_name.split("_")[1],
            unread: 0,
          });
        }
      });
    },
    // 修改当前对话
    changeTalk (index_name) {
      console.log("修改当前对话", index_name);
      sessionStorage.setItem("send_message_index_name", index_name);
      this.loadChatList();
    },
    // 关闭当前对话及刷新对话列表
    closeTalk () {
      this.$store.commit("UPDATE_DIALOGUE_MESSAGE", {
        talk_type: 0,
        receiver_id: 0,
        is_robot: 0,
      });

      this.loadChatList();
    },
    // 对话列表的右键自定义菜单
    talkItemsMenu (item, event) {
      let items = {
        items: [
          {
            label: "好友信息",
            icon: "el-icon-user",
            disabled: item.talk_type == 2 || item.is_robot == 1,
            onClick: () => {
              this.$user(item.receiver_id);
            },
          },
          {
            label: "修改备注",
            icon: "el-icon-edit-outline",
            disabled: item.talk_type == 2 || item.is_robot == 1,
            onClick: () => {
              this.editFriendRemarks(item);
            },
          },
          {
            label: item.is_top == 0 ? "会话置顶" : "取消置顶",
            icon: "el-icon-top",
            onClick: () => {
              this.topChatItem(item);
            },
          },
          {
            label: item.is_disturb == 0 ? "消息免打扰" : "开启消息提示",
            icon:
              item.is_disturb == 0
                ? "el-icon-close-notification"
                : "el-icon-bell",
            disabled: item.is_robot == 1,
            onClick: () => {
              this.setNotDisturb(item);
            },
          },
          {
            label: "移除会话",
            icon: "el-icon-remove-outline",
            divided: true,
            onClick: () => {
              this.delChatItem(item);
            },
          },
          {
            label: item.talk_type == 1 ? "删除好友" : "退出群聊",
            icon: "el-icon-delete",
            disabled: item.is_robot == 1,
            onClick: () => {
              let title = item.talk_type == 1 ? "删除好友" : "退出群聊";
              this.$confirm(
                `此操作将 <span style="color:red;font-size:16px;">${title}</span>, 是否继续?`,
                "提示",
                {
                  confirmButtonText: "确定",
                  cancelButtonText: "取消",
                  type: "warning",
                  center: true,
                  dangerouslyUseHTMLString: true,
                }
              ).then(() => {
                if (item.talk_type == 1) {
                  this.removeFriend(item);
                }
              });
            },
          },
        ],
        event: event,
        zIndex: 3,
      };

      this.$contextmenu(items);
      return false;
    },
    // 置顶栏右键菜单栏
    topItemsMenu (item, event) {
      this.$contextmenu({
        items: [
          {
            label: item.is_top == 0 ? "会话置顶" : "取消置顶",
            icon: "el-icon-top",
            onClick: () => {
              this.topChatItem(item);
            },
          },
        ],
        event: event,
        zIndex: 3,
      });

      return false;
    },
    // 会话列表置顶
    topChatItem (item) {
      ServeTopTalkList({
        list_id: item.id,
        type: item.is_top == 0 ? 1 : 2,
      }).then(({ code }) => {
        if (code == 200) {
          this.$store.commit("UPDATE_TALK_ITEM", {
            index_name: item.index_name,
            is_top: item.is_top == 0 ? 1 : 0,
          });
        }
      });
    },
    // 设置消息免打扰
    setNotDisturb (item) {
      ServeSetNotDisturb({
        talk_type: item.talk_type,
        receiver_id: item.receiver_id,
        is_disturb: item.is_disturb == 0 ? 1 : 0,
      }).then(({ code }) => {
        if (code == 200) {
          this.$store.commit("UPDATE_TALK_ITEM", {
            index_name: item.index_name,
            is_disturb: item.is_disturb == 0 ? 1 : 0,
          });
        }
      });
    },
    // 移除会话列表
    delChatItem (item) {
      ServeDeleteTalkList({
        list_id: item.id,
      }).then(({ code }) => {
        if (code == 200) {
          this.clearTalk();
          this.$store.commit("REMOVE_TALK_ITEM", item.index_name);
        }
      });
    },
    // 解除好友关系
    removeFriend (item) {
      ServeDeleteContact({
        friend_id: item.receiver_id,
      }).then(({ code }) => {
        if (code == 200) {
          if (this.index_name == item.index_name) {
            this.clearTalk();
          }

          this.$store.commit("REMOVE_TALK_ITEM", item.index_name);
        }
      });
    },
    // 修改好友备注信息
    editFriendRemarks (item) {
      let title = `您正在设置【${item.name}】好友的备注信息`;

      if (item.remark_name) {
        title += `，当前备注为【${item.remark_name}】`;
      }

      this.$prompt(title, "修改备注", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        customClass: "border-radius0",
        inputPlaceholder: "请设置好友备注信息",
        inputValue: item.remark_name ? item.remark_name : item.name,
        inputValidator (val) {
          return val == null || val == "" ? "好友备注不能为空" : true;
        },
      })
        .then(({ value }) => {
          if (value == item.remark_name) {
            return false;
          }

          ServeEditContactRemark({
            friend_id: item.receiver_id,
            remarks: value,
          }).then((res) => {
            if (res.code == 200) {
              this.$store.commit("UPDATE_TALK_ITEM", {
                index_name: item.index_name,
                remark_name: value,
              });

              this.$notify({
                title: "成功",
                message: "好友备注修改成功...",
                type: "success",
              });
            } else {
              this.$notify({
                title: "消息",
                message: "好友备注修改失败，请稍后再试...",
                type: "warning",
              });
            }
          });
        })
        .catch(() => { });
    },
  },
};
</script>
<style lang="less" scoped>
/deep/ .el-scrollbar__wrap {
  overflow-x: hidden;
}
.user-status{
  margin-left: 10px;
}
.aside-box {
  position: relative;
  border-right: 1px solid rgb(245, 245, 245);
  overflow: hidden;
  padding: 0;
  transition: width 0.3s;

  .header {
    display: flex;
    flex-direction: row;
    align-items: center;
    padding: 0 15px;

    .from-search {
      flex: 1 1;
      flex-shrink: 0;
      height: 40px;

      /deep/ .el-input .el-input__inner {
        border-radius: 20px;
      }
    }

    .tools {
      flex-basis: 32px;
      flex-shrink: 0;
      height: 32px;
      margin-bottom: 8px;
      margin-left: 15px;
      cursor: pointer;
      line-height: 32px;
      text-align: center;
      position: relative;
      user-select: none;

      .tools-menu {
        position: absolute;
        right: 0;
        top: 38px;
        width: 100px;
        min-height: 80px;
        box-sizing: border-box;
        background-color: rgba(31, 35, 41, 0.9);
        border-radius: 5px;
        z-index: 1;
        padding: 3px 0;

        .menu-item {
          height: 40px;
          line-height: 40px;
          color: white;
          font-size: 14px;

          &:hover {
            background-color: rgba(70, 72, 73, 0.9);
          }
        }
      }
    }
  }

  .subheader {
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
    padding: 3px 8px 10px;
    overflow: hidden;
    flex-shrink: 0;

    .top-item {
      flex-basis: 41px;
      flex-shrink: 0;
      height: 50px;
      margin: 0 1px 6px 1px;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      align-items: center;
      cursor: pointer;

      .avatar {
        flex-basis: 32px;
        width: 32px;
        height: 32px;
        background-color: #508afe;
        border-radius: 50%;
        display: flex;
        justify-content: center;
        align-items: center;
        font-size: 10px;
        color: white;
        flex-shrink: 0;
        overflow: hidden;
        user-select: none;

        img {
          width: 100%;
          height: 100%;
          background-color: white;
        }
      }

      .name {
        font-size: 12px;
        text-align: center;
        color: #8f959e;
        transform: scale(0.84);
        text-align: center;
        line-height: 20px;
        word-break: break-all;
        overflow: hidden;

        &.active {
          color: #508afe;
        }
      }
    }

    &.shadow {
      box-shadow: 0 2px 6px 0 rgba(31, 35, 41, 0.05);
    }
  }
}

.aside-box .main {
  overflow: hidden;
  padding: 0;

  .empty-data {
    text-align: center;
    padding-top: 40px;
    color: #ccc;
  }

  .main-menu {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    padding: 3px 10px 3px 10px;
    align-items: center;
    user-select: none;

    .title {
      font-size: 12px;
      font-weight: 600;
      color: #1f2329;
    }

    .icon {
      cursor: pointer;
    }
  }

  .talk-item {
    padding: 8px 10px;
    height: 50px;
    display: flex;
    flex-direction: row;
    align-items: center;
    border-left: 3px solid transparent;
    transition: 0.2s ease-in;

    .avatar-box {
      height: 35px;
      width: 35px;
      flex-shrink: 0;
      background-color: #508afe;
      border-radius: 50%;
      display: flex;
      justify-content: center;
      align-items: center;
      font-size: 14px;
      color: white;
      user-select: none;
      transition: ease 1s;
      position: relative;
      overflow: hidden;

      img {
        width: 100%;
        height: 100%;
        background-color: white;
        border-radius: 3px;
      }

      .top-mask {
        width: 100%;
        height: 100%;
        background-color: rgba(22, 25, 29, 0.6);
        position: absolute;
        top: 0;
        left: 0;
        color: white;
        display: none;
        align-items: center;
        justify-content: center;
        font-weight: bold;
      }

      &:hover .top-mask {
        display: flex;
      }
    }

    .card-box {
      height: 40px;
      display: flex;
      align-content: center;
      flex-direction: column;
      flex: 1 1;
      margin-left: 10px;
      overflow: hidden;

      .title {
        width: 100%;
        height: 20px;
        display: flex;
        align-items: center;

        .card-name {
          color: #1f2329;
          font-size: 14px;
          line-height: 20px;
          flex: 1 1;
          display: -webkit-flex;
          display: -ms-flexbox;
          display: flex;
          align-items: center;
          overflow: hidden;

          .nickname {
            font-weight: 400;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
            margin-right: 3px;
          }

          .top {
            color: #dc9b04 !important;
            background-color: #faf1d1 !important;
          }

          .group {
            color: #3370ff !important;
            background-color: #e1eaff !important;
            font-size: 13px;
          }

          .disturb {
            color: #98999c !important;
            background-color: #ecedf1 !important;

            i {
              font-size: 12px;
            }
          }
        }
      }

      .card-time {
        color: #8f959e;
        font-size: 12px;
        margin-left: 10px;
        user-select: none;
      }

      .content {
        font-size: 13px;
        line-height: 18px;
        color: #8f959e;
        margin-top: 3px;
        font-weight: 300;
        overflow: hidden;
        white-space: nowrap;
        text-overflow: ellipsis;

        span:first-child {
          margin-right: 5px;
        }

        .online-color {
          color: #4aa71c;
          font-weight: 300;
        }

        .draft-color {
          color: red;
          font-weight: 300;
        }
      }
    }

    &:hover {
      background-color: #eff0f1;
    }

    &.active {
      border-color: #3370ff;
      background-color: #eff0f1;
    }
  }
}

// iphone
@media screen and (max-width: 767px) {

  .side-edge,
  .from-search,
  .card-box {
    display: none !important;
  }

  .aside-box {
    width: 66px !important;

    .subheader {
      display: none;
    }

    .card-box .larkc-tag {
      display: none;
    }
  }
}

.talk-message {
  font-size: 12px;
  color: #8f959e;
}

.user-face {
  height: 100%;
  width: 100%;
}
</style>
