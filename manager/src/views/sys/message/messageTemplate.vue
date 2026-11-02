<template>
  <div class="search">
    <el-card>
      <div class="toolbar">
        <div>
          <div class="toolbar-title">消息模板管理</div>
          <div class="toolbar-sub">统一维护站内信、短信、微信公众号及小程序订阅消息的触达规则</div>
        </div>
      </div>

      <el-tabs v-model="activeTab" @tab-change="handleTabChange">
        <el-tab-pane label="会员模板消息" name="MEMBER" />
        <el-tab-pane label="商户模板消息" name="STORE" />
        <el-tab-pane label="平台消息模板" name="PLATFORM" />
        <el-tab-pane label="渠道设置" name="SETTING" />
      </el-tabs>


      <template v-if="activeTab !== 'SETTING'">
      <el-table v-loading="loading" border :data="tableRows" style="width: 100%">
        <el-table-column prop="index" label="序号" width="70" align="center" />
        <el-table-column prop="noticeNode" label="模板消息描述" min-width="190" show-overflow-tooltip />

        <!-- 站内信开关（平台端不展示） -->
        <el-table-column v-if="activeTab !== 'PLATFORM'" label="站内信" width="100" align="center">
          <template #default="{ row }">
            <el-switch
              :model-value="isOpen(row.noticeStatus)"
              :loading="row._switchLoading === 'NOTICE'"
              @change="(v) => handleSwitchChange(row, 'NOTICE', v)"
            />
          </template>
        </el-table-column>

        <!-- 短信开关 -->
        <el-table-column label="短信" width="100" align="center">
          <template #default="{ row }">
            <el-switch
              :model-value="isOpen(row.smsStatus)"
              :loading="row._switchLoading === 'SMS'"
              @change="(v) => handleSwitchChange(row, 'SMS', v)"
            />
          </template>
        </el-table-column>

        <!-- 微信公众号开关（平台端不展示） -->
        <el-table-column v-if="activeTab !== 'PLATFORM'" label="微信公众号" width="120" align="center">
          <template #default="{ row }">
            <el-switch
              :model-value="isOpen(row.oaStatus)"
              :loading="row._switchLoading === 'WECHAT_OA'"
              @change="(v) => handleSwitchChange(row, 'WECHAT_OA', v)"
            />
          </template>
        </el-table-column>

        <!-- 微信小程序订阅消息开关（仅会员端展示） -->
        <el-table-column v-if="activeTab === 'MEMBER'" label="微信小程序" width="120" align="center">
          <template #default="{ row }">
            <el-switch
              :model-value="isOpen(row.mpStatus)"
              :loading="row._switchLoading === 'WECHAT_MP'"
              @change="(v) => handleSwitchChange(row, 'WECHAT_MP', v)"
            />
          </template>
        </el-table-column>

        <!-- 操作列 -->
        <el-table-column label="操作" :width="activeTab === 'PLATFORM' ? 120 : (activeTab === 'STORE' ? 240 : 340)" align="center" fixed="right">
          <template #default="{ row }">
            <div class="ops" v-if="activeTab === 'MEMBER'">
              <a class="link-text" @click="openNoticeModal(row)">站内信</a>
              <span class="op-split">|</span>
              <a class="link-text" @click="openSmsModal(row)">短信</a>
              <span class="op-split">|</span>
              <a class="link-text" @click="openOaModal(row)">微信公众号</a>
              <span class="op-split">|</span>
              <a class="link-text" @click="openMpModal(row)">微信小程序</a>
            </div>
            <div class="ops" v-else-if="activeTab === 'STORE'">
              <a class="link-text" @click="openNoticeModal(row)">站内信</a>
              <span class="op-split">|</span>
              <a class="link-text" @click="openSmsModal(row)">短信</a>
              <span class="op-split">|</span>
              <a class="link-text" @click="openOaModal(row)">微信公众号</a>
            </div>
            <div class="ops" v-else>
              <a class="link-text" @click="openSmsModal(row)">短信</a>
            </div>
          </template>
        </el-table-column>
      </el-table>

      <div class="mt_10" style="display: flex; justify-content: flex-end">
        <el-pagination
          v-model:current-page="searchForm.pageNumber"
          v-model:page-size="searchForm.pageSize"
          :total="total"
          :page-sizes="[20, 50, 100]"
          layout="total, sizes, prev, pager, next, jumper"
          size="small"
          @current-change="loadPage"
          @size-change="changePageSize"
        />
      </div>
      </template>

      <!-- 渠道设置 -->
      <div v-else class="channel-setting">
        <div class="setting-section">
          <div class="section-title">公众号通知设置</div>
          <el-form v-loading="oaSettingLoading" :model="oaSettingForm" label-width="140px" class="setting-form">
            <el-form-item label="开启公众号通知">
              <el-switch v-model="oaSettingForm.enabled" />
              <span class="form-tip">关闭后小程序端不展示公众号通知入口</span>
            </el-form-item>
            <el-form-item label="公众号名称">
              <el-input v-model="oaSettingForm.accountName" maxlength="30" placeholder="如：Lilishop商城" />
            </el-form-item>
            <el-form-item label="引导关注文章链接" :required="oaSettingForm.enabled">
              <el-input v-model="oaSettingForm.articleUrl" placeholder="https://mp.weixin.qq.com/s/xxxxxx">
                <template #append>
                  <el-button :disabled="!oaSettingForm.articleUrl" @click="previewOaArticle">预览</el-button>
                </template>
              </el-input>
            </el-form-item>
            <el-divider content-position="left">服务器配置（公众号后台 → 设置与开发 → 基本配置）</el-divider>
            <el-form-item label="令牌 Token">
              <el-input v-model="oaSettingForm.serverToken" maxlength="32" placeholder="与公众号后台「服务器配置」中的 Token 保持一致" />
            </el-form-item>
            <el-form-item label="EncodingAESKey">
              <el-input
                v-model="oaSettingForm.encodingAesKey"
                maxlength="43"
                show-word-limit
                placeholder="安全模式 / 兼容模式必填，明文模式可留空"
              />
            </el-form-item>
            <el-form-item label="关注自动回复">
              <el-input
                v-model="oaSettingForm.subscribeReply"
                type="textarea"
                :autosize="{ minRows: 3, maxRows: 6 }"
                maxlength="300"
                show-word-limit
                placeholder="如：绑定成功，订单发货、售后、提现结果会第一时间通知您"
              />
            </el-form-item>
            <el-form-item>
              <el-button type="primary" :loading="oaSettingSaving" @click="saveOaSetting">保存设置</el-button>
            </el-form-item>
          </el-form>
        </div>

        <div class="setting-section">
          <div class="section-title">微信模板同步</div>
          <div class="sync-row">
            <el-button type="primary" plain :loading="syncOaLoading" @click="syncOaTemplates">同步服务号模板</el-button>
            <span class="form-tip">同步微信公众号（服务号）-模板消息，行业类目：电商平台</span>
          </div>
          <div class="sync-row">
            <el-button type="primary" plain :loading="syncMpLoading" @click="syncMpTemplates">同步小程序模板</el-button>
            <span class="form-tip">同步微信小程序订阅消息模板，行业类目：电商平台</span>
          </div>
        </div>
      </div>
    </el-card>

    <!-- 1. 站内信编辑弹窗（可编辑） -->
    <el-dialog v-model="noticeModalVisible" title="站内信模板编辑" width="650px">
      <el-form label-width="110px">
        <el-form-item label="是否开启">
          <el-switch v-model="formNotice.status" active-value="OPEN" inactive-value="CLOSE" />
        </el-form-item>
        <el-form-item label="消息标题">
          <el-input v-model="formNotice.title" placeholder="请输入站内信标题" />
        </el-form-item>
        <el-form-item label="* 模板内容">
          <el-input
            v-model="formNotice.content"
            type="textarea"
            :autosize="{ minRows: 4, maxRows: 8 }"
            placeholder="请输入站内信正文，支持变量替换"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="noticeModalVisible = false">取消</el-button>
        <el-button type="primary" :loading="saving" @click="saveNoticeModal">确定保存</el-button>
      </template>
    </el-dialog>

    <!-- 2. 短信配置弹窗（内容严格只读） -->
    <el-dialog v-model="smsModalVisible" title="短信模板配置" width="650px">
      <el-form label-width="120px">
        <el-form-item label="是否开启">
          <el-switch v-model="formSms.status" active-value="OPEN" inactive-value="CLOSE" />
        </el-form-item>
        <el-form-item label="* 短信模板ID">
          <el-input v-model="formSms.smsTemplateCode" placeholder="如 SMS_191840050" />
        </el-form-item>
        <el-form-item label-width="0">
          <el-alert
            type="info"
            :closable="false"
            title="短信平台模板变量名需与消息变量一致（如订单号变量为 order_sn），正文由短信平台模板决定，此处仅作预览参考"
          />
        </el-form-item>
        <el-form-item label="模板内容">
          <el-input
            :model-value="formSms.content || '暂无内容预览'"
            type="textarea"
            :autosize="{ minRows: 3, maxRows: 6 }"
            resize="none"
            readonly
            class="readonly-textarea"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="smsModalVisible = false">取消</el-button>
        <el-button type="primary" :loading="saving" @click="saveSmsModal">确定保存</el-button>
      </template>
    </el-dialog>

    <!-- 3. 微信公众号服务号配置弹窗（内容严格只读） -->
    <el-dialog v-model="oaModalVisible" title="微信公众号模板配置" width="650px">
      <el-form label-width="120px">
        <el-form-item label="是否开启">
          <el-switch v-model="formOa.enable" />
        </el-form-item>
        <el-form-item label="* 微信模板ID">
          <el-input v-model="formOa.code" placeholder="如 yp9KCxtyxbaASE1trmtnw..." />
        </el-form-item>
        <el-form-item label="模板格式预览">
          <el-input
            :model-value="formOa.content || '暂无格式内容'"
            type="textarea"
            :autosize="{ minRows: 4, maxRows: 7 }"
            resize="none"
            readonly
            class="readonly-textarea"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="oaModalVisible = false">取消</el-button>
        <el-button type="primary" :loading="saving" @click="saveOaModal">确定保存</el-button>
      </template>
    </el-dialog>

    <!-- 4. 微信小程序订阅消息配置弹窗（内容严格只读） -->
    <el-dialog v-model="mpModalVisible" title="微信小程序订阅消息配置" width="650px">
      <el-form label-width="130px">
        <el-form-item label="是否开启">
          <el-switch v-model="formMp.enable" />
        </el-form-item>
        <el-form-item label="* 订阅模板ID">
          <el-input v-model="formMp.code" placeholder="小程序后台分配的订阅消息模板ID" />
        </el-form-item>
        <el-form-item label="模板格式预览">
          <el-input
            :model-value="formMp.content || '暂无格式内容'"
            type="textarea"
            :autosize="{ minRows: 4, maxRows: 7 }"
            resize="none"
            readonly
            class="readonly-textarea"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="mpModalVisible = false">取消</el-button>
        <el-button type="primary" :loading="saving" @click="saveMpModal">确定保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { onMounted, ref } from "vue";
