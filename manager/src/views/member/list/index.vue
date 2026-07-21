<template>
  <div class="search">
    <el-card>
      <el-form
        ref="searchForm"
        :model="searchForm"
        inline
        label-width="70px"
        class="search-form"
        @keyup.enter="handleSearch"
      >
        <el-form-item label="会员ID" prop="id">
          <el-input v-model="searchForm.id" placeholder="请输入会员ID" clearable style="width: 240px" />
        </el-form-item>
        <el-form-item label="会员名称" prop="username">
          <el-input v-model="searchForm.username" placeholder="请输入会员名称" clearable style="width: 240px" />
        </el-form-item>
        <el-form-item label="会员昵称" prop="nickName">
          <el-input v-model="searchForm.nickName" placeholder="请输入会员昵称" clearable style="width: 240px" />
        </el-form-item>
        <el-form-item label="联系方式" prop="mobile">
          <el-input v-model="searchForm.mobile" placeholder="请输入会员联系方式" clearable style="width: 240px" />
        </el-form-item>
        <el-form-item label="会员分组" prop="groupId">
          <el-select v-model="searchForm.groupId" clearable filterable style="width: 240px">
            <el-option
              v-for="item in memberGroupList"
              :key="item.id"
              :value="item.id"
              :label="item.groupName"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="会员等级" prop="gradeId">
          <el-select v-model="searchForm.gradeId" clearable filterable style="width: 240px">
            <el-option
              v-for="item in memberGradeList"
              :key="item.id"
              :value="item.id"
              :label="item.gradeName"
            />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" class="search-btn" @click="handleSearch">搜索</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-card>
      <div v-if="!selectedMember" class="operation padding-row">
        <el-button type="primary" @click="addMember">添加会员</el-button>
        <el-button
          style="margin-left: 10px"
          type="primary"
          :disabled="selectedRows.length === 0"
          @click="openSetMemberGroup"
        >设定会员分组</el-button>
      </div>

      <el-table
        ref="table"
        v-loading="loading"
        border
        :data="data"
        class="mt_10"
        style="width: 100%"
        row-key="id"
        @selection-change="onSelectionChange"
      >
        <el-table-column
          v-if="!selectedMember || checkboxSelect"
          type="selection"
          width="60"
          align="center"
          :reserve-selection="checkboxSelect"
        />
        <el-table-column prop="id" label="会员ID" min-width="120" show-overflow-tooltip />
        <el-table-column label="头像" min-width="80" align="center">
          <template #default="{ row }">
            <img
              v-if="row"
              :src="row.face || defaultPic"
              alt="头像"
              style="width: 30px; height: 30px; border-radius: 50%; object-fit: cover"
            />
          </template>
        </el-table-column>
        <el-table-column prop="username" label="会员名称" min-width="150" show-overflow-tooltip />
        <el-table-column prop="nickName" label="会员昵称" min-width="120" show-overflow-tooltip />
        <el-table-column label="联系方式" min-width="130">
          <template #default="{ row }">
            <span v-if="row">{{ row.mobile || "" }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="注册时间" min-width="160" />
        <el-table-column prop="lastLoginDate" label="最后登录时间" min-width="160" />
        <el-table-column label="积分数量" min-width="120" align="left">
          <template #default="{ row }">
            <span v-if="row">{{ row.point == void 0 ? "0" : row.point }}</span>
          </template>
        </el-table-column>
        <el-table-column label="经验值" min-width="100">
          <template #default="{ row }">
            <span v-if="row">{{ row.experience == null ? "0" : row.experience }}</span>
          </template>
        </el-table-column>
        <el-table-column label="会员等级" min-width="120" show-overflow-tooltip>
          <template #default="{ row }">
            <span v-if="row">{{ row.gradeName || "-" }}</span>
          </template>
        </el-table-column>
        <el-table-column label="余额" width="120">
          <template #default="{ row }">
            <priceColorScheme v-if="row" :value="row.memberWallet" :color="$mainColor" />
          </template>
        </el-table-column>
        <el-table-column
          v-if="!selectedMember || !checkboxSelect"
          label="操作"
          width="200"
          align="center"
          fixed="right"
        >
          <template #default="{ row }">
            <div v-if="row" style="display: flex; justify-content: center; align-items: center">
              <template v-if="selectedMember && !checkboxSelect">
                <a class="link-text" @click="callback(row)">
                  {{ row.___selected ? "已选择" : "选择" }}
                </a>
              </template>
              <template v-else>
                <a class="link-text" @click="detail(row)">查看</a>
                <span class="op-split">|</span>
                <el-dropdown trigger="click" @command="(cmd) => handleMoreCommand(cmd, row)">
                  <a class="link-text">
                    更多
                    <el-icon style="margin-left: 4px"><ArrowDown /></el-icon>
                  </a>
                  <template #dropdown>
                    <el-dropdown-menu>
                      <el-dropdown-item command="edit">编辑会员</el-dropdown-item>
                      <el-dropdown-item command="increaseWallet">增加余额</el-dropdown-item>
                      <el-dropdown-item command="updatePoint">修改积分</el-dropdown-item>
                      <el-dropdown-item command="disabled">禁用会员</el-dropdown-item>
                    </el-dropdown-menu>
                  </template>
                </el-dropdown>
              </template>
            </div>
          </template>
        </el-table-column>
      </el-table>

      <div class="mt_10" style="display: flex; justify-content: flex-end">
        <el-pagination
          v-model:current-page="searchForm.pageNumber"
          v-model:page-size="searchForm.pageSize"
          :page-sizes="[20, 50, 100]"
          :total="total"
          layout="total, sizes, prev, pager, next, jumper"
          size="small"
          @current-change="changePage"
          @size-change="changePageSize"
        />
      </div>
    </el-card>

    <el-dialog v-model="addFlag" title="添加会员" width="500px" destroy-on-close class="add-member-dialog">
      <el-form
        ref="addMemberForm"
        :model="addMemberForm"
        :rules="addRule"
        label-width="100px"
        autocomplete="off"
      >
        <el-form-item label="手机号码" prop="mobile" style="width: 90%">
          <el-input
            v-model="addMemberForm.mobile"
            maxlength="11"
            placeholder="请输入手机号码"
            autocomplete="off"
          />
        </el-form-item>
        <el-form-item label="会员名称" prop="username" style="width: 90%">
          <el-input
            v-model="addMemberForm.username"
            maxlength="15"
            placeholder="请输入会员名称"
            autocomplete="off"
            name="member-username"
          />
        </el-form-item>
        <el-form-item label="会员密码" prop="password" style="width: 90%">
          <el-input
            v-model="addMemberForm.password"
            type="password"
            show-password
            maxlength="20"
            placeholder="请输入会员密码"
            autocomplete="new-password"
            name="member-password"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="addFlag = false">取消</el-button>
        <el-button type="primary" @click="addMemberSubmit">确定</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="descFlag" :title="descTitle" width="500px" destroy-on-close>
      <el-form ref="form" :model="form" :rules="ruleValidate" label-width="80px">
        <el-input v-model="form.id" style="display: none" />
        <el-form-item label="头像">
          <img :src="form.face || defaultPic" class="face" />
          <el-button
            type="primary"
            link
            class="upload"
            @click="openPicSelector"
          >修改</el-button>
        </el-form-item>
        <el-form-item label="用户名" prop="name">
          <el-input v-model="form.username" style="width: 200px" disabled />
        </el-form-item>
        <el-form-item label="用户昵称" prop="name">
          <el-input v-model="form.nickName" style="width: 200px" />
        </el-form-item>
        <el-form-item label="性别" prop="sex">
          <el-radio-group v-model="form.sex">
            <el-radio-button :value="1">男</el-radio-button>
            <el-radio-button :value="0">女</el-radio-button>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="修改密码" prop="password">
          <el-input v-model="form.newPassword" type="password" show-password style="width: 220px" />
        </el-form-item>
        <el-form-item label="生日" prop="birthday">
          <el-date-picker v-model="form.birthday" type="date" value-format="YYYY-MM-DD" style="width: 220px" />
        </el-form-item>
        <el-form-item label="所在地" prop="mail">
          {{ form.region || "暂无地址" }}
          <el-button style="margin-left: 10px" @click="$refs.map.open()">选择</el-button>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="descFlag = false">取消</el-button>
        <el-button type="primary" @click="handleSubmitModal">确定</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="walletIncreaseFlag" title="增加余额" width="420px" destroy-on-close>
      <el-form ref="walletIncreaseForm" :model="walletIncreaseForm" :rules="walletIncreaseRule" label-width="90px">
        <el-form-item label="充值金额" prop="rechargeMoney">
          <el-input-number v-model="walletIncreaseForm.rechargeMoney" :min="0.01" :precision="2" style="width: 240px" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="walletIncreaseFlag = false">取消</el-button>
        <el-button type="primary" :loading="walletIncreaseLoading" @click="submitWalletIncrease">确定</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="memberPointFlag" title="修改积分" width="420px" destroy-on-close>
      <el-form ref="memberPointForm" :model="memberPointForm" :rules="memberPointRule" label-width="90px">
        <el-form-item label="类型" prop="type">
          <el-radio-group v-model="memberPointForm.type">
            <el-radio-button value="INCREASE">增加</el-radio-button>
            <el-radio-button value="REDUCE">减少</el-radio-button>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="积分" prop="point">
          <el-input-number v-model="memberPointForm.point" :min="1" :precision="0" style="width: 240px" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="memberPointFlag = false">取消</el-button>
        <el-button type="primary" :loading="memberPointLoading" @click="submitMemberPoint">确定</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="memberGroupFlag" title="设定会员分组" width="420px" destroy-on-close>
      <el-form ref="memberGroupForm" :model="memberGroupForm" :rules="memberGroupRule" label-width="90px">
        <el-form-item label="会员分组" prop="groupId">
          <el-select v-model="memberGroupForm.groupId" clearable filterable style="width: 240px">
            <el-option
              v-for="item in memberGroupList"
              :key="item.id"
              :value="item.id"
              :label="item.groupName"
            />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="memberGroupFlag = false">取消</el-button>
        <el-button type="primary" :loading="memberGroupLoading" @click="submitSetMemberGroup">确定</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="picModelFlag" width="1200px">
      <ossManage ref="ossManage" @callback="callbackSelected" :isComponent="true" :initialize="picModelFlag" />
    </el-dialog>
    <multipleMap ref="map" @callback="selectedRegion" />
  </div>
</template>

<script>
import { ArrowDown } from "@element-plus/icons-vue";
import multipleMap from "@/components/map/multiple-map";
import * as API_Member from "@/api/member.js";
import ossManage from "@/views/sys/oss-manage/ossManage";
import * as RegExp from "@/libs/RegExp.js";
import { ElMessage, ElMessageBox } from "element-plus";
import { customRouterPush } from "@/utils/filters";
import defaultPic from "@/assets/default.png";

export default {
  name: "member",
  components: {
    multipleMap,
    ossManage,
    ArrowDown,
  },
  props: {
    selectedMember: {
      type: Boolean,
      default: false,
    },
    selectedList: {
      type: null,
      default: () => [],
    },
    checkboxSelect: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      defaultPic,
      descTitle: "",
      descFlag: false,
      loading: true,
      addFlag: false,
      addMemberForm: {
        mobile: "",
        username: "",
        password: "",
      },
      searchForm: {
        pageNumber: 1,
        pageSize: 20,
        order: "desc",
        id: "",
        username: "",
        mobile: "",
        disabled: "OPEN",
        groupId: "",
      },
      picModelFlag: false,
      form: {},
      walletIncreaseFlag: false,
      walletIncreaseLoading: false,
      walletIncreaseForm: {
        memberId: "",
        rechargeMoney: null,
      },
      walletIncreaseRule: {
        rechargeMoney: [
          { required: true, type: "number", message: "请输入充值金额", trigger: "change" },
          {
            validator: (rule, value, callback) => {
              if (typeof value !== "number" || value <= 0) {
                callback(new Error("充值金额必须大于0"));
                return;
              }
              callback();
            },
            trigger: "change",
          },
        ],
      },
      memberPointFlag: false,
      memberPointLoading: false,
      memberPointForm: {
        memberId: "",
        point: null,
        type: "INCREASE",
      },
      selectedRows: [],
      memberGroupFlag: false,
      memberGroupLoading: false,
      memberGroupForm: {
        groupId: "",
      },
      memberGroupRule: {
        groupId: [{ required: true, message: "请选择会员分组", trigger: "change" }],
      },
      memberGroupList: [],
      memberGradeList: [],
      memberPointRule: {
        type: [{ required: true, message: "请选择类型", trigger: "change" }],
        point: [
          { required: true, type: "number", message: "请输入积分", trigger: "change" },
          {
            validator: (rule, value, callback) => {
              if (typeof value !== "number" || value <= 0) {
                callback(new Error("积分必须大于0"));
                return;
              }
              callback();
            },
            trigger: "change",
          },
        ],
      },
      addRule: {
        mobile: [
          { required: true, message: "请输入手机号码" },
          { pattern: RegExp.mobile, message: "请输入正确的手机号" },
        ],
        username: [{ required: true, message: "请输入会员名称" }],
        password: [{ required: true, message: "请输入密码" }],
      },
      ruleValidate: {},
      data: [],
      total: 0,
      selectMember: [],
    };
  },
  watch: {
    selectedList: {
      handler(val) {
        this.selectMember = JSON.parse(JSON.stringify(val));
        this.init(this.data);
      },
      deep: true,
      immediate: true,
    },
  },
  methods: {
    handleMoreCommand(name, row) {
      if (name === "edit") this.editPerm(row);
      if (name === "disabled") this.disabled(row);
      if (name === "increaseWallet") this.openWalletIncrease(row);
      if (name === "updatePoint") this.openMemberPoint(row);
    },
    onSelectionChange(selection) {
      if (this.selectedMember && this.checkboxSelect) {
        this.selectMember = selection || [];
        return;
      }
      this.selectedRows = selection || [];
    },
    getSelection() {
      return this.selectMember || [];
    },
    syncTableSelection() {
      if (!this.selectedMember || !this.checkboxSelect) {
        return;
      }
      this.$nextTick(() => {
        this.clearSelection();
        this.data.forEach((row) => {
          if (this.selectMember.some((member) => member.id === row.id)) {
            this.$refs.table?.toggleRowSelection(row, true);
          }
        });
      });
    },
    openSetMemberGroup() {
      this.memberGroupFlag = true;
      this.memberGroupLoading = false;
      this.memberGroupForm = { groupId: "" };
      this.$nextTick(() => {
        if (this.$refs.memberGroupForm) this.$refs.memberGroupForm.resetFields();
      });
      this.loadMemberGroupList();
    },
    loadMemberGroupList() {
      API_Member.getMemberGroupByPage({ pageNumber: 1, pageSize: 1000 }).then((res) => {
        if (res && res.success && res.result) {
          this.memberGroupList = res.result.records || [];
        }
      });
    },
    loadMemberGradeList() {
      API_Member.getMemberGradeByPage({ pageNumber: 1, pageSize: 1000 }).then((res) => {
        if (res && res.success && res.result) {
          this.memberGradeList = res.result || [];
        }
      });
    },
    clearSelection() {
      this.$refs.table?.clearSelection();
    },
    submitSetMemberGroup() {
      if (this.selectedRows.length === 0) {
        ElMessage.warning("请先选择会员");
        return;
      }
      this.$refs.memberGroupForm.validate((valid) => {
        if (!valid) return;
        const memberIds = this.selectedRows.map((item) => item.id);
        const groupId = this.memberGroupForm.groupId;
        this.memberGroupLoading = true;
        Promise.all(
          memberIds.map((memberId) => API_Member.setMemberUserGroups(memberId, [groupId]))
        )
          .then((results) => {
            this.memberGroupLoading = false;
            const failed = results.find((res) => !res || !res.success);
            if (failed) {
              ElMessage.error(failed.message || "设置失败");
              return;
            }
            ElMessage.success("设置成功");
            this.memberGroupFlag = false;
            this.selectedRows = [];
            this.clearSelection();
            this.getData();
          })
          .catch(() => {
            this.memberGroupLoading = false;
            ElMessage.error("设置失败，请稍后重试");
          });
      });
    },
    callback(val) {
      this.selectMember.forEach((item) => {
        item.___selected = false;
      });
      val.___selected = !val.___selected;
      let findUser = this.selectMember.find((item) => item.id == val.id);
      if (!findUser) {
        this.selectMember.push(val);
      } else {
        this.selectMember.map((item, index) => {
          if (item.id == findUser.id) {
            this.selectMember.splice(index, 1);
          }
        });
      }
      this.$emit("callback", val);
    },
    init(data) {
      data.forEach((item) => {
        if (this.selectMember.length != 0) {
          this.selectMember.forEach((member) => {
            if (member.id == item.id) {
              item.___selected = true;
            }
          });
        } else {
          item.___selected = false;
        }
      });
      this.data = data;
    },
    changePage() {
      this.getData();
    },
    changePageSize() {
      this.searchForm.pageNumber = 1;
      this.getData();
    },
    handleSearch() {
      this.searchForm.pageNumber = 1;
      this.searchForm.pageSize = 20;
      this.getData();
    },
    editPerm(val) {
      this.descTitle = `查看用户 ${val.username}`;
      this.descFlag = true;
      this.getMemberInfo(val.id);
    },
    addMember() {
      this.addMemberForm = {
        mobile: "",
        username: "",
        password: "",
      };
      this.addFlag = true;
      this.$nextTick(() => {
        this.$refs.addMemberForm?.clearValidate();
      });
    },
    getMemberInfo(id) {
      API_Member.getMemberInfoData(id).then((res) => {
        if (res.result) {
          this.form = res.result;
        }
      });
    },
    getData() {
      this.loading = true;
      if (!this.selectedMember) {
        this.selectedRows = [];
        this.clearSelection();
      }
      API_Member.getMemberListData(this.searchForm).then((res) => {
        if (res.result.records) {
          this.loading = false;
          this.init(res.result.records);
          this.total = res.result.total;
          this.syncTableSelection();
        }
      });
    },
    openPicSelector() {
      this.picModelFlag = true;
      this.$nextTick(() => {
        if (this.$refs.ossManage) {
          this.$refs.ossManage.selectImage = true;
        }
      });
    },
    callbackSelected(val) {
      this.picModelFlag = false;
      this.form.face = val.url;
    },
    addMemberSubmit() {
      this.addMemberForm.password = this.md5(this.addMemberForm.password);
      this.$refs.addMemberForm.validate((valid) => {
        if (valid) {
          API_Member.addMember(this.addMemberForm).then((res) => {
            if (res.result) {
              this.$refs.addMemberForm.resetFields();
              this.getData();
              ElMessage.success("添加成功！");
              this.addFlag = false;
            }
          });
        }
      });
    },
    selectedRegion(val) {
      if (val.type === "select") {
        const paths = val.data.map((item) => item.name).join(",");
        const ids = val.data.map((item) => item.id).join(",");
        this.form.region = paths;
        this.form.regionId = ids;
      } else {
        this.form.region = val.data.addr;
        this.form.regionId = val.data.addrId;
      }
    },
    detail(row) {
      customRouterPush({ name: "member-detail", query: { id: row.id } });
    },
    disabled(v) {
      let params = {
        memberIds: [v.id],
        disabled: false,
      };
      ElMessageBox.confirm("确认禁用此会员？", "提示", { type: "warning" }).then(() => {
        API_Member.updateMemberStatus(params).then((res) => {
          if (res.success) {
            ElMessage.success("禁用成功");
            this.getData();
          }
        });
      }).catch(() => {});
    },
    openWalletIncrease(row) {
      this.walletIncreaseLoading = false;
      this.walletIncreaseForm = { memberId: row.id, rechargeMoney: null };
      this.walletIncreaseFlag = true;
      this.$nextTick(() => {
        this.$refs.walletIncreaseForm && this.$refs.walletIncreaseForm.resetFields();
      });
    },
    submitWalletIncrease() {
      this.$refs.walletIncreaseForm.validate((valid) => {
        if (!valid) return;
        this.walletIncreaseLoading = true;
        API_Member.increaseMemberWallet({
          memberId: this.walletIncreaseForm.memberId,
          rechargeMoney: this.walletIncreaseForm.rechargeMoney,
        })
          .then((res) => {
            if (res && res.success) {
              ElMessage.success("充值成功");
              this.walletIncreaseFlag = false;
              this.getData();
            } else {
              ElMessage.error((res && res.message) || "充值失败");
            }
          })
          .finally(() => {
            this.walletIncreaseLoading = false;
          });
      });
    },
    openMemberPoint(row) {
      this.memberPointLoading = false;
      this.memberPointForm = { memberId: row.id, point: null, type: "INCREASE" };
      this.memberPointFlag = true;
      this.$nextTick(() => {
        this.$refs.memberPointForm && this.$refs.memberPointForm.resetFields();
      });
    },
    submitMemberPoint() {
      this.$refs.memberPointForm.validate((valid) => {
        if (!valid) return;
        this.memberPointLoading = true;
        API_Member.updateMemberPoint({
          memberId: this.memberPointForm.memberId,
          point: this.memberPointForm.point,
          type: this.memberPointForm.type,
        })
          .then((res) => {
            if (res && res.success) {
              ElMessage.success("修改成功");
              this.memberPointFlag = false;
              this.getData();
            } else {
              ElMessage.error((res && res.message) || "修改失败");
            }
          })
          .finally(() => {
            this.memberPointLoading = false;
          });
      });
    },
    handleSubmitModal() {
      const { nickName, sex, username, face, newPassword, id, regionId, region } = this.form;
      let time = new Date(this.form.birthday);
      let birthday =
        this.form.birthday === undefined
          ? ""
          : time.getFullYear() + "-" + (time.getMonth() + 1) + "-" + time.getDate();
      let submit = {
        regionId,
        region,
        nickName,
        sex,
        birthday,
        face,
        id,
      };
      if (newPassword) {
        submit.password = this.md5(newPassword);
      }
      API_Member.updateMember(submit).then((res) => {
        if (res.result) {
          ElMessage.success("修改成功！");
          this.descFlag = false;
          this.getData();
        }
      });
    },
  },
  mounted() {
    this.getData();
    this.loadMemberGroupList();
    this.loadMemberGradeList();
  },
};
</script>
<style lang="scss" scoped>
.face {
  width: 60px;
  height: 60px;
  border-radius: 50%;
}
.link-text {
  color: #2d8cf0;
  cursor: pointer;
  text-decoration: none;
}
.op-split {
  margin: 0 8px;
  color: #dcdee2;
}

.add-member-dialog {
  :deep(.el-input__wrapper) {
    background-color: #fff !important;
    box-shadow: 0 0 0 1px var(--el-border-color) inset !important;

    &.is-focus {
      box-shadow: 0 0 0 1px var(--el-border-color) inset !important;
    }
  }

  :deep(.el-input__inner) {
    background-color: transparent !important;

    &:-webkit-autofill,
    &:-webkit-autofill:hover,
    &:-webkit-autofill:focus,
    &:-webkit-autofill:active {
      -webkit-box-shadow: 0 0 0 1000px #fff inset !important;
      box-shadow: 0 0 0 1000px #fff inset !important;
      -webkit-text-fill-color: #606266 !important;
      caret-color: #606266;
      transition: background-color 99999s ease-out;
    }
  }
}
</style>
