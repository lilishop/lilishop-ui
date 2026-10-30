<template>
  <div class="panel-hot-zone">
    <!-- 1. 热区底图设置 -->
    <div class="panel-section">
      <div class="section-title">热区底图</div>

      <!-- URL 输入与选择图片按钮 -->
      <div class="form-item">
        <span class="item-label">大图 URL 地址</span>
        <div class="input-with-action">
          <el-input
            v-model="options.imageUrl"
            size="small"
            placeholder="请输入或选择热区大图 URL"
            clearable
          />
          <el-button
            size="small"
            class="action-picker-btn"
            @click="handleSelectImage"
          >
            <el-icon class="mr-4"><Picture /></el-icon>
            <span>选择图片</span>
          </el-button>
        </div>
      </div>

      <!-- 底图预览框 -->
      <div class="hotzone-preview-box" v-if="options.imageUrl">
        <img :src="options.imageUrl" alt="hotzone" class="img-preview" />
        <div class="preview-actions-bar">
          <el-button size="small" type="primary" @click="handleOpenHotzone">
            <el-icon class="mr-4"><Aim /></el-icon>
            绘制热区
          </el-button>
          <el-button size="small" type="primary" plain @click="handleSelectImage">
            <el-icon class="mr-4"><Picture /></el-icon>
            更换底图
          </el-button>
          <el-button size="small" type="danger" plain @click="options.imageUrl = ''">
            <el-icon class="mr-4"><Close /></el-icon>
            移除底图
          </el-button>
        </div>
      </div>
    </div>

    <!-- 2. 热区列表与链接选择 -->
    <div class="panel-section">
      <div class="section-title flex-between">
        <span>热区列表 ({{ options.zones?.length || 0 }})</span>
        <div class="header-action-group">
          <el-button type="primary" plain size="small" @click="handleOpenHotzone">
            <el-icon class="mr-4"><Aim /></el-icon> 绘制热区
          </el-button>
          <el-button link type="primary" size="small" @click="handleAddZone">
            <el-icon><Plus /></el-icon> 添加热区
          </el-button>
        </div>
      </div>

      <div class="zones-list" v-if="Array.isArray(options.zones) && options.zones.length">
        <div
          v-for="(zone, idx) in options.zones"
          :key="idx"
          class="zone-card-item"
        >
          <!-- 热区卡片头部 -->
          <div class="zone-header">
            <span class="zone-idx-title">
              <span class="zone-num-badge">{{ idx + 1 }}</span>
              <span>{{ zone.title || `热区 ${idx + 1}` }}</span>
            </span>
            <div class="zone-header-btns">
              <el-button
                link
                size="small"
                :disabled="idx === 0"
                @click="moveZone(idx, -1)"
                title="上移"
              >
                <el-icon><Top /></el-icon>
              </el-button>
              <el-button
                link
                size="small"
                :disabled="idx === options.zones.length - 1"
                @click="moveZone(idx, 1)"
                title="下移"
              >
                <el-icon><Bottom /></el-icon>
              </el-button>
              <el-button
                link
                type="danger"
                size="small"
                @click="options.zones.splice(idx, 1)"
                title="删除热区"
              >
                <el-icon><Delete /></el-icon>
              </el-button>
            </div>
          </div>

          <!-- 热区标题与链接设置 -->
          <div class="zone-body-inputs">
            <!-- 热区标题 -->
            <div class="field-item">
              <span class="field-lbl">热区标题</span>
              <el-input
                v-model="zone.title"
                size="small"
                placeholder="热区名称（如：领券中心 / 潮电专场）"
                clearable
              />
            </div>

            <!-- 跳转链接 + 链接选择器 -->
            <div class="field-item">
              <span class="field-lbl">跳转链接</span>
              <div class="link-picker-row">
                <el-input
                  v-model="zone.url"
                  size="small"
                  placeholder="跳转链接（如 /goodsList?category=1）"
                  clearable
                >
                  <template #prefix>
                    <el-icon class="link-prefix-icon"><Link /></el-icon>
                  </template>
                </el-input>
                <el-button
                  type="primary"
                  plain
                  size="small"
                  class="action-picker-btn link-btn"
                  @click="handleSelectLink(zone)"
                >
                  <el-icon class="mr-4"><Link /></el-icon>
                  <span>选择链接</span>
                </el-button>
              </div>

              <!-- 当前链接高亮标识 -->
              <div class="link-current-tag" v-if="zone.url">
                <span class="tag-label">当前链接:</span>
                <span class="tag-val" :title="zone.url">{{ zone.url }}</span>
              </div>
            </div>

            <!-- 热区位置百分比 (X, Y, W, H) -->
            <div class="field-item">
              <span class="field-lbl">热区位置 (坐标与尺寸 %)</span>
              <div class="coord-grid">
                <div class="coord-cell">
                  <span class="coord-lbl">X</span>
                  <el-input-number
                    v-model="zone.left"
                    :min="0"
                    :max="100"
                    :step="1"
                    :precision="1"
                    size="small"
                    controls-position="right"
                    class="coord-input"
                  />
                </div>
                <div class="coord-cell">
                  <span class="coord-lbl">Y</span>
                  <el-input-number
                    v-model="zone.top"
                    :min="0"
                    :max="100"
                    :step="1"
                    :precision="1"
                    size="small"
                    controls-position="right"
                    class="coord-input"
                  />
                </div>
                <div class="coord-cell">
                  <span class="coord-lbl">宽</span>
                  <el-input-number
                    v-model="zone.width"
                    :min="1"
                    :max="100"
                    :step="1"
                    :precision="1"
                    size="small"
                    controls-position="right"
                    class="coord-input"
                  />
                </div>
                <div class="coord-cell">
                  <span class="coord-lbl">高</span>
                  <el-input-number
                    v-model="zone.height"
                    :min="1"
                    :max="100"
                    :step="1"
                    :precision="1"
                    size="small"
                    controls-position="right"
                    class="coord-input"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="empty-zones-box" v-else>
        <span>暂无热区，可点击“绘制热区”在底图上拖拽画热区</span>
        <div class="mt-8">
          <el-button type="primary" size="small" @click="handleOpenHotzone">
            <el-icon class="mr-4"><Aim /></el-icon> 立即绘制热区
          </el-button>
        </div>
      </div>
        </div>

    <!-- 绘制热区弹窗（复用移动端热区绘制器） -->
    <hotzone ref="hotzoneDialogRef" width="960px" @changeZone="handleChangeZone" />
  </div>
