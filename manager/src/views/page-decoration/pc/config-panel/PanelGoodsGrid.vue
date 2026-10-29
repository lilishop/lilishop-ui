<template>
  <div class="panel-goods-grid">
    <!-- 1. 标题与更多设置 -->
    <div class="panel-section">
      <div class="section-title">宫格标题设置</div>
      <div class="form-item">
        <span class="item-label">主标题</span>
        <el-input v-model="options.title" size="small" placeholder="如：爆款热卖榜" clearable />
      </div>
      <div class="form-item">
        <span class="item-label">副标题</span>
        <el-input v-model="options.subtitle" size="small" placeholder="如：近30天爆卖好物精选" clearable />
      </div>
      <div class="form-item flex-row">
        <span class="item-label">展示查看更多</span>
        <el-switch v-model="options.showMoreLink" size="small" />
      </div>
      <template v-if="options.showMoreLink !== false">
        <div class="form-item">
          <span class="item-label">更多文案</span>
          <el-input v-model="options.moreText" size="small" placeholder="如：查看全部" clearable />
        </div>
        <div class="form-item">
          <span class="item-label">更多跳转链接</span>
          <div class="link-picker-wrap">
            <el-input
              v-model="options.moreUrl"
              size="small"
              placeholder="如：/goodsList 或专题页面"
              clearable
            >
              <template #prefix>
                <el-icon class="link-input-icon"><Link /></el-icon>
              </template>
            </el-input>
            <el-button
              type="primary"
              plain
              size="small"
              class="action-picker-btn link-btn"
              @click="handleSelectMoreLink"
            >
              <el-icon class="mr-4"><Link /></el-icon>
              <span>选择链接</span>
            </el-button>
          </div>
          <div class="link-current-tag" v-if="options.moreUrl">
            <span class="tag-label">当前链接:</span>
            <span class="tag-val" :title="options.moreUrl">{{ options.moreUrl }}</span>
            <el-icon class="url-clear-icon" title="清除链接" @click.stop="options.moreUrl = ''"><Close /></el-icon>
          </div>
        </div>
      </template>
    </div>

    <!-- 2. 宫格排版设置 (网格与列数) -->
    <div class="panel-section">
      <div class="section-title">宫格排版与线条</div>
      <div class="form-item flex-row">
        <span class="item-label">一行展示几个 (列数)</span>
        <el-radio-group v-model="options.columns" size="small">
          <el-radio-button :label="4">4 列</el-radio-button>
          <el-radio-button :label="5">5 列 (推荐)</el-radio-button>
          <el-radio-button :label="6">6 列</el-radio-button>
        </el-radio-group>
      </div>
      <div class="form-item flex-row">
        <span class="item-label">矩阵实线网格分割线</span>
        <el-switch v-model="options.showBorder" size="small" />
      </div>
    </div>

    <!-- 3. 商品列表与管理 -->
    <div class="panel-section">
      <div class="section-title flex-between">
        <span>宫格商品数据 ({{ options.goods?.length || 0 }} 件)</span>
        <div class="btn-group">
          <el-button v-if="options.goods?.length" link type="danger" size="small" @click="options.goods = []">
            清空
          </el-button>
          <el-button type="primary" size="small" @click="handleOpenGoodsPicker">
            选择商品
          </el-button>
          <el-button size="small" @click="handleAddCustomGoods">
            <el-icon class="mr-4"><Plus /></el-icon> 自定义加品
          </el-button>
        </div>
      </div>

      <div class="goods-grid-preview" v-if="options.goods?.length">
        <div v-for="(g, idx) in options.goods" :key="g.id || idx" class="grid-item-row">
          <span class="idx-badge">{{ idx + 1 }}</span>
          <div class="thumb-wrap-mini" @click="handleSelectGoodsThumb(g)" title="点击更换商品图片">
            <img :src="g.thumbnail || defaultThumb" class="g-thumb" alt="" />
            <div class="thumb-tip">换图</div>
          </div>
          <div class="g-info">
            <el-input
              v-model="g.goodsName"
              size="small"
              placeholder="商品名称"
              class="g-name-input"
            />
            <div class="g-meta-row">
              <div class="price-input-wrap">
                <span class="price-sym">￥</span>
                <el-input v-model="g.price" size="small" placeholder="价格" class="price-mini-input" />
              </div>
              <el-button
                link
                type="primary"
                size="small"
                @click="handleSelectGoodsLink(g)"
                :title="g.url || '设置跳转链接'"
              >
                <el-icon><Link /></el-icon>
                <span style="font-size: 11px; margin-left: 2px;">{{ g.url ? '已配链接' : '选链接' }}</span>
              </el-button>
            </div>
            <div class="item-url-badge" v-if="g.url">
              <span class="url-label">🔗</span>
              <span class="url-text" :title="g.url">{{ g.url }}</span>
              <el-icon class="url-clear-icon" title="清除链接" @click.stop="g.url = ''"><Close /></el-icon>
            </div>
          </div>
          <div class="action-btn-col">
            <el-button
              link
              size="small"
              :disabled="idx === 0"
              @click="handleMoveGoods(idx, -1)"
              title="上移"
            >
              <el-icon><Top /></el-icon>
            </el-button>
            <el-button
              link
              size="small"
              :disabled="idx === options.goods.length - 1"
              @click="handleMoveGoods(idx, 1)"
              title="下移"
            >
              <el-icon><Bottom /></el-icon>
            </el-button>
            <el-button link type="danger" size="small" @click="options.goods.splice(idx, 1)" title="删除">
              <el-icon><Delete /></el-icon>
            </el-button>
          </div>
        </div>
      </div>
      <div class="goods-empty-tip" v-else>
        <span>暂未选择商品，前台将展示推荐占位</span>
        <div class="empty-btn-row">
          <el-button type="primary" link size="small" @click="handleOpenGoodsPicker">
            + 从商品库选择
          </el-button>
          <el-button type="primary" link size="small" @click="handleAddCustomGoods">
            + 自定义加品
          </el-button>
        </div>
      </div>
    </div>

    <!-- 兜底商品选择弹窗（当未注入全局 openGoodsPicker 时生效） -->
    <el-dialog
      v-if="!openGoodsPicker && fallbackModal"
      v-model="fallbackModal"
      title="从商品库选择商品"
      width="1160px"
      append-to-body
      destroy-on-close
    >
      <goods-dialog
        :selectedWay="tempSelectedGoods"
        @selected="(val) => { tempSelectedGoods = val; }"
      />
      <template #footer>
        <el-button @click="fallbackModal = false">取消</el-button>
        <el-button type="primary" @click="confirmFallbackSelected">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, inject } from 'vue';
