<template>
  <div class="search">
    <el-card>
      <el-form
        ref="searchForm"
        :model="searchForm"
        inline
        label-width="70px"
        class="search-form"
        @keyup.enter="handleSearch"
      >
        <el-form-item label="品牌名称">
          <el-input
            v-model="searchForm.name"
            placeholder="请输入品牌名称"
            clearable
            style="width: 240px"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">搜索</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-card>
      <div class="operation padding-row">
        <el-button type="primary" @click="add">添加</el-button>
      </div>

      <el-table ref="table" v-loading="loading" border :data="data" style="width: 100%">
        <el-table-column prop="name" label="品牌名称" width="200" />
        <el-table-column label="品牌图标" align="left" >
          <template #default="{ row }">
            <img
              v-if="row"
              :src="row.logo || ''"
              alt="加载图片失败"
              style="cursor: pointer; width: 80px; height: 60px; margin: 10px 0; object-fit: contain"
            />
          </template>
        </el-table-column>
        <el-table-column label="状态" align="left" width="150">
          <template #default="{ row }">
            <el-switch
              v-if="row"
              :model-value="row.deleteFlag == 0"
              inline-prompt
              active-text="启用"
              inactive-text="禁用"
              @change="(val) => handleStatusSwitchChange(row, val)"
            />
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="创建时间" min-width="170" show-overflow-tooltip />
        <el-table-column label="操作" width="230" align="center" fixed="right">
          <template #default="{ row }">
            <template v-if="row">
              <a class="link-text" @click="edit(row)">编辑</a>
              <span class="op-split">|</span>
              <a class="link-text" @click="openCategoryModal(row)">关联分类</a>
              <span class="op-split">|</span>
              <a class="link-text" @click="delBrand(row)">删除</a>
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
      <el-form ref="form" :model="form" label-width="100px" :rules="formValidate">
        <el-form-item label="品牌名称" prop="name">
          <el-input v-model="form.name" clearable style="width: 100%" />
        </el-form-item>
        <el-form-item label="品牌图标" prop="logo">
          <div style="display: flex; align-items: center; gap: 12px">
            <img
              :src="form.logo || defaultPic"
              alt="品牌图标"
              style="width: 80px; height: 60px; object-fit: contain; border: 1px solid #dcdee2; border-radius: 4px; background: #fff"
            />
            <el-button type="primary" link @click="openLogoPicker">修改</el-button>
          </div>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="modalVisible = false">取消</el-button>
        <el-button type="primary" :loading="submitLoading" @click="handleSubmit">提交</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="picModelFlag" width="1200px" :show-close="true">
      <ossManage
        ref="ossManage"
        :is-component="true"
        :initialize="picModelFlag"
        @callback="callbackSelected"
      />
    </el-dialog>

    <el-dialog
      v-model="categoryModalVisible"
      :title="categoryModalTitle"
      width="700px"
      :close-on-click-modal="false"
    >
      <div v-loading="categoryTreeLoading" style="position: relative; max-height: 520px; overflow: auto">
        <el-tree
          ref="categoryTree"
          :key="categoryTreeKey"
          :data="categoryTreeData"
          :props="{ label: 'title', children: 'children' }"
          node-key="id"
          show-checkbox
          default-expand-all
          :default-checked-keys="selectedCategoryIds"
          @check="onCategoryTreeCheckChange"
        />
      </div>
      <template #footer>
        <el-button @click="categoryModalVisible = false">取消</el-button>
        <el-button type="primary" :loading="categorySubmitLoading" @click="submitBrandCategory">
          提交
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script>
import {
  getManagerBrandPage,
  addBrand,
  updateBrand,
  disableBrand,
  delBrand,
  getCategoryTree,
  getBrandCategoryListData,
  saveBrandCategory,
} from "@/api/goods";
import ossManage from "@/views/sys/oss-manage/ossManage";
import { regular } from "@/utils";
import { ElMessage, ElMessageBox } from "element-plus";
import defaultPic from "@/assets/default.png";

