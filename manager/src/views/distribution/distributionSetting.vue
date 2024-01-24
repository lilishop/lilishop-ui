<template>
  <div style="background-color: #fff;">

    <Form ref="form" :model="form" :label-width="120" style="padding: 10px;">

      <Divider orientation="left">分销设置</Divider>
      <FormItem label="是否开启分销" prop="isOpen">
        <i-switch size="large" v-model="form.isOpen" :true-value="true" :false-value="false">
          <span slot="open">开启</span>
          <span slot="close">关闭</span>
        </i-switch>
      </FormItem>
      <FormItem label="分销层级" prop="level">
        <RadioGroup v-model="form.level" size="large">
          <Radio label="1">1级</Radio>
          <Radio label="2">2级</Radio>
        </RadioGroup>
      </FormItem>
      <FormItem label="分销模式" prop="mode">
        <RadioGroup v-model="form.mode" size="large">
          <Radio label="1">指定分销</Radio>
          <Radio label="2">人人分销</Radio>
        </RadioGroup>
      </FormItem>
      <FormItem label="分销关系绑定" prop="binding">
        <RadioGroup v-model="form.binding" size="large">
          <Radio label="ALL">所有用户</Radio>
          <Radio label="NEW">新用户</Radio>
        </RadioGroup>
      </FormItem>
      <FormItem label="分销绑定模式" prop="validity">
        <RadioGroup v-model="form.validity" size="large">
          <Radio label="FOREVER">永久</Radio>
          <Radio label="EXP">有效期</Radio>
        </RadioGroup>
      </FormItem>
      <FormItem label="有效期天数" prop="validityDay">
        <InputNumber :min="1" :max="365" style="width:200px;" v-model="form.validityDay"></InputNumber>
      </FormItem>

      <Divider orientation="left">返佣设置</Divider>
      <FormItem label="佣金模式" prop="commissionModel">
        <RadioGroup v-model="form.commissionModel"  size="large">
          <Radio label="1">平台承担</Radio>
          <Radio label="2">商户承担</Radio>
        </RadioGroup>
      </FormItem>
      <FormItem label="一级佣金比例" prop="firstCommission">
        <InputNumber :min="0" :max="100"
                     v-model="form.firstCommission"
                     :formatter="value => `${value}%`"
                     :parser="value => value.replace('%', '')">
        </InputNumber>
      </FormItem>
      <FormItem label="二级佣金比例" prop="secondaryCommission">
        <InputNumber :min="0"
                     :max="100"
                     v-model="form.secondaryCommission"
                     :formatter="value => `${value}%`"
                     :parser="value => value.replace('%', '')">
         </InputNumber>
      </FormItem>
      <FormItem label="自购返佣" prop="selfCommission">
        <RadioGroup v-model="form.selfCommission"  size="large">
          <Radio label="1">开启</Radio>
          <Radio label="2">关闭</Radio>
        </RadioGroup>
      </FormItem>
      <FormItem label="推广返佣" prop="promotion">
        <RadioGroup v-model="form.promotion"  size="large">
          <Radio label="1">开启</Radio>
          <Radio label="2">关闭</Radio>
        </RadioGroup>
      </FormItem>

      <FormItem label="每日最大推广数量" prop="maxPromotionNum">
        <InputNumber :min="0" :max="1000" style="width:200px;" v-model="form.maxPromotionNum"></InputNumber>
      </FormItem>

<!--      <Divider orientation="left">提现设置</Divider>-->
<!--      <FormItem label="佣金模式" prop="withdrawalType">-->
<!--        <RadioGroup v-model="form.withdrawalType" type="button" button-style="solid">-->
<!--          <Radio label="1">线下转账</Radio>-->
<!--          <Radio label="2">微信零钱</Radio>-->
<!--        </RadioGroup>-->
<!--      </FormItem>-->
<!--      <FormItem label="提现最低金额" prop="minPrice">-->
<!--        <Input type="number" style="width:200px;" v-model="form.minPrice">-->
<!--        </Input>-->
<!--      </FormItem>-->
<!--      <FormItem label="提现最高金额" prop="maxPrice">-->
<!--        <Input type="number" style="width:200px;" v-model="form.maxPrice">-->
<!--        </Input>-->
<!--      </FormItem>-->
<!--      <FormItem label="提现手续费" prop="fee">-->
<!--        <Input type="number" style="width:200px;" v-model="form.fee">-->
<!--        </Input>-->
<!--      </FormItem>-->
<!--      <FormItem label="是否支持银行卡" prop="withdrawalBank">-->
<!--        <i-switch size="large" v-model="form.withdrawalBank" :true-value="true" :false-value="false">-->
<!--          <span slot="open">开启</span>-->
<!--          <span slot="close">关闭</span>-->
<!--        </i-switch>-->
<!--      </FormItem>-->
<!--      <FormItem label="是否支持微信" prop="withdrawalWechat">-->
<!--        <i-switch size="large" v-model="form.withdrawalWechat" :true-value="true" :false-value="false">-->
<!--          <span slot="open">开启</span>-->
<!--          <span slot="close">关闭</span>-->
<!--        </i-switch>-->
<!--      </FormItem>-->
<!--      <FormItem label="是否支持支付宝" prop="withdrawalAli">-->
<!--        <i-switch size="large" v-model="form.withdrawalAli" :true-value="true" :false-value="false">-->
<!--          <span slot="open">开启</span>-->
<!--          <span slot="close">关闭</span>-->
<!--        </i-switch>-->
<!--      </FormItem>-->
      <FormItem>
        <Button type="primary" @click="submit">保存</Button>
      </FormItem>
    </Form>
  </div>
</template>

<script>
import {getSetting, setSetting} from "@/api/index";

export default {
  name: "distributionSetting",
  data() {
    return {
      form: {
        // 添加或编辑表单对象初始化数据
        isOpen: true,
        level: 1, //分销层级
        mode: 0, //分销模式(指定分销/人人分销)
        binding: "NEW", //分销关系绑定（新用户/所有用户）
        validity: "FOREVER", //分销绑定模式（有效期/永久）
        validityDay: 0, //有效期天数
        commissionModel: 0, //佣金模式（平台承担/商户承担）
        firstCommission: 0, //一级佣金比例
        secondaryCommission: 0, //二级佣金比例
        selfCommission: 0, //自购返佣
        promotion: 0, //推广返佣
        maxPromotionNum: 0, //每日最大推广数量
        // withdrawalType: 0, //提现方式（线下转账/微信零钱）
        // minPrice: 0, //提现最低金额
        // maxPrice: 0, //提现最高金额
        // fee: 0, //提现手续费
        // withdrawalBank: false, //是否支持银行卡
        // withdrawalWechat: false, //是否支持微信
        // withdrawalAli: false, //是否支持支付宝
      },
      // formRule: {
      //   isOpen: [
      //     regular.REQUIRED
      //   ],
      //   distributionDay: [
      //     regular.REQUIRED
      //   ],
      //   cashDay: [
      //     regular.REQUIRED
      //   ],
      // }
    };
  },
  methods: {
    // 初始化数据
    init() {
      this.getDataList();
    },
    // 获取分销设置数据
    getDataList() {
      getSetting("DISTRIBUTION_SETTING").then((res) => {
        if (res.success) {
          this.form = res.result;
        }
      });
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
