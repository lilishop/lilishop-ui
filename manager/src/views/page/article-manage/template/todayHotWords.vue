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

    <div class="word-list">
      <el-tag
        v-for="words in data"
        :key="words"
        size="large"
        closable
        class="word-tag"
        @close="deleteWords(words)"
        @click="add(words)"
      >
        {{ words }}
      </el-tag>
      <el-empty v-if="!data.length" description="暂无热词，点击上方按钮设置" :image-size="80" />
    </div>

    <el-drawer
      v-model="modalVisible"
      :title="modalTitle"
      size="500px"
      :close-on-click-modal="false"
      append-to-body
      destroy-on-close
    >
      <el-form ref="formRef" :model="form" label-width="100px" :rules="formValidate">
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
    </el-drawer>
  </div>
</template>

<script setup>
import { onMounted, reactive, ref } from "vue";
import { getHotWords, setHotWords, deleteHotWords } from "@/api/index";
import { regular } from "@/utils";
import { Message, Modal } from "@/utils/message";
import { useAppStore } from "@/stores/app";

defineOptions({ name: "todayHotWords" });

const appStore = useAppStore();

const submitLoading = ref(false);
const modalTitle = ref("");
const loading = ref(true);
const modalVisible = ref(false);
const form = reactive({
  keywords: "",
  point: 0,
});
const data = ref([]);
const formValidate = {
  keywords: [regular.REQUIRED, regular.VARCHAR20],
  point: [regular.REQUIRED, regular.NUMBER],
};

const formRef = ref(null);

function init() {
  getDataList();
}

function getDataList() {
  loading.value = true;
  getHotWords().then((res) => {
    loading.value = false;
    if (res.success) {
      data.value = res.result;
      appStore.hotWords = data.value;
    }
  });
}

function handleSubmit() {
  formRef.value.validate((valid) => {
    if (valid) {
      submitLoading.value = true;
      setHotWords(form).then((res) => {
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
  form.keywords = words || "";
  form.point = 1;
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
.word-list {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 12px;
  margin-top: 16px;
}

.word-tag {
  cursor: pointer;
  padding: 0 14px;
  height: 32px;
  font-size: 14px;

  &:hover {
    color: var(--el-color-primary);
    border-color: var(--el-color-primary);
  }
}
</style>