import { Delete, Link, Picture, Plus, Top, Bottom, Close } from '@element-plus/icons-vue';
import { ElMessageBox } from 'element-plus';
import GoodsDialog from '@/components/lili-dialog/goods-dialog.vue';

const props = defineProps({
  component: {
    type: Object,
    default: () => ({})
  },
  options: {
    type: Object,
    default: () => ({})
  }
});

const defaultThumb = 'https://lilishop-pc.oss-cn-beijing.aliyuncs.com/static/goods/goods_1.png';

// 注入来自 pc/index.vue 的全局选择器
const openImagePicker = inject('openImagePicker', null);
const openLinkPicker = inject('openLinkPicker', null);
const openGoodsPicker = inject('openGoodsPicker', null);

const fallbackModal = ref(false);
const tempSelectedGoods = ref([]);

// 1. 选择更多链接
function handleSelectMoreLink() {
  if (openLinkPicker) {
    openLinkPicker(({ url }) => {
      if (url) props.options.moreUrl = url;
    });
  } else {
    ElMessageBox.prompt('请输入“查看更多”跳转链接：', '设置更多链接', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      inputValue: props.options.moreUrl || '',
      inputPattern: /^\S+$/,
      inputErrorMessage: '链接不能为空'
    })
      .then(({ value }) => {
        props.options.moreUrl = value.trim();
      })
      .catch(() => {});
  }
}

