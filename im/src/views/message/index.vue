<template>
  <div class="wrapper">
    <MainLayout :idx="0" ref="mainLayout">
      <template #container>
      <el-container class="full-height">
        <!-- 左侧侧边栏 -->
        <el-aside width="320px" class="aside-box">
          <el-container class="full-height" direction="vertical">
            <!-- 搜索栏 -->
            <el-header height="60px" class="header">
              <div class="user-login">
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
                <el-input v-model="input" :prefix-icon="$legacyIcon('el-icon-search')" placeholder="搜索好友" size="small" />
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
                    <img v-show="item.face" :src="item.face" :onerror="defaultAvatar" v-if="item.face" />
                    <face-null :text="item.name" v-else></face-null>
                  </div>
                </el-tooltip>

                <div class="name" :class="{ active: index_name === item.id }">
                  {{ item.name ? item.name : item.name }}
                </div>
              </div>
            </el-header>

            <!-- 对话列表栏 -->
            <el-scrollbar tag="section" ref="menusScrollbar" class="full-height" :native="false" @scroll="onMenusScroll">
              <el-main class="main">
                <p v-show="loadStatus === 0 && userTalkItem.length === 0" class="empty-data">
                  <legacy-el-icon name="el-icon-loading" /> 数据加载中...
                </p>

                <p v-show="loadStatus === 1 && talkNum === 0" class="empty-data">
                  暂无聊天消息
                </p>

                <p v-show="loadStatus === 1 && talkNum > 0" class="main-menu">
                  <span class="title">对话记录({{ talkNum }})</span>

                  <!-- <el-tag size="small" type="danger" v-if="myUnreadNum"
                    >未读：{{ myUnreadNum }}</el-tag
                  > -->
                </p>
                <!-- 对话列表 -->
                <RecycleScroller
                  :item-size="64"
                  :items="userTalkItem"
                    :prerender="10"
                  v-slot="{ item, index }"
                >

                  <div v-bind:key="item.id" class="talk-item pointer" :class="{ active: activeIndex == index }" @click="clickTab(item.userId, item, index)">
                    <div class="avatar-box">
                      <face :text="item.face" v-if="item.face"></face>
                      <face-null :text="item.name" v-else></face-null>
                      <div v-show="item.is_top == 0" class="top-mask" @click.stop="topChatItem(item)">
                        <legacy-el-icon name="el-icon-top" />
                      </div>
                    </div>
                    <div class="card-box">
                      <div class="title">
                        <div class="card-name">
                          <p class="nickname">
                            {{ item.remark_name ? item.remark_name : item.name }}
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
                        <template v-if="index_name != item.index_name && item.draft_text">
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
                </RecycleScroller>
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
      </template>
    </MainLayout>

    <!-- 用户查询组件 -->
    <UserSearch ref="searchUsers" />
  </div>
</template>
<script setup>
import {
  computed,
  getCurrentInstance,
  nextTick,
  onBeforeUnmount,
  ref,
  watch,
} from "vue";
import { onBeforeRouteUpdate, useRoute } from "vue-router";
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
import { syncImTokenFromRoute } from "@/utils/im-mode";
import { ElMessageBox, ElNotification } from "@/utils/message";
import { useAppStore } from "@/stores/app";
import { useUserStore } from "@/stores/user";
import { useTalkStore } from "@/stores/talk";
import { useNotifyStore } from "@/stores/notify";
import { useDialogueStore } from "@/stores/dialogue";

const title = document.title;

defineOptions({ name: "MessagePage" });

const route = useRoute();

// 全局属性（$user/$contextmenu）与全局 mixin 方法（initialize/loadUserSetting）经实例代理访问
const instance = getCurrentInstance();
const { proxy } = instance;

const appStore = useAppStore();
const userStore = useUserStore();
const talkStore = useTalkStore();
const notifyStore = useNotifyStore();
const dialogueStore = useDialogueStore();

const searchUsers = ref(null);

const activeIndex = ref(9999999); //默认样式索引
const subHeaderShadow = ref(false);
const launchGroupShow = ref(false);

// 对话面板的传递参数
const params = ref({
  talk_type: 0,
  receiver_id: 0,
  nickname: "",
  clickFlag: true,
});

const goodsParams = ref({
  goodsId: '',
  skuId: '',
});

