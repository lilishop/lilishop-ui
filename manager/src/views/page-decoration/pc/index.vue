<template>

  <div class="pc-editor-wrapper">

    <!-- 顶部操作栏 -->

    <header class="pc-editor-header">

      <div class="header-left">

        <el-button link @click="goBack" class="back-btn">

          <el-icon :size="16"><ArrowLeft /></el-icon>

          <span>返回页面列表</span>

        </el-button>

        <div class="divider"></div>

        <div class="page-title-edit">

          <el-input

            v-model="pageInfo.name"

            size="small"

            placeholder="请输入页面标题"

            @change="markDirty"

          />

        </div>

        <el-tag size="small" type="primary" effect="plain" class="ml_10">PC 页面</el-tag>

      </div>

      <div class="header-center">

        <!-- 分辨率视口切换 -->

        <div class="resolution-switch">

          <span class="switch-label">画布视口：</span>

          <el-radio-group v-model="canvasWidth" size="small">

            <el-radio-button :label="1280">1280px</el-radio-button>

            <el-radio-button :label="1600">1600px</el-radio-button>

            <el-radio-button :label="1920">1920px</el-radio-button>

          </el-radio-group>

        </div>

      </div>

      <div class="header-right">

        <el-button

          type="primary"

          size="small"

          :loading="saveLoading"

          @click="handleSavePage"

        >

          保存页面

        </el-button>

      </div>

    </header>

    <!-- 三栏主工作区 -->

    <main class="pc-editor-main">

      <!-- 1. 左侧组件库面板 -->

      <aside class="left-palette">

        <div class="palette-content">

          <el-collapse v-model="activeCollapseGroups" class="component-collapse">

            <el-collapse-item

              v-for="grp in componentGroups"

              :key="grp.key"

              :name="grp.key"

            >

              <template #title>

                <div class="collapse-title">

                  <span class="grp-title">{{ grp.title }}</span>

                  <span class="grp-desc">{{ grp.description }}</span>

                  <el-badge :value="grp.components.length" class="grp-badge" type="info" />


                </div>

              </template>

              <!-- 可拖拽组件卡片列表 -->

              <draggable

                :list="grp.components"

                :group="{ name: 'pc-model-rows', pull: 'clone', put: false }"

                :clone="handleCloneAsRow"

                :sort="false"

                item-key="type"

                class="components-grid"

              >

                <template #item="{ element }">

                  <div class="comp-card" @click="handleAppendComponent(element)" :title="element.name">

                    <el-icon :size="20" class="comp-icon">

                      <component :is="iconMap[element.icon] || Grid" />

                    </el-icon>

                    <span class="comp-name">{{ element.name }}</span>

                  </div>

                </template>

              </draggable>

            </el-collapse-item>

          </el-collapse>

        </div>

      </aside>

      <!-- 2. 中间可视化仿真画布 -->

      <section class="center-canvas-area" @click.self="clearSelection">

        <div

          class="canvas-container"

          :style="{ width: `${canvasWidth}px`, backgroundColor: pageDocument.pageStyle?.backgroundColor || '#ffffff' }"

        >

          <!-- 仿真浏览器外壳头部 -->

          <div class="browser-bar">

            <div class="dots">

              <span class="dot red"></span>

              <span class="dot yellow"></span>

              <span class="dot green"></span>

            </div>

            <div class="address-bar">

              https://shop.example.com/magic/page_pc (仿真视口 {{ canvasWidth }}px)

            </div>

          </div>

          <!-- 行容器拖拽区域 -->

          <draggable

            v-model="pageDocument.list"

            group="pc-model-rows"

            item-key="id"

            handle=".row-drag-handle"

            ghost-class="row-ghost"

            class="rows-drop-zone"

            @change="markDirty"

          >

            <template #item="{ element: row, index: rIndex }">

              <div

                class="canvas-row-wrap"

                :class="{ 'is-row-selected': isCurrentRowSelected(row.id) }"

                :style="getRowWrapperStyle(row.rowStyle, row.components)"

                @click.stop="handleSelectRow(row, rIndex)"

              >

                <!-- 行操作工具条 (悬浮在右上角) -->

                <div class="row-toolbar">

                  <span class="row-drag-handle" title="按住拖拽调整行顺序">

                    <el-icon><Rank /></el-icon> 第 {{ rIndex + 1 }} 行 · {{ row.components?.[0]?.name || '空白行' }}

                  </span>

                  <div class="tool-actions">

                    <el-button link size="small" :disabled="rIndex === 0" @click.stop="moveRow(rIndex, -1)" title="上移">

                      <el-icon><Top /></el-icon>

                    </el-button>

                    <el-button link size="small" :disabled="rIndex === pageDocument.list.length - 1" @click.stop="moveRow(rIndex, 1)" title="下移">

                      <el-icon><Bottom /></el-icon>

                    </el-button>

                    <el-button link size="small" @click.stop="duplicateRow(rIndex)" title="复制整行">

                      <el-icon><CopyDocument /></el-icon>

                    </el-button>

                    <el-button link size="small" type="danger" @click.stop="deleteRow(rIndex)" title="删除整行">

                      <el-icon><Delete /></el-icon>

                    </el-button>

                    <el-button
                      v-if="canMergeWithPrev(rIndex)"
                      link
                      size="small"
                      type="warning"
                      @click.stop="mergeRowWithPrev(rIndex)"
                      title="合并到上一行同排展示"
                    >
                      <el-icon><Fold /></el-icon> 合并同行
                    </el-button>

                  </div>

                </div>

                <!-- 行内组件 (每个组件独占一行，宽度 100%) -->

                <draggable
                  v-model="row.components"
                  group="pc-row-components"
                  item-key="id"
                  class="row-components-flex"
                  :style="getRowFlexStyle(row.rowStyle, row.components)"
                  @change="markDirty"
                >
                  <template #item="{ element: comp, index: cIndex }">
                    <div
                      class="canvas-comp-wrap"
                      :class="{ 'is-selected': selectedCompId === comp.id }"
                      :style="getCompWrapperStyle(comp.componentStyle, row.rowStyle, row.components ? row.components.length : 1, comp.type)"
                      @click.stop="handleSelectComp(row, rIndex, comp)"
                    >
                      <!-- 选中的组件左上角名称标识徽标（万米魔方设计） -->
                      <div
                        v-if="selectedCompId === comp.id"
                        class="comp-name-badge"
                      >
                        {{ comp.name || comp.type }}
                      </div>

                      <!-- 组件操作浮动按钮（复制、删除，还原参考图样式） -->
                      <div
                        v-if="selectedCompId === comp.id"
                        class="comp-floating-actions"
                      >
                        <div class="action-circle-btn" @click.stop="handleDuplicateComp(row, cIndex, comp)" title="复制组件（若宽度未满自动同行）">
                          <el-icon><CopyDocument /></el-icon>
                        </div>
                        <div class="action-circle-btn del" @click.stop="deleteComp(row, cIndex)" title="删除组件">
                          <el-icon><Delete /></el-icon>
                        </div>
                      </div>

                      <!-- 仿真预览内容渲染 (所见即所得) -->
                      <div class="comp-preview-body">

                      <component

                        :is="resolveCanvasTemplate(comp.type)"

                        v-if="resolveCanvasTemplate(comp.type)"

                        :component="comp"

                        :options="comp.options || {}"

                        :component-style="comp.componentStyle || {}"

                        :row-style="row.rowStyle || {}"

                      />

                      <div v-else class="comp-mock-placeholder">

                        <el-icon :size="24" class="mock-icon">

                          <component :is="iconMap[getCompIcon(comp.type)] || Grid" />

                        </el-icon>

                        <span class="mock-title">{{ comp.name }}</span>

                        <span class="mock-desc">组件类型：{{ comp.type }}</span>

                      </div>

                    </div>

                  </div>

                </template>

                  <template #footer>


                    <div v-if="!row.components || row.components.length === 0" class="empty-row-tip">
                      空行：请从左侧点击或拖拽添加组件
                    </div>
                  </template>
                </draggable>

              </div>

            </template>

          </draggable>

          <!-- 空白画布引导 -->

          <div v-if="!pageDocument.list || pageDocument.list.length === 0" class="empty-canvas-guide">

            <el-icon :size="48" color="#94a3b8"><Files /></el-icon>

            <p class="guide-title">画布为空，开始设计您的商城页面</p>

            <p class="guide-sub">从左侧选择组件拖拽入画布，或直接点击下方按钮创建第一行</p>

            <div style="display: flex; gap: 12px; justify-content: center;">
              <el-button type="primary" @click="handleAddNewRow">
                <el-icon><Plus /></el-icon> 添加新行
              </el-button>
            </div>

          </div>



        </div>

      </section>

      <!-- 3. 右侧属性配置面板 -->

      <aside class="right-inspector">

        <config-panel

          ref="configPanelRef"

          :selected-row="selectedRow"

          :selected-row-index="selectedRowIndex"

          :total-rows="pageDocument.list.length"

          :selected-component="selectedComponent"

          @move-row-up="() => moveRow(selectedRowIndex, -1)"

          @move-row-down="() => moveRow(selectedRowIndex, 1)"

          @move-row-top="() => moveRowToExtreme(selectedRowIndex, 'top')"

          @move-row-bottom="() => moveRowToExtreme(selectedRowIndex, 'bottom')"
          @move-to-row="targetIdx => moveRowTo(selectedRowIndex, targetIdx)"

          @delete-row="() => deleteRow(selectedRowIndex)"
          @tab-change="handleConfigTabChange"

        />

      </aside>

    </main>

    <!-- 全局链接选择器与商品选择器弹窗 -->
    <lili-dialog
      ref="liliDialogRef"
      @selectedLink="handleGlobalLinkSelected"
      @selectedGoodsData="handleGlobalGoodsSelected"
    />

    <!-- 全局媒体选择器弹窗（图片/视频） -->
    <el-dialog
      v-model="picModelFlag"
      width="1160px"
      top="16px"
      class="pc-image-picker-dialog"
      append-to-body
      destroy-on-close
      :title="currentPickerType === 'video' ? '选择视频' : '选择图片'"
      @close="handleImageDialogClose"
    >
      <ossManage
        @callback="handleGlobalImageSelected"
        :is-component="true"
        :initialize="picModelFlag"
        :max-select="1"
        :only-image="currentPickerType !== 'video'"
        :media-type="currentPickerType === 'video' ? 'VIDEO' : 'IMAGE'"
        ref="ossManageRef"
      />
    </el-dialog>
  </div>