// 2. 更换商品图片
function handleSelectGoodsThumb(g) {
  if (openImagePicker) {
    openImagePicker((url) => {
      if (url) g.thumbnail = url;
    });
  } else {
    ElMessageBox.prompt('请输入商品图片 URL 地址：', '更换商品图片', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      inputValue: g.thumbnail || '',
      inputPattern: /^\S+$/,
      inputErrorMessage: '图片地址不能为空'
    })
      .then(({ value }) => {
        g.thumbnail = value.trim();
      })
      .catch(() => {});
  }
}

// 3. 配置商品专属跳转链接
function handleSelectGoodsLink(g) {
  if (openLinkPicker) {
    openLinkPicker(({ url, title }) => {
      if (url) g.url = url;
      if (!g.goodsName && title) g.goodsName = title;
    });
  } else {
    ElMessageBox.prompt('请输入商品跳转链接（如 /goodsDetail?goodsId=xxx 或外部网址）：', '设置商品链接', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      inputValue: g.url || '',
      inputPattern: /^\S+$/,
      inputErrorMessage: '链接不能为空'
    })
      .then(({ value }) => {
        g.url = value.trim();
      })
      .catch(() => {});
  }
}

// 4. 自定义加品
function handleAddCustomGoods() {
  if (!Array.isArray(props.options.goods)) {
    props.options.goods = [];
  }
  const nextIdx = props.options.goods.length + 1;
  const newItem = {
    id: `custom_${Date.now()}_${nextIdx}`,
    goodsName: `爆款精选好物 ${nextIdx}`,
    price: '99.00',
    originalPrice: '199.00',
    thumbnail: defaultThumb,
    url: ''
  };
  props.options.goods.push(newItem);
  if (openImagePicker) {
    openImagePicker((url) => {
      if (url) newItem.thumbnail = url;
    });
  }
}

// 5. 排序调整
function handleMoveGoods(idx, direction) {
  const list = props.options.goods;
  const target = idx + direction;
  if (target < 0 || target >= list.length) return;
  const temp = list[idx];
  list[idx] = list[target];
  list[target] = temp;
}

// 6. 从商品库选择
function handleOpenGoodsPicker() {
  if (typeof openGoodsPicker === 'function') {
    openGoodsPicker((selectedGoods) => {
      applySelectedGoods(selectedGoods);
    }, props.options.goods || []);
  } else {
    tempSelectedGoods.value = Array.isArray(props.options.goods) ? [...props.options.goods] : [];
    fallbackModal.value = true;
  }
}

function confirmFallbackSelected() {
  applySelectedGoods(tempSelectedGoods.value);
  fallbackModal.value = false;
}

function applySelectedGoods(selectedGoods) {
  if (Array.isArray(selectedGoods)) {
    props.options.goods = selectedGoods.map(g => ({
      id: g.id || g.skuId || g.goodsId,
      goodsId: g.goodsId,
      goodsName: g.goodsName || g.name,
      price: g.price,
      originalPrice: g.originalPrice || g.price,
      thumbnail: g.thumbnail || g.pic || defaultThumb,
      url: g.url || ''
    }));
  }
}
</script>

