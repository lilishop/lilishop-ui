<template>
  <div class="search">
    <el-card>
      <el-form
        ref="searchFormRef"
        :model="searchForm"
        inline
        label-width="70px"
        class="search-form"
        @keyup.enter="handleSearch"
      >
        <el-form-item label="客户ID" prop="id">
          <el-input v-model="searchForm.id" placeholder="请输入客户ID" clearable style="width: 240px" />
        </el-form-item>
        <el-form-item label="客户名称" prop="username">
          <el-input v-model="searchForm.username" placeholder="请输入客户名称" clearable style="width: 240px" />
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
        <el-table-column prop="id" label="客户ID" min-width="120" show-overflow-tooltip />
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
        <el-table-column prop="username" label="客户名称" min-width="150" show-overflow-tooltip />
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
        ref="addMemberFormRef"
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
        <el-form-item label="客户名称" prop="username" style="width: 90%">
          <el-input
            v-model="addMemberForm.username"
            maxlength="15"
            placeholder="请输入客户名称"
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
      <el-form ref="formRef" :model="form" :rules="ruleValidate" label-width="80px">
        <el-input v-model="form.id" style="display: none" />
        <el-form-item label="头像">
          <img alt="会员头像" :src="form.face || defaultPic" class="face" />
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
      <el-form ref="walletIncreaseFormRef" :model="walletIncreaseForm" :rules="walletIncreaseRule" label-width="90px">
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
      <el-form ref="memberPointFormRef" :model="memberPointForm" :rules="memberPointRule" label-width="90px">
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
      <el-form ref="memberGroupFormRef" :model="memberGroupForm" :rules="memberGroupRule" label-width="90px">
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
      <ossManage ref="ossManageRef" @callback="callbackSelected" :isComponent="true" :initialize="picModelFlag" />
    </el-dialog>
    <multipleMap ref="map" @callback="selectedRegion" />
  </div>
</template>

<script setup>
import { ref, watch, nextTick, onMounted } from "vue";
import { useRoute } from "vue-router";
import { ArrowDown } from "@element-plus/icons-vue";
import multipleMap from "@/components/map/multiple-map";
import * as API_Member from "@/api/member.js";
import ossManage from "@/views/sys/oss-manage/ossManage";
import * as RegExp from "@/libs/RegExp.js";
import { ElMessage, ElMessageBox } from "element-plus";
import { customRouterPush } from "@/utils/filters";
import { md5 } from "@/utils/md5.js";
import defaultPic from "@/assets/default.png";

defineOptions({ name: "member" });

const route = useRoute();

const props = defineProps({
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
});
const emit = defineEmits(["callback"]);

// 模板 el-form/el-table 的模板 ref（原 ref="searchForm"/"addMemberForm"/"form" 等与 data 同名会互相覆盖，
// 改名为 xxxRef；ossManage 与 import 同名，改名 ossManageRef）
const searchFormRef = ref(null);
const table = ref(null);
const addMemberFormRef = ref(null);
const formRef = ref(null);
const walletIncreaseFormRef = ref(null);
const memberPointFormRef = ref(null);
const memberGroupFormRef = ref(null);
const ossManageRef = ref(null);

const descTitle = ref("");
const descFlag = ref(false);
const loading = ref(true);
const addFlag = ref(false);
const addMemberForm = ref({
  mobile: "",
  username: "",
  password: "",
});
const searchForm = ref({
  pageNumber: 1,
  pageSize: 20,
  order: "desc",
  id: "",
  username: "",
  mobile: "",
  disabled: "OPEN",
  groupId: "",
});
const picModelFlag = ref(false);
const form = ref({});
const walletIncreaseFlag = ref(false);
const walletIncreaseLoading = ref(false);
const walletIncreaseForm = ref({
  memberId: "",
  rechargeMoney: null,
});
const walletIncreaseRule = ref({
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
});
const memberPointFlag = ref(false);
const memberPointLoading = ref(false);
const memberPointForm = ref({
  memberId: "",
  point: null,
  type: "INCREASE",
});
const selectedRows = ref([]);
const memberGroupFlag = ref(false);
const memberGroupLoading = ref(false);
const memberGroupForm = ref({
  groupId: "",
});
const memberGroupRule = ref({
  groupId: [{ required: true, message: "请选择会员分组", trigger: "change" }],
});
const memberGroupList = ref([]);
const memberGradeList = ref([]);
const memberPointRule = ref({
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
});
const addRule = ref({
  mobile: [
    { required: true, message: "请输入手机号码" },
    { pattern: RegExp.mobile, message: "请输入正确的手机号" },
  ],
  username: [{ required: true, message: "请输入客户名称" }],
  password: [{ required: true, message: "请输入密码" }],
});
const ruleValidate = ref({});
const data = ref([]);
const total = ref(0);
const selectMember = ref([]);

