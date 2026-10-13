<template>
  <div class="self-address">
    <el-card>
      <el-button type="primary" @click="add">添加</el-button>
      <el-table
        ref="table"
        v-loading="loading"
        border
        :data="data"
        style="width: 100%; margin-top: 10px"
      >
        <el-table-column prop="addressName" label="自提点名称" min-width="120" />
        <el-table-column prop="address" label="详细地址" min-width="280" />
        <el-table-column prop="createTime" label="创建时间" min-width="120" sortable />
        <el-table-column label="操作" width="200" align="center">
          <template #default="{ row }">
            <a class="link-text" @click="edit(row)">修改</a>
            <span class="op-split">|</span>
            <a class="link-text" @click="deleteSubmit(row)">删除</a>
          </template>
        </el-table-column>
      </el-table>
      <div class="mt_10" style="display: flex; justify-content: flex-end">
        <el-pagination
          v-model:current-page="searchForm.pageNumber"
          v-model:page-size="searchForm.pageSize"
          :page-sizes="[10, 20, 50]"
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
    >
      <el-form ref="formRef" :model="form" label-width="100px" :rules="formValidate">
        <el-form-item label="名称" prop="addressName">
          <el-input v-model="form.addressName" clearable style="width: 90%" />
        </el-form-item>
        <el-form-item label="详细地址" prop="address">
          <span>{{ form.address || "暂无地址" }}</span>
          <el-button style="margin-left: 10px" @click="$refs.map.open()">选择地址</el-button>
        </el-form-item>
        <el-form-item label="联系电话" prop="mobile">
          <el-input v-model="form.mobile" clearable style="width: 90%" maxlength="11" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="modalVisible = false">取消</el-button>
        <el-button type="primary" :loading="submitLoading" @click="handleSubmit">提交</el-button>
      </template>
    </el-dialog>
    <multipleMap ref="map" @callback="getAddress" />
  </div>
</template>

<script setup>
import { nextTick, onMounted, reactive, ref } from "vue";
import * as API_Shop from "@/api/shops";
import { validateMobile } from "@/libs/validate";
import { Message, Modal } from "@/utils/message";
import multipleMap from "@/views/my-components/map/multiple-map";

defineOptions({ name: "shopAddress" });

const formRef = ref(null);

const loading = ref(true);
const modalType = ref(0);
const modalVisible = ref(false);
const modalTitle = ref("");
const searchForm = reactive({
  pageNumber: 1,
  pageSize: 10,
});
const form = ref({
  addressName: "",
  center: "",
  address: "",
  mobile: "",
});
const formValidate = {
  addressName: [{ required: true, message: "请输入地址名称", trigger: "blur" }],
  longitude: [{ required: true, message: "请输入地址经度", trigger: "blur" }],
  latitude: [{ required: true, message: "请输入地址纬度", trigger: "blur" }],
  mobile: [
    { required: true, message: "请输入联系电话号", trigger: "blur" },
    { validator: validateMobile, trigger: "blur" },
  ],
  address: [{ required: true, message: " ", trigger: "blur" }],
};
const submitLoading = ref(false);
const data = ref([]);
const total = ref(0);

function init() {
  getDataList();
}
function changePage(v) {
  searchForm.pageNumber = v;
  getDataList();
}
function changePageSize(v) {
  searchForm.pageSize = v;
  getDataList();
}
function getAddress(val) {
  if (val.type === "select") {
    const paths = val.data.map((item) => item.name).join(",");
    form.value.address = paths;
    form.value.center = val.data[val.data.length - 1].center;
  } else {
    form.value.address = val.data.addr;
    form.value.address = val.data.address;
    form.value.center = val.data.position.lng + "," + val.data.position.lat;
  }
}
function getDataList() {
  loading.value = true;
  API_Shop.getShopAddress(searchForm).then((res) => {
    loading.value = false;
    if (res.success) {
      data.value = res.result.records;
      total.value = res.result.total;
    }
  });
}
function resetForm() {
  form.value = {
    addressName: "",
    center: "",
    address: "",
    mobile: "",
  };
}
function add() {
  modalType.value = 0;
  modalTitle.value = "添加自提地址";
  resetForm();
  modalVisible.value = true;
  nextTick(() => {
    formRef.value?.resetFields();
  });
}
function edit(v) {
  modalType.value = 1;
  modalVisible.value = true;
  modalTitle.value = "修改自提地址";
  form.value.id = v.id;
  form.value.address = v.address;
  form.value.addressName = v.addressName;
  form.value.mobile = v.mobile;
  form.value.center = v.center;
  form.value.longitude = v.center.split(",")[0];
  form.value.latitude = v.center.split(",")[1];
}
function handleSubmit() {
  formRef.value.validate((valid) => {
    if (valid) {
      submitLoading.value = true;
      if (modalType.value == 0) {
        const params = { ...form.value };
        delete params.id;
        API_Shop.addShopAddress(params).then((res) => {
          submitLoading.value = false;
          if (res.success) {
            Message.success("添加成功");
            getDataList();
            modalVisible.value = false;
          }
        });
      } else {
        API_Shop.editShopAddress(form.value.id, form.value).then((res) => {
          submitLoading.value = false;
          if (res.success) {
            Message.success("修改成功");
            getDataList();
            modalVisible.value = false;
          }
        });
      }
    }
  });
}
function deleteSubmit(v) {
  Modal.confirm({
    title: "确认删除",
    content: "确认删除自提地址么？",
    loading: true,
    onOk: () => {
      API_Shop.deleteShopAddress(v.id).then((res) => {
        Modal.remove();
        if (res.success) {
          Message.success("此自自提地址已删除");
          init();
        }
      });
    },
  });
}

onMounted(() => {
  init();
});
</script>
<style scoped>
.link-text {
  color: #2d8cf0;
  cursor: pointer;
  text-decoration: none;
}
.op-split {
  margin: 0 8px;
  color: #dcdee2;
}
</style>
