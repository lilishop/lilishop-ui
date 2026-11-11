<template>
  <div class="decor-top-bar" :style="customStyle">
    <div class="top-bar-inner">
      <div class="bar-left">
        <span class="welcome-txt">{{ options.welcomeText || '欢迎来到商城' }}</span>
        <span class="auth-links" v-if="!username">
          <router-link :to="options.loginUrl || '/login'" class="auth-item">
            [{{ options.loginText || '登录' }}]
          </router-link>
          <router-link :to="options.registerUrl || '/signUp'" class="auth-item">
            [{{ options.registerText || '免费注册' }}]
          </router-link>
        </span>
        <span class="auth-links user-logged" v-else>
          <router-link :to="options.userCenterUrl || '/home/MyOrder'" class="user-name">
            欢迎，{{ username }}
          </router-link>
          <span class="sep">|</span>
          <a class="auth-item" @click="handleLogout">{{ options.logoutText || '退出' }}</a>
        </span>
      </div>

      <div class="bar-right">
        <router-link
          v-for="(menu, idx) in (options.rightMenus || defaultMenus)"
          :key="idx"
          :to="menu.url || '/'"
          class="bar-link"
        >
          {{ menu.title }}
        </router-link>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import Cookies from 'js-cookie';
import storage from '@/plugins/storage';
import { logout } from '@/api/account';

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
  { title: '基本信息', url: '/home/Profile' },
  { title: '我的订单', url: '/home/MyOrder' },
  { title: '账户安全', url: '/home/AccountSafe' },
  { title: '消息', url: '/home/MsgList' }
];

const username = computed(() => {
  const userInfo = Cookies.get('userInfo');
  if (userInfo) {
    try {
      const u = JSON.parse(userInfo);
      return u.nickName || u.username || '';
    } catch (e) {
      return '';
    }
  }
  return '';
});

function clearLocalAuth() {
  storage.removeItem('userInfo');
  storage.removeItem('accessToken');
  storage.removeItem('refreshToken');
  storage.removeItem('cartNum');
  Cookies.remove('userInfo');
  Cookies.remove('accessToken');
  window.location.reload();
}

function handleLogout() {
  logout().finally(() => {
    clearLocalAuth();
  });
}

const customStyle = computed(() => {
  const s = props.componentStyle || {};
  const opt = props.options || {};
  const textColor = opt.textColor || s.textColor || '#4b5563';
  const fontSize = opt.fontSize ? `${opt.fontSize}px` : '12px';

  return {
    backgroundColor: s.backgroundColor || '#f8fafc',
    color: textColor,
    fontSize: fontSize,
    height: `${s.height || 40}px`,
    lineHeight: `${s.height || 40}px`
  };
});
</script>

<style lang="scss" scoped>
.decor-top-bar {
  width: 100%;
  max-width: 100%;
  box-sizing: border-box;
  font-size: 12px;
  overflow: hidden;
  background-color: #f8fafc;
  border-bottom: 1px solid #e2e8f0;

  *, *::before, *::after {
    box-sizing: border-box;
  }

  .top-bar-inner {
    width: 1200px;
    max-width: 100%;
    margin: 0 auto;
    padding: 0 10px;
    box-sizing: border-box;
    display: flex;
    justify-content: space-between;
    align-items: center;
    height: 100%;

    .bar-left {
      display: flex;
      align-items: center;
      gap: 10px;
      white-space: nowrap;

      .welcome-txt {
        white-space: nowrap;
      }

      .auth-links {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        white-space: nowrap;

        .auth-item {
          color: #409EFF;
          text-decoration: none;
          cursor: pointer;

          &:hover {
            text-decoration: underline;
          }
        }

        .sep {
          margin: 0 4px;
          color: #dcdfe6;
        }

        .user-name {
          color: #333333;
          font-weight: 500;
          text-decoration: none;

          &:hover {
            color: #409EFF;
          }
        }
      }
    }

    .bar-right {
      display: flex;
      align-items: center;
      gap: 18px;
      white-space: nowrap;

      .bar-link {
        color: inherit;
        text-decoration: none;
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
