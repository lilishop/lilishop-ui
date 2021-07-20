<template>
  <div style="background-color: #fff;">

    <Form ref="form" :model="form" :label-width="120" style="padding: 10px;">

      <Divider orientation="left">分销设置</Divider>
      <FormItem label="是否开启分销" prop="distribution">
        <i-switch size="large" v-model="form.isOpen" :true-value="true" :false-value="false" @on-change="handleSubmit">
          <span slot="open">开启</span>
          <span slot="close">关闭</span>
        </i-switch>
      </FormItem>
      <FormItem label="分销关系绑定天数" prop="distributionDay">
        <InputNumber :min="1" style="width:100px;" v-model="form.distributionDay" @on-change="handleSubmit"></InputNumber>
      </FormItem>
      <FormItem label="分销结算天数" prop="cashDay">
        <InputNumber :min="1" style="width:100px;" v-model="form.cashDay" @on-change="handleSubmit "></InputNumber>
      </FormItem>
    </Form>
  </div>
</template>

<script>
import { setSetting, getSetting } from "@/api/index";

export default {
  name: "distributionSetting",
  data() {
    return {
      form: {
        // 添加或编辑表单对象初始化数据
        isOpen: "",
        distributionDay: "", //分销关系绑定天数
        cashDay: "", //分销结算天数
      }
    };
  },
  methods: {
    init() {
      this.getDataList();
    },
    // 获取分销设置数据
    getDataList() {
      // 带多条件搜索参数获取表单数据 请自行修改接口
      getSetting("DISTRIBUTION_SETTING").then((res) => {
        if (res.success) {
          this.form = res.result;
        }
      });
    },
    // 提交数据
    handleSubmit() {
      this.$options.filters.debounce(this.submit(), 1500);
    },
    // 提交api
    submit() {
      setSetting("DISTRIBUTION_SETTING", this.form).then((res) => {
        if (res.success) {
          this.$Message.success("操作成功");
          this.getDataList();
        }
      });
    },
  },
  mounted() {
    this.init();
  },
};
</script>
<style lang="scss" scoped>
</style>
