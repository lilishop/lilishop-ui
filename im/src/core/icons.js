import { h } from "vue";

function createSvgIcon(name) {
  return {
    name: `SvgIcon_${name}`,
    inheritAttrs: false,
    render() {
      return h("svg-icon", {
        iconClass: name,
        ...this.$attrs,
      });
    },
  };
}

export const SvgMentionDown = createSvgIcon("mention-down");
export const SvgNotFount = createSvgIcon("not-fount");
export const SvgNote = createSvgIcon("note");
export const SvgNoteBook = createSvgIcon("note-book");
export const SvgNotData = createSvgIcon("not-data");
export const SvgZhuangFa = createSvgIcon("zhuangfa");
