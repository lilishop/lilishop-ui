<template>
  <div>
    <Button @click="enable = true">语言设定</Button>
    <Modal v-model="enable" draggable sticky scrollable :mask="false" :title="title">
      <div>
        <RadioGroup v-model="language">
          <Radio :label="item.value || item.label" :key="index" v-for="(item,index) in data">
            <span>{{item.title || item.name}}</span>
          </Radio>
        </RadioGroup>
      </div>

    </Modal>
  </div>
</template>

<script>
export default {
  /**
   * data 循环的语言内容格式 [{'title':'test','value':'val'}]
   */
  props: {
    data: {
      type: Array,
      default: () => {
        return [];
      },
    },
  },
  watch: {
    /**
     * 回调语言内容
     */
    language(val) {
      if (val) {
        this.$emit("language", val);
      }
    },
  },
  data() {
    return {
      language: "", //语言值
      enable: false, //是否开启modal
      title: "转换语言",
    };
  },
};
</script>

<style lang="scss" scoped>
</style>