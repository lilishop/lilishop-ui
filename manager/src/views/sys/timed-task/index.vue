<template>
  <div class="timed-task-page">
    <el-card shadow="never">
      <!-- 顶部统计与操作栏 -->
      <div class="header-bar">
        <div class="stats-info">
          <span class="stat-item">全部任务：<b>{{ taskList.length }}</b></span>
          <el-divider direction="vertical" />
          <span class="stat-item text-success">运行中：<b>{{ runningCount }}</b></span>
          <el-divider direction="vertical" />
          <span class="stat-item text-muted">已暂停：<b>{{ pausedCount }}</b></span>
        </div>
        <div class="filter-actions">
          <el-input
            v-model="searchKeyword"
            placeholder="搜索任务名称 / 标识"
            clearable
            style="width: 240px; margin-right: 12px"
            :prefix-icon="Search"
          />
          <el-button :icon="Refresh" @click="loadData" :loading="loading">刷新</el-button>
        </div>
      </div>

      <!-- 分组 Tabs -->
      <el-tabs v-model="activeGroup" style="margin-top: 12px">
        <el-tab-pane label="全部" name="ALL" />
        <el-tab-pane
          v-for="g in groupList"
          :key="g"
          :label="g"
          :name="g"
        />
      </el-tabs>

      <!-- 任务列表表格 -->
      <el-table
        v-loading="loading"
        :data="filteredTasks"
        border
        stripe
        style="width: 100%; margin-top: 8px"
      >
        <el-table-column label="任务名称 / 标识" min-width="220">
          <template #default="{ row }">
            <div class="task-title-cell">
              <span class="task-name">{{ row.name }}</span>
              <span class="task-id">{{ row.id }}</span>
            </div>
          </template>
        </el-table-column>

        <el-table-column prop="group" label="分组" width="110" align="center">
          <template #default="{ row }">
            <el-tag size="small" effect="plain">{{ row.group || '其他' }}</el-tag>
          </template>
        </el-table-column>

        <el-table-column prop="description" label="任务说明" min-width="240" show-overflow-tooltip />

        <el-table-column label="Cron 表达式" width="180">
          <template #default="{ row }">
            <div class="cron-cell">
              <code class="cron-tag">{{ row.cron }}</code>
              <el-button
                link
                type="primary"
                size="small"
                :icon="Edit"
                title="修改Cron"
                @click="openEditDialog(row)"
              />
            </div>
          </template>
        </el-table-column>

        <el-table-column label="状态" width="100" align="center">
          <template #default="{ row }">
            <el-switch
              v-model="row.status"
              :loading="row.statusLoading"
              :active-value="true"
              :inactive-value="false"
              @change="(val) => handleStatusChange(row, val)"
            />
          </template>
        </el-table-column>

        <el-table-column prop="lastExecTime" label="上次执行时间" width="170" align="center">
          <template #default="{ row }">
            <span>{{ row.lastExecTime || '-' }}</span>
          </template>
        </el-table-column>

        <el-table-column label="上次执行结果" width="150" align="center">
          <template #default="{ row }">
            <template v-if="row.lastExecStatus === 1">
              <el-tag type="success" size="small">
                成功
                <span v-if="row.lastExecCost != null">({{ row.lastExecCost }}ms)</span>
              </el-tag>
            </template>
            <template v-else-if="row.lastExecStatus === 0">
              <el-tooltip
                class="box-item"
                effect="dark"
                :content="row.lastExecError || '未知错误'"
                placement="top"
              >
                <el-tag type="danger" size="small" style="cursor: pointer">
                  失败 ℹ
                </el-tag>
              </el-tooltip>
            </template>
            <template v-else>
              <el-tag type="info" size="small">未执行</el-tag>
            </template>
          </template>
        </el-table-column>

        <el-table-column label="操作" width="160" align="center" fixed="right">
          <template #default="{ row }">
            <el-button
              type="primary"
              link
              size="small"
              @click="openEditDialog(row)"
            >
              配置
            </el-button>
            <el-button
              type="warning"
              link
              size="small"
              :loading="row.triggering"
              @click="handleTrigger(row)"
            >
              立即执行
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 修改 Cron 表达式弹窗 -->
    <el-dialog
      v-model="editDialogVisible"
      :title="`配置任务: ${currentRow?.name || ''}`"
      width="540px"
      destroy-on-close
    >
      <el-form label-width="110px" style="margin-top: 10px">
        <el-form-item label="任务标识">
          <el-input :model-value="currentRow?.id" disabled />
        </el-form-item>
        <el-form-item label="任务名称">
          <el-input :model-value="currentRow?.name" disabled />
        </el-form-item>
        <el-form-item label="任务说明">
          <div class="desc-text">{{ currentRow?.description || '-' }}</div>
        </el-form-item>
        <el-form-item label="Cron 表达式" required>
          <el-input
            v-model="editForm.cron"
            placeholder="例如: 0 0/5 * * * ?"
            clearable
          />
        </el-form-item>
        <el-form-item label="快捷预设">
          <div class="cron-presets">
            <el-button
              v-for="p in cronPresets"
              :key="p.cron"
              size="small"
              text
              bg
              @click="editForm.cron = p.cron"
            >
              {{ p.label }}
            </el-button>
          </div>
        </el-form-item>
        <el-form-item label="启用状态">
          <el-switch v-model="editForm.status" />
          <span style="margin-left: 10px; color: #909399; font-size: 13px">
            {{ editForm.status ? '保存后自动开启调度' : '保存后暂停该任务调度' }}
          </span>
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="editDialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="saving" @click="handleSave">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { Search, Refresh, Edit } from '@element-plus/icons-vue';
import { getTimedTaskList, updateTimedTask, triggerTimedTask } from '@/api/timedTask.js';

