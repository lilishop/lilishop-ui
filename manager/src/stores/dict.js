import { defineStore } from "pinia";

export const useDictStore = defineStore("dict", {
  state: () => ({
    // 经常需要读取的数据字典
    sex: [],
    messageType: [],
    priority: [],
    leaveType: [],
  }),
  actions: {
    // 设置值的改变方法
    setSex(list) {
      this.sex = list;
    },
    setMessageType(list) {
      this.messageType = list;
    },
    setPriority(list) {
      this.priority = list;
    },
    setLeaveType(list) {
      this.leaveType = list;
    },
  },
});