</template>

<script setup>

import { ref, computed, onMounted, onUnmounted, reactive, provide, nextTick, watch } from 'vue';
import liliDialog from '@/components/lili-dialog/index.vue';
import ossManage from '@/views/sys/oss-manage/ossManage.vue';

import { useRoute, useRouter } from 'vue-router';

import Draggable from 'vuedraggable';

import {

  ArrowLeft, Search, Plus, Close, Delete, Top, Bottom, Rank, CopyDocument, Files,

  House, Compass, Picture, ShoppingBag, Ticket, Document, Menu, Bottom as BottomIcon,

  List, Grid, Fold, PictureRounded, Medal, Aim, FullScreen, VideoCamera,

  Goods, Postcard, Reading, DArrowRight, CollectionTag, Star, Edit, Bell, User

} from '@element-plus/icons-vue';

import { Message, Modal } from '@/utils/message';

import * as API_floor from '@/api/other.js';

import {

  COMPONENT_GROUPS,

  COMPONENT_DEFINITIONS,

  DEFAULT_ROW_STYLE,

  createRow,

  createComponent

} from './config.js';

import ConfigPanel from './config-panel/index.vue';

import { resolveCanvasTemplate } from './template/index.js';

const route = useRoute();

const router = useRouter();

// 图标映射表

const iconMap = {

  House, Compass, Picture, ShoppingBag, Ticket, Document, Menu, Bottom: BottomIcon,

  List, Grid, Fold, PictureRounded, Medal, Aim, FullScreen, Files, VideoCamera,

  Goods, Postcard, Reading, DArrowRight, CollectionTag, Star, Edit, Bell, User, Search

};

// 画布视口宽度 (默认 1920px，可选 1280px / 1600px)

const canvasWidth = ref(1920);

const activeCollapseGroups = ref(COMPONENT_GROUPS.map(g => g.key));

// 页面基础信息

const pageInfo = reactive({

  id: '',

  name: 'PC 首页装修',

  pageType: 'INDEX',

  pageClientType: 'PC',

  pageShow: false

});

// 行模型 DSL 数据对象

const pageDocument = ref({

  version: 2,

  pageStyle: {

    backgroundColor: '#f8fafc'

  },

  list: []

});

// 当前选中状态

const selectedRowId = ref(null);

const selectedCompId = ref(null);

const configPanelRef = ref(null);
const currentConfigTab = ref('component');

function isCurrentRowSelected(rowId) {
  // 只有在明确处于“行配置”标签页且未选中组件时才点亮整行边框
  return selectedRowId.value === rowId && currentConfigTab.value === 'row' && !selectedCompId.value;
}

function handleConfigTabChange(tab) {
  currentConfigTab.value = tab;
  if (tab === 'row') {
    selectedCompId.value = null;
  } else if ((tab === 'component' || tab === 'business') && !selectedCompId.value) {
    if (selectedRow.value?.components?.[0]) {
      selectedCompId.value = selectedRow.value.components[0].id;
    }
  }
}

const selectedRowIndex = computed(() => {

  return pageDocument.value.list.findIndex(r => r.id === selectedRowId.value);

});

