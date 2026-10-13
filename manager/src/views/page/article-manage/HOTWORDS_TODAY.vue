<template>
  <div class="search">
    <el-card>
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
    </el-card>

    <el-dialog
      v-model="modalVisible"
      :title="modalTitle"
      width="500px"
      :close-on-click-modal="false"
      append-to-body
      destroy-on-close
    >
      <el-form ref="formRef" :model="form" label-width="100px" :rules="formValidate">
        <el-form-item label="热词" prop="keywords">
          <el-input v-model="form.keywords" clearable style="width: 100%" />
        </el-form-item>
        <el-form-item label="分数" prop="point">
          <el-input v-model="form.point" clearable style="width: 100%" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="modalVisible = false">取消</el-button>
        <el-button type="primary" :loading="submitLoading" @click="handleSubmit">提交</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { onMounted, reactive, ref } from "vue";
import { Close } from "@element-plus/icons-vue";
import { getHotWords, setHotWords, deleteHotWords } from "@/api/index";
import { regular } from "@/utils";
import { Message, Modal } from "@/utils/message";

defineOptions({ name: "HOTWORDS_TODAY" });

const formRef = ref(null);

const submitLoading = ref(false);
const modalTitle = ref("");
const loading = ref(true);
const modalVisible = ref(false);
const form = ref({
  keywords: "",
  point: 0,
});
const data = ref([]);
const formValidate = reactive({
  keywords: [regular.REQUIRED, regular.VARCHAR20],
  point: [regular.REQUIRED, regular.NUMBER],
});

function init() {
  getDataList();
}
function getDataList() {
  loading.value = true;
  getHotWords().then((res) => {
    loading.value = false;
    if (res.success) {
      data.value = res.result;
    }
  });
}
function handleSubmit() {
  formRef.value.validate((valid) => {
    if (valid) {
      submitLoading.value = true;
      setHotWords(form.value).then((res) => {
        submitLoading.value = false;
        if (res.success) {
          Message.success("操作成功");
          getDataList();
          modalVisible.value = false;
        }
      });
    }
  });
}
function add(words) {
  modalTitle.value = "设置热词";
  form.value.keywords = words || "";
  form.value.point = 1;
  modalVisible.value = true;
}
function deleteWords(words) {
  Modal.confirm({
    title: "是否确定删除热词",
    content: "您确定要删除此热词吗？",
    okText: "确定",
    cancelText: "取消",
    onOk: () => {
      deleteHotWords({ words }).then((res) => {
        if (res.success) {
          Message.success("删除成功");
          getDataList();
        }
      });
    },
  });
}

onMounted(() => {
  init();
});
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
