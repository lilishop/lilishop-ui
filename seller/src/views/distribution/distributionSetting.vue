<template>
  <div class="search">
    <Card style="margin-left: 10px">
      <Tabs v-model="type">
        <TabPane label="分销设置" name="INFO">
          <Form ref="form" :model="form" :label-width="100" >
            <FormItem label="是否开启分销" prop="isOpen" class="wangEditor">
              <i-switch v-model="form.isOpen"></i-switch>
              <span class="desc">开启分销，则全店商品具有分销功能</span>
            </FormItem>
            <FormItem label="一级佣金比例" prop="isOpen">
              <InputNumber :min="0" :max="99999" v-model="form.commission" type="number" maxlength="2"
                           clearable style="width: 20%"/>
            </FormItem>
            <FormItem label="二级分佣比例" prop="stockWarning">
              <InputNumber :min="0" :max="99999" v-model="form.secondaryCommission" type="number"
                           maxlength="2"
                           clearable style="width: 20%"/>
            </FormItem>
            <Form-item>
              <Button @click="handleSubmit" :loading="submitLoading" type="primary" style="margin-right: 5px">修改
              </Button>
            </Form-item>
          </Form>
        </TabPane>
      </Tabs>
    </Card>
  </div>
</template>

<script>
import {getDistributionSetting, saveDistributionSetting} from "@/api/distribution";

export default {
  name: "distributionSetting",
  components: {},
  data() {
    return {
      type: "INFO",
      form: {
        // 添加或编辑表单对象初始化数据
        isOpen: false, // 是否开启分销
        commission: 0, // 一级佣金比例
        secondaryCommission: 0, //二级分佣比例
      },
      // 表单验证规则
      validate: {},
      submitLoading: false, // 添加或编辑提交状态

    };
  },
  methods: {

    // 初始化数据
    init() {
      this.getDistributionSetting();

    },

    //获取店铺信息
    getDistributionSetting() {
      this.loading = true;
      getDistributionSetting().then((res) => {
        this.loading = false;
        if (res.success) {
          this.form = res.result;
        }
      });
    },
    //提交保存
    handleSubmit() {
      this.$refs.form.validate((valid) => {
        if (valid) {
          this.submitLoading = true;
          saveDistributionSetting(this.form).then((res) => {
            this.submitLoading = false;
            if (res.success) {
              this.$Message.success("修改成功");
              this.getDistributionSetting();
            }
          });
        }
      });
    },
  },
  mounted() {
    this.init();
  },
};
</script>
<style scoped lang="scss">
.desc {
  margin-left: 10px;
  color: #999;
}
</style>
