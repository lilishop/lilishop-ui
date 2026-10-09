<template>
  <div class="theme-setting">
    <div class="config-panel">
      <el-card shadow="never" class="config-card">
        <template #header>
          <div class="card-header">
            <span>主题色系</span>
            <span class="desc">配置买家端 PC 与移动端（小程序）的主题色，保存后前台自动生效</span>
          </div>
        </template>

        <!-- 系统预设色系（始终展示，选中即切为系统模式） -->
        <div class="mode-section">
          <el-radio v-model="form.mode" label="system">系统</el-radio>
          <div class="preset-list" @click="form.mode = 'system'">
            <div
              v-for="(item, index) in presetThemes"
              :key="index"
              class="preset-item"
              :class="{ active: form.mode === 'system' && isActivePreset(item) }"
              @click="selectPreset(item)"
            >
              <span class="swatch" :style="{ background: item.themeColor }"></span>
              <span class="swatch" :style="{ background: item.aiderLightColor }"></span>
              <span class="swatch pale" :style="{ background: item.paleColor }"></span>
            </div>
          </div>
        </div>

        <!-- 自定义色系（始终展示，修改即切为自定义模式） -->
        <div class="mode-section">
          <el-radio v-model="form.mode" label="custom">自定义</el-radio>
          <div class="custom-form" @click="form.mode = 'custom'">
            <div class="color-row">
              <span class="color-label">主题色:</span>
              <div class="color-box">
                <el-color-picker v-model="form.themeColor" @change="form.mode = 'custom'" />
                <span class="color-value">{{ form.themeColor }}</span>
              </div>
            </div>
            <div class="color-row">
              <span class="color-label">辅助色:</span>
              <div class="color-box">
                <el-color-picker v-model="form.aiderLightColor" @change="form.mode = 'custom'" />
                <span class="color-value">{{ form.aiderLightColor }}</span>
              </div>
              <el-tooltip
                content="辅助色和主题色组成渐变色，用于按钮、卡片、标签、进度条等元素背景"
                placement="top"
              >
                <el-icon class="help-icon"><QuestionFilled /></el-icon>
              </el-tooltip>
            </div>
          </div>
        </div>
      </el-card>

      <div class="footer">
        <el-button type="primary" :loading="saveLoading" @click="submit">保存</el-button>
      </div>
    </div>

    <!-- 移动端真实页面预览（结构对齐 lilishop-uniapp） -->
    <div class="preview-panel">
      <!-- 商品详情 pages/product/goods.vue -->
      <div class="phone">
        <div class="p-status">
          <span class="p-time">9:41 AM</span>
          <span class="p-icons"><i class="signal"></i><i class="wifi"></i><i class="battery"></i></span>
        </div>
        <div class="p-nav">
          <span class="p-back">‹</span>
          <span class="p-title">商品详情</span>
          <span class="p-capsule">··· ⊙</span>
        </div>
        <div class="p-body">
          <div class="g-img"><span class="g-img-emoji">👜</span></div>
          <div class="g-seckill" :style="{ background: gradient }">
            <span class="g-seckill-name">秒杀</span>
            <span class="g-seckill-count">距离结束还剩 <i>02</i>:<i>24</i>:<i>59</i></span>
          </div>
          <div class="g-main">
            <div class="g-price-row">
              <span class="g-price" :style="{ color: form.themeColor }">¥299.00</span>
              <s class="g-price-origin">¥300.00</s>
              <span class="g-fav">♡ 收藏</span>
            </div>
            <div class="g-progress">
              <span class="g-progress-text">已抢 82%</span>
              <div class="g-progress-track">
                <div class="g-progress-inner" :style="{ width: '82%', background: gradient }"></div>
              </div>
            </div>
            <div class="g-name">现代简约北欧风格客厅装饰画沙发背景墙创意玄关挂画组合</div>
            <div class="g-sub">软饰焕新颜，尊享优惠双重叠加</div>
          </div>
        </div>
        <div class="p-tabbar goods-bar">
          <div class="bar-icons">
            <div class="bar-icon">
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="#666" stroke-width="1.6"><path d="M4 12a8 8 0 0 1 16 0"/><rect x="2" y="12" width="4" height="6" rx="2"/><rect x="18" y="12" width="4" height="6" rx="2"/></svg>
              <span>客服</span>
            </div>
            <div class="bar-icon">
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="#666" stroke-width="1.6"><path d="M4 9l1-4h14l1 4"/><path d="M4 9h16v11H4z"/><path d="M9 20v-6h6v6"/></svg>
              <span>店铺</span>
            </div>
            <div class="bar-icon">
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="#666" stroke-width="1.6"><circle cx="9" cy="20" r="1.6"/><circle cx="18" cy="20" r="1.6"/><path d="M2 3h3l2.5 12h11l2-8H6"/></svg>
              <span>购物车</span>
            </div>
          </div>
          <span class="bar-btn outline" :style="{ color: form.themeColor, borderColor: form.themeColor }">加入购物车</span>
          <span class="bar-btn solid" :style="{ background: gradient }">立即购买</span>
        </div>
      </div>

      <!-- 规格弹层 pages/product/goods.vue SKU 弹窗 -->
      <div class="phone">
        <div class="p-status">
          <span class="p-time">9:41 AM</span>
          <span class="p-icons"><i class="signal"></i><i class="wifi"></i><i class="battery"></i></span>
        </div>
        <div class="p-nav">
          <span class="p-back">‹</span>
          <span class="p-title">商品详情</span>
          <span class="p-capsule">··· ⊙</span>
        </div>
        <div class="p-body sku-mask">
          <div class="sku-popup">
            <span class="sku-close">✕</span>
            <div class="sku-head">
              <div class="sku-thumb">👜</div>
              <div>
                <div class="sku-price">
                  <span class="g-price" :style="{ color: form.themeColor }">¥299.00</span>
                  <s class="g-price-origin">¥300.00</s>
                </div>
                <div class="sku-tags">
                  <span class="mini-tag" :style="outlineTagStyle">满减</span>
                  <span class="mini-tag" :style="outlineTagStyle">券</span>
                </div>
              </div>
            </div>
            <div class="sku-title">颜色</div>
            <div class="sku-list">
              <span class="sku-item selected" :style="tagStyle">印象简约</span>
              <span class="sku-item">时空印记</span>
              <span class="sku-item">六月物语</span>
              <span class="sku-item">远山如黛</span>
            </div>
            <div class="sku-title">包装</div>
            <div class="sku-list">
              <span class="sku-item">极简装</span>
              <span class="sku-item selected" :style="tagStyle">简装</span>
              <span class="sku-item">定制</span>
            </div>
            <div class="sku-title">尺码</div>
            <div class="sku-list">
              <span class="sku-item selected" :style="tagStyle">50*70</span>
              <span class="sku-item">60*80</span>
              <span class="sku-item">80*120</span>
            </div>
            <div class="sku-count">
              <span>数量 <i class="sku-stock">库存999个</i></span>
              <span class="stepper"><i>−</i> 1 <i>＋</i></span>
            </div>
            <div class="sku-confirm" :style="{ background: gradient }">加入购物车</div>
          </div>
        </div>
      </div>

      <!-- 确认订单 pages/order/fillorder.vue -->
      <div class="phone">
        <div class="p-status">
          <span class="p-time">9:41 AM</span>
          <span class="p-icons"><i class="signal"></i><i class="wifi"></i><i class="battery"></i></span>
        </div>
        <div class="p-nav">
          <span class="p-back">‹</span>
          <span class="p-title">确认订单</span>
          <span class="p-capsule">··· ⊙</span>
        </div>
        <div class="p-body order-body">
          <div class="o-card o-addr-card">
            <div class="o-addr-name">王同学 138****9988</div>
            <div class="o-addr">北京市海淀区五道口AI原点社区</div>
          </div>
          <div class="o-card">
            <div class="o-store">
              <span class="mini-tag" :style="outlineTagStyle">自营</span>小清新自营旗舰店
            </div>
            <div class="o-reduce">
              <span class="mini-tag" :style="outlineTagStyle">满减</span>您已满足满2000减168
            </div>
            <div class="o-goods">
              <div class="sku-thumb">👜</div>
              <div class="sku-thumb">🛋️</div>
              <div class="o-goods-more">2 ›</div>
            </div>
            <div class="o-row"><span>发票信息</span><span class="o-muted">不需要发票 ›</span></div>
            <div class="o-row"><span>订单备注</span><span class="o-muted">点击输入，100字以内</span></div>
            <div class="o-row"><span>订单附件</span><span class="o-muted">上传图片 ＋</span></div>
            <div class="o-row"><span>订单金额</span><span class="o-amount" :style="{ color: form.themeColor }">¥707.00</span></div>
            <div class="o-row"><span>商品金额</span><span>¥707.00</span></div>
            <div class="o-row"><span>配送费用</span><span>¥0.00</span></div>
          </div>
          <div class="o-card">
            <div class="o-row"><span>支付/配送</span><span>在线支付/快递配送 ··›</span></div>
            <div class="o-row">
              <span>使用优惠券 <i class="o-coupon" :style="{ color: form.themeColor }">2张可用</i></span>
              <span>¥0.00 ··›</span>
            </div>
          </div>
        </div>
        <div class="p-tabbar order-bar">
          <span class="o-total">合计: <i :style="{ color: form.themeColor }">¥707.00</i></span>
          <span class="bar-btn solid" :style="{ background: gradient }">提交订单</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { getSetting, setSetting } from "@/api/index";
