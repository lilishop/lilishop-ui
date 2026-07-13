<template>
  <div class="search">
    <el-card>
      <div class="operation padding-row">
        <el-button type="primary" @click="openAdd">添加分组</el-button>
      </div>
    </el-card>

    <el-card>
      <el-table ref="table" v-loading="loading" :data="data" border class="mt_10" style="width: 100%">
        <el-table-column prop="groupName" label="分组名称" min-width="160" show-overflow-tooltip />
        <el-table-column prop="description" label="分组描述" min-width="240" show-overflow-tooltip />
        <el-table-column prop="createTime" label="创建时间" min-width="180" />
        <el-table-column prop="updateTime" label="更新时间" min-width="180" />
        <el-table-column label="操作" width="200" align="center" fixed="right">
          <template #default="{ row }">
            <div v-if="row" class="ops" style="display: flex; justify-content: center">
              <a class="link-text" @click="openEdit(row)">编辑</a>
              <span class="op-split">|</span>
              <a class="link-text" @click="remove(row)">删除</a>
            </div>
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

    <el-dialog v-model="addFlag" title="添加分组" width="500px" :close-on-click-modal="false" destroy-on-close>
      <el-form ref="addForm" :model="formAdd" :rules="rulesAdd" label-width="90px">
        <el-form-item label="分组名称" prop="groupName" style="width: 90%">
          <el-input v-model="formAdd.groupName" maxlength="30" placeholder="请输入分组名称" />
        </el-form-item>
        <el-form-item label="分组描述" prop="description" style="width: 90%">
          <el-input v-model="formAdd.description" maxlength="200" placeholder="请输入分组描述" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="addFlag = false">取消</el-button>
        <el-button type="primary" :loading="submitAddLoading" @click="submitAdd">确定</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="editFlag" title="编辑分组" width="500px" :close-on-click-modal="false" destroy-on-close>
      <el-form ref="editForm" :model="formEdit" :rules="rulesEdit" label-width="90px">
        <el-input v-model="formEdit.id" style="display: none" />
        <el-form-item label="分组名称" prop="groupName" style="width: 90%">
          <el-input v-model="formEdit.groupName" maxlength="30" placeholder="请输入分组名称" />
        </el-form-item>
        <el-form-item label="分组描述" prop="description" style="width: 90%">
          <el-input v-model="formEdit.description" maxlength="200" placeholder="请输入分组描述" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="editFlag = false">取消</el-button>
        <el-button type="primary" :loading="submitEditLoading" @click="submitEdit">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script>
import * as API_Member from "@/api/member.js";
import { ElMessage, ElMessageBox } from "element-plus";

export default {
  name: "memberGroup",
  data() {
    return {
      loading: true,
      searchForm: {
        pageNumber: 1,
        pageSize: 20,
      },
      data: [],
      total: 0,
      addFlag: false,
      editFlag: false,
      submitAddLoading: false,
      submitEditLoading: false,
      formAdd: {
        groupName: "",
        description: "",
      },
      formEdit: {
        id: "",
        groupName: "",
        description: "",
      },
      rulesAdd: {
        groupName: [{ required: true, message: "请输入分组名称", trigger: "blur" }],
      },
      rulesEdit: {
        groupName: [{ required: true, message: "请输入分组名称", trigger: "blur" }],
      },
    };
  },
  methods: {
    init() {
      this.getData();
    },
    changePage(v) {
      this.searchForm.pageNumber = v;
      this.getData();
    },
    changePageSize(v) {
      this.searchForm.pageNumber = 1;
      this.searchForm.pageSize = v;
      this.getData();
    },
    getData() {
      this.loading = true;
      API_Member.getMemberGroupByPage(this.searchForm).then((res) => {
        this.loading = false;
        if (res && res.success && res.result) {
          this.data = res.result.records || [];
          this.total = res.result.total || 0;
        }
      });
    },
    openAdd() {
      this.addFlag = true;
      this.$nextTick(() => {
        if (this.$refs.addForm) this.$refs.addForm.resetFields();
        this.formAdd = { groupName: "", description: "" };
      });
    },
    submitAdd() {
      this.$refs.addForm.validate((valid) => {
        if (!valid) return;
        this.submitAddLoading = true;
        API_Member.addMemberGroup(this.formAdd).then((res) => {
          this.submitAddLoading = false;
          if (res && res.success) {
            ElMessage.success("添加成功");
            this.addFlag = false;
            this.getData();
          }
        });
      });
    },
    openEdit(row) {
      this.editFlag = true;
      this.submitEditLoading = false;
      API_Member.getMemberGroup(row.id).then((res) => {
        if (res && res.success && res.result) {
          this.formEdit = {
            id: res.result.id,
            groupName: res.result.groupName || "",
            description: res.result.description || "",
          };
        } else {
          this.formEdit = {
            id: row.id,
            groupName: row.groupName || "",
            description: row.description || "",
          };
        }
      });
    },
    submitEdit() {
      this.$refs.editForm.validate((valid) => {
        if (!valid) return;
        this.submitEditLoading = true;
        const { id, groupName, description } = this.formEdit;
        API_Member.updateMemberGroup(id, { groupName, description }).then((res) => {
          this.submitEditLoading = false;
          if (res && res.success) {
            ElMessage.success("修改成功");
            this.editFlag = false;
            this.getData();
          }
        });
      });
    },
    remove(row) {
      ElMessageBox.confirm("确定删除该分组？", "提示", { type: "warning" }).then(() => {
        API_Member.deleteMemberGroup(row.id).then((res) => {
          if (res && res.success) {
            ElMessage.success("删除成功");
            this.getData();
          } else if (res && res.message) {
            ElMessage.error(res.message);
          }
        });
      }).catch(() => {});
    },
  },
  mounted() {
    this.init();
  },
};
</script>

<style scoped>
.ops a {
  color: #2d8cf0;
  cursor: pointer;
  text-decoration: none;
}
.ops span {
  display: inline-block;
  margin: 0 8px;
  color: #dcdee2;
}
</style>