const selectedRow = computed(() => {

  return pageDocument.value.list.find(r => r.id === selectedRowId.value) || null;

});

const selectedComponent = computed(() => {

  if (!selectedRow.value) return null;

  return selectedRow.value.components.find(c => c.id === selectedCompId.value) || null;

});

// 保存加载与修改标记

const isDirty = ref(false);

const saveLoading = ref(false);

// 左侧分组组件库

const componentGroups = COMPONENT_GROUPS.map(group => {

  const comps = COMPONENT_DEFINITIONS.filter(def => def.group === group.key);

  return {

    ...group,

    components: comps

  };

});


// ==================== 智能同行自动合并 / 拆分机制 ====================
let isNormalizing = false;

function autoNormalizeRows() {
  if (isNormalizing) return;
  if (!pageDocument.value || !Array.isArray(pageDocument.value.list)) return;

  isNormalizing = true;
  try {
    const rows = pageDocument.value.list;
    let modified = false;

    // 1. 清理孤立的完全空白行 (当页面有多行时，若某行 components 为空则自动清理，避免残留无用空行)
    if (rows.length > 1) {
      for (let i = rows.length - 1; i >= 0; i--) {
        if (!rows[i].components || rows[i].components.length === 0) {
          if (rows.length > 1) {
            if (selectedRowId.value === rows[i].id) {
              selectedRowId.value = rows[Math.max(0, i - 1)]?.id || null;
            }
            rows.splice(i, 1);
            modified = true;
          }
        }
      }
    }

    // 2. 检查单行内组件总宽度是否超标（例如用户将原本50%的组件改为100%，导致同行原本两个组件超100%）
    // 若单行内组件总宽度超过 100.5%，将溢出的组件自动拆分到新行！
    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      if (!Array.isArray(row.components) || row.components.length <= 1) continue;

      let currentSum = 0;
      let splitIdx = -1;
      for (let c = 0; c < row.components.length; c++) {
        const w = parseFloat(row.components[c].componentStyle?.widthRatio) || 100;
        if (currentSum + w > 100.5) {
          splitIdx = c;
          break;
        }
        currentSum += w;
      }

      if (splitIdx > 0) {
        // 将 splitIdx 及之后的组件移入新行
        const overflowComps = row.components.splice(splitIdx);
        const newRow = createRow();
        newRow.components = overflowComps;
        rows.splice(i + 1, 0, newRow);
        if (overflowComps.some(c => c.id === selectedCompId.value)) {
          selectedRowId.value = newRow.id;
        }
        modified = true;
      }
    }

    // 3. 自动合并相邻未满一整行的行！（用户修改为 50%、33.33% 时无需拖拽，相邻自动合并为一行）
    let i = 0;
    while (i < rows.length - 1) {
      const rowA = rows[i];
      const rowB = rows[i + 1];

      if (!rowA || !rowB || !Array.isArray(rowA.components) || !Array.isArray(rowB.components)) {
        i++;
        continue;
      }

      if (rowA.components.length === 0) {
        i++;
        continue;
      }

      if (rowB.components.length === 0) {
        i++;
        continue;
      }

      const widthA = rowA.components.reduce((sum, c) => {
        return sum + (parseFloat(c.componentStyle?.widthRatio) || 100);
      }, 0);

      const widthB = rowB.components.reduce((sum, c) => {
        return sum + (parseFloat(c.componentStyle?.widthRatio) || 100);
      }, 0);

      // 若两行组件宽度相加 <= 100.5% (例如 50% + 50% = 100%, 33.33% + 66.67% = 100%, 33.33% + 33.33% = 66.66%)，自动合并到第一行！
      if (widthA > 0 && widthB > 0 && (widthA + widthB) <= 100.5) {
        rowA.components.push(...rowB.components);
        if (selectedRowId.value === rowB.id) {
          selectedRowId.value = rowA.id;
        }
        rows.splice(i + 1, 1);
        modified = true;
        // 不递增 i，继续检查合并后的行是否还能再吸纳后续行（例如 1/3 + 1/3 + 1/3）
      } else {
        i++;
      }
    }

    if (modified) {
      markDirty();
    }
  } finally {
    isNormalizing = false;
  }
}

// 深度监听行数量与各组件排版宽度的变化，自动执行智能合并与拆分
watch(
  () => {
    if (!pageDocument.value?.list) return '';
    return pageDocument.value.list.map(r => {
      const cStr = (r.components || []).map(c => `${c.id}:${c.componentStyle?.widthRatio || '100%'}`).join(',');
      return `${r.id}:[${cStr}]`;
    }).join('|');
  },
  () => {
    nextTick(() => {
      autoNormalizeRows();
    });
  },
  { flush: 'post' }
);

function markDirty() {

  isDirty.value = true;

}

// 选中行

function handleSelectRow(row, index) {
  selectedRowId.value = row.id;
  // 若当前行已有组件，优先保持组件选中，高亮选框紧贴组件宽度，绝不退化为整行框！
  if (row.components && row.components.length > 0) {
    if (!selectedCompId.value || !row.components.some(c => c.id === selectedCompId.value)) {
      selectedCompId.value = row.components[0].id;
    }
    currentConfigTab.value = 'component';
    configPanelRef.value?.selectComponentTab?.();
  } else {
    selectedCompId.value = null;
    currentConfigTab.value = 'row';
    configPanelRef.value?.selectRowTab?.();
  }
}

// 选中组件

function handleSelectComp(row, rIndex, comp) {
  selectedRowId.value = row.id;
  selectedCompId.value = comp.id;
  currentConfigTab.value = 'component';
  configPanelRef.value?.selectComponentTab?.();
}

function clearSelection() {

  selectedRowId.value = null;

  selectedCompId.value = null;

}

// 规范化：确保每个组件都是独立的一行（一个组件是一行）

function normalizeRows(list) {
  if (!Array.isArray(list)) return [];
  const autoCompTypes = ['goodsGrid', 'gridFloor', 'bannerFloor', 'goodsBar', 'channelFloor', 'goodsList', 'recommendFeed', 'articleContent', 'brandWall', 'channelGrid', 'couponList'];
  const legacyHeights = [40, '40', 280, '280', 420, '420', 560, '560', 620, '620', 980, '980', 1270, '1270'];
  const normalized = [];
  list.forEach(r => {
    if (!r) return;
    if (r.rowStyle) {
      if (r.rowStyle.height === 40 || r.rowStyle.height === "40") {
        r.rowStyle.height = "";
      }
      const hasAutoComp = Array.isArray(r.components) && r.components.some(c => autoCompTypes.includes(c?.type));
      if (hasAutoComp && legacyHeights.includes(r.rowStyle.height)) {
        r.rowStyle.height = "";
      }
    }
    normalized.push(r);
  });
  return normalized;
}

// 拖拽克隆生成行（一个组件是一行）