</template>

<script setup>
import { ref, inject } from 'vue';
import { Plus, Delete, Link, Picture, Close, Top, Bottom, Aim } from '@element-plus/icons-vue';
import { ElMessageBox, ElMessage } from 'element-plus';
import hotzone from '@/components/hotzone';

const props = defineProps({
  component: {
    type: Object,
    required: true
  },
  options: {
    type: Object,
    required: true
  }
});

// 注入来自 pc/index.vue 的全局选择器
const openImagePicker = inject('openImagePicker', null);
const openLinkPicker = inject('openLinkPicker', null);

// 1. 选择大图
function handleSelectImage() {
  if (openImagePicker) {
    openImagePicker((url) => {
      if (url) props.options.imageUrl = url;
    });
  } else {
    ElMessageBox.prompt('请输入热区大图 URL 地址：', '选择热区底图', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      inputValue: props.options.imageUrl || '',
      inputPattern: /^\S+$/,
      inputErrorMessage: '图片地址不能为空'
    })
      .then(({ value }) => {
        props.options.imageUrl = value.trim();
      })
      .catch(() => {});
  }
}

// 2. 选择热区跳转链接
function handleSelectLink(zone) {
  if (openLinkPicker) {
    openLinkPicker(({ url, title, raw }) => {
      if (url) zone.url = url;
      if (!zone.title && title) {
        zone.title = title;
      }
    });
  } else {
    ElMessageBox.prompt('请输入跳转链接地址（如 /goodsList?category=1 或外部网址）：', '设置跳转链接', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      inputValue: zone.url || '',
      inputPattern: /^\S+$/,
      inputErrorMessage: '链接地址不能为空'
    })
      .then(({ value }) => {
        zone.url = value.trim();
      })
      .catch(() => {});
  }
}

