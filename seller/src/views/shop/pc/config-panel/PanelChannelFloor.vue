<template>
  <div class="panel-channel-floor">
    <!-- 1. 标题区设置 -->
    <div class="panel-section">
      <div class="section-title">标题区设置</div>
      <div class="form-item flex-row">
        <span class="item-label">展示标题区</span>
        <el-switch v-model="options.showTitle" size="small" />
      </div>
      <template v-if="options.showTitle !== false">
        <div class="form-item">
          <span class="item-label">主标题</span>
          <el-input v-model="options.title" size="small" placeholder="如：场景频道" clearable />
        </div>
        <div class="form-item">
          <span class="item-label">副标题</span>
          <el-input v-model="options.subtitle" size="small" placeholder="如：主视觉 + 商品组合楼层" clearable />
        </div>
        <div class="form-item">
          <span class="item-label">“更多”跳转链接 (选填)</span>
          <div class="link-picker-wrap">
            <el-input
              v-model="options.moreUrl"
              size="small"
              placeholder="默认跟随主视觉链接，如 /goods"
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
          </div>
        </div>
      </template>
    </div>

    <!-- 2. 场景主视觉 (Hero Section) -->
    <div class="panel-section">
      <div class="section-title">场景主视觉</div>

      <!-- 主视觉图片 -->
      <div class="form-item">
        <span class="item-label">主视觉图片 (建议尺寸 520x560px)</span>
        <div class="picker-flex-wrap">
          <div
            class="thumb-preview-box"
            @click="handleSelectHeroImage"
            :title="options.heroImage ? '点击更换主视觉图片' : '点击选择图片'"
          >
            <template v-if="options.heroImage">
              <img :src="options.heroImage" alt="主视觉" class="preview-img" />
              <span class="thumb-clear-btn" @click.stop="options.heroImage = ''" title="清除图片">
                <el-icon><Close /></el-icon>
              </span>
            </template>
            <template v-else>
              <el-icon class="thumb-empty-icon"><Picture /></el-icon>
              <span class="thumb-empty-tip">选图</span>
            </template>
          </div>

          <div class="input-with-action flex-1">
            <el-input
              v-model="options.heroImage"
              size="small"
              placeholder="请输入或选择主视觉图片"
              clearable
            />
            <el-button
              size="small"
              class="action-picker-btn"
              @click="handleSelectHeroImage"
            >
              <el-icon class="mr-4"><Picture /></el-icon>
              <span>选择图片</span>
            </el-button>
          </div>
        </div>
      </div>

      <div class="form-item mt-10">
        <span class="item-label">主视觉大标题</span>
        <el-input v-model="options.heroTitle" size="small" placeholder="如：品质生活馆" clearable />
      </div>

      <div class="form-item">
        <span class="item-label">主视觉副标题</span>
        <el-input v-model="options.heroSubtitle" size="small" placeholder="如：精选场景好物，一站购齐" clearable />
      </div>

      <div class="form-item">
        <span class="item-label">行动按钮文案</span>
        <el-input v-model="options.heroButtonText" size="small" placeholder="如：进入频道" clearable />
      </div>

      <!-- 按钮跳转链接 -->
      <div class="form-item">
        <span class="item-label">按钮跳转链接</span>
        <div class="link-picker-wrap">
          <el-input
            v-model="options.heroHref"
            size="small"
            placeholder="如 /goods 或活动页面链接"
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
            @click="handleSelectHeroLink"
          >
            <el-icon class="mr-4"><Link /></el-icon>
            <span>选择链接</span>
          </el-button>
        </div>
        <div class="link-current-tag" v-if="options.heroHref">
          <span class="tag-label">当前链接:</span>
          <span class="tag-val" :title="options.heroHref">{{ options.heroHref }}</span>
        </div>
      </div>

      <div class="form-item flex-row mt-10">
        <span class="item-label">主视觉视觉风格</span>
        <el-radio-group v-model="options.heroStyle" size="small">
          <el-radio-button label="gradient">主题渐变</el-radio-button>
          <el-radio-button label="plain">简洁浅色</el-radio-button>
        </el-radio-group>
      </div>
    </div>

    <!-- 3. 活动入口 (Promos) -->
    <div class="panel-section">
      <div class="section-title flex-between">
        <span>专属活动入口 ({{ options.promos?.length || 0 }} 个)</span>
        <el-button link type="primary" size="small" @click="handleAddPromo">
          <el-icon><Plus /></el-icon> 添加活动
        </el-button>
      </div>

      <div class="promos-list-editor" v-if="Array.isArray(options.promos) && options.promos.length">
        <div v-for="(p, pIdx) in options.promos" :key="pIdx" class="promo-editor-card">
          <!-- 顶部标签与排序按钮 -->
          <div class="promo-card-header">
            <span class="promo-idx-badge">入口 {{ pIdx + 1 }}{{ p.title ? ` · ${p.title}` : '' }}</span>
            <div class="promo-actions">
              <el-button
                link
                size="small"
                :disabled="pIdx === 0"
                @click="movePromo(pIdx, -1)"
                title="上移"
              >
                <el-icon><Top /></el-icon>
              </el-button>
              <el-button
                link
                size="small"
                :disabled="pIdx === options.promos.length - 1"
                @click="movePromo(pIdx, 1)"
                title="下移"
              >
                <el-icon><Bottom /></el-icon>
              </el-button>
              <el-button
                link
                type="danger"
                size="small"
                @click="options.promos.splice(pIdx, 1)"
                title="删除入口"
              >
                <el-icon><Delete /></el-icon>
              </el-button>
            </div>
          </div>

          <!-- 属性输入 -->
          <div class="promo-row-1">
            <div class="sub-col" style="width: 100px;">
              <span class="micro-label">角标标签</span>
              <el-input v-model="p.tag" size="small" placeholder="限时/新品" clearable />
            </div>
            <div class="sub-col flex-1">
              <span class="micro-label">活动标题</span>
              <el-input v-model="p.title" size="small" placeholder="如：大牌补贴" clearable />
            </div>
          </div>

          <div class="promo-row-2 mt-6">
            <span class="micro-label">活动描述</span>
            <el-input v-model="p.desc" size="small" placeholder="如：领券最高减100" clearable />
          </div>

          <!-- 活动链接选择器 -->
          <div class="promo-row-3 mt-6">
            <span class="micro-label">跳转链接</span>
            <div class="link-picker-wrap">
              <el-input
                v-model="p.url"
                size="small"
                placeholder="如 /goods 或活动专题页"
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
                @click="handleSelectPromoLink(p)"
              >
                <el-icon class="mr-4"><Link /></el-icon>
                <span>选择链接</span>
              </el-button>
            </div>
            <div class="link-current-tag" v-if="p.url">
              <span class="tag-label">当前链接:</span>
              <span class="tag-val" :title="p.url">{{ p.url }}</span>
            </div>
          </div>
        </div>
      </div>
      <div class="empty-tip" v-else>
        暂无活动入口，点击右上角“添加活动”
      </div>
    </div>

    <!-- 4. 场景商品选择 -->
    <div class="panel-section">
      <div class="section-title flex-between">
        <span>场景商品位 ({{ options.goods?.length || 0 }} 件)</span>
        <div style="display: flex; gap: 8px;">
          <el-button v-if="options.goods?.length" link type="danger" size="small" @click="options.goods = []">清空</el-button>
          <el-button type="primary" size="small" @click="handleOpenGoodsPicker">选择商品</el-button>
        </div>
      </div>

      <div class="form-item flex-row">
        <span class="item-label">展示商品数量</span>
        <el-input-number v-model="options.goodsCount" :min="1" :max="8" size="small" controls-position="right" />
      </div>

      <div class="goods-list-preview" v-if="options.goods?.length">
        <div v-for="(g, idx) in options.goods" :key="g.id || idx" class="goods-item-row">
          <img :src="g.thumbnail || defaultThumb" class="g-thumb" alt="" />
          <div class="g-info">
            <span class="g-name">{{ g.goodsName }}</span>
            <span class="g-price">￥{{ g.price }}</span>
          </div>
          <el-button link type="danger" size="small" @click="options.goods.splice(idx, 1)">
            <el-icon><Delete /></el-icon>
          </el-button>
        </div>
      </div>
    </div>

    <!-- 商品选择弹窗 (兜底) -->
    <el-dialog
      v-if="!openGoodsPicker && showGoodsModal"
      v-model="showGoodsModal"
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
        <el-button @click="showGoodsModal = false">取消</el-button>
        <el-button type="primary" @click="confirmGoodsSelected">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, inject } from 'vue';
