<!--
  提货卡选品与收货地址确认，兑换成功后进入普通订单履约。
  @author Bulbasaur
  @since 2026-11-05
-->
<template>
  <UserCenterLayout>
    <div v-loading="loading" class="pickup-page">
      <header class="pickup-heading">
        <div><div class="pickup-eyebrow">提货卡兑换</div><h2>{{ detail.giftCardName || '选择你的好礼' }}</h2></div>
        <span v-if="detail.credentialId" class="pickup-validity">提货权益</span>
      </header>
      <el-result v-if="error" icon="warning" :title="error"><template #extra><el-button @click="load">重新加载</el-button></template></el-result>
      <template v-else-if="detail.credentialId">
        <el-result v-if="completed || detail.tradeSn" icon="success" title="该提货卡已兑换"><template #extra><el-button type="primary" @click="router.push({name:'MyOrder'})">查看订单</el-button></template></el-result>
        <template v-else>
          <div class="pickup-rules"><strong>{{ ruleText }}</strong><span>每种一件</span><span>一次兑完</span><span>免邮</span></div>
          <section class="pickup-products">
            <div class="pickup-section-title"><h3>选择兑换商品</h3><span>共 {{ detail.goods?.length || 0 }} 种商品 · 已选 <b>{{ selected.length }}</b> / {{ detail.pickupCount }} 种</span></div>
            <el-checkbox-group v-model="selected" :max="detail.pickupCount" :disabled="busy || detail.pickupMode === 'ALL'" aria-label="可兑换商品">
              <div class="pickup-grid">
                <el-checkbox v-for="goods in detail.goods" :key="goods.id" :value="goods.id" :disabled="!goods.available" class="pickup-item" :class="{'is-selected': selected.includes(goods.id), 'is-unavailable': !goods.available}">
                  <div class="pickup-image"><el-image :src="goods.thumbnail" fit="contain" :alt="goods.goodsName"><template #error><span class="pickup-image-fallback">暂无图片</span></template></el-image></div>
                  <div class="pickup-goods-info">
                    <strong class="pickup-goods-name" :title="goods.goodsName">{{ goods.goodsName }}</strong>
                    <div class="pickup-specs" :title="specsText(goods.specs)">{{ specsText(goods.specs) }}</div>
                    <div class="pickup-store">{{ goods.storeName }}</div>
                    <div v-if="!goods.available" class="pickup-goods-unavailable">暂不可兑换</div>
                  </div>
                </el-checkbox>
              </div>
            </el-checkbox-group>
          </section>
          <section class="pickup-address">
            <div class="pickup-section-title"><h3>收货地址</h3><div><el-button link :disabled="busy" @click="router.push({name:'MyAddress'})">管理地址</el-button><el-button link :disabled="busy" @click="loadAddresses">刷新</el-button></div></div>
            <el-select v-model="addressId" placeholder="请选择收货地址" :disabled="busy" aria-label="收货地址" class="pickup-address-select">
              <el-option v-for="address in addresses" :key="address.id" :value="address.id" :label="addressText(address)" />
            </el-select>
            <p v-if="!addresses.length" class="pickup-address-empty">还没有收货地址，请先添加地址后刷新。</p>
          </section>
          <footer class="pickup-checkout">
            <div class="pickup-selection"><strong>已选 <b>{{ selected.length }}</b> / {{ detail.pickupCount }} 种商品</strong><span>{{ selectionHint }}</span></div>
            <div class="pickup-submit"><div class="pickup-payable">实付 <strong>￥0<span>.00</span></strong><small>免运费</small></div><el-button type="primary" :loading="busy" :disabled="!canSubmit" @click="submit">确认兑换</el-button></div>
          </footer>
          <p class="pickup-terms">兑换成功后取消不退权益，不支持退款或退货。</p>
        </template>
      </template>
    </div>
  </UserCenterLayout>
</template>

