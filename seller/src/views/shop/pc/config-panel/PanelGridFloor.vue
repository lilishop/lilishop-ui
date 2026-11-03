<template>
  <div class="panel-grid-floor">
    <!-- 1. 楼层标题设置 (Floor Header) -->
    <div class="panel-section">
      <div class="section-title">楼层大标题设置</div>
      <div class="form-item flex-row">
        <span class="item-label">展示楼层标题</span>
        <el-switch v-model="options.showFloorTitle" size="small" />
      </div>
      <div class="form-row-2">
        <div class="form-item">
          <span class="item-label">楼层编号</span>
          <el-input v-model="options.floorNum" size="small" placeholder="如：1F" style="width: 90px;" clearable />
        </div>
        <div class="form-item flex-1">
          <span class="item-label">楼层名称</span>
          <el-input v-model="options.title" size="small" placeholder="如：潮流数码" clearable />
        </div>
      </div>
      <div class="form-item">
        <span class="item-label">英文/副标题</span>
        <el-input v-model="options.subtitle" size="small" placeholder="如：DIGITAL & TECH" clearable />
      </div>

      <!-- 更多链接选择器 -->
      <div class="form-item">
        <span class="item-label">“查看更多”跳转链接</span>
        <div class="link-picker-wrap">
          <el-input
            v-model="options.moreUrl"
            size="small"
            placeholder="如：/goodsList 或分类活动页面"
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
    </div>

    <!-- 2. 右侧子分类快捷标签 -->
    <div class="panel-section">
      <div class="section-title flex-between">
        <span>右侧分类标签</span>
        <el-button link type="primary" size="small" @click="handleAddTag">
          <el-icon><Plus /></el-icon> 添加标签
        </el-button>
      </div>
      <div class="tags-editor-wrap">
        <div v-for="(tag, tIdx) in options.subCategories" :key="tIdx" class="tag-edit-row">
          <el-input v-model="options.subCategories[tIdx]" size="small" placeholder="分类名称" clearable />
          <el-button link type="danger" size="small" @click="options.subCategories.splice(tIdx, 1)">
            <el-icon><Delete /></el-icon>
          </el-button>
        </div>
      </div>
    </div>

    <!-- 3. 左侧专属营销竖版海报 / 横幅 (横幅楼层 bannerFloor 与宫格楼层通用) -->
    <div class="panel-section">
      <div class="section-title">左侧营销海报 / 横幅设置</div>
      <div class="form-item flex-row">
        <span class="item-label">展示左侧海报横幅</span>
        <el-switch v-model="options.showPoster" size="small" />
      </div>
      <template v-if="options.showPoster !== false">
        <div class="form-item">
          <span class="item-label">海报横幅图片</span>
          <div class="picker-flex-wrap">
            <div
              class="thumb-preview-box"
              @click="handleSelectPosterImg"
              :title="currentPosterImg ? '点击更换海报' : '点击选择图片'"
            >
              <template v-if="currentPosterImg">
                <img :src="currentPosterImg" alt="海报" class="preview-img" />
                <span class="thumb-clear-btn" @click.stop="handleClearPosterImg" title="清除图片">
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
                v-model="currentPosterImg"
                size="small"
                placeholder="请输入或选择海报横幅图地址"
                clearable
              />
              <el-button
                size="small"
                class="action-picker-btn"
                @click="handleSelectPosterImg"
              >
                <el-icon class="mr-4"><Picture /></el-icon>
                <span>选择图片</span>
              </el-button>
            </div>
          </div>
        </div>

        <div class="form-item mt-10">
          <span class="item-label">海报主标题</span>
          <el-input v-model="options.posterTitle" size="small" placeholder="如：数码潮电 酷玩季" clearable />
        </div>
        <div class="form-item">
          <span class="item-label">海报副标题</span>
          <el-input v-model="options.posterSub" size="small" placeholder="如：领券最高立减 600 元" clearable />
        </div>

        <div class="form-item">
          <span class="item-label">海报跳转链接</span>
          <div class="link-picker-wrap">
            <el-input
              v-model="currentPosterUrl"
              size="small"
              placeholder="如：/goods 或活动专题"
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
              @click="handleSelectPosterLink"
            >
              <el-icon class="mr-4"><Link /></el-icon>
              <span>选择链接</span>
            </el-button>
          </div>
          <div class="link-current-tag" v-if="currentPosterUrl">
            <span class="tag-label">当前链接:</span>
            <span class="tag-val" :title="currentPosterUrl">{{ currentPosterUrl }}</span>
          </div>
        </div>
      </template>
    </div>

    <!-- 4. 右侧商品列数与排版 -->
    <div class="panel-section">
      <div class="section-title">右侧商品排版</div>
      <div class="form-item flex-row">
        <span class="item-label">单行展示列数</span>
        <el-radio-group v-model="options.columns" size="small">
          <el-radio-button :label="3">3 列</el-radio-button>
          <el-radio-button :label="4">4 列 (推荐)</el-radio-button>
          <el-radio-button :label="5">5 列</el-radio-button>
        </el-radio-group>
      </div>
    </div>

    <!-- 5. 楼层商品选择 -->
    <div class="panel-section">
      <div class="section-title flex-between">
        <span>楼层商品数据 ({{ options.goods?.length || 0 }} 件)</span>
        <div style="display: flex; gap: 8px;">
          <el-button v-if="options.goods?.length" link type="danger" size="small" @click="options.goods = []">清空</el-button>
          <el-button type="primary" size="small" @click="handleOpenGoodsPicker">选择商品</el-button>
        </div>
      </div>

      <div class="goods-list-preview" v-if="options.goods?.length">
        <div v-for="(g, idx) in options.goods" :key="g.id || idx" class="goods-item-row">
          <div class="thumb-wrap-mini" @click="handleSelectGoodsThumb(g)" title="点击更换商品图片">
            <img :src="g.thumbnail || defaultThumb" class="g-thumb" alt="" />
            <div class="thumb-tip">换图</div>
          </div>
          <div class="g-info">
            <span class="g-name" :title="g.goodsName">{{ g.goodsName }}</span>
            <div class="g-meta-row">
              <span class="g-price">￥{{ g.price }}</span>
              <el-button link type="primary" size="small" @click="handleSelectGoodsLink(g)" :title="g.url || '设置商品链接'">
                <el-icon><Link /></el-icon>
                <span style="font-size: 11px; margin-left: 2px;">{{ g.url ? '已配链接' : '选链接' }}</span>
              </el-button>
            </div>
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
import { ref, computed, inject } from 'vue';
import GoodsDialog from '@/views/lili-dialog/goods-dialog.vue';
import { Plus, Delete, Link, Picture, Close } from '@element-plus/icons-vue';
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

