<template>
  <div style="width: 350px;">
    <div class="base">
      <div>
        <img :src="goodsDetail.thumbnail" class="image" />
      </div>
      <div style="margin-left: 13px">
        <a @click="linkToGoods(goodsDetail.goodsId, goodsDetail.id)"> {{ goodsDetail.goodsName }} </a>
        <div>
          <span style="color: red;">￥{{ goodsDetail.price }}</span>
        </div>
        <div v-if="hide">
          <el-button class="store-button" type="danger" v-if="btnHide == 1" size="mini" @click="submitSendMessage()"
            plain>发送</el-button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { Tag, button } from 'element-ui'
import { mapState, mapGetters } from "vuex";

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

      toUser: (state) => state.user.toUser,
    }),
  },
  mounted () {
    this.btnHide = localStorage.getItem(this.goodsDetail.goodsId)
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
      const context = {
        id: this.goodsDetail.id,
        goodsId: this.goodsDetail.goodsId,
        thumbnail: this.goodsDetail.thumbnail,
        price: this.goodsDetail.price,
        goodsName: this.goodsDetail.goodsName
      }

      const record = {
        operation_type: "MESSAGE",
        to: this.toUser.userId,
        from: this.id,
        message_type: "GOODS",
        context: context,
        talk_id: this.toUser.id,
      };
      this.$emit('sendMessage', record, context);
      // 发送后隐藏按钮  0：隐藏 1：显示
      localStorage.setItem(this.goodsDetail.goodsId, 0)
      this.hide = false
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
    width: 100px
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