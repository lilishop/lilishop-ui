<template>
  <div class="panel-category-nav">
    <!-- 1. 内容设置 -->
    <div class="panel-section">
      <div class="section-title">内容设置</div>

      <!-- 显示全部分类开关 -->
      <div class="form-row flex-between">
        <span class="row-label">显示全部分类</span>
        <el-switch v-model="options.showAllCategory" size="small" />
      </div>

      <!-- 全部分类文案 -->
      <div class="form-row mt-12" v-if="options.showAllCategory !== false">
        <span class="row-label">全部分类文案</span>
        <el-input
          v-model="options.allCategoryText"
          size="small"
          placeholder="全部分类"
          class="flex-1"
        />
      </div>

      <!-- 全部分类图标 -->
      <div class="form-row mt-12" v-if="options.showAllCategory !== false">
        <span class="row-label">全部分类图标</span>
        <div class="all-cat-icon-ctrl">
          <div class="icon-thumb-box" v-if="options.allCategoryIcon" @click="handleSelectAllCategoryIcon" title="更换图标">
            <img :src="options.allCategoryIcon" alt="全部分类图标" class="thumb-img" />
            <el-icon class="thumb-del" @click.stop="options.allCategoryIcon = ''" title="删除"><Close /></el-icon>
          </div>
          <el-button size="small" class="action-btn" @click="handleSelectAllCategoryIcon">
            {{ options.allCategoryIcon ? '修改图标' : '选择图标' }}
          </el-button>
          <el-button
            size="small"
            link
            type="danger"
            v-if="options.allCategoryIcon"
            @click="options.allCategoryIcon = ''"
          >
            清除
          </el-button>
        </div>
      </div>
    </div>

    <!-- 2. 导航项列表 -->
    <div class="panel-section">
      <div class="section-title flex-between">
        <span>导航项</span>
        <span class="items-count">共 {{ (options.navItems || []).length }} 项</span>
      </div>

      <div class="nav-cards-list">
        <div
          v-for="(item, idx) in options.navItems"
          :key="idx"
          class="nav-item-card"
        >
          <!-- 卡片上半部分：左侧选择/标题，右侧图标缩略图 -->
          <div class="card-body">
            <div class="left-col">
              <el-button
                size="small"
                class="reselect-btn"
                @click="handleSelectCategory(item)"
              >
                {{ item.title ? '重新选择' : '选择分类' }}
              </el-button>
              <el-input
                v-model="item.title"
                size="small"
                placeholder="分类名称"
                class="title-input"
              />
            </div>

            <!-- 右侧图标上传框 -->
            <div
              class="right-thumb-col"
              @click="handleSelectIcon(item)"
              :title="item.img ? '点击更换分类图标' : '点击上传分类图标'"
            >
              <template v-if="item.img">
                <img :src="item.img" alt="分类图标" class="cat-thumb" />
                <span class="thumb-del-badge" @click.stop="item.img = ''" title="移除图标">
                  <el-icon><Close /></el-icon>
                </span>
              </template>
              <template v-else>
                <el-icon class="upload-plus"><Plus /></el-icon>
                <span class="upload-tip">图标</span>
              </template>
            </div>
          </div>

          <!-- 卡片底栏：操作按钮组 (链接、上移、下移、删除) -->
          <div class="card-actions">
            <el-button
              size="small"
              class="action-btn"
              :type="item.url ? 'primary' : 'default'"
              :plain="!item.url"
              @click="handleSetLink(item)"
              @contextmenu.prevent="item.url = ''"
              :title="item.url ? (`已设链接: ${item.url} (点击修改，右键清除)`) : '设置跳转链接'"
            >
              <el-icon><Link /></el-icon>
            </el-button>
            <el-button
              size="small"
              class="action-btn"
              :disabled="idx === 0"
              @click="moveItem(idx, -1)"
              title="上移"
            >
              <el-icon><Top /></el-icon>
            </el-button>
            <el-button
              size="small"
              class="action-btn"
              :disabled="idx === options.navItems.length - 1"
              @click="moveItem(idx, 1)"
              title="下移"
            >
              <el-icon><Bottom /></el-icon>
            </el-button>
            <el-button
              size="small"
              class="action-btn del-btn"
              @click="options.navItems.splice(idx, 1)"
              title="删除导航项"
            >
              <el-icon><Delete /></el-icon>
            </el-button>
          </div>
        </div>
      </div>

      <!-- 添加导航项大按钮 -->
      <el-button
        type="primary"
        plain
        class="add-item-full-btn"
        @click="handleAddItem"
      >
        <el-icon><Plus /></el-icon> 添加导航项
      </el-button>
    </div>

    <!-- 3. 文字与悬浮颜色设置 -->
    <div class="panel-section">
      <div class="section-title">文字与悬浮颜色</div>
      <div class="form-row">
        <span class="row-label">常态文字颜色</span>
        <el-color-picker v-model="options.textColor" size="small" />
      </div>
      <div class="form-row mt-12">
        <span class="row-label">悬浮/选中高亮色</span>
        <el-color-picker v-model="options.activeColor" size="small" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { inject } from 'vue';