defineOptions({ name: 'timed-task-manage' });

const loading = ref(false);
const taskList = ref([]);
const activeGroup = ref('ALL');
const searchKeyword = ref('');

// 对话框表单
const editDialogVisible = ref(false);
const currentRow = ref(null);
const saving = ref(false);
const editForm = ref({
  id: '',
  cron: '',
  status: true,
});

// 快捷 Cron 模板
const cronPresets = [
  { label: '每1分钟', cron: '0 * * * * ?' },
  { label: '每5分钟', cron: '0 0/5 * * * ?' },
  { label: '每10分钟', cron: '0 0/10 * * * ?' },
  { label: '每30分钟', cron: '0 0/30 * * * ?' },
  { label: '每小时整点', cron: '0 0 * * * ?' },
  { label: '每日0点', cron: '0 0 0 * * ?' },
  { label: '每日凌晨2点', cron: '0 0 2 * * ?' },
  { label: '每日凌晨3点', cron: '0 0 3 * * ?' },
  { label: '每日凌晨6点', cron: '0 0 6 * * ?' },
];

const runningCount = computed(() => {
  return taskList.value.filter((t) => t.status).length;
});

const pausedCount = computed(() => {
  return taskList.value.filter((t) => !t.status).length;
});

const groupList = computed(() => {
  const set = new Set();
  taskList.value.forEach((t) => {
    if (t.group) set.add(t.group);
  });
  return Array.from(set);
});

const filteredTasks = computed(() => {
  let list = taskList.value;
  if (activeGroup.value !== 'ALL') {
    list = list.filter((t) => t.group === activeGroup.value);
  }
  if (searchKeyword.value.trim()) {
    const kw = searchKeyword.value.trim().toLowerCase();
    list = list.filter(
      (t) =>
        (t.name && t.name.toLowerCase().includes(kw)) ||
        (t.id && t.id.toLowerCase().includes(kw)) ||
        (t.description && t.description.toLowerCase().includes(kw))
    );
  }
  return list;
});

function loadData() {
  loading.value = true;
  getTimedTaskList()
    .then((res) => {
      loading.value = false;
      if (res.success && res.result) {
        taskList.value = res.result.map((t) => ({
          ...t,
          statusLoading: false,
          triggering: false,
        }));
      }
    })
    .catch(() => {
      loading.value = false;
    });
}

function handleStatusChange(row, newStatus) {
  row.statusLoading = true;
  updateTimedTask({
    id: row.id,
    status: newStatus,
  })
    .then((res) => {
      row.statusLoading = false;
      if (res.success) {
        ElMessage.success(`任务 "${row.name}" 已${newStatus ? '开启' : '暂停'}`);
      } else {
        row.status = !newStatus;
        ElMessage.error(res.message || '修改状态失败');
      }
    })
    .catch(() => {
      row.statusLoading = false;
      row.status = !newStatus;
      ElMessage.error('网络异常，修改状态失败');
    });
}

function openEditDialog(row) {
  currentRow.value = row;
  editForm.value = {
    id: row.id,
    cron: row.cron,
    status: row.status,
  };
  editDialogVisible.value = true;
}

function handleSave() {
  if (!editForm.value.cron || !editForm.value.cron.trim()) {
    ElMessage.warning('Cron 表达式不能为空');
    return;
  }
  saving.value = true;
  updateTimedTask({
    id: editForm.value.id,
    cron: editForm.value.cron.trim(),
    status: editForm.value.status,
  })
    .then((res) => {
      saving.value = false;
      if (res.success) {
        ElMessage.success('定时任务配置保存成功');
        editDialogVisible.value = false;
        loadData();
      } else {
        ElMessage.error(res.message || '保存失败');
      }
    })
    .catch(() => {
      saving.value = false;
      ElMessage.error('保存失败');
    });
}

function handleTrigger(row) {
  ElMessageBox.confirm(`确认要手动立即执行一次 "${row.name}" 任务吗？`, '提示', {
    confirmButtonText: '立即执行',
    cancelButtonText: '取消',
    type: 'warning',
  })
    .then(() => {
      row.triggering = true;
      triggerTimedTask(row.id)
        .then((res) => {
          row.triggering = false;
          if (res.success) {
            ElMessage.success(`"${row.name}" 执行成功`);
            loadData();
          } else {
            ElMessage.error(res.message || '执行失败');
          }
        })
        .catch((err) => {
          row.triggering = false;
          ElMessage.error(err?.response?.data?.message || '执行失败');
        });
    })
    .catch(() => {});
}

onMounted(() => {
  loadData();
});
</script>

<style scoped>
.timed-task-page {
  padding: 10px;
}

.header-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 12px;
}

.stats-info {
  display: flex;
  align-items: center;
  font-size: 14px;
}

.stat-item {
  color: #606266;
}

.stat-item b {
  margin-left: 4px;
  font-size: 16px;
}

.text-success b {
  color: #67c23a;
}

.text-muted b {
  color: #909399;
}

.task-title-cell {
  display: flex;
  flex-direction: column;
}

.task-name {
  font-weight: 600;
  color: #303133;
}

.task-id {
  font-size: 12px;
  color: #909399;
  font-family: Consolas, Monaco, monospace;
}

.cron-cell {
  display: flex;
  align-items: center;
  gap: 6px;
}

.cron-tag {
  background-color: #f4f4f5;
  color: #409eff;
  padding: 2px 6px;
  border-radius: 4px;
  font-family: Consolas, Monaco, monospace;
  font-size: 13px;
}

.desc-text {
  color: #606266;
  font-size: 13px;
}

.cron-presets {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}
</style>
