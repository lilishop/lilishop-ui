<template>

  <div class="pc-config-panel-container">

    <!-- 顶部选中状态卡片 (匹配魔方 dark navy card) -->

    <div class="selected-header-card">

      <div class="header-info">

        <div class="selected-tag">当前选中</div>

        <div class="selected-name">{{ currentSelectedTitle }}</div>

      </div>

      <div class="header-icon-box">

        <el-icon :size="24">

          <component :is="currentSelectedIcon" />

        </el-icon>

      </div>

    </div>



    <!-- 顶栏三 Tab 切换 -->

    <div class="panel-header-tabs">

      <div

        class="tab-btn"

        :class="{ active: activeTab === 'row' }"

        @click="setTab('row')"

      >

        行配置

      </div>

      <div

        class="tab-btn"

        :class="{ active: activeTab === 'component' }"

        @click="setTab('component')"

      >

        组件配置

      </div>

      <div

        class="tab-btn"

        :class="{ active: activeTab === 'business' }"

        @click="setTab('business')"

      >

        业务配置

      </div>

    </div>



    <div class="panel-scroll-content">

      <!-- 1. 行配置 -->

      <div v-show="activeTab === 'row'">

        <row-config-panel

          :row="selectedRow"

          :row-index="selectedRowIndex"

          :total-rows="totalRows"

          :is-first="selectedRowIndex === 0"

          :is-last="selectedRowIndex === totalRows - 1"

          @move-up="emit('move-row-up')"

          @move-down="emit('move-row-down')"

          @move-top="emit('move-row-top')"

          @move-bottom="emit('move-row-bottom')"
          @move-to-row="idx => emit('move-to-row', idx)"

          @delete-row="emit('delete-row')"

        />

      </div>



      <!-- 2. 组件配置 -->

      <div v-show="activeTab === 'component'">

        <component-config-panel

          :component="selectedComponent"

        />

      </div>



      <!-- 3. 业务配置 -->

      <div v-show="activeTab === 'business'">

        <div v-if="!selectedComponent" class="empty-panel">

          请在画布中选中一个组件进行业务内容配置

        </div>

        <div v-else class="business-wrapper">

          <!-- 动态分发业务配置面板 -->

          <component

            :is="businessPanelComponent"

            v-if="businessPanelComponent"

            :component="selectedComponent"

            :options="selectedComponent.options"

          />

          <div v-else class="fallback-business">

            <div class="panel-title">{{ selectedComponent.name || selectedComponent.type }} 内容设置</div>

            <p class="panel-desc">当前组件的基础属性与参数设置：</p>

            <div class="form-group" v-for="(val, key) in selectedComponent.options" :key="key">

              <span class="prop-key">{{ key }}</span>

              <el-input

                v-if="typeof val === 'string'"

                v-model="selectedComponent.options[key]"

                size="small"

              />

              <el-switch

                v-else-if="typeof val === 'boolean'"

                v-model="selectedComponent.options[key]"

              />

              <el-input-number

                v-else-if="typeof val === 'number'"

                v-model="selectedComponent.options[key]"

                size="small"

              />

            </div>

          </div>

        </div>

      </div>

    </div>

  </div>

</template>



<script setup>

import { ref, computed } from 'vue';

import {
  House, Compass, Picture, ShoppingBag, Ticket, Document, Menu, Bottom as BottomIcon,
  List, Grid, Fold, PictureRounded, Medal, Aim, FullScreen, Files, VideoCamera,
  Goods, Postcard, Reading, DArrowRight, CollectionTag, Star, Edit, Bell,
  Search, User, Rank
} from '@element-plus/icons-vue';

const iconMap = {
  House, Compass, Picture, ShoppingBag, Ticket, Document, Menu, Bottom: BottomIcon,
  List, Grid, Fold, PictureRounded, Medal, Aim, FullScreen, Files, VideoCamera,
  Goods, Postcard, Reading, DArrowRight, CollectionTag, Star, Edit, Bell,
  Search, User, Rank
};

import RowConfigPanel from './RowConfigPanel.vue';

import ComponentConfigPanel from './ComponentConfigPanel.vue';

import { COMPONENT_DEFINITIONS } from '../config.js';



// 导入业务面板




import PanelCategoryNav from './PanelCategoryNav.vue';

import PanelChannelGrid from './PanelChannelGrid.vue';

import PanelCategoryMegaMenu from './PanelCategoryMegaMenu.vue';

import PanelCarousel from './PanelCarousel.vue';

import PanelBrandWall from './PanelBrandWall.vue';

import PanelHotZone from './PanelHotZone.vue';

import PanelFreeLayout from './PanelFreeLayout.vue';

import PanelPromoGroup from './PanelPromoGroup.vue';

import PanelVideo from './PanelVideo.vue';

import PanelGoods from './PanelGoods.vue';
import PanelGridFloor from './PanelGridFloor.vue';
import PanelGoodsGrid from './PanelGoodsGrid.vue';
import PanelChannelFloor from './PanelChannelFloor.vue';
import PanelRecommendFeed from './PanelRecommendFeed.vue';


