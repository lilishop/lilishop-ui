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

<script>
import { getServiceCalendarMonth, getServiceCalendarDay } from "@/api/appointment";

function formatMonth(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  return `${y}-${m}`;
}

export default {
  name: "appointmentServiceCalendar",
  data() {
    return {
      loading: false,
      currentMonth: formatMonth(new Date()),
      monthDays: [],
      dayVisible: false,
      dayLoading: false,
      activeDate: "",
      dayStatus: "ALL",
      dayRows: [],
    };
  },
  computed: {
    monthLabel() {
      return this.currentMonth;
    },
  },
  mounted() {
    this.loadMonth();
  },
  methods: {
    goToday() {
      this.currentMonth = formatMonth(new Date());
      this.loadMonth();
    },
    changeMonth(delta) {
      const [y, m] = this.currentMonth.split("-").map(Number);
      const date = new Date(y, m - 1 + delta, 1);
      this.currentMonth = formatMonth(date);
      this.loadMonth();
    },
    loadMonth() {
      this.loading = true;
      getServiceCalendarMonth(this.currentMonth)
        .then((res) => {
          if (res.success) {
            this.monthDays = res.result?.days || res.result || [];
          }
        })
        .finally(() => {
          this.loading = false;
        });
    },
    openDay(date) {
      this.activeDate = date;
      this.dayStatus = "ALL";
      this.dayVisible = true;
      this.loadDay();
    },
    loadDay() {
      if (!this.activeDate) return;
      this.dayLoading = true;
      getServiceCalendarDay({ date: this.activeDate, status: this.dayStatus })
        .then((res) => {
          if (res.success) {
            this.dayRows = res.result?.records || res.result || [];
          }
        })
        .finally(() => {
          this.dayLoading = false;
        });
    },
  },
};
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