watch(
  () => props.selectedList,
  (val) => {
    selectMember.value = JSON.parse(JSON.stringify(val));
    init(data.value);
  },
  { deep: true, immediate: true }
);

function handleMoreCommand(name, row) {
  if (name === "edit") editPerm(row);
  if (name === "disabled") disabled(row);
  if (name === "increaseWallet") openWalletIncrease(row);
  if (name === "updatePoint") openMemberPoint(row);
}
function onSelectionChange(selection) {
  if (props.selectedMember && props.checkboxSelect) {
    selectMember.value = selection || [];
    return;
  }
  selectedRows.value = selection || [];
}
function getSelection() {
  return selectMember.value || [];
}
function syncTableSelection() {
  if (!props.selectedMember || !props.checkboxSelect) {
    return;
  }
  nextTick(() => {
    clearSelection();
    data.value.forEach((row) => {
      if (selectMember.value.some((member) => member.id === row.id)) {
        table.value?.toggleRowSelection(row, true);
      }
    });
  });
}
function openSetMemberGroup() {
  memberGroupFlag.value = true;
  memberGroupLoading.value = false;
  memberGroupForm.value = { groupId: "" };
  nextTick(() => {
    if (memberGroupFormRef.value) memberGroupFormRef.value.resetFields();
  });
  loadMemberGroupList();
}
function loadMemberGroupList() {
  API_Member.getMemberGroupByPage({ pageNumber: 1, pageSize: 1000 }).then((res) => {
    if (res && res.success && res.result) {
      memberGroupList.value = res.result.records || [];
    }
  });
}
function loadMemberGradeList() {
  API_Member.getMemberGradeByPage({ pageNumber: 1, pageSize: 1000 }).then((res) => {
    if (res && res.success && res.result) {
      memberGradeList.value = res.result || [];
    }
  });
}
function clearSelection() {
  table.value?.clearSelection();
}
function submitSetMemberGroup() {
  if (selectedRows.value.length === 0) {
    ElMessage.warning("请先选择会员");
    return;
  }
  memberGroupFormRef.value.validate((valid) => {
    if (!valid) return;
    const memberIds = selectedRows.value.map((item) => item.id);
    const groupId = memberGroupForm.value.groupId;
    memberGroupLoading.value = true;
    Promise.all(
      memberIds.map((memberId) =>
        API_Member.setMemberUserGroups(memberId, [groupId]).then((res) => {
          if (!res || !res.success) {
            // 后端 updateUserGroups 若因原无分组返回失败，自动降级尝试 addMemberGroupUsers
            return API_Member.addMemberGroupUsers(groupId, [memberId]);
          }
          return res;
        })
      )
    )
      .then((results) => {
        memberGroupLoading.value = false;
        const failed = results.find((res) => !res || !res.success);
        if (failed) {
          ElMessage.error(failed.message || "设置失败");
          return;
        }
        ElMessage.success("设置成功");
        memberGroupFlag.value = false;
        selectedRows.value = [];
        clearSelection();
        getData();
      })
      .catch(() => {
        memberGroupLoading.value = false;
        ElMessage.error("设置失败，请稍后重试");
      });
  });
}
function callback(val) {
  selectMember.value.forEach((item) => {
    item.___selected = false;
  });
  val.___selected = !val.___selected;
  let findUser = selectMember.value.find((item) => item.id == val.id);
  if (!findUser) {
    selectMember.value.push(val);
  } else {
    selectMember.value.map((item, index) => {
      if (item.id == findUser.id) {
        selectMember.value.splice(index, 1);
      }
    });
  }
  emit("callback", val);
}
function init(list) {
  list.forEach((item) => {
    if (selectMember.value.length != 0) {
      selectMember.value.forEach((member) => {
        if (member.id == item.id) {
          item.___selected = true;
        }
      });
    } else {
      item.___selected = false;
    }
  });
  data.value = list;
}
function changePage() {
  getData();
}
function changePageSize() {
  searchForm.value.pageNumber = 1;
  getData();
}
function handleSearch() {
  searchForm.value.pageNumber = 1;
  searchForm.value.pageSize = 20;
  getData();
}
function editPerm(val) {
  descTitle.value = `查看用户 ${val.username}`;
  descFlag.value = true;
  getMemberInfo(val.id);
}
function addMember() {
  addMemberForm.value = {
    mobile: "",
    username: "",
    password: "",
  };
  addFlag.value = true;
  nextTick(() => {
    addMemberFormRef.value?.clearValidate();
  });
}
function getMemberInfo(id) {
  API_Member.getMemberInfoData(id).then((res) => {
    if (res.result) {
      form.value = res.result;
    }
  });
}
function getData() {
  loading.value = true;
  if (!props.selectedMember) {
    selectedRows.value = [];
    clearSelection();
  }
  API_Member.getMemberListData(searchForm.value).then((res) => {
    if (res.result.records) {
      loading.value = false;
      init(res.result.records);
      total.value = res.result.total;
      syncTableSelection();
    }
  });
}
function openPicSelector() {
  picModelFlag.value = true;
  nextTick(() => {
    if (ossManageRef.value) {
      ossManageRef.value.selectImage = true;
    }
  });
}
function callbackSelected(val) {
  picModelFlag.value = false;
  form.value.face = val.url;
}
function addMemberSubmit() {
  addMemberForm.value.password = md5(addMemberForm.value.password);
  addMemberFormRef.value.validate((valid) => {
    if (valid) {
      API_Member.addMember(addMemberForm.value).then((res) => {
        if (res.result) {
          addMemberFormRef.value.resetFields();
          getData();
          ElMessage.success("添加成功！");
          addFlag.value = false;
        }
      });
    }
  });
}
function selectedRegion(val) {
  if (val.type === "select") {
    const paths = val.data.map((item) => item.name).join(",");
    const ids = val.data.map((item) => item.id).join(",");
    form.value.region = paths;
    form.value.regionId = ids;
  } else {
    form.value.region = val.data.addr;
    form.value.regionId = val.data.addrId;
  }
}
function detail(row) {
  customRouterPush({ name: "member-detail", query: { id: row.id } });
}
function disabled(v) {
  let params = {
    memberIds: [v.id],
    disabled: false,
  };
  ElMessageBox.confirm("确认禁用此会员？", "提示", { type: "warning" }).then(() => {
    API_Member.updateMemberStatus(params).then((res) => {
      if (res.success) {
        ElMessage.success("禁用成功");
        getData();
      }
    });
  }).catch(() => {});
}
function openWalletIncrease(row) {
  walletIncreaseLoading.value = false;
  walletIncreaseForm.value = { memberId: row.id, rechargeMoney: null };
  walletIncreaseFlag.value = true;
  nextTick(() => {
    walletIncreaseFormRef.value && walletIncreaseFormRef.value.resetFields();
  });
}
function submitWalletIncrease() {
  walletIncreaseFormRef.value.validate((valid) => {
    if (!valid) return;
    walletIncreaseLoading.value = true;
    API_Member.increaseMemberWallet({
      memberId: walletIncreaseForm.value.memberId,
      rechargeMoney: walletIncreaseForm.value.rechargeMoney,
    })
      .then((res) => {
        if (res && res.success) {
          ElMessage.success("充值成功");
          walletIncreaseFlag.value = false;
          getData();
        } else {
          ElMessage.error((res && res.message) || "充值失败");
        }
      })
      .finally(() => {
        walletIncreaseLoading.value = false;
      });
  });
}
function openMemberPoint(row) {
  memberPointLoading.value = false;
  memberPointForm.value = { memberId: row.id, point: null, type: "INCREASE" };
  memberPointFlag.value = true;
  nextTick(() => {
    memberPointFormRef.value && memberPointFormRef.value.resetFields();
  });
}
function submitMemberPoint() {
  memberPointFormRef.value.validate((valid) => {
    if (!valid) return;
    memberPointLoading.value = true;
    API_Member.updateMemberPoint({
      memberId: memberPointForm.value.memberId,
      point: memberPointForm.value.point,
      type: memberPointForm.value.type,
    })
      .then((res) => {
        if (res && res.success) {
          ElMessage.success("修改成功");
          memberPointFlag.value = false;
          getData();
        } else {
          ElMessage.error((res && res.message) || "修改失败");
        }
      })
      .finally(() => {
        memberPointLoading.value = false;
      });
  });
}
function handleSubmitModal() {
  const { nickName, sex, username, face, newPassword, id, regionId, region } = form.value;
  let time = new Date(form.value.birthday);
  let birthday =
    form.value.birthday === undefined
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
    submit.password = md5(newPassword);
  }
  API_Member.updateMember(submit).then((res) => {
    if (res.result) {
      ElMessage.success("修改成功！");
      descFlag.value = false;
      getData();
    }
  });
}

onMounted(() => {
  if (route.query && route.query.groupId) {
    searchForm.value.groupId = String(route.query.groupId);
  }
  getData();
  loadMemberGroupList();
  loadMemberGradeList();
});

watch(
  () => route.query.groupId,
  (val) => {
    if (val !== undefined) {
      searchForm.value.groupId = val ? String(val) : "";
      searchForm.value.pageNumber = 1;
      getData();
    }
  }
);

// 外部通过 ref 调用（promotions/coupon-activity/coupon-publish.vue 的 memberLayoutRef.getSelection()）
defineExpose({ getSelection });
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
