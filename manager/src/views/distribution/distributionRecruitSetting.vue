<template>
  <div style="background-color: #fff">
    <el-form ref="formRef" :model="form" label-width="160px" style="padding: 10px">
      <el-divider content-position="left">招募计划</el-divider>
      <el-form-item label="开启招募">
        <el-switch v-model="form.recruitOpen" />
      </el-form-item>
      <el-form-item label="申请方式">
        <el-radio-group v-model="form.applyMode">
          <el-radio value="MANUAL_APPLY">手动申请</el-radio>
          <el-radio value="AUTO_APPLY_WHEN_QUALIFIED">满足条件自动申请</el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item label="审核方式">
        <el-radio-group v-model="form.auditMode">
          <el-radio value="MANUAL_AUDIT">人工审核</el-radio>
          <el-radio value="AUTO_AUDIT">自动审核</el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item label="开启加入门槛">
        <el-switch v-model="form.thresholdEnabled" />
      </el-form-item>
      <template v-if="form.thresholdEnabled">
        <el-form-item label="门槛组合">
          <el-radio-group v-model="form.thresholdMatch">
            <el-radio value="ALL">需同时满足</el-radio>
            <el-radio value="ANY">满足其一</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="最低消费金额">
          <el-input-number v-model="form.consumeAmountMin" :min="0" :precision="2" />
        </el-form-item>
        <el-form-item label="最低消费笔数">
          <el-input-number v-model="form.consumeCountMin" :min="0" />
        </el-form-item>
        <el-form-item label="需购买指定商品">
          <el-switch v-model="form.requireBuyGoods" />
        </el-form-item>
      </template>
      <el-form-item label="招募页标题">
        <el-input v-model="form.recruitPageTitle" />
      </el-form-item>
      <el-form-item label="招募页说明">
        <el-input v-model="form.recruitPageDesc" type="textarea" />
      </el-form-item>
      <el-form-item label="展示招募入口">
        <el-switch v-model="form.showRecruitEntry" />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="submit">保存</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script setup>
import { onMounted, ref } from "vue";
import { setSetting, getSetting } from "@/api/index";
import { Message } from "@/utils/message";

defineOptions({ name: "distributionRecruitSetting" });

const formRef = ref(null);
const form = ref({
  recruitOpen: true,
  applyMode: "MANUAL_APPLY",
  auditMode: "MANUAL_AUDIT",
  thresholdEnabled: false,
  thresholdMatch: "ALL",
  consumeAmountMin: 0,
  consumeCountMin: 0,
  requireBuyGoods: false,
  recruitPageTitle: "成为分销员",
  recruitPageDesc: "分享商品赚取佣金",
  showRecruitEntry: true,
});

onMounted(() => {
  getSetting("DISTRIBUTION_RECRUIT_SETTING").then((res) => {
    if (res.success && res.result) {
      form.value = { ...form.value, ...res.result };
    }
  });
});

function submit() {
  setSetting("DISTRIBUTION_RECRUIT_SETTING", form.value).then((res) => {
    if (res.success) Message.success("保存成功");
  });
}
</script>
