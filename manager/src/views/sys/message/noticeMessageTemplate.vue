<template>
  <div class="search">
    <el-row>
      <el-col :span="24">
        <el-card>
          <el-tabs v-model="activeTab" @tab-change="paneChange">
            <el-tab-pane label="站内信列表" name="MESSAGE">
              <el-form ref="searchFormRef" :model="searchMessageForm" inline label-width="70px" class="search-form">
                <el-form-item label="消息标题" prop="title">
                  <el-input
                    v-model="searchMessageForm.title"
                    placeholder="请输入消息标题"
                    clearable
                    style="width: 200px"
                  />
                </el-form-item>
                <el-form-item label="消息内容" prop="content">
                  <el-input
                    v-model="searchMessageForm.content"
                    placeholder="请输入消息内容"
                    clearable
                    style="width: 200px"
                  />
                </el-form-item>
                <el-form-item>
                  <el-button type="primary" class="search-btn" @click="handleSearch">搜索</el-button>
                </el-form-item>
              </el-form>
              <div class="operation" style="margin-top: 20px">
                <el-button type="primary" @click="sendMessage">发送消息</el-button>
              </div>
              <el-table v-loading="loading" border :data="messageData" class="mr_10" style="width: 100%">
                <el-table-column prop="title" label="消息标题" min-width="150" />
                <el-table-column prop="content" label="消息内容" min-width="350" show-overflow-tooltip />
                <el-table-column label="发送对象" width="100">
                  <template #default="{ row }">
                    <span v-if="row">{{ row.messageClient === "member" ? "会员" : row.messageClient === "store" ? "商家" : "" }}</span>
                  </template>
                </el-table-column>
                <el-table-column label="发送类型" width="100">
                  <template #default="{ row }">
                    <span v-if="row">
                      {{
                        row.messageRange === "ALL"
                          ? "全站"
                          : row.messageRange === "APPOINT"
                            ? "指定商家"
                            : row.messageRange === "MEMBER"
                              ? "指定会员"
                              : ""
                      }}</span>
                  </template>
                </el-table-column>
                <el-table-column prop="createTime" label="发送时间" width="180" />
                <el-table-column label="操作" align="center" fixed="right" width="140">
                  <template #default="{ row }">
                    <div v-if="row" class="ops">
                      <a class="link-text" @click="detail(row)">详细</a>
                      <span class="op-split">|</span>
                      <a class="link-text" @click="removeMessage(row.id)">删除</a>
                    </div>
                  </template>
                </el-table-column>
              </el-table>
              <div class="mt_10 mb_10 mr_10" style="display: flex; justify-content: flex-end">
                <el-pagination
                  v-model:current-page="searchMessageForm.pageNumber"
                  v-model:page-size="searchMessageForm.pageSize"
                  :total="messageDataTotal"
                  :page-sizes="[20, 50, 100]"
                  layout="total, sizes, prev, pager, next, jumper"
                  size="small"
                  @current-change="messageChangePage"
                  @size-change="messageChangePageSize"
                />
              </div>
            </el-tab-pane>

            <el-tab-pane label="通知类站内信" name="SETTING">
              <el-table v-loading="loading" border :data="noticeData" class="mr_10" style="width: 100%">
                <el-table-column prop="noticeNode" label="通知节点" max-width="270" />
                <el-table-column prop="noticeTitle" label="通知标题" min-width="200" />
                <el-table-column prop="noticeContent" label="通知内容" min-width="300" />
                <el-table-column label="状态" max-width="100">
                  <template #default="{ row }">
                    <el-tag v-if="row && row.noticeStatus === 'OPEN'" type="success">开启</el-tag>
                    <el-tag v-else-if="row" type="info">关闭</el-tag>
                  </template>
                </el-table-column>
                <el-table-column label="操作" align="center" fixed="right" width="140">
                  <template #default="{ row }">
                    <div v-if="row" class="ops">
                      <a class="link-text" v-if="row.noticeStatus === 'OPEN'" @click="disable(row)">关闭</a>
                      <a class="link-text" v-else @click="enable(row)">开启</a>
                      <span class="op-split">|</span>
                      <a class="link-text" @click="edit(row)">编辑</a>
                    </div>
                  </template>
                </el-table-column>
              </el-table>
              <div class="mt_10 mr_10" style="display: flex; justify-content: flex-end">
                <el-pagination
                  v-model:current-page="searchForm.pageNumber"
                  v-model:page-size="searchForm.pageSize"
                  :total="noticeDataTotal"
                  :page-sizes="[20, 50, 100]"
                  layout="total, sizes, prev, pager, next, jumper"
                  size="small"
                  @current-change="changePage"
                  @size-change="changePageSize"
                />
              </div>
            </el-tab-pane>
          </el-tabs>
        </el-card>
      </el-col>
    </el-row>

    <el-dialog
      v-model="modalVisible"
      :title="modalTitle"
      width="800px"
      :close-on-click-modal="false"
      destroy-on-close
    >
      <div class="message-title">
        <p>1、左侧#{xxx}为消息变量</p>
        <p>2、如果要发送的消息包含消息变量则将消息变量复制到消息内容中即可，注意格式</p>
        <p>3、例：比如消息变量为#{订单号}，发送的内容为：订单号为xxx的订单已经发货注意查收，完整的消息内容应该为订单号为#{订单号}的订单已经发货注意查收</p>
      </div>
      <div class="send-setting">
        <div class="left-show">
          <div v-for="(item, index) in form.variables" :key="index">
            #{<span>{{ item }}</span>}
          </div>
        </div>
        <div class="send-form">
          <el-form ref="formRef" :model="form" label-width="100px" :rules="formValidate">
            <el-form-item label="通知节点" prop="noticeNode">
              <el-input v-model="form.noticeNode" clearable maxlength="20" disabled style="width: 90%" />
            </el-form-item>
            <el-form-item label="消息标题" prop="noticeTitle">
              <el-input v-model="form.noticeTitle" clearable maxlength="20" style="width: 90%" />
            </el-form-item>
            <el-form-item label="消息内容" prop="noticeContent">
              <el-input
                v-model="form.noticeContent"
                clearable
                type="textarea"
                maxlength="50"
                :rows="4"
                show-word-limit
                style="width: 90%"
              />
            </el-form-item>
          </el-form>
        </div>
      </div>
      <template #footer>
        <el-button @click="modalVisible = false">取消</el-button>
        <el-button type="primary" :loading="submitLoading" @click="handleSubmit">保存</el-button>
      </template>
    </el-dialog>

    <el-dialog
      v-model="messageModalVisible"
      :title="messageModalTitle"
      width="800px"
      :close-on-click-modal="false"
      destroy-on-close
    >
      <el-form ref="messageSendFormRef" :model="messageSendForm" label-width="100px" :rules="messageFormValidate">
        <el-form-item label="消息标题" prop="title">
          <el-input v-model="messageSendForm.title" maxlength="15" clearable style="width: 70%" />
        </el-form-item>
        <el-form-item label="消息内容" prop="content">
          <el-input
            v-model="messageSendForm.content"
            :rows="4"
            type="textarea"
            maxlength="200"
            style="max-height: 60vh; overflow: auto; width: 70%"
          />
        </el-form-item>
        <el-form-item label="发送对象">
          <el-radio-group v-model="messageSendForm.messageClient" @change="selectObject">
            <el-radio-button value="member">会员</el-radio-button>
            <el-radio-button value="store">商家</el-radio-button>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="发送范围">
          <el-radio-group v-model="messageSendForm.messageRange" @change="selectShop">
            <el-radio-button value="ALL">全站</el-radio-button>
            <el-radio-button v-if="messageSendForm.messageClient == 'store'" value="APPOINT">指定商家</el-radio-button>
            <el-radio-button v-if="messageSendForm.messageClient == 'member'" value="MEMBER">指定会员</el-radio-button>
          </el-radio-group>
        </el-form-item>
        <el-form-item v-if="shopShow" label="指定商家">
          <el-select
            v-model="messageSendForm.userIds"
            filterable
            multiple
            style="width: 90%"
            @change="onShopIdsChange"
          >
            <el-option v-for="item in shopList" :key="item.id" :value="item.id" :label="item.storeName" />
          </el-select>
        </el-form-item>
        <el-form-item v-if="memberShow" label="选择会员" prop="scopeType">
          <div class="member-select-wrap">
            <el-button type="primary" plain @click="addVip">选择会员</el-button>
            <el-table
              v-if="messageSendForm.messageClient == 'member'"
              border
              :data="selectedMember"
              class="member-select-table"
            >
              <el-table-column prop="nickName" label="用户名称" min-width="140" show-overflow-tooltip />
              <el-table-column label="手机号" min-width="140">
                <template #default="{ row }">
                  <span v-if="row">{{ row.mobile || "暂未填写" }}</span>
                </template>
              </el-table-column>
              <el-table-column label="操作" width="80" align="center">
                <template #default="{ row, $index }">
                  <a v-if="row" class="link-text" @click="delUser($index)">删除</a>
                </template>
              </el-table-column>
            </el-table>
          </div>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="messageModalVisible = false">取消</el-button>
        <el-button type="primary" :loading="submitLoading" @click="sendMessageSubmit">发送</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="checkUserList" width="1200px" title="选择会员" destroy-on-close>
      <userList
        v-if="checkUserList"
        ref="memberLayout"
        :selectedMember="true"
        :selectedList="selectedMember"
        @callback="callbackSelectUser"
      />
      <template #footer>
        <el-button @click="cancelMemberSelect">取消</el-button>
        <el-button type="primary" @click="confirmMemberSelect">确定</el-button>
      </template>
    </el-dialog>

    <el-dialog
      v-model="messageDetailModalVisible"
      :title="modalTitle"
      width="800px"
      :close-on-click-modal="false"
      destroy-on-close
    >
      <el-form :model="messageSendForm" label-width="100px">
        <el-form-item label="消息标题" prop="title">
          <el-input v-model="messageSendForm.title" maxlength="15" clearable style="width: 50%" disabled />
        </el-form-item>
        <el-form-item label="消息内容" prop="content">
          <el-input
            v-model="messageSendForm.content"
            disabled
            :rows="4"
            type="textarea"
            style="max-height: 60vh; overflow: auto; width: 50%"
          />
        </el-form-item>
        <el-form-item label="发送对象">
          <el-radio-group v-model="messageSendForm.messageClient" disabled>
            <el-radio-button value="member">会员</el-radio-button>
            <el-radio-button value="store">商家</el-radio-button>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="发送范围">
          <el-radio-group v-model="messageSendForm.messageRange" disabled>
            <el-radio-button value="ALL">全站</el-radio-button>
            <el-radio-button v-if="messageSendForm.messageClient == 'store'" value="APPOINT">指定商家</el-radio-button>
            <el-radio-button v-if="messageSendForm.messageClient == 'member'" value="MEMBER">指定会员</el-radio-button>
          </el-radio-group>
        </el-form-item>
        <el-form-item v-if="messageSendForm.messageClient == 'store'" label="指定商家">
          <el-table
            v-loading="loading"
            border
            :data="shopMessageData"
            style="width: 100%"
            @sort-change="shopMessageChangeSort"
          >
            <el-table-column prop="storeId" label="店铺ID" max-width="300" />
            <el-table-column prop="storeName" label="店铺名称" />
            <el-table-column label="是否已读">
              <template #default="{ row }">
                <el-tag v-if="row && row.status === 'ALREADY_READY'" type="success">已读</el-tag>
                <el-tag v-else-if="row && row.status === 'UN_READY'" type="info">未读</el-tag>
                <el-tag v-else-if="row" type="info">回收站</el-tag>
              </template>
            </el-table-column>
          </el-table>
          <div class="mt_10" style="display: flex; justify-content: flex-end">
            <el-pagination
              v-model:current-page="searchShopMessageForm.pageNumber"
              v-model:page-size="searchShopMessageForm.pageSize"
              :total="shopMessageDataTotal"
              :page-sizes="[20, 50, 100]"
              layout="total, sizes, prev, pager, next, jumper"
              size="small"
              @current-change="shopMessageChangePage"
              @size-change="shopMessageChangePageSize"
            />
          </div>
        </el-form-item>
        <el-form-item v-if="messageSendForm.messageClient == 'member'" label="指定会员">
          <el-table
            v-loading="loading"
            border
            :data="memberMessageData"
            style="width: 100%"
            @sort-change="memberMessageChangeSort"
          >
            <el-table-column prop="memberId" label="会员ID" max-width="300" />
            <el-table-column prop="memberName" label="会员名称" />
            <el-table-column label="是否已读" max-width="120">
              <template #default="{ row }">
                <el-tag v-if="row && row.status === 'ALREADY_READY'" type="success">已读</el-tag>
                <el-tag v-else-if="row && row.status === 'UN_READY'" type="info">未读</el-tag>
                <el-tag v-else-if="row" type="info">回收站</el-tag>
              </template>
            </el-table-column>
          </el-table>
          <div class="mt_10" style="display: flex; justify-content: flex-end">
            <el-pagination
              v-model:current-page="searchMemberMessageForm.pageNumber"
              v-model:page-size="searchMemberMessageForm.pageSize"
              :total="memberMessageDataTotal"
              :page-sizes="[20, 50, 100]"
              layout="total, sizes, prev, pager, next, jumper"
              size="small"
              @current-change="memberMessageChangePage"
              @size-change="memberMessageChangePageSize"
            />
          </div>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="messageDetailModalVisible = false">取消</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { onMounted, reactive, ref } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import * as API_Setting from "@/api/setting.js";
