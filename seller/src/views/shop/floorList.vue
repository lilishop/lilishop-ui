<template>
  <div class="search">
    <el-card shadow="never">
      <el-tabs v-model="searchForm.pageType" class="page-type-tabs" @tab-change="handleTabChange">
        <el-tab-pane
          v-for="typeItem in pageTypes"
          :key="typeItem.type"
          :name="typeItem.type"
          :label="typeItem.title"
        />
      </el-tabs>
      <div class="operation mb_10">
        <el-button type="primary" @click="createTemp">添加页面</el-button>
      </div>
      <el-table v-loading="loading" :data="list" style="width: 100%">
        <el-table-column prop="name" label="页面名称" min-width="180" show-overflow-tooltip>
          <template #default="{ row }">
            <span v-if="row">{{ row.name || "暂无模板昵称" }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="创建时间" width="180" align="center" />
        <el-table-column prop="updateTime" label="修改时间" width="180" align="center" />
        <el-table-column
          v-if="searchForm.pageType !== 'SPECIAL'"
          label="状态"
          width="120"
          align="center"
        >
          <template #default="{ row }">
            <el-switch
              v-if="row"
              v-model="row.pageShow"
              inline-prompt
              active-text="开"
              inactive-text="关"
              :before-change="() => beforeRelease(row)"
            />
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200" align="right" fixed="right">
          <template #default="{ row }">
            <template v-if="row">
              <a class="link-text" @click="Template(row)">编辑</a>
              <span class="op-split">|</span>
              <a class="link-text" @click="decorate(row)">装修</a>
              <span class="op-split">|</span>
              <a class="link-text" @click="confirmDel(row.id)">删除</a>
            </template>
          </template>
        </el-table-column>
      </el-table>
      <div class="mt_10" style="display: flex; justify-content: flex-end">
        <el-pagination
          v-model:current-page="searchForm.pageNumber"
          v-model:page-size="searchForm.pageSize"
          :total="total"
          :page-sizes="[20, 50, 100]"
          layout="total, sizes, prev, pager, next, jumper"
          size="small"
          background
          @current-change="changePageNum"
          @size-change="changePageSize"
        />
      </div>
    </el-card>
    <el-dialog
      v-model="showModal"
      title="模板设置"
      width="600px"
      :close-on-click-modal="false"
      append-to-body
      destroy-on-close
    >
      <el-form ref="formRef" :model="formData" label-width="80px">
        <el-form-item label="模板名称" prop="name">
          <el-input v-model="formData.name" placeholder="请输入模板名称" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showModal = false">取消</el-button>
        <el-button type="primary" :loading="loading" @click="newTemplate">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { onMounted, reactive, ref } from "vue";
import { useRouter } from "vue-router";
import * as API_floor from "@/api/other.js";
import { Message, Modal } from "@/utils/message";

defineOptions({ name: "floorList" });

const router = useRouter();

const showModal = ref(false);
const total = ref(0);
const formData = ref({
  status: false,
  name: "",
});
const searchForm = reactive({
  pageNumber: 1,
  pageSize: 20,
  sort: "createTime",
  order: "desc",
  pageType: "INDEX",
  pageClientType: "PC",
});
const loading = ref(false);
const pageTypes = ref([
  { type: "INDEX", title: "首页" },
  { type: "SPECIAL", title: "专题" },
]);
const list = ref([]);

// formRef：模板 ref 改名避免与顶层变量互相覆盖
const formRef = ref(null);

onMounted(() => {
  getTemplateList();
});

function newTemplate() {
  formRef.value.validate((valid) => {
    if (valid) {
      const data = formData.value;
      data.status ? (data.pageShow = "OPEN") : (data.pageShow = "CLOSE");
      delete data.status;
      (data.pageType = searchForm.pageType),
        (data.pageClientType = "PC");
      if (data.id) {
        API_floor.updateHome(data.id, data).then((res) => {
          Message.success("编辑模板成功");
          showModal.value = false;
          getTemplateList();
        });
      } else {
        API_floor.setHomeSetup(data).then((res) => {
          Message.success("新建模板成功");
          showModal.value = false;
          getTemplateList();
        });
      }
    } else {
      loading.value = false;
    }
  });
}

function handleTabChange(type) {
  searchForm.pageNumber = 1;
  searchForm.pageType = type;
  getTemplateList();
}

function createTemp() {
  router.push({
    name: "renovation",
    query: { pageType: searchForm.pageType },
  });
}

function Template(item) {
  item.status = item.pageShow;
  formData.value = { ...item };
  showModal.value = true;
}

function decorate(val) {
  const data = { id: val.id, pageShow: val.pageShow, pageType: searchForm.pageType };

  router.push({
    name: "renovation",
    query: data,
  });
}

function changePageNum(val) {
  searchForm.pageNumber = val;
  getTemplateList();
}
function changePageSize(val) {
  searchForm.pageNumber = 1;
  searchForm.pageSize = val;
  getTemplateList();
}
function getTemplateList() {
  loading.value = true;
  API_floor.getHomeList(searchForm).then((res) => {
    loading.value = false;
    if (res.success) {
      total.value = res.result.total;
      list.value = res.result.records;
      list.value.forEach((e) => {
        if (e.pageShow === "OPEN") {
          e.pageShow = true;
        } else {
          e.pageShow = false;
        }
      });
    }
  });
}

function beforeRelease(row) {
  if (row.pageShow) {
    Message.warning(
      total.value === 1
        ? "当前为唯一页面，无法关闭"
        : "请直接开启其他页面，当前页面会自动关闭"
    );
    return false;
  }
  return new Promise((resolve, reject) => {
    API_floor.releasePageHome(row.id).then((res) => {
      if (res && res.success) {
        Message.success("发布模板成功");
        resolve(true);
        getTemplateList();
      } else {
        reject(new Error("release failed"));
      }
    }).catch(() => {
      reject(new Error("release failed"));
    });
  });
}
function confirmDel(id) {
  Modal.confirm({
    title: "提示",
    content: "删除此模板？",
    onOk: () => delTemplate(id),
  });
}
function delTemplate(id) {
  API_floor.removePageHome(id).then((res) => {
    if (res.success) {
      Message.success("删除模板成功");
      getTemplateList();
    }
  });
}
</script>

<style lang="scss" scoped>
.page-type-tabs {
  margin-bottom: 16px;
}
</style>