import { ElMessage } from "element-plus";
import * as API_Setting from "@/api/setting.js";
import { getSetting, setSetting } from "@/api/index";

defineOptions({ name: "messageTemplate" });

const loading = ref(false);
const saving = ref(false);
const activeTab = ref("MEMBER");
const syncOaLoading = ref(false);
const syncMpLoading = ref(false);
const total = ref(0);

const searchForm = ref({
  pageNumber: 1,
  pageSize: 20,
});

const tableRows = ref([]);

// 弹窗状态与表单对象
const noticeModalVisible = ref(false);
const formNotice = ref({ id: "", sceneName: "", title: "", content: "", status: "CLOSE" });

const smsModalVisible = ref(false);
const formSms = ref({ id: "", sceneName: "", smsTemplateCode: "", content: "", status: "CLOSE" });

const oaModalVisible = ref(false);
const formOa = ref({ id: "", sceneName: "", code: "", content: "", enable: false });

const mpModalVisible = ref(false);
const formMp = ref({ id: "", sceneName: "", code: "", content: "", enable: false });

// 公众号通知设置（SettingEnum.WECHAT_OFFICIAL_ACCOUNT_SETTING）
const OA_SETTING_KEY = "WECHAT_OFFICIAL_ACCOUNT_SETTING";
const oaSettingLoading = ref(false);
const oaSettingSaving = ref(false);
const emptyOaSetting = () => ({
  enabled: false,
  accountName: "",
  articleUrl: "",
  serverToken: "",
  encodingAesKey: "",
  subscribeReply: "",
});
const oaSettingForm = ref(emptyOaSetting());