import { QuestionFilled } from "@element-plus/icons-vue";

const SETTING_KEY = "THEME_SETTING";

/** 系统预设主题色系：主题色 + 辅助色 + 浅底色（展示用三色块） */
const PRESET_THEMES = [
  { themeColor: "#FF6600", aiderLightColor: "#FF8533", paleColor: "#FFF1E8" },
  { themeColor: "#F7B500", aiderLightColor: "#FAD961", paleColor: "#FFF8E1" },
  { themeColor: "#13C2C2", aiderLightColor: "#36CFC9", paleColor: "#E6FFFB" },
  { themeColor: "#07C160", aiderLightColor: "#4BD88A", paleColor: "#E8F9F0" },
  { themeColor: "#2B85E4", aiderLightColor: "#5CA8FF", paleColor: "#E8F3FF" },
  { themeColor: "#722ED1", aiderLightColor: "#9254DE", paleColor: "#F5EEFF" },
  { themeColor: "#FF4D94", aiderLightColor: "#FF85B3", paleColor: "#FFEAF3" },
  { themeColor: "#F5222D", aiderLightColor: "#FF4D4F", paleColor: "#FFECE8" },
  { themeColor: "#F5C10B", aiderLightColor: "#D4A017", paleColor: "#000000" },
  { themeColor: "#000000", aiderLightColor: "#434343", paleColor: "#F5F5F5" },
];

