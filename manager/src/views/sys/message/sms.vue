<template>
  <div class="search">
    <el-card>
      <el-tabs v-model="activeTab" class="sms-tabs" @tab-change="paneChange">
        <el-tab-pane label="发送任务列表" name="LIST">
          <div class="operation" style="margin-bottom: 10px">
            <el-button type="primary" @click="sendBatchSmsModal">发送短信</el-button>
          </div>
          <el-table v-loading="loading" border :data="smsData" style="width: 100%">
            <el-table-column prop="smsName" label="模板名称" width="250" />
            <el-table-column prop="signName" label="签名" width="150" />
            <el-table-column prop="context" label="短信内容" min-width="300" show-overflow-tooltip />
            <el-table-column prop="num" label="预计发送条数" width="140" />
            <el-table-column label="操作" width="120" align="center" fixed="right">
              <template #default="{ row }">
                <a v-if="row" class="link-text" @click="detail(row)">详细</a>
              </template>
            </el-table-column>
          </el-table>
          <div class="mt_10" style="display: flex; justify-content: flex-end">
            <el-pagination
              v-model:current-page="smsSearchForm.pageNumber"
              v-model:page-size="smsSearchForm.pageSize"
              :total="smsTotal"
              :page-sizes="[20, 50, 100]"
              layout="total, sizes, prev, pager, next, jumper"
              size="small"
              @current-change="smsChangePage"
              @size-change="smsChangePageSize"
            />
          </div>
        </el-tab-pane>

        <el-tab-pane label="短信模板" name="TEMPLATE">
          <div class="operation" style="margin-bottom: 10px">
            <el-button type="primary" @click="addTemplate">添加短信模板</el-button>
            <el-button type="info" @click="syncTemplate">同步</el-button>
          </div>
          <el-table v-loading="loading" border :data="templateData" style="width: 100%">
            <el-table-column prop="templateCode" label="模板code" min-width="120" />
            <el-table-column prop="templateName" label="模板名称" min-width="140" />
            <el-table-column prop="templateContent" label="模板内容" min-width="200" show-overflow-tooltip />
            <el-table-column label="状态" width="120" align="center">
              <template #default="{ row }">
                <span v-if="row">{{ templateStatusText(row.templateStatus) }}</span>
              </template>
            </el-table-column>
            <el-table-column label="操作" width="200" align="center" fixed="right">
              <template #default="{ row }">
                <template v-if="row">
                  <a
                    class="link-text"
                    :class="{ disabled: row.templateStatus != 2 }"
                    @click="row.templateStatus == 2 && editTemplate(row)"
                  >
                    编辑
                  </a>
                  <span class="op-split">|</span>
                  <a
                    class="link-text"
                    :class="{ disabled: row.templateStatus == 0 }"
                    @click="row.templateStatus != 0 && deleteSmsTemplate(row)"
                  >
                    删除
                  </a>
                </template>
              </template>
            </el-table-column>
          </el-table>
          <div class="mt_10" style="display: flex; justify-content: flex-end">
            <el-pagination
              v-model:current-page="templateSearchForm.pageNumber"
              v-model:page-size="templateSearchForm.pageSize"
              :total="templateTotal"
              :page-sizes="[20, 50, 100]"
              layout="total, sizes, prev, pager, next, jumper"
              size="small"
              @current-change="templateChangePage"
              @size-change="templateChangePageSize"
            />
          </div>
        </el-tab-pane>

        <el-tab-pane label="短信签名" name="SIGN">
          <div class="operation" style="margin-bottom: 10px">
            <el-button type="primary" @click="addSign">添加短信签名</el-button>
            <el-button type="info" @click="syncSign">同步</el-button>
          </div>
          <el-table v-loading="loading" border :data="signData" style="width: 100%">
            <el-table-column prop="signName" label="签名名称" min-width="140" />
            <el-table-column prop="remark" label="申请说明" min-width="160" show-overflow-tooltip />
            <el-table-column label="状态" width="160" align="center">
              <template #default="{ row }">
                <template v-if="row">
                  <template v-if="row.signStatus == 2">
                    审核拒绝
                    <el-popover trigger="hover" :content="row.reason" placement="top-start" width="200">
                      <template #reference>
                        <span style="color: #ed3f14; cursor: pointer">【原因】</span>
                      </template>
                    </el-popover>
                  </template>
                  <span v-else-if="row.signStatus == 0">审核中</span>
                  <span v-else-if="row.signStatus == 1">审核通过</span>
                </template>
              </template>
            </el-table-column>
            <el-table-column label="操作" width="200" align="center" fixed="right">
              <template #default="{ row }">
                <template v-if="row">
                  <a
                    class="link-text"
                    :class="{ disabled: row.signStatus != 2 }"
                    @click="row.signStatus == 2 && editSign(row)"
                  >
                    编辑
                  </a>
                  <span class="op-split">|</span>
                  <a
                    class="link-text"
                    :class="{ disabled: row.signStatus == 0 }"
                    @click="row.signStatus != 0 && deleteSmsSign(row)"
                  >
                    删除
                  </a>
                </template>
              </template>
            </el-table-column>
          </el-table>
          <div class="mt_10" style="display: flex; justify-content: flex-end">
            <el-pagination
              v-model:current-page="signSearchForm.pageNumber"
              v-model:page-size="signSearchForm.pageSize"
              :total="signTotal"
              :page-sizes="[20, 50, 100]"
              layout="total, sizes, prev, pager, next, jumper"
              size="small"
              @current-change="signChangePage"
              @size-change="signChangePageSize"
            />
          </div>
        </el-tab-pane>
      </el-tabs>
    </el-card>

    <el-dialog
      v-model="templateModalVisible"
      :title="templateModalTitle"
      width="520px"
      :close-on-click-modal="false"
      destroy-on-close
    >
      <el-form ref="templateFormRef" :model="templateForm" label-width="100px" :rules="templateFormValidate">
        <el-form-item label="模板名称" prop="templateName">
          <el-input v-model="templateForm.templateName" maxlength="30" clearable placeholder="请输入模板名称，不超过30字符" />
        </el-form-item>
        <el-form-item label="模板内容" prop="templateContent">
          <el-input
            v-model="templateForm.templateContent"
            type="textarea"
            maxlength="200"
            :rows="5"
            show-word-limit
            placeholder="请输入短信内容"
          />
        </el-form-item>
        <el-form-item label="申请说明" prop="remark">
          <el-input
            v-model="templateForm.remark"
            type="textarea"
            maxlength="150"
            :rows="4"
            show-word-limit
            placeholder="请描述您的业务使用场景"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="templateModalVisible = false">取消</el-button>
        <el-button type="primary" :loading="submitLoading" @click="templateSubmit">提交</el-button>
      </template>
    </el-dialog>

    <el-dialog
      v-model="sendSmsModal"
      :title="sendSmsModalTitle"
      width="1100px"
      :close-on-click-modal="false"
      destroy-on-close
    >
      <div class="send-setting">
        <div class="left-show" v-html="smsContent"></div>
        <div class="sms">效果预览</div>
        <div class="send-form">
          <el-form ref="smsFormRef" :model="smsForm" label-width="100px" :rules="smsFormValidate">
            <el-form-item label="短信签名" prop="signName">
              <el-select v-model="smsForm.signName" style="width: 35%" @change="selectSmsSign">
                <el-option
                  v-for="item in smsSigns"
                  :key="item.signName"
                  :label="item.signName"
                  :value="item.signName"
                />
              </el-select>
            </el-form-item>
            <el-form-item label="短信模板" prop="messageCode">
              <el-select v-model="smsForm.messageCode" style="width: 35%" @change="selectSmsTemplate">
                <el-option
                  v-for="(item, index) in smsTemplates"
                  :key="index"
                  :label="item.templateName"
                  :value="item.templateCode"
                />
              </el-select>
            </el-form-item>
            <el-form-item label="短信内容" prop="context">
              <el-input
                v-model="smsForm.context"
                type="textarea"
                maxlength="50"
                :rows="4"
                show-word-limit
                disabled
              />
            </el-form-item>
            <el-form-item label="接收人" prop="smsRange">
              <p>
                已选<span style="color: #f56c1d"> {{ memberNum }}</span>人，预计耗费条数<span style="color: #f56c1d">
                  {{ smsForm.num }}条</span
                >
              </p>
              <el-radio-group v-model="smsForm.smsRange" @change="smsRangeChange">
                <el-radio value="1">全部会员</el-radio>
                <el-radio value="2">自定义选择</el-radio>
              </el-radio-group>
            </el-form-item>
            <el-form-item v-if="customSms" label-width="0" class="choose-member-item">
              <div class="choose-member">
                <div class="source-member">
                  <el-input
                    v-model="memberSearchParam.mobile"
                    placeholder="请输入手机号码"
                    clearable
                    @keyup.enter="memberSearch"
                    @blur="memberSearch"
                  >
                    <template #append>
                      <el-button @click="memberSearch">搜索</el-button>
                    </template>
                  </el-input>
                  <el-scrollbar height="280px" class="member-scroll" @scroll="onMemberScroll">
                    <div v-for="(item, index) in members" :key="index" class="scroll-card">
                      <el-button
                        class="btns"
                        :class="{ active: item.____selected }"
                        style="width: 100%; text-align: left"
                        @click="moveMember(index, item)"
                      >
                        <span v-if="item.mobile" class="mobile">{{ item.mobile }}</span>
                        <span class="nickname">{{ item.nickName }}</span>
                      </el-button>
                    </div>
                  </el-scrollbar>
                </div>
                <div class="traget-member">
                  <el-tag
                    v-for="(item, index) in alreadyCheckShow"
                    :key="index"
                    closable
                    class="checkbox-tag"
                    @close="alreadyCheckClose(item, index)"
                  >
                    {{ item.mobile || item.nickName }}
                  </el-tag>
                </div>
              </div>
            </el-form-item>
          </el-form>
        </div>
      </div>
      <template #footer>
        <el-button @click="sendSmsModal = false">取消</el-button>
        <el-button type="primary" :loading="submitLoading" @click="sendSms">发送</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from "vue";