async function loadOaSetting() {
  oaSettingLoading.value = true;
  try {
    const res = await getSetting(OA_SETTING_KEY);
    const data = (res && res.success && res.result) || {};
    oaSettingForm.value = Object.assign(emptyOaSetting(), data, { enabled: data.enabled === true });
  } finally {
    oaSettingLoading.value = false;
  }
}

function previewOaArticle() {
  if (oaSettingForm.value.articleUrl) window.open(oaSettingForm.value.articleUrl, "_blank");
}

async function saveOaSetting() {
  const form = oaSettingForm.value;
  const url = (form.articleUrl || "").trim();
  if (form.enabled && !url) {
    ElMessage.warning("开启公众号通知时必须配置引导关注文章链接");
    return;
  }
  if (url && !url.startsWith("https://mp.weixin.qq.com/")) {
    ElMessage.warning("文章链接必须是 https://mp.weixin.qq.com/ 开头的公众号文章地址");
    return;
  }
  const aesKey = (form.encodingAesKey || "").trim();
  if (aesKey && aesKey.length !== 43) {
    ElMessage.warning("EncodingAESKey 长度必须为 43 位");
    return;
  }
  oaSettingSaving.value = true;
  try {
    const res = await setSetting(OA_SETTING_KEY, { ...form, articleUrl: url, encodingAesKey: aesKey });
    if (res && res.success) {
      ElMessage.success("保存成功");
    }
  } finally {
    oaSettingSaving.value = false;
  }
}

