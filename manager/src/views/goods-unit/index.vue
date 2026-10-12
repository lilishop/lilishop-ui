<template>
  <div class="search">
    <el-card>
      <div class="operation">
        <el-button type="primary" @click="add">添加</el-button>
        <el-button @click="delAll">批量删除</el-button>
      </div>

      <el-table
        ref="table"
        v-loading="loading"
        border
        :data="data"
        style="width: 100%"
        row-key="id"
        @selection-change="changeSelect"
      >
        <el-table-column type="selection" width="60" align="center" />
        <el-table-column prop="name" label="计量单位" min-width="120" />
        <el-table-column prop="createTime" label="创建时间" width="180" />
        <el-table-column prop="updateTime" label="更新时间" width="180" />
        <el-table-column prop="createBy" label="操作人" min-width="150" />
        <el-table-column label="操作" width="200" align="center" fixed="right">
          <template #default="{ row }">
            <template v-if="row">
              <a class="link-text" @click="edit(row)">修改</a>
              <span class="op-split">|</span>
              <a class="link-text" @click="remove(row)">删除</a>
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

    <el-dialog
      v-model="modalVisible"
      :title="modalTitle"
      width="500px"
      :close-on-click-modal="false"
      destroy-on-close
    >
      <el-form ref="formRef" :model="form" label-width="100px" :rules="formValidate">
        <el-form-item label="计量单位" prop="name">
          <el-input v-model="form.name" clearable style="width: 100%" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="modalVisible = false">取消</el-button>
        <el-button type="primary" :loading="submitLoading" @click="handleSubmit">提交</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from "vue";
import {
  addGoodsUnit,
  getGoodsUnitPage,
  updateGoodsUnit,
  delGoodsUnit,
} from "@/api/index";
import { regular } from "@/utils";
import { Message, Modal } from "@/utils/message";

defineOptions({ name: "goods-unit" });

const loading = ref(true);
const modalVisible = ref(false);
const modalTitle = ref("");
const searchForm = reactive({
  pageNumber: 1,
  pageSize: 20,
  sort: "createTime",
  order: "desc",
  name: "",
});
const form = ref({
  name: "",
});
const formValidate = reactive({
  name: [regular.REQUIRED, regular.VARCHAR5],
});
const submitLoading = ref(false);
const selectList = ref([]);
const selectCount = ref(0);
const data = ref([]);
const total = ref(0);

const table = ref(null);
const formRef = ref(null);

// 未在 data 中声明、原代码直接挂载到 this 上的字段
let id = null;

function init() {
  getDataList();
}
function changePage(v) {
  searchForm.pageNumber = v;
  getDataList();
  clearSelectAll();
}
function changePageSize(v) {
  searchForm.pageSize = v;
  getDataList();
}
function handleSearch() {
  searchForm.pageNumber = 1;
  searchForm.pageSize = 20;
  getDataList();
}
function clearSelectAll() {
  table.value?.clearSelection();
}
function changeSelect(e) {
  selectList.value = e;
  selectCount.value = e.length;
}
function getDataList() {
  loading.value = true;
  getGoodsUnitPage(searchForm)
    .then((res) => {
      if (res.success) {
        data.value = res.result.records;
        total.value = res.result.total;
      }
    })
    .finally(() => {
      loading.value = false;
    });
}
function handleSubmit() {
  formRef.value.validate((valid) => {
    if (valid) {
      submitLoading.value = true;
      if (modalTitle.value == "添加") {
        if (data.value.find((item) => item.name == form.value.name)) {
          Message.error("请勿添加重复计量单位!");
          submitLoading.value = false;
          return;
        }
        delete form.value.id;
        addGoodsUnit(form.value).then((res) => {
          submitLoading.value = false;
          if (res.success) {
            Message.success("操作成功");
            getDataList();
            modalVisible.value = false;
          }
        });
      } else {
        updateGoodsUnit(id, form.value).then((res) => {
          submitLoading.value = false;
          if (res.success) {
            Message.success("操作成功");
            getDataList();
            modalVisible.value = false;
          }
        });
      }
    }
  });
}
function add() {
  modalTitle.value = "添加";
  form.value = {};
  formRef.value?.resetFields();
  modalVisible.value = true;
}
function edit(v) {
  id = v.id;
  modalTitle.value = "修改";
  modalVisible.value = true;
  form.value.name = v.name;
}
function remove(v) {
  Modal.confirm({
    title: "确认删除",
    content: "您确认要删除 " + v.name + " ?",
    loading: true,
    onOk: () => {
      delGoodsUnit(v.id).then((res) => {
        Modal.remove();
        if (res.success) {
          Message.success("操作成功");
          getDataList();
        }
      });
    },
  });
}
function delAll() {
  if (selectCount.value <= 0) {
    Message.warning("您还未选择要删除的数据");
    return;
  }
  Modal.confirm({
    title: "确认删除",
    content: "您确认要删除所选的 " + selectCount.value + " 条数据?",
    loading: true,
    onOk: () => {
      let ids = "";
      selectList.value.forEach(function (e) {
        ids += e.id + ",";
      });
      ids = ids.substring(0, ids.length - 1);
      delGoodsUnit(ids).then((res) => {
        Modal.remove();
        if (res.success) {
          Message.success("操作成功");
          clearSelectAll();
          getDataList();
        }
      });
    },
  });
}

onMounted(() => {
  init();
});
</script>