import PanelTitle from './PanelTitle.vue';


import PanelNotice from './PanelNotice.vue';



const props = defineProps({

  selectedRow: {

    type: Object,

    default: null

  },

  selectedRowIndex: {

    type: Number,

    default: 0

  },

  totalRows: {

    type: Number,

    default: 0

  },

  selectedComponent: {

    type: Object,

    default: null

  }

});



const emit = defineEmits([

  'move-row-up',

  'move-row-down',

  'move-row-top',

  'move-row-bottom',
  'move-to-row',

  'delete-row',
  'tab-change'
]);



// 默认组件配置

const activeTab = ref('component');



function setTab(tab) {
  activeTab.value = tab;
  emit('tab-change', tab);
}

function selectRowTab() {
  activeTab.value = 'row';
  emit('tab-change', 'row');
}

function selectComponentTab() {
  activeTab.value = 'component';
  emit('tab-change', 'component');
}

defineExpose({
  selectComponentTab,
  selectRowTab,
  activeTab
});



const currentSelectedTitle = computed(() => {

  if (props.selectedComponent) {

    return props.selectedComponent.name || props.selectedComponent.type;

  }

  if (props.selectedRow) {

    return `第 ${props.selectedRowIndex + 1} 行`;

  }

  return '未选择项目';

});



const currentSelectedIcon = computed(() => {
  if (props.selectedComponent) {
    const iconName = props.selectedComponent.icon || COMPONENT_DEFINITIONS.find(d => d.type === props.selectedComponent.type)?.icon;
    return iconMap[iconName] || Grid;
  }
  return Rank;
});



const panelMap = {

  // 结构 (3)




  // 导航 (3)

  categoryNav: PanelCategoryNav,

  channelGrid: PanelChannelGrid,

  categoryMegaMenu: PanelCategoryMegaMenu,

  // 广告 (6)

  carousel: PanelCarousel,

  brandWall: PanelBrandWall,

  hotZone: PanelHotZone,

  freeLayout: PanelFreeLayout,

  promoGroup: PanelPromoGroup,

  video: PanelVideo,

  // 商品 (8)

  goodsList: PanelGoods,

  gridFloor: PanelGridFloor,

  goodsGrid: PanelGoodsGrid,

  goodsCard: PanelGoods,

  bannerFloor: PanelGridFloor,

  goodsBar: PanelGoods,

  channelFloor: PanelChannelFloor,

  recommendFeed: PanelRecommendFeed,

  // 营销 (1)


  // 内容 (3)

  titleBar: PanelTitle,


  noticeBar: PanelNotice

};



const businessPanelComponent = computed(() => {

  if (!props.selectedComponent) return null;

  return panelMap[props.selectedComponent.type] || null;

});

</script>



<style lang="scss" scoped>

.pc-config-panel-container {

  display: flex;

  flex-direction: column;

  height: 100%;

  background: #ffffff;



  /* 顶部暗蓝选中卡片 */

  .selected-header-card {

    display: flex;

    justify-content: space-between;

    align-items: center;

    background: #1f2d48;

    margin: 12px 12px 4px 12px;

    padding: 12px 16px;

    border-radius: 8px;

    box-sizing: border-box;



    .header-info {

      display: flex;

      flex-direction: column;



      .selected-tag {

        font-size: 11px;

        color: rgba(255, 255, 255, 0.65);

        margin-bottom: 4px;

      }



      .selected-name {

        font-size: 16px;

        font-weight: 700;

        color: #ffffff;

      }

    }



    .header-icon-box {

      width: 44px;

      height: 44px;

      background: rgba(255, 255, 255, 0.12);

      border-radius: 8px;

      display: flex;

      align-items: center;

      justify-content: center;

      color: #ffffff;

    }

  }



  .panel-header-tabs {

    display: flex;

    border-bottom: 1px solid #f0f0f0;

    background: #ffffff;

    margin: 0 12px;



    .tab-btn {

      flex: 1;

      text-align: center;

      padding: 12px 0;

      font-size: 13px;

      font-weight: 500;

      color: #595959;

      cursor: pointer;

      border-bottom: 2px solid transparent;

      transition: all 0.2s;



      &:hover {

        color: #ff6a00;

      }



      &.active {

        color: #ff6a00;

        font-weight: 600;

        border-bottom-color: #ff6a00;

      }

    }

  }



  .panel-scroll-content {

    flex: 1;

    overflow-y: auto;

  }

}



.empty-panel {

  text-align: center;

  padding: 60px 20px;

  color: #94a3b8;

  font-size: 13px;

}



.business-wrapper {

  padding: 12px;



  .fallback-business {

    .panel-title {

      font-size: 14px;

      font-weight: 600;

      color: #0f172a;

      margin-bottom: 4px;

    }

    .panel-desc {

      font-size: 12px;

      color: #64748b;

      margin-bottom: 16px;

    }

    .form-group {

      display: flex;

      align-items: center;

      justify-content: space-between;

      margin-bottom: 12px;

      .prop-key {

        font-size: 12px;

        color: #334155;

      }

    }

  }

}

</style>