export default {
  name: "brand",
  components: {
    ossManage,
  },
  data() {
    return {
      defaultPic,
      loading: true,
      modalType: 0,
      modalVisible: false,
      modalTitle: "",
      picModelFlag: false,
      categoryModalVisible: false,
      categoryModalTitle: "关联分类",
      categoryTreeLoading: false,
      categoryTreeData: [],
      categoryTreeKey: 0,
      categorySubmitLoading: false,
      currentBrandId: "",
      selectedCategoryIds: [],
      searchForm: {
        pageNumber: 1,
        pageSize: 20,
        sort: "create_time",
        order: "desc",
      },
      form: {
        name: "",
        logo: "",
        deleteFlag: "",
      },
      formValidate: {
        name: [regular.REQUIRED, regular.VARCHAR20],
        logo: [regular.REQUIRED, regular.URL200],
      },
      submitLoading: false,
      data: [],
      total: 0,
    };
  },
  methods: {
    openLogoPicker() {
      this.picModelFlag = true;
      this.$nextTick(() => {
        if (this.$refs.ossManage) {
          this.$refs.ossManage.selectImage = true;
        }
      });
    },
    callbackSelected(val) {
      this.picModelFlag = false;
      this.form.logo = val.url;
    },
    buildCategoryTreeNodes(list) {
      if (!Array.isArray(list) || list.length === 0) return [];
      return list.map((item) => ({
        id: item.id,
        title: item.name,
        children: this.buildCategoryTreeNodes(item.children || []),
      }));
    },
    async openCategoryModal(row) {
      this.currentBrandId = row.id;
      this.categoryModalTitle = "关联分类 - " + (row.name || "");
      this.categoryModalVisible = true;
      this.categoryTreeLoading = true;
      this.categoryTreeKey += 1;
      this.categoryTreeData = [];
      this.selectedCategoryIds = [];
      try {
        const [treeRes, bindRes] = await Promise.all([
          getCategoryTree(),
          getBrandCategoryListData(row.id),
        ]);
        const selectedIds = Array.isArray(bindRes?.result)
          ? bindRes.result
              .map((x) => (typeof x === "string" ? x : x && x.id))
              .filter(Boolean)
          : [];
        this.selectedCategoryIds = selectedIds;
        this.categoryTreeData =
          treeRes && treeRes.success
            ? this.buildCategoryTreeNodes(treeRes.result || [])
            : [];
      } finally {
        this.categoryTreeLoading = false;
      }
    },
    onCategoryTreeCheckChange(_data, checkedInfo) {
      this.selectedCategoryIds = checkedInfo?.checkedKeys || [];
    },
    submitBrandCategory() {
      if (!this.currentBrandId) return;
      this.categorySubmitLoading = true;
      saveBrandCategory(
        this.currentBrandId,
        (this.selectedCategoryIds || []).map((id) => String(id))
      )
        .then((res) => {
          this.categorySubmitLoading = false;
          if (res && res.success) {
            ElMessage.success("操作成功");
            this.categoryModalVisible = false;
          }
        })
        .catch(() => {
          this.categorySubmitLoading = false;
        });
    },
    handleStatusSwitchChange(row, checked) {
      const disable = !checked;
      ElMessageBox.confirm(
        "您确认要" + (disable ? "禁用" : "启用") + "品牌 " + row.name + " ?",
        disable ? "确认禁用" : "确认启用",
        { type: "warning" }
      ).then(() => {
        return disableBrand(row.id, { disable }).then((res) => {
          if (res.success) {
            ElMessage.success("操作成功");
          }
          this.getDataList();
        });
      }).catch(() => {
        this.$nextTick(() => this.$forceUpdate());
      });
    },
    delBrand(row) {
      ElMessageBox.confirm("您确认要删除 " + row.name + " ?", "确认删除", { type: "warning" }).then(() => {
        return delBrand(row.id).then((res) => {
          if (res.success) {
            ElMessage.success("品牌删除成功!");
            this.getDataList();
          }
        });
      }).catch(() => {});
    },
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
    handleSearch() {
      this.searchForm.pageNumber = 1;
      this.searchForm.pageSize = 20;
      this.getDataList();
    },
    getDataList() {
      this.loading = true;
      getManagerBrandPage(this.searchForm).then((res) => {
        this.loading = false;
        if (res.success) {
          this.data = res.result.records;
          this.total = res.result.total;
        }
      });
    },
    handleSubmit() {
      this.$refs.form.validate((valid) => {
        if (valid) {
          this.submitLoading = true;
          if (this.modalType === 0) {
            delete this.form.id;
            addBrand(this.form).then((res) => {
              this.submitLoading = false;
              if (res.success) {
                ElMessage.success("操作成功");
                this.getDataList();
                this.modalVisible = false;
              }
            });
          } else {
            updateBrand(this.form).then((res) => {
              this.submitLoading = false;
              if (res.success) {
                ElMessage.success("操作成功");
                this.getDataList();
                this.modalVisible = false;
              }
            });
          }
        }
      });
    },
    add() {
      this.modalType = 0;
      this.modalTitle = "添加";
      this.$refs.form?.resetFields();
      delete this.form.id;
      this.modalVisible = true;
    },
    edit(v) {
      this.modalType = 1;
      this.modalTitle = "编辑";
      this.$refs.form?.resetFields();
      for (const attr in v) {
        if (v[attr] === null) {
          v[attr] = "";
        }
      }
      const str = JSON.stringify(v);
      const data = JSON.parse(str);
      this.form = data;
      this.modalVisible = true;
    },
  },
  mounted() {
    this.init();
  },
};
</script>

<style lang="scss" scoped>
</style>
