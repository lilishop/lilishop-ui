<template>
  <div class="live-form-page">
    <el-card>
      <template #header>
        <span class="page-title">创建直播</span>
      </template>
      <el-form ref="formRef" :model="form" :rules="rules" label-width="100px" class="live-form">
        <el-form-item label="直播标题" prop="title">
          <el-input
            v-model="form.title"
            placeholder="请输入直播标题"
            maxlength="34"
            show-word-limit
            class="form-input"
          />
          <div class="form-tip">直播间名字，最短3个汉字，最长17个汉字，1个汉字相当于2个字符</div>
        </el-form-item>
        <el-form-item label="显示模式" prop="displayMode">
          <el-radio-group v-model="form.displayMode">
            <el-radio value="0">横屏</el-radio>
            <el-radio value="1">竖屏</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="开始时间" prop="startTime">
          <el-date-picker
            v-model="form.startTime"
            type="datetime"
            value-format="YYYY-MM-DD HH:mm:ss"
            format="YYYY-MM-DD HH:mm"
            placeholder="请选择日期"
            class="form-input"
          />
          <div class="form-tip">请选择直播开始时间</div>
        </el-form-item>
        <el-form-item label="直播封面" prop="coverImg">
          <div class="cover-uploader">
            <div class="cover-preview">
              <el-image v-if="form.coverImg" :src="form.coverImg" fit="cover" class="cover-image" />
              <div v-else class="cover-placeholder">
                <el-icon :size="32"><Picture /></el-icon>
                <span>暂无封面图片</span>
              </div>
            </div>
            <el-button @click="openCoverPicker">
              <el-icon><Picture /></el-icon>
              选择图片
            </el-button>
          </div>
          <div class="form-tip">建议尺寸 1080x1920，大小不超过1M</div>
        </el-form-item>
        <el-form-item label="直播简介" prop="liveIntroduce">
          <el-input
            v-model="form.liveIntroduce"
            type="textarea"
            placeholder="请输入直播简介（选填）"
            maxlength="500"
            show-word-limit
            :rows="4"
            class="form-input"
          />
        </el-form-item>
        <el-form-item class="form-actions">
          <el-button type="primary" :loading="submitting" @click="handleSubmit">提交</el-button>
          <el-button @click="handleBack">取消</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-dialog v-model="picModelFlag" width="1200px" append-to-body destroy-on-close>
      <ossManage
        ref="ossManageRef"
        :is-component="true"
        :initialize="picModelFlag"
        @callback="callbackSelected"
      />
    </el-dialog>
  </div>
</template>

<script setup>
import { nextTick, reactive, ref } from "vue";
import { useRouter } from "vue-router";
import { Picture } from "@element-plus/icons-vue";
import { createLive } from "@/api/live";
import { Message } from "@/utils/message";
import ossManage from "@/views/sys/oss-manage/ossManage";

defineOptions({ name: "live-add" });

function getCharLength(str) {
  if (!str) return 0;
  let len = 0;
  for (const ch of str) {
    len += /[\u4e00-\u9fa5]/.test(ch) ? 2 : 1;
  }
  return len;
}

function buildEndTime(startTime, hours = 24) {
  const date = new Date(startTime.replace(/-/g, "/"));
  date.setHours(date.getHours() + hours);
  const pad = (n) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
}

const router = useRouter();

const formRef = ref(null);
const ossManageRef = ref(null);

const picModelFlag = ref(false);
const submitting = ref(false);
const form = reactive({
  title: "",
  displayMode: "0",
  startTime: "",
  coverImg: "",
  liveIntroduce: "",
});

const validateTitle = (rule, value, callback) => {
  const len = getCharLength(value);
  if (len < 6) {
    callback(new Error("直播间名字最短3个汉字"));
    return;
  }
  if (len > 34) {
    callback(new Error("直播间名字最长17个汉字"));
    return;
  }
  callback();
};
const rules = {
  title: [
    { required: true, message: "请输入直播标题", trigger: "blur" },
    { validator: validateTitle, trigger: "blur" },
  ],
  displayMode: [{ required: true, message: "请选择显示模式", trigger: "change" }],
  startTime: [{ required: true, message: "请选择直播开始时间", trigger: "change" }],
  coverImg: [{ required: true, message: "请上传直播封面", trigger: "change" }],
};

function openCoverPicker() {
  picModelFlag.value = true;
  nextTick(() => {
    if (ossManageRef.value) {
      ossManageRef.value.selectImage = true;
    }
  });
}
function callbackSelected(val) {
  picModelFlag.value = false;
  if (val?.url) {
    form.coverImg = val.url;
    formRef.value?.validateField("coverImg");
  }
}
function handleSubmit() {
  formRef.value.validate((valid) => {
    if (!valid) return;
    submitting.value = true;
    createLive({
      title: form.title,
      displayMode: form.displayMode,
      coverImg: form.coverImg,
      startTime: form.startTime,
      endTime: buildEndTime(form.startTime),
      liveIntroduce: form.liveIntroduce,
    })
      .then((res) => {
        submitting.value = false;
        if (res.success) {
          Message.success("创建成功");
          router.push({ path: "/live-list" });
        }
      })
      .catch(() => {
        submitting.value = false;
      });
  });
}
function handleBack() {
  router.push({ path: "/live-list" });
}
</script>

<style lang="scss" scoped>
.live-form-page {
  .page-title {
    font-size: 16px;
    font-weight: 500;
    color: #303133;
  }
  .live-form {
    max-width: 720px;
    padding-top: 8px;
  }
  .form-input {
    width: 460px;
  }
  .form-tip {
    margin-top: 6px;
    color: #909399;
    font-size: 12px;
    line-height: 1.5;
  }
  .cover-uploader {
    display: flex;
    align-items: flex-start;
    gap: 16px;
  }
  .cover-preview {
    width: 120px;
    height: 120px;
    flex-shrink: 0;
    border: 1px solid #dcdfe6;
    border-radius: 4px;
    overflow: hidden;
    background: #f5f7fa;
  }
  .cover-image {
    width: 100%;
    height: 100%;
  }
  .cover-placeholder {
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 8px;
    color: #c0c4cc;
    font-size: 12px;
  }
  .form-actions {
    margin-top: 8px;
    :deep(.el-form-item__content) {
      gap: 12px;
    }
  }
}
</style>