// 初始化缺省 options
if (props.options.showFloorTitle === undefined) props.options.showFloorTitle = true;
if (!props.options.floorNum) props.options.floorNum = '1F';
if (!props.options.title) props.options.title = '潮流数码';
if (!props.options.subtitle) props.options.subtitle = 'DIGITAL & TECH';
if (!props.options.subCategories) {
  props.options.subCategories = ['旗舰手机', '轻薄笔电', '降噪耳机', '智能穿戴', '数码配件'];
}

// 兼容 bannerFloor 与 gridFloor 的字段名双向打通
const currentPosterImg = computed({
  get() {
    return props.options.bannerImg || props.options.posterImg || 'https://lilishop-pc.oss-cn-beijing.aliyuncs.com/static/banner-floor/floor_banner_1.png';
  },
  set(val) {
    props.options.posterImg = val;
    props.options.bannerImg = val;
  }
});

const currentPosterUrl = computed({
  get() {
    return props.options.bannerUrl || props.options.posterUrl || '';
  },
  set(val) {
    props.options.posterUrl = val;
    props.options.bannerUrl = val;
  }
});

function handleClearPosterImg() {
  props.options.posterImg = '';
  props.options.bannerImg = '';
}

if (!props.options.posterTitle) props.options.posterTitle = '数码潮电 酷玩季';
if (!props.options.posterSub) props.options.posterSub = '领券最高立减 600 元';
if (!props.options.columns) props.options.columns = 4;
if (!props.options.goods) {
  props.options.goods = [
    { id: '101', goodsName: '旗舰 5G 智能手机 12GB+256GB 超光影影像系统', price: '3999.00', originalPrice: '4599.00', thumbnail: 'https://lilishop-pc.oss-cn-beijing.aliyuncs.com/static/goods/goods_1.png' },
    { id: '102', goodsName: '无线头戴式深度主动降噪蓝牙耳机 空间音频Hi-Res', price: '1099.00', originalPrice: '1499.00', thumbnail: 'https://lilishop-pc.oss-cn-beijing.aliyuncs.com/static/goods/goods_2.png' },
    { id: '103', goodsName: '14英寸 全面屏轻薄商务笔记本电脑 酷睿i7 高刷防眩光', price: '5699.00', originalPrice: '6299.00', thumbnail: 'https://lilishop-pc.oss-cn-beijing.aliyuncs.com/static/goods/goods_3.png' },
    { id: '104', goodsName: '运动健康专业监测智能手表 心率血氧长续航50米防水', price: '899.00', originalPrice: '1199.00', thumbnail: 'https://lilishop-pc.oss-cn-beijing.aliyuncs.com/static/goods/goods_4.png' },
    { id: '105', goodsName: '奢宠酵母焕活修护精华露 50ml 紧致淡纹抗皱滋养', price: '680.00', originalPrice: '890.00', thumbnail: 'https://lilishop-pc.oss-cn-beijing.aliyuncs.com/static/goods/goods_5.png' },
    { id: '106', goodsName: '意式半自动家用复古咖啡机 20Bar高压恒温萃取蒸汽奶泡', price: '899.00', originalPrice: '1280.00', thumbnail: 'https://lilishop-pc.oss-cn-beijing.aliyuncs.com/static/goods/goods_6.png' },
    { id: '107', goodsName: '碳板专业竞速轻量缓震跑步鞋 透气防滑男女同款潮鞋', price: '459.00', originalPrice: '699.00', thumbnail: 'https://lilishop-pc.oss-cn-beijing.aliyuncs.com/static/goods/goods_7.png' },
    { id: '108', goodsName: '极简静音无雾负离子香薰加湿器 大容量客厅卧室通用', price: '299.00', originalPrice: '399.00', thumbnail: 'https://lilishop-pc.oss-cn-beijing.aliyuncs.com/static/goods/goods_8.png' }
  ];
}

