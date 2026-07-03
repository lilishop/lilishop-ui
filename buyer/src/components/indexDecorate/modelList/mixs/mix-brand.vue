<template>
  <div class="mix-panel flex" v-if="data.options.right.model == 'brand'">
    <div class="left-side hover-pointer" @click="linkTo(data.options.right.data.image.url)">
      <img :src="data.options.right.data.image.src" alt="" />
    </div>
    <div class="right-side">
      <div class="badge-box flex">
        <div class="round">
          <el-icon><ArrowRight /></el-icon>
        </div>
      </div>
      <div class="flex goods-list">
        <div
          class="goods-item flex hover-pointer"
          @click="linkTo(item.url)"
          :key="index"
          v-for="(item, index) in data.options.right.data.list"
        >
          <div class="goods-thumbnail">
            <img :src="item.img" alt="" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ArrowRight } from "@element-plus/icons-vue";

export default {
  name: "mix-brand",
  components: { ArrowRight },
  props: {
    data: {
      type: Object,
      default: () => ({}),
    },
  },
};
</script>

<style scoped lang="scss">
.mix-panel {
  height: 100%;
  align-items: stretch;
  overflow: hidden;
}

.left-side {
  flex-shrink: 0;
  width: 254px;
  height: 344px;

  > img {
    display: block;
    width: 100%;
    height: 100%;
    object-fit: cover;
    border-radius: 9.8px 0 0 9.8px;
  }
}

.right-side {
  flex: 1;
  min-width: 0;
  height: 344px;
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
  overflow: hidden;
}

.badge-box {
  margin-top: 24px;
  margin-bottom: 8px;
  justify-content: flex-end;
  flex-shrink: 0;

  > .round {
    width: 17.5px;
    height: 17.5px;
    border-radius: 50%;
    text-align: center;
    line-height: 17.5px;
    border: 0.7px solid #333333;
    margin-right: 17.5px;
  }
}

.goods-list {
  width: 100%;
  box-sizing: border-box;
  flex-wrap: wrap;
  justify-content: space-between;
  align-content: flex-start;
  padding: 0 16px 12px;
  gap: 8px 0;
  flex: 1;
  min-height: 0;
  overflow: hidden;
}

.goods-item {
  display: flex;
  align-items: center;
  justify-content: center;
  flex: 0 0 calc(50% - 4px);
  width: calc(50% - 4px);
  height: 82px;
  border-radius: 9.8px;
  box-sizing: border-box;
  overflow: hidden;
  background: #ffffff;
  transition: 0.35s;
  cursor: pointer;
}

.goods-thumbnail {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;

  > img {
    max-width: 80px;
    max-height: 76px;
    width: auto;
    height: auto;
    object-fit: contain;
  }
}
</style>
