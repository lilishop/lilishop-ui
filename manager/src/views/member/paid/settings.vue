<template>
  <div class="paid-settings" v-loading="loading">
    <el-alert v-if="loadError" title="设置加载失败，请点击重试" type="error" :closable="false"><el-button link @click="loadSettings">重新加载</el-button></el-alert>
    <el-form :model="form" label-width="150px" @submit.prevent>
      <el-card shadow="never"><template #header>基本信息</template>
        <el-form-item label="开放购买/续费"><el-switch v-model="form.enabled" /><span class="hint inline">关闭后，已支付会员仍有效至到期</span></el-form-item>
        <el-form-item label="会员名称" required><el-input v-model="form.name" maxlength="50" style="width:360px" /></el-form-item>
        <el-form-item label="会员图标"><UploadPicInput v-model="form.icon" /><div class="hint">推荐100 × 100像素，透明PNG</div></el-form-item>
        <el-form-item label="会员背景"><el-radio-group v-model="form.backgroundType"><el-radio value="COLOR">背景色</el-radio><el-radio value="IMAGE">背景图</el-radio></el-radio-group><el-color-picker v-if="form.backgroundType === 'COLOR'" v-model="form.backgroundColor" class="inline" /></el-form-item>
        <el-form-item v-if="form.backgroundType === 'IMAGE'" label="背景图"><UploadPicInput v-model="form.backgroundImage" /></el-form-item>
        <el-form-item label="字体颜色"><el-color-picker v-model="form.fontColor" /></el-form-item>
        <el-form-item label="开通价格" required><el-input-number v-model="form.price" :min="0.01" :max="1000000" :precision="2" :controls="false" /><span class="inline">元</span></el-form-item>
        <el-form-item label="会员有效期" required><el-input-number v-model="form.months" :min="1" :max="120" :precision="0" :controls="false" /><span class="inline">个月</span><div class="hint">按自然月计算；未到期续费从原到期时间顺延。</div></el-form-item>
        <el-form-item label="关联客户权益"><el-select v-model="form.benefitIds" multiple filterable style="width:480px;max-width:100%" placeholder="选择权益"><el-option v-for="b in benefitOptions" :key="b.id" :label="b.benefitName" :value="String(b.id)" /></el-select></el-form-item>
      </el-card>
      <el-card shadow="never"><template #header>商家设置</template>
        <el-form-item label="商家范围"><el-radio-group v-model="form.storeScope"><el-radio value="SELF">自营商家</el-radio><el-radio value="CUSTOM">自定义选择</el-radio></el-radio-group></el-form-item>
        <el-form-item v-if="form.storeScope === 'CUSTOM'" label="选择商家"><el-button @click="openPicker('stores')">添加商家</el-button><div class="picked-tags"><el-tag v-for="id in form.storeIds" :key="id" closable @close="remove('storeIds', id)">{{ stores[id]?.storeName || id }}</el-tag></div></el-form-item>
      </el-card>
      <el-card shadow="never"><template #header>商品折扣</template>
        <el-form-item label="商品会员折扣"><el-radio-group v-model="form.discountMode"><el-radio value="ALL">所有适用商品统一折扣</el-radio><el-radio value="CUSTOM">自定义商品折扣</el-radio></el-radio-group></el-form-item>
        <el-form-item v-if="form.discountMode === 'ALL'" label="统一折扣"><el-input-number v-model="form.discount" :min="0.01" :max="10" :precision="2" :controls="false" /><span class="inline">折</span></el-form-item>
        <el-form-item v-else label="折扣商品"><div class="full"><el-button @click="openPicker('discount')">添加商品</el-button><el-table :data="filteredDiscountRules" border class="mt_10"><el-table-column label="商品" min-width="230"><template #default="{row}">{{ goods[row.skuId]?.goodsName || row.skuId }}</template></el-table-column><el-table-column label="SKU编码" width="180"><template #default="{row}">{{ goods[row.skuId]?.sn || row.skuId }}</template></el-table-column><el-table-column label="规格" min-width="160" show-overflow-tooltip><template #default="{row}">{{ goods[row.skuId]?.simpleSpecs?.trim() || '—' }}</template></el-table-column><el-table-column label="分类" min-width="180" show-overflow-tooltip><template #default="{row}">{{ goods[row.skuId]?.categoryName || '—' }}</template></el-table-column><el-table-column label="品牌" min-width="120" show-overflow-tooltip><template #default="{row}">{{ goods[row.skuId]?.brandName || '—' }}</template></el-table-column><el-table-column label="售价" width="120" align="right"><template #default="{row}">{{ goods[row.skuId]?.price == null ? '—' : '¥' + Number(goods[row.skuId].price).toFixed(2) }}</template></el-table-column><el-table-column label="折扣" width="190"><template #default="{row}"><el-input-number v-model="row.discount" :min="0.01" :max="10" :precision="2" style="width:140px" :controls="false" /> 折</template></el-table-column><el-table-column label="操作" width="80"><template #default="{row}"><el-button link type="danger" @click="form.goodsRules = form.goodsRules.filter(r => r.skuId !== row.skuId)">移除</el-button></template></el-table-column></el-table></div></el-form-item>
      </el-card>
      <el-card shadow="never"><template #header>会员中心推荐商品</template>
        <el-button @click="openPicker('recommended')">添加商品</el-button>
        <el-table :data="form.recommendedSkuIds.map(id => goods[id] || {id})" border class="mt_10"><el-table-column prop="sn" label="SKU编码" width="180" /><el-table-column label="商品名称" min-width="240"><template #default="{row}">{{ row.goodsName || row.id }}</template></el-table-column><el-table-column label="规格" min-width="160" show-overflow-tooltip><template #default="{row}">{{ row.simpleSpecs?.trim() || '—' }}</template></el-table-column><el-table-column label="分类" min-width="180" show-overflow-tooltip><template #default="{row}">{{ row.categoryName || '—' }}</template></el-table-column><el-table-column label="品牌" min-width="120" show-overflow-tooltip><template #default="{row}">{{ row.brandName || '—' }}</template></el-table-column><el-table-column label="售价" width="120" align="right"><template #default="{row}">{{ row.price == null ? '—' : '¥' + Number(row.price).toFixed(2) }}</template></el-table-column><el-table-column label="操作" width="90"><template #default="{row}"><el-button link type="danger" @click="remove('recommendedSkuIds', String(row.id))">移除</el-button></template></el-table-column></el-table>
      </el-card>
      <el-card shadow="never">
        <template #header>展示设置</template>
        <div class="entry-settings-grid">
          <section class="entry-settings-block">
            <h4>未开通会员入口</h4>
            <el-form-item label="入口文案" required><el-input v-model="form.unopenedText" maxlength="50" show-word-limit class="entry-text-input" /></el-form-item>
            <el-form-item label="字体颜色" required><el-color-picker v-model="form.unopenedFontColor" /><span class="entry-color-value">{{ form.unopenedFontColor }}</span></el-form-item>
            <el-form-item label="背景图"><UploadPicInput v-model="form.unopenedBackground" /><div class="hint">用于个人中心未开通及已到期入口，推荐 750 × 160 像素，支持 PNG/JPG；不设置时使用默认渐变背景。</div></el-form-item>
            <el-form-item label="效果预览"><div class="entry-preview" :style="{color: form.unopenedFontColor}"><img v-if="form.unopenedBackground" :src="form.unopenedBackground" alt="未开通入口背景" /><div class="entry-preview-content"><div><strong>{{ form.unopenedText || '开通付费会员，享专属权益' }}</strong><small>开通享商品优惠与专属权益</small></div><span>›</span></div></div></el-form-item>
          </section>
          <section class="entry-settings-block">
            <h4>已开通会员入口</h4>
            <el-form-item label="入口文案" required><el-input v-model="form.openedText" maxlength="50" show-word-limit class="entry-text-input" /></el-form-item>
            <el-form-item label="字体颜色" required><el-color-picker v-model="form.openedFontColor" /><span class="entry-color-value">{{ form.openedFontColor }}</span></el-form-item>
            <el-form-item label="背景图"><UploadPicInput v-model="form.openedBackground" /><div class="hint">用于个人中心有效会员入口，推荐 750 × 160 像素，支持 PNG/JPG；不设置时使用默认渐变背景。</div></el-form-item>
            <el-form-item label="效果预览"><div class="entry-preview" :style="{color: form.openedFontColor}"><img v-if="form.openedBackground" :src="form.openedBackground" alt="已开通入口背景" /><div class="entry-preview-content"><div><strong>{{ form.openedText || '我的付费会员' }}</strong><small>有效期至 2027-11-05（示例）</small></div><span>›</span></div></div></el-form-item>
          </section>
        </div>
        <el-form-item label="会员价格标签"><UploadPicInput v-model="form.priceLabel" /><div class="hint">展示在商品列表、商品详情的会员价前，推荐 48 × 48 像素、透明 PNG；不设置时只显示会员价文字。</div></el-form-item>
        <el-form-item label="标签预览"><div class="price-label-preview"><img v-if="form.priceLabel" :src="form.priceLabel" alt="会员价格标签" /><span>会员价 ¥88.00</span></div></el-form-item>
      </el-card>
      <el-card shadow="never" class="document-card">
        <template #header><div class="document-heading"><div><span>购买说明</span><div class="document-hint">展示在移动端付费会员页面，可填写权益介绍和使用说明。</div></div><el-button @click="fullscreenEditor(descriptionEditor)">全屏编辑</el-button></div></template>
        <el-form-item label-width="0" class="document-field"><RichEditor ref="descriptionEditor" v-model="form.description" image-picker height="520px" class="full" /></el-form-item>
      </el-card>
      <el-card shadow="never" class="document-card">
        <template #header><div class="document-heading"><div><span>会员协议</span><div class="document-hint">用户购买前阅读并同意的协议，开启购买前请完善内容。</div></div><el-button @click="fullscreenEditor(agreementEditor)">全屏编辑</el-button></div></template>
        <el-form-item label-width="0" class="document-field"><RichEditor ref="agreementEditor" v-model="form.agreement" image-picker height="600px" class="full" /></el-form-item>
      </el-card>
      <div class="save-bar"><el-button type="primary" :loading="saving" :disabled="loading || !loaded" @click="save">保存设置</el-button></div>
    </el-form>
    <StoreSelector ref="picker" @selected="selected" />
    <GoodsSelector ref="goodsPicker" :goods-loader="discountPicking ? getPaidDiscountSkus : undefined" :query-params="discountQuery" @selectedGoodsData="selected" />
  </div>
