<template>
  <div class="current-preview">
    当前浏览
    <div class="base">
      <div>
        <img :src="goodsDetail.thumbnail" class="image" />
      </div>
      <div style="margin-left: 13px">
        <a @click="linkToGoods(goodsDetail.goodsId, goodsDetail.id)"> {{ goodsDetail.goodsName }} </a>
        <div>
          <span style="color: red;">{{ goodsDetail.price | unitPrice('￥') }}</span>
        </div>
        <div v-if="hide">
          <el-button class="store-button" type="danger" v-if="btnHide == 1 && toUser.storeFlag" size="mini"
            @click="submitSendMessage()" plain>发送</el-button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { Tag, button } from 'element-ui'
import { mapState, mapGetters } from "vuex";
import SocketInstance from "@/im-server/socket-instance";
export default {
  data () {
    return {
      btnHide: undefined,
      hide: true
    }
  },
  computed: {
    ...mapGetters(["talkItems"]),
    ...mapState({
      id: (state) => state.user.id,
      index_name: (state) => state.dialogue.index_name,
      toUser: (state) => state.user.toUser,
    }),
  },
  mounted () {
    console.log(this.goodsDetail)
    this.btnHide = localStorage.getItem('btnHide')
  },
  components: {
    "el-tag": Tag,
    "el-button": button,
    Storage
  },
  methods: {
    toGoods () {
      alert("toGoods")
    },
    toMessage () {
      alert(JSON.stringify(this.toUser))
      alert("toMessage")
    },
    // 回车键发送消息回调事件
    submitSendMessage () {
      console.log("发送");
      const context = this.goodsDetail
      const record = {
        operation_type: "MESSAGE",
        to: this.toUser.userId,
        from: this.id,
        message_type: "GOODS",
        context: context,
        talk_id: this.toUser.id,
      };
      SocketInstance.emit("event_talk", record);

      this.$store.commit("UPDATE_TALK_ITEM", {
        index_name: this.index_name,
        draft_text: "",
      });


      /**
       * 插入数据
       */
      const insterChat = {
        createTime: this.formateDateAndTimeToString(new Date()),
        fromUser: this.id,
        toUser: record.to,
        isRead: false,
        messageType: "GOODS",
        text: context,
        float: "right",
      };

      console.log("insterChat", insterChat);
      // console.log("插入对话记录",'')
      // 插入对话记录
      this.$store.commit("PUSH_DIALOGUE", insterChat);
      // 获取聊天面板元素节点
      let el = document.getElementById("lumenChatPanel");
      // 判断的滚动条是否在底部
      let isBottom =
        Math.ceil(el.scrollTop) + el.clientHeight >= el.scrollHeight;

      if (isBottom || record.to == this.id) {
        this.$nextTick(() => {
          el.scrollTop = el.scrollHeight;
        });
      } else {
        this.$store.commit("SET_TLAK_UNREAD_MESSAGE", {
          content: content,
          nickname: record.name,
        });
      }
      // 发送后隐藏按钮  0：隐藏 1：显示
      localStorage.setItem('btnHide', 0)
      this.hide = false
    },

    formateDateAndTimeToString (date) {
      var hours = date.getHours();
      var mins = date.getMinutes();
      var secs = date.getSeconds();
      var msecs = date.getMilliseconds();
      if (hours < 10) hours = "0" + hours;
      if (mins < 10) mins = "0" + mins;
      if (secs < 10) secs = "0" + secs;
      if (msecs < 10) secs = "0" + msecs;
      return (
        this.formatDateToString(date) + " " + hours + ":" + mins + ":" + secs
      );
    },

    formatDateToString (date) {
      var year = date.getFullYear();
      var month = date.getMonth() + 1;
      var day = date.getDate();
      if (month < 10) month = "0" + month;
      if (day < 10) day = "0" + day;
      return year + "-" + month + "-" + day;
    },
  },
  props: {
    goodsDetail: {
      type: Object,
      default: null,
    },
  },
}

</script>

<style scoped lang="less">
.store-button {
  background-color: white;
  border-color: #F56C6C;
}
.current-preview{
  padding: 16px;
}

.base {
  margin-top: 5px;
  height: 120px;
  display: flex;

  div {
    overflow: hidden;
    text-overflow: ellipsis;
    margin-top: 8px;
    white-space: nowrap;
    margin-top: 8px;
  }

  .image {
    height: 100px;
    margin-top: 3px;
    width: 100px;
  }

}

.click-button {
  margin-top: 8px;
  background-color: white;
  border-color: #F56C6C;
}

.separate {
  margin-top: 8px;
}
</style>