import { Plus, Delete, Close, Link, Top, Bottom } from '@element-plus/icons-vue';
import { ElMessageBox } from 'element-plus';

const props = defineProps({
  component: {
    type: Object,
    required: true
  },
  options: {
    type: Object,
    required: true
  }
});

// 注入全局选择器
const openLinkPicker = inject('openLinkPicker', null);
const openImagePicker = inject('openImagePicker', null);

// 1. 重新选择分类
function handleSelectCategory(item) {
  if (openLinkPicker) {
    openLinkPicker(({ url, title, raw }) => {
      if (title) item.title = title;
      if (url) item.url = url;
      if (raw && (raw.image || raw.icon || raw.pic)) {
        item.img = raw.image || raw.icon || raw.pic;
      }
    });
  } else {
    ElMessageBox.prompt('请输入分类名称：', '设置分类', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      inputValue: item.title || '',
      inputPattern: /\S+/,
      inputErrorMessage: '分类名称不能为空'
    })
      .then(({ value }) => {
        item.title = value.trim();
      })
      .catch(() => {});
  }
}

// 2. 选择分类图标图片
function handleSelectIcon(item) {
  if (openImagePicker) {
    openImagePicker((url) => {
      if (url) item.img = url;
    });
  } else {
    ElMessageBox.prompt('请输入图标图片 URL 地址：', '上传图标', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      inputValue: item.img || '',
      inputPattern: /^\S+$/,
      inputErrorMessage: '图片地址不能为空'
    })
      .then(({ value }) => {
        item.img = value.trim();
      })
      .catch(() => {});
  }
}

// 3. 选择全部分类图标
function handleSelectAllCategoryIcon() {
  if (openImagePicker) {
    openImagePicker((url) => {
      if (url) props.options.allCategoryIcon = url;
    });
  } else {
    ElMessageBox.prompt('请输入图标图片 URL 地址：', '设置全部分类图标', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      inputValue: props.options.allCategoryIcon || '',
      inputPattern: /^\S+$/,
      inputErrorMessage: '图片地址不能为空'
    })
      .then(({ value }) => {
        props.options.allCategoryIcon = value.trim();
      })
      .catch(() => {});
  }
}

// 4. 设置链接
function handleSetLink(item) {
  if (openLinkPicker) {
    openLinkPicker(({ url, title }) => {
      item.url = url;
      if (!item.title && title) item.title = title;
    });
  } else {
    ElMessageBox.prompt('请输入跳转链接路径（留空清除链接）：', `设置 [${item.title || '导航项'}] 链接`, {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      inputValue: item.url || '',
      inputPattern: /^.*$/
    })
      .then(({ value }) => {
        item.url = (value || '').trim();
      })
      .catch(() => {});
  }
}

// 5. 上移/下移
function moveItem(idx, direction) {
  const target = idx + direction;
  if (!Array.isArray(props.options.navItems)) return;
  if (target < 0 || target >= props.options.navItems.length) return;
  const moved = props.options.navItems.splice(idx, 1)[0];
  props.options.navItems.splice(target, 0, moved);
}

// 6. 添加导航项
function handleAddItem() {
  if (!Array.isArray(props.options.navItems)) props.options.navItems = [];
  const count = props.options.navItems.length + 1;
  props.options.navItems.push({
    title: `新分类${count}`,
    img: '',
    url: `/goodsList?categoryId=${count}`,
    badge: ''
  });
}
</script>