import * as API_Other from "@/api/other.js";
import * as API_Shop from "@/api/shops.js";
import userList from "@/views/member/list/index";
import { regular } from "@/utils";

defineOptions({ name: "noticeMessageTemplate" });

const activeTab = ref("MESSAGE");
const checkUserList = ref(false);
const memberSelectSnapshot = ref([]);
const selectedMember = ref([]);
const loading = ref(true);
const modalVisible = ref(false);
const modalTitle = ref("");
const messageModalVisible = ref(false);
const messageModalTitle = ref("");
const messageDetailModalVisible = ref(false);
const shopShow = ref(false);
const memberShow = ref(false);
const shopList = ref([]);
const searchForm = reactive({
  pageNumber: 1,
  pageSize: 20,
  sort: "createTime",
  order: "desc",
});
const messageFormValidate = {
  title: [regular.REQUIRED, regular.VARCHAR20],
  content: [regular.REQUIRED, regular.VARCHAR255],
};
const searchMessageForm = reactive({
  pageNumber: 1,
  pageSize: 20,
});
const searchShopMessageForm = reactive({
  pageNumber: 1,
  pageSize: 20,
});
const searchMemberMessageForm = reactive({
  pageNumber: 1,
  pageSize: 20,
});
const form = ref({
  noticeNode: "",
  noticeTitle: "",
});
const messageSendForm = ref({
  messageRange: "ALL",
  messageClient: "member",
  userIds: [],
  userNames: [],
});
const formValidate = {
  noticeNode: [{ required: true, message: "请输入通知节点", trigger: "blur" }],
  noticeTitle: [{ required: true, message: "请输入通知标题", trigger: "blur" }],
  noticeContent: [{ required: true, message: "请输通知内容", trigger: "blur" }],
};
const submitLoading = ref(false);
const noticeData = ref([]);
const noticeDataTotal = ref(0);
const messageData = ref([]);
const messageDataTotal = ref(0);
const shopMessageData = ref([]);
const shopMessageDataTotal = ref(0);
const memberMessageData = ref([]);
const memberMessageDataTotal = ref(0);