import GoodsDialog from '@/views/lili-dialog/goods-dialog.vue';
import { Plus, Delete, Link, Picture, Close, Top, Bottom } from '@element-plus/icons-vue';
import { ElMessageBox } from 'element-plus';

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
const showGoodsModal = ref(false);
const tempSelectedGoods = ref([]);

// 注入来自 pc/index.vue 的全局选择器
const openImagePicker = inject('openImagePicker', null);
const openLinkPicker = inject('openLinkPicker', null);
const openGoodsPicker = inject('openGoodsPicker', null);

// 默认值兜底
if (props.options.showTitle === undefined) props.options.showTitle = true;
if (!props.options.title) props.options.title = '场景频道';
if (!props.options.subtitle) props.options.subtitle = '主视觉 + 商品组合楼层';
if (!props.options.heroImage) props.options.heroImage = 'https://lilishop-pc.oss-cn-beijing.aliyuncs.com/static/banner-floor/floor_banner_1.png';
if (!props.options.heroTitle) props.options.heroTitle = '品质生活馆';
if (!props.options.heroSubtitle) props.options.heroSubtitle = '精选场景好物，一站购齐';
if (!props.options.heroButtonText) props.options.heroButtonText = '进入频道';
if (!props.options.heroHref) props.options.heroHref = '/goods';
if (!props.options.heroStyle) props.options.heroStyle = 'gradient';
if (!props.options.promos) {
  props.options.promos = [
    { title: '大牌补贴', desc: '领券最高减100', tag: '限时', url: '/goods' },
    { title: '新品驾到', desc: '官方正品首发', tag: '新品', url: '/goods' }
  ];
}
if (!props.options.goodsCount) props.options.goodsCount = 6;
if (!props.options.goods) {
  props.options.goods = [
    { id: '1', goodsName: '旗舰 5G 智能手机 12GB+256GB 超光影影像系统', price: '3999.00', originalPrice: '4599.00', thumbnail: 'https://lilishop-pc.oss-cn-beijing.aliyuncs.com/static/goods/goods_1.png' },
    { id: '2', goodsName: '无线头戴式深度主动降噪蓝牙耳机 空间音频Hi-Res', price: '1099.00', originalPrice: '1499.00', thumbnail: 'https://lilishop-pc.oss-cn-beijing.aliyuncs.com/static/goods/goods_2.png' },
    { id: '3', goodsName: '14英寸 全面屏轻薄商务笔记本电脑 酷睿i7 高刷防眩光', price: '5699.00', originalPrice: '6299.00', thumbnail: 'https://lilishop-pc.oss-cn-beijing.aliyuncs.com/static/goods/goods_3.png' },
    { id: '4', goodsName: '运动健康专业监测智能手表 心率血氧长续航50米防水', price: '899.00', originalPrice: '1199.00', thumbnail: 'https://lilishop-pc.oss-cn-beijing.aliyuncs.com/static/goods/goods_4.png' },
    { id: '5', goodsName: '意式半自动家用复古咖啡机 20Bar高压恒温萃取蒸汽奶泡', price: '899.00', originalPrice: '1280.00', thumbnail: 'https://lilishop-pc.oss-cn-beijing.aliyuncs.com/static/goods/goods_6.png' },
    { id: '6', goodsName: '奢宠酵母焕活修护精华露 50ml 紧致淡纹抗皱滋养', price: '680.00', originalPrice: '890.00', thumbnail: 'https://lilishop-pc.oss-cn-beijing.aliyuncs.com/static/goods/goods_5.png' }
  ];
}

