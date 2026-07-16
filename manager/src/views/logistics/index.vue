<template>
  <div class="search">
    <el-card>
      <div class="operation padding-row" style="margin-bottom: 10px">
        <el-button type="primary" @click="add">添加</el-button>
      </div>

      <el-table
        ref="table"
        v-loading="loading"
        border
        :data="data"
        style="width: 100%"
      >
        <el-table-column prop="name" label="物流公司名称" min-width="120" />
        <el-table-column prop="code" label="物流公司编码" min-width="120" />
        <el-table-column label="状态" width="150" align="center">
          <template #default="{ row }">
            <el-switch
              v-if="row"
              v-model="row.switch"
              inline-prompt
              active-text="开启"
              inactive-text="禁用"
              @change="changeSwitch(row)"
            />
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="创建时间" width="180" />
        <el-table-column label="操作" width="150" align="center">
          <template #default="{ row }">
            <template v-if="row">
              <a class="link-text"  @click="detail(row)">修改</a>
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
      <el-form ref="form" :model="form" :rules="formValidate" label-width="120px">
        <el-form-item label="物流公司名称" prop="name">
          <el-input v-model="form.name" clearable style="width: 100%" />
        </el-form-item>
        <el-form-item label="物流公司代码" prop="code">
          <el-input v-model="form.code" clearable style="width: 100%" />
        </el-form-item>
        <el-form-item label="支持电子面单">
          <el-switch
            v-model="form.standBy"
            active-value="true"
            inactive-value="false"
            inline-prompt
            active-text="开"
            inactive-text="关"
          />
        </el-form-item>
        <el-form-item label="禁用状态" prop="disabled">
          <el-switch
            v-model="form.disabled"
            inline-prompt
            active-value="OPEN"
            inactive-value="CLOSE"
            active-text="开启"
            inactive-text="禁用"
          />
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
import {
  getLogisticsPage,
  updateLogistics,
  addLogistics,
  delLogistics,
} from "@/api/logistics";

const defaultForm = () => ({
  name: "",
  code: "",
  standBy: "false",
  disabled: "CLOSE",
});

const normalizeStandBy = (value) => (value === true || value === "true" ? "true" : "false");

export default {
  name: "logistics",
  data() {
    return {
      loading: true,
      modalVisible: false,
      modalTitle: "",
      searchForm: {
        pageNumber: 1,
        pageSize: 20,
        sort: "createTime",
        order: "desc",
        name: "",
      },
      form: defaultForm(),
      formValidate: {
        name: [
          {
            required: true,
            message: "请输入物流公司名称",
            trigger: "blur",
          },
        ],
        code: [
          {
            required: true,
            message: "请输入物流公司编码",
            trigger: "blur",
          },
        ],
      },
      submitLoading: false,
      data: [],
      total: 0,
      id: "",
    };
  },
  methods: {
    init() {
      this.getDataList();
    },
    changePage() {
      this.getDataList();
    },
    changePageSize() {
      this.searchForm.pageNumber = 1;
      this.getDataList();
    },
    getDataList() {
      this.loading = true;
      getLogisticsPage(this.searchForm).then((res) => {
        this.loading = false;
        if (res.success) {
          const data = res.result.records;
          data.forEach((e) => {
            e.switch = e.disabled === "OPEN";
            e.standBy = normalizeStandBy(e.standBy);
          });
          this.data = data;
          this.total = res.result.total;
        }
      });
    },
    changeSwitch(row) {
      updateLogistics(row.id, {
        name: row.name,
        code: row.code,
        standBy: normalizeStandBy(row.standBy),
        disabled: row.disabled === "CLOSE" ? "OPEN" : "CLOSE",
      }).then((res) => {
        if (res.success) {
          this.$Message.success("操作成功");
          this.getDataList();
        } else {
          row.switch = !row.switch;
        }
      });
    },
    handleSubmit() {
      this.$refs.form.validate((valid) => {
        if (!valid) return;
        this.submitLoading = true;

        if (this.modalTitle === "添加") {
          const payload = {
            name: this.form.name,
            code: this.form.code,
            disabled: this.form.disabled,
            standBy: normalizeStandBy(this.form.standBy),
            formItems: this.form.formItems,
          };
          addLogistics(payload).then((res) => {
            this.submitLoading = false;
            if (res.success) {
              this.$Message.success("操作成功");
              this.getDataList();
              this.modalVisible = false;
            }
          });
        } else {
          updateLogistics(this.id, {
            ...this.form,
            standBy: normalizeStandBy(this.form.standBy),
          }).then((res) => {
            this.submitLoading = false;
            if (res.success) {
              this.$Message.success("操作成功");
              this.getDataList();
              this.modalVisible = false;
            }
          });
        }
      });
    },
    add() {
      this.modalTitle = "添加";
      this.form = defaultForm();
      this.$nextTick(() => {
        this.$refs.form?.resetFields();
      });
      this.modalVisible = true;
    },
    detail(v) {
      this.id = v.id;
      this.modalTitle = "修改";
      this.form = {
        name: v.name,
        code: v.code,
        standBy: normalizeStandBy(v.standBy),
        disabled: v.disabled,
      };
      this.modalVisible = true;
    },
    remove(v) {
      this.$Modal.confirm({
        title: "确认删除",
        content: "您确认要删除 " + v.name + " ?",
        onOk: () => {
          return delLogistics(v.id).then((res) => {
            if (res.success) {
              this.$Message.success("操作成功");
              this.getDataList();
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