import { useRouter } from "vue-router";
import { ElMessage, ElMessageBox } from "element-plus";
import * as API_Setting from "@/api/setting.js";
import * as API_Member from "@/api/member.js";

defineOptions({ name: "sms" });

const router = useRouter();

const activeTab = ref("LIST");
const loading = ref(false);
const customSms = ref(false);
const alreadyCheck = ref([]);
const alreadyCheckShow = ref([]);
const memberPage = ref(0);
const members = ref([]);
const smsTemplateContent = ref("");
const memberNum = ref(0);
const smsContent = ref("<div class='sms'>效果预览</div>");
const smsTemplates = ref([]);
const smsSigns = ref([]);
const sendSmsModal = ref(false);
const sendSmsModalTitle = ref("短信发送");
const modalType = ref(0);
const templateModalVisible = ref(false);
const templateModalTitle = ref("");
const templateForm = ref({});
const submitLoading = ref(false);
const signSearchForm = reactive({ pageNumber: 1, pageSize: 20 });
const templateSearchForm = reactive({ pageNumber: 1, pageSize: 20 });
const memberSearchFrom = reactive({ disabled: "OPEN" });
const memberSearchParam = reactive({
  pageNumber: 1,
  pageSize: 8,
  disabled: "OPEN",
});
const smsSearchForm = reactive({
  sort: "createTime",
  order: "desc",
  pageNumber: 1,
  pageSize: 20,
});
const smsForm = ref({
  smsName: "",
  signName: "",
  context: "",
  smsRange: "1",
  num: 0,
  messageCode: "",
});
const smsFormValidate = reactive({
  signName: [{ required: true, message: "请选择短信签名", trigger: "change" }],
  messageCode: [{ required: true, message: "请选择短信模板", trigger: "change" }],
});
const templateFormValidate = reactive({
  templateName: [{ required: true, message: "请输入短信模板名称", trigger: "blur" }],
  templateContent: [{ required: true, message: "请输入短信模板内容", trigger: "blur" }],
  remark: [{ required: true, message: "请输入短信模板申请说明", trigger: "blur" }],
});
const smsData = ref([]);
const smsTotal = ref(0);
const templateData = ref([]);
const templateTotal = ref(0);
const signData = ref([]);
const signTotal = ref(0);
const memberLoadingMore = ref(false);