// 3. 上移/下移热区
function moveZone(index, direction) {
  const newIdx = index + direction;
  if (!Array.isArray(props.options.zones)) return;
  if (newIdx < 0 || newIdx >= props.options.zones.length) return;
  const temp = props.options.zones[index];
  props.options.zones[index] = props.options.zones[newIdx];
  props.options.zones[newIdx] = temp;
}

// 4. 添加热区
function handleAddZone() {
  if (!Array.isArray(props.options.zones)) props.options.zones = [];
  const count = props.options.zones.length;
  props.options.zones.push({
    title: `热区 ${count + 1}`,
    url: '/goodsList',
    top: Math.min(10 + count * 5, 60),
    left: Math.min(10 + (count % 3) * 30, 70),
    width: 25,
    height: 35
  });
}

const hotzoneDialogRef = ref(null);

// 绘制热区弹窗打开
function handleOpenHotzone() {
  const imgUrl = props.options.imageUrl || '';
  if (!imgUrl) {
    ElMessage.warning('请先输入或选择热区底图');
    return;
  }
  const zoneInfo = (props.options.zones || []).map((z, idx) => {
    const leftPer = z.leftPer !== undefined ? z.leftPer : (Number(z.left) || 0) / 100;
    const topPer = z.topPer !== undefined ? z.topPer : (Number(z.top) || 0) / 100;
    const widthPer = z.widthPer !== undefined ? z.widthPer : (Number(z.width) || 20) / 100;
    const heightPer = z.heightPer !== undefined ? z.heightPer : (Number(z.height) || 20) / 100;
    const link = z.url || z.link || '';

    return {
      ...z,
      leftPer,
      topPer,
      widthPer,
      heightPer,
      link,
      title: z.title || `热区 ${idx + 1}`,
      type: z.type || 'other'
    };
  });

  if (hotzoneDialogRef.value) {
    hotzoneDialogRef.value.open({
      img: imgUrl,
      zoneInfo
    });
  }
}

// 热区绘制器变更回调
function handleChangeZone(zoneList) {
  if (!Array.isArray(zoneList)) return;
  props.options.zones = zoneList.map((z, idx) => {
    const leftVal = z.leftPer !== undefined ? z.leftPer * 100 : (z.left !== undefined ? z.left : 0);
    const topVal = z.topPer !== undefined ? z.topPer * 100 : (z.top !== undefined ? z.top : 0);
    const widthVal = z.widthPer !== undefined ? z.widthPer * 100 : (z.width !== undefined ? z.width : 20);
    const heightVal = z.heightPer !== undefined ? z.heightPer * 100 : (z.height !== undefined ? z.height : 20);
    const linkVal = z.link || z.url || '';
    const titleVal = z.title || `热区 ${idx + 1}`;

    return {
      ...z,
      title: titleVal,
      url: linkVal,
      link: linkVal,
      left: Math.round(leftVal * 10) / 10,
      top: Math.round(topVal * 10) / 10,
      width: Math.round(widthVal * 10) / 10,
      height: Math.round(heightVal * 10) / 10,
      type: z.type || 'other'
    };
  });
}

</script>

