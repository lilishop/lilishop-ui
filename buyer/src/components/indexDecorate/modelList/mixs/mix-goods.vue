<template>
  <div class="mix-panel flex" v-if="data.options.left.model == 'goods'">
    <div class="left-side hover-pointer" @click="linkTo(data.options.left.data.image.url)">
      <img :src="data.options.left.data.image.src" alt="" />
    </div>
    <div class="right-side">
      <div class="badge-box flex">
        <div class="badge hover-pointer" @click="linkTo(data.options.left.data.badge.url)">
          {{ data.options.left.data.badge.label }}
        </div>
      </div>
      <div class="flex goods-list">
        <div
          class="goods-item flex hover-pointer"
          @click="linkTo(item.url)"
          :key="index"
          v-for="(item, index) in data.options.left.data.list"
        >
          <div class="goods-thumbnail">
            <img :src="item.img" alt="" />
          </div>
          <div class="goods-detail">
            <div class="goods-detail-title">{{ item.title }}</div>
            <div class="goods-detail-price">{{ $filters.unitPrice(item.price, '¥') }}</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "mix-goods",
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
  width: 196.7px;
  height: 344px;

  > img {
    display: block;
    width: 100%;
    height: 100%;
    object-fit: cover;
    border-radius: 10px 0 0 10px;
  }
}

.right-side {
  flex: 1;
  min-width: 0;
  height: 344px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  box-sizing: border-box;
  overflow: hidden;
}

.goods-detail-title {
  font-size: 13px;
  font-weight: normal;
  line-height: 16px;
  text-align: center;
  color: #333333;
}

.goods-detail-price {
  font-size: 14px;
  font-weight: normal;
  line-height: 17px;
  color: $theme_color;
  margin-top: 8px;
}

.goods-thumbnail {
  margin-left: 7px;
  display: flex;
  align-items: center;
  flex-shrink: 0;

  > img {
    width: 90px;
    height: 90px;
    object-fit: contain;
  }
}

.badge-box {
  justify-content: flex-end;
  flex-shrink: 0;
}

.goods-list {
  width: 100%;
  box-sizing: border-box;
  flex-wrap: wrap;
  justify-content: space-between;
  padding: 0 16px;
  gap: 9px 0;
}

.goods-item {
  cursor: pointer;
  display: flex;
  align-items: center;
  flex: 0 0 calc(50% - 4px);
  width: calc(50% - 4px);
  height: 119px;
  border-radius: 9.8px;
  box-sizing: border-box;
  overflow: hidden;
  background: #ffffff;
  transition: 0.35s;

  &:hover {
    box-shadow: 0 1px 6px 0 #e5e5e5;
  }
}

.badge {
  width: 50px;
  height: 27px;
  line-height: 27px;
  border-radius: 13.3px 0 0 13.3px;
  background: $theme_color;
  font-size: 12.6px;
  text-align: center;
  color: #ffffff;
  margin-top: 26px;
  margin-bottom: 17px;
}
</style>