<script setup>
import { computed, onMounted, onBeforeUnmount, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { ElMessage, ElMessageBox } from 'element-plus';
import { memberAddress } from '@/api/address';
import storage from '@/plugins/storage';
import { getPickupCard, previewPickupCard, redeemPickupCard } from '@/api/pickupCard';

const route = useRoute(), router = useRouter();
const detail = ref({}), selected = ref([]), addresses = ref([]), addressId = ref('');
const loading = ref(false), busy = ref(false), error = ref(''), completed = ref(false);
let active = true, requestVersion = 0;
const owner = storage.getItem('userInfo') || '';
/** 账号切换后丢弃旧请求结果，避免展示上一个账号的卡和地址。 */
function sameOwner() { return active && owner === (storage.getItem('userInfo') || ''); }
const canSubmit = computed(() => selected.value.length === detail.value.pickupCount && !!addressId.value && !loading.value && !detail.value.goods?.some(g => selected.value.includes(g.id) && !g.available));
const ruleText = computed(() => detail.value.pickupMode === 'ALL' ? '兑换以下全部商品' : `从以下商品任选 ${detail.value.pickupCount || 1} 种`);
const selectionHint = computed(() => {
  const remaining = (detail.value.pickupCount || 0) - selected.value.length;
  if (remaining > 0) return `还需选择 ${remaining} 种商品`;
  return addressId.value ? '商品已选齐，请核对收货地址' : '请选择收货地址';
});
/** 兼容键值及旧数组规格，过滤图片元数据，避免展示原始 JSON。 */
function specsText(value) {
  try {
    const specs = typeof value === 'string' ? JSON.parse(value || '{}') : value;
    const values = Array.isArray(specs) ? specs.filter(s => s && s.specName !== 'images').map(s => s.specValue) : Object.entries(specs || {}).filter(([key]) => key !== 'images').map(([, val]) => val);
    return values.filter(v => typeof v === 'string' || typeof v === 'number').join(' / ') || '默认规格';
  } catch { return typeof value === 'string' && !/^[\s]*[\[{]/.test(value) ? value : '默认规格'; }
}
/** 地址仅用于展示，提交后仍由服务端校验当前会员归属。 */
function addressText(address) { return `${address.name} ${address.mobile} ${address.consigneeAddressPath || ''} ${address.detail || ''}`; }
/** 刷新地址，保留仍存在的选择。 */
async function loadAddresses() {
  const response = await memberAddress();
  if (!sameOwner()) return;
  if (!response.success) throw new Error(response.message || '地址加载失败');
  addresses.value = response.result?.records || response.result || [];
  if (!addresses.value.some(a => a.id === addressId.value)) addressId.value = (addresses.value.find(a => a.isDefault) || addresses.value[0])?.id || '';
}
/** 加载卡详情；离页或新请求发起后丢弃旧响应。 */
async function load() {
  const version = ++requestVersion;
  loading.value = true; error.value = '';
  try {
    const response = await getPickupCard(route.query.id);
    if (!sameOwner() || version !== requestVersion) return;
    if (!response.success) throw new Error(response.message || '提货卡加载失败');
    detail.value = response.result;
    selected.value = detail.value.pickupMode === 'ALL' ? detail.value.goods.map(g => g.id) : [];
    await loadAddresses();
  } catch (e) { if (sameOwner() && version === requestVersion) error.value = e.message || '加载失败，请重试'; }
  finally { if (sameOwner() && version === requestVersion) loading.value = false; }
}
/** 先服务端试算再确认核销，网络异常保留选项，允许幂等重试。 */
async function submit() {
  if (busy.value || !canSubmit.value || !sameOwner()) return;
  busy.value = true;
  const payload = { credentialId: detail.value.credentialId, skuIds: [...selected.value], addressId: addressId.value };
  try {
    const preview = await previewPickupCard(payload);
    if (!sameOwner()) return;
    if (!preview.success) throw new Error(preview.message || '兑换校验失败');
    await ElMessageBox.confirm(`本次兑换 ${selected.value.length} 种商品，每种一件，免邮且实付为零。兑换后取消不退权益，不支持退款或退货。`, '确认兑换', { confirmButtonText: '确认兑换', cancelButtonText: '返回检查' });
    if (!sameOwner()) return;
    const response = await redeemPickupCard(payload);
    if (!sameOwner()) return;
    if (!response.success) throw new Error(response.message || '兑换失败');
    completed.value = true;
  } catch (e) {
    if (sameOwner() && e !== 'cancel' && e !== 'close') {
      // 网络超时可能发生在成功提交后，查询原卡确认结果，不重复创建订单。
      try { const status = await getPickupCard(payload.credentialId); if (sameOwner() && status.success && status.result?.tradeSn) { detail.value = status.result; completed.value = true; return; } } catch { /* 保留原错误供重试 */ }
      ElMessage.error(e.message || '兑换结果待确认，请重试或查看订单');
    }
  }
  finally { if (sameOwner()) busy.value = false; }
}
onMounted(load);
onBeforeUnmount(() => { active = false; requestVersion++; });
</script>

<style scoped lang="scss">
.pickup-page { padding: 10px 4px 0; color: #303133; }
.pickup-heading { display: flex; justify-content: space-between; align-items: center; gap: 20px; margin-bottom: 20px; }
.pickup-eyebrow { margin-bottom: 8px; color: #909399; font-size: 12px; }
.pickup-heading h2 { margin: 0; color: #252833; font-size: 22px; font-weight: 600; overflow-wrap: anywhere; }
.pickup-validity { padding: 5px 10px; border: 1px solid #eee; border-radius: 4px; font-size: 12px; color: #777e89; white-space: nowrap; }
.pickup-rules { display: flex; flex-wrap: wrap; align-items: center; gap: 10px 20px; padding: 16px 18px; border-radius: 6px; background: #f7f8fa; font-size: 13px; color: #858b95; }
.pickup-rules strong { color: #434953; font-weight: 500; }
.pickup-products { margin-top: 28px; }
.pickup-section-title { display: flex; justify-content: space-between; align-items: center; gap: 16px; margin-bottom: 16px; }
.pickup-section-title h3 { margin: 0; font-size: 16px; font-weight: 600; }
.pickup-section-title > span { color: #909399; font-size: 13px; }
.pickup-section-title b { color: $theme_color; font-weight: 500; }
.pickup-grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 16px; max-height: 570px; overflow-y: auto; padding: 2px 4px 2px 2px; }
.pickup-item {
  position: relative;
  display: block;
  width: 100%;
  height: auto;
  margin: 0;
  padding: 0;
  box-sizing: border-box;
  border: 1px solid #e9ebef;
  border-radius: 8px;
  overflow: hidden;
  background: #fff;
  transition: border-color .2s, box-shadow .2s;
  &:hover:not(.is-unavailable) { border-color: #e7acb1; }
  &.is-selected { border-color: $theme_color; box-shadow: 0 0 0 1px $theme_color; }
  &.is-unavailable { background: #f8f9fa; }
  :deep(.el-checkbox__input) { position: absolute; z-index: 1; top: 12px; right: 12px; }
  :deep(.el-checkbox__label) { display: block; padding: 0; width: 100%; white-space: normal; color: inherit; }
}
.pickup-image { display: flex; justify-content: center; align-items: center; height: 140px; margin: 14px 20px 0; background: #fff; }
.pickup-image :deep(.el-image) { width: 100%; height: 100%; }
.pickup-image-fallback { display: flex; height: 100%; align-items: center; justify-content: center; color: #a8abb2; background: #f7f8fa; font-size: 12px; }
.pickup-goods-info { padding: 14px; }
.pickup-goods-name { display: -webkit-box; -webkit-box-orient: vertical; -webkit-line-clamp: 2; overflow: hidden; min-height: 40px; line-height: 20px; font-size: 14px; font-weight: 500; color: #303133; }
.pickup-specs { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; margin-top: 8px; color: #6b7280; font-size: 12px; line-height: 18px; }
.pickup-store { margin-top: 4px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; color: #a0a5ae; font-size: 12px; line-height: 18px; }
.pickup-goods-unavailable { margin-top: 8px; color: #909399; font-size: 12px; }
.is-unavailable .pickup-image { opacity: .5; }
.pickup-address { margin-top: 28px; padding-top: 24px; border-top: 1px solid #eee; }
.pickup-address-select { width: 100%; }
.pickup-address-select :deep(.el-select__wrapper) { min-height: 42px; }
.pickup-address-empty { color: #909399; font-size: 13px; }
.pickup-checkout { position: sticky; bottom: 0; z-index: 2; display: flex; justify-content: space-between; align-items: center; gap: 20px; margin-top: 24px; padding: 20px 0; border-top: 1px solid #eee; background: #fff; }
.pickup-selection { display: flex; flex-direction: column; gap: 8px; font-size: 14px; }
.pickup-selection strong { font-weight: 500; }
.pickup-selection b { color: $theme_color; font-weight: 600; }
.pickup-selection > span { color: #909399; font-size: 12px; }
.pickup-submit { display: flex; align-items: center; gap: 24px; }
.pickup-payable { font-size: 13px; color: #606266; }
.pickup-payable strong { margin-left: 6px; color: $theme_color; font-size: 26px; font-weight: 600; }
.pickup-payable strong span { font-size: 16px; }
.pickup-payable small { display: block; margin-top: 4px; text-align: right; font-size: 12px; color: #909399; }
.pickup-submit :deep(.el-button) { min-width: 136px; height: 42px; border-radius: 6px; font-size: 15px; }
.pickup-terms { margin: 0; padding-bottom: 6px; color: #a0a5ae; font-size: 12px; line-height: 1.6; }
@media (max-width: 900px) { .pickup-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); } }
@media (max-width: 600px) { .pickup-grid { grid-template-columns: minmax(0, 1fr); } .pickup-checkout { flex-wrap: wrap; } .pickup-submit { width: 100%; justify-content: space-between; } .pickup-section-title { flex-wrap: wrap; } }
</style>