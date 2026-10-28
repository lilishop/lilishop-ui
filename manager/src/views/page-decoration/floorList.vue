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
        <el-button type="primary" tag="a" :href="addHref" target="_blank" class="add-page-btn">添加页面</el-button>
      </div>
      <el-table v-loading="loading" :data="list" style="width: 100%">
        <el-table-column prop="name" label="页面名称" min-width="200" show-overflow-tooltip>
          <template #default="{ row }">
            <span v-if="row">{{ row.name || "暂无模板昵称" }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="创建时间" width="180">
          <template #default="{ row }">
            {{ formatTime(row?.createTime) }}
          </template>
        </el-table-column>
        <el-table-column prop="updateTime" label="修改时间" width="180">
          <template #default="{ row }">
            {{ formatTime(row?.updateTime) }}
          </template>
        </el-table-column>
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
        <el-table-column label="操作" width="160" align="center" fixed="right">
          <template #default="{ row }">
            <template v-if="row">
              <a class="link-text" :href="decorateHref(row)" target="_blank">装修</a>
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
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, onBeforeUnmount } from "vue";
import { useRouter } from "vue-router";
import * as API_floor from "@/api/other.js";
import { Message, Modal } from "@/utils/message";
import { unixToDate } from "@/utils/filters";

defineOptions({ name: "floorList" });

const router = useRouter();

const total = ref(0);
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

const addHref = computed(() => {
  return router.resolve({
    path: "/floorList/renovation",
    query: {
      pageType: searchForm.pageType,
      mode: "add",
    },
  }).href;
});

function decorateHref(row) {
  return router.resolve({
    path: "/floorList/renovation",
    query: {
      id: row.id,
      name: row.name,
      pageType: searchForm.pageType,
    },
  }).href;
}

onMounted(() => {
  getTemplateList();
  window.addEventListener("focus", onWindowFocus);
});

onBeforeUnmount(() => {
  window.removeEventListener("focus", onWindowFocus);
});

function onWindowFocus() {
  getTemplateList();
}

function formatTime(time) {
  if (!time) return "—";
  if (typeof time === "string" && time.includes("-")) {
    return time;
  }
  const ts = new Date(time).getTime();
  if (Number.isNaN(ts)) return time;
  return unixToDate(ts / 1000);
}

function handleTabChange(type) {
  searchForm.pageNumber = 1;
  searchForm.pageType = type;
  getTemplateList();
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
    if (res.success && res.result) {
      total.value = res.result.total || 0;
      list.value = res.result.records || [];
      list.value.forEach((e) => {
        if (e.pageShow === "OPEN") {
          e.pageShow = true;
        } else {
          e.pageShow = false;
        }
      });
    }
  }).catch(() => {
    loading.value = false;
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

.add-page-btn {
  text-decoration: none;
}
</style>
