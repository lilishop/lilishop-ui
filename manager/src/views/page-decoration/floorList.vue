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
        <el-table-column prop="name" label="页面名称" min-width="200" show-overflow-tooltip>
          <template #default="{ row }">
            <span v-if="row">{{ row.name || "暂无模板昵称" }}</span>
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
              @change="releaseTemplate(row.id)"
            />
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200" align="center" fixed="right">
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
      <el-form ref="form" :model="formData" label-width="80px">
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

<script>
import * as API_floor from "@/api/other.js";
export default {
  name: "floorList",
  data() {
    return {
      showModal: false,
      total: 0,
      formData: {
        status: false,
        name: "",
      },
      searchForm: {
        pageNumber: 1,
        pageSize: 20,
        sort: "createTime",
        order: "desc",
        pageType: "INDEX",
        pageClientType: "PC",
      },
      loading: false,
      pageTypes: [
        { type: "INDEX", title: "首页" },
        { type: "SPECIAL", title: "专题" },
      ],
      list: [],
    };
  },
  mounted() {
    this.getTemplateList();
  },
  methods: {
    newTemplate() {
      this.$refs.form.validate((valid) => {
        if (valid) {
          const data = this.formData;
          data.status ? (data.pageShow = "OPEN") : (data.pageShow = "CLOSE");
          delete data.status;
          (data.pageType = this.searchForm.pageType),
            (data.pageClientType = "PC");
          if (data.id) {
            API_floor.updateHome(data.id, data).then((res) => {
              this.$Message.success("编辑模板成功");
              this.showModal = false;
              this.getTemplateList();
            });
          } else {
            API_floor.setHomeSetup(data).then((res) => {
              this.$Message.success("新建模板成功");
              this.showModal = false;
              this.getTemplateList();
            });
          }
        } else {
          this.loading = false;
        }
      });
    },

    handleTabChange(type) {
      this.searchForm.pageNumber = 1;
      this.searchForm.pageType = type;
      this.getTemplateList();
    },

    createTemp() {
      this.$refs.form?.resetFields();
      this.formData = { status: false, name: "" };
      this.showModal = true;
    },

    Template(item) {
      item.status = item.pageShow;
      this.formData = { ...item };
      this.showModal = true;
    },

    decorate(val) {
      const data = { id: val.id, pageShow: val.pageShow, pageType: this.searchForm.pageType };

      this.$router.push({
        name: "renovation",
        query: data,
      });
    },

    changePageNum(val) {
      this.searchForm.pageNumber = val;
      this.getTemplateList();
    },
    changePageSize(val) {
      this.searchForm.pageNumber = 1;
      this.searchForm.pageSize = val;
      this.getTemplateList();
    },
    getTemplateList() {
      this.loading = true;
      API_floor.getHomeList(this.searchForm).then((res) => {
        this.loading = false;
        if (res.success) {
          this.total = res.result.total;
          this.list = res.result.records;
          this.list.forEach((e) => {
            if (e.pageShow === "OPEN") {
              e.pageShow = true;
            } else {
              e.pageShow = false;
            }
          });
        }
      });
    },

    releaseTemplate(id) {
      API_floor.releasePageHome(id).then((res) => {
        if (res.success) {
          this.$Message.success("发布模板成功");
          this.getTemplateList();
        }
      });
    },
    confirmDel(id) {
      this.$Modal.confirm({
        title: "提示",
        content: "删除此模板？",
        onOk: () => this.delTemplate(id),
      });
    },
    delTemplate(id) {
      API_floor.removePageHome(id).then((res) => {
        if (res.success) {
          this.$Message.success("删除模板成功");
          this.getTemplateList();
        }
      });
    },
  },
};
</script>

<style lang="scss" scoped>
.page-type-tabs {
  margin-bottom: 16px;
}
</style>
