<template>
  <div class="user-center-page">
    <div class="user-center-title">{{ title }}</div>
    <div class="user-center-panel">
      <div v-if="showToolbar" class="user-center-toolbar">
        <div class="user-center-tabs">
          <div
            v-for="(item, index) in tabs"
            :key="index"
            class="user-center-tab"
            :class="{ active: activeTab === index }"
            @click="$emit('tab-change', index)"
          >
            {{ item }}
          </div>
        </div>
        <div class="user-center-extra">
          <slot name="extra">
            <el-button v-if="moreText" type="primary" @click="handleMore">{{ moreText }}</el-button>
          </slot>
        </div>
      </div>
      <div class="user-center-content">
        <slot />
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "UserCenterLayout",
  props: {
    title: {
      type: String,
      required: true,
    },
    tabs: {
      type: Array,
      default: () => [],
    },
    activeTab: {
      type: Number,
      default: 0,
    },
    moreText: {
      type: String,
      default: "",
    },
    moreTo: {
      type: [String, Object],
      default: "",
    },
  },
  emits: ["tab-change", "more"],
  computed: {
    showToolbar() {
      return this.tabs.length || this.moreText || this.$slots.extra;
    },
  },
  methods: {
    handleMore() {
      this.$emit("more");
      if (!this.moreTo) return;
      if (typeof this.moreTo === "string") {
        this.$router.push(this.moreTo);
      } else {
        this.$router.push(this.moreTo);
      }
    },
  },
};
</script>

<style scoped lang="scss">
.user-center-page {
  margin-bottom: 40px;
}

.user-center-title {
  height: 54px;
  line-height: 54px;
  padding: 0 20px;
  margin-bottom: 12px;
  background: #fff;
  border: 1px solid #eee;
  color: #333;
  font-size: 16px;
  font-weight: 600;
}

.user-center-panel {
  padding: 0 16px 16px;
  background: #fff;
  border: 1px solid #eee;
}

.user-center-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-height: 54px;
  border-bottom: 1px solid #eee;
}

.user-center-tabs {
  display: flex;
  align-items: center;
  height: 54px;
}

.user-center-tab {
  position: relative;
  height: 54px;
  line-height: 54px;
  margin-right: 28px;
  color: #333;
  cursor: pointer;

  &:hover,
  &.active {
    color: $theme_color;
  }

  &.active::after {
    content: "";
    position: absolute;
    left: 0;
    right: 0;
    bottom: -1px;
    height: 2px;
    background: $theme_color;
  }
}

.user-center-extra {
  display: flex;
  align-items: center;
}

.user-center-content {
  padding-top: 14px;
}
</style>
