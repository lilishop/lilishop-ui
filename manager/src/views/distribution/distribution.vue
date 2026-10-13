<template>
  <div class="search">
    <el-card>
      <el-form
        ref="searchFormRef"
        :model="searchForm"
        inline
        label-width="100px"
        class="search-form"
        @keyup.enter="handleSearch"
      >
        <el-form-item label="分销员ID" prop="id">
          <el-input
            v-model="searchForm.id"
            placeholder="请输入分销员ID"
            clearable
            style="width: 200px"
          />
        </el-form-item>
        <el-form-item label="分销员手机号" prop="mobile">
          <el-input
            v-model="searchForm.mobile"
            placeholder="请输入分销员手机号"
            clearable
            style="width: 200px"
          />
        </el-form-item>
        <el-form-item label="邀请人手机号" prop="inviterMobile">
          <el-input
            v-model="searchForm.inviterMobile"
            placeholder="请输入邀请人手机号"
            clearable
            style="width: 200px"
          />
        </el-form-item>
        <el-form-item label="分销等级" prop="gradeId">
          <el-select
            v-model="searchForm.gradeId"
            placeholder="全部"
            clearable
            style="width: 200px"
          >
            <el-option
              v-for="item in gradeOptions"
              :key="item.id"
              :label="item.gradeName"
              :value="item.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="加入时间">
          <el-date-picker
            v-model="joinTimeRange"
            type="daterange"
            value-format="YYYY-MM-DD"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            placeholder="选择时间"
            style="width: 240px"
          />
        </el-form-item>
        <el-form-item label="昵称" prop="nickname">
          <el-input
            v-model="searchForm.nickname"
            placeholder="请输入昵称"
            clearable
            style="width: 200px"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" class="search-btn" @click="handleSearch">搜索</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-card class="list-card">
      <el-tabs v-model="currentDistributionStatus" class="status-tabs" @tab-change="onStatusTabChange">
        <el-tab-pane label="全部" name="ALL" />
        <el-tab-pane label="待审核" name="APPLY" />
        <el-tab-pane label="审核通过" name="PASS" />
        <el-tab-pane label="审核拒绝" name="REFUSE" />
        <el-tab-pane label="已清退" name="RETREAT" />
      </el-tabs>
      <div class="operation padding-row">
        <el-button type="primary" @click="openCreate">新增分销员</el-button>
        <el-button type="primary" :disabled="!selectedRows.length" @click="openBatchGrade">批量设置等级</el-button>
        <el-button type="primary" :loading="exportLoading" @click="handleExport">批量导出</el-button>
        <el-button type="primary" @click="openImportDialog">批量导入</el-button>
        <el-button @click="goImportRecord">导入记录</el-button>
      </div>

      <el-table
        ref="table"
        v-loading="loading"
        border
        :data="data"
        class="mt_10"
        style="width: 100%"
        @selection-change="changeSelect"
      >
        <el-table-column type="selection" width="55" align="center" fixed="left" />
        <el-table-column prop="id" label="ID" min-width="200" class-name="id-column" />
        <el-table-column prop="mobile" label="手机号" min-width="120" />
        <el-table-column prop="nickname" label="昵称" min-width="120" show-overflow-tooltip />
        <el-table-column prop="gradeName" label="等级" min-width="100" />
        <el-table-column prop="inviterNickname" label="邀请人" min-width="120" show-overflow-tooltip />
        <el-table-column label="有效销售额(元)" min-width="130">
          <template #default="{ row }">
            <priceColorScheme v-if="row" :value="row.validSalesAmount" :color="$mainColor" />
          </template>
        </el-table-column>
        <el-table-column label="有效佣金(元)" min-width="130">
          <template #default="{ row }">
            <priceColorScheme v-if="row" :value="row.validCommissionAmount" :color="$mainColor" />
          </template>
        </el-table-column>
        <el-table-column prop="validCustomerCount" label="有效客户数" width="110" />
        <el-table-column prop="inviteCount" label="邀请分销员数" width="110" />
        <el-table-column label="审核状态" width="110">
          <template #default="{ row }">
            <template v-if="row">
              <span v-if="row.distributionStatus == 'PASS'">审核通过</span>
              <span v-else-if="row.distributionStatus == 'APPLY'">待审核</span>
              <span v-else-if="row.distributionStatus == 'RETREAT'">已清退</span>
              <span v-else-if="row.distributionStatus == 'REFUSE'">审核拒绝</span>
            </template>
          </template>
        </el-table-column>
        <el-table-column prop="joinTime" label="加入时间" min-width="160" />
        <el-table-column label="操作" width="270" align="center" fixed="right">
          <template #default="{ row }">
            <template v-if="row">
              <a class="link-text" @click="openEdit(row)">编辑</a>
              <span class="op-split">|</span>
              <a class="link-text" @click="openDetail(row)">详情</a>
              <template v-if="row.distributionStatus == 'APPLY'">
                <span class="op-split">|</span>
                <a class="link-text" @click="audit(row, 'PASS')">通过</a>
                <span class="op-split">|</span>
                <a class="link-text" @click="audit(row, 'REFUSE')">拒绝</a>
              </template>
              <template v-else>
                <span class="op-split">|</span>
                <a v-if="row.distributionStatus != 'RETREAT'" class="link-text" @click="retreat(row)">清退</a>
                <a v-if="row.distributionStatus == 'RETREAT'" class="link-text" @click="resume(row)">恢复</a>
              </template>
            </template>
          </template>
        </el-table-column>
      </el-table>

      <div class="mt_10" style="display: flex; justify-content: flex-end">
        <el-pagination
          v-model:current-page="searchForm.pageNumber"
          v-model:page-size="searchForm.pageSize"
          :page-sizes="[20, 50, 100]"
          :total="total"
          layout="total, sizes, prev, pager, next, jumper"
          size="small"
          @current-change="changePage"
          @size-change="changePageSize"
        />
      </div>
    </el-card>

    <el-drawer
      v-model="detailVisible"
      title="分销员详情"
      size="720px"
      direction="rtl"
      :close-on-click-modal="true"
      append-to-body
      destroy-on-close
      class="distribution-detail-drawer"
    >
      <div v-loading="detailLoading" class="detail-body">
        <template v-if="detail">
          <div class="detail-header">
            <div class="detail-meta">
              <div class="detail-meta-row">
                <span class="detail-meta-label">分销员ID</span>
                <span class="detail-meta-value detail-meta-id">{{ detail.id }}</span>
              </div>
              <div class="detail-meta-row">
                <span class="detail-meta-label">昵称</span>
                <span class="detail-meta-value">{{ detail.nickname || '-' }}</span>
              </div>
              <div class="detail-meta-row">
                <span class="detail-meta-label">手机号</span>
                <span class="detail-meta-value">{{ detail.mobile || '-' }}</span>
              </div>
              <div class="detail-meta-row">
                <span class="detail-meta-label">分销等级名称</span>
                <span class="detail-meta-value">{{ detail.gradeName || '-' }}</span>
              </div>
              <div class="detail-meta-row">
                <span class="detail-meta-label">审核状态</span>
                <span class="detail-meta-value">{{ statusLabel(detail.distributionStatus) }}</span>
              </div>
              <div class="detail-meta-row">
                <span class="detail-meta-label">加入时间</span>
                <span class="detail-meta-value">{{ detail.joinTime || '-' }}</span>
              </div>
            </div>
          </div>

          <div class="detail-section-title">业绩概览</div>
          <div class="detail-stat-grid detail-stat-grid-4 detail-stat-panel">
            <div class="detail-stat-card">
              <div class="detail-stat-label">累计销售额(元)</div>
              <div class="detail-stat-value">{{ formatMoney(detail.validSalesAmount) }}</div>
            </div>
            <div class="detail-stat-card">
              <div class="detail-stat-label">累计订单数</div>
              <div class="detail-stat-value">{{ detail.orderCount || 0 }}</div>
            </div>
            <div class="detail-stat-card">
              <div class="detail-stat-label">累计客户数</div>
              <div class="detail-stat-value">
                <a class="detail-stat-link" @click.prevent="openCustomerRelationPage">{{ detail.totalCustomerCount || 0 }}</a>
                <span class="detail-stat-sub">(有效数: {{ detail.validCustomerCount || 0 }})</span>
              </div>
            </div>
            <div class="detail-stat-card">
              <div class="detail-stat-label">邀请分销员数</div>
              <a class="detail-stat-link detail-stat-value detail-stat-highlight" @click.prevent="openInviteeDistributionPage">
                {{ detail.inviteCount || 0 }}
              </a>
            </div>
          </div>

          <div class="detail-section-title">佣金统计</div>
          <div class="detail-stat-grid detail-stat-grid-3 detail-stat-panel">
            <div class="detail-stat-card">
              <div class="detail-stat-label">累计佣金(元)</div>
              <div class="detail-stat-value">{{ formatMoney(detail.totalCommission) }}</div>
            </div>
            <div class="detail-stat-card">
              <div class="detail-stat-label">商品佣金(元)</div>
              <div class="detail-stat-value">{{ formatMoney(detail.goodsCommission) }}</div>
            </div>
            <div class="detail-stat-card">
              <div class="detail-stat-label">邀请佣金(元)</div>
              <div class="detail-stat-value">{{ formatMoney(detail.inviteCommission) }}</div>
            </div>
          </div>

          <div class="detail-section-title">其他统计</div>
          <div class="detail-stat-grid detail-stat-grid-2 detail-stat-panel">
            <div class="detail-stat-card">
              <div class="detail-stat-label">推广金额(元)</div>
              <div class="detail-stat-value">{{ formatMoney(detail.promotionAmount) }}</div>
            </div>
            <div class="detail-stat-card">
              <div class="detail-stat-label">自购金额(元)</div>
              <div class="detail-stat-value">{{ formatMoney(detail.selfPurchaseAmount) }}</div>
            </div>
          </div>
        </template>
      </div>
    </el-drawer>

    <el-dialog
      v-model="editVisible"
      title="编辑分销员"
      width="520px"
      :close-on-click-modal="false"
      destroy-on-close
      append-to-body
      @closed="resetEditForm"
    >
      <el-form
        ref="editFormRef"
        :model="editForm"
        :rules="editRules"
        label-width="110px"
      >
        <el-form-item label="分销员手机号">
          <el-input v-model="editForm.mobile" disabled />
        </el-form-item>
        <el-form-item label="昵称" prop="nickname">
          <el-input v-model="editForm.nickname" maxlength="50" placeholder="请输入昵称" clearable />
        </el-form-item>
        <el-form-item label="邀请人手机号" prop="inviterMobile">
          <el-input
            v-model="editForm.inviterMobile"
            maxlength="11"
            placeholder="留空则清除与上级的分销关系"
            clearable
          />
        </el-form-item>
        <el-form-item label="分销等级" prop="gradeId">
          <el-select v-model="editForm.gradeId" placeholder="请选择分销等级" clearable style="width: 100%">
            <el-option
              v-for="item in gradeOptions"
              :key="item.id"
              :label="item.gradeName"
              :value="item.id"
            />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="editVisible = false">取消</el-button>
        <el-button type="primary" :loading="editLoading" @click="submitEdit">保存</el-button>
      </template>
    </el-dialog>

    <el-dialog
      v-model="createVisible"
      title="新增分销员"
      width="520px"
      :close-on-click-modal="false"
      destroy-on-close
      append-to-body
      @closed="resetCreateForm"
    >
      <el-form
        ref="createFormRef"
        :model="createForm"
        :rules="createRules"
        label-width="110px"
      >
        <el-form-item label="昵称" prop="nickname">
          <el-input v-model="createForm.nickname" maxlength="50" placeholder="请输入昵称" clearable />
        </el-form-item>
        <el-form-item label="手机号" prop="mobile">
          <el-input v-model="createForm.mobile" maxlength="11" placeholder="请输入手机号" clearable />
        </el-form-item>
        <el-form-item label="邀请人手机号" prop="inviterMobile">
          <el-input v-model="createForm.inviterMobile" maxlength="11" placeholder="请输入邀请人手机号" clearable />
        </el-form-item>
        <el-form-item label="分销等级" prop="gradeId">
          <el-select v-model="createForm.gradeId" placeholder="请选择分销等级" style="width: 100%">
            <el-option
              v-for="item in gradeOptions"
              :key="item.id"
              :label="item.gradeName"
              :value="item.id"
            />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="createVisible = false">取消</el-button>
        <el-button type="primary" :loading="createLoading" @click="submitCreate">确定</el-button>
      </template>
    </el-dialog>

    <el-dialog
      v-model="batchGradeVisible"
      title="批量设置等级"
      width="480px"
      :close-on-click-modal="false"
      destroy-on-close
      append-to-body
      @closed="resetBatchGradeForm"
    >
      <el-form
        ref="batchGradeFormRef"
        :model="batchGradeForm"
        :rules="batchGradeRules"
        label-width="100px"
      >
        <el-form-item label="已选分销员">
          <span>{{ selectedRows.length }} 人</span>
        </el-form-item>
        <el-form-item label="分销等级" prop="gradeId">
          <el-select v-model="batchGradeForm.gradeId" placeholder="请选择分销等级" style="width: 100%">
            <el-option
              v-for="item in gradeOptions"
              :key="item.id"
              :label="item.gradeName"
              :value="item.id"
            />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="batchGradeVisible = false">取消</el-button>
        <el-button type="primary" :loading="batchGradeLoading" @click="submitBatchGrade">确定</el-button>
      </template>
    </el-dialog>

    <el-dialog
      v-model="importVisible"
      title="批量导入分销员"
      width="520px"
      :close-on-click-modal="false"
      destroy-on-close
      append-to-body
      @closed="resetImportDialog"
    >
      <div class="import-body">
        <div class="import-upload-row">
          <span class="import-label">导入文件</span>
          <el-upload
            :before-upload="onImportBeforeUpload"
            accept=".xls,.xlsx,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
            :show-file-list="false"
          >
            <el-button type="primary">选择文件</el-button>
          </el-upload>
          <span v-if="importFileName" class="import-filename">{{ importFileName }}</span>
          <span v-else class="import-placeholder">未选择文件</span>
        </div>
        <div class="import-template-row">
          <el-button type="primary" link :loading="templateLoading" @click="downloadImportTemplate">
            下载导入模板
          </el-button>
        </div>
      </div>
      <template #footer>
        <el-button @click="importVisible = false">取消</el-button>
        <el-button type="primary" :loading="importLoading" :disabled="!importFile" @click="submitImport">
          开始导入
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, watch, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import {
  auditDistribution,
  batchUpdateDistributionGrade,
  createDistributionMember,
  downloadDistributionImportTemplate,
  exportDistributionMembers,
  getDistributionGrades,
  getDistributionMemberDetail,
  getDistributionMemberPage,
  importDistributionMembers,
  resumeDistribution,
  retreatDistribution,
  updateDistributionMember,
} from "@/api/distribution";
import { downloadBlob } from "@/utils/downloadBlob";
import { Message, Modal } from "@/utils/message";
import { unixToDate } from "@/utils/filters";

