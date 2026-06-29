<template>
  <div class="live-form-page">
    <el-card v-loading="loading">
      <template #header>
        <span class="page-title">编辑直播</span>
      </template>
      <el-form ref="form" :model="form" :rules="rules" label-width="100px" class="live-form">
        <el-form-item v-if="form.liveStatus !== 'NEW'" label="直播状态">
          <el-tag :type="liveStatusTagType(form.liveStatus)">{{ liveStatusText(form.liveStatus) }}</el-tag>
        </el-form-item>
        <el-form-item label="直播标题" prop="title">
          <el-input
            v-model="form.title"
            placeholder="请输入直播标题"
            maxlength="34"
            show-word-limit
            :disabled="form.liveStatus !== 'NEW'"
            class="form-input"
          />
          <div class="form-tip">直播间名字，最短3个汉字，最长17个汉字，1个汉字相当于2个字符</div>
        </el-form-item>
        <el-form-item label="显示模式" prop="displayMode">
          <el-radio-group v-model="form.displayMode" :disabled="form.liveStatus !== 'NEW'">
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
            :disabled="form.liveStatus !== 'NEW'"
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
            <el-button v-if="form.liveStatus === 'NEW'" @click="openCoverPicker">
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
            :disabled="form.liveStatus !== 'NEW'"
            class="form-input"
          />
        </el-form-item>
        <el-form-item class="form-actions">
          <el-button
            v-if="form.liveStatus === 'NEW'"
            type="primary"
            :loading="submitting"
            @click="handleSubmit"
          >
            提交
          </el-button>
          <el-button @click="handleBack">取消</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-dialog v-model="picModelFlag" width="1200px" append-to-body destroy-on-close>
      <ossManage
        ref="ossManage"
        :is-component="true"
        :initialize="picModelFlag"
        @callback="callbackSelected"
      />
    </el-dialog>
  </div>
</template>

<script>
import { Picture } from "@element-plus/icons-vue";
import { getLiveInfo, updateLive } from "@/api/live";
import ossManage from "@/views/sys/oss-manage/ossManage";

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

function normalizeDisplayMode(mode) {
  const map = { HORIZONTAL: "0", VERTICAL: "1", TRIPLE: "2", "0": "0", "1": "1", "2": "2" };
  return map[mode] ?? "0";
}

function formatDateTime(value) {
  if (!value) return "";
  if (typeof value === "string" && value.includes("-")) {
    return value.length === 16 ? `${value}:00` : value;
  }
  if (typeof value === "number") {
    const ts = value > 1e12 ? Math.floor(value / 1000) : value;
    const d = new Date(ts * 1000);
    const pad = (n) => String(n).padStart(2, "0");
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
  }
  return String(value);
}

export default {
  name: "live-edit",
  components: { Picture, ossManage },
  data() {
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
    return {
      picModelFlag: false,
      loading: false,
      submitting: false,
      liveId: "",
      endTime: "",
      form: {
        title: "",
        displayMode: "0",
        startTime: "",
        coverImg: "",
        liveIntroduce: "",
        liveStatus: "NEW",
      },
      rules: {
        title: [
          { required: true, message: "请输入直播标题", trigger: "blur" },
          { validator: validateTitle, trigger: "blur" },
        ],
        displayMode: [{ required: true, message: "请选择显示模式", trigger: "change" }],
        startTime: [{ required: true, message: "请选择直播开始时间", trigger: "change" }],
        coverImg: [{ required: true, message: "请上传直播封面", trigger: "change" }],
      },
    };
  },
  mounted() {
    this.liveId = String(this.$route.query.id || "");
    if (!this.liveId) {
      this.$Message.error("缺少直播ID");
      this.handleBack();
      return;
    }
    this.loadDetail();
  },
  methods: {
    liveStatusText(status) {
      const map = { NEW: "未开始", LIVING: "直播中", ENDED: "已结束" };
      return map[status] || "未知";
    },
    liveStatusTagType(status) {
      const map = { NEW: "info", LIVING: "success", ENDED: "warning" };
      return map[status] || "info";
    },
    openCoverPicker() {
      this.picModelFlag = true;
      this.$nextTick(() => {
        if (this.$refs.ossManage) {
          this.$refs.ossManage.selectImage = true;
        }
      });
    },
    callbackSelected(val) {
      this.picModelFlag = false;
      if (val?.url) {
        this.form.coverImg = val.url;
        this.$refs.form?.validateField("coverImg");
      }
    },
    loadDetail() {
      this.loading = true;
      getLiveInfo(this.liveId)
        .then((res) => {
          this.loading = false;
          if (res.success) {
            const data = res.result || {};
            this.form.title = data.title || "";
            this.form.displayMode = normalizeDisplayMode(data.displayMode);
            this.form.coverImg = data.coverImg || "";
            this.form.liveIntroduce = data.liveIntroduce || "";
            this.form.liveStatus = data.liveStatus || data.status || "NEW";
            this.endTime = formatDateTime(data.endTime);
            this.form.startTime = formatDateTime(data.startTime);
          }
        })
        .catch(() => {
          this.loading = false;
        });
    },
    handleSubmit() {
      this.$refs.form.validate((valid) => {
        if (!valid) return;
        let endTime = this.endTime;
        if (!endTime || endTime <= this.form.startTime) {
          endTime = buildEndTime(this.form.startTime);
        }
        this.submitting = true;
        updateLive(this.liveId, {
          title: this.form.title,
          displayMode: this.form.displayMode,
          coverImg: this.form.coverImg,
          startTime: this.form.startTime,
          endTime,
          liveIntroduce: this.form.liveIntroduce,
        })
          .then((res) => {
            this.submitting = false;
            if (res.success) {
              this.$Message.success("保存成功");
              this.$router.push({ path: "/live-list" });
            }
          })
          .catch(() => {
            this.submitting = false;
          });
      });
    },
    handleBack() {
      this.$router.push({ path: "/live-list" });
    },
  },
};
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