<style lang="scss" scoped>
.panel-category-nav {
  padding: 12px;
  box-sizing: border-box;

  .panel-section {
    margin-bottom: 20px;
    padding-bottom: 16px;
    border-bottom: 1px dashed #e2e8f0;

    .section-title {
      font-size: 13px;
      font-weight: 600;
      color: #0f172a;
      margin-bottom: 12px;

      &.flex-between {
        display: flex;
        justify-content: space-between;
        align-items: center;
      }

      .items-count {
        font-size: 11px;
        color: #94a3b8;
        font-weight: normal;
      }
    }

    .form-row {
      display: flex;
      flex-direction: column;
      gap: 6px;

      &.flex-between {
        flex-direction: row;
        justify-content: space-between;
        align-items: center;
      }

      &.mt-12 {
        margin-top: 12px;
      }

      .row-label {
        font-size: 12px;
        color: #475569;
      }

      .flex-1 {
        flex: 1;
      }

      .all-cat-icon-ctrl {
        display: flex;
        align-items: center;
        gap: 8px;

        .icon-thumb-box {
          position: relative;
          width: 32px;
          height: 32px;
          border-radius: 4px;
          border: 1px solid #e2e8f0;
          overflow: hidden;
          cursor: pointer;

          .thumb-img {
            width: 100%;
            height: 100%;
            object-fit: cover;
          }

          .thumb-del {
            position: absolute;
            top: 1px;
            right: 1px;
            font-size: 10px;
            background: rgba(0, 0, 0, 0.5);
            color: #fff;
            border-radius: 50%;
            padding: 1px;
          }
        }
      }
    }

    .nav-cards-list {
      display: flex;
      flex-direction: column;
      gap: 10px;
      margin-bottom: 12px;

      .nav-item-card {
        background: #ffffff;
        border: 1px solid #e2e8f0;
        border-radius: 6px;
        padding: 10px 12px;
        box-shadow: 0 1px 2px rgba(0, 0, 0, 0.03);
        transition: border-color 0.2s, box-shadow 0.2s;

        &:hover {
          border-color: #cbd5e1;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
        }

        .card-body {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 12px;
          margin-bottom: 10px;

          .left-col {
            flex: 1;
            display: flex;
            flex-direction: column;
            gap: 6px;

            .reselect-btn {
              align-self: flex-start;
              font-size: 12px;
              color: #334155;
              border-color: #cbd5e1;
              padding: 0 10px;
              height: 26px;

              &:hover {
                color: #2563eb;
                border-color: #93c5fd;
              }
            }

            .title-input {
              width: 100%;
            }
          }

          .right-thumb-col {
            width: 60px;
            height: 60px;
            border-radius: 6px;
            border: 1px dashed #cbd5e1;
            background: #f8fafc;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            position: relative;
            flex-shrink: 0;
            overflow: hidden;
            transition: border-color 0.15s, background-color 0.15s;

            &:hover {
              border-color: #93c5fd;
              background-color: #f0f7ff;
            }

            .cat-thumb {
              width: 100%;
              height: 100%;
              object-fit: cover;
            }

            .thumb-del-badge {
              position: absolute;
              top: 3px;
              right: 3px;
              width: 16px;
              height: 16px;
              background: rgba(15, 23, 42, 0.65);
              color: #ffffff;
              border-radius: 50%;
              display: flex;
              align-items: center;
              justify-content: center;
              font-size: 10px;
              transition: background 0.15s;

              &:hover {
                background: #e11d48;
              }
            }

            .upload-plus {
              font-size: 16px;
              color: #94a3b8;
              margin-bottom: 2px;
            }

            .upload-tip {
              font-size: 10px;
              color: #94a3b8;
            }
          }
        }

        .card-actions {
          display: flex;
          justify-content: flex-end;
          align-items: center;
          gap: 6px;
          padding-top: 8px;
          border-top: 1px dashed #f1f5f9;

          .action-btn {
            padding: 0 8px;
            height: 26px;

            &.del-btn {
              color: #ef4444;
              &:hover {
                background: #fee2e2;
                border-color: #fca5a5;
              }
            }
          }
        }
      }
    }

    .add-item-full-btn {
      width: 100%;
      height: 34px;
      font-size: 12px;
      border-dashed: true;
      border: 1px dashed #93c5fd;
      background: #f8fafc;

      &:hover {
        background: #eff6ff;
        border-color: #3b82f6;
      }
    }
  }
}
</style>
