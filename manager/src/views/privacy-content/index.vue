<template>
  <div class="wrapper">
    <el-row>
      <el-col :span="24">
        <el-card class="article-detail">
          <el-alert
            title="隐私协议在移动端中 设置->关于我们->对应的文章展示"
            type="info"
            :closable="false"
            show-icon
            style="margin-bottom: 16px"
          />
          <el-table ref="table" v-loading="loading" border :data="data" style="width: 100%">
            <el-table-column prop="name" label="协议名称" width="150" />
            <el-table-column prop="type" label="协议类型" width="150" />
            <el-table-column label="操作" width="230" align="center">
              <template #default="{ row }">
                <a v-if="row" class="link-text ops" @click="edit(row)">编辑</a>
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-col>
    </el-row>

    <el-dialog
      v-if="!selected"
      v-model="modalVisible"
      :title="modalTitle"
      width="1100px"
      :close-on-click-modal="false"
      destroy-on-close
    >
      <el-row :gutter="16">
        <el-col :span="16">
          <el-form ref="form" :model="form.article" label-width="100px">
            <el-form-item label="文章标题" prop="title">
              <el-input v-model="form.article.title" clearable style="width: 40%" />
            </el-form-item>
            <el-form-item class="form-item-view-el" label="文章内容" prop="content">
              <editor
                v-if="modalVisible"
                ref="editor"
                open-xss
                v-model="form.article.content"
              />
            </el-form-item>
          </el-form>
        </el-col>
        <el-col :span="8">
          <div class="mobile-effect">
            <div class="title">页面预览</div>
            <div class="content">
              <div v-html="form.article.content"></div>
            </div>
          </div>
        </el-col>
      </el-row>
      <template #footer>
        <el-button @click="modalVisible = false">取消</el-button>
        <el-button type="primary" :loading="submitLoading" @click="handleSubmit">提交</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script>
import { getArticleCategory, updatePrivacy, getPrivacy } from "@/api/pages";
import tinymec from "@/components/editor/index.vue";

export default {
  name: "privacy",
  components: {
    editor: tinymec,
  },
  props: {
    selected: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      loading: false,
      modalVisible: false,
      treeDataDefault: [],
      list: [],
      treeValue: "",
      treeData: [],
      submitLoading: false,
      modalTitle: "",
      currindex: "",
      form: {
        type: "",
        article: {
          openStatus: false,
          title: "",
          categoryId: "",
          sort: 1,
          content: "",
          type: "",
        },
        id: "",
      },
      data: [
        { name: "店铺入驻协议", type: "STORE_REGISTER" },
        { name: "用户协议", type: "USER_AGREEMENT" },
        { name: "证照信息", type: "LICENSE_INFORMATION" },
        { name: "关于我们", type: "ABOUT" },
        { name: "隐私策略", type: "PRIVACY_POLICY" },
      ],
    };
  },
  methods: {
    init() {
      this.getAllList(0);
    },
    handleCheckChange(data) {
      let value = "";
      let title = "";
      this.list = [];
      data.forEach((item) => {
        value += `${item.value},`;
        title += `${item.title},`;
      });
      value = value.substring(0, value.length - 1);
      title = title.substring(0, title.length - 1);
      this.list.push({ value, title });
      this.form.article.categoryId = value;
    },
    getAllList(parent_id) {
      this.loading = true;
      getArticleCategory(parent_id).then((res) => {
        this.loading = false;
        if (res.success) {
          this.treeData = this.getTree(res.result);
          this.treeDataDefault = this.getTree(res.result);
          this.treeData.unshift({
            title: "全部",
            level: 0,
            children: [],
            id: "0",
            categoryId: 0,
          });
        }
      });
    },
    getTree(tree = []) {
      const arr = [];
      if (!!tree && tree.length !== 0) {
        tree.forEach((item) => {
          const obj = {};
          obj.title = item.articleCategoryName;
          obj.value = item.id;
          obj.attr = item.articleCategoryName;
          obj.children = this.getTree(item.children);
          arr.push(obj);
        });
      }
      return arr;
    },
    edit(data) {
      this.modalType = 1;
      this.modalTitle = "编辑协议";
      this.form.article = { content: "" };
      this.$refs.form?.resetFields();
      this.loading = true;
      getPrivacy(data.type).then((res) => {
        this.loading = false;
        this.modalVisible = true;
        this.form.article.categoryId = res.result.categoryId;
        this.form.id = res.result.id;
        this.form.article.content = res.result.content;
        this.form.article.title = res.result.title;
        this.form.article.sort = res.result.sort;
        this.form.article.openStatus = res.result.openStatus;
        this.form.article.type = res.result.type;
        this.form.type = res.result.type;
      });
      this.loading = false;
    },
    handleSubmit() {
      this.$refs.form.validate((valid) => {
        if (valid) {
          this.submitLoading = true;
          updatePrivacy(this.form.id, this.form.type, this.form.article).then((res) => {
            this.submitLoading = false;
            if (res.success) {
              this.$Message.success("操作成功");
              this.modalVisible = false;
            }
          });
        }
      });
    },
  },
  mounted() {
    this.init();
  },
};
</script>

<style lang="scss" scoped>
.mobile-effect {
  box-sizing: border-box;
  margin: 0 20px;
  border: 2px solid #f1f2f3;
  height: 610px;
  .title {
    align-items: center;
    background: #f9f9fa;
    border-radius: 4px 4px 0 0;
    color: #85878a;
    display: flex;
    font-size: 12px;
    height: 32px;
    line-height: 20px;
    padding: 0 12px;
  }
  .content {
    width: 100%;
    height: 560px;
    padding: 0 14px;
    overflow-y: scroll;
  }
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
