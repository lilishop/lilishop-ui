import { defineStore } from "pinia";
import { ServeFindUserEmoticon, ServeUploadEmoticon } from "@/api/emoticon";
import { ServeCollectEmoticon } from "@/api/chat";
import { ElNotification } from "element-plus";

// 原 vuex emoticon 模块
export const useEmoticonStore = defineStore("emoticon", {
  state: () => ({
    items: [],
  }),
  actions: {
    // 加载用户表情包
    LOAD_USER_EMOTICON() {
      // TODO 隐藏
      return;
      // eslint-disable-next-line no-unreachable
      ServeFindUserEmoticon().then((res) => {
        if (res.code == 200) {
          const { collect_emoticon, sys_emoticon } = res.data;

          this.items = this.items.slice(0, 2);

          // 用户收藏的系统表情包
          this.items[1].list = collect_emoticon;

          // 用户添加的系统表情包
          this.items.push(...sys_emoticon);
        }
      });
    },

    // 收藏用户表情包
    SAVE_USER_EMOTICON(resoure) {
      ServeCollectEmoticon({
        record_id: resoure.record_id,
      })
        .then((res) => {
          if (res.code == 200) {
            ElNotification({
              title: "收藏提示",
              message: "表情包收藏成功...",
              type: "success",
            });

            this.LOAD_USER_EMOTICON();
          }
        })
        .catch(() => {
          ElNotification({
            title: "收藏提示",
            message: "表情包收藏失败...",
            type: "warning",
          });
        });
    },

    // 自定义上传用户表情包
    UPLOAD_USER_EMOTICON(resoure) {
      let fileData = new FormData();
      fileData.append("emoticon", resoure.file);
      ServeUploadEmoticon(fileData)
        .then((res) => {
          if (res.code == 200) {
            this.items[1].list.push(res.data);
          }
        })
        .catch(() => {
          ElNotification({
            message: "网络异常请稍后再试...",
            type: "error",
            duration: 3000,
          });
        });
    },

    // 添加系统表情包
    APPEND_SYS_EMOTICON(resoure) {
      this.items.push(resoure);
    },

    // 移除系统表情包
    REMOVE_SYS_EMOTICON(resoure) {
      for (let i in this.items) {
        if (this.items[i].emoticon_id === resoure.emoticon_id) {
          this.items.splice(i, 1);
          break;
        }
      }
    },
  },
});
