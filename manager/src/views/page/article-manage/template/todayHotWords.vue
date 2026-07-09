<template>
  <div>
    <div class="operation mb_10">
      <el-button type="primary" @click="add()">设置今日热词</el-button>
    </div>
    <el-alert
      type="success"
      :closable="false"
      show-icon
      title="这里展示今日系统中搜索前一百的搜索热词，分数为热词在排序系统中的分数，分数越高，可以在用户获取热词时进行优先展示（首页商品搜索栏下方推荐位）（分数可以填写负数，会降低推荐度）"
    />

    <div class="card-list">
      <el-card v-for="words in data" :key="words" class="card-item" shadow="hover">
        <div class="card-item-inner">
          <a href="#" class="word-link" @click.prevent="add(words)">{{ words }}</a>
          <el-icon class="close-icon" @click="deleteWords(words)"><Close /></el-icon>
        </div>
      </el-card>
    </div>

    <el-dialog
      v-model="modalVisible"
      :title="modalTitle"
      width="500px"
      :close-on-click-modal="false"
      append-to-body
      destroy-on-close
    >
      <el-form ref="form" :model="form" label-width="100px" :rules="formValidate">
        <el-form-item label="热词" prop="keywords">
          <el-input v-model="form.keywords" clearable style="width: 100%" />
        </el-form-item>
        <el-form-item label="分数" prop="point">
          <el-input-number v-model="form.point" style="width: 100%" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="modalVisible = false">取消</el-button>
        <el-button type="primary" :loading="submitLoading" @click="handleSubmit">提交</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script>
import { Close } from "@element-plus/icons-vue";
import { getHotWords, setHotWords, deleteHotWords } from "@/api/index";
import { regular } from "@/utils";

export default {
  name: "todayHotWords",
  components: { Close },
  data() {
    return {
      submitLoading: false,
      modalTitle: "",
      loading: true,
      modalVisible: false,
      form: {
        keywords: "",
        point: 0,
      },
      data: [],
      formValidate: {
        keywords: [regular.REQUIRED, regular.VARCHAR20],
        point: [regular.REQUIRED, regular.NUMBER],
      },
    };
  },
  methods: {
    init() {
      this.getDataList();
    },
    getDataList() {
      this.loading = true;
      getHotWords().then((res) => {
        this.loading = false;
        if (res.success) {
          this.data = res.result;
          this.$store.state.app.hotWords = this.data;
        }
      });
    },
    handleSubmit() {
      this.$refs.form.validate((valid) => {
        if (valid) {
          this.submitLoading = true;
          setHotWords(this.form).then((res) => {
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
    add(words) {
      this.modalTitle = "设置热词";
      this.form.keywords = words || "";
      this.form.point = 1;
      this.modalVisible = true;
    },
    deleteWords(words) {
      this.$Modal.confirm({
        title: "是否确定删除热词",
        content: "您确定要删除此热词吗？",
        okText: "确定",
        cancelText: "取消",
        onOk: () => {
          deleteHotWords({ words }).then((res) => {
            if (res.success) {
              this.$Message.success("删除成功");
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

<style lang="scss" scoped>
.card-list {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  margin-top: 16px;
}

.card-item {
  min-width: 100px;
  margin: 10px;
}

.card-item-inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}

.word-link {
  color: var(--el-color-primary);
  text-decoration: none;
}

.close-icon {
  cursor: pointer;
  color: var(--el-text-color-secondary);

  &:hover {
    color: var(--el-color-danger);
  }
}
</style>
