<template>
  <div class="video-config">
    <el-tabs v-model="activeTab" class="video-config-tabs">
      <el-tab-pane label="内容设置" name="content">
        <div class="video-config-section-title">内容设置</div>

        <div class="video-config-row">
          <div class="video-config-label">上传视频</div>
          <div
            class="video-upload-box"
            @click="$emit('select-file', 'videoUrl')"
          >
            <video
              v-if="item.videoUrl"
              class="video-upload-preview"
              :src="item.videoUrl"
              muted
            />
            <el-icon v-else class="video-upload-plus" :size="28">
              <Plus />
            </el-icon>
          </div>
        </div>

        <div class="video-config-row">
          <div class="video-config-label">视频封面</div>
          <div
            class="video-upload-box"
            @click="$emit('select-file', 'poster')"
          >
            <img
              v-if="item.poster"
              class="video-upload-preview"
              :src="item.poster"
              alt=""
            />
            <el-icon v-else class="video-upload-plus" :size="28">
              <Plus />
            </el-icon>
          </div>
        </div>

        <div class="video-config-row">
          <div class="video-config-label">视频比例</div>
          <el-radio-group v-model="item.aspectRatio" class="video-ratio-group">
            <el-radio value="16:9">16:9</el-radio>
            <el-radio value="4:3">4:3</el-radio>
            <el-radio value="1:1">1:1</el-radio>
          </el-radio-group>
        </div>

        <div class="video-config-row">
          <div class="video-config-label">自动播放</div>
          <el-switch v-model="item.autoplay" />
        </div>
      </el-tab-pane>

      <el-tab-pane label="样式设置" name="style">
        <div class="video-config-section-title">通用样式</div>

        <div class="video-config-block">
          <div class="video-config-block-title">背景设置</div>
          <div class="video-config-row">
            <el-radio-group v-model="item.style.bgType">
              <el-radio value="color">颜色</el-radio>
              <el-radio value="image">图片</el-radio>
            </el-radio-group>
          </div>

          <template v-if="item.style.bgType === 'color'">
            <div class="video-config-row">
              <div class="video-config-label">背景颜色</div>
              <div class="video-color-pair">
                <el-color-picker v-model="item.style.bgColorStart" />
                <el-color-picker v-model="item.style.bgColorEnd" />
                <el-button link type="primary" @click="resetBgColors">重置</el-button>
              </div>
            </div>
            <div class="video-config-row">
              <div class="video-config-label">渐变方向</div>
              <el-radio-group v-model="item.style.bgGradientDir">
                <el-radio value="horizontal">横向</el-radio>
                <el-radio value="vertical">纵向</el-radio>
                <el-radio value="skewLeft">左斜</el-radio>
                <el-radio value="skewRight">右斜</el-radio>
              </el-radio-group>
            </div>
          </template>

          <template v-else>
            <div class="video-config-row">
              <div class="video-config-label">背景图片</div>
              <div
                class="video-upload-box video-upload-box--small"
                @click="$emit('select-file', 'bgImage')"
              >
                <img
                  v-if="item.style.bgImage"
                  class="video-upload-preview"
                  :src="item.style.bgImage"
                  alt=""
                />
                <el-icon v-else class="video-upload-plus" :size="24">
                  <Plus />
                </el-icon>
              </div>
            </div>
          </template>

          <div class="video-config-row">
            <div class="video-config-label">背景圆角</div>
            <el-slider
              v-model="item.style.bgRadius"
              :min="0"
              :max="40"
              show-input
              :show-input-controls="false"
            />
          </div>

          <div class="video-config-row">
            <div class="video-config-label">底部背景</div>
            <div class="video-color-pair">
              <el-color-picker v-model="item.style.bottomBgColor" />
              <el-button link type="primary" @click="item.style.bottomBgColor = '#F5F5F5'">
                重置
              </el-button>
            </div>
          </div>
        </div>

        <div class="video-config-block">
          <div class="video-config-row">
            <div class="video-config-label">外边距</div>
            <el-slider
              v-model="item.style.margin"
              :min="0"
              :max="40"
              show-input
              :show-input-controls="false"
            />
          </div>
          <div class="video-config-row">
            <div class="video-config-label">内边距</div>
            <el-slider
              v-model="item.style.padding"
              :min="0"
              :max="40"
              show-input
              :show-input-controls="false"
            />
          </div>
        </div>

        <div class="video-config-block">
          <div class="video-config-block-title">边框设置</div>
          <div class="video-config-row">
            <el-radio-group v-model="item.style.borderShow">
              <el-radio :value="false">隐藏</el-radio>
              <el-radio :value="true">显示</el-radio>
            </el-radio-group>
          </div>
          <template v-if="item.style.borderShow">
            <div class="video-config-row">
              <div class="video-config-label">边框样式</div>
              <el-radio-group v-model="item.style.borderStyle">
                <el-radio value="solid">实线</el-radio>
                <el-radio value="dashed">虚线</el-radio>
                <el-radio value="dotted">点状</el-radio>
              </el-radio-group>
            </div>
            <div class="video-config-row">
              <div class="video-config-label">边框粗细</div>
              <el-slider
                v-model="item.style.borderWidth"
                :min="1"
                :max="10"
                show-input
                :show-input-controls="false"
              />
            </div>
            <div class="video-config-row">
              <div class="video-config-label">边框颜色</div>
              <div class="video-color-pair">
                <el-color-picker v-model="item.style.borderColor" />
                <el-button link type="primary" @click="item.style.borderColor = '#e5e5e5'">
                  重置
                </el-button>
              </div>
            </div>
          </template>
        </div>

        <div class="video-config-block">
          <div class="video-config-block-title">阴影设置</div>
          <div class="video-config-row">
            <el-radio-group v-model="item.style.shadowShow">
              <el-radio :value="false">隐藏</el-radio>
              <el-radio :value="true">显示</el-radio>
            </el-radio-group>
          </div>
          <template v-if="item.style.shadowShow">
            <div class="video-config-row">
              <div class="video-config-label">阴影颜色</div>
              <div class="video-color-pair">
                <el-color-picker v-model="item.style.shadowColor" show-alpha />
                <el-button
                  link
                  type="primary"
                  @click="item.style.shadowColor = 'rgba(0,0,0,0.1)'"
                >
                  重置
                </el-button>
              </div>
            </div>
            <div class="video-config-row">
              <div class="video-config-label">X轴偏移</div>
              <el-slider
                v-model="item.style.shadowX"
                :min="-20"
                :max="20"
                show-input
                :show-input-controls="false"
              />
            </div>
            <div class="video-config-row">
              <div class="video-config-label">Y轴偏移</div>
              <el-slider
                v-model="item.style.shadowY"
                :min="-20"
                :max="20"
                show-input
                :show-input-controls="false"
              />
            </div>
            <div class="video-config-row">
              <div class="video-config-label">模糊半径</div>
              <el-slider
                v-model="item.style.shadowBlur"
                :min="0"
                :max="40"
                show-input
                :show-input-controls="false"
              />
            </div>
            <div class="video-config-row">
              <div class="video-config-label">扩展半径</div>
              <el-slider
                v-model="item.style.shadowSpread"
                :min="0"
                :max="40"
                show-input
                :show-input-controls="false"
              />
            </div>
          </template>
        </div>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script>
