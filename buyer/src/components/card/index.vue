<template>
  <el-card class="_Card" shadow="never">
    <template #header>
      <div class="card-header">
        <div class="cardTitle">
          <span :style="{ fontSize: `${_Size}px` }">{{ _Title }}</span>
          <div v-if="_Tabs" class="cardTabs">
            <div
              @click="tabsChange(index)"
              :class="{ active: isActive == index }"
              class="cardTabsItem"
              :style="{ fontSize: `${_Size - 2}px` }"
              v-for="(item, index) in _Tabs"
              :key="index"
            >
              {{ item }}
            </div>
          </div>
        </div>
        <div class="cardExtra" v-if="_More" @click="callBack()">
          {{ _More }}
        </div>
      </div>
    </template>
    <slot />
  </el-card>
</template>

<script>
export default {
  name: "index",
  props: {
    _Tabs: {
      type: null,
      default: "",
    },
    _Title: {
      type: null,
      default: "卡片头部",
    },
    _More: {
      type: null,
      default: false,
    },
    _Size: {
      type: Number,
      default: 16,
    },
    _Src: {
      type: null,
      default: null,
    },
    _ActiveTab: {
      type: Number,
      default: 0,
    },
  },
  data() {
    return {
      isActive: this._ActiveTab,
    };
  },
  watch: {
    _ActiveTab(val) {
      this.isActive = val;
    },
  },
  methods: {
    callBack() {
      if (this._Src) {
        this.$router.push({ path: this._Src });
      }
    },
    tabsChange(index) {
      this.isActive = index;
      this.$emit("_Change", index);
    },
  },
};
</script>

<style scoped lang="scss">
.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.cardTitle {
  display: flex;
  cursor: pointer;
}
.active {
  color: $theme_color;
  position: relative;
  &::before {
    content: "";
    position: absolute;
    width: 100%;
    height: 3px;
    bottom: 0;
    left: 0;
    background: $theme_color;
  }
}

.cardTabs {
  display: flex;
  padding: 0 12px;

  > .cardTabsItem {
    padding: 0 12px;
  }

  > .cardTabsItem:hover {
    color: $theme_color;
  }
}

:deep(._Card) {
  margin-bottom: 20px;
  @include white_background_color();
}

:deep(._Card .el-card__header) {
  position: relative;
  padding: 0 14px;
  height: 50px;
  line-height: 50px;

  &::before {
    content: "";
    width: 3px;
    height: 50%;
    top: 25%;
    background: $theme_color;
    position: absolute;
    left: 0;
  }
}

.cardExtra {
  color: $theme_color;
  cursor: pointer;
}

:deep(._Card .el-card__body) {
  padding: 0 !important;
  min-height: 0;
}

:deep(._Card .el-card__body:empty) {
  display: none;
}
</style>
