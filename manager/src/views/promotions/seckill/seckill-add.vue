<template>
  <div>
    <el-card>
      <el-form ref="formRef" :model="form" label-width="120px" :rules="formRule">
        <div class="base-info-item">
          <h4>基本信息</h4>
          <div class="form-item-view">
            <el-form-item label="活动名称" prop="promotionName">
              <el-input
                v-model="form.promotionName"
                placeholder="请填写活动名称"
                clearable
                style="width: 260px"
              />
            </el-form-item>
            <el-form-item label="报名截止时间" prop="applyEndTime">
              <el-date-picker
                v-model="form.applyEndTime"
                type="datetime"
                format="YYYY-MM-DD HH:mm:ss"
                value-format="YYYY-MM-DD HH:mm:ss"
                placeholder="请选择"
                clearable
                style="width: 200px"
              />
            </el-form-item>
            <el-form-item label="活动开始时间" prop="startTime">
              <el-date-picker
                v-model="form.startTime"
                type="date"
                format="YYYY-MM-DD"
                value-format="YYYY-MM-DD"
                placeholder="请选择"
                clearable
                style="width: 200px"
              />
            </el-form-item>
            <el-form-item label="抢购时间段" prop="seckillPeriod">
              <el-tag
                v-for="item in form.seckillPeriod"
                :key="item"
                closable
                class="period-tag"
                @close="removePeriodTime(item)"
              >
                {{ item >= 10 ? item : "0" + item }}:00
              </el-tag>
              <el-input-number
                v-if="showAddPeriod"
                :max="23"
                :min="0"
                v-model="periodTime"
                @blur="addPeriodTime"
              />
              <el-button @click="addPeriod">添加时间段</el-button>
            </el-form-item>
            <el-form-item label="申请规则" prop="seckillRule">
              <el-input
                v-model="form.seckillRule"
                placeholder="申请规则"
                clearable
                style="width: 260px"
              />
            </el-form-item>
          </div>
          <div class="foot-btn">
            <el-button @click="closeCurrentPage" style="margin-right: 5px">返回</el-button>
            <el-button type="primary" :loading="submitLoading" @click="handleSubmit">提交</el-button>
          </div>
        </div>
      </el-form>
    </el-card>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { updateSeckill, seckillDetail } from "@/api/promotion";
import { unixToDate } from "@/utils/filters";
import { Message } from "@/utils/message";
import { useAppStore } from "@/stores/app";

defineOptions({ name: "addSeckill" });

const route = useRoute();
const router = useRouter();
const appStore = useAppStore();

const form = ref({
  promotionName: "",
  applyEndTime: "",
  startTime: "",
  seckillPeriod: [],
  seckillRule: "",
  promotionStatus: "NEW",
});
const id = route.query.id;
const periodTime = ref(null);
const showAddPeriod = ref(false);
const submitLoading = ref(false);
const formRule = {
  promotionName: [{ required: true, message: "请填写活动名称" }],
  applyEndTime: [{ required: true, message: "请填写报名截止时间" }],
  seckillPeriod: [{ required: true, message: "请填写抢购时间段" }],
  startTime: [{ required: true, message: "请填写活动开始时间" }],
  seckillRule: [{ required: true, message: "请输入申请规则" }],
};

const formRef = ref(null);

onMounted(() => {
  if (id) {
    getData();
  }
});

function closeCurrentPage() {
  appStore.removeTag("manager-seckill-add");
  localStorage.pageOpenedList = JSON.stringify(appStore.pageOpenedList);
  router.go(-1);
}

function getData() {
  seckillDetail(id).then((res) => {
    if (res.success) {
      const data = res.result;
      data.seckillPeriod = res.result.hours.split(",");
      form.value = data;
    }
  });
}

function addPeriod() {
  addPeriodTime();
  showAddPeriod.value = true;
}

function addPeriodTime() {
  showAddPeriod.value = false;
  if (periodTime.value !== null && !form.value.seckillPeriod.includes(periodTime.value)) {
    form.value.seckillPeriod.push(periodTime.value);
  }
}

function removePeriodTime(name) {
  form.value.seckillPeriod = form.value.seckillPeriod.filter((i) => i !== name);
}

function handleSubmit() {
  formRef.value.validate((valid) => {
    if (valid) {
      submitLoading.value = true;
      form.value.hours = form.value.seckillPeriod.toString();
      delete form.value.createTime;
      delete form.value.updateTime;
      delete form.value.endTime;
      delete form.value.seckillApplyList;
      const params = { ...form.value };
      const startTs = new Date(form.value.startTime).getTime();
      const applyTs = new Date(form.value.applyEndTime).getTime();
      params.startTime = unixToDate(startTs / 1000);
      params.applyEndTime = unixToDate(applyTs / 1000);
      updateSeckill(params).then((res) => {
        submitLoading.value = false;
        if (res && res.success) {
          Message.success("编辑成功");
          closeCurrentPage();
        }
      });
    }
  });
}
</script>

<style lang="scss" scoped>
h4 {
  margin-bottom: 10px;
  padding: 0 10px;
  border: 1px solid #ddd;
  background-color: #f8f8f8;
  font-weight: bold;
  color: #333;
  font-size: 14px;
  line-height: 40px;
  text-align: left;
}

.period-tag {
  margin-right: 10px;
}

:deep(.el-form-item) {
  margin-bottom: 30px;
}
</style>
