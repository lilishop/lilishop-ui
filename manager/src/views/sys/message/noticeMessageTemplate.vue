<template>
  <div class="search">
    <el-row>
      <el-col :span="24">
        <el-card>
          <el-tabs v-model="activeTab" @tab-change="paneChange">
            <el-tab-pane label="站内信列表" name="MESSAGE">
              <el-form ref="searchForm" :model="searchMessageForm" inline label-width="70px" class="search-form">
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
          <el-form ref="form" :model="form" label-width="100px" :rules="formValidate">
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
      <el-form ref="messageSendForm" :model="messageSendForm" label-width="100px" :rules="messageFormValidate">
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

<script>
import { ElMessage, ElMessageBox } from "element-plus";
import * as API_Setting from "@/api/setting.js";
import * as API_Other from "@/api/other.js";
import * as API_Shop from "@/api/shops.js";
import userList from "@/views/member/list/index";
import { regular } from "@/utils";

export default {
  name: "noticeMessageTemplate",
  components: {
    userList,
  },
  data() {
    return {
      activeTab: "MESSAGE",
      checkUserList: false,
      memberSelectSnapshot: [],
      selectedMember: [],
      loading: true,
      modalVisible: false,
      modalTitle: "",
      messageModalVisible: false,
      messageModalTitle: "",
      messageDetailModalVisible: false,
      shopShow: false,
      memberShow: false,
      shopList: [],
      searchForm: {
        pageNumber: 1,
        pageSize: 20,
        sort: "createTime",
        order: "desc",
      },
      messageFormValidate: {
        title: [regular.REQUIRED, regular.VARCHAR20],
        content: [regular.REQUIRED, regular.VARCHAR255],
      },
      searchMessageForm: {
        pageNumber: 1,
        pageSize: 20,
      },
      searchShopMessageForm: {
        pageNumber: 1,
        pageSize: 20,
      },
      searchMemberMessageForm: {
        pageNumber: 1,
        pageSize: 20,
      },
      form: {
        noticeNode: "",
        noticeTitle: "",
      },
      messageSendForm: {
        messageRange: "ALL",
        messageClient: "member",
        userIds: [],
        userNames: [],
      },
      formValidate: {
        noticeNode: [{ required: true, message: "请输入通知节点", trigger: "blur" }],
        noticeTitle: [{ required: true, message: "请输入通知标题", trigger: "blur" }],
        noticeContent: [{ required: true, message: "请输通知内容", trigger: "blur" }],
      },
      submitLoading: false,
      noticeData: [],
      noticeDataTotal: 0,
      messageData: [],
      messageDataTotal: 0,
      shopMessageData: [],
      shopMessageDataTotal: 0,
      memberMessageData: [],
      memberMessageDataTotal: 0,
    };
  },
  methods: {
    init() {
      this.getMessage();
    },
    callbackSelectUser(val) {
      let findUser = this.selectedMember.find((item) => item.id === val.id);
      if (!findUser) {
        this.selectedMember.push(val);
      } else {
        this.selectedMember.map((item, index) => {
          if (item.id === findUser.id) {
            this.selectedMember.splice(index, 1);
          }
        });
      }
      this.reSelectMember();
    },
    delUser(index) {
      this.selectedMember.splice(index, 1);
      this.reSelectMember();
    },
    reSelectMember() {
      this.form.memberDTOS = this.selectedMember.map((item) => ({
        nickName: item.nickName,
        id: item.id,
      }));
    },
    getShopList() {
      this.loading = true;
      API_Shop.getShopList().then((res) => {
        this.loading = false;
        if (res.success) {
          this.shopList = res.result;
        }
      });
      this.loading = false;
    },
    addVip() {
      this.memberSelectSnapshot = JSON.parse(JSON.stringify(this.selectedMember));
      this.checkUserList = true;
    },
    cancelMemberSelect() {
      this.selectedMember = JSON.parse(JSON.stringify(this.memberSelectSnapshot));
      this.reSelectMember();
      this.checkUserList = false;
    },
    confirmMemberSelect() {
      this.reSelectMember();
      this.checkUserList = false;
    },
    paneChange(v) {
      if (v == "SETTING") {
        this.getNoticeMessage();
      }
      if (v == "MESSAGE") {
        this.getMessage();
      }
    },
    changePage(v) {
      this.searchForm.pageNumber = v;
      this.getNoticeMessage();
    },
    changePageSize(v) {
      this.searchForm.pageNumber = 1;
      this.searchForm.pageSize = v;
      this.getNoticeMessage();
    },
    handleSearch() {
      this.searchMessageForm.pageNumber = 1;
      this.getMessage();
    },
    messageChangePageSize(v) {
      this.searchMessageForm.pageSize = v;
      this.searchMessageForm.pageNumber = 1;
      this.getMessage();
    },
    messageChangePage(v) {
      this.searchMessageForm.pageNumber = v;
      this.getMessage();
    },
    memberMessageChangePageSize(v) {
      this.searchMemberMessageForm.pageSize = v;
      this.searchMemberMessageForm.pageNumber = 1;
      this.messageDetail();
    },
    memberMessageChangePage(v) {
      this.searchMemberMessageForm.pageNumber = v;
      this.messageDetail();
    },
    memberMessageChangeSort(e) {
      this.searchMemberMessageForm.sort = e.prop;
      this.searchMemberMessageForm.order =
        e.order === "ascending" ? "asc" : e.order === "descending" ? "desc" : "";
      this.messageDetail();
    },
    shopMessageChangePageSize(v) {
      this.searchShopMessageForm.pageSize = v;
      this.messageDetail();
    },
    shopMessageChangePage(v) {
      this.searchShopMessageForm.pageNumber = v;
      this.messageDetail();
    },
    shopMessageChangeSort(e) {
      this.searchShopMessageForm.sort = e.prop;
      this.searchShopMessageForm.order =
        e.order === "ascending" ? "asc" : e.order === "descending" ? "desc" : "";
      this.messageDetail();
    },
    onShopIdsChange(ids) {
      this.messageSendForm.userIds = ids || [];
      this.messageSendForm.userNames = (ids || []).map((id) => {
        const shop = this.shopList.find((s) => s.id === id);
        return shop ? shop.storeName : "";
      });
    },
    removeMessage(id) {
      ElMessageBox.confirm("您确认删除此站内信 ?", "确认删除", { type: "warning" }).then(() => {
          API_Setting.deleteMessage(id).then((res) => {
            if (res.success) {
              ElMessage.success("删除成功");
            }
            this.getMessage();
          });
      }).catch(() => {});
    },
    sendMessage() {
      this.messageModalVisible = true;
      this.messageModalTitle = "发送站内信";
      this.shopShow = false;
      this.memberShow = false;
      this.selectedMember = [];
      this.messageSendForm = {
        messageRange: "ALL",
        messageClient: "member",
        content: "",
        title: "",
        userIds: [],
        userNames: [],
      };
    },
    sendMessageSubmit() {
      let userIds = [];
      let userNames = [];
      if (this.messageSendForm.messageClient == "member" && this.messageSendForm.messageRange == "MEMBER") {
        this.selectedMember.forEach(function (item) {
          userIds.push(item.id);
          userNames.push(item.username);
        });
        this.messageSendForm.userIds = userIds;
        this.messageSendForm.userNames = userNames;
      }

      if (this.messageSendForm.userIds.length <= 0 && this.messageSendForm.messageRange == "APPOINT") {
        ElMessage.error("请选择发送对象");
        return;
      }
      this.$refs["messageSendForm"].validate((valid) => {
        if (valid) {
          API_Other.sendMessage(this.messageSendForm).then((res) => {
            this.loading = false;
            if (res.success) {
              ElMessage.success("发送成功");
              this.messageModalVisible = false;
              this.getMessage();
            }
          });
          this.loading = false;
        }
      });
    },
    selectObject() {
      this.messageSendForm.messageRange = "ALL";
      this.shopShow = false;
      this.memberShow = false;
    },
    selectShop(v) {
      if (v == "APPOINT") {
        this.getShopList();
        this.shopShow = true;
        this.memberShow = false;
      }
      if (v == "ALL") {
        this.shopShow = false;
        this.memberShow = false;
      }
      if (v == "MEMBER") {
        this.shopShow = false;
        this.memberShow = true;
        this.selectedMember = [];
      }
    },
    getMessage() {
      this.loading = true;
      API_Other.getMessagePage(this.searchMessageForm).then((res) => {
        this.loading = false;
        if (res.success) {
          this.messageData = res.result.records;
          this.messageDataTotal = res.result.total;
        }
      });
      this.loading = false;
    },
    getNoticeMessage() {
      this.loading = true;
      API_Setting.getNoticeMessageData(this.searchForm).then((res) => {
        this.loading = false;
        if (res.success) {
          this.noticeData = res.result.records;
          this.noticeDataTotal = res.result.total;
        }
      });
      this.loading = false;
    },
    handleSubmit() {
      this.$refs.form.validate((valid) => {
        if (valid) {
          let params = {
            noticeContent: this.form.noticeContent,
            noticeTitle: this.form.noticeTitle,
          };
          API_Setting.editNoticeMessage(this.form.id, params).then((res) => {
            this.submitLoading = false;
            if (res.success) {
              ElMessage.success("修改成功");
              this.modalVisible = false;
              this.getNoticeMessage();
            }
          });
        }
      });
    },
    messageDetail() {
      if (this.messageSendForm.messageClient == "member") {
        API_Other.getMemberMessage(this.searchMemberMessageForm).then((res) => {
          if (res.success) {
            this.memberMessageData = res.result.records;
            this.memberMessageDataTotal = res.result.total;
          }
        });
      } else {
        API_Other.getShopMessage(this.searchShopMessageForm).then((res) => {
          if (res.success) {
            this.shopMessageData = res.result.records;
            this.shopMessageDataTotal = res.result.total;
          }
        });
      }
    },
    detail(v) {
      this.messageSendForm = v;
      if (this.messageSendForm.messageClient == "member") {
        this.searchMemberMessageForm.messageId = v.id;
      } else {
        this.searchShopMessageForm.messageId = v.id;
      }
      this.messageDetail();
      this.messageDetailModalVisible = true;
      this.modalTitle = "消息详情";
    },
    edit(v) {
      API_Setting.getNoticeMessageDetail(v.id).then((res) => {
        if (res.success) {
          this.modalTitle = "编辑通知类推送";
          this.modalVisible = true;
          this.form = res.result;
        }
      });
    },
    disable(v) {
      API_Setting.updateMessageStatus(v.id, "CLOSE").then((res) => {
        if (res.success) {
          ElMessage.success("禁用成功");
          this.getNoticeMessage();
        }
      });
    },
    enable(v) {
      API_Setting.updateMessageStatus(v.id, "OPEN").then((res) => {
        if (res.success) {
          ElMessage.success("启用成功");
          this.getNoticeMessage();
        }
      });
    },
  },
  mounted() {
    this.init();
  },
};
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
