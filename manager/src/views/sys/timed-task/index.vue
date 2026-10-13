<template>
  <div>
    <el-card>
      <el-tabs v-model="activeTab">
        <el-tab-pane label="每日任务" name="每日任务" />
        <el-tab-pane label="每小时任务" name="每小时" />
        <el-tab-pane label="每分钟任务" name="每分钟" />
      </el-tabs>

      <el-table v-loading="loading" :data="currentTasks" border style="width: 100%; margin-top: 12px">
        <el-table-column prop="name" label="任务名称" width="220" />
        <el-table-column prop="cron" label="Cron表达式" width="140" />
        <el-table-column label="操作" width="120" align="center">
          <template #default="{ row }">
            <el-button
              type="primary"
              size="small"
              :loading="row.triggering"
              @click="handleTrigger(row)"
            >
              手动触发
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import { getTimedTaskList, triggerTimedTask } from "@/api/timedTask.js";

defineOptions({ name: "timed-task-manage" });

const loading = ref(false);
const activeTab = ref("每日任务");
const taskList = ref([]);

const currentTasks = computed(() => {
  return taskList.value.filter((t) => t.group === activeTab.value);
});

function init() {
  loading.value = true;
  getTimedTaskList()
    .then((res) => {
      loading.value = false;
      if (res.success) {
        taskList.value = res.result.map((t) => ({ ...t, triggering: false }));
      }
    })
    .catch(() => {
      loading.value = false;
    });
}

function handleTrigger(row) {
  ElMessageBox.confirm(`确认要手动触发 "${row.name}" 吗？`, "提示", {
    confirmButtonText: "确认",
    cancelButtonText: "取消",
    type: "warning",
  })
    .then(() => {
      row.triggering = true;
      triggerTimedTask(row.id)
        .then((res) => {
          row.triggering = false;
          if (res.success) {
            ElMessage.success(`"${row.name}" 已触发执行`);
          } else {
            ElMessage.error(res.message || "触发失败");
          }
        })
        .catch(() => {
          row.triggering = false;
          ElMessage.error("触发失败");
        });
    })
    .catch(() => {});
}

onMounted(() => {
  init();
});
</script>
