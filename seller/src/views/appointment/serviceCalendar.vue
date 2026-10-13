<template>
  <div class="search appointment-calendar-page">
    <el-card>
      <div class="calendar-toolbar">
        <el-button @click="changeMonth(-1)">上月</el-button>
        <span class="month-label">{{ monthLabel }}</span>
        <el-button @click="changeMonth(1)">下月</el-button>
        <el-button type="primary" link @click="goToday">今天</el-button>
      </div>
      <el-table v-loading="loading" :data="monthDays" border style="width: 100%">
        <el-table-column prop="date" label="日期" width="140" />
        <el-table-column prop="headcount" label="预约人数" width="120" />
        <el-table-column label="操作" width="120">
          <template #default="{ row }">
            <el-button link type="primary" @click="openDay(row.date)">查看明细</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <el-drawer v-model="dayVisible" :title="`${activeDate} 预约明细`" size="520px">
      <el-select v-model="dayStatus" style="width: 180px; margin-bottom: 12px" @change="loadDay">
        <el-option label="全部" value="ALL" />
        <el-option label="待到店" value="WAITING_ARRIVAL" />
        <el-option label="已到店" value="ARRIVED" />
        <el-option label="已取消" value="CANCELED" />
      </el-select>
      <el-table v-loading="dayLoading" :data="dayRows" border size="small">
        <el-table-column prop="appointmentSn" label="预约单号" min-width="150" />
        <el-table-column prop="customerName" label="客户" min-width="90" />
        <el-table-column prop="slotTime" label="时段" min-width="110" />
        <el-table-column prop="staffName" label="服务人员" min-width="90" />
      </el-table>
    </el-drawer>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from "vue";
import { getServiceCalendarMonth, getServiceCalendarDay } from "@/api/appointment";

defineOptions({ name: "appointmentServiceCalendar" });

function formatMonth(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  return `${y}-${m}`;
}

const loading = ref(false);
const currentMonth = ref(formatMonth(new Date()));
const monthDays = ref([]);
const dayVisible = ref(false);
const dayLoading = ref(false);
const activeDate = ref("");
const dayStatus = ref("ALL");
const dayRows = ref([]);

const monthLabel = computed(() => currentMonth.value);

onMounted(() => {
  loadMonth();
});

function goToday() {
  currentMonth.value = formatMonth(new Date());
  loadMonth();
}
function changeMonth(delta) {
  const [y, m] = currentMonth.value.split("-").map(Number);
  const date = new Date(y, m - 1 + delta, 1);
  currentMonth.value = formatMonth(date);
  loadMonth();
}
function loadMonth() {
  loading.value = true;
  getServiceCalendarMonth(currentMonth.value)
    .then((res) => {
      if (res.success) {
        monthDays.value = res.result?.days || res.result || [];
      }
    })
    .finally(() => {
      loading.value = false;
    });
}
function openDay(date) {
  activeDate.value = date;
  dayStatus.value = "ALL";
  dayVisible.value = true;
  loadDay();
}
function loadDay() {
  if (!activeDate.value) return;
  dayLoading.value = true;
  getServiceCalendarDay({ date: activeDate.value, status: dayStatus.value })
    .then((res) => {
      if (res.success) {
        dayRows.value = res.result?.records || res.result || [];
      }
    })
    .finally(() => {
      dayLoading.value = false;
    });
}
</script>

<style scoped>
.calendar-toolbar {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
}
.month-label {
  font-weight: 600;
  min-width: 90px;
  text-align: center;
}
</style>
