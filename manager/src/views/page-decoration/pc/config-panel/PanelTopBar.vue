<template>
  <div class="panel-top-bar">
    <!-- 1. 顶部栏内容卡片 -->
    <div class="setting-collapse-card">
      <div class="collapse-header" @click="expandContent = !expandContent">
        <div class="header-left">
          <el-icon class="arrow-icon" :class="{ 'is-expanded': expandContent }"><ArrowRight /></el-icon>
          <span class="header-title">顶部栏内容</span>
          <el-tooltip content="设置顶部栏快捷入口和右侧快捷菜单" placement="top">
            <el-icon class="help-icon"><QuestionFilled /></el-icon>
          </el-tooltip>
          <span class="header-subtitle">顶部栏快捷入口和右侧快捷菜单</span>
        </div>
      </div>

      <div class="collapse-body" v-show="expandContent">
        <!-- 左侧登录区 -->
        <div class="section-block">
          <div class="block-title">左侧登录区</div>

          <div class="form-row">
            <span class="row-label">欢迎文案</span>
            <el-input
              v-model="localOptions.welcomeText"
              size="small"
              placeholder="欢迎来到商城"
            />
          </div>

          <div class="form-row">
            <span class="row-label">登录文案</span>
            <div class="input-with-action">
              <el-input
                v-model="localOptions.loginText"
                size="small"
                placeholder="登录"
              />
              <el-button
                size="small"
                class="action-btn"
                @click="handleSetLink('loginUrl', '设置登录跳转链接', localOptions.loginUrl || '/login')"
                title="设置登录链接"
              >
                <el-icon><Link /></el-icon>
              </el-button>
            </div>
          </div>

          <div class="form-row">
            <span class="row-label">注册文案</span>
            <div class="input-with-action">
              <el-input
                v-model="localOptions.registerText"
                size="small"
                placeholder="免费注册"
              />
              <el-button
                size="small"
                class="action-btn"
                @click="handleSetLink('registerUrl', '设置注册跳转链接', localOptions.registerUrl || '/signUp')"
                title="设置注册链接"
              >
                <el-icon><Link /></el-icon>
              </el-button>
            </div>
          </div>

          <div class="form-row">
            <span class="row-label">用户中心链接</span>
            <div
              class="link-box-btn"
              @click="handleSetLink('userCenterUrl', '设置用户中心跳转链接', localOptions.userCenterUrl || '/order-list')"
            >
              <el-icon><Link /></el-icon>
              <span class="link-box-text">自定义链接 · {{ localOptions.userCenterUrl || '/order-list' }}</span>
            </div>
          </div>

          <div class="form-row">
            <span class="row-label">退出文案</span>
            <el-input
              v-model="localOptions.logoutText"
              size="small"
              placeholder="退出"
            />
          </div>
        </div>

        <!-- 右侧快捷菜单 -->
        <div class="section-block mt-16">
          <div class="block-title">右侧快捷菜单</div>

          <div class="menu-list">
            <div
              v-for="(item, idx) in localOptions.rightMenus"
              :key="idx"
              class="menu-row"
            >
              <el-input
                v-model="item.title"
                size="small"
                class="menu-input"
                placeholder="菜单名称"
              />
              <el-button
                size="small"
                class="action-btn"
                @click="handleSetMenuItemLink(item)"
                title="设置链接"
              >
                <el-icon><Link /></el-icon>
              </el-button>
              <el-button
                size="small"
                class="action-btn"
                :disabled="idx === 0"
                @click="moveMenuItem(idx, -1)"
                title="上移"
              >
                <el-icon><Top /></el-icon>
              </el-button>
              <el-button
                size="small"
                class="action-btn"
                :disabled="idx === localOptions.rightMenus.length - 1"
                @click="moveMenuItem(idx, 1)"
                title="下移"
              >
                <el-icon><Bottom /></el-icon>
              </el-button>
              <el-button
                size="small"
                class="action-btn del-btn"
                @click="deleteMenuItem(idx)"
                title="删除"
              >
                <el-icon><Delete /></el-icon>
              </el-button>
            </div>
          </div>

          <el-button
            class="add-menu-btn"
            size="small"
            @click="addMenuItem"
          >
            + 添加快捷入口
          </el-button>
        </div>
      </div>
    </div>

    <!-- 2. 样式卡片 -->
    <div class="setting-collapse-card">
      <div class="collapse-header" @click="expandStyle = !expandStyle">
        <div class="header-left">
          <el-icon class="arrow-icon" :class="{ 'is-expanded': expandStyle }"><ArrowRight /></el-icon>
          <span class="header-title">样式</span>
        </div>
      </div>

      <div class="collapse-body" v-show="expandStyle">
        <div class="form-row">
          <span class="row-label">文字颜色</span>
          <div class="color-picker-row">
            <el-color-picker
              v-model="localOptions.textColor"
              size="small"
              class="color-picker-swatch"
            />
            <el-input
              v-model="localOptions.textColor"
              size="small"
              class="color-input"
              placeholder="#4b5563"
            />
          </div>
        </div>

        <div class="form-row mt-12">
          <span class="row-label">字号</span>
          <el-input
            v-model="localOptions.fontSize"
            size="small"
            placeholder="12"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, inject } from 'vue';