// 1. 选择主视觉图片
function handleSelectHeroImage() {
  if (openImagePicker) {
    openImagePicker((url) => {
      if (url) props.options.heroImage = url;
    });
  } else {
    ElMessageBox.prompt('请输入主视觉图片 URL 地址：', '选择主视觉图片', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      inputValue: props.options.heroImage || '',
      inputPattern: /^\S+$/,
      inputErrorMessage: '图片地址不能为空'
    })
      .then(({ value }) => {
        props.options.heroImage = value.trim();
      })
      .catch(() => {});
  }
}

// 2. 选择主视觉按钮链接
function handleSelectHeroLink() {
  if (openLinkPicker) {
    openLinkPicker(({ url }) => {
      if (url) props.options.heroHref = url;
    });
  } else {
    ElMessageBox.prompt('请输入主视觉跳转链接（如 /goods 或活动网址）：', '设置主视觉链接', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      inputValue: props.options.heroHref || '',
      inputPattern: /^\S+$/,
      inputErrorMessage: '链接不能为空'
    })
      .then(({ value }) => {
        props.options.heroHref = value.trim();
      })
      .catch(() => {});
  }
}

// 3. 选择“探索更多”链接
function handleSelectMoreLink() {
  if (openLinkPicker) {
    openLinkPicker(({ url }) => {
      if (url) props.options.moreUrl = url;
    });
  } else {
    ElMessageBox.prompt('请输入“更多”跳转链接：', '设置更多跳转链接', {
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

// 4. 活动入口增删与排序
function handleAddPromo() {
  if (!Array.isArray(props.options.promos)) props.options.promos = [];
  props.options.promos.push({
    title: '热销特惠',
    desc: '全品类甄选底价',
    tag: '热卖',
    url: '/goods'
  });
}

function movePromo(index, step) {
  const target = index + step;
  if (target < 0 || target >= props.options.promos.length) return;
  const item = props.options.promos.splice(index, 1)[0];
  props.options.promos.splice(target, 0, item);
}

// 5. 选择活动入口链接
function handleSelectPromoLink(p) {
  if (openLinkPicker) {
    openLinkPicker(({ url, title }) => {
      if (url) p.url = url;
      if (!p.title && title) p.title = title;
    });
  } else {
    ElMessageBox.prompt('请输入活动入口跳转链接：', '设置活动链接', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      inputValue: p.url || '',
      inputPattern: /^\S+$/,
      inputErrorMessage: '链接不能为空'
    })
      .then(({ value }) => {
        p.url = value.trim();
      })
      .catch(() => {});
  }
}

// 6. 商品选择
function handleOpenGoodsPicker() {
  if (typeof openGoodsPicker === 'function') {
    openGoodsPicker((selectedGoods) => {
      applySelectedGoods(selectedGoods);
    }, props.options.goods || []);
  } else {
    tempSelectedGoods.value = Array.isArray(props.options.goods) ? [...props.options.goods] : [];
    showGoodsModal.value = true;
  }
}

function confirmGoodsSelected() {
  applySelectedGoods(tempSelectedGoods.value);
  showGoodsModal.value = false;
}

function applySelectedGoods(selectedGoods) {
  if (Array.isArray(selectedGoods)) {
    props.options.goods = selectedGoods.map(g => ({
      id: g.id || g.skuId || g.goodsId,
      goodsId: g.goodsId,
      goodsName: g.goodsName || g.name,
      price: g.price,
      originalPrice: g.originalPrice || g.price,
      thumbnail: g.thumbnail || g.pic || defaultThumb
    }));
  }
}
</script>

<style lang="scss" scoped>
.panel-channel-floor {
  padding: 8px 4px;

  .panel-section {
    margin-bottom: 18px;
    padding-bottom: 14px;
    border-bottom: 1px dashed #e2e8f0;

    &:last-child {
      border-bottom: none;
      margin-bottom: 0;
      padding-bottom: 0;
    }

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
        white-space: nowrap;
      }
    }
  }

  .mt-6 {
    margin-top: 6px;
  }

  .mt-10 {
    margin-top: 10px;
  }

  .mr-4 {
    margin-right: 4px;
  }

  .flex-1 {
    flex: 1;
  }

  .micro-label {
    font-size: 11px;
    color: #64748b;
    margin-bottom: 2px;
    display: block;
  }

  .picker-flex-wrap {
    display: flex;
    align-items: center;
    gap: 8px;

    .thumb-preview-box {
      position: relative;
      width: 58px;
      height: 40px;
      border-radius: 4px;
      border: 1px dashed #cbd5e1;
      background: #ffffff;
      cursor: pointer;
      overflow: hidden;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      transition: border-color 0.2s;

      &:hover {
        border-color: #409eff;
      }

      .preview-img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        display: block;
      }

      .thumb-empty-icon {
        font-size: 15px;
        color: #94a3b8;
      }

      .thumb-empty-tip {
        font-size: 10px;
        color: #94a3b8;
        line-height: 1;
        margin-top: 2px;
      }

      .thumb-clear-btn {
        position: absolute;
        top: 2px;
        right: 2px;
        background: rgba(0, 0, 0, 0.65);
        color: #ffffff;
        width: 14px;
        height: 14px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 10px;
        cursor: pointer;

        &:hover {
          background: #ef4444;
        }
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
    padding: 2px 8px;
    margin-top: 2px;
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
    }
  }

  .promos-list-editor {
    display: flex;
    flex-direction: column;
    gap: 10px;

    .promo-editor-card {
      background: #f8fafc;
      padding: 10px;
      border-radius: 8px;
      border: 1px solid #e2e8f0;

      .promo-card-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 8px;
        padding-bottom: 6px;
        border-bottom: 1px solid #edf2f7;

        .promo-idx-badge {
          font-size: 12px;
          font-weight: 600;
          color: #334155;
        }

        .promo-actions {
          display: flex;
          align-items: center;
          gap: 2px;
        }
      }

      .promo-row-1 {
        display: flex;
        gap: 8px;
      }
    }
  }

  .empty-tip {
    font-size: 12px;
    color: #94a3b8;
    text-align: center;
    padding: 16px 0;
  }

  .goods-list-preview {
    max-height: 200px;
    overflow-y: auto;
    display: flex;
    flex-direction: column;
    gap: 6px;
    margin-top: 8px;

    .goods-item-row {
      display: flex;
      align-items: center;
      gap: 8px;
      background: #f8fafc;
      padding: 6px 8px;
      border-radius: 6px;

      .g-thumb {
        width: 36px;
        height: 36px;
        border-radius: 4px;
        object-fit: cover;
      }

      .g-info {
        flex: 1;
        overflow: hidden;
        display: flex;
        flex-direction: column;

        .g-name {
          font-size: 12px;
          color: #1e293b;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .g-price {
          font-size: 11px;
          font-weight: 700;
          color: #e11d48;
        }
      }
    }
  }
}
</style>