defineOptions({ name: "distribution" });

const MOBILE_PATTERN = /^1[3-9]\d{9}$/;

const route = useRoute();
const router = useRouter();

// 模板 el-form 的 ref（原 ref="searchForm"，与 data 同名会互相覆盖，改名为 searchFormRef）
const searchFormRef = ref(null);
const table = ref(null);
const editFormRef = ref(null);
const createFormRef = ref(null);
const batchGradeFormRef = ref(null);

const loading = ref(true);
const currentDistributionStatus = ref("ALL");
const joinTimeRange = ref([]);
const gradeOptions = ref([]);
const searchForm = reactive({
  pageNumber: 1,
  pageSize: 20,
  id: "",
  mobile: "",
  inviterMobile: "",
  gradeId: "",
  nickname: "",
});
const data = ref([]);
const total = ref(0);
const detailVisible = ref(false);
const detailLoading = ref(false);
const detail = ref(null);
const editVisible = ref(false);
const editLoading = ref(false);
const editForm = ref({
  id: "",
  mobile: "",
  nickname: "",
  inviterMobile: "",
  gradeId: "",
});
const editRules = {
  nickname: [{ required: true, message: "请输入昵称", trigger: "blur" }],
  gradeId: [{ required: true, message: "请选择分销等级", trigger: "change" }],
};
const createVisible = ref(false);
const createLoading = ref(false);
const createForm = ref({
  nickname: "",
  mobile: "",
  inviterMobile: "",
  gradeId: "",
});
const createRules = {
  nickname: [{ required: true, message: "请输入昵称", trigger: "blur" }],
  mobile: [
    { required: true, message: "请输入手机号", trigger: "blur" },
    { pattern: MOBILE_PATTERN, message: "手机号格式有误", trigger: "blur" },
  ],
  gradeId: [{ required: true, message: "请选择分销等级", trigger: "change" }],
};
const selectedRows = ref([]);
const batchGradeVisible = ref(false);
const batchGradeLoading = ref(false);
const exportLoading = ref(false);
const templateLoading = ref(false);
const importVisible = ref(false);
const importLoading = ref(false);
const importFile = ref(null);
const importFileName = ref("");
const batchGradeForm = reactive({
  gradeId: "",
});
const batchGradeRules = {
  gradeId: [{ required: true, message: "请选择分销等级", trigger: "change" }],
};