// 查询关键词
const input = ref("");

// header 工具菜单
const subMenu = ref(false);

// 对话消息列表加载状态[0:加载中;1:加载完成;2:加载失败;]
// 注意：不能命名为 loadStatus——全局 main-mixin 的 loadStoreChatList 会以
// Options API 方式（this.loadStatus = ...）写入它，而 <script setup> 的同名绑定
// 会被 Vue 公共代理拦截（dev 下直接拒绝写入）。故改用内部 ref，
// 并以 loadStatus 为名桥接到 ctx，供模板（_ctx.loadStatus）与 mixin 读写。
const loadStatusRef = ref(0);

// 消息未读数计时器
let interval = null;
const userTalkItem = ref([]);

// 原 vuex mapGetters(["topItems", "talkItems", "unreadNum", "talkNum"])
const topItems = computed(() => talkStore.topItems);
const talkItems = computed(() => talkStore.talkItems);
const unreadNum = computed(() => talkStore.unreadNum);
const talkNum = computed(() => talkStore.talkNum);

// 原 vuex mapState
const face = computed(() => userStore.face);
const name = computed(() => userStore.name);
const talks = computed(() => talkStore.items);
const id = computed(() => userStore.id);
const index_name = computed(() => dialogueStore.index_name);
const monitorFriendsStatus = computed(() => notifyStore.friendStatus);
const myUnreadNum = computed(() => notifyStore.unreadNum);
const toUser = computed(() => userStore.toUser);

// 原模板中的 $store.state.defaultAvatar（根级 state）
const defaultAvatar = computed(() => appStore.defaultAvatar);

// 计算置顶栏目的高度
const subHeaderPx = computed(() => {
  const n = 7; // 一排能显示的用户数
  const num = topItems.value.length;
  let len = 60;

  if (num > n) {
    len = (Math.floor(num / n) + (num % n > 0 ? 1 : 0)) * len;
  }

  return `${len}px`;
});

// 当前对话好友在线状态
const isFriendOnline = computed(() => {
  let index = findTalkIndex(index_name.value);
  return index >= 0 && talks.value[index].is_online == 1;
});

// 全局 main-mixin 的方法（loadUserSetting/loadStoreChatList）以组件公共实例代理为
// this 回调本组件：createTalk/loadChatList/clickTab、读 goodsParams/talkNum、
// 读写 loadStatus。<script setup> 绑定对公共代理不可见，故桥接到 instance.ctx；
// 同时 defineExpose 供外部通过 ref 访问。
defineExpose({
  createTalk,
  loadChatList,
  clickTab,
  goodsParams,
  talkNum,
  loadStatus: loadStatusRef,
});
Object.defineProperties(instance.ctx, {
  createTalk: { configurable: true, value: createTalk },
  loadChatList: { configurable: true, value: loadChatList },
  clickTab: { configurable: true, value: clickTab },
  goodsParams: { configurable: true, get: () => goodsParams.value },
  talkNum: { configurable: true, get: () => talkNum.value },
  loadStatus: {
    configurable: true,
    get: () => loadStatusRef.value,
    set: (v) => {
      loadStatusRef.value = v;
    },
  },
});

// 初始化商品参数
function initGoodsParams(query) {
  goodsParams.value = {
    goodsId: query.goodsId || '',
    skuId: query.skuId || '',
  };

  console.log('初始化商品参数:', goodsParams.value);
}

//创建会话
async function createTalk(id) {
  await ServeCreateTalkList(id);

  await loadChatList();
}

// header 功能栏隐藏事件
function closeSubMenu() {
  subMenu.value = false;
}

// 清除当前对话
function clearTalk() {
  params.value = {
    talk_type: 0,
    receiver_id: 0,
    nickname: "",
    clickFlag: true
  };

  dialogueStore.UPDATE_DIALOGUE_MESSAGE({
    talk_type: 0,
    receiver_id: 0,
    is_robot: 0,
  });
}

// 工具栏事件
function triggerSubMenu(type) {
  closeSubMenu();

  if (type == 1) {
    launchGroupShow.value = true;
  } else {
    searchUsers.value.open();
  }
}

// 左侧会话列表滚动时，控制置顶栏阴影
function onMenusScroll({ scrollTop }) {
  subHeaderShadow.value = scrollTop > 0;
}