function isOpen(status) {
  return String(status || "").toUpperCase() === "OPEN";
}

function wechatEnableToOpenClose(enable) {
  return enable === true || enable === "true" || enable === 1 ? "OPEN" : "CLOSE";
}

function safeText(v) {
  return v === undefined || v === null ? "" : String(v);
}

function pickByKeys(obj, keys) {
  for (let i = 0; i < keys.length; i++) {
    const val = obj ? obj[keys[i]] : "";
    if (val !== undefined && val !== null && val !== "") return val;
  }
  return "";
}

function formatOaContent(item) {
  if (!item) return "";
  const first = pickByKeys(item, ["first", "title", "name"]);
  const remark = pickByKeys(item, ["remark", "content"]);
  const keywords = Array.isArray(item.keywords)
    ? item.keywords.map((k) => pickByKeys(k, ["name", "value", "label"])).filter(Boolean).join(" / ")
    : safeText(item.keywordsText || "");
  return [first, keywords, remark].filter(Boolean).join("\n");
}

const MP_KEYWORD_LABELS = {
  GOODS_INFO: "物品名称",
  ORDER_SN: "订单编号",
  AFTER_SALE_SN: "售后单号",
  AUDIT_RESULT: "审核结果",
  CHANGE_POINT: "变动数量",
  CURRENT_POINT: "当前积分",
  POINT_TIME: "积分变更时间",
  CHANGE_AMOUNT: "变动金额",
  WALLET_BALANCE: "账户余额",
  WALLET_TIME: "时间",
  CHANGE_REASON: "变动原因",
  WITHDRAW_AMOUNT: "提现金额",
  WITHDRAW_RESULT: "提现结果",
  APPLY_TIME: "申请时间",
  WARM_REMIND: "温馨提醒",
  LOGISTICS_TIME: "发货时间",
  COMPLETE_TIME: "完成时间",
  PINTUAN_TIME: "成团时间",
  REMARK: "温馨提示",
  LOGISTICS_NAME: "快递公司",
  LOGISTICS_NO: "快递单号",
  SHOP_NAME: "商家名称",
  MEMBER_NAME: "买家昵称",
  PRICE: "订单金额",
  PAYMENT_TIME: "支付时间",
};

function formatMpContent(item) {
  if (!item) return "";
  try {
    const keys = typeof item.keywords === "string" ? JSON.parse(item.keywords) : item.keywords;
    const texts = typeof item.keywordsText === "string" ? JSON.parse(item.keywordsText) : item.keywordsText;
    if (Array.isArray(keys) && Array.isArray(texts) && keys.length === texts.length && keys.length > 0) {
      const isGoodsNameLabel = item.sceneCode !== "ORDER_DELIVER";
      return keys
        .map((k, idx) => {
          let label = MP_KEYWORD_LABELS[k] || k;
          if (isGoodsNameLabel && k === "GOODS_INFO") label = "商品名称";
          if (isGoodsNameLabel && k === "ORDER_SN") label = "订单号";
          const field = texts[idx] || "";
          const placeholder = field.includes(".DATA") ? `{{${field}}}` : `{{${field}.DATA}}`;
          return `${label}：${placeholder}`;
        })
        .join("\n");
    }
  } catch (e) {
    // fallback below
  }
  const keywordsText = safeText(item.keywordsText);
  if (keywordsText) return keywordsText;
  if (Array.isArray(item.keywords)) {
    return item.keywords.map((k) => pickByKeys(k, ["name", "value", "label"])).filter(Boolean).join(" / ");
  }
  return safeText(item.content);
}

