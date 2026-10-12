<template>
  <div v-if="templateShow">
    <el-form :model="form" label-width="120px">
      <el-form-item label="每日场次设置">
        <el-row :gutter="16" class="row">
          <el-col
            v-for="(item, index) in times"
            :key="index"
            :span="3"
            class="time-item"
          >
            <div class="time" :class="{ active: item.check }" @click="handleClickTime(item, index)">
              {{ item.time }}:00
            </div>
          </el-col>
        </el-row>
      </el-form-item>
      <el-form-item label="秒杀规则">
        <el-input
          v-model="form.seckillRule"
          type="textarea"
          :autosize="{ minRows: 4 }"
          placeholder="申请规则"
          clearable
          style="width: 360px"
        />
      </el-form-item>
      <el-form-item>
        <div class="foot-btn">
          <el-button @click="closeCurrentPage">返回</el-button>
          <el-button type="primary" :loading="submitLoading" @click="handleSubmit">提交</el-button>
        </div>
      </el-form-item>
    </el-form>
  </div>
</template>

<script setup>
import { onMounted, reactive, ref } from "vue";
import { useRouter } from "vue-router";
import { getSetting, setSetting } from "@/api/index";
import { Message as $Message } from "@/utils/message";
import { useAppStore } from "@/stores/app";

const router = useRouter();
const appStore = useAppStore();

const templateShow = ref(false);
const submitLoading = ref(false);
const times = ref([]);
const form = reactive({
  seckillRule: "",
});

onMounted(() => {
  init();
});

function closeCurrentPage() {
  appStore.removeTag("manager-seckill-add");
  localStorage.pageOpenedList = JSON.stringify(appStore.pageOpenedList);
  router.go(-1);
}

async function handleSubmit() {
  const hours = times.value
    .filter((item) => item.check)
    .map((item) => item.time)
    .join(",");
  const result = await setSetting("SECKILL_SETTING", {
    seckillRule: form.seckillRule,
    hours,
  });
  if (result.success) {
    $Message.success("设置成功!");
    init();
  }
}

async function init() {
  const result = await getSetting("SECKILL_SETTING");
  if (result.success) {
    templateShow.value = true;
    form.seckillRule = result.result.seckillRule;
    times.value = [];
    for (let i = 0; i < 24; i++) {
      let matched = false;
      if (result.result.hours) {
        const way = result.result.hours.split(",");
        way.forEach((hours) => {
          if (hours == i) {
            times.value.push({ time: i, check: true });
            matched = true;
          }
        });
      }
      if (!matched) {
        times.value.push({ time: i, check: false });
      }
    }
  }
}

function handleClickTime(val) {
  val.check = !val.check;
}
</script>

<style scoped lang="scss">
.row {
  width: 50%;
}
.foot-btn {
  margin-left: 10px;
  display: flex;
  gap: 8px;
}
.active {
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.12), 0 0 6px rgba(0, 0, 0, 0.04);
  color: #fff;
  background: $theme_color !important;
}
.time {
  width: 100%;
  cursor: pointer;
  transition: 0.35s;
  border-radius: 0.8em;
  justify-content: center;
  align-items: center;
  display: flex;
  background: #f3f5f7;
  height: 50px;
  font-size: 15px;
}
.time-item {
  margin: 8px 0;
}
</style>