watch(
  () => route.query,
  () => {
    applyRouteQuery();
    getDataList();
  }
);

function applyRouteQuery() {
  const query = route.query || {};
  searchForm.inviterMobile = query.inviterMobile ? String(query.inviterMobile) : "";
}
function openCustomerRelationPage() {
  if (!detail.value) return;
  const resolved = router.resolve({
    path: "/distributionCustomerRelation",
    query: {
      distributionId: detail.value.id,
      distributionMobile: detail.value.mobile || "",
    },
  });
  window.open(resolved.href, "_blank");
}
function openInviteeDistributionPage() {
  if (!detail.value) return;
  const resolved = router.resolve({
    path: "/distribution",
    query: {
      inviterMobile: detail.value.mobile || "",
    },
  });
  window.open(resolved.href, "_blank");
}
function loadGradeOptions() {
  getDistributionGrades().then((res) => {
    if (res.success) {
      gradeOptions.value = (res.result || []).slice().sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));
    }
  });
}
function statusLabel(status) {
  const map = {
    PASS: "审核通过",
    APPLY: "待审核",
    RETREAT: "已清退",
    REFUSE: "审核拒绝",
  };
  return map[status] || status || "-";
}
function formatMoney(value) {
  const num = Number(value);
  if (Number.isNaN(num)) return "0.00";
  return num.toFixed(2);
}
function onStatusTabChange() {
  searchForm.pageNumber = 1;
  clearSelectAll();
  getDataList();
}
function changePage() {
  getDataList();
}
function changePageSize() {
  searchForm.pageNumber = 1;
  getDataList();
}
function handleSearch() {
  searchForm.pageNumber = 1;
  clearSelectAll();
  getDataList();
}
function changeSelect(selection) {
  selectedRows.value = selection || [];
}
function clearSelectAll() {
  selectedRows.value = [];
  table.value?.clearSelection();
}
function openBatchGrade() {
  if (!selectedRows.value.length) {
    Message.warning("请先选择分销员");
    return;
  }
  batchGradeForm.gradeId = "";
  batchGradeVisible.value = true;
}
function resetBatchGradeForm() {
  batchGradeLoading.value = false;
  batchGradeForm.gradeId = "";
  batchGradeFormRef.value?.clearValidate();
}
function submitBatchGrade() {
  batchGradeFormRef.value.validate((valid) => {
    if (!valid) return;
    batchGradeLoading.value = true;
    batchUpdateDistributionGrade({
      ids: selectedRows.value.map((item) => item.id),
      gradeId: batchGradeForm.gradeId,
    })
      .then((res) => {
        batchGradeLoading.value = false;
        if (res.success) {
          Message.success("设置成功");
          batchGradeVisible.value = false;
          clearSelectAll();
          getDataList();
        }
      })
      .catch(() => {
        batchGradeLoading.value = false;
      });
  });
}
function handleExport() {
  exportLoading.value = true;
  const params = buildParams();
  delete params.pageNumber;
  delete params.pageSize;
  exportDistributionMembers(params)
    .then((blob) => {
      if (blob && blob.type && blob.type.includes("application/json")) {
        const reader = new FileReader();
        reader.onload = () => {
          try {
            const result = JSON.parse(reader.result);
            Message.error(result.message || "导出失败");
          } catch (e) {
            Message.error("导出失败");
          }
        };
        reader.readAsText(blob);
        return;
      }
      downloadBlob(blob, `分销员列表_${Date.now()}.xlsx`);
      Message.success("导出成功");
    })
    .catch(() => {
      Message.error("导出失败");
    })
    .finally(() => {
      exportLoading.value = false;
    });
}
function downloadImportTemplate() {
  templateLoading.value = true;
  downloadDistributionImportTemplate()
    .then((blob) => {
      downloadBlob(blob, "分销员批量导入模板.xlsx");
      Message.success("模板已下载");
    })
    .catch(() => {
      Message.error("模板下载失败");
    })
    .finally(() => {
      templateLoading.value = false;
    });
}
function openImportDialog() {
  importVisible.value = true;
}
function resetImportDialog() {
  importLoading.value = false;
  importFile.value = null;
  importFileName.value = "";
}
function onImportBeforeUpload(file) {
  importFile.value = file;
  importFileName.value = file.name;
  return false;
}
function submitImport() {
  if (!importFile.value) {
    Message.warning("请先选择文件");
    return;
  }
  const fd = new FormData();
  fd.append("file", importFile.value);
  importLoading.value = true;
  importDistributionMembers(fd)
    .then((res) => {
      importLoading.value = false;
      if (res.success) {
        const result = res.result || {};
        Message.success(
          `导入完成：成功 ${result.successCount || 0} 条，失败 ${result.failCount || 0} 条`
        );
        importVisible.value = false;
        getDataList();
      }
    })
    .catch(() => {
      importLoading.value = false;
    });
}
function goImportRecord() {
  router.push({
    path: "/distributionImportRecord",
  });
}
function buildParams() {
  const params = {
    pageNumber: searchForm.pageNumber,
    pageSize: searchForm.pageSize,
  };
  if (currentDistributionStatus.value && currentDistributionStatus.value !== "ALL") {
    params.distributionStatus = currentDistributionStatus.value;
  }
  if (searchForm.id) params.id = searchForm.id.trim();
  if (searchForm.mobile) params.mobile = searchForm.mobile;
  if (searchForm.inviterMobile) params.inviterMobile = searchForm.inviterMobile;
  if (searchForm.gradeId) params.gradeId = searchForm.gradeId;
  if (searchForm.nickname) params.nickname = searchForm.nickname;
  if (joinTimeRange.value && joinTimeRange.value[0] && joinTimeRange.value[1]) {
    const startTime = new Date(joinTimeRange.value[0]).getTime();
    const endTime = new Date(joinTimeRange.value[1]).getTime();
    params.joinTimeStart = unixToDate(startTime / 1000);
    params.joinTimeEnd = unixToDate(endTime / 1000);
  }
  return params;
}
function getDataList() {
  loading.value = true;
  getDistributionMemberPage(buildParams())
    .then((res) => {
      loading.value = false;
      if (res.success) {
        data.value = res.result.records;
        total.value = res.result.total;
      }
    })
    .catch(() => {
      loading.value = false;
    });
}
function openDetail(row) {
  detailVisible.value = true;
  detailLoading.value = true;
  detail.value = null;
  getDistributionMemberDetail(row.id)
    .then((res) => {
      detailLoading.value = false;
      if (res.success) {
        detail.value = res.result;
      }
    })
    .catch(() => {
      detailLoading.value = false;
    });
}
function openCreate() {
  createForm.value = {
    nickname: "",
    mobile: "",
    inviterMobile: "",
    gradeId: "",
  };
  createVisible.value = true;
}
function resetCreateForm() {
  createLoading.value = false;
  createForm.value = {
    nickname: "",
    mobile: "",
    inviterMobile: "",
    gradeId: "",
  };
  createFormRef.value?.clearValidate();
}
function submitCreate() {
  createFormRef.value.validate((valid) => {
    if (!valid) return;
    createLoading.value = true;
    createDistributionMember({
      nickname: createForm.value.nickname,
      mobile: createForm.value.mobile,
      inviterMobile: createForm.value.inviterMobile || "",
      gradeId: createForm.value.gradeId,
    })
      .then((res) => {
        createLoading.value = false;
        if (res.success) {
          Message.success("新增成功");
          createVisible.value = false;
          getDataList();
        }
      })
      .catch(() => {
        createLoading.value = false;
      });
  });
}
function openEdit(row) {
  editForm.value = {
    id: row.id,
    mobile: row.mobile || "",
    nickname: row.nickname || "",
    inviterMobile: row.inviterMobile || "",
    gradeId: resolveGradeOptionId(row.gradeId),
  };
  editVisible.value = true;
}
function resolveGradeOptionId(gradeRef) {
  if (!gradeRef || !gradeOptions.value.length) return gradeRef || "";
  const direct = gradeOptions.value.find((item) => item.id === gradeRef);
  if (direct) return direct.id;
  const bySort = gradeOptions.value.find((item) => String(item.sortOrder) === String(gradeRef));
  return bySort ? bySort.id : gradeRef;
}
function resetEditForm() {
  editLoading.value = false;
  editForm.value = {
    id: "",
    mobile: "",
    nickname: "",
    inviterMobile: "",
    gradeId: "",
  };
  editFormRef.value?.clearValidate();
}
function submitEdit() {
  editFormRef.value.validate((valid) => {
    if (!valid) return;
    editLoading.value = true;
    updateDistributionMember(editForm.value.id, {
      nickname: editForm.value.nickname,
      inviterMobile: editForm.value.inviterMobile || "",
      gradeId: editForm.value.gradeId,
    })
      .then((res) => {
        editLoading.value = false;
        if (res.success) {
          Message.success("保存成功");
          editVisible.value = false;
          getDataList();
        }
      })
      .catch(() => {
        editLoading.value = false;
      });
  });
}
function audit(row, status) {
  const text = status === "PASS" ? "通过" : "拒绝";
  Modal.confirm({
    title: "审核确认",
    content: `确认${text}该分销员申请？`,
    loading: true,
    onOk: () => {
      auditDistribution(row.id, { status }).then((res) => {
        Modal.remove();
        if (res.success) {
          Message.success("操作成功");
          getDataList();
        }
      });
    },
  });
}
function retreat(row) {
  Modal.confirm({
    title: "清退确认",
    content: "确认清退该分销员？清退后将停止后续计佣。",
    onOk: () => {
      retreatDistribution(row.id).then((res) => {
        if (res.success) {
          Message.success("操作成功");
          getDataList();
        }
      });
    },
  });
}
function resume(row) {
  Modal.confirm({
    title: "恢复确认",
    content: "确认恢复该分销员？",
    onOk: () => {
      resumeDistribution(row.id).then((res) => {
        if (res.success) {
          Message.success("操作成功");
          getDataList();
        }
      });
    },
  });
}

