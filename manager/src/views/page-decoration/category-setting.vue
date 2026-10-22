<template>
  <div class="category-setting-page" v-loading="loading">
    <div class="setting-container">
      <!-- 分类导航模块 -->
      <section class="cate-setting-section">
        <h2 class="cate-setting-main-title">分类导航</h2>
        <h3 class="cate-setting-section-title">选择模板</h3>

        <div class="cate-setting-templates">
          <div
            v-for="tpl in templates"
            :key="tpl.value"
            class="cate-setting-template-card"
            :class="{ active: form.template === tpl.value }"
            :title="tpl.name"
            @click="form.template = tpl.value"
          >
            <div class="cate-setting-template-thumb">
              <img :src="tpl.img" :alt="tpl.name" class="cate-setting-template-img" />
            </div>
          </div>
        </div>
      </section>

      <!-- 页面设置模块（仅模板2/3/4展示商品列表字段开关，模板1为分类宫格无需配置） -->
      <transition name="fade">
        <section v-if="form.template !== 1" class="cate-setting-section">
          <h2 class="cate-setting-main-title">页面设置</h2>
          <p class="cate-setting-section-desc">商品列表展示字段：</p>

          <div class="cate-setting-columns">
            <!-- 左列 -->
            <div class="cate-setting-column-block">
              <div
                v-for="item in columnLeft"
                :key="item.key"
                class="cate-setting-check-row"
              >
                <el-checkbox
                  v-if="item.disabled"
                  :model-value="true"
                  :disabled="true"
                >
                  {{ item.label }}
                </el-checkbox>
                <el-checkbox
                  v-else
                  v-model="form.showFields[item.key]"
                >
                  {{ item.label }}
                </el-checkbox>
              </div>
            </div>

            <!-- 右列 -->
            <div class="cate-setting-column-block">
              <div
                v-for="item in columnRight"
                :key="item.key"
                class="cate-setting-check-row"
              >
                <el-checkbox v-model="form.showFields[item.key]">
                  {{ item.label }}
                </el-checkbox>
              </div>
            </div>
          </div>
        </section>
      </transition>

      <!-- 底部保存按钮 -->
      <div class="bar-button">
        <el-button
          type="primary"
          class="save-btn"
          :loading="saveLoading"
          @click="submit"
        >
          保存设置
        </el-button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { getSetting, setSetting } from "@/api/index";
import { Message } from "@/utils/message";

defineOptions({ name: "category-setting" });

const SETTING_KEY = "CATEGORY_PAGE_SETTING";

const templates = [
  { value: 1, name: "模板一: 左树右宫格", img: "https://lilishop-wechat.oss-cn-beijing.aliyuncs.com/tpl-1.png" },
  { value: 2, name: "模板二: 图标导航+三级标签", img: "https://lilishop-wechat.oss-cn-beijing.aliyuncs.com/tpl-2.png" },
  { value: 3, name: "模板三: 图标导航", img: "https://lilishop-wechat.oss-cn-beijing.aliyuncs.com/tpl-3.png" },
  { value: 4, name: "模板四: 侧栏一级+二级横滑", img: "https://lilishop-wechat.oss-cn-beijing.aliyuncs.com/tpl-4.png" },
];

// 左列展示字段配置（商品名称 规格值固定必选置灰）
const columnLeft = [
  { key: "spuName", label: "商品名称 规格值", disabled: true },
  { key: "selfTag", label: "自营标签" },
  { key: "cart", label: "购物车" },
];

// 右列展示字段配置
const columnRight = [
  { key: "subTitle", label: "商品副标题" },
  { key: "tags", label: "标签" },
  { key: "price", label: "价格(会员价)" },
  { key: "sales", label: "销量/好评/好评率" },
];

const loading = ref(false);
const saveLoading = ref(false);

function defaultForm() {
  return {
    template: 1,
    showFields: {
      subTitle: true,
      spec: true,
      tags: true,
      selfTag: true,
      price: true,
      linePrice: false,
      sales: true,
      cart: true,
    },
  };
}

const form = ref(defaultForm());

onMounted(() => {
  loadSetting();
});

function loadSetting() {
  loading.value = true;
  getSetting(SETTING_KEY)
    .then((res) => {
      if (res.success && res.result) {
        const data = res.result;
        const merged = defaultForm();
        if ([1, 2, 3, 4].includes(data.template)) {
          merged.template = data.template;
        }
        Object.assign(merged.showFields, data.showFields || {});
        form.value = merged;
      }
    })
    .finally(() => {
      loading.value = false;
    });
}

function submit() {
  saveLoading.value = true;
  form.value.showFields.spec = true;
  form.value.showFields.linePrice = false;
  setSetting(SETTING_KEY, form.value)
    .then((res) => {
      if (res.success) {
        Message.success("保存成功");
      } else {
        Message.error("保存失败");
      }
    })
    .finally(() => {
      saveLoading.value = false;
    });
}
</script>

<style scoped lang="scss">
.category-setting-page {
  padding: 0;
  min-height: 100%;
}

.setting-container {
  background: #ffffff;
  padding: 20px 28px 80px 28px;
  min-height: calc(100vh - 126px);
  box-sizing: border-box;
}

/* 模块区域 */
.cate-setting-section {
  margin-bottom: 32px;
}

.cate-setting-main-title {
  margin: 0 0 16px 0;
  font-size: 16px;
  font-weight: 600;
  color: #333333;
  line-height: 22px;
}

.cate-setting-section-title {
  margin: 0 0 16px 0;
  font-size: 14px;
  font-weight: 600;
  color: #333333;
  line-height: 20px;
}

.cate-setting-section-desc {
  margin: 0 0 16px 0;
  font-size: 13px;
  color: #888888;
  line-height: 20px;
}

/* 模板预览卡片列表 */
.cate-setting-templates {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
}

.cate-setting-template-card {
  padding: 0;
  border: 2px solid #e8e8e8;
  border-radius: 4px;
  background: #ffffff;
  cursor: pointer;
  text-align: center;
  transition: border-color 0.2s, box-shadow 0.2s;
  width: 250px;
  overflow: hidden;
  box-sizing: border-box;

  &:hover {
    border-color: #ffb366;
  }

  &.active {
    border-color: #ff6600;
    box-shadow: 0 0 0 1px rgba(255, 102, 0, 0.2);
  }

  .cate-setting-template-thumb {
    background: #f5f5f5;
    line-height: 0;
  }

  .cate-setting-template-img {
    display: block;
    width: 250px;
    max-width: 100%;
    height: auto;
    user-select: none;
    -webkit-user-drag: none;
  }
}

/* 商品展示字段两列排布 */
.cate-setting-columns {
  display: flex;
  flex-wrap: wrap;
  gap: 24px 60px;
  max-width: 720px;
}

.cate-setting-column-block {
  min-width: 200px;
  display: flex;
  flex-direction: column;
}

.cate-setting-check-row {
  margin-bottom: 14px;

  &:last-child {
    margin-bottom: 0;
  }
}

/* 底部操作条与保存按钮 */
.bar-button {
  margin-top: 36px;
  padding-top: 8px;
}

.save-btn {
  min-width: 104px;
  height: 36px;
  padding: 0 20px;
  font-size: 14px;
  background-color: #ff6600 !important;
  border-color: #ff6600 !important;
  border-radius: 4px;
  color: #ffffff !important;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background-color: #ff8533 !important;
    border-color: #ff8533 !important;
  }

  &:active {
    background-color: #e65c00 !important;
    border-color: #e65c00 !important;
  }
}

/* 淡入淡出过渡动画 */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateY(-6px);
}
</style>
