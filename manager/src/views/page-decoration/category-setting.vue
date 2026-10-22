<template>
  <div class="category-setting" v-loading="loading">
    <el-card shadow="never" class="panel">
      <div class="section-title">分类导航</div>
      <div class="section-sub">选择模板</div>
      <div class="template-list">
        <div
          v-for="tpl in templates"
          :key="tpl.value"
          class="template-card"
          :class="{ active: form.template === tpl.value }"
          @click="form.template = tpl.value"
        >
          <!-- 纯 CSS 示意图 -->
          <div class="mini-phone">
            <div class="mini-search"></div>
            <!-- 模板1:左栏 + 宫格 -->
            <template v-if="tpl.value === 1">
              <div class="mini-body">
                <div class="mini-side">
                  <i v-for="n in 6" :key="n" :class="{ on: n === 1 }"></i>
                </div>
                <div class="mini-grid">
                  <div class="mini-grid-title"></div>
                  <div class="mini-grid-cells">
                    <i v-for="n in 6" :key="n"></i>
                  </div>
                </div>
              </div>
            </template>
            <!-- 模板2:顶部图标横排 + 标签行 + 左竖列 + 单列商品 -->
            <template v-else-if="tpl.value === 2">
              <div class="mini-icon-row">
                <i v-for="n in 5" :key="n" :class="{ on: n === 1 }"></i>
              </div>
              <div class="mini-tag-row">
                <i v-for="n in 4" :key="n" :class="{ on: n === 1 }"></i>
              </div>
              <div class="mini-body">
                <div class="mini-side">
                  <i v-for="n in 5" :key="n" :class="{ on: n === 2 }"></i>
                </div>
                <div class="mini-goods">
                  <i v-for="n in 3" :key="n"></i>
                </div>
              </div>
            </template>
            <!-- 模板3:顶部图标横排 + 左竖列 + 单列商品(无标签行) -->
            <template v-else-if="tpl.value === 3">
              <div class="mini-icon-row">
                <i v-for="n in 5" :key="n" :class="{ on: n === 1 }"></i>
              </div>
              <div class="mini-body">
                <div class="mini-side">
                  <i v-for="n in 5" :key="n" :class="{ on: n === 1 }"></i>
                </div>
                <div class="mini-goods">
                  <i v-for="n in 3" :key="n"></i>
                </div>
              </div>
            </template>
            <!-- 模板4:左竖列(一级) + 右上文字横排(二级) + 单列商品 -->
            <template v-else>
              <div class="mini-body">
                <div class="mini-side">
                  <i v-for="n in 5" :key="n" :class="{ on: n === 1 }"></i>
                </div>
                <div class="mini-right">
                  <div class="mini-tag-row">
                    <i v-for="n in 4" :key="n" :class="{ on: n === 1 }"></i>
                  </div>
                  <div class="mini-goods">
                    <i v-for="n in 3" :key="n"></i>
                  </div>
                </div>
              </div>
            </template>
          </div>
          <div class="template-name">{{ tpl.name }}</div>
        </div>
      </div>

      <div class="section-title">页面设置</div>
      <div class="section-sub">商品列表展示字段</div>
      <div class="field-list">
        <el-checkbox model-value :disabled="true">商品名称</el-checkbox>
        <el-checkbox
          v-for="f in fieldOptions"
          :key="f.key"
          v-model="form.showFields[f.key]"
          >{{ f.label }}</el-checkbox
        >
      </div>

      <el-button type="primary" :loading="saveLoading" class="save-btn" @click="submit"
        >保存设置</el-button
      >
    </el-card>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { getSetting, setSetting } from "@/api/index";
import { Message } from "@/utils/message";

defineOptions({ name: "category-setting" });

const SETTING_KEY = "CATEGORY_PAGE_SETTING";

const templates = [
  { value: 1, name: "模板一:左树右宫格" },
  { value: 2, name: "模板二:图标导航+三级标签" },
  { value: 3, name: "模板三:图标导航" },
  { value: 4, name: "模板四:侧栏一级+二级横滑" },
];

const fieldOptions = [
  { key: "subTitle", label: "商品副标题" },
  { key: "spec", label: "规格值" },
  { key: "tags", label: "标签" },
  { key: "selfTag", label: "自营标签" },
  { key: "price", label: "价格(市场价/会员价)" },
  { key: "linePrice", label: "划线价" },
  { key: "sales", label: "销量/好评/好评率" },
  { key: "cart", label: "购物车" },
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
      linePrice: true,
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
.category-setting {
  padding: 16px;
}
.panel {
  max-width: 960px;
}
.section-title {
  font-size: 16px;
  font-weight: 600;
  margin: 8px 0;
}
.section-sub {
  font-size: 13px;
  color: #666;
  margin-bottom: 12px;
}
.template-list {
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
  margin-bottom: 24px;
}
.template-card {
  width: 150px;
  cursor: pointer;
  border: 2px solid #e4e7ed;
  border-radius: 8px;
  padding: 8px;
  transition: border-color 0.2s;
  &.active {
    border-color: var(--el-color-primary);
  }
}
.template-name {
  text-align: center;
  font-size: 12px;
  color: #333;
  margin-top: 6px;
}

/* ---- 示意图 ---- */
.mini-phone {
  background: #f5f6f8;
  border-radius: 4px;
  padding: 4px;
  height: 180px;
  display: flex;
  flex-direction: column;
  gap: 4px;
  overflow: hidden;
}
.mini-search {
  height: 8px;
  background: #e4e7ed;
  border-radius: 4px;
  flex-shrink: 0;
}
.mini-body {
  display: flex;
  gap: 4px;
  flex: 1;
  min-height: 0;
}
.mini-right {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 0;
}
.mini-side {
  width: 26px;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  gap: 3px;
  i {
    height: 14px;
    background: #e4e7ed;
    border-radius: 2px;
    &.on {
      background: var(--el-color-primary);
    }
  }
}
.mini-icon-row {
  display: flex;
  gap: 4px;
  flex-shrink: 0;
  i {
    width: 16px;
    height: 16px;
    border-radius: 50%;
    background: #e4e7ed;
    &.on {
      background: var(--el-color-primary);
    }
  }
}
.mini-tag-row {
  display: flex;
  gap: 3px;
  flex-shrink: 0;
  i {
    width: 18px;
    height: 7px;
    border-radius: 3px;
    background: #e4e7ed;
    &.on {
      background: var(--el-color-primary);
    }
  }
}
.mini-grid {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.mini-grid-title {
  height: 7px;
  width: 40%;
  background: #dcdfe6;
  border-radius: 3px;
}
.mini-grid-cells {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  i {
    width: 22px;
    height: 22px;
    background: #e4e7ed;
    border-radius: 2px;
  }
}
.mini-goods {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
  i {
    height: 30px;
    background: #e4e7ed;
    border-radius: 2px;
  }
}

.field-list {
  display: flex;
  flex-wrap: wrap;
  margin-bottom: 24px;
  .el-checkbox {
    width: 220px;
  }
}
.save-btn {
  min-width: 140px;
}
</style>
