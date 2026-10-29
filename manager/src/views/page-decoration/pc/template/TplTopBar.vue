<template>
  <div class="tpl-top-bar" :style="customStyle">
    <div class="bar-inner">
      <div class="bar-left">
        <span class="welcome-txt">{{ options.welcomeText || '欢迎来到商城' }}</span>
        <span class="auth-links">
          <span class="auth-btn">[{{ options.loginText || '登录' }}]</span>
          <span class="auth-btn">[{{ options.registerText || '免费注册' }}]</span>
        </span>
      </div>
      <div class="bar-right">
        <span
          v-for="(menu, idx) in (options.rightMenus || defaultMenus)"
          :key="idx"
          class="bar-link"
        >
          {{ menu.title }}
        </span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  options: {
    type: Object,
    default: () => ({})
  },
  componentStyle: {
    type: Object,
    default: () => ({})
  }
});

const defaultMenus = [
  { title: '基本信息', url: '/home/UserInfo' },
  { title: '我的订单', url: '/home/MyOrder' },
  { title: '账户安全', url: '/home/AccountSafe' },
  { title: '消息', url: '/home/Msg' }
];

const customStyle = computed(() => {
  const s = props.componentStyle || {};
  const opt = props.options || {};
  const textColor = opt.textColor || s.textColor || '#4b5563';
  const fontSize = opt.fontSize ? `${opt.fontSize}px` : '12px';

  return {
    backgroundColor: s.backgroundColor || 'transparent',
    color: textColor,
    fontSize: fontSize,
    height: `${s.height || 36}px`,
    lineHeight: `${s.height || 36}px`
  };
});
</script>

<style lang="scss" scoped>
.tpl-top-bar {
  width: 100%;
  max-width: 100%;
  box-sizing: border-box;
  font-size: 12px;
  user-select: none;
  overflow: hidden;

  *, *::before, *::after {
    box-sizing: border-box;
  }

  .bar-inner {
    width: 1200px;
    max-width: 100%;
    margin: 0 auto;
    padding: 0;
    box-sizing: border-box;
    display: flex;
    justify-content: space-between;
    align-items: center;
    height: 100%;

    .bar-left {
      display: flex;
      align-items: center;
      gap: 10px;
      flex-shrink: 0;
      white-space: nowrap;

      .welcome-txt {
        white-space: nowrap;
      }

      .auth-links {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        white-space: nowrap;

        .auth-btn {
          color: #409EFF;
          cursor: pointer;
          &:hover {
            text-decoration: underline;
          }
        }
      }
    }

    .bar-right {
      display: flex;
      align-items: center;
      gap: 18px;
      flex-shrink: 0;
      white-space: nowrap;

      .bar-link {
        cursor: pointer;
        transition: color 0.2s;
        white-space: nowrap;

        &:hover {
          color: #409EFF;
        }
      }
    }
  }
}
</style>