import { ArrowRight, QuestionFilled, Link, Top, Bottom, Delete } from '@element-plus/icons-vue';
import { ElMessageBox } from 'element-plus';

const props = defineProps({
  component: {
    type: Object,
    default: null
  },
  options: {
    type: Object,
    default: () => ({})
  }
});

const expandContent = ref(true);
const expandStyle = ref(true);

const localOptions = computed(() => {
  if (!props.options) return {};
  if (props.options.welcomeText === undefined) props.options.welcomeText = '欢迎来到商城';
  if (props.options.loginText === undefined) props.options.loginText = '登录';
  if (props.options.loginUrl === undefined) props.options.loginUrl = '/login';
  if (props.options.registerText === undefined) props.options.registerText = '免费注册';
  if (props.options.registerUrl === undefined) props.options.registerUrl = '/signUp';
  if (props.options.userCenterUrl === undefined) props.options.userCenterUrl = '/order-list';
  if (props.options.logoutText === undefined) props.options.logoutText = '退出';
  if (!Array.isArray(props.options.rightMenus)) {
    props.options.rightMenus = [
      { title: '基本信息', url: '/home/UserInfo' },
      { title: '我的订单', url: '/home/MyOrder' },
      { title: '账户安全', url: '/home/AccountSafe' },
      { title: '消息', url: '/home/Msg' }
    ];
  }
  if (!props.options.textColor) props.options.textColor = '#4b5563';
  if (!props.options.fontSize) props.options.fontSize = 12;
  return props.options;
});

const openLinkPicker = inject('openLinkPicker', null);

function handleSetLink(field, title, currentVal) {
  if (openLinkPicker) {
    openLinkPicker(({ url }) => {
      localOptions.value[field] = url;
    });
  } else {
    ElMessageBox.prompt('请输入跳转链接路径：', title, {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      inputValue: currentVal || '/',
      inputPattern: /^\S+$/,
      inputErrorMessage: '链接路径不能为空'
    })
      .then(({ value }) => {
        localOptions.value[field] = value;
      })
      .catch(() => {});
  }
}

function handleSetMenuItemLink(item) {
  if (openLinkPicker) {
    openLinkPicker(({ url, title }) => {
      item.url = url;
      if (!item.title && title) item.title = title;
    });
  } else {
    ElMessageBox.prompt('请输入菜单跳转链接：', `设置 [${item.title || '快捷菜单'}] 链接`, {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      inputValue: item.url || '/',
      inputPattern: /^\S+$/,
      inputErrorMessage: '链接路径不能为空'
    })
      .then(({ value }) => {
        item.url = value;
      })
      .catch(() => {});
  }
}

function moveMenuItem(idx, offset) {
  const target = idx + offset;
  const list = localOptions.value.rightMenus;
  if (target < 0 || target >= list.length) return;
  const temp = list[idx];
  list[idx] = list[target];
  list[target] = temp;
}