// 加载分页
async function loadPage() {
  loading.value = true;
  try {
    const params = {
      ...searchForm.value,
      type: activeTab.value,
    };
    const res = await API_Setting.getMessageTemplateAggregatePage(params);
    if (!(res && res.success && res.result)) {
      tableRows.value = [];
      total.value = 0;
      ElMessage.error((res && res.message) || "加载消息模板失败");
      return;
    }
    const records = res.result.records || [];
    total.value = res.result.total || 0;
    tableRows.value = records.map((agg, idx) => {
      const item = { ...(agg.notice || {}) };
      const oa = agg.wechatOa;
      const mp = agg.wechatMp;
      return {
        ...item,
        smsStatus: item.smsStatus || "CLOSE",
        smsTemplateCode: item.smsTemplateCode || "",
        smsContent: item.smsContent || "",
        index: (searchForm.value.pageNumber - 1) * searchForm.value.pageSize + idx + 1,
        oaId: oa ? oa.id : "",
        oaName: oa ? pickByKeys(oa, ["name", "templateName", "title"]) : "",
        oaCode: oa ? pickByKeys(oa, ["code", "templateId"]) : "",
        oaStatus: oa ? wechatEnableToOpenClose(oa.enable) : "CLOSE",
        oaRaw: oa || null,
        oaContent: formatOaContent(oa),
        mpId: mp ? mp.id : "",
        mpName: mp ? pickByKeys(mp, ["name", "templateName", "title"]) : "",
        mpCode: mp ? pickByKeys(mp, ["code", "templateId"]) : "",
        mpStatus: mp ? wechatEnableToOpenClose(mp.enable) : "CLOSE",
        mpRaw: mp || null,
        mpContent: formatMpContent(mp),
        _switchLoading: "",
      };
    });
  } finally {
    loading.value = false;
  }
}

function handleTabChange() {
  searchForm.value.pageNumber = 1;
  if (activeTab.value === "SETTING") {
    loadOaSetting();
    return;
  }
  loadPage();
}

function changePageSize() {
  searchForm.value.pageNumber = 1;
  loadPage();
}

// 行内 Switch 快速切换
async function handleSwitchChange(row, channel, value) {
  const targetStatus = value ? "OPEN" : "CLOSE";
  row._switchLoading = channel;
  try {
    const res = await API_Setting.updateMessageChannelSwitch({
      id: row.id,
      channel,
      status: targetStatus,
    });
    if (res && res.success) {
      if (channel === "NOTICE") row.noticeStatus = targetStatus;
      else if (channel === "SMS") row.smsStatus = targetStatus;
      else if (channel === "WECHAT_OA") row.oaStatus = targetStatus;
      else if (channel === "WECHAT_MP") row.mpStatus = targetStatus;
      ElMessage.success("开关状态已更新");
    } else {
      ElMessage.error((res && res.message) || "更新开关失败");
    }
  } catch (e) {
    ElMessage.error("网络异常，更新开关失败");
  } finally {
    row._switchLoading = "";
  }
}

// 1. 打开站内信弹窗
function openNoticeModal(row) {
  formNotice.value = {
    id: row.id,
    sceneName: row.noticeNode,
    title: row.noticeTitle || "",
    content: row.noticeContent || "",
    status: isOpen(row.noticeStatus) ? "OPEN" : "CLOSE",
  };
  noticeModalVisible.value = true;
}

async function saveNoticeModal() {
  if (!formNotice.value.content) {
    ElMessage.warning("请输入模板内容");
    return;
  }
  saving.value = true;
  try {
    const res = await API_Setting.updateNoticeMessageTemplate({
      id: formNotice.value.id,
      title: formNotice.value.title,
      content: formNotice.value.content,
      status: formNotice.value.status,
    });
    if (res && res.success) {
      ElMessage.success("站内信配置已保存");
      noticeModalVisible.value = false;
      loadPage();
    } else {
      ElMessage.error((res && res.message) || "保存失败");
    }
  } finally {
    saving.value = false;
  }
}

// 2. 打开短信弹窗
function openSmsModal(row) {
  formSms.value = {
    id: row.id,
    sceneName: row.noticeNode,
    smsTemplateCode: row.smsTemplateCode || "",
    content: row.smsContent || "",
    status: isOpen(row.smsStatus) ? "OPEN" : "CLOSE",
  };
  smsModalVisible.value = true;
}