export default {
  name: "theme-setting",
  components: { QuestionFilled },
  data() {
    return {
      loading: false,
      saveLoading: false,
      presetThemes: PRESET_THEMES,
      form: {
        mode: "custom",
        themeColor: "#ff3c2a",
        aiderLightColor: "#ff9f28",
      },
    };
  },
  computed: {
    // 与移动端一致：提交订单等按钮为 主题色(91deg)→辅助色 渐变
    // 见 lilishop-uniapp/pages/order/fillorder.vue .tabbar-right
    gradient() {
      return `linear-gradient(91deg, ${this.form.themeColor} 1%, ${this.form.aiderLightColor} 99%)`;
    },
    // 与移动端 --theme-primary-10 一致：主题色 10% 透明度浅底
    tint() {
      const hex = this.form.themeColor.replace("#", "");
      if (hex.length !== 6) return "rgba(0,0,0,0.04)";
      const r = parseInt(hex.slice(0, 2), 16);
      const g = parseInt(hex.slice(2, 4), 16);
      const b = parseInt(hex.slice(4, 6), 16);
      return `rgba(${r}, ${g}, ${b}, 0.1)`;
    },
    // 标签 / 规格选中态：主题色文字 + 主题色描边 + 10% 浅底
    tagStyle() {
      return {
        color: this.form.themeColor,
        borderColor: this.form.themeColor,
        background: this.tint,
      };
    },
    // 小标签（满减/券/自营）：白底 + 主题色描边
    outlineTagStyle() {
      return {
        color: this.form.themeColor,
        borderColor: this.form.themeColor,
        background: "#fff",
      };
    },
  },
  mounted() {
    this.loadSetting();
  },
  methods: {
    isActivePreset(item) {
      return (
        this.form.themeColor.toLowerCase() === item.themeColor.toLowerCase() &&
        this.form.aiderLightColor.toLowerCase() === item.aiderLightColor.toLowerCase()
      );
    },
    selectPreset(item) {
      this.form.themeColor = item.themeColor;
      this.form.aiderLightColor = item.aiderLightColor;
    },
    loadSetting() {
      this.loading = true;
      getSetting(SETTING_KEY)
        .then((res) => {
          if (res.success && res.result) {
            const data = res.result;
            this.form = {
              mode: data.mode || "custom",
              themeColor: data.themeColor || this.form.themeColor,
              aiderLightColor: data.aiderLightColor || this.form.aiderLightColor,
            };
          }
        })
        .finally(() => {
          this.loading = false;
        });
    },
    submit() {
      if (!this.form.themeColor || !this.form.aiderLightColor) {
        this.$Message.error("请选择主题色和辅助色");
        return;
      }
      this.saveLoading = true;
      // lightColor（价格文字、进度条高亮）与主题色保持一致
      const payload = {
        mode: this.form.mode,
        themeColor: this.form.themeColor,
        lightColor: this.form.themeColor,
        aiderLightColor: this.form.aiderLightColor,
      };
      setSetting(SETTING_KEY, payload)
        .then((res) => {
          if (res.success) {
            this.$Message.success("保存成功");
          } else {
            this.$Message.error("保存失败");
          }
        })
        .finally(() => {
          this.saveLoading = false;
        });
    },
  },
};
</script>