function deleteMenuItem(idx) {
  localOptions.value.rightMenus.splice(idx, 1);
}

function addMenuItem() {
  localOptions.value.rightMenus.push({
    title: '新快捷入口',
    url: '/'
  });
}
</script>

<style lang="scss" scoped>
.panel-top-bar {
  padding: 12px;
  box-sizing: border-box;

  .setting-collapse-card {
    background: #ffffff;
    border: 1px solid #ebeef5;
    border-radius: 8px;
    margin-bottom: 12px;
    overflow: hidden;

    .collapse-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 12px 14px;
      cursor: pointer;
      user-select: none;
      background: #fafafa;
      border-bottom: 1px solid transparent;
      transition: background-color 0.2s;

      &:hover {
        background: #f5f7fa;
      }

      .header-left {
        display: flex;
        align-items: center;
        gap: 6px;
        flex-wrap: nowrap;

        .arrow-icon {
          font-size: 12px;
          color: #909399;
          transition: transform 0.2s;

          &.is-expanded {
            transform: rotate(90deg);
          }
        }

        .header-title {
          font-size: 13px;
          font-weight: 600;
          color: #262626;
          white-space: nowrap;
        }

        .help-icon {
          font-size: 14px;
          color: #909399;
          cursor: pointer;
        }

        .header-subtitle {
          font-size: 11px;
          color: #909399;
          margin-left: 6px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
      }
    }

    .collapse-body {
      padding: 14px;
      background: #ffffff;
      border-top: 1px solid #f0f0f0;

      .section-block {
        .block-title {
          font-size: 13px;
          font-weight: 700;
          color: #1f2937;
          margin-bottom: 12px;
        }

        &.mt-16 {
          margin-top: 16px;
          padding-top: 14px;
          border-top: 1px dashed #e5e7eb;
        }
      }

      .form-row {
        display: flex;
        flex-direction: column;
        gap: 6px;
        margin-bottom: 12px;

        &.mt-12 {
          margin-top: 12px;
        }

        .row-label {
          font-size: 12px;
          color: #4b5563;
        }

        .input-with-action {
          display: flex;
          align-items: center;
          gap: 6px;

          .action-btn {
            padding: 0 8px;
            height: 28px;
            color: #4b5563;
            border-color: #d1d5db;
          }
        }

        .link-box-btn {
          width: 100%;
          height: 32px;
          background: #ffffff;
          border: 1px solid #d1d5db;
          border-radius: 4px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          cursor: pointer;
          color: #374151;
          font-size: 12px;
          transition: all 0.2s;

          &:hover {
            border-color: #ff6a00;
            color: #ff6a00;
          }

          .link-box-text {
            max-width: 180px;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
          }
        }

        .color-picker-row {
          display: flex;
          align-items: center;
          gap: 8px;

          .color-input {
            flex: 1;
          }
        }
      }

      /* 菜单列表 */
      .menu-list {
        display: flex;
        flex-direction: column;
        gap: 8px;
        margin-bottom: 10px;

        .menu-row {
          display: flex;
          align-items: center;
          gap: 6px;

          .menu-input {
            flex: 1;
          }

          .action-btn {
            width: 28px;
            height: 28px;
            padding: 0;
            display: flex;
            align-items: center;
            justify-content: center;
            border-color: #e5e7eb;
            color: #6b7280;

            &.del-btn {
              border-color: #fca5a5;
              color: #ef4444;

              &:hover {
                background: #fef2f2;
                border-color: #ef4444;
              }
            }

            &:disabled {
              color: #d1d5db;
              border-color: #f3f4f6;
            }
          }
        }
      }

      .add-menu-btn {
        width: 100%;
        height: 32px;
        border: 1px dashed #d1d5db;
        border-radius: 4px;
        background: #ffffff;
        color: #374151;
        font-size: 12px;
        transition: all 0.2s;

        &:hover {
          color: #ff6a00;
          border-color: #ff6a00;
        }
      }
    }
  }
}
</style>
