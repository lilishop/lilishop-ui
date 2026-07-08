<template>
  <div class="search">
    <el-card>
      <div class="toolbar">
        <div class="toolbar-title">消息模板管理</div>
        <div>
          <el-button size="small" style="margin-right: 8px" @click="reloadCurrent">刷新</el-button>
          <el-button size="small" style="margin-right: 8px" :loading="syncOaLoading" @click="syncOaTemplates">
            同步服务号模板
          </el-button>
          <el-button size="small" :loading="syncMpLoading" @click="syncMpTemplates">同步小程序模板</el-button>
        </div>
      </div>
      <el-tabs v-model="activeTab">
        <el-tab-pane label="会员消息模板" name="member">
          <el-alert
            type="info"
            show-icon
            :closable="false"
            style="margin-bottom: 10px"
            title="支持维护站内信、微信服务号消息、微信小程序订阅消息开关。未匹配模板的渠道会显示禁用。"
          />
          <el-table v-loading="loading" border :data="memberRows" style="width: 100%">
            <el-table-column prop="index" label="序号" width="80" align="center" />
            <el-table-column prop="noticeNode" label="模板应用场景" min-width="180" show-overflow-tooltip />
            <el-table-column label="站内信" width="110" align="center">
              <template #default="{ row }">
                <el-switch
                  :model-value="isOpen(row.noticeStatus)"
                  @change="(v) => toggleNoticeChannel(v, row)"
                />
              </template>
            </el-table-column>
            <el-table-column label="微信服务号消息" width="140" align="center">
              <template #default="{ row }">
                <el-switch
                  :model-value="isOpen(row.oaStatus)"
                  :disabled="!row.oaId"
                  @change="(v) => toggleOaChannel(v, row)"
                />
              </template>
            </el-table-column>
            <el-table-column label="微信小程序订阅消息" width="160" align="center">
              <template #default="{ row }">
                <el-switch
                  :model-value="isOpen(row.mpStatus)"
                  :disabled="!row.mpId"
                  @change="(v) => toggleMpChannel(v, row)"
                />
              </template>
            </el-table-column>
            <el-table-column label="邮箱" width="120" align="center">
              <template #default="{ row }">
                <el-switch
                  :model-value="isOpen(row.emailStatus)"
                  :disabled="!row.emailContent"
                  @change="(v) => toggleEmailChannel(v, row)"
                />
              </template>
            </el-table-column>
            <el-table-column label="操作" width="400" align="center" fixed="right">
              <template #default="{ row }">
                <div class="ops">
                  <a class="link-text" @click="openNoticeModal(row)">站内信</a>
                  <span class="op-split">|</span>
                  <a
                    :class="row.oaId ? 'link-text' : 'link-disabled'"
                    @click="row.oaId && openOaModal(row)"
                  >
                    微信服务号消息
                  </a>
                  <span class="op-split">|</span>
                  <a
                    :class="row.mpId ? 'link-text' : 'link-disabled'"
                    @click="row.mpId && openMpModal(row)"
                  >
                    微信小程序订阅消息
                  </a>
                  <span class="op-split">|</span>
                  <a class="link-text" @click="openEmailModal(row)">邮箱</a>
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
              @current-change="loadMemberPage"
              @size-change="changePageSize"
            />
          </div>
        </el-tab-pane>
        <el-tab-pane label="商户消息模板" name="store">
          <el-alert type="info" :closable="false" title="商户消息模板待扩展，后续可复用会员模板能力。" />
        </el-tab-pane>
        <el-tab-pane label="平台消息模板" name="platform">
          <el-alert type="info" :closable="false" title="平台消息模板待扩展，后续可复用会员模板能力。" />
        </el-tab-pane>
        <el-tab-pane label="邮箱消息模板" name="email">
          <el-alert type="info" :closable="false" title="邮箱消息模板待扩展，后续可按场景映射邮箱模板。" />
        </el-tab-pane>
      </el-tabs>
    </el-card>

    <el-dialog v-model="noticeModalVisible" title="站内信模板" width="700px">
      <el-form label-width="120px">
        <el-form-item label="模板应用场景">
          <el-input :model-value="currentRow.noticeNode || '-'" readonly />
        </el-form-item>
        <el-form-item label="启用">
          <el-switch
            :model-value="isOpen(currentRow.noticeStatus)"
            @change="(v) => toggleNoticeChannel(v, currentRow)"
          />
        </el-form-item>
        <el-form-item label="模板内容">
          <el-input :model-value="noticeDetailText" type="textarea" :autosize="{ minRows: 4, maxRows: 8 }" readonly />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="noticeModalVisible = false">关闭</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="oaModalVisible" title="微信服务号消息模板" width="700px">
      <el-form label-width="140px">
        <el-form-item label="模板应用场景">
          <el-input :model-value="currentRow.noticeNode || '-'" readonly />
        </el-form-item>
        <el-form-item label="启用">
          <el-switch
            :model-value="isOpen(currentRow.oaStatus)"
            :disabled="!currentRow.oaId"
            @change="(v) => toggleOaChannel(v, currentRow)"
          />
        </el-form-item>
        <el-form-item label="模板名称">
          <el-input :model-value="currentRow.oaName || '-'" readonly />
        </el-form-item>
        <el-form-item label="微信模板ID">
          <el-input :model-value="currentRow.oaCode || '-'" readonly />
        </el-form-item>
        <el-form-item label="模板内容">
          <el-input
            :model-value="currentRow.oaContent || '-'"
            type="textarea"
            :autosize="{ minRows: 4, maxRows: 8 }"
            readonly
          />
        </el-form-item>
        <el-alert v-if="!currentRow.oaId" type="warning" :closable="false" title="当前场景未匹配到微信服务号模板。" />
      </el-form>
      <template #footer>
        <el-button @click="oaModalVisible = false">关闭</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="emailModalVisible" title="邮箱消息模板" width="700px">
      <el-form label-width="120px">
        <el-form-item label="模板应用场景">
          <el-input :model-value="currentRow.noticeNode || '-'" readonly />
        </el-form-item>
        <el-form-item label="启用">
          <el-switch
            :model-value="isOpen(currentRow.emailStatus)"
            @change="(v) => toggleEmailChannel(v, currentRow)"
          />
        </el-form-item>
        <el-form-item label="模板内容">
          <el-input :model-value="emailDetailText" type="textarea" :autosize="{ minRows: 4, maxRows: 8 }" readonly />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="emailModalVisible = false">关闭</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="mpModalVisible" title="微信小程序订阅消息模板" width="700px">
      <el-form label-width="150px">
        <el-form-item label="模板应用场景">
          <el-input :model-value="currentRow.noticeNode || '-'" readonly />
        </el-form-item>
        <el-form-item label="启用">
          <el-switch
            :model-value="isOpen(currentRow.mpStatus)"
            :disabled="!currentRow.mpId"
            @change="(v) => toggleMpChannel(v, currentRow)"
          />
        </el-form-item>
        <el-form-item label="模板名称">
          <el-input :model-value="currentRow.mpName || '-'" readonly />
        </el-form-item>
        <el-form-item label="公共模板库ID">
          <el-input :model-value="currentRow.mpTemplateId || '-'" readonly />
        </el-form-item>
        <el-form-item label="订阅消息模板ID">
          <el-input :model-value="currentRow.mpCode || '-'" readonly />
        </el-form-item>
        <el-form-item label="模板内容">
          <el-input
            :model-value="currentRow.mpContent || '-'"
            type="textarea"
            :autosize="{ minRows: 4, maxRows: 8 }"
            readonly
          />
        </el-form-item>
        <el-alert v-if="!currentRow.mpId" type="warning" :closable="false" title="当前场景未匹配到微信小程序模板。" />
      </el-form>
      <template #footer>
        <el-button @click="mpModalVisible = false">关闭</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script>
