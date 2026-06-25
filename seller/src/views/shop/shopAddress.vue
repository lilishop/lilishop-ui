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
      <el-form ref="form" :model="form" label-width="100px" :rules="formValidate">
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

<script>
import * as API_Shop from "@/api/shops";
import { validateMobile } from "@/libs/validate";
import multipleMap from "@/views/my-components/map/multiple-map";

export default {
  name: "shopAddress",
  components: { multipleMap },
  data() {
    return {
      loading: true,
      modalType: 0,
      modalVisible: false,
      modalTitle: "",
      searchForm: {
        pageNumber: 1,
        pageSize: 10,
      },
      form: {
        addressName: "",
        center: "",
        address: "",
        mobile: "",
      },
      formValidate: {
        addressName: [{ required: true, message: "请输入地址名称", trigger: "blur" }],
        longitude: [{ required: true, message: "请输入地址经度", trigger: "blur" }],
        latitude: [{ required: true, message: "请输入地址纬度", trigger: "blur" }],
        mobile: [
          { required: true, message: "请输入联系电话号", trigger: "blur" },
          { validator: validateMobile, trigger: "blur" },
        ],
        address: [{ required: true, message: " ", trigger: "blur" }],
      },
      submitLoading: false,
      data: [],
      total: 0,
    };
  },
  methods: {
    init() {
      this.getDataList();
    },
    changePage(v) {
      this.searchForm.pageNumber = v;
      this.getDataList();
    },
    changePageSize(v) {
      this.searchForm.pageSize = v;
      this.getDataList();
    },
    getAddress(val) {
      if (val.type === "select") {
        const paths = val.data.map((item) => item.name).join(",");
        this.form.address = paths;
        this.form.center = val.data[val.data.length - 1].center;
      } else {
        this.form.address = val.data.addr;
        this.form.address = val.data.address;
        this.form.center = val.data.position.lng + "," + val.data.position.lat;
      }
    },
    getDataList() {
      this.loading = true;
      API_Shop.getShopAddress(this.searchForm).then((res) => {
        this.loading = false;
        if (res.success) {
          this.data = res.result.records;
          this.total = res.result.total;
        }
      });
    },
    resetForm() {
      this.form = {
        addressName: "",
        center: "",
        address: "",
        mobile: "",
      };
    },
    add() {
      this.modalType = 0;
      this.modalTitle = "添加自提地址";
      this.resetForm();
      this.modalVisible = true;
      this.$nextTick(() => {
        this.$refs.form?.resetFields();
      });
    },
    edit(v) {
      this.modalType = 1;
      this.modalVisible = true;
      this.modalTitle = "修改自提地址";
      this.form.id = v.id;
      this.form.address = v.address;
      this.form.addressName = v.addressName;
      this.form.mobile = v.mobile;
      this.form.center = v.center;
      this.form.longitude = v.center.split(",")[0];
      this.form.latitude = v.center.split(",")[1];
    },
    handleSubmit() {
      this.$refs.form.validate((valid) => {
        if (valid) {
          this.submitLoading = true;
          if (this.modalType == 0) {
            const params = { ...this.form };
            delete params.id;
            API_Shop.addShopAddress(params).then((res) => {
              this.submitLoading = false;
              if (res.success) {
                this.$Message.success("添加成功");
                this.getDataList();
                this.modalVisible = false;
              }
            });
          } else {
            API_Shop.editShopAddress(this.form.id, this.form).then((res) => {
              this.submitLoading = false;
              if (res.success) {
                this.$Message.success("修改成功");
                this.getDataList();
                this.modalVisible = false;
              }
            });
          }
        }
      });
    },
    deleteSubmit(v) {
      this.$Modal.confirm({
        title: "确认删除",
        content: "确认删除自提地址么？",
        loading: true,
        onOk: () => {
          API_Shop.deleteShopAddress(v.id).then((res) => {
            this.$Modal.remove();
            if (res.success) {
              this.$Message.success("此自自提地址已删除");
              this.init();
            }
          });
        },
      });
    },
  },
  mounted() {
    this.init();
  },
};
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