<style lang="scss" scoped>
.panel-goods-grid {
  padding: 8px 4px;

  .panel-section {
    margin-bottom: 18px;
    padding-bottom: 14px;
    border-bottom: 1px dashed #e2e8f0;

    .section-title {
      font-size: 13px;
      font-weight: 600;
      color: #0f172a;
      margin-bottom: 10px;

      &.flex-between {
        display: flex;
        justify-content: space-between;
        align-items: center;
      }
    }

    .form-item {
      display: flex;
      flex-direction: column;
      gap: 5px;
      margin-bottom: 10px;

      &.flex-row {
        flex-direction: row;
        align-items: center;
        justify-content: space-between;
      }

      .item-label {
        font-size: 12px;
        color: #475569;
        font-weight: 500;
      }
    }
  }

  .mr-4 {
    margin-right: 4px;
  }

  .btn-group {
    display: flex;
    align-items: center;
    gap: 6px;
  }

  .link-picker-wrap {
    display: flex;
    align-items: center;
    gap: 6px;

    .link-input-icon {
      color: #94a3b8;
    }

    .action-picker-btn {
      flex-shrink: 0;
      padding: 0 10px;

      &.link-btn {
        background: #ecf5ff;
        border-color: #b3d8ff;
        color: #409eff;

        &:hover {
          background: #409eff;
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
    padding: 3px 8px;
    margin-top: 4px;
    overflow: hidden;

    .tag-label {
      color: #3b82f6;
      font-weight: 500;
      flex-shrink: 0;
    }

    .tag-val {
      color: #1e40af;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      flex: 1;
    }

    .url-clear-icon {
      font-size: 12px;
      color: #94a3b8;
      cursor: pointer;
      flex-shrink: 0;

      &:hover {
        color: #ef4444;
      }
    }
  }

  .goods-grid-preview {
    max-height: 380px;
    overflow-y: auto;
    display: flex;
    flex-direction: column;
    gap: 8px;

    .grid-item-row {
      display: flex;
      align-items: center;
      gap: 8px;
      background: #f8fafc;
      padding: 8px;
      border-radius: 6px;
      border: 1px solid #e2e8f0;
      transition: background 0.15s ease;

      &:hover {
        background: #f1f5f9;
      }

      .idx-badge {
        width: 18px;
        height: 18px;
        background: #e2e8f0;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 10px;
        font-weight: 700;
        color: #475569;
        flex-shrink: 0;
      }

      .thumb-wrap-mini {
        position: relative;
        width: 44px;
        height: 44px;
        border-radius: 4px;
        overflow: hidden;
        flex-shrink: 0;
        cursor: pointer;
        border: 1px solid #cbd5e1;

        .g-thumb {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
        }

        .thumb-tip {
          position: absolute;
          inset: 0;
          background: rgba(15, 23, 42, 0.7);
          color: #ffffff;
          font-size: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          opacity: 0;
          transition: opacity 0.2s;
        }

        &:hover .thumb-tip {
          opacity: 1;
        }
      }

      .g-info {
        flex: 1;
        min-width: 0;
        display: flex;
        flex-direction: column;
        gap: 4px;

        .g-name-input {
          :deep(.el-input__inner) {
            font-size: 12px;
            padding: 0 6px;
            height: 24px;
          }
        }

        .g-meta-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 6px;

          .price-input-wrap {
            display: flex;
            align-items: center;
            gap: 2px;
            font-size: 11px;
            color: #ef4444;
            font-weight: 600;

            .price-mini-input {
              width: 70px;
              :deep(.el-input__inner) {
                font-size: 11px;
                padding: 0 4px;
                height: 22px;
                color: #ef4444;
                font-weight: 600;
              }
            }
          }
        }

        .item-url-badge {
          display: flex;
          align-items: center;
          gap: 4px;
          font-size: 10px;
          background: #eff6ff;
          border: 1px solid #dbeafe;
          border-radius: 3px;
          padding: 2px 6px;
          color: #2563eb;

          .url-label {
            font-size: 10px;
            flex-shrink: 0;
          }

          .url-text {
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
            flex: 1;
          }

          .url-clear-icon {
            cursor: pointer;
            flex-shrink: 0;
            font-size: 11px;
            color: #94a3b8;

            &:hover {
              color: #ef4444;
            }
          }
        }
      }

      .action-btn-col {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 2px;
        flex-shrink: 0;

        .el-button {
          margin: 0;
          padding: 2px;
          height: auto;
          font-size: 12px;
        }
      }
    }
  }

  .goods-empty-tip {
    padding: 18px 12px;
    border: 1px dashed #cbd5e1;
    border-radius: 6px;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
    color: #94a3b8;
    font-size: 12px;
    background: #f8fafc;

    .empty-btn-row {
      display: flex;
      gap: 12px;
    }
  }
}
</style>