function handleCloneAsRow(def) {
  markDirty();
  const newComp = createComponent(def);
  const newRow = createRow(def);
  newRow.components = [newComp];
  return newRow;
}

// 点击左侧「+」或组件卡片：追加新组件（支持同排自动合并）

function handleAppendComponent(def) {

  markDirty();

  const newComp = createComponent(def);

  // 1. 若当前选中的是无组件的空白行，放入该行

  if (selectedRow.value && (!selectedRow.value.components || selectedRow.value.components.length === 0)) {
    selectedRow.value.components = [newComp];
    if (def.defaultRowHeight !== undefined && def.defaultRowHeight !== null && def.defaultRowHeight !== '' && (!selectedRow.value.rowStyle.height || selectedRow.value.rowStyle.height === '')) {
      selectedRow.value.rowStyle.height = def.defaultRowHeight;
    }
    selectedCompId.value = newComp.id;
    configPanelRef.value?.selectComponentTab();
    return;
  }

  // 2. 若当前选中的行已有组件且宽度未满 100%（例如已有 50% 频道宫格，再点击则同行放置）
  if (selectedRow.value && Array.isArray(selectedRow.value.components) && selectedRow.value.components.length > 0) {
    const usedWidth = selectedRow.value.components.reduce((sum, compItem) => {
      return sum + (parseFloat(compItem.componentStyle?.widthRatio) || 100);
    }, 0);

    if (usedWidth < 99) {
      const remaining = 100 - usedWidth;
      if (remaining >= 48 && remaining <= 52) {
        newComp.componentStyle.widthRatio = '50%';
      } else if (remaining >= 30 && remaining <= 35) {
        newComp.componentStyle.widthRatio = '33.33%';
      } else if (remaining >= 15 && remaining <= 20) {
        newComp.componentStyle.widthRatio = '16.67%';
      } else if (remaining >= 60 && remaining <= 70) {
        newComp.componentStyle.widthRatio = '66.67%';
      }
      selectedRow.value.components.push(newComp);
      selectedCompId.value = newComp.id;
      configPanelRef.value?.selectComponentTab();
      Message.success('已自动添加到当前行同行展示');
      return;
    }
  }

  // 3. 否则新建独立行
  const newRow = createRow(def);
  newRow.components = [newComp];

  if (selectedRowId.value) {

    const curIndex = pageDocument.value.list.findIndex(r => r.id === selectedRowId.value);

    if (curIndex !== -1) {

      pageDocument.value.list.splice(curIndex + 1, 0, newRow);

    } else {

      pageDocument.value.list.push(newRow);

    }

  } else {

    pageDocument.value.list.push(newRow);

  }

  selectedRowId.value = newRow.id;

  selectedCompId.value = newComp.id;

  configPanelRef.value?.selectComponentTab();

}

// 新建空行


const liliDialogRef = ref(null);
const pendingLinkCallback = ref(null);
const pendingGoodsCallback = ref(null);

function openLinkPicker(callback) {
  pendingLinkCallback.value = callback;
  if (liliDialogRef.value) {
    liliDialogRef.value.clearGoodsSelected();
    liliDialogRef.value.goodsFlag = false;
    liliDialogRef.value.flag = true;
  }
}

function openGoodsPicker(callback, initialSelected = []) {
  pendingGoodsCallback.value = callback;
  if (liliDialogRef.value) {
    if (initialSelected && Array.isArray(initialSelected) && initialSelected.length) {
      liliDialogRef.value.goodsData = initialSelected.map(item => ({ ...item }));
    } else {
      liliDialogRef.value.clearGoodsSelected();
    }
    liliDialogRef.value.goodsFlag = true;
    liliDialogRef.value.flag = true;
  }
}

function handleGlobalLinkSelected(val) {
  if (typeof pendingLinkCallback.value === 'function') {
    let url = '';
    let title = '';
    if (typeof val === 'string') {
      url = val;
    } else if (val && typeof val === 'object') {
      title = val.title || val.goodsName || val.name || '';
      if (val.___type === 'goods' || val.goodsName) {
        url = `/goods/${val.id || val.skuId || ''}`;
      } else if (val.___type === 'category' || val.allId) {
        url = `/goodsList?categoryId=${val.id || ''}`;
      } else if (val.___type === 'shops' || val.storeName) {
        url = `/shop/${val.id || ''}`;
      } else if (val.___type === 'pages' || val.articleTitle) {
        url = `/article/${val.id || ''}`;
      } else if (val.___type === 'special') {
        url = `/special/${val.id || ''}`;
      } else if (val.___type === 'other') {
        const typeMap = {
          '首页': '/',
          '购物车': '/cart',
          '我的订单': '/home/MyOrder',
          '个人中心': '/home',
          '基本信息': '/home/Profile',
          '我的售后': '/home/AfterSale',
          '我的优惠券': '/home/Coupons',
          '收藏商品': '/home/Favorites',
          '消息中心': '/home/MsgList',
          '商家入驻': '/shopEntry',
          '领券中心': '/coupon',
          '秒杀频道': '/seckill',
          '积分商城': '/point',
          home: '/',
          cart: '/cart',
          collection: '/home/Favorites',
          order: '/home/MyOrder',
          user: '/home',
          coupon: '/coupon',
          point: '/point',
          afterSale: '/home/AfterSale',
          userInfo: '/home/Profile',
          myCoupons: '/home/Coupons',
          msg: '/home/MsgList',
          merchantEntry: '/shopEntry'
        };
        url = val.url || typeMap[val.title] || typeMap[val.originalType] || typeMap[val.___type] || `/${val.title || ''}`;
      } else {
        url = val.url || `/${val.id || ''}`;
      }
    }
    pendingLinkCallback.value({ url, title, raw: val });
    pendingLinkCallback.value = null;
  }
}

function handleGlobalGoodsSelected(val) {
  if (typeof pendingGoodsCallback.value === 'function') {
    pendingGoodsCallback.value(val);
    pendingGoodsCallback.value = null;
  }
}

provide('openLinkPicker', openLinkPicker);
provide('openGoodsPicker', openGoodsPicker);

const picModelFlag = ref(false);
const ossManageRef = ref(null);
const pendingImageCallback = ref(null);
const currentPickerType = ref('pic');

function openImagePicker(callback) {
  currentPickerType.value = 'pic';
  pendingImageCallback.value = callback;
  picModelFlag.value = true;
  nextTick(() => {
    if (ossManageRef.value) {
      ossManageRef.value.selectImage = true;
      ossManageRef.value.fileType = 'pic';
      if (typeof ossManageRef.value.changeFileType === 'function') {
        ossManageRef.value.changeFileType();
      }
    }
  });
}

function openVideoPicker(callback) {
  currentPickerType.value = 'video';
  pendingImageCallback.value = callback;
  picModelFlag.value = true;
  nextTick(() => {
    if (ossManageRef.value) {
      ossManageRef.value.selectImage = true;
      ossManageRef.value.fileType = 'video';
      if (typeof ossManageRef.value.changeFileType === 'function') {
        ossManageRef.value.changeFileType();
      }
    }
  });
}

