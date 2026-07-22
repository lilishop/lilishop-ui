import { createApp, h, onMounted, onUnmounted } from "vue";
import LegacyElIcon from "@/components/global/LegacyElIcon.vue";

let activeMenu = null;

function destroyMenu() {
  if (!activeMenu) return;
  activeMenu.app.unmount();
  if (activeMenu.el?.parentNode) {
    activeMenu.el.parentNode.removeChild(activeMenu.el);
  }
  activeMenu = null;
}

function normalizeOptions(options) {
  if (Array.isArray(options)) {
    return { items: options };
  }
  return options || { items: [] };
}

function showContextmenu(options) {
  destroyMenu();

  const {
    items = [],
    event,
    x = 0,
    y = 0,
    customClass = "",
    zIndex = 3000,
    minWidth = 120,
  } = normalizeOptions(options);

  const left = event?.clientX ?? x;
  const top = event?.clientY ?? y;
  const el = document.createElement("div");
  document.body.appendChild(el);

  const app = createApp({
    setup() {
      const close = () => destroyMenu();

      onMounted(() => {
        document.addEventListener("click", close);
        document.addEventListener("contextmenu", close);
        document.addEventListener("wheel", close, { passive: true });
      });

      onUnmounted(() => {
        document.removeEventListener("click", close);
        document.removeEventListener("contextmenu", close);
        document.removeEventListener("wheel", close);
      });

      return () =>
        h(
          "div",
          {
            class: ["im-contextmenu", customClass].filter(Boolean),
            style: {
              position: "fixed",
              left: `${left}px`,
              top: `${top}px`,
              zIndex,
              minWidth: `${minWidth}px`,
            },
            onContextmenu: (e) => e.preventDefault(),
          },
          items.flatMap((item, index) => {
            const nodes = [];
            if (item.divided && index > 0) {
              nodes.push(h("div", { class: "im-contextmenu-divider" }));
            }
            nodes.push(renderMenuItem(item, close));
            return nodes;
          })
        );
    },
  });

  activeMenu = { app, el };
  app.mount(el);
}

function renderMenuItem(item, close) {
  return h(
    "div",
    {
      class: [
        "im-contextmenu-item",
        item.customClass,
        item.disabled ? "is-disabled" : "",
      ].filter(Boolean),
      onClick: (e) => {
        e.stopPropagation();
        if (item.disabled) return;
        item.onClick?.();
        close();
      },
    },
    [
      item.icon ? h(LegacyElIcon, { name: item.icon }) : null,
      h("span", item.label),
    ]
  );
}

export function setupContextmenu(app) {
  app.config.globalProperties.$contextmenu = showContextmenu;
}