// 获取用户对话列表
function loadChatList() {
  loadStatusRef.value = talkNum.value == 0 ? 0 : 1;

  return ServeGetTalkList()
    .then(({ code, result }) => {
      if (code !== 200 || !Array.isArray(result)) return false;
      notifyStore.SET_UNREAD_NUM(0);
      talkStore.SET_TALK_ITEMS({
        items: result.map((item) => formatTalkItem(item)),
      });

      if (route.query.id) {
        const targetId = route.query.id;
        const takeIndex = talkItems.value.findIndex(
          (take) => take.userId == targetId
        );
        const takeData = takeIndex >= 0 ? talkItems.value[takeIndex] : null;
        if (takeData) {
          clickTab(targetId, takeData, takeIndex);
        }
      }
    })
    .catch(() => {})
    .finally(() => {
      loadStatusRef.value = 1;
    });
}

// 切换聊天栏目
function clickTab(id, val, index) {
  if (!id) return;
  activeIndex.value = index;
  let item =
    talks.value.find((item) => {
      return item.userId == id;
    }) || val || {};
  // 点击当前栏目存储当前用户的信息
  userStore.toUser = val || item;

  let nickname = item.name;
  const talkId = item.id || val?.id;

  if (!talkId) return;

  params.value = {
    talk_type: 1,
    receiver_id: item.userId || id,
    nickname,
    is_robot: item.is_robot,
    talkId,
    clickFlag: true
  };

  // 更新信息
  dialogueStore.UPDATE_DIALOGUE_MESSAGE({
    talk_type: 1,
    receiver_id: item.userId,
    is_robot: item.is_robot,
  });

  nextTick(() => {
    if (id == index_name.value.split("_")[1]) {
      talkStore.UPDATE_TALK_ITEM({
        userId: id,
        index_name: "MESSAGE_" + index_name.value.split("_")[1],
        unread: 0,
      });
    }
  });
}

// 修改当前对话
function changeTalk(index_name) {
  console.log("修改当前对话", index_name);
  sessionStorage.setItem("send_message_index_name", index_name);
  loadChatList();
}

// 关闭当前对话及刷新对话列表
function closeTalk() {
  dialogueStore.UPDATE_DIALOGUE_MESSAGE({
    talk_type: 0,
    receiver_id: 0,
    is_robot: 0,
  });

  loadChatList();
}

// 对话列表的右键自定义菜单
function talkItemsMenu(item, event) {
  let items = {
    items: [
      {
        label: "好友信息",
        icon: "el-icon-user",
        disabled: item.talk_type == 2 || item.is_robot == 1,
        onClick: () => {
          proxy.$user(item.receiver_id);
        },
      },
      {
        label: "修改备注",
        icon: "el-icon-edit-outline",
        disabled: item.talk_type == 2 || item.is_robot == 1,
        onClick: () => {
          editFriendRemarks(item);
        },
      },
      {
        label: item.is_top == 0 ? "会话置顶" : "取消置顶",
        icon: "el-icon-top",
        onClick: () => {
          topChatItem(item);
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
          setNotDisturb(item);
        },
      },
      {
        label: "移除会话",
        icon: "el-icon-remove-outline",
        divided: true,
        onClick: () => {
          delChatItem(item);
        },
      },
      {
        label: item.talk_type == 1 ? "删除好友" : "退出群聊",
        icon: "el-icon-delete",
        disabled: item.is_robot == 1,
        onClick: () => {
          let title = item.talk_type == 1 ? "删除好友" : "退出群聊";
          ElMessageBox.confirm(
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
              removeFriend(item);
            }
          });
        },
      },
    ],
    event: event,
    zIndex: 3,
  };

  proxy.$contextmenu(items);
  return false;
}

// 置顶栏右键菜单栏
function topItemsMenu(item, event) {
  proxy.$contextmenu({
    items: [
      {
        label: item.is_top == 0 ? "会话置顶" : "取消置顶",
        icon: "el-icon-top",
        onClick: () => {
          topChatItem(item);
        },
      },
    ],
    event: event,
    zIndex: 3,
  });

  return false;
}