<style lang="scss" scoped>
.panel-hot-zone {
  .panel-section {
    margin-bottom: 20px;
    padding-bottom: 16px;
    border-bottom: 1px dashed #e2e8f0;

    .section-title {
      font-size: 13px;
      font-weight: 600;
      color: #0f172a;
      margin-bottom: 12px;

      &.flex-between {
        display: flex;
        justify-content: space-between;
        align-items: center;
      }
    }

    .form-item {
      display: flex;
      flex-direction: column;
      gap: 6px;

      .item-label {
        font-size: 12px;
        color: #475569;
      }
    }

    .input-with-action {
      display: flex;
      align-items: center;
      gap: 6px;

      .action-picker-btn {
        flex-shrink: 0;
        padding: 0 10px;
      }
    }

    .hotzone-preview-box {
      margin-top: 10px;
      border: 1px solid #cbd5e1;
      border-radius: 6px;
      overflow: hidden;
      background: #f8fafc;

      .img-preview {
        width: 100%;
        max-height: 140px;
        object-fit: cover;
        display: block;
      }

      .preview-actions-bar {
        display: flex;
        justify-content: flex-end;
        align-items: center;
        gap: 8px;
        padding: 6px 10px;
        background: #f1f5f9;
        border-top: 1px solid #e2e8f0;
      }
    }
  }

  .zones-list {
    display: flex;
    flex-direction: column;
    gap: 12px;

    .zone-card-item {
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      padding: 12px;
      transition: border-color 0.2s, box-shadow 0.2s;

      &:hover {
        border-color: #cbd5e1;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
      }

      .zone-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 10px;
        padding-bottom: 8px;
        border-bottom: 1px solid #edf2f7;

        .zone-idx-title {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 12px;
          font-weight: 600;
          color: #334155;

          .zone-num-badge {
            background: #409EFF;
            color: #ffffff;
            font-size: 10px;
            font-weight: 700;
            width: 16px;
            height: 16px;
            border-radius: 50%;
            display: inline-flex;
            align-items: center;
            justify-content: center;
          }
        }

        .zone-header-btns {
          display: flex;
          align-items: center;
          gap: 2px;
        }
      }

      .zone-body-inputs {
        display: flex;
        flex-direction: column;
        gap: 10px;

        .field-item {
          display: flex;
          flex-direction: column;
          gap: 4px;

          .field-lbl {
            font-size: 11px;
            font-weight: 500;
            color: #64748b;
          }
        }

        .link-picker-row {
          display: flex;
          align-items: center;
          gap: 6px;

          .link-prefix-icon {
            color: #94a3b8;
          }

          .action-picker-btn {
            flex-shrink: 0;
            padding: 0 10px;

            &.link-btn {
              background: #ecf5ff;
              border-color: #b3d8ff;
              color: #409EFF;

              &:hover {
                background: #409EFF;
                color: #ffffff;
              }
            }
          }
        }

        .link-current-tag {
          display: flex;
          align-items: center;
          gap: 4px;
          font-size: 11px;
          background: #eff6ff;
          border: 1px solid #dbeafe;
          border-radius: 4px;
          padding: 2px 8px;
          margin-top: 2px;
          overflow: hidden;

          .tag-label {
            color: #3b82f6;
            flex-shrink: 0;
            font-weight: 500;
          }

          .tag-val {
            color: #1e40af;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
            font-family: monospace;
          }
        }

        .coord-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 6px;

          .coord-cell {
            display: flex;
            align-items: center;
            gap: 4px;
            background: #ffffff;
            border: 1px solid #e2e8f0;
            border-radius: 4px;
            padding: 2px 6px;

            .coord-lbl {
              font-size: 11px;
              font-weight: 600;
              color: #64748b;
              flex-shrink: 0;
            }

            .coord-input {
              width: 100%;

              :deep(.el-input__wrapper) {
                padding: 0 2px;
                box-shadow: none !important;
              }

              :deep(.el-input__inner) {
                font-size: 11px;
                text-align: center;
              }
            }
          }
        }
      }
    }
  }

  .empty-zones-box {
    text-align: center;
    padding: 20px;
    color: #94a3b8;
    font-size: 12px;
    border: 1px dashed #cbd5e1;
    border-radius: 6px;
    background: #f8fafc;
  }

  .mr-4 {
    margin-right: 4px;
  }
}
</style>
