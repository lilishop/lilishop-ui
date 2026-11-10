<!--
  商品批量导入（多规格v2）弹窗
  用途：商家端商品列表页批量导入商品；支持下载导入模板、上传 .xlsx 文件、
  展示导入结果（成功/失败计数及失败明细），失败明细可下载为 CSV。
  @author Bulbasaur
  @since 2026-10-20
-->
<template>
  <el-dialog
    v-model="dialogVisible"
    title="批量导入商品"
    width="560px"
    :close-on-click-modal="false"
    @closed="handleClosed"
  >
    <template v-if="!importResult">
      <p class="import-tip">
        请先下载导入模板，按模板格式填写商品信息（同一商品货号的多规格写为多行），仅支持 .xlsx 文件。
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
      <el-upload
        drag
        :show-file-list="false"
        accept=".xlsx"
        :disabled="importing"
        :before-upload="handleImportUpload"
      >
        <div class="el-upload__text" v-loading="importing">
          将文件拖到此处，或<em>点击上传</em>
        </div>
      </el-upload>
    </template>

    <template v-else>
      <p>
        导入完成：成功 {{ importResult.successCount || 0 }} 条，失败
        {{ importResult.failCount || 0 }} 条
      </p>
      <el-table
        v-if="failList.length"
        :data="failList"
        max-height="320"
        border
        class="mt_10"
      >
        <el-table-column label="商品序号" min-width="120">
          <template #default="{ row }">
            {{ row.goodsNo || "-" }}
          </template>
        </el-table-column>
        <el-table-column prop="rows" label="行范围" width="110" align="center" />
        <el-table-column
          prop="reason"
          label="失败原因"
          min-width="200"
          show-overflow-tooltip
        />
      </el-table>
    </template>

    <template #footer>
      <template v-if="!importResult">
        <el-button @click="dialogVisible = false">关闭</el-button>
      </template>
      <template v-else>
        <el-button v-if="failList.length" @click="downloadFailDetail">
          下载失败明细
        </el-button>
        <el-button type="primary" @click="handleFinish">完成</el-button>
      </template>
    </template>
  </el-dialog>
</template>

<script setup>
import { computed, ref } from "vue";
import {
  downloadGoodsImportTemplate,
  importGoodsExcel,
} from "@/api/goods";
import { downloadBlob } from "@/utils/downloadBlob";
import { Message } from "@/utils/message";

const props = defineProps({
  modelValue: { type: Boolean, default: false },
});
const emit = defineEmits(["update:modelValue", "imported"]);

const dialogVisible = computed({
  get: () => props.modelValue,
  set: (val) => emit("update:modelValue", val),
});

const templateLoading = ref(false); // 模板下载 loading
const importing = ref(false); // 导入请求 loading
const importResult = ref(null); // 导入结果 {successCount, failCount, failList}
const failList = computed(() => importResult.value?.failList || []);

// 下载导入模板
function handleDownloadTemplate() {
  templateLoading.value = true;
  downloadGoodsImportTemplate()
    .then(() => {
      Message.success("模板下载成功");
    })
    .catch(() => {})
    .finally(() => {
      templateLoading.value = false;
    });
}

// 选择文件后立即上传（手动模式，before-upload 返回 false 阻止自动提交）
function handleImportUpload(file) {
  if (!/\.xlsx$/i.test(file.name)) {
    Message.error("请上传 .xlsx 文件");
    return false;
  }
  importing.value = true;
  importGoodsExcel(file)
    .then((res) => {
      if (res.success) {
        importResult.value = res.result || {};
      }
    })
    .finally(() => {
      importing.value = false;
    });
  return false;
}

// CSV 字段转义：含逗号、引号或换行时用引号包裹
function csvField(value) {
  const text = value == null ? "" : String(value);
  if (/[",\n\r]/.test(text)) {
    return `"${text.replace(/"/g, '""')}"`;
  }
  return text;
}

// 将失败明细生成 CSV 落盘（加 BOM 保证 Excel 打开中文不乱码）
function downloadFailDetail() {
  const header = "商品序号,行范围,失败原因";
  const lines = failList.value.map((item) =>
    [csvField(item.goodsNo || "-"), csvField(item.rows), csvField(item.reason)].join(",")
  );
  const csv = "\uFEFF" + [header, ...lines].join("\r\n");
  downloadBlob(csv, "商品导入失败明细.csv");
}

// 完成：关闭弹窗并通知父页刷新列表
function handleFinish() {
  dialogVisible.value = false;
  emit("imported");
}

// 弹窗关闭后重置状态，下次打开重新走上传流程
function handleClosed() {
  importResult.value = null;
  importing.value = false;
}
</script>

<style lang="scss" scoped>
.import-tip {
  margin: 0 0 10px;
  color: #606266;
  font-size: 13px;
  line-height: 1.6;
}
.mb_10 {
  margin-bottom: 10px;
}
.mt_10 {
  margin-top: 10px;
}
</style>
