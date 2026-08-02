<!-- 卡密商品 · 卡池管理（原型 P-04；API-S-01~S-07）
  @author Mike
  @date 2026-07-31
-->
<template>
  <div class="search card-key-pool">
    <el-card>
      <div v-if="goodsName" class="pool-header">
        <el-button @click="goBack">返回</el-button>
        <span class="pool-meta">
          <strong>商品：</strong>{{ goodsName }}
        </span>
      </div>

      <el-alert
        v-if="!skuId"
        type="warning"
        show-icon
        :closable="false"
        class="mb_10"
      >
        缺少 SKU 参数，请从商品列表「卡池管理」进入。
      </el-alert>

      <el-form
        v-else
        ref="searchFormRef"
        :model="searchForm"
        inline
        label-width="70px"
        class="search-form"
        @keyup.enter="handleSearch"
      >
        <el-form-item label="卡号" prop="cardNo">
          <el-input
            v-model="searchForm.cardNo"
            placeholder="卡号模糊搜索"
            clearable
            style="width: 240px"
          />
        </el-form-item>
        <el-form-item label="导入时间" prop="importRange">
          <el-date-picker
            v-model="importRange"
            type="datetimerange"
            value-format="YYYY-MM-DD HH:mm:ss"
            start-placeholder="开始时间"
            end-placeholder="结束时间"
            style="width: 360px"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" class="search-btn" @click="handleSearch">搜索</el-button>
          <el-button @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-card v-if="skuId">
      <div class="goods-tab">
        <el-tabs v-model="statusTab" @tab-click="onStatusTabClick">
          <el-tab-pane
            v-for="tab in statusTabsWithCount"
            :key="tab.value"
            :label="tab.title"
            :name="tab.value"
          />
        </el-tabs>
      </div>

      <el-alert
        v-if="poolLocked"
        type="warning"
        show-icon
        :closable="false"
        class="mb_10"
        title="当前商品不可管理卡池（审核拒绝、商品已删除或店铺已关店）"
      />

      <div class="operation" style="margin: 10px 0">
        <el-button type="primary" :disabled="poolLocked" @click="importModal = true">
          批量导入
        </el-button>
        <el-button :disabled="poolLocked" @click="openAddDialog">单条新增</el-button>
        <el-button :loading="exportLoading" :disabled="poolLocked" @click="handleExport">
          导出
        </el-button>
      </div>

      <el-table v-loading="loading" :data="data" class="mt_10" style="width: 100%">
        <el-table-column label="序号" width="60" align="center">
          <template #default="{ $index }">
            {{ (searchForm.pageNumber - 1) * searchForm.pageSize + $index + 1 }}
          </template>
        </el-table-column>
        <el-table-column prop="cardNo" label="卡号" min-width="140" show-overflow-tooltip />
        <el-table-column prop="cardSecret" label="卡密" min-width="120" show-overflow-tooltip />
        <el-table-column label="状态" width="100" align="center">
          <template #default="{ row }">
            <el-tag v-if="row" :type="statusTag(row.status)" size="small">
              {{ formatStatus(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="导入时间" width="170" />
        <el-table-column prop="allocatedTime" label="发卡时间" width="170" />
        <el-table-column prop="orderSn" label="订单号" min-width="160" show-overflow-tooltip />
        <el-table-column label="操作" width="100" align="center" fixed="right">
          <template #default="{ row }">
            <el-button
              v-if="row && row.status === 'UNUSED'"
              link
              type="danger"
              :disabled="poolLocked"
              @click="handleVoid(row)"
            >
              作废
            </el-button>
            <span v-else-if="row && row.status === 'RESERVED'" class="text-muted">预占中</span>
            <span v-else>—</span>
          </template>
        </el-table-column>
      </el-table>

      <div class="mt_10" style="display: flex; justify-content: flex-end">
        <el-pagination
          v-model:current-page="searchForm.pageNumber"
          v-model:page-size="searchForm.pageSize"
          :page-sizes="[10, 20, 50, 100]"
          :total="total"
          layout="total, sizes, prev, pager, next, jumper"
          size="small"
          @current-change="getList"
          @size-change="onPageSizeChange"
        />
      </div>
    </el-card>

    <!-- 批量导入 -->
    <el-dialog v-model="importModal" title="批量导入卡密" width="520px" :close-on-click-modal="false">
      <p class="import-tip">
        Excel 模板：第 1 行表头，第 2 行起为数据；列 A 卡号、列 B 卡密；单次最多 10,000 行。
      </p>
      <el-button
        type="primary"
        link
        class="mb_10"
        :loading="templateLoading"
        @click="handleDownloadTemplate"
      >
        下载导入模板
      </el-button>
      <el-upload drag :show-file-list="false" accept=".xlsx" :before-upload="handleImportUpload">
        <div class="el-upload__text">将文件拖到此处，或<em>点击上传</em></div>
      </el-upload>
      <template #footer>
        <el-button @click="importModal = false">关闭</el-button>
      </template>
    </el-dialog>

    <!-- 导入结果 -->
    <el-dialog v-model="importResultVisible" title="导入结果" width="560px">
      <p>成功 {{ importResult.successCount || 0 }} 条，失败 {{ importResult.failCount || 0 }} 条</p>
      <el-table
        v-if="importResult.failRows && importResult.failRows.length"
        :data="importResult.failRows"
        max-height="320"
        border
      >
        <el-table-column prop="row" label="行号" width="80" />
        <el-table-column prop="cardNo" label="卡号" min-width="120" />
        <el-table-column prop="reason" label="失败原因" min-width="200" />
      </el-table>
      <template #footer>
        <el-button type="primary" @click="importResultVisible = false">确定</el-button>
      </template>
    </el-dialog>

    <!-- 单条新增 -->
    <el-dialog v-model="addVisible" title="单条新增卡密" width="480px" :close-on-click-modal="false">
      <el-form ref="addFormRef" :model="addForm" :rules="addRules" label-width="80px">
        <el-form-item label="卡号" prop="cardNo">
          <el-input v-model="addForm.cardNo" placeholder="请输入卡号" clearable />
        </el-form-item>
        <el-form-item label="卡密" prop="cardSecret">
          <el-input v-model="addForm.cardSecret" placeholder="请输入卡密" clearable />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="addVisible = false">取消</el-button>
        <el-button type="primary" :loading="addLoading" @click="submitAdd">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script>
import {
  importCardKey,
  addCardKey,
  getCardKeyList,
  voidCardKey,
  getCardKeyStats,
  exportCardKey,
  downloadImportTemplate,
} from "@/api/cardKey";
import {
  formatCardKeyStatus,
  CARD_KEY_STATUS_TAG,
} from "@/constants/cardKey";

/**
 * 商家卡池管理页：导入/新增/作废/导出，列表展示明文卡密（仅商家授权上下文）。
 * 入口：商品列表「卡池管理」，路由 query 须带 skuId；审核拒绝/删 SKU/关店时 poolLocked。
 *
 * @author Mike
 * @date 2026-07-31
 */
export default {
  name: "cardKeyPool",
  data() {
    return {
      skuId: "",
      goodsId: "",
      goodsName: "",
      statusTab: "ALL",
      stats: null,
      poolLocked: false,
      loading: false,
      exportLoading: false,
      templateLoading: false,
      data: [],
      total: 0,
      importRange: [],
      searchForm: {
        cardNo: "",
        pageNumber: 1,
        pageSize: 20,
      },
      importModal: false,
      importResultVisible: false,
      importResult: {},
      addVisible: false,
      addLoading: false,
      addForm: {
        cardNo: "",
        cardSecret: "",
      },
      addRules: {
        cardNo: [{ required: true, message: "卡号不能为空", trigger: "blur" }],
        cardSecret: [{ required: true, message: "卡密不能为空", trigger: "blur" }],
      },
    };
  },
  computed: {
    statusTabsWithCount() {
      const s = this.stats || {};
      const withCount = (label, count) =>
        count != null && this.stats ? `${label}(${count})` : label;
      const total =
        (s.unusedCount || 0) +
        (s.reservedCount || 0) +
        (s.allocatedCount || 0) +
        (s.voidedCount || 0);
      return [
        { title: withCount("全部", total), value: "ALL" },
        { title: withCount("未使用", s.unusedCount || 0), value: "UNUSED" },
        { title: withCount("已预占", s.reservedCount || 0), value: "RESERVED" },
        { title: withCount("已分配", s.allocatedCount || 0), value: "ALLOCATED" },
        { title: withCount("已作废", s.voidedCount || 0), value: "VOIDED" },
      ];
    },
  },
  methods: {
    formatStatus: formatCardKeyStatus,
    statusTag(status) {
      return CARD_KEY_STATUS_TAG[status] || "info";
    },
    goBack() {
      this.$router.back();
    },
    initFromRoute() {
      const q = this.$route.query;
      this.skuId = q.skuId || "";
      this.goodsId = q.goodsId || "";
      this.goodsName = q.goodsName || "";
    },
    onStatusTabClick(tab) {
      this.statusTab = tab.paneName;
      this.searchForm.pageNumber = 1;
      this.getList();
    },
    buildListParams() {
      const params = {
        skuId: this.skuId,
        pageNumber: this.searchForm.pageNumber,
        pageSize: this.searchForm.pageSize,
      };
      if (this.goodsId) params.goodsId = this.goodsId;
      if (this.searchForm.cardNo) params.cardNo = this.searchForm.cardNo;
      if (this.statusTab && this.statusTab !== "ALL") {
        params.status = this.statusTab;
      }
      if (this.importRange && this.importRange.length === 2) {
        params.createTimeStart = this.importRange[0];
        params.createTimeEnd = this.importRange[1];
      }
      return params;
    },
    loadStats() {
      if (!this.skuId) return;
      getCardKeyStats(this.skuId).then((res) => {
        if (res.success) {
          this.stats = res.result;
        }
      });
    },
    getList() {
      if (!this.skuId) return;
      this.loading = true;
      getCardKeyList(this.buildListParams())
        .then((res) => {
          this.loading = false;
          if (res.success) {
            this.data = res.result.records || [];
            this.total = res.result.total || 0;
            this.poolLocked = false;
          } else {
            this.checkPoolLocked(res);
          }
        })
        .catch(() => {
          this.loading = false;
        });
    },
    /** 审核拒绝 / SKU 删除 / 关店时禁用卡池操作（S-06 / S-07 / EC-21~23） */
    checkPoolLocked(res) {
      const lockedCodes = [
        "CARD_KEY_GOODS_AUTH_REFUSE",
        "CARD_KEY_SKU_DELETED",
        "CARD_KEY_STORE_CLOSED",
      ];
      if (res.code && lockedCodes.includes(String(res.code))) {
        this.poolLocked = true;
      }
    },
    handleSearch() {
      this.searchForm.pageNumber = 1;
      this.getList();
    },
    handleReset() {
      this.searchForm.cardNo = "";
      this.importRange = [];
      this.searchForm.pageNumber = 1;
      this.getList();
    },
    onPageSizeChange() {
      this.searchForm.pageNumber = 1;
      this.getList();
    },
    handleImportUpload(file) {
      if (!/\.xlsx$/i.test(file.name)) {
        this.$Message.error("请上传 .xlsx 文件");
        return false;
      }
      importCardKey(this.skuId, file).then((res) => {
        if (res.success) {
          this.importModal = false;
          this.importResult = res.result || {};
          this.importResultVisible = true;
          this.loadStats();
          this.getList();
        } else {
          this.checkPoolLocked(res);
        }
      });
      return false;
    },
    handleDownloadTemplate() {
      this.templateLoading = true;
      downloadImportTemplate()
        .then(() => {
          this.$Message.success("模板下载成功");
        })
        .catch(() => {})
        .finally(() => {
          this.templateLoading = false;
        });
    },
    openAddDialog() {
      this.addForm = { cardNo: "", cardSecret: "" };
      this.addVisible = true;
    },
    submitAdd() {
      this.$refs.addFormRef.validate((valid) => {
        if (!valid) return;
        this.addLoading = true;
        addCardKey({
          skuId: this.skuId,
          cardNo: this.addForm.cardNo.trim(),
          cardSecret: this.addForm.cardSecret.trim(),
        })
          .then((res) => {
            this.addLoading = false;
            if (res.success) {
              this.$Message.success("新增成功");
              this.addVisible = false;
              this.loadStats();
              this.getList();
            } else {
              this.checkPoolLocked(res);
            }
          })
          .catch(() => {
            this.addLoading = false;
          });
      });
    },
    handleVoid(row) {
      this.$Modal.confirm({
        title: "确认作废",
        content: `确定作废卡号「${row.cardNo}」？作废后不可恢复。`,
        onOk: () => {
          voidCardKey(row.id).then((res) => {
            if (res.success) {
              this.$Message.success("作废成功");
              this.loadStats();
              this.getList();
            }
          });
        },
      });
    },
    handleExport() {
      this.exportLoading = true;
      const params = { ...this.buildListParams() };
      delete params.pageNumber;
      delete params.pageSize;
      exportCardKey(params, this.skuId)
        .then(() => {
          this.$Message.success("导出成功");
        })
        .catch(() => {})
        .finally(() => {
          this.exportLoading = false;
        });
    },
    init() {
      this.initFromRoute();
      if (this.skuId) {
        this.loadStats();
        this.getList();
      }
    },
  },
  mounted() {
    this.init();
  },
};
</script>

<style lang="scss" scoped>
@import "@/styles/table-common.scss";

.pool-header {
  display: flex;
  align-items: center;
  gap: 16px;
  flex-wrap: wrap;
  margin-bottom: 10px;
}

.pool-meta {
  color: #606266;
  font-size: 14px;
}

.goods-tab {
  :deep(.el-tabs__item) {
    font-size: 14px;
  }
}

.import-tip {
  margin: 0 0 12px;
  font-size: 13px;
  color: #909399;
  line-height: 1.5;
}

.text-muted {
  color: #909399;
  font-size: 12px;
}
</style>