function handleAddTag() {
  if (!Array.isArray(props.options.subCategories)) {
    props.options.subCategories = [];
  }
  props.options.subCategories.push('新标签');
}

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

// 2. 选择海报横幅图片
function handleSelectPosterImg() {
  if (openImagePicker) {
    openImagePicker((url) => {
      if (url) {
        currentPosterImg.value = url;
      }
    });
  } else {
    ElMessageBox.prompt('请输入海报图片 URL 地址：', '选择海报图片', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      inputValue: currentPosterImg.value || '',
      inputPattern: /^\S+$/,
      inputErrorMessage: '图片地址不能为空'
    })
      .then(({ value }) => {
        currentPosterImg.value = value.trim();
      })
      .catch(() => {});
  }
}

// 3. 选择海报跳转链接
function handleSelectPosterLink() {
  if (openLinkPicker) {
    openLinkPicker(({ url }) => {
      if (url) {
        currentPosterUrl.value = url;
      }
    });
  } else {
    ElMessageBox.prompt('请输入海报跳转链接：', '设置海报链接', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      inputValue: currentPosterUrl.value || '',
      inputPattern: /^\S+$/,
      inputErrorMessage: '链接不能为空'
    })
      .then(({ value }) => {
        currentPosterUrl.value = value.trim();
      })
      .catch(() => {});
  }
}

// 4. 更换单个商品图片
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

// 5. 配置商品专属链接
function handleSelectGoodsLink(g) {
  if (openLinkPicker) {
    openLinkPicker(({ url, title }) => {
      if (url) g.url = url;
      if (!g.goodsName && title) g.goodsName = title;
    });
  } else {
    ElMessageBox.prompt('请输入商品跳转链接（如 /goodsDetail?goodsId=xxx）：', '设置商品链接', {
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
      thumbnail: g.thumbnail || g.pic || defaultThumb,
      url: g.url || ''
    }));
  }
}
</script>

<style lang="scss" scoped>
.panel-grid-floor {
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

    .form-row-2 {
      display: flex;
      gap: 8px;
    }

    .tags-editor-wrap {
      display: flex;
      flex-direction: column;
      gap: 6px;

      .tag-edit-row {
        display: flex;
        align-items: center;
        gap: 6px;
      }
    }
  }

  .mr-4 {
    margin-right: 4px;
  }

  .mt-10 {
    margin-top: 10px;
  }

  .flex-1 {
    flex: 1;
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
    }
  }

  .goods-list-preview {
    max-height: 260px;
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
      border: 1px solid #e2e8f0;

      .thumb-wrap-mini {
        position: relative;
        width: 38px;
        height: 38px;
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
        overflow: hidden;
        display: flex;
        flex-direction: column;
        gap: 2px;

        .g-name {
          font-size: 12px;
          color: #1e293b;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .g-meta-row {
          display: flex;
          align-items: center;
          justify-content: space-between;

          .g-price {
            font-size: 11px;
            font-weight: 700;
            color: #e11d48;
          }
        }
      }
    }
  }
}
</style>
