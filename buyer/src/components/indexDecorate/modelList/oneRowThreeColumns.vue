<template>
    <div class="line flex flex-a-c flex-j-sb">
        <div
          class="column hover-pointer"
          v-for="(item, index) in data.options.list"
          :key="index"
          @click="linkTo(item.url)"
        >
          <img :src="item.img" loading="lazy" decoding="async" class="three-column-img" alt="" />
        </div>
    </div>
</template>

<script setup>
defineOptions({ name: "oneRowThreeColumns" });

defineProps({
  data: {
    type: Object,
    default: () => ({})
  }
});
</script>

<style scoped lang="scss">
.line {
  width: 100%;
}
.column {
  width: 385px;
  height: 165px;
  cursor: pointer;
  > img {
    display: block;
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
}
</style>