<style scoped lang="scss">
.theme-setting {
  display: flex;
  gap: 24px;
  align-items: flex-start;

  .config-panel {
    width: 380px;
    flex-shrink: 0;
  }

  .config-card {
    border-radius: 8px;
  }

  .card-header {
    display: flex;
    flex-direction: column;
    gap: 4px;

    .desc {
      font-size: 12px;
      color: #999;
      font-weight: normal;
    }
  }

  .mode-section {
    margin-bottom: 28px;

    &:last-of-type {
      margin-bottom: 0;
    }
  }

  .preset-list {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 14px 12px;
    margin-top: 16px;
  }

  .preset-item {
    display: flex;
    cursor: pointer;
    padding: 3px;
    border: 1px solid transparent;
    border-radius: 6px;
    transition: border-color 0.2s, box-shadow 0.2s;

    &.active {
      border-color: var(--el-color-primary);
      box-shadow: 0 0 0 1px var(--el-color-primary);
    }

    .swatch {
      flex: 1;
      height: 26px;

      &:first-child {
        border-radius: 4px 0 0 4px;
      }

      &:last-child {
        border-radius: 0 4px 4px 0;
      }

      &.pale {
        border: 1px solid #f0f0f0;
        border-left: none;
      }
    }
  }

  .custom-form {
    margin-top: 16px;

    .color-row {
      display: flex;
      align-items: center;
      margin-bottom: 16px;

      &:last-child {
        margin-bottom: 0;
      }
    }

    .color-label {
      width: 56px;
      color: #333;
      flex-shrink: 0;
    }

    .color-box {
      display: flex;
      align-items: center;
      gap: 10px;
      background: #f7f8fa;
      border-radius: 6px;
      padding: 4px 12px;
    }

    .color-value {
      color: #666;
      font-size: 13px;
    }

    .help-icon {
      margin-left: 8px;
      color: #bbb;
      cursor: pointer;
    }
  }

  .footer {
    margin-top: 16px;
  }
}

