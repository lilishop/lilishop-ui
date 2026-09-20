<template>
  <div class="search">
    <el-card>
      <el-table v-loading="loading" :data="data" border>
        <el-table-column prop="orderSn" label="订单编号" min-width="180" />
        <el-table-column label="原时段" min-width="180">
          <template #default="{ row }">
            {{ formatSlot(row.fromSlotDate, row.fromStartTime, row.fromEndTime) }}
          </template>
        </el-table-column>
        <el-table-column label="新时段" min-width="180">
          <template #default="{ row }">
            {{ formatSlot(row.toSlotDate, row.toStartTime, row.toEndTime) }}
          </template>
        </el-table-column>
        <el-table-column prop="action" label="动作" width="120" />
        <el-table-column prop="createTime" label="时间" min-width="170" />
        <el-table-column label="操作" width="160" fixed="right">
          <template #default="{ row }">
            <template v-if="row.action === 'APPLY'">
              <el-button link type="primary" @click="handleApprove(row)">通过</el-button>
              <el-button link type="danger" @click="handleReject(row)">拒绝</el-button>
            </template>
          </template>
        </el-table-column>
      </el-table>
      <el-pagination
        class="mt_10"
        v-model:current-page="pageNumber"
        v-model:page-size="pageSize"
        :total="total"
        layout="total, prev, pager, next"
        @current-change="loadData"
      />
    </el-card>
  </div>
</template>

<script>
import { getRescheduleLogPage, approveReschedule, rejectReschedule } from "@/api/appointment";
import { ElMessage, ElMessageBox } from "element-plus";

export default {
  name: "appointmentRescheduleLogs",
  data() {
    return {
      loading: false,
      data: [],
      total: 0,
      pageNumber: 1,
      pageSize: 10,
    };
  },
  mounted() {
    this.loadData();
  },
  methods: {
    loadData() {
      this.loading = true;
      getRescheduleLogPage({ pageNumber: this.pageNumber, pageSize: this.pageSize })
        .then((res) => {
          if (res.success) {
            this.data = res.result?.records || [];
            this.total = res.result?.total || 0;
          }
        })
        .finally(() => {
          this.loading = false;
        });
    },
    formatSlot(date, start, end) {
      const day = date ? String(date).slice(0, 10) : "";
      return `${day} ${start || ""}-${end || ""}`.trim();
    },
    handleApprove(row) {
      approveReschedule(row.id).then((res) => {
        if (res.success) {
          ElMessage.success("已通过");
          this.loadData();
        }
      });
    },
    handleReject(row) {
      ElMessageBox.prompt("拒绝原因（选填）", "拒绝改期", { inputType: "textarea" }).then(({ value }) => {
        rejectReschedule(row.id, { remark: value || "" }).then((res) => {
          if (res.success) {
            ElMessage.success("已拒绝");
            this.loadData();
          }
        });
      });
    },
  },
};
</script>