async function saveSmsModal() {
  saving.value = true;
  try {
    const res = await API_Setting.updateSmsMessageTemplateConfig({
      id: formSms.value.id,
      smsTemplateCode: formSms.value.smsTemplateCode,
      status: formSms.value.status,
    });
    if (res && res.success) {
      ElMessage.success("短信模板配置已保存");
      smsModalVisible.value = false;
      loadPage();
    } else {
      ElMessage.error((res && res.message) || "保存失败");
    }
  } finally {
    saving.value = false;
  }
}

// 3. 打开微信公众号弹窗
function openOaModal(row) {
  formOa.value = {
    id: row.id,
    sceneName: row.noticeNode,
    code: row.oaCode || "",
    content: row.oaContent || "",
    enable: isOpen(row.oaStatus),
  };
  oaModalVisible.value = true;
}

async function saveOaModal() {
  saving.value = true;
  try {
    const res = await API_Setting.updateWechatOaMessageTemplate({
      id: formOa.value.id,
      code: formOa.value.code,
      enable: formOa.value.enable,
    });
    if (res && res.success) {
      ElMessage.success("微信公众号模板配置已保存");
      oaModalVisible.value = false;
      loadPage();
    } else {
      ElMessage.error((res && res.message) || "保存失败");
    }
  } finally {
    saving.value = false;
  }
}

// 4. 打开微信小程序弹窗
function openMpModal(row) {
  formMp.value = {
    id: row.id,
    sceneName: row.noticeNode,
    code: row.mpCode || "",
    content: row.mpContent || "",
    enable: isOpen(row.mpStatus),
  };
  mpModalVisible.value = true;
}

async function saveMpModal() {
  saving.value = true;
  try {
    const res = await API_Setting.updateWechatMpMessageTemplate({
      id: formMp.value.id,
      code: formMp.value.code,
      enable: formMp.value.enable,
    });
    if (res && res.success) {
      ElMessage.success("微信小程序订阅消息配置已保存");
      mpModalVisible.value = false;
      loadPage();
    } else {
      ElMessage.error((res && res.message) || "保存失败");
    }
  } finally {
    saving.value = false;
  }
}

// 同步微信服务号模板
async function syncOaTemplates() {
  syncOaLoading.value = true;
  try {
    const res = await API_Setting.wechatMessageSync();
    if (res && res.success) {
      await loadPage();
      ElMessage.success("服务号模板同步成功");
    } else {
      ElMessage.error((res && res.message) || "服务号模板同步失败");
    }
  } finally {
    syncOaLoading.value = false;
  }
}

// 同步微信小程序模板
async function syncMpTemplates() {
  syncMpLoading.value = true;
  try {
    const res = await API_Setting.wechatMPMessageSync();
    if (res && res.success) {
      await loadPage();
      ElMessage.success("小程序模板同步成功");
    } else {
      ElMessage.error((res && res.message) || "小程序模板同步失败");
    }
  } finally {
    syncMpLoading.value = false;
  }
}

onMounted(() => {
  loadPage();
});
</script>

<style scoped lang="scss">
.toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;

  .toolbar-title {
    font-size: 16px;
    font-weight: 600;
    color: #303133;
  }

  .toolbar-sub {
    font-size: 12px;
    color: #909399;
    margin-top: 4px;
  }
}

.ops {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 8px;

  .link-text {
    color: #409eff;
    cursor: pointer;
    text-decoration: none;
    font-size: 13px;

    &:hover {
      color: #66b1ff;
      text-decoration: underline;
    }
  }

  .op-split {
    color: #dcdfe6;
  }
}

.form-tip {
  font-size: 12px;
  color: #909399;
  margin-top: 4px;
}

.channel-setting {
  max-width: 860px;
}

.setting-section {
  margin-bottom: 24px;

  .section-title {
    font-size: 14px;
    font-weight: 600;
    color: #303133;
    margin-bottom: 16px;
    padding-left: 8px;
    border-left: 3px solid #409eff;
  }
}

.setting-form {
  max-width: 720px;
}

.sync-row {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
}



:deep(.readonly-textarea .el-textarea__inner) {
  background-color: #f5f7fa;
  color: #606266;
  cursor: not-allowed;
  resize: none !important;
  overflow-y: hidden;
}
</style>
