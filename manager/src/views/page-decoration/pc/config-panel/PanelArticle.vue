<template>
  <div class="panel-article-content">
    <!-- 1. 文章标题与元信息 -->
    <div class="panel-section">
      <div class="section-title">文章标题与元信息</div>
      <div class="form-item">
        <span class="item-label">展示文章标题</span>
        <el-switch v-model="options.showTitle" size="small" />
      </div>
      <template v-if="options.showTitle !== false">
        <div class="form-item">
          <span class="item-label">文章主标题</span>
          <el-input v-model="options.title" size="small" placeholder="如：品牌故事 · 匠心传承" />
        </div>
        <div class="form-item">
          <span class="item-label">副标题</span>
          <el-input v-model="options.subtitle" size="small" placeholder="如：关于我们的品牌理念与品质坚持" />
        </div>
        <div class="form-item">
          <span class="item-label">专栏标签</span>
          <el-input v-model="options.tag" size="small" placeholder="如：品牌专栏" />
        </div>
      </template>

      <div class="form-item">
        <span class="item-label">展示作者与时间</span>
        <el-switch v-model="options.showMeta" size="small" />
      </div>
      <template v-if="options.showMeta !== false">
        <div class="form-item">
          <span class="item-label">作者/部门</span>
          <el-input v-model="options.author" size="small" placeholder="如：官方商城运营部" />
        </div>
        <div class="form-item">
          <span class="item-label">发布日期</span>
          <el-input v-model="options.date" size="small" placeholder="如：2026-10-28" />
        </div>
      </template>
    </div>

    <!-- 2. 文章富文本内容 (与万米一致) -->
    <div class="panel-section">
      <div class="section-title flex-between">
        <span>文章内容</span>
        <el-button link type="primary" size="small" @click="editMode = (editMode === 'rich' ? 'raw' : 'rich')">
          {{ editMode === 'rich' ? '切换为HTML代码' : '切换为预览' }}
        </el-button>
      </div>

      <!-- 纯文本摘要预览 -->
      <div class="article-summary-box" v-if="editMode === 'rich'">
        <div class="summary-text">{{ cleanTextSummary || '暂无文章内容，请点击下方按钮编辑' }}</div>
      </div>

      <div class="edit-btn-wrap" v-if="editMode === 'rich'">
        <el-button type="primary" size="small" style="width: 100%" @click="openEditorDialog = true">
          编辑文章富文本内容
        </el-button>
      </div>

      <!-- 源码编辑模式 -->
      <div class="raw-html-editor" v-if="editMode === 'raw'">
        <el-input
          v-model="options.content"
          type="textarea"
          :rows="10"
          placeholder="请输入或粘贴文章 HTML 内容..."
          size="small"
        />
      </div>
    </div>

    <!-- 3. 文章排版样式 -->
    <div class="panel-section">
      <div class="section-title">文章阅读排版</div>
      <div class="form-item">
        <span class="item-label">正文字号</span>
        <el-radio-group v-model="options.fontSize" size="small">
          <el-radio-button :label="14">14px</el-radio-button>
          <el-radio-button :label="15">15px</el-radio-button>
          <el-radio-button :label="16">16px</el-radio-button>
        </el-radio-group>
      </div>
      <div class="form-item">
        <span class="item-label">正文对齐</span>
        <el-radio-group v-model="options.textAlign" size="small">
          <el-radio-button label="left">靠左</el-radio-button>
          <el-radio-button label="center">居中</el-radio-button>
          <el-radio-button label="justify">两端对齐</el-radio-button>
        </el-radio-group>
      </div>
    </div>

    <!-- 富文本编辑器弹窗 -->
    <el-dialog
      v-model="openEditorDialog"
      title="编辑文章富文本内容"
      width="900px"
      append-to-body
      destroy-on-close
    >
      <div class="dialog-editor-container">
        <tinymce-editor
          v-model="tempContent"
          height="450px"
        />
      </div>
      <template #footer>
        <el-button @click="openEditorDialog = false">取消</el-button>
        <el-button type="primary" @click="handleSaveEditor">确认保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue';
import TinymceEditor from '@/components/editor/index.vue';

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

const defaultArticleHtml = `
<h3>关于我们 · 甄选美好生活</h3>
<p>我们始终坚信，一件好的产品不仅能改善日常生活的品质，更传递着对美好生活的执着追求。自创立以来，我们严选全球顶尖供应链，深耕每一道生产工艺与质检环节，力求将兼具美学价值与极致实用性的商品送达每一位用户手中。</p>
<blockquote>品质是我们的信仰，体验是我们的底线。从选材到交付，每一步都经得起时光检验。</blockquote>
<h4>四大核心服务保障</h4>
<ul>
  <li><strong>100% 官方正品</strong>：源头品牌直采，全链路防伪溯源，假一赔十保障。</li>
  <li><strong>极速顺丰冷链</strong>：全国多仓联动发货，核心城市支持当日达/次日达。</li>
  <li><strong>7天无理由退换</strong>：专业客服团队 7×24 小时贴心守护，售后无忧。</li>
  <li><strong>会员专享权益</strong>：尊享积分抵现、生日特权礼及专属品鉴沙龙。</li>
</ul>
<p>感谢一路相伴的每一位朋友，未来我们将持续探索更多优质生活场景，与您共同见证品质生活的美好绽放。</p>
`.trim();

if (props.options.showTitle === undefined) props.options.showTitle = true;
if (!props.options.title) props.options.title = '品牌故事 · 匠心传承';
if (!props.options.subtitle) props.options.subtitle = '关于我们的品牌理念与品质坚持';
if (props.options.showMeta === undefined) props.options.showMeta = true;
if (!props.options.author) props.options.author = '官方商城运营部';
if (!props.options.date) props.options.date = '2026-10-28';
if (!props.options.tag) props.options.tag = '品牌专栏';
if (!props.options.fontSize) props.options.fontSize = 15;
if (!props.options.textAlign) props.options.textAlign = 'left';
if (!props.options.content) props.options.content = defaultArticleHtml;

const editMode = ref('rich');
const openEditorDialog = ref(false);
const tempContent = ref(props.options.content || defaultArticleHtml);

watch(openEditorDialog, (val) => {
  if (val) {
    tempContent.value = props.options.content || defaultArticleHtml;
  }
});

const cleanTextSummary = computed(() => {
  const c = props.options?.content || '';
  const text = c.replace(/<[^>]*>/g, ' ').replace(/&nbsp;/g, ' ').replace(/\s+/g, ' ').trim();
  return text.slice(0, 120) + (text.length > 120 ? '...' : '');
});

function handleSaveEditor() {
  props.options.content = tempContent.value;
  openEditorDialog.value = false;
}
</script>

<style lang="scss" scoped>
.panel-article-content {
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
      align-items: center;
      justify-content: space-between;
      margin-bottom: 8px;

      .item-label {
        font-size: 12px;
        color: #475569;
        margin-right: 8px;
        white-space: nowrap;
      }
    }
  }

  .article-summary-box {
    background: #f8fafc;
    border: 1px solid #e2e8f0;
    border-radius: 6px;
    padding: 10px 12px;
    margin-bottom: 10px;

    .summary-text {
      font-size: 12px;
      line-height: 1.6;
      color: #475569;
      max-height: 72px;
      overflow: hidden;
      display: -webkit-box;
      -webkit-line-clamp: 3;
      -webkit-box-orient: vertical;
    }
  }

  .edit-btn-wrap {
    margin-top: 6px;
  }

  .raw-html-editor {
    margin-top: 6px;
  }
}

.dialog-editor-container {
  padding: 10px 0;
}
</style>