const smsFormRef = ref(null);
const templateFormRef = ref(null);

function templateStatusText(status) {
  const map = { 0: "审核中", 1: "审核通过", 2: "审核失败" };
  return map[status] ?? map[String(status)] ?? "-";
}
function init() {
  getSms();
  getMemberNum();
}
function getMemberNum() {
  API_Member.getMemberNum(memberSearchFrom).then((res) => {
    if (res.success) {
      memberNum.value = res.result;
      smsForm.value.num = memberNum.value;
    }
  });
}
function alreadyCheckClose(val, index) {
  alreadyCheck.value.splice(index, 1);
  alreadyCheckShow.value.splice(index, 1);
  members.value.forEach((item) => {
    if (item.____selected && item.mobile == val.mobile) {
      item.____selected = false;
    }
  });
  smsForm.value.num--;
  memberNum.value--;
}
function detail() {}
function smsRangeChange(v) {
  memberNum.value = 0;
  smsForm.value.num = 0;
  if (v == 1) {
    alreadyCheck.value = [];
    alreadyCheckShow.value = [];
    customSms.value = false;
    getMemberNum();
  }
  if (v == 2) {
    customSms.value = true;
    members.value = [];
    memberSearchParam.pageNumber = 1;
    getMembers();
  }
}
function memberSearch() {
  memberSearchParam.pageNumber = 1;
  members.value = [];
  getMembers();
}
function moveMember(index, item) {
  if (!item.mobile) {
    ElMessage.error("当前用户暂无手机号绑定");
    return false;
  }
  item.____selected = true;
  if (alreadyCheck.value.length == 0) {
    alreadyCheck.value.push(item.mobile);
    alreadyCheckShow.value.push(item);
    smsForm.value.num++;
    memberNum.value++;
  } else {
    const result = alreadyCheck.value.indexOf(item.mobile);
    if (result < 0) {
      smsForm.value.num++;
      memberNum.value++;
      alreadyCheck.value.push(item.mobile);
      alreadyCheckShow.value.push(item);
    }
  }
}
function onMemberScroll({ scrollTop }) {
  const wrap = document.querySelector(".member-scroll .el-scrollbar__wrap");
  if (!wrap || memberLoadingMore.value) return;
  const nearBottom = scrollTop + wrap.clientHeight >= wrap.scrollHeight - 20;
  if (nearBottom && memberPage.value != memberSearchParam.pageNumber) {
    memberLoadingMore.value = true;
    memberSearchParam.pageNumber++;
    getMembers(true);
  }
}
function getMembers(append = false) {
  API_Member.getMemberListData(memberSearchParam).then((res) => {
    memberLoadingMore.value = false;
    if (res.success) {
      res.result.records.forEach((item) => {
        item.____selected = false;
        members.value.push(item);
      });
      memberPage.value = res.result.pages;
    }
  });
}
function sendBatchSmsModal() {
  templateSearchForm.templateStatus = 1;
  API_Setting.getSmsTemplatePage(templateSearchForm).then((res) => {
    if (res.success) {
      smsTemplates.value = res.result.records;
    }
  });
  signSearchForm.signStatus = 1;
  API_Setting.getSmsSignPage(signSearchForm).then((res) => {
    if (res.success) {
      smsSigns.value = res.result.records;
    }
  });
  smsContent.value = "<div class='sms'>效果预览</div>";
  alreadyCheck.value = [];
  alreadyCheckShow.value = [];
  smsTemplateContent.value = "效果预览";
  smsForm.value = {
    smsName: "",
    signName: "",
    context: "",
    smsRange: "1",
    num: 0,
    messageCode: "",
  };
  getMemberNum();
  sendSmsModal.value = true;
}
function paneChange(name) {
  if (name == "TEMPLATE") {
    getSmsTemplate();
  }
  if (name == "SIGN") {
    getSmsSign();
  }
}
function selectSmsSign(v) {
  if (v != undefined) {
    smsContent.value = "<div class='sms'>【" + v + "】" + " " + smsTemplateContent.value + "</div>";
  } else {
    smsContent.value = "<div class='sms'>效果预览" + smsTemplateContent.value + "</div>";
  }
}
function selectSmsTemplate() {
  smsTemplates.value.forEach((e) => {
    if (smsForm.value.messageCode == e.templateCode) {
      smsTemplateContent.value = e.templateContent;
      smsForm.value.smsName = e.templateName;
    }
  });
  if (smsForm.value.signName) {
    smsContent.value =
      "<div class='sms'>【" + smsForm.value.signName + "】" + smsTemplateContent.value + "</div>";
  } else {
    smsContent.value = "<div class='sms'>" + smsTemplateContent.value + "</div>";
  }
  smsForm.value.context = smsTemplateContent.value;
}
function deleteSmsTemplate(v) {
  ElMessageBox.confirm("您确认要删除此短信模板？", "确认删除", { type: "warning" }).then(() => {
      API_Setting.deleteSmsTemplatePage({ templateCode: v.templateCode }).then((res) => {
        if (res.success) {
          ElMessage.success("删除成功");
          getSmsTemplate();
        }
      });
  }).catch(() => {});
}
function sendSms() {
  smsFormRef.value.validate((valid) => {
    if (!valid) return;
    smsForm.value.mobile = alreadyCheck.value;
    API_Setting.sendSms(smsForm.value).then((res) => {
      if (res.success) {
        ElMessage.success("发送成功");
        getSms();
        sendSmsModal.value = false;
      }
    });
  });
}
function addSign() {
  router.push({ name: "add-sms-sign" });
}
function addTemplate() {
  templateModalVisible.value = true;
  templateModalTitle.value = "添加短信模板";
  templateForm.value = {};
  modalType.value = 0;
}
function editTemplate(v) {
  templateModalVisible.value = true;
  templateModalTitle.value = "修改短信模板";
  templateForm.value = { ...v };
  modalType.value = 1;
}
function syncSign() {
  loading.value = true;
  API_Setting.syncSign().then((res) => {
    loading.value = false;
    if (res.success) {
      ElMessage.success("同步成功");
      getSmsSign();
    }
  });
}
function templateSubmit() {
  templateFormRef.value.validate((valid) => {
    if (!valid) return;
    submitLoading.value = true;
    const req =
      modalType.value == 0
        ? API_Setting.addSmsTemplatePage(templateForm.value)
        : API_Setting.editSmsTemplatePage(templateForm.value);
    req
      .then((res) => {
        submitLoading.value = false;
        if (res.success) {
          ElMessage.success(modalType.value == 0 ? "添加成功" : "修改成功");
          templateModalVisible.value = false;
          getSmsTemplate();
        }
      })
      .catch(() => {
        submitLoading.value = false;
      });
  });
}
function deleteSmsSign(v) {
  ElMessageBox.confirm("您确认要删除此短信签名？", "确认删除", { type: "warning" }).then(() => {
      API_Setting.deleteSign(v.id).then((res) => {
        if (res.success) {
          ElMessage.success("删除成功");
          getSmsSign();
        }
      });
  }).catch(() => {});
}
function syncTemplate() {
  loading.value = true;
  API_Setting.syncTemplate().then((res) => {
    loading.value = false;
    if (res.success) {
      ElMessage.success("同步成功");
      getSmsTemplate();
    }
  });
}
function smsChangePage(v) {
  smsSearchForm.pageNumber = v;
  getSms();
}
function smsChangePageSize(v) {
  smsSearchForm.pageNumber = 1;
  smsSearchForm.pageSize = v;
  getSms();
}
function templateChangePage(v) {
  templateSearchForm.pageNumber = v;
  getSmsTemplate();
}
function templateChangePageSize(v) {
  templateSearchForm.pageNumber = 1;
  templateSearchForm.pageSize = v;
  getSmsTemplate();
}
function getSmsTemplate() {
  loading.value = true;
  API_Setting.getSmsTemplatePage(templateSearchForm)
    .then((res) => {
      if (res.success) {
        templateData.value = res.result.records;
        templateTotal.value = res.result.total;
      }
    })
    .finally(() => {
      loading.value = false;
    });
}
function getSms() {
  loading.value = true;
  API_Setting.getSmsPage(smsSearchForm)
    .then((res) => {
      if (res.success) {
        smsData.value = res.result.records;
        smsTotal.value = res.result.total;
      }
    })
    .finally(() => {
      loading.value = false;
    });
}
function signChangePage(v) {
  signSearchForm.pageNumber = v;
  getSmsSign();
}
function signChangePageSize(v) {
  signSearchForm.pageNumber = 1;
  signSearchForm.pageSize = v;
  getSmsSign();
}
function editSign(v) {
  router.push({ name: "add-sms-sign", query: { id: v.id } });
}
function getSmsSign() {
  loading.value = true;
  API_Setting.getSmsSignPage(signSearchForm)
    .then((res) => {
      if (res.success) {
        signData.value = res.result.records;
        signTotal.value = res.result.total;
      }
    })
    .finally(() => {
      loading.value = false;
    });
}

onMounted(() => {
  init();
});
</script>

<style lang="scss">
@import "sms.scss";

.link-text {
  color: #409eff;
  cursor: pointer;
  text-decoration: none;
  &.disabled {
    color: #c5c8ce;
    cursor: not-allowed;
  }
}
.op-split {
  margin: 0 8px;
  color: #dcdee2;
}
.mt_10 {
  margin-top: 10px;
}
.sms-tabs {
  min-height: 500px;
}
.checkbox-tag {
  margin: 4px;
}
</style>
