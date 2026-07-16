<template>
  <div class="search">
    <el-card>
      <el-tabs v-model="searchForm.type" @tab-click="handleClickType">
        <el-tab-pane label="图片源" name="RESOURCE">
          <div class="operation" style="margin-bottom: 10px">
            <el-button type="primary" @click="add">添加</el-button>
          </div>
        </el-tab-pane>
        <el-tab-pane label="滑块源" name="SLIDER">
          <div class="operation" style="margin-bottom: 10px">
            <el-button type="primary" @click="add">添加</el-button>
          </div>
        </el-tab-pane>
      </el-tabs>

      <el-table
        ref="table"
        v-loading="loading"
        border
        :data="data"
        style="width: 100%"
      >
        <el-table-column prop="name" label="名称" min-width="80" />
        <el-table-column label="图片" width="150" align="center">
          <template #default="{ row }">
            <img
              v-if="row && row.resource"
              :src="row.resource"
              :style="{
                height: '60px',
                marginTop: '1px',
                width: searchForm.type === 'RESOURCE' ? '90px' : '60px',
              }"
              alt=""
            />
          </template>
        </el-table-column>
        <el-table-column prop="createBy" label="创建人" min-width="80" />
        <el-table-column prop="createTime" label="创建时间" min-width="120" />
        <el-table-column prop="updateBy" label="最后修改人" min-width="80" />
        <el-table-column prop="updateTime" label="更新时间" min-width="120" />
        <el-table-column label="操作" width="200" align="center">
          <template #default="{ row }">
            <template v-if="row">
              <a class="link-text" @click="edit(row)">编辑</a>
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
      <el-form ref="form" :model="form" :rules="formValidate" label-width="100px">
        <el-form-item label="名称" prop="name">
          <el-input
            v-model="form.name"
            maxlength="20"
            clearable
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="图片" prop="resource">
          <upload-pic-input v-model="form.resource" style="width: 100%" />
        </el-form-item>
        <el-form-item label="类型" prop="type">
          <el-radio-group v-model="form.type">
            <el-radio-button value="RESOURCE">图片源</el-radio-button>
            <el-radio-button value="SLIDER">滑块源</el-radio-button>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="modalVisible = false">取消</el-button>
        <el-button type="primary" :loading="submitLoading" @click="handleSubmit">
          提交
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script>
import { ElMessage, ElMessageBox } from "element-plus";
import * as API_Setting from "@/api/setting";
import uploadPicInput from "@/components/lili/upload-pic-input";

const defaultForm = () => ({
  name: "",
  resource: "",
  type: "RESOURCE",
});

export default {
  components: {
    uploadPicInput,
  },
  data() {
    return {
      modalVisible: false,
      modalTitle: "",
      loading: true,
      modalType: 0,
      submitLoading: false,
      form: defaultForm(),
      formValidate: {
        name: [
          {
            required: true,
            message: "请输入名称",
            trigger: "blur",
          },
        ],
        resource: [
          {
            required: true,
            message: "请上传图片",
            trigger: "blur",
          },
        ],
      },
      searchForm: {
        pageNumber: 1,
        pageSize: 20,
        sort: "createTime",
        order: "desc",
        type: "RESOURCE",
      },
      data: [],
      total: 0,
    };
  },
  methods: {
    changePage() {
      this.getDataList();
    },
    changePageSize() {
      this.searchForm.pageNumber = 1;
      this.getDataList();
    },
    handleClickType(tab) {
      this.searchForm.type = tab.paneName;
      this.searchForm.pageNumber = 1;
      this.searchForm.pageSize = 20;
      this.getDataList();
    },
    getDataList() {
      this.loading = true;
      API_Setting.verificationPage(this.searchForm).then((res) => {
        this.loading = false;
        if (res.success) {
          this.data = res.result.records;
          this.total = res.result.total;
        }
      });
    },
    add() {
      this.form = defaultForm();
      this.form.type = this.searchForm.type;
      this.modalType = 0;
      this.modalTitle = "添加验证码源";
      this.modalVisible = true;
      this.$nextTick(() => {
        this.$refs.form?.resetFields();
      });
    },
    edit(v) {
      this.form = {
        id: v.id,
        name: v.name,
        resource: v.resource,
        type: v.type,
      };
      this.modalType = 1;
      this.modalVisible = true;
      this.modalTitle = "修改验证码源";
    },
    handleSubmit() {
      this.form.type = this.searchForm.type;
      this.$refs.form.validate((valid) => {
        if (!valid) return;
        this.submitLoading = true;
        if (this.modalType === 0) {
          const payload = { ...this.form };
          delete payload.id;
          API_Setting.addVerification(payload).then((res) => {
            this.submitLoading = false;
            if (res.success) {
              ElMessage.success("添加成功");
              this.getDataList();
              this.modalVisible = false;
            }
          });
        } else {
          API_Setting.editVerification(this.form.id, this.form).then((res) => {
            this.submitLoading = false;
            if (res.success) {
              ElMessage.success("修改成功");
              this.getDataList();
              this.modalVisible = false;
            }
          });
        }
      });
    },
    remove(v) {
      ElMessageBox.confirm("确认要删除此验证码源?", "确认删除", { type: "warning" }).then(() => {
          return API_Setting.delVerification(v.id).then((res) => {
            if (res.success) {
              ElMessage.success("验证码源已删除");
              this.getDataList();
            }
          });
      }).catch(() => {});
    },
  },
  mounted() {
    this.getDataList();
  },
};
</script>

<style scoped>
.link-text {
  color: #409eff;
  cursor: pointer;
  text-decoration: none;
}
.mt_10 {
  margin-top: 10px;
}
</style>