/* 移动端真实页面预览 */
.preview-panel {
  display: flex;
  gap: 28px;
  flex: 1;
  justify-content: flex-start;
  padding: 8px 0 24px;

  .phone {
    width: 300px;
    height: 640px;
    background: #f7f8fa;
    border-radius: 24px;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    font-size: 13px;
    color: #303133;
    box-shadow: 0 8px 28px rgba(0, 0, 0, 0.1);
    border: 1px solid #eee;
  }

  /* 状态栏 */
  .p-status {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 8px 16px 4px;
    font-size: 11px;
    color: #333;
    background: #fff;
    flex-shrink: 0;

    .p-icons {
      display: inline-flex;
      align-items: center;
      gap: 5px;

      .signal {
        width: 13px;
        height: 9px;
        clip-path: polygon(0 100%, 0 60%, 20% 60%, 20% 100%, 30% 100%, 30% 40%, 45% 40%, 45% 100%, 55% 100%, 55% 20%, 70% 20%, 70% 100%, 80% 100%, 80% 0, 95% 0, 95% 100%);
        background: #333;
      }

      .wifi {
        width: 11px;
        height: 8px;
        border: 1.5px solid #333;
        border-bottom: none;
        border-left: none;
        border-right: none;
        border-radius: 9px 9px 0 0;
      }

      .battery {
        width: 17px;
        height: 9px;
        border: 1px solid #333;
        border-radius: 2px;
        position: relative;

        &::after {
          content: "";
          position: absolute;
          inset: 1px;
          right: 3px;
          background: #333;
          border-radius: 1px;
        }
      }
    }
  }

  /* 导航栏 */
  .p-nav {
    position: relative;
    height: 42px;
    line-height: 42px;
    text-align: center;
    background: #fff;
    flex-shrink: 0;

    .p-title {
      font-size: 14px;
      font-weight: 500;
    }

    .p-back {
      position: absolute;
      left: 12px;
      font-size: 20px;
      color: #333;
      line-height: 42px;
    }

    .p-capsule {
      position: absolute;
      right: 12px;
      top: 9px;
      height: 24px;
      line-height: 24px;
      padding: 0 12px;
      border: 1px solid #ececec;
      border-radius: 12px;
      font-size: 11px;
      color: #333;
      letter-spacing: 1px;
    }
  }

  .p-body {
    flex: 1;
    overflow: hidden;
    display: flex;
    flex-direction: column;
  }

  .p-tabbar {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 10px 12px;
    background: #fff;
    border-top: 1px solid #f2f2f2;
    flex-shrink: 0;
  }

  /* ===== 商品详情 ===== */
  .g-img {
    height: 240px;
    background: linear-gradient(160deg, #f3ede7 0%, #e9ddd2 100%);
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;

    .g-img-emoji {
      font-size: 84px;
    }
  }

  .g-seckill {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 10px 14px;
    color: #fff;
    flex-shrink: 0;

    .g-seckill-name {
      font-size: 19px;
      font-weight: bold;
      font-style: italic;
    }

    .g-seckill-count {
      font-size: 10px;

      i {
        font-style: normal;
        background: rgba(255, 255, 255, 0.92);
        color: #333;
        border-radius: 3px;
        padding: 1px 4px;
        margin: 0 1px;
      }
    }
  }

  .g-main {
    background: #fff;
    flex: 1;
    padding: 10px 14px;
  }

  .g-price-row {
    display: flex;
    align-items: baseline;

    .g-price {
      font-size: 20px;
      font-weight: bold;
    }

    .g-price-origin {
      font-size: 11px;
      color: #bbb;
      margin-left: 6px;
    }

    .g-fav {
      margin-left: auto;
      font-size: 11px;
      color: #999;
    }
  }

  .g-progress {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-top: 6px;

    .g-progress-text {
      font-size: 10px;
      color: #999;
      white-space: nowrap;
    }

    .g-progress-track {
      flex: 1;
      height: 6px;
      background: #f0f0f0;
      border-radius: 3px;
      overflow: hidden;

      .g-progress-inner {
        height: 100%;
        border-radius: 3px;
      }
    }
  }

  .g-name {
    margin-top: 8px;
    font-size: 13px;
    font-weight: 600;
    line-height: 1.5;
  }

  .g-sub {
    margin-top: 2px;
    font-size: 11px;
    color: #999;
  }

  .goods-bar .bar-icons {
    display: flex;
    gap: 14px;

    .bar-icon {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 1px;

      span {
        font-size: 9px;
        color: #666;
      }
    }
  }

  .bar-btn {
    flex: 1;
    text-align: center;
    font-size: 13px;
    padding: 9px 0;
    border-radius: 18px;
    color: #fff;

    &.outline {
      border: 1px solid;
      background: #fff;
    }
  }

  /* ===== 规格弹层 ===== */
  .sku-mask {
    background: rgba(0, 0, 0, 0.45);
    justify-content: flex-end;
  }

  .sku-popup {
    position: relative;
    background: #fff;
    border-radius: 16px 16px 0 0;
    padding: 14px;
  }

  .sku-close {
    position: absolute;
    right: 12px;
    top: 10px;
    color: #999;
    font-size: 13px;
  }

  .sku-head {
    display: flex;
    gap: 10px;

    .sku-price {
      display: flex;
      align-items: baseline;
    }

    .sku-tags {
      margin-top: 5px;
    }
  }

  .sku-thumb {
    width: 64px;
    height: 64px;
    background: linear-gradient(160deg, #f3ede7 0%, #e9ddd2 100%);
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 30px;
    flex-shrink: 0;
  }

  .mini-tag {
    display: inline-block;
    font-size: 10px;
    padding: 0 6px;
    line-height: 17px;
    border-radius: 3px;
    border: 1px solid;
    margin-right: 5px;
  }

  .sku-title {
    font-size: 13px;
    color: #333;
    margin: 14px 0 8px;
  }

  .sku-list {
    display: flex;
    flex-wrap: wrap;
    gap: 9px;
  }

  .sku-item {
    font-size: 12px;
    padding: 5px 14px;
    border-radius: 15px;
    background: #f5f6f8;
    color: #333;
    border: 1px solid transparent;
  }

  .sku-count {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin: 16px 0 14px;
    font-size: 13px;

    .sku-stock {
      font-style: normal;
      font-size: 11px;
      color: #999;
      margin-left: 6px;
    }

    .stepper {
      color: #666;

      i {
        font-style: normal;
        display: inline-block;
        width: 20px;
        text-align: center;
        color: #999;
      }
    }
  }

  .sku-confirm {
    text-align: center;
    color: #fff;
    border-radius: 20px;
    padding: 11px 0;
    font-size: 14px;
  }

  /* ===== 确认订单 ===== */
  .order-body {
    padding-bottom: 8px;
    overflow: hidden;
  }

  .o-card {
    background: #fff;
    padding: 12px 14px;
    margin: 8px 10px 0;
    border-radius: 4px;
    flex-shrink: 0;
  }

  .o-addr-card {
    border-radius: 0;
    margin: 0;
    border-top: 3px solid transparent;
    border-image: repeating-linear-gradient(90deg, #ff6b6b 0 16px, #fff 16px 24px, #4d7cfe 24px 40px, #fff 40px 48px) 3;

    .o-addr-name {
      font-size: 14px;
      font-weight: bold;
    }

    .o-addr {
      font-size: 12px;
      color: #888;
      margin-top: 4px;
    }
  }

  .o-store {
    font-size: 13px;
    font-weight: bold;
    display: flex;
    align-items: center;
  }

  .o-reduce {
    font-size: 11px;
    color: #888;
    margin-top: 6px;
    display: flex;
    align-items: center;
  }

  .o-goods {
    display: flex;
    gap: 8px;
    margin: 10px 0;
    align-items: center;

    .sku-thumb {
      width: 52px;
      height: 52px;
      font-size: 24px;
    }

    .o-goods-more {
      margin-left: auto;
      font-size: 12px;
      color: #666;
    }
  }

  .o-row {
    display: flex;
    justify-content: space-between;
    font-size: 12px;
    color: #555;
    padding: 6px 0;

    .o-muted {
      color: #aaa;
    }

    .o-amount {
      font-weight: bold;
    }

    .o-coupon {
      font-style: normal;
      font-size: 10px;
      margin-left: 4px;
    }
  }

  .order-bar {
    .o-total {
      font-size: 13px;

      i {
        font-style: normal;
        font-weight: bold;
        font-size: 15px;
      }
    }

    .bar-btn {
      flex: none;
      padding: 9px 22px;
    }
  }
}
</style>
