<template>
  <div style="background-color: #fff;">

    <Form ref="form" :model="form" :label-width="120" :rules="formValidate" style="padding: 10px;">

      <Divider orientation="left">分销设置</Divider>
      <FormItem label="是否开启分销" prop="distribution">
        <i-switch size="large" v-model="form.isOpen" :true-value="true" :false-value="false" @on-change="handleSubmit">
          <span slot="open">开启</span>
          <span slot="close">关闭</span>
        </i-switch>
      </FormItem>
    </Form>
  </div>
</template>

<script>

  import {setSetting, getSetting} from "@/api/index";

  export default {
    name: "distributionSetting",
    components: {},
    data() {
      return {
        loading: true, // 表单加载状态
        form: { // 添加或编辑表单对象初始化数据
          isOpen: ""
        },
        // 表单验证规则
        formValidate: {},
        submitLoading: false, // 添加或编辑提交状态
        selectList: [], // 多选数据
        selectCount: 0, // 多选计数
        data: [], // 表单数据
        total: 0 // 表单数据总数
      };
    },
    methods: {
      init() {
        this.getDataList();
      },
      getDataList() {
        this.loading = true;
        // 带多条件搜索参数获取表单数据 请自行修改接口
        getSetting("DISTRIBUTION_SETTING").then(res => {
          this.loading = false;
          if (res.success) {
            this.form = res.result;
          }
        });
        this.loading = false;
      },
      handleSubmit() {

        this.$refs.form.validate(valid => {
          if (valid) {
            setSetting("DISTRIBUTION_SETTING", this.form).then(res => {
              if (res.success) {
                this.$Message.success("操作成功");
                this.getDataList();
              }
            });
          }
        })

      }
    },
    mounted() {
      this.init();
    }
  };
</script>
<style lang="scss" scoped>

</style>
