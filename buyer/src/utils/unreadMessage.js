import store from "@/vuex/store";
import storage from "@/plugins/storage";
import { memberMsgList } from "@/api/member";

// 用未读消息总数刷新角标，只取 1 条记录
export function refreshUnreadMessage() {
  if (!storage.getItem("userInfo")) {
    store.commit("SET_UNREAD_MSG", 0);
    return Promise.resolve(0);
  }
  return memberMsgList({
    pageNumber: 1,
    pageSize: 1,
    status: "UN_READY",
  })
    .then((res) => {
      const total = res && res.success ? Number(res.result && res.result.total) || 0 : 0;
      store.commit("SET_UNREAD_MSG", total);
      return total;
    })
    .catch(() => {
      return Number(store.state.unreadMsg) || 0;
    });
}