onMounted(() => {
  loadGradeOptions();
  applyRouteQuery();
  getDataList();
});
</script>

<style scoped lang="scss">
.link-text {
  color: #2d8cf0;
  cursor: pointer;
  text-decoration: none;
}
.op-split {
  display: inline-block;
  margin: 0 8px;
  color: #dcdee2;
}
.status-tabs {
  margin-bottom: 4px;
}
.operation {
  margin-bottom: 10px;
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}
.import-body {
  padding: 4px 0 8px;
}
.import-upload-row {
  display: flex;
  align-items: center;
  gap: 12px;
}
.import-label {
  color: #606266;
  font-size: 14px;
  flex-shrink: 0;
}
.import-filename {
  color: #515a6e;
  font-size: 13px;
}
.import-placeholder {
  color: #c0c4cc;
  font-size: 13px;
}
.import-template-row {
  margin-top: 16px;
  padding-top: 12px;
  border-top: 1px solid #ebeef5;
}
</style>

<style lang="scss">
.distribution-detail-drawer {
  .el-drawer__header {
    margin-bottom: 0;
    padding: 16px 24px;
    border-bottom: 1px solid #e8eaec;
  }
  .el-drawer__body {
    padding: 20px 24px 28px;
    overflow-x: hidden;
  }
}
.distribution-detail-drawer .detail-body {
  min-height: 200px;
}
.distribution-detail-drawer .detail-header {
  margin-bottom: 20px;
  padding-bottom: 16px;
  border-bottom: 1px solid #f0f0f0;
}
.distribution-detail-drawer .detail-meta-id {
  font-weight: 600;
  color: #17233d;
}
.distribution-detail-drawer .detail-meta {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.distribution-detail-drawer .detail-meta-row {
  display: flex;
  align-items: flex-start;
  font-size: 14px;
  line-height: 22px;
}
.distribution-detail-drawer .detail-meta-label {
  color: #808695;
  min-width: 98px;
  flex-shrink: 0;
}
.distribution-detail-drawer .detail-meta-value {
  color: #515a6e;
  flex: 1;
  word-break: break-all;
}
.distribution-detail-drawer .detail-section-title {
  font-size: 15px;
  font-weight: 600;
  color: #17233d;
  margin: 18px 0 12px;
}
.distribution-detail-drawer .detail-section-title:first-of-type {
  margin-top: 0;
}
.distribution-detail-drawer .detail-stat-grid {
  display: grid;
  gap: 12px;
}
.distribution-detail-drawer .detail-stat-grid-4 {
  grid-template-columns: repeat(4, minmax(0, 1fr));
}
.distribution-detail-drawer .detail-stat-panel {
  gap: 0;
  background: #f8f8f9;
  border: 1px solid #e8eaec;
  border-radius: 8px;
  overflow: hidden;
}
.distribution-detail-drawer .detail-stat-panel .detail-stat-card {
  background: transparent;
  border: none;
  border-radius: 0;
  border-right: 1px solid #e8eaec;
  min-height: 72px;
}
.distribution-detail-drawer .detail-stat-panel .detail-stat-card:last-child {
  border-right: none;
}
.distribution-detail-drawer .detail-stat-grid-3 {
  grid-template-columns: repeat(3, minmax(0, 1fr));
}
.distribution-detail-drawer .detail-stat-grid-2 {
  grid-template-columns: repeat(2, minmax(0, 1fr));
}
.distribution-detail-drawer .detail-stat-card {
  background: #fff;
  border: 1px solid #e8eaec;
  border-radius: 6px;
  padding: 14px 12px;
  min-height: 68px;
  box-sizing: border-box;
}
.distribution-detail-drawer .detail-stat-label {
  font-size: 12px;
  color: #808695;
  margin-bottom: 8px;
  line-height: 1.4;
}
.distribution-detail-drawer .detail-stat-value {
  font-size: 18px;
  font-weight: 600;
  color: #17233d;
  line-height: 1.3;
  word-break: break-all;
}
.distribution-detail-drawer .detail-stat-sub {
  display: block;
  margin-top: 2px;
  font-size: 12px;
  font-weight: 400;
  color: #808695;
}
.distribution-detail-drawer .detail-stat-highlight {
  color: #2d8cf0;
}
.distribution-detail-drawer .detail-stat-link {
  color: #2d8cf0;
  cursor: pointer;
  text-decoration: none;
}
.distribution-detail-drawer .detail-stat-link:hover {
  text-decoration: underline;
}
</style>
