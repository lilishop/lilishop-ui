<template>
  <div class="model-form">
    <div class="model-content">
      <template v-for="(element, index) in data.list">
        <model-form-item
          v-if="element && element.key"
          :key="element.key"
          :element="element"
          :index="index"
          :data="data"
        ></model-form-item>
      </template>
    </div>
  </div>
</template>
<script>
import ModelFormItem from './modelFormItem.vue';
export default {
  name: 'modelForm',
  components: {
    ModelFormItem
  },
  props: ['data']
};
</script>
<style lang="scss" scoped>
.model-content {
  width: 1200px;
  margin: 0 auto;
  // background: #fff;
  min-height: 1200px;
}
</style>
