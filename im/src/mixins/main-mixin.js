import SocketInstance from "@/im-server/socket-instance";
import { ServeGetUserSetting,ServeGetStoreSetting } from "@/api/user";
import store from "@/store";
import { ServeGetTalkList,ServeGetStoreTalkList } from "@/api/chat";
import { formatTalkItem } from "@/utils/talk";
export default {
  
  created() {
    // 判断用户是否登录
    
  },
  methods: {
    // 页面初始化设置
    initialize() {
      SocketInstance.connect();
    },

    // 加载用户相关设置信息，更新本地缓存
    loadUserSetting() {
      //标识没有值,获取用户信息

      if(this.$route.query.id){
        return ServeGetUserSetting().then(async ({ code, result }) => {
          // 如果result有值说明用户创建成功
          if (result) {
            store.commit("UPDATE_USER_INFO", {
              id: result.id,
              face: result.face,
              name: result.nickName,
            });
            /**
             * 用户像商家进行聊天，商家进行刷新好友列表
             */
            if (this.$route.query.id) {
              if (typeof this.createTalk === "function") {
                await this.createTalk(this.$route.query.id);
              } else if (typeof this.loadChatList === "function") {
                await this.loadChatList();
              }
            }
            if(this.$route.query.goodsId && this.$route.query.skuId && this.goodsParams){
              this.goodsParams.goodsId = this.$route.query.goodsId
              this.goodsParams.skuId = this.$route.query.skuId
            }
          } else if (code === 200 && !result) {
            setTimeout(() => {
              this.loadUserSetting();
            }, 2000);
          }
        });
      }else{
        //标识有值代表是店铺
        return ServeGetStoreSetting().then(async ({ code, result }) => {
          if (result) {
            store.commit("UPDATE_USER_INFO", {
              id: result.id,
              face: result.storeLogo,
              name: result.storeName,
            });
            //获取店铺聊天列表
            if (typeof this.loadStoreChatList === "function") {
              await this.loadStoreChatList()
            }
          }else if (code === 200 && !result) {
            setTimeout(() => {
              this.loadUserSetting();
            }, 2000);
          }
        })
      }
    },


     // 获取用户对话列表
     loadChatListInJs() {
    
      ServeGetTalkList()
        .then(({ code, result }) => {
          if (code !== 200) return false;
          store.commit("SET_UNREAD_NUM", 0);
          store.commit("SET_TALK_ITEMS", {
            items: result.map((item) => formatTalkItem(item)),
          });
          let index_name = sessionStorage.getItem("send_message_index_name");
          if (index_name) {
            sessionStorage.removeItem("send_message_index_name");
          }
        })
        .finally(() => {
         
        });
    },

    
    //获取商家聊天记录
    loadStoreChatList() {
      this.loadStatus = this.talkNum == 0 ? 0 : 1;
      return ServeGetStoreTalkList().then(({ code, result }) => {
        if (code !== 200 || !Array.isArray(result)) return false;
        this.$store.commit("SET_UNREAD_NUM", 0);
        this.$store.commit("SET_TALK_ITEMS", {
          items: result.map((item) => formatTalkItem(item)),
        });

        // 判断
        if (this.$route.query.id) {
          let takeData, takeIndex;
          result.forEach((take, index) => {
            if (take.id == this.$route.query.id) {
              takeData = take;
              takeIndex = index;
            }
          });
          this.$nextTick(() =>
            this.clickTab(this.$route.query.id, takeData, takeIndex)
          );
        }
      }).finally(() => {
        this.loadStatus = 1;
      });
    },


    reload() {
      import("@/utils/app-bridge").then(({ refreshView }) => refreshView());
    },
  },
};
