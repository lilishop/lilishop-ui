<template>
  <div class="decor-category-nav" :style="customStyle">
    <div class="nav-inner">
      <!-- 1. 全部分类入口 (当开启显示全部分类时) -->
      <div
        v-if="options.showAllCategory"
        class="all-category-btn"
        :style="{ backgroundColor: options.activeColor || '#e11d48' }"
      >
        <img
          v-if="options.allCategoryIcon"
          :src="options.allCategoryIcon"
          class="all-icon-img"
          alt="icon"
        />
        <el-icon v-else class="all-icon-svg"><Menu /></el-icon>
        <span class="all-text">{{ options.allCategoryText || '全部分类' }}</span>
        <el-icon class="all-arrow"><ArrowDown /></el-icon>
      </div>

      <!-- 2. 分类导航项水平列表 -->
      <ul class="nav-items-ul">
        <li
          v-for="(item, idx) in options.navItems"
          :key="idx"
          class="nav-li"
        >
          <router-link
            :to="item.url || '/'"
            class="nav-link"
            :style="{
              '--text-color': options.textColor || '#334155',
              '--active-color': options.activeColor || '#e11d48'
            }"
            active-class="is-active"
          >
            <img v-if="item.img" :src="item.img" class="cat-icon" alt="cat-icon" />
            <span class="cat-title">{{ item.title }}</span>
            <span
              class="badge"
              v-if="item.badge"
              :style="{ backgroundColor: options.activeColor || '#e11d48' }"
            >
              {{ item.badge }}
            </span>
          </router-link>
        </li>
      </ul>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { Menu, ArrowDown } from '@element-plus/icons-vue';

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

const customStyle = computed(() => {
  const s = props.componentStyle || {};
  return {
    backgroundColor: s.backgroundColor || '#ffffff',
    height: `${s.height || 42}px`
  };
});
</script>

<style lang="scss" scoped>
.decor-category-nav {
  width: 100%;
  border-bottom: 1px solid #f1f5f9;
  display: flex;
  align-items: center;

  .nav-inner {
    max-width: 1600px;
    width: 100%;
    margin: 0 auto;
    padding: 0 16px;
    height: 100%;
    display: flex;
    align-items: center;
    box-sizing: border-box;

    // 全部分类按钮
    .all-category-btn {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      height: 100%;
      padding: 0 18px;
      color: #ffffff;
      font-size: 14px;
      font-weight: 600;
      cursor: pointer;
      flex-shrink: 0;
      margin-right: 20px;
      user-select: none;
      transition: opacity 0.2s;

      &:hover {
        opacity: 0.92;
      }

      .all-icon-img {
        width: 18px;
        height: 18px;
        object-fit: contain;
      }

      .all-icon-svg {
        font-size: 16px;
      }

      .all-text {
        letter-spacing: 0.5px;
      }

      .all-arrow {
        font-size: 12px;
        margin-left: 2px;
      }
    }

    .nav-items-ul {
      list-style: none;
      padding: 0;
      margin: 0;
      display: flex;
      align-items: center;
      gap: 28px;
      height: 100%;
      overflow-x: auto;
      scrollbar-width: none;
      &::-webkit-scrollbar {
        display: none;
      }

      .nav-li {
        height: 100%;
        display: flex;
        align-items: center;

        .nav-link {
          position: relative;
          text-decoration: none;
          font-size: 14px;
          font-weight: 500;
          color: var(--text-color, #334155);
          display: inline-flex;
          align-items: center;
          gap: 6px;
          height: 100%;
          white-space: nowrap;
          transition: color 0.2s;

          .cat-icon {
            width: 22px;
            height: 22px;
            object-fit: contain;
            border-radius: 4px;
            transition: transform 0.2s ease;
          }

          &:hover, &.is-active {
            color: var(--active-color, #e11d48) !important;

            .cat-icon {
              transform: scale(1.12);
            }
          }

          .badge {
            position: absolute;
            top: 4px;
            right: -12px;
            color: #ffffff;
            font-size: 9px;
            line-height: 1;
            padding: 2px 4px;
            border-radius: 8px;
            font-weight: 600;
            box-shadow: 0 1px 3px rgba(0, 0, 0, 0.15);
          }
        }
      }
    }
  }
}
</style>