// 模板 ref 与 data 重名（searchForm/form/messageSendForm），改名避免互相覆盖
const searchFormRef = ref(null);
const formRef = ref(null);
const messageSendFormRef = ref(null);

function init() {
  getMessage();
}
function callbackSelectUser(val) {
  let findUser = selectedMember.value.find((item) => item.id === val.id);
  if (!findUser) {
    selectedMember.value.push(val);
  } else {
    selectedMember.value.map((item, index) => {
      if (item.id === findUser.id) {
        selectedMember.value.splice(index, 1);
      }
    });
  }
  reSelectMember();
}
function delUser(index) {
  selectedMember.value.splice(index, 1);
  reSelectMember();
}
function reSelectMember() {
  form.value.memberDTOS = selectedMember.value.map((item) => ({
    nickName: item.nickName,
    id: item.id,
  }));
}
function getShopList() {
  loading.value = true;
  API_Shop.getShopList().then((res) => {
    loading.value = false;
    if (res.success) {
      shopList.value = res.result;
    }
  });
  loading.value = false;
}
function addVip() {
  memberSelectSnapshot.value = JSON.parse(JSON.stringify(selectedMember.value));
  checkUserList.value = true;
}
function cancelMemberSelect() {
  selectedMember.value = JSON.parse(JSON.stringify(memberSelectSnapshot.value));
  reSelectMember();
  checkUserList.value = false;
}
function confirmMemberSelect() {
  reSelectMember();
  checkUserList.value = false;
}
function paneChange(v) {
  if (v == "SETTING") {
    getNoticeMessage();
  }
  if (v == "MESSAGE") {
    getMessage();
  }
}
function changePage(v) {
  searchForm.pageNumber = v;
  getNoticeMessage();
}
function changePageSize(v) {
  searchForm.pageNumber = 1;
  searchForm.pageSize = v;
  getNoticeMessage();
}
function handleSearch() {
  searchMessageForm.pageNumber = 1;
  getMessage();
}
function messageChangePageSize(v) {
  searchMessageForm.pageSize = v;
  searchMessageForm.pageNumber = 1;
  getMessage();
}
function messageChangePage(v) {
  searchMessageForm.pageNumber = v;
  getMessage();
}
function memberMessageChangePageSize(v) {
  searchMemberMessageForm.pageSize = v;
  searchMemberMessageForm.pageNumber = 1;
  messageDetail();
}
function memberMessageChangePage(v) {
  searchMemberMessageForm.pageNumber = v;
  messageDetail();
}
function memberMessageChangeSort(e) {
  searchMemberMessageForm.sort = e.prop;
  searchMemberMessageForm.order =
    e.order === "ascending" ? "asc" : e.order === "descending" ? "desc" : "";
  messageDetail();
}
function shopMessageChangePageSize(v) {
  searchShopMessageForm.pageSize = v;
  messageDetail();
}
function shopMessageChangePage(v) {
  searchShopMessageForm.pageNumber = v;
  messageDetail();
}
function shopMessageChangeSort(e) {
  searchShopMessageForm.sort = e.prop;
  searchShopMessageForm.order =
    e.order === "ascending" ? "asc" : e.order === "descending" ? "desc" : "";
  messageDetail();
}
function onShopIdsChange(ids) {
  messageSendForm.value.userIds = ids || [];
  messageSendForm.value.userNames = (ids || []).map((id) => {
    const shop = shopList.value.find((s) => s.id === id);
    return shop ? shop.storeName : "";
  });
}
function removeMessage(id) {
  ElMessageBox.confirm("您确认删除此站内信 ?", "确认删除", { type: "warning" }).then(() => {
      API_Setting.deleteMessage(id).then((res) => {
        if (res.success) {
          ElMessage.success("删除成功");
        }
        getMessage();
      });
  }).catch(() => {});
}
function sendMessage() {
  messageModalVisible.value = true;
  messageModalTitle.value = "发送站内信";
  shopShow.value = false;
  memberShow.value = false;
  selectedMember.value = [];
  messageSendForm.value = {
    messageRange: "ALL",
    messageClient: "member",
    content: "",
    title: "",
    userIds: [],
    userNames: [],
  };
}
function sendMessageSubmit() {
  let userIds = [];
  let userNames = [];
  if (messageSendForm.value.messageClient == "member" && messageSendForm.value.messageRange == "MEMBER") {
    selectedMember.value.forEach(function (item) {
      userIds.push(item.id);
      userNames.push(item.username);
    });
    messageSendForm.value.userIds = userIds;
    messageSendForm.value.userNames = userNames;
  }

  if (messageSendForm.value.userIds.length <= 0 && messageSendForm.value.messageRange == "APPOINT") {
    ElMessage.error("请选择发送对象");
    return;
  }
  messageSendFormRef.value.validate((valid) => {
    if (valid) {
      API_Other.sendMessage(messageSendForm.value).then((res) => {
        loading.value = false;
        if (res.success) {
          ElMessage.success("发送成功");
          messageModalVisible.value = false;
          getMessage();
        }
      });
      loading.value = false;
    }
  });
}
function selectObject() {
  messageSendForm.value.messageRange = "ALL";
  shopShow.value = false;
  memberShow.value = false;
}
function selectShop(v) {
  if (v == "APPOINT") {
    getShopList();
    shopShow.value = true;
    memberShow.value = false;
  }
  if (v == "ALL") {
    shopShow.value = false;
    memberShow.value = false;
  }
  if (v == "MEMBER") {
    shopShow.value = false;
    memberShow.value = true;
    selectedMember.value = [];
  }
}
function getMessage() {
  loading.value = true;
  API_Other.getMessagePage(searchMessageForm).then((res) => {
    loading.value = false;
    if (res.success) {
      messageData.value = res.result.records;
      messageDataTotal.value = res.result.total;
    }
  });
  loading.value = false;
}
function getNoticeMessage() {
  loading.value = true;
  API_Setting.getNoticeMessageData(searchForm).then((res) => {
    loading.value = false;
    if (res.success) {
      noticeData.value = res.result.records;
      noticeDataTotal.value = res.result.total;
    }
  });
  loading.value = false;
}
function handleSubmit() {
  formRef.value.validate((valid) => {
    if (valid) {
      let params = {
        noticeContent: form.value.noticeContent,
        noticeTitle: form.value.noticeTitle,
      };
      API_Setting.editNoticeMessage(form.value.id, params).then((res) => {
        submitLoading.value = false;
        if (res.success) {
          ElMessage.success("修改成功");
          modalVisible.value = false;
          getNoticeMessage();
        }
      });
    }
  });
}
function messageDetail() {
  if (messageSendForm.value.messageClient == "member") {
    API_Other.getMemberMessage(searchMemberMessageForm).then((res) => {
      if (res.success) {
        memberMessageData.value = res.result.records;
        memberMessageDataTotal.value = res.result.total;
      }
    });
  } else {
    API_Other.getShopMessage(searchShopMessageForm).then((res) => {
      if (res.success) {
        shopMessageData.value = res.result.records;
        shopMessageDataTotal.value = res.result.total;
      }
    });
  }
}
function detail(v) {
  messageSendForm.value = v;
  if (messageSendForm.value.messageClient == "member") {
    searchMemberMessageForm.messageId = v.id;
  } else {
    searchShopMessageForm.messageId = v.id;
  }
  messageDetail();
  messageDetailModalVisible.value = true;
  modalTitle.value = "消息详情";
}
function edit(v) {
  API_Setting.getNoticeMessageDetail(v.id).then((res) => {
    if (res.success) {
      modalTitle.value = "编辑通知类推送";
      modalVisible.value = true;
      form.value = res.result;
    }
  });
}
function disable(v) {
  API_Setting.updateMessageStatus(v.id, "CLOSE").then((res) => {
    if (res.success) {
      ElMessage.success("禁用成功");
      getNoticeMessage();
    }
  });
}
function enable(v) {
  API_Setting.updateMessageStatus(v.id, "OPEN").then((res) => {
    if (res.success) {
      ElMessage.success("启用成功");
      getNoticeMessage();
    }
  });
}

onMounted(() => {
  init();
});
</script>

<style lang="scss">
@import "sms.scss";
</style>
<style lang="scss" scoped>
.ops a {
  color: #409eff;
  cursor: pointer;
  text-decoration: none;
}
.ops span {
  display: inline-block;
  margin: 0 8px;
  color: #dcdfe6;
}
.member-select-wrap {
  width: 100%;
}
.member-select-table {
  width: 100%;
  margin-top: 12px;
}
</style>