function handleGlobalImageSelected(val) {
  picModelFlag.value = false;
  let url = '';
  if (typeof val === 'string') {
    url = val;
  } else if (val && typeof val === 'object') {
    url = val.url || '';
  }
  if (typeof pendingImageCallback.value === 'function') {
    pendingImageCallback.value(url, val);
    pendingImageCallback.value = null;
  }
}

function handleImageDialogClose() {
  picModelFlag.value = false;
  pendingImageCallback.value = null;
}

provide('openImagePicker', openImagePicker);
provide('openVideoPicker', openVideoPicker);
function handleAddNewRow() {

  markDirty();

  const newRow = createRow();

  pageDocument.value.list.push(newRow);

  selectedRowId.value = newRow.id;

  selectedCompId.value = null;

}

// 行排序移动

function moveRow(index, offset) {

  markDirty();

  const list = pageDocument.value.list;

  const target = index + offset;

  if (target < 0 || target >= list.length) return;

  const temp = list[index];

  list[index] = list[target];

  list[target] = temp;

}

function moveRowTo(fromIndex, toIndex) {
  if (fromIndex === undefined || fromIndex === null || fromIndex < 0) return;
  if (toIndex === undefined || toIndex === null || toIndex < 0) return;
  const list = pageDocument.value.list;
  if (!Array.isArray(list) || fromIndex >= list.length || toIndex >= list.length) return;
  if (fromIndex === toIndex) return;

  markDirty();
  const [removed] = list.splice(fromIndex, 1);
  list.splice(toIndex, 0, removed);
  selectedRowId.value = removed.id;
}

function moveRowToExtreme(index, direction) {

  markDirty();

  const list = pageDocument.value.list;

  const [removed] = list.splice(index, 1);

  if (direction === 'top') {

    list.unshift(removed);

  } else {

    list.push(removed);

  }

}

// 复制整行

function duplicateRow(index) {

  markDirty();

  const original = pageDocument.value.list[index];

  const clone = JSON.parse(JSON.stringify(original));

  clone.id = `row_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;

  clone.components.forEach(c => {

    c.id = `cmp_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;

  });

  pageDocument.value.list.splice(index + 1, 0, clone);

  selectedRowId.value = clone.id;

}

// 删除行

function deleteRow(index) {

  Modal.confirm({

    title: '提示',

    content: '确定要删除该整行楼层吗？删除后不可撤回。',

    onOk: () => {

      markDirty();

      pageDocument.value.list.splice(index, 1);

      selectedRowId.value = null;

      selectedCompId.value = null;

    }

  });

}

// 删除组件


// 计算行剩余可用宽度百分比
function getRowRemainingWidth(row) {
  if (!row || !Array.isArray(row.components)) return 100;
  const used = row.components.reduce((sum, compItem) => {
    return sum + (parseFloat(compItem.componentStyle?.widthRatio) || 100);
  }, 0);
  return Math.max(0, 100 - used);
}

// 判断当前行是否能与上一行合并同行
function canMergeWithPrev(rIndex) {
  if (rIndex <= 0) return false;
  const prevRow = pageDocument.value.list[rIndex - 1];
  const curRow = pageDocument.value.list[rIndex];
  if (!prevRow || !curRow) return false;
  const prevW = (prevRow.components || []).reduce((s, c) => s + (parseFloat(c.componentStyle?.widthRatio) || 100), 0);
  const curW = (curRow.components || []).reduce((s, c) => s + (parseFloat(c.componentStyle?.widthRatio) || 100), 0);
  return (prevW + curW) <= 101;
}

// 合并当前行至上一行
function mergeRowWithPrev(rIndex) {
  if (!canMergeWithPrev(rIndex)) return;
  markDirty();
  const prevRow = pageDocument.value.list[rIndex - 1];
  const curRow = pageDocument.value.list[rIndex];
  prevRow.components.push(...(curRow.components || []));
  pageDocument.value.list.splice(rIndex, 1);
  selectedRowId.value = prevRow.id;
  Message.success('已将组件合并到上一行同行展示');
}