import { Plus } from "@element-plus/icons-vue";
import { ensureVideoItem } from "./video-style";

export default {
  name: "VideoConfig",
  components: { Plus },
  props: {
    item: {
      type: Object,
      required: true,
    },
  },
  emits: ["select-file"],
  data() {
    return {
      activeTab: "content",
    };
  },
  created() {
    ensureVideoItem(this.item);
  },
  watch: {
    item: {
      handler(val) {
        if (val) ensureVideoItem(val);
      },
      immediate: true,
      deep: true,
    },
  },
  methods: {
    resetBgColors() {
      this.item.style.bgColorStart = "#F5F5F5";
      this.item.style.bgColorEnd = "#F5F5F5";
    },
  },
};
</script>

<style scoped lang="scss">
.video-config-tabs {
  :deep(.el-tabs__header) {
    margin-bottom: 16px;
  }
}

.video-config-section-title {
  font-size: 15px;
  font-weight: 600;
  margin-bottom: 16px;
}

.video-config-block {
  margin-bottom: 20px;
  padding-bottom: 12px;
  border-bottom: 1px solid #f0f0f0;
}

.video-config-block-title {
  font-size: 14px;
  font-weight: 600;
  margin-bottom: 12px;
}

.video-config-row {
  display: flex;
  align-items: flex-start;
  margin-bottom: 16px;
  gap: 12px;
}

.video-config-label {
  width: 72px;
  flex-shrink: 0;
  line-height: 32px;
  color: #606266;
  font-size: 13px;
}

.video-upload-box {
  width: 88px;
  height: 88px;
  border: 1px dashed #dcdfe6;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  overflow: hidden;
  background: #fafafa;

  &:hover {
    border-color: #409eff;
  }
}

.video-upload-box--small {
  width: 72px;
  height: 72px;
}

.video-upload-preview {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.video-upload-plus {
  color: #c0c4cc;
}

.video-ratio-group {
  flex: 1;
  padding-top: 6px;
}

.video-color-pair {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

:deep(.el-slider) {
  flex: 1;
  min-width: 0;
}
</style>
