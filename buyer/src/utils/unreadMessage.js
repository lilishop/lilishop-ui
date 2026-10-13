import { useAppStore } from "@/stores/app";
import storage from "@/plugins/storage";
import { memberMsgList } from "@/api/member";

// 用未读消息总数刷新角标，只取 1 条记录
export function refreshUnreadMessage() {
  if (!storage.getItem("userInfo")) {
    useAppStore().setUnreadMsg(0);
    return Promise.resolve(0);
  }
  return memberMsgList({
    pageNumber: 1,
    pageSize: 1,
    status: "UN_READY",
  })
    .then((res) => {
      const total = res && res.success ? Number(res.result && res.result.total) || 0 : 0;
      useAppStore().setUnreadMsg(total);
      return total;
    })
    .catch(() => {
      return Number(useAppStore().unreadMsg) || 0;
    });
}
