import { createApp, h } from "vue";
import UserCardDetail from "./UserCardDetail";
import router from "@/router";
import store from "@/store";
import { setupElementPlus } from "@/plugins/element";
import { setupLegacyMessage } from "@/utils/message";
import { registerDirectives } from "@/core/directives";
import LegacyElIcon from "@/components/global/LegacyElIcon.vue";
import { resolveLegacyIcon } from "@/core/legacy-icon-map";

export default {
  install(app) {
    function user(user_id, options) {
      const container = document.createElement("div");
      document.body.appendChild(container);

      const cardApp = createApp({
        render() {
          return h(UserCardDetail, {
            user_id,
            onClose: () => {
              cardApp.unmount();
              document.body.removeChild(container);
            },
            onChangeRemark: (data) => {
              options.editRemarkCallbak && options.editRemarkCallbak(data);
            },
          });
        },
      });

      setupElementPlus(cardApp);
      setupLegacyMessage(cardApp);
      registerDirectives(cardApp);
      cardApp.component("legacy-el-icon", LegacyElIcon);
      cardApp.config.globalProperties.$legacyIcon = resolveLegacyIcon;
      cardApp.use(router);
      cardApp.use(store);
      cardApp.mount(container);
    }

    app.config.globalProperties.$user = user;
  },
};
