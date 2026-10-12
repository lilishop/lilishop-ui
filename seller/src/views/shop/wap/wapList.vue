<template>
  <div class="search">
    <el-card shadow="never">
      <el-tabs v-model="params.pageType" class="page-type-tabs" @tab-change="handleTabChange">
        <el-tab-pane
          v-for="typeItem in pageTypes"
          :key="typeItem.type"
          :name="typeItem.type"
          :label="typeItem.title"
        />
      </el-tabs>
      <div class="operation mb_10">
        <el-button type="primary" @click="handleAdd()">添加页面</el-button>
      </div>
      <el-table v-loading="loading" :data="list" style="width: 100%">
        <el-table-column prop="name" label="页面名称" min-width="200" show-overflow-tooltip>
          <template #default="{ row }">
            <span v-if="row">{{ row.name || "暂无模板昵称" }}</span>
          </template>
        </el-table-column>
        <el-table-column label="状态" width="120" align="center">
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
        <el-table-column label="操作" width="140" align="center" fixed="right">
          <template #default="{ row }">
            <template v-if="row">
              <a class="link-text" @click="handleEdit(row)">修改</a>
              <span class="op-split">|</span>
              <a class="link-text" @click="confirmDel(row)">删除</a>
            </template>
          </template>
        </el-table-column>
      </el-table>
      <div class="mt_10" style="display: flex; justify-content: flex-end">
        <el-pagination
          v-model:current-page="params.pageNumber"
          v-model:page-size="params.pageSize"
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
  </div>
</template>
<script setup>
import { onMounted, reactive, ref } from "vue";
import { useRouter } from "vue-router";
import { Message, Modal } from "@/utils/message";
import * as API_Other from "@/api/other.js";

const router = useRouter();

const loading = ref(false);
const pageTypes = ref([
  { type: "INDEX", title: "首页" },
  { type: "SPECIAL", title: "专题" },
]);
const params = reactive({
  pageNumber: 1,
  pageSize: 20,
  sort: "createTime",
  order: "desc",
  pageType: "INDEX",
  pageClientType: "H5",
});
const total = ref(0);
const list = ref([]);

onMounted(() => {
  init();
});

function handleTabChange(val) {
  if (val == "ALERT") {
    router.push({
      path: "/floorList/main",
      query: { pagetype: val },
    });
    return;
  }
  if (val == "OPEN_SCREEN_ANIMATION") {
    router.push({
      path: "/floorList/main",
      query: { pagetype: val },
    });
    return;
  }
  params.pageNumber = 1;
  params.pageType = val;
  init();
}

function changePageNum(val) {
  params.pageNumber = val;
  init();
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
    API_Other.releasePageHome(row.id).then((res) => {
      if (res && res.success) {
        Message.success("发布成功");
        resolve(true);
        init();
      } else {
        reject(new Error("release failed"));
      }
    }).catch(() => {
      reject(new Error("release failed"));
    });
  });
}

function init() {
  loading.value = true;
  API_Other.getHomeList(params).then((res) => {
    loading.value = false;
    if (!res.result) return false;
    res.result.records.forEach((item) => {
      if (item.pageShow == "OPEN") {
        item.pageShow = true;
      } else {
        item.pageShow = false;
      }
    });
    list.value = res.result.records;
    total.value = res.result.total;
  });
}

function handleEdit(val) {
  router.push({
    path: "/floorList/main",
    query: {
      id: val.id,
      name: val.name,
      type: val.pageShow,
      pagetype: params.pageType,
    },
  });
}

function handleAdd() {
  router.push({
    path: "/floorList/main",
    query: { pagetype: params.pageType },
  });
}

function changePageSize(v) {
  params.pageNumber = 1;
  params.pageSize = v;
  init();
}

function confirmDel(row) {
  Modal.confirm({
    title: "提示",
    content: "删除此模板？",
    onOk: () => handleDel(row),
  });
}

function handleDel(val) {
  loading.value = true;
  API_Other.removePageHome(val.id).then((res) => {
    loading.value = false;
    if (res.result) {
      init();
      Message.success("删除成功");
    }
  });
}
</script>
<style scoped lang="scss">
.page-type-tabs {
  margin-bottom: 16px;
}
</style>