</template>
<script setup>
import { reactive, ref, onMounted, watch, computed } from 'vue';
import { ElMessage } from 'element-plus';
import UploadPicInput from '@/components/lili/upload-pic-input.vue';
import RichEditor from '@/components/editor/index.vue';
import StoreSelector from '@/components/store-selector/index.vue';
import GoodsSelector from '@/components/lili-dialog/index.vue';
import { getPaidConfig, savePaidConfig, getPaidResources, getPaidDiscountSkus } from '@/api/paid-member';
import { getMemberBenefitByPage } from '@/api/member';
defineOptions({name:'paidMemberSettings'});
const form = reactive({ goodsRules: [], storeIds: [], recommendedSkuIds: [], benefitIds: [] });
const loading = ref(false), loaded = ref(false), loadError = ref(false), saving = ref(false), picker = ref(), benefitOptions = ref([]), stores = reactive({}), goods = reactive({});
const descriptionEditor = ref(), agreementEditor = ref(), goodsPicker = ref(), discountPicking = ref(false);
const discountQuery = computed(() => discountPicking.value ? { storeScope: form.storeScope, storeIds: form.storeIds.join(',') } : {});
const filteredDiscountRules = computed(() => form.goodsRules.filter(rule => storeAllowed(goods[rule.skuId])));
function fullscreenEditor(editor) { editor?.getEditor()?.execCommand('mceFullScreen'); }
let target = '';
function remember(rows, type) { rows.forEach(row => { const cache = type === 'STORE' ? stores : goods; cache[String(row.id)] = { ...cache[String(row.id)], ...row }; }); }
function remove(field, id) { form[field] = form[field].filter(value => value !== id); }
async function openPicker(value) {
  target = value;
  if (value === 'stores') {
    picker.value.open(form.storeIds.map(id => ({ ...stores[id], id: String(id) })));
    return;
  }
  discountPicking.value = value === 'discount';
  if (discountPicking.value) {
    if (form.storeScope === 'CUSTOM' && !form.storeIds.length) { ElMessage.warning('请先选择参与商家'); return; }
    try { await reconcileDiscounts(); } catch { ElMessage.error('商品商家信息加载失败，请重试'); return; }
  }
  const ids = value === 'discount' ? form.goodsRules.map(rule => rule.skuId) : form.recommendedSkuIds;
  goodsPicker.value.goodsData = ids.map(id => ({ ...goods[id], id: String(id) }));
  goodsPicker.value.open('goods');
}
async function selected(rows) {
  remember(rows, target === 'stores' ? 'STORE' : 'SKU');
  if (target === 'stores') { form.storeIds = rows.map(row => String(row.id)); return; }
  if (target === 'discount') {
    try { await hydrate('SKU', rows.map(row => String(row.id))); } catch { ElMessage.error('商品商家信息加载失败，请重试'); return; }
    const validRows = rows.filter(row => storeAllowed(goods[String(row.id)]));
    if (validRows.length !== rows.length) ElMessage.warning('已排除不属于参与商家的商品');
    const discounts = new Map(form.goodsRules.map(rule => [String(rule.skuId), rule.discount]));
    form.goodsRules = validRows.map(row => ({ skuId: String(row.id), discount: discounts.get(String(row.id)) ?? form.discount ?? 9.5 }));
  } else { form.recommendedSkuIds = rows.map(row => String(row.id)); }
  const missing = rows.filter(row => !Object.hasOwn(row, 'categoryName') || !Object.hasOwn(row, 'brandName'));
    if (missing.length) { try { await hydrate('SKU', missing.map(row => String(row.id))); } catch { ElMessage.warning('商品分类和品牌加载失败，可刷新页面重试'); } }
}
async function save() { saving.value = true; try { await reconcileDiscounts(); const res = await savePaidConfig({...form}); if (res.success) ElMessage.success('付费会员设置已保存'); } finally { saving.value = false; } }
function storeAllowed(sku) {
  return !!sku && (form.storeScope === 'SELF' ? sku.storeSelfOperated === true : form.storeIds.map(String).includes(String(sku.storeId)));
}
async function reconcileDiscounts() {
  const missing = form.goodsRules.filter(rule => !Object.hasOwn(goods[rule.skuId] || {}, 'storeSelfOperated'));
  if (missing.length) await hydrate('SKU', missing.map(rule => rule.skuId));
  const remaining = form.goodsRules.filter(rule => storeAllowed(goods[rule.skuId]));
  if (remaining.length !== form.goodsRules.length) { form.goodsRules = remaining; ElMessage.warning('已移除不属于当前参与商家的折扣商品'); }
}
watch(() => [form.storeScope, ...form.storeIds], () => {
  if (loading.value || !loaded.value) return;
  reconcileDiscounts().catch(() => ElMessage.error('商品商家信息加载失败，请重试'));
}, { flush: 'sync' });
async function hydrate(type, ids) {
  for (let i=0; i<ids.length; i+=100) { const res = await getPaidResources(type, ids.slice(i,i+100)); if (!res.success) throw new Error('resources'); remember(res.result, type); }
}
async function loadSettings() {
  loading.value = true; loaded.value = false; loadError.value = false;
  try {
    const [config, rights] = await Promise.all([getPaidConfig(), getMemberBenefitByPage({pageNumber:1,pageSize:200})]);
    if (!config.success) { loadError.value = true; return; }
    Object.assign(form, config.result); loaded.value = true; benefitOptions.value = rights.result?.records || [];
    const ids = [...new Set([...form.recommendedSkuIds, ...form.goodsRules.map(r => r.skuId)])];
    await Promise.all([hydrate('SKU',ids), hydrate('STORE',form.storeIds)]);
  } catch { loadError.value = true; } finally { loading.value = false; }
}
onMounted(loadSettings);
</script>
<style scoped>
.entry-settings-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 24px; margin-bottom: 24px; }
.entry-settings-block { min-width: 0; border: 1px solid #ebeef5; border-radius: 6px; padding: 20px 16px 0; }
.entry-settings-block h4 { margin: 0 0 24px; color: #303133; font-size: 14px; }
.entry-text-input { width: 480px; max-width: 100%; }
.entry-color-value { margin-left: 12px; color: #909399; font-size: 12px; }
.entry-preview { position: relative; overflow: hidden; width: 375px; max-width: 100%; min-height: 80px; border-radius: 10px; background: linear-gradient(110deg, #423c36, #756149); }
.entry-preview > img { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; }
.entry-preview-content { position: relative; display: flex; align-items: center; justify-content: space-between; gap: 12px; padding: 16px; min-height: 80px; box-sizing: border-box; line-height: 1.5; }
.entry-preview-content strong { font-size: 14px; }.entry-preview-content small { display: block; margin-top: 4px; opacity: .75; font-size: 11px; }.entry-preview-content > span { font-size: 24px; }
.price-label-preview { display: flex; align-items: center; gap: 6px; color: #a77c3e; font-size: 13px; }.price-label-preview img { width: 24px; height: 24px; object-fit: contain; }
@media (max-width: 1400px) { .entry-settings-grid { grid-template-columns: minmax(0, 1fr); } }
.document-heading { display: flex; align-items: center; justify-content: space-between; gap: 20px; }
.document-heading > div { min-width: 0; }
.document-hint { margin-top: 8px; color: #909399; font-size: 12px; font-weight: normal; line-height: 20px; }
.document-field { margin-bottom: 0; }
.document-field :deep(.el-form-item__content) { min-width: 0; }
.document-card :deep(.tox-tinymce) { border-color: #dcdfe6; }
.paid-settings { padding-bottom: 70px; }.el-card { margin-top: 16px; }.hint { width: 100%; font-size: 12px; line-height: 20px; margin-top: 6px; color: #909399; }.inline { margin-left: 12px; }.hint.inline { width: auto; margin-top: 0; }.full { width: 100%; min-width: 0; }.picked-tags { width: 100%; display: flex; flex-wrap: wrap; gap: 8px; margin-top: 12px; }.save-bar { position: sticky; bottom: 0; padding: 16px; background: #fff; border-top: 1px solid #ebeef5; display: flex; justify-content: flex-end; z-index: 10; }
</style>
