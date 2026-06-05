function onClickOutside(el, binding) {
  const handler = (e) => {
    if (!el.contains(e.target)) {
      binding.value(e);
    }
  };
  el.__clickOutsideHandler__ = handler;
  document.addEventListener("click", handler);
}

function offClickOutside(el) {
  if (el.__clickOutsideHandler__) {
    document.removeEventListener("click", el.__clickOutsideHandler__);
    delete el.__clickOutsideHandler__;
  }
}

export function registerDirectives(app) {
  app.directive("focus", {
    mounted(el) {
      el.focus();
    },
  });

  app.directive("paste", {
    mounted(el, binding) {
      el.addEventListener("paste", (event) => {
        binding.value(event);
      });
    },
  });

  app.directive("drag", {
    mounted(el, binding) {
      const stop = (event) => {
        event.stopPropagation();
        event.preventDefault();
      };
      el.addEventListener("dragenter", stop);
      el.addEventListener("dragover", stop);
      el.addEventListener("dragleave", stop);
      el.addEventListener("drop", (event) => {
        stop(event);
        binding.value(event);
      });
    },
  });

  app.directive("outside", {
    mounted(el, binding) {
      onClickOutside(el, binding);
    },
    unmounted(el) {
      offClickOutside(el);
    },
  });
}