// 会话列表置顶
function topChatItem(item) {
  ServeTopTalkList({
    list_id: item.id,
    type: item.is_top == 0 ? 1 : 2,
  }).then(({ code }) => {
    if (code == 200) {
      talkStore.UPDATE_TALK_ITEM({
        index_name: item.index_name,
        is_top: item.is_top == 0 ? 1 : 0,
      });
    }
  });
}

// 设置消息免打扰
function setNotDisturb(item) {
  ServeSetNotDisturb({
    talk_type: item.talk_type,
    receiver_id: item.receiver_id,
    is_disturb: item.is_disturb == 0 ? 1 : 0,
  }).then(({ code }) => {
    if (code == 200) {
      talkStore.UPDATE_TALK_ITEM({
        index_name: item.index_name,
        is_disturb: item.is_disturb == 0 ? 1 : 0,
      });
    }
  });
}

// 移除会话列表
function delChatItem(item) {
  ServeDeleteTalkList({
    list_id: item.id,
  }).then(({ code }) => {
    if (code == 200) {
      clearTalk();
      talkStore.REMOVE_TALK_ITEM(item.index_name);
    }
  });
}

// 解除好友关系
function removeFriend(item) {
  ServeDeleteContact({
    friend_id: item.receiver_id,
  }).then(({ code }) => {
    if (code == 200) {
      if (index_name.value == item.index_name) {
        clearTalk();
      }

      talkStore.REMOVE_TALK_ITEM(item.index_name);
    }
  });
}

// 修改好友备注信息
function editFriendRemarks(item) {
  let title = `您正在设置【${item.name}】好友的备注信息`;

  if (item.remark_name) {
    title += `，当前备注为【${item.remark_name}】`;
  }

  ElMessageBox.prompt(title, "修改备注", {
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
          talkStore.UPDATE_TALK_ITEM({
            index_name: item.index_name,
            remark_name: value,
          });

          ElNotification({
            title: "成功",
            message: "好友备注修改成功...",
            type: "success",
          });
        } else {
          ElNotification({
            title: "消息",
            message: "好友备注修改失败，请稍后再试...",
            type: "warning",
          });
        }
      });
    })
    .catch(() => { });
}

watch(talkItems, (val) => {
  if (val) userTalkItem.value = val;
});

// 搜索用户的时候 根据当前用户表进行模糊搜索
watch(input, (val, oldVal) => {
  console.log(val, oldVal);
  if (val) {
    let str = ["", ...val, ""].join(".*");
    let reg = new RegExp(str);
    userTalkItem.value = talkItems.value.filter((item) =>
      reg.test(item.name)
    );
  } else {
    userTalkItem.value = talkItems.value;
  }
});

watch(unreadNum, (value) => {
  clearInterval(interval);
  // console.log("%c 更新未读消息", "color:#32ccbc");
  notifyStore.SET_UNREAD_NUM(value);

  if (value > 0) {
    interval = setInterval(() => {
      document.title =
        document.title == title ? `【新消息】${title}` : title;
    }, 2000);
  } else {
    document.title = title;
  }
});

// 监听好友在线状态
watch(monitorFriendsStatus, (value) => {
  talkStore.UPDATE_TALK_ITEM({
    index_name: `1_${value.friend_id}`,
    is_online: value.status,
  });
});

onBeforeRouteUpdate((to, from, next) => {
  syncImTokenFromRoute(to, setToken);
  let index_name = getCacheIndexName();
  if (index_name) clickTab(index_name);
  // 更新商品参数
  initGoodsParams(to.query);
  next();
});

// 原 beforeCreate
syncImTokenFromRoute(route, setToken);

// 原 async created（保持 await 顺序，但用 IIFE 避免 setup 变为异步）
(async () => {
  await proxy.initialize();
  await proxy.loadUserSetting();
  // 初始化商品参数
  initGoodsParams(route.query);
  /**
   * 如果说有id 说明是用户点击 “联系客服” 进入的该页面
   * 所以创建会话 并请求用户列表
   * 如果没有id说明当前商家登录 直接请求用户列表
   */
})();

onBeforeUnmount(() => {
  document.title = title;
  clearInterval(interval);
  clearTalk();
});
</script>
<style lang="less" scoped>
:deep(.el-scrollbar__wrap ) {
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

      :deep(.el-input .el-input__inner ) {
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