// 复制组件
function handleDuplicateComp(row, cIndex, comp) {
  markDirty();
  const clone = JSON.parse(JSON.stringify(comp));
  clone.id = `cmp_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
  
  const usedWidth = (row.components || []).reduce((sum, c) => {
    return sum + (parseFloat(c.componentStyle?.widthRatio) || 100);
  }, 0);
  const compW = parseFloat(comp.componentStyle?.widthRatio) || 100;
  
  if (usedWidth + compW <= 101) {
    row.components.splice(cIndex + 1, 0, clone);
    selectedCompId.value = clone.id;
    Message.success('已复制到当前行（同行展示）');
  } else {
    const newRow = createRow(clone);
    newRow.components = [clone];
    const rIdx = pageDocument.value.list.findIndex(r => r.id === row.id);
    if (rIdx !== -1) {
      pageDocument.value.list.splice(rIdx + 1, 0, newRow);
    } else {
      pageDocument.value.list.push(newRow);
    }
    selectedRowId.value = newRow.id;
    selectedCompId.value = clone.id;
    Message.success('已复制组件到新行');
  }
}


function deleteComp(row, cIndex) {
  markDirty();
  row.components.splice(cIndex, 1);
  if (row.components.length > 0) {
    selectedCompId.value = row.components[Math.min(cIndex, row.components.length - 1)]?.id || null;
  } else {
    selectedCompId.value = null;
  }
}

function getCompIcon(type) {

  const item = COMPONENT_DEFINITIONS.find(d => d.type === type);

  return item?.icon || 'Grid';

}

// 计算行样式

function getRowWrapperStyle(style, components = []) {
  const hasAutoComp = Array.isArray(components) && components.some(c => ['goodsGrid', 'gridFloor', 'bannerFloor', 'goodsBar', 'channelFloor', 'goodsList', 'recommendFeed', 'articleContent', 'brandWall', 'channelGrid', 'couponList'].includes(c?.type));
  if (!style) return { width: '100%' };

  const s = {};

  // 1. 宽度 (width)
  if (style.width !== undefined && style.width !== '') {
    const w = String(style.width).trim();
    if (w && w !== '100%') {
      const num = parseInt(w, 10);
      if (!isNaN(num) && num >= 1920 && !w.endsWith('%')) {
        s.width = '100%';
      } else {
        s.width = /^\d+$/.test(w) ? `${w}px` : w;
        s.maxWidth = '100%';
      }
    } else {
      s.width = '100%';
    }
  } else {
    s.width = '100%';
  }

  // 2. 高度 (height)
  if (style.height !== undefined && style.height !== '') {
    const h = String(style.height).trim();
    if (h && Number(h) > 0) {
      const hVal = /^\d+$/.test(h) ? `${h}px` : h;
      if (hasAutoComp) {
        s.minHeight = hVal;
      } else {
        s.height = hVal;
        s.minHeight = hVal;
      }
    }
  }

  // 3. 外边距 (margin)
  const isNarrow = s.width !== '100%';
  if (Array.isArray(style.margin)) {
    s.marginTop = `${style.margin[0] || 0}px`;
    s.marginRight = style.margin[1] ? `${style.margin[1]}px` : (isNarrow ? 'auto' : '0px');
    s.marginBottom = `${style.margin[2] || 0}px`;
    s.marginLeft = style.margin[3] ? `${style.margin[3]}px` : (isNarrow ? 'auto' : '0px');
  } else if (isNarrow) {
    s.marginLeft = 'auto';
    s.marginRight = 'auto';
  }

  // 4. 内边距 (padding)
  if (Array.isArray(style.padding)) {
    s.paddingTop = `${style.padding[0] || 0}px`;
    s.paddingRight = `${style.padding[1] || 0}px`;
    s.paddingBottom = `${style.padding[2] || 0}px`;
    s.paddingLeft = `${style.padding[3] || 0}px`;
  }

  // 5. 圆角 (radius)
  if (Array.isArray(style.radius)) {
    s.borderTopLeftRadius = `${style.radius[0] || 0}px`;
    s.borderTopRightRadius = `${style.radius[1] || 0}px`;
    s.borderBottomRightRadius = `${style.radius[2] || 0}px`;
    s.borderBottomLeftRadius = `${style.radius[3] || 0}px`;
  }

// 行背景由内部组件配置统一管理

  return s;
}

function getRowFlexStyle(style, components = []) {
  const hasAutoComp = Array.isArray(components) && components.some(c => ['goodsGrid', 'gridFloor', 'bannerFloor', 'goodsBar', 'channelFloor', 'goodsList', 'recommendFeed', 'articleContent', 'brandWall', 'channelGrid', 'couponList'].includes(c?.type));
  if (!style) return { display: 'flex', flexDirection: 'row', flexWrap: 'nowrap', width: '100%', height: '100%' };
  const s = {
    display: 'flex',
    flexDirection: 'row',
    flexWrap: 'nowrap',
    alignItems: style.alignItems || 'stretch',
    justifyContent: style.justifyContent || 'flex-start',
    width: '100%',
    height: '100%'
  };
  if (style.height !== undefined && style.height !== '') {
    const h = String(style.height).trim();
    if (h && Number(h) > 0) {
      const hVal = /^\d+$/.test(h) ? `${h}px` : h;
      if (hasAutoComp) {
        s.minHeight = hVal;
      } else {
        s.height = hVal;
        s.minHeight = hVal;
      }
    }
  }
  if (style.gap !== undefined && style.gap !== '') {
    const g = String(style.gap).trim();
    if (g && Number(g) > 0) {
      s.gap = /^\d+$/.test(g) ? `${g}px` : g;
    }
  }
  return s;
}

// 计算组件外层样式

function getCompWrapperStyle(style, rowStyle = {}, totalComps = 1, compType = '') {
  const isAutoHeightComp = compType && ['goodsGrid', 'gridFloor', 'bannerFloor', 'goodsBar', 'channelFloor', 'goodsList', 'recommendFeed', 'articleContent', 'brandWall', 'channelGrid', 'couponList'].includes(compType);

  if (!style) return {};

  const s = {};

  if (rowStyle?.height !== undefined && rowStyle?.height !== '') {
    const rh = String(rowStyle.height).trim();
    if (rh && Number(rh) > 0) {
      const rhVal = /^\d+$/.test(rh) ? `${rh}px` : rh;
      if (isAutoHeightComp) {
        s.minHeight = rhVal;
      } else {
        s.height = rhVal;
        s.minHeight = rhVal;
      }
    }
  }
  const gap = Number(rowStyle?.gap) || 0;
  const totalGap = (totalComps > 1 && gap > 0) ? gap * (totalComps - 1) : 0;

  if (style.widthRatio && style.widthRatio !== 'auto') {
    let w = style.widthRatio;
    if (w === '16.67%' || w === '16.6%' || w === '16.7%') {
      w = totalGap > 0 ? `calc((100% - ${totalGap}px) / 6)` : 'calc(100% / 6)';
    } else if (w === '66.67%' || w === '66.6%' || w === '66.7%') {
      w = totalGap > 0 ? `calc((100% - ${totalGap}px) * 2 / 3)` : 'calc(100% * 2 / 3)';
    } else if (w === '33.33%' || w === '33.3%') {
      w = totalGap > 0 ? `calc((100% - ${totalGap}px) / 3)` : 'calc(100% / 3)';
    } else if (w === '50%') {
      w = totalGap > 0 ? `calc((100% - ${totalGap}px) / 2)` : '50%';
    }
    s.flex = `0 0 ${w}`;
    s.minWidth = '0';

    s.width = w;

    s.maxWidth = w;

    s.boxSizing = 'border-box';

  } else {

    s.flex = '1 1 0%';
    s.minWidth = '0';

    s.boxSizing = 'border-box';

  }

  if (Array.isArray(style.margin)) {

    s.marginTop = `${style.margin[0] || 0}px`;

    s.marginRight = `${style.margin[1] || 0}px`;

    s.marginBottom = `${style.margin[2] || 0}px`;

    s.marginLeft = `${style.margin[3] || 0}px`;

  }

  if (Array.isArray(style.padding)) {

    s.paddingTop = `${style.padding[0] || 0}px`;

    s.paddingRight = `${style.padding[1] || 0}px`;

    s.paddingBottom = `${style.padding[2] || 0}px`;

    s.paddingLeft = `${style.padding[3] || 0}px`;

  }

  if (Array.isArray(style.radius)) {

    s.borderTopLeftRadius = `${style.radius[0] || 0}px`;

    s.borderTopRightRadius = `${style.radius[1] || 0}px`;

    s.borderBottomRightRadius = `${style.radius[2] || 0}px`;

    s.borderBottomLeftRadius = `${style.radius[3] || 0}px`;

  }

  if (style.backgroundColor && style.backgroundColor !== 'transparent') {
    let bg = style.backgroundColor;
    if (/^rgba\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*,\s*0\s*\)$/.test(bg.trim())) {
      bg = bg.trim().replace(/,\s*0\s*\)$/, ', 1)');
    }
    s.backgroundColor = bg;
  }

  if (style.backgroundImage) {

    s.backgroundImage = `url(${style.backgroundImage})`;

    s.backgroundSize = 'cover';

    s.backgroundRepeat = 'no-repeat';

    s.backgroundPosition = 'center';

  }

  return s;

}

// 加载页面数据

function loadPageData(id) {

  API_floor.getHomeData(id).then(res => {

    if (res.success && res.result) {

      const data = res.result;

      pageInfo.id = data.id;

      pageInfo.name = data.name || 'PC 楼层装修';

      pageInfo.pageType = data.pageType || 'INDEX';

      pageInfo.pageClientType = data.pageClientType || 'PC';

      pageInfo.pageShow = data.pageShow === 'OPEN';

      if (data.pageData) {

        try {

          const parsed = typeof data.pageData === 'string' ? JSON.parse(data.pageData) : data.pageData;

          if (parsed && Array.isArray(parsed.list)) {

            pageDocument.value = {

              ...parsed,

              list: normalizeRows(parsed.list)

            };

          }

        } catch (e) {

          console.warn('解析 pageData 失败，使用纯净新行模型', e);

        }

      }

    }

  });

}

// 保存页面

function handleSavePage() {

  saveLoading.value = true;

  const payload = {

    name: pageInfo.name || (pageInfo.pageType === 'SPECIAL' ? '新建PC专题页' : '新建PC首页'),

    pageType: pageInfo.pageType || 'INDEX',

    pageClientType: 'PC',

    pageShow: pageInfo.pageShow ? 'OPEN' : 'CLOSE',

    pageData: JSON.stringify(pageDocument.value)

  };

  if (pageInfo.id) {

    payload.id = pageInfo.id;

    API_floor.updateHome(pageInfo.id, payload)

      .then(res => {

        saveLoading.value = false;

        if (res.success) {

          isDirty.value = false;

          Message.success('保存成功');

        } else {

          Message.error(res.message || '保存失败');

        }

      })

      .catch(() => {

        saveLoading.value = false;

      });

  } else {

    API_floor.setHomeSetup(payload)

      .then(res => {

        saveLoading.value = false;

        if (res.success) {

          isDirty.value = false;

          if (res.result && res.result.id) {

            pageInfo.id = res.result.id;

            router.replace({

              query: { ...route.query, id: res.result.id, mode: undefined }

            });

          }

          Message.success('保存成功');

        } else {

          Message.error(res.message || '保存失败');

        }

      })

      .catch(() => {

        saveLoading.value = false;

      });

  }

}

// 返回

function goBack() {

  const navigateBack = () => {

    if (window.opener) {

      window.close();

    } else {

      if (window.history.state?.back) {
        router.go(-1);
      } else {
        window.close();
      }

    }

  };

  if (isDirty.value) {

    Modal.confirm({

      title: '提示',

      content: '当前有未保存的装修修改，确定要离开吗？',

      onOk: () => {

        navigateBack();

      }

    });

  } else {

    navigateBack();

  }

}


let autoSaveTimer = null;

onMounted(() => {

  const id = route.query.id;

  const pageType = route.query.pageType || route.query.pagetype || 'INDEX';

  pageInfo.pageType = pageType;

  if (id) {

    loadPageData(id);

  } else {

    pageInfo.id = '';

    pageInfo.name = route.query.name || '平台首页装修';

    pageInfo.pageShow = true;

    handleAddNewRow();

  }

});

onUnmounted(() => {

  if (autoSaveTimer) {
    clearInterval(autoSaveTimer);
    autoSaveTimer = null;
  }

});

</script>

<style lang="scss" scoped>

.pc-editor-wrapper {

  display: flex;

  flex-direction: column;

  height: 100vh;

  width: 100vw;

  background: #f1f5f9;

  overflow: hidden;

  /* 顶部工具栏 */

  .pc-editor-header {

    height: 54px;

    background: #ffffff;

    border-bottom: 1px solid #e2e8f0;

    display: flex;

    align-items: center;

    justify-content: space-between;

    padding: 0 20px;

    flex-shrink: 0;

    z-index: 10;

    .header-left, .header-center, .header-right {

      display: flex;

      align-items: center;

    }

    .divider {

      width: 1px;

      height: 20px;

      background: #e2e8f0;

      margin: 0 16px;

    }

    .page-title-edit {

      width: 180px;

    }

    .resolution-switch {

      display: flex;

      align-items: center;

      gap: 8px;

      font-size: 13px;

      color: #475569;

    }

  }

  /* 主工作区 */

  .pc-editor-main {

    flex: 1;

    display: flex;

    overflow: hidden;

    /* 左侧组件库 */

    .left-palette {

      width: 320px;

      background: #ffffff;

      border-right: 1px solid #e2e8f0;

      display: flex;

      flex-direction: column;

      flex-shrink: 0;

      .palette-content {

        flex: 1;

        overflow-y: auto;

        padding: 8px 12px;

        :deep(.el-collapse) {

          border: none;

        }

        :deep(.el-collapse-item__header) {

          font-size: 13px;

          height: 42px;

          line-height: 42px;

        }

        .collapse-title {

          display: flex;

          align-items: center;

          width: 100%;

          padding-right: 12px;

          .grp-title {

            font-weight: 600;

            color: #0f172a;

          }

          .grp-desc {

            font-size: 11px;

            color: #94a3b8;

            margin-left: 8px;

            flex: 1;

            white-space: nowrap;

            overflow: hidden;

            text-overflow: ellipsis;

          }

          .grp-badge {

            margin-left: 8px;

          }

        }

        .components-grid {

          display: grid;

          grid-template-columns: repeat(3, 1fr);

          gap: 8px;

          padding: 6px 0;

          .comp-card {

            display: flex;

            flex-direction: column;

            align-items: center;

            justify-content: center;

            padding: 12px 4px;

            background: #f8fafc;

            border: 1px solid #e2e8f0;

            border-radius: 6px;

            cursor: grab;

            transition: all 0.2s;

            text-align: center;

            user-select: none;

            &:hover {

              border-color: #3b82f6;

              background: #eff6ff;

              transform: translateY(-1px);

              box-shadow: 0 2px 6px rgba(59, 130, 246, 0.12);

              .comp-icon {

                color: #2563eb;

              }

              .comp-name {

                color: #2563eb;

              }

            }

            .comp-icon {

              color: #475569;

              font-size: 20px;

              margin-bottom: 6px;

              transition: color 0.2s;

            }

            .comp-name {

              font-size: 12px;

              color: #1e293b;

              font-weight: 500;

              line-height: 1.3;

              max-width: 100%;

              white-space: nowrap;

              overflow: hidden;

              text-overflow: ellipsis;

            }

          }

        }

      }

    }

    /* 中间画布 */

    .center-canvas-area {
      flex: 1;
      overflow-y: auto;
      overflow-x: auto;
      padding: 30px 20px 60px 20px;
      display: flex;
      justify-content: center;
      align-items: flex-start;
      background: #e2e8f0;

      .canvas-container {
        min-height: 800px;
        height: fit-content;
        align-self: flex-start;
        margin-bottom: 40px;
        background: #ffffff;

        box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1);

        border-radius: 10px;

        display: flex;

        flex-direction: column;

        transition: width 0.3s ease;

        .browser-bar {

          height: 36px;

          background: #f1f5f9;

          border-top-left-radius: 10px;

          border-top-right-radius: 10px;

          border-bottom: 1px solid #e2e8f0;

          display: flex;

          align-items: center;

          padding: 0 16px;

          gap: 16px;

          .dots {

            display: flex;

            gap: 6px;

            .dot {

              width: 10px;

              height: 10px;

              border-radius: 50%;

              &.red { background: #ef4444; }

              &.yellow { background: #f59e0b; }

              &.green { background: #10b981; }

            }

          }

          .address-bar {

            flex: 1;

            height: 24px;

            background: #ffffff;

            border-radius: 4px;

            display: flex;

            align-items: center;

            padding: 0 10px;

            font-size: 11px;

            color: #64748b;

          }

        }

        .rows-drop-zone {

          min-height: 500px;
        height: fit-content;

          padding: 10px 0;

          .canvas-row-wrap {

            position: relative;

            box-sizing: border-box;

            display: flex;

            flex-direction: column;

            border: 2px solid transparent;

            transition: border-color 0.2s;

            &:hover {
              // 不再出现全宽蓝框，保持画布清爽聚焦组件
              border-color: transparent;
            }

            &.is-row-selected {

              border-color: #2563eb !important;

              border-style: solid !important;

              .row-toolbar {

                display: flex;

              }

            }

            .row-toolbar {

              display: none;

              position: absolute;

              top: -30px;

              right: 10px;

              background: #1e293b;

              color: #ffffff;

              padding: 2px 10px;

              border-radius: 4px;

              font-size: 12px;

              align-items: center;

              gap: 8px;

              z-index: 50;

              .row-drag-handle {

                cursor: grab;

                display: flex;

                align-items: center;

                gap: 4px;

                color: #cbd5e1;

              }

              .tool-actions {

                display: flex;

                align-items: center;

                gap: 4px;

                .el-button {

                  color: #cbd5e1;

                  padding: 0 4px;

                  &:hover { color: #ffffff; }

                }

              }

            }

            .row-components-flex {
              .comp-floating-actions {
                position: absolute;
                top: 6px;
                right: 6px;
                display: flex;
                align-items: center;
                gap: 6px;
                z-index: 50;

                .action-circle-btn {
                  width: 22px;
                  height: 22px;
                  border-radius: 50%;
                  background: #409EFF;
                  color: #ffffff;
                  display: flex;
                  align-items: center;
                  justify-content: center;
                  font-size: 11px;
                  cursor: pointer;
                  box-shadow: 0 2px 6px rgba(64, 158, 255, 0.4);
                  transition: transform 0.15s, background-color 0.15s;

                  &:hover {
                    transform: scale(1.15);
                    background: #337ecc;
                  }

                  &.del:hover {
                    background: #dc2626;
                  }
                }
              }




              display: flex;

              flex-direction: row;

              flex-wrap: nowrap;

              width: 100%;

              min-height: 60px;

              .empty-row-tip {

                display: flex;

                align-items: center;

                justify-content: center;

                height: 80px;

                color: #94a3b8;

                font-size: 13px;

                background: #f8fafc;

                border: 1px dashed #cbd5e1;

                border-radius: 6px;

                margin: 8px 0;

              }

              .canvas-comp-wrap {
                position: relative;
                box-sizing: border-box;
                overflow: visible;
                background: transparent;
                display: flex;
                flex-direction: column;
                height: 100%;
                border: 2px solid transparent;
                border-radius: 4px;
                transition: border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out;

                &:hover {
                  border-color: rgba(64, 158, 255, 0.5);
                  border-style: dashed;
                }

                &.is-selected {
                  border-color: #409EFF !important;
                  border-style: solid !important;
                  box-shadow: 0 0 0 1px rgba(64, 158, 255, 0.25);
                  z-index: 30;
                }

                .comp-name-badge {
                  position: absolute;
                  top: 0;
                  left: 0;
                  background: #409EFF;
                  color: #ffffff;
                  font-size: 11px;
                  line-height: 1;
                  padding: 3px 8px;
                  border-bottom-right-radius: 4px;
                  z-index: 60;
                  pointer-events: none;
                  font-weight: 500;
                  letter-spacing: 0.5px;
                  box-shadow: 0 1px 3px rgba(64, 158, 255, 0.3);
                }

                .comp-preview-body {

                  width: 100%;

                  max-width: 100%;

                  box-sizing: border-box;

                  overflow: visible;

                  flex: 1;

                  display: flex;

                  flex-direction: column;

                  height: 100%;

                  > * {
                    flex: 1;
                    height: 100%;
                    width: 100%;
                    box-sizing: border-box;
                  }

                  .comp-mock-placeholder {

                    display: flex;

                    flex-direction: column;

                    align-items: center;

                    justify-content: center;

                    padding: 30px 16px;

                    gap: 6px;

                    .mock-icon {

                      color: #3b82f6;

                    }

                    .mock-title {

                      font-size: 14px;

                      font-weight: 600;

                      color: #1e293b;

                    }

                    .mock-desc {

                      font-size: 12px;

                      color: #94a3b8;

                    }

                  }

                }

              }

            }

          }

        }

        .empty-canvas-guide {

          display: flex;

          flex-direction: column;

          align-items: center;

          justify-content: center;

          padding: 100px 20px;

          .guide-title {

            font-size: 16px;

            font-weight: 600;

            color: #334155;

            margin: 16px 0 8px;

          }

          .guide-sub {

            font-size: 13px;

            color: #94a3b8;

            margin-bottom: 20px;

          }

        }

        .canvas-bottom-add {

          padding: 20px;

          display: flex;

          justify-content: center;

          border-top: 1px dashed #e2e8f0;

          .bottom-add-btn {

            width: 300px;

          }

        }

      }

    }

    /* 右侧属性面板 */

    .right-inspector {

      width: 360px;

      background: #ffffff;

      border-left: 1px solid #e2e8f0;

      display: flex;

      flex-direction: column;

      flex-shrink: 0;

    }

  }

}

</style>


<style lang="scss">
.pc-image-picker-dialog {
  margin-top: 16px !important;
  margin-bottom: 16px !important;
  max-height: calc(100vh - 32px) !important;
  display: flex !important;
  flex-direction: column !important;
  overflow: hidden !important;

  .el-dialog__header {
    padding: 12px 20px 8px !important;
    flex-shrink: 0 !important;
  }

  .el-dialog__body {
    padding: 6px 16px 12px !important;
    overflow: hidden !important;
    flex: 1 !important;
    border: none !important;

    * {
      scrollbar-width: none !important;
      -ms-overflow-style: none !important;
      &::-webkit-scrollbar {
        display: none !important;
        width: 0 !important;
        height: 0 !important;
      }
    }
  }
}
</style>
