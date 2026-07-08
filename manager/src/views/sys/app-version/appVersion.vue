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
        <el-form-item label="系统类型" prop="orderSn">
          <el-select v-model="searchForm.type" placeholder="请选择系统类型" clearable style="width: 240px">
            <el-option label="苹果" value="IOS" />
            <el-option label="安卓" value="ANDROID" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">搜索</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-card>
      <el-button class="mt_10 mb_10" type="primary" @click="addAppVersion">添加</el-button>

      <el-table ref="table" v-loading="loading" border :data="data" style="width: 100%">
        <el-table-column prop="versionName" label="版本名称" min-width="100" />
        <el-table-column prop="version" label="版本号" min-width="120" />
        <el-table-column label="强制更新" width="100">
          <template #default="{ row }">
            <span v-if="row">{{ row.forceUpdate == 0 ? "非强制" : "强制" }}</span>
          </template>
        </el-table-column>
        <el-table-column label="类型" min-width="80">
          <template #default="{ row }">
            <span v-if="row">{{ row.type == "IOS" ? "苹果" : "安卓" }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="versionUpdateDate" label="更新时间" min-width="120" sortable />
        <el-table-column label="操作" width="230" align="center" fixed="right">
          <template #default="{ row }">
            <div v-if="row" class="ops">
              <a class="link-text" @click="detail(row)">查看</a>
              <span class="op-split">|</span>
              <a class="link-text" @click="editAppVersion(row)">修改</a>
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

    <el-dialog
      v-model="modalVisible"
      :title="modalTitle"
      width="1000px"
      :close-on-click-modal="false"
      destroy-on-close
    >
      <el-form ref="form" :model="form" label-width="100px" :rules="formValidate">
        <el-form-item label="版本名称" prop="versionName">
          <el-input v-model="form.versionName" maxlength="15" clearable style="width: 40%" />
        </el-form-item>
        <el-form-item label="版本号" prop="version">
          <el-input v-model="form.version" maxlength="15" clearable style="width: 40%" />
          <span class="tips">在移动端项目->manifest.json->基础配置->应用版本名称中查看</span>
        </el-form-item>
        <el-form-item label="更新时间" prop="versionUpdateDate">
          <el-date-picker
            v-model="form.versionUpdateDate"
            type="datetime"
            value-format="YYYY-MM-DD HH:mm:ss"
            clearable
            placeholder="请选择"
            style="width: 200px"
          />
        </el-form-item>
        <el-form-item label="强制更新">
          <el-radio-group v-model="form.forceUpdate">
            <el-radio-button :value="1">强制更新</el-radio-button>
            <el-radio-button :value="0">非强制更新</el-radio-button>
          </el-radio-group>
          <span class="tips" v-if="form.forceUpdate == 1">
            强制更新即为应用中必须更新此版本。不更新则无法继续使用App
          </span>
          <span class="tips" v-if="form.forceUpdate == 0">
            非强制更新为应用中推荐更新此版本。不更新还可以继续使用
          </span>
        </el-form-item>
        <el-form-item label="类型">
          <el-radio-group v-model="form.type">
            <el-radio-button value="IOS">苹果</el-radio-button>
            <el-radio-button value="ANDROID">安卓</el-radio-button>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="下载地址" prop="downloadUrl">
          <el-input v-model="form.downloadUrl" maxlength="100" clearable style="width: 40%" />
          <span class="tips" v-if="form.type == 'IOS'">
            AppStore中App项目下载目录。可从下载App页面点击分享，拷贝链接
          </span>
          <span class="tips" v-else>安卓该链接为应用的下载地址</span>
        </el-form-item>
        <el-form-item class="form-item-view-el" label="更新内容" prop="content">
          <el-input
            v-model="form.content"
            :rows="6"
            maxlength="100"
            show-word-limit
            type="textarea"
            placeholder="Enter something..."
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="modalVisible = false">取消</el-button>
        <el-button type="primary" :loading="submitLoading" @click="saveAppVersion">保存</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="queryModalVisible" :title="queryModalTitle" width="700px">
      <el-form label-width="100px">
        <div class="div-version">
          <el-form-item label="版本名称:">{{ form.versionName }}</el-form-item>
        </div>
        <div class="div-version">
          <el-form-item label="版本号:">{{ form.version }}</el-form-item>
        </div>
        <el-form-item label="更新时间:">
          <div>{{ versionUpdateDate }}</div>
        </el-form-item>
        <el-form-item label="强制更新:">
          <span v-if="form.forceUpdate == 1">强制更新</span>
          <span v-else>非强制更新</span>
        </el-form-item>
        <el-form-item label="类型">
          <span v-if="form.type == 'IOS'">IOS</span>
          <span v-else>安卓</span>
        </el-form-item>
        <el-form-item label="下载地址:">{{ form.downloadUrl }}</el-form-item>
        <el-form-item label="更新内容:">
          <div v-html="form.content"></div>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="queryModalVisible = false">取消</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script>
import { ElMessage, ElMessageBox } from "element-plus";
import { unixToDate } from "@/utils/filters";
import * as API_Setting from "@/api/setting";

export default {
  name: "appVersion",
  data() {
    return {
      queryModalVisible: false,
      queryModalTitle: "查看更新信息",
      loading: true,
      modalVisible: false,
      modalTitle: "",
      modalType: 0,
      searchForm: {
        pageNumber: 1,
        pageSize: 20,
        sort: "createTime",
        order: "desc",
        type: "",
      },
      form: {
        versionName: "",
        version: "",
        forceUpdate: 1,
        type: "IOS",
        downloadUrl: "",
        content: "",
        versionUpdateDate: "",
      },
      versionUpdateDate: "",
      formValidate: {
        version: [{ required: true, message: "版本号不能为空", trigger: "blur" }],
        versionName: [{ required: true, message: "版本名称不能为空", trigger: "blur" }],
        downloadUrl: [{ required: true, message: "下载地址不能为空", trigger: "blur" }],
        versionUpdateDate: [{ required: true, message: "更新时间不能为空" }],
      },
      submitLoading: false,
      data: [],
      total: 0,
    };
  },
  methods: {
    init() {
      this.getData();
    },
    changePage() {
      this.getData();
    },
    changePageSize() {
      this.searchForm.pageNumber = 1;
      this.getData();
    },
    handleSearch() {
      this.searchForm.pageNumber = 1;
      this.getData();
    },
    getData() {
      this.loading = true;
      API_Setting.appVersionPage(this.searchForm).then((res) => {
        this.loading = false;
        if (res.success) {
          this.data = res.result.records;
          this.total = res.result.total;
        }
      });
    },
    addAppVersion() {
      this.modalVisible = true;
      this.modalTitle = "添加APP版本信息";
      this.modalType = 0;
      const versionUpdateDate = unixToDate(new Date() / 1000);
      this.form = {
        forceUpdate: 0,
        type: "IOS",
        versionUpdateDate: versionUpdateDate,
        content: " ",
      };
    },
    editAppVersion(v) {
      this.modalVisible = true;
      this.modalTitle = "修改APP版本信息";
      this.modalType = 1;
      v.forceUpdate ? (v.forceUpdate = 1) : (v.forceUpdate = 0);
      this.form = v;
    },
    saveAppVersion() {
      this.$refs.form.validate((valid) => {
        if (valid) {
          this.submitLoading = true;
          if (JSON.stringify(this.form.versionUpdateDate).includes("T")) {
            const versionUpdateDate = unixToDate(
              this.form.versionUpdateDate / 1000
            );
            this.form.versionUpdateDate = versionUpdateDate;
            this.form.updateTime = versionUpdateDate;
          }
          if (this.modalType == 0) {
            delete this.form.id;
            API_Setting.addVersion(this.form).then((res) => {
              this.submitLoading = false;
              if (res && res.success) {
                ElMessage.success("添加成功");
                this.modalVisible = false;
                this.getData();
              }
            });
          } else {
            API_Setting.editVersion(this.form, this.form.id).then((res) => {
              this.submitLoading = false;
              if (res && res.success) {
                ElMessage.success("修改成功");
                this.modalVisible = false;
                this.getData();
              }
            });
          }
        }
      });
    },
    remove(v) {
      ElMessageBox.confirm("您确认要删除么?", "确认删除", { type: "warning" }).then(() => {
          API_Setting.deleteVersion(v.id).then((res) => {
            if (res.success) {
              ElMessage.success("删除成功");
              this.getData();
            }
          });
      }).catch(() => {});
    },
    detail(v) {
      this.queryModalVisible = true;
      this.form = JSON.parse(JSON.stringify(v));
      this.versionUpdateDate = this.form.versionUpdateDate;
    },
  },
  mounted() {
    this.init();
  },
};
</script>
<style lang="scss" scoped>
.search-form {
  width: 100%;
}
.tips {
  margin-left: 10px;
  color: #999;
}
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
