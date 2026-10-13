import { defineStore } from "pinia";

// 原 vuex note 模块
export const useNoteStore = defineStore("note", {
  state: () => ({
    tags: [],
    class: [],
  }),
  actions: {
    SET_NOTE_TAGS(tags) {
      this.tags = tags;
    },

    PUSH_NOTE_TAG(tag) {
      this.tags.unshift(tag);
    },
  },
});