import { ElMessage } from "element-plus";
import * as API_Setting from "@/api/setting.js";

export default {
  name: "messageTemplate",
  data() {
    return {
      loading: false,
      activeTab: "member",
      syncOaLoading: false,
      syncMpLoading: false,
      total: 0,
      searchForm: {
        pageNumber: 1,
        pageSize: 20,
      },
      memberRows: [],
      currentRow: {},
      noticeDetailText: "",
      noticeModalVisible: false,
      oaModalVisible: false,
      mpModalVisible: false,
      emailModalVisible: false,
      emailDetailText: "",
    };
  },
  methods: {
    isOpen(status) {
      return String(status || "").toUpperCase() === "OPEN";
    },
    wechatEnableToOpenClose(enable) {
      if (enable === true || enable === "true" || enable === 1) return "OPEN";
      return "CLOSE";
    },
    toOpenClose(flag) {
      return flag ? "OPEN" : "CLOSE";
    },
    safeText(v) {
      return v === undefined || v === null ? "" : String(v);
    },
    pickByKeys(obj, keys) {
      for (let i = 0; i < keys.length; i++) {
        const val = obj ? obj[keys[i]] : "";
        if (val !== undefined && val !== null && val !== "") return val;
      }
      return "";
    },
    formatOaContent(item) {
      if (!item) return "";
      const first = this.pickByKeys(item, ["first", "title", "name"]);
      const remark = this.pickByKeys(item, ["remark", "content"]);
      const keywords = Array.isArray(item.keywords)
        ? item.keywords.map((k) => this.pickByKeys(k, ["name", "value", "label"])).filter(Boolean).join(" / ")
        : this.safeText(item.keywordsText || "");
      return [first, keywords, remark].filter(Boolean).join("\n");
    },
    formatMpContent(item) {
      if (!item) return "";
      const keywordsText = this.safeText(item.keywordsText);
      if (keywordsText) return keywordsText;
      if (Array.isArray(item.keywords)) {
        return item.keywords.map((k) => this.pickByKeys(k, ["name", "value", "label"])).filter(Boolean).join(" / ");
      }
      return this.safeText(item.content);
    },
    async loadMemberPage() {
      this.loading = true;
      try {
        const res = await API_Setting.getMessageTemplateAggregatePage(this.searchForm);
        if (!(res && res.success && res.result)) {
          this.memberRows = [];
          this.total = 0;
          ElMessage.error((res && res.message) || "加载消息模板失败");
          return;
        }
        const records = res.result.records || [];
        this.total = res.result.total || 0;
        this.memberRows = records.map((agg, idx) => {
          const item = { ...(agg.notice || {}) };
          const oa = agg.wechatOa;
          const mp = agg.wechatMp;
          return {
            ...item,
            emailStatus: item.emailStatus || "CLOSE",
            emailContent: item.emailContent || "",
            index: (this.searchForm.pageNumber - 1) * this.searchForm.pageSize + idx + 1,
            oaId: oa ? oa.id : "",
            oaName: oa ? this.pickByKeys(oa, ["name", "templateName", "title"]) : "",
            oaCode: oa ? this.pickByKeys(oa, ["code", "templateId"]) : "",
            oaStatus: oa ? this.wechatEnableToOpenClose(oa.enable) : "",
            oaRaw: oa || null,
            oaContent: this.formatOaContent(oa),
            mpId: mp ? mp.id : "",
            mpName: mp ? this.pickByKeys(mp, ["name", "templateName", "title"]) : "",
            mpTemplateId: mp ? this.pickByKeys(mp, ["templateId"]) : "",
            mpCode: mp ? this.pickByKeys(mp, ["code"]) : "",
            mpStatus: mp ? this.wechatEnableToOpenClose(mp.enable) : "",
            mpRaw: mp || null,
            mpContent: this.formatMpContent(mp),
          };
        });
      } finally {
        this.loading = false;
      }
    },
    reloadCurrent() {
      if (this.activeTab === "member") this.loadMemberPage();
    },
    async syncOaTemplates() {
      this.syncOaLoading = true;
      try {
        const res = await API_Setting.wechatMessageSync();
        if (res && res.success) {
          await this.loadMemberPage();
          ElMessage.success("服务号模板同步成功");
        } else {
          ElMessage.error((res && res.message) || "服务号模板同步失败");
        }
      } finally {
        this.syncOaLoading = false;
      }
    },
    async syncMpTemplates() {
      this.syncMpLoading = true;
      try {
        const res = await API_Setting.wechatMPMessageSync();
        if (res && res.success) {
          await this.loadMemberPage();
          ElMessage.success("小程序模板同步成功");
        } else {
          ElMessage.error((res && res.message) || "小程序模板同步失败");
        }
      } finally {
        this.syncMpLoading = false;
      }
    },
    changePageSize() {
      this.searchForm.pageNumber = 1;
      this.loadMemberPage();
    },
    async openNoticeModal(row) {
      this.currentRow = { ...row };
      this.noticeDetailText = row.noticeContent || "";
      this.noticeModalVisible = true;
      const res = await API_Setting.getNoticeMessageDetail(row.id);
      if (res && res.success && res.result) {
        const d = res.result;
        this.noticeDetailText = [d.noticeTitle, d.noticeContent].filter(Boolean).join("\n");
      }
    },
    openOaModal(row) {
      this.currentRow = { ...row };
      this.oaModalVisible = true;
    },
    openMpModal(row) {
      this.currentRow = { ...row };
      this.mpModalVisible = true;
    },
    async openEmailModal(row) {
      this.currentRow = { ...row };
      const fallback = row.emailContent || row.noticeContent || "";
      this.emailDetailText = row.noticeTitle ? [row.noticeTitle, fallback].filter(Boolean).join("\n") : fallback;
      this.emailModalVisible = true;
      const res = await API_Setting.getNoticeMessageDetail(row.id);
      if (res && res.success && res.result) {
        const d = res.result;
        if (d.emailContent) {
          this.emailDetailText = d.emailContent;
        } else {
          this.emailDetailText = [d.noticeTitle, d.noticeContent].filter(Boolean).join("\n");
        }
      }
    },
    updateRowStatus(row, key, val) {
      const idx = this.memberRows.findIndex((x) => x.id === row.id);
      if (idx >= 0) this.memberRows[idx][key] = val;
      if (this.currentRow && this.currentRow.id === row.id) this.currentRow[key] = val;
    },
    async toggleNoticeChannel(v, row) {
      const old = row.noticeStatus;
      this.updateRowStatus(row, "noticeStatus", this.toOpenClose(v));
      const res = await API_Setting.updateMessageStatus(row.id, this.toOpenClose(v));
      if (!(res && res.success)) {
        this.updateRowStatus(row, "noticeStatus", old);
        ElMessage.error((res && res.message) || "站内信开关更新失败");
      } else {
        ElMessage.success("站内信开关更新成功");
      }
    },
    async toggleOaChannel(v, row) {
      if (!row.oaId) return;
      const old = row.oaStatus;
      this.updateRowStatus(row, "oaStatus", this.toOpenClose(v));
      const params = { id: row.oaId, enable: v };
      try {
        const res = await API_Setting.editWechatMessageTemplate(row.oaId, params);
        if (!(res && res.success)) {
          this.updateRowStatus(row, "oaStatus", old);
          ElMessage.error((res && res.message) || "服务号开关更新失败");
        } else {
          ElMessage.success("服务号开关更新成功");
        }
      } catch (e) {
        this.updateRowStatus(row, "oaStatus", old);
        ElMessage.error((e && e.message) || "服务号开关更新失败");
      }
    },
    async toggleMpChannel(v, row) {
      if (!row.mpId) return;
      const old = row.mpStatus;
      this.updateRowStatus(row, "mpStatus", this.toOpenClose(v));
      const params = { id: row.mpId, enable: v };
      const res = await API_Setting.editWechatMPMessageTemplate(row.mpId, params);
      if (!(res && res.success)) {
        this.updateRowStatus(row, "mpStatus", old);
        ElMessage.error((res && res.message) || "小程序开关更新失败");
      } else {
        ElMessage.success("小程序开关更新成功");
      }
    },
    async toggleEmailChannel(v, row) {
      const old = row.emailStatus || "CLOSE";
      this.updateRowStatus(row, "emailStatus", this.toOpenClose(v));
      const res = await API_Setting.updateNoticeMessageEmailStatus(row.id, this.toOpenClose(v));
      if (!(res && res.success)) {
        this.updateRowStatus(row, "emailStatus", old);
        ElMessage.error((res && res.message) || "邮箱开关更新失败");
      } else {
        ElMessage.success("邮箱开关更新成功");
      }
    },
  },
  mounted() {
    this.loadMemberPage();
  },
};
</script>

<style lang="scss" scoped>
.toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}
.toolbar-title {
  font-weight: 600;
}
.ops a {
  color: #409eff;
  cursor: pointer;
  text-decoration: none;
}
.link-disabled {
  color: #c0c4cc;
  cursor: not-allowed;
  text-decoration: none;
}
.op-split {
  display: inline-block;
  margin: 0 8px;
  color: #dcdfe6;
}
</style>
