<template>

  <div class="row-wrapper" :style="rowWrapperStyle">

    <div class="row-inner-flex" :style="rowInnerFlexStyle">

      <div

        v-for="comp in row.components"

        :key="comp.id"

        class="component-cell"

        :style="getComponentCellStyle(comp.componentStyle, row.rowStyle, row.components ? row.components.length : 1)"

      >

        <component

          :is="resolveComponent(comp.type)"

          v-if="resolveComponent(comp.type)"
          :component="comp"

          :options="comp.options || {}"

          :component-style="comp.componentStyle || {}"

          :row-style="row.rowStyle || {}"

        />

        <div v-else class="unknown-component-placeholder">

          未知组件: {{ comp.type }}

        </div>

      </div>

    </div>

  </div>

</template>



<script setup>

import { computed } from 'vue';

import { resolveComponent } from './registry.js';



const props = defineProps({

  row: {

    type: Object,

    required: true

  }

});



const rowWrapperStyle = computed(() => {
  const s = props.row.rowStyle || {};
  const style = {};

  // 宽度 (width)
  if (s.width !== undefined && s.width !== '') {
    const w = String(s.width).trim();
    if (w && w !== '100%') {
      const num = parseInt(w, 10);
      if (!isNaN(num) && num >= 1920 && !w.endsWith('%')) {
        style.width = '100%';
      } else {
        style.width = /^\d+$/.test(w) ? `${w}px` : w;
        style.maxWidth = '100%';
      }
    } else {
      style.width = '100%';
    }
  } else {
    style.width = '100%';
  }

  // 高度 (height)
  if (s.height !== undefined && s.height !== '') {
    const h = String(s.height).trim();
    if (h && Number(h) > 0) {
      const hVal = /^\d+$/.test(h) ? `${h}px` : h;
      style.height = hVal;
      style.minHeight = hVal;
    }
  }

  // 外边距 (margin)
  const isNarrow = style.width !== '100%';
  if (Array.isArray(s.margin)) {
    style.marginTop = `${s.margin[0] || 0}px`;
    style.marginRight = s.margin[1] ? `${s.margin[1]}px` : (isNarrow ? 'auto' : '0px');
    style.marginBottom = `${s.margin[2] || 0}px`;
    style.marginLeft = s.margin[3] ? `${s.margin[3]}px` : (isNarrow ? 'auto' : '0px');
  } else if (isNarrow) {
    style.marginLeft = 'auto';
    style.marginRight = 'auto';
  }

  // 内边距 (padding)
  if (Array.isArray(s.padding)) {
    style.paddingTop = `${s.padding[0] || 0}px`;
    style.paddingRight = `${s.padding[1] || 0}px`;
    style.paddingBottom = `${s.padding[2] || 0}px`;
    style.paddingLeft = `${s.padding[3] || 0}px`;
  }

  // 圆角 (radius)
  if (Array.isArray(s.radius)) {
    style.borderTopLeftRadius = `${s.radius[0] || 0}px`;
    style.borderTopRightRadius = `${s.radius[1] || 0}px`;
    style.borderBottomRightRadius = `${s.radius[2] || 0}px`;
    style.borderBottomLeftRadius = `${s.radius[3] || 0}px`;
  }

// 行背景由各组件配置统一管理

  return style;
});



const rowInnerFlexStyle = computed(() => {

  const s = props.row.rowStyle || {};

  const styleObj = {

    display: 'flex',

    flexDirection: 'row',

    flexWrap: 'nowrap',

    alignItems: s.alignItems || 'stretch',

    justifyContent: s.justifyContent || 'flex-start',

    width: '100%',

    height: '100%',

    gap: `${s.gap || 0}px`

  };

  if (s.height !== undefined && s.height !== '') {
    const h = String(s.height).trim();
    if (h && Number(h) > 0) {
      const hVal = /^\d+$/.test(h) ? `${h}px` : h;
      styleObj.height = hVal;
      styleObj.minHeight = hVal;
    }
  }

  return styleObj;

});



function getComponentCellStyle(style, rowStyle = {}, totalComps = 1) {

  if (!style) return { flex: '1 1 0%' };

  const s = {};

  if (rowStyle?.height !== undefined && rowStyle?.height !== '') {
    const rh = String(rowStyle.height).trim();
    if (rh && Number(rh) > 0) {
      const rhVal = /^\d+$/.test(rh) ? `${rh}px` : rh;
      s.height = rhVal;
      s.minHeight = rhVal;
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

    s.width = w;

    s.maxWidth = w;

    s.minWidth = '0';

  } else {

    s.flex = '1 1 0%';

    s.minWidth = '0';

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



  if (Array.isArray(style.margin)) {

    s.marginTop = `${style.margin[0] || 0}px`;

    s.marginRight = `${style.margin[1] || 0}px`;

    s.marginBottom = `${style.margin[2] || 0}px`;

    s.marginLeft = `${style.margin[3] || 0}px`;

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

</script>



<style lang="scss" scoped>

.row-wrapper {

  box-sizing: border-box;

  display: flex;

  flex-direction: column;



  .row-inner-flex {

    box-sizing: border-box;

    flex: 1;

    height: 100%;

    min-height: 0;



    .component-cell {

      box-sizing: border-box;

      min-width: 0;

      display: flex;

      flex-direction: column;

      height: 100%;

      > * {
        flex: 1;
        height: 100%;
        width: 100%;
        box-sizing: border-box;
      }

    }

  }

}



.unknown-component-placeholder {

  padding: 20px;

  background: #fef2f2;

  border: 1px dashed #f87171;

  color: #dc2626;

  text-align: center;

  font-size: 13px;

  border-radius: 6px;

}

</style>

