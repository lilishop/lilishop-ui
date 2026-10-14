<template>
  <div class="logistics">
    <el-card>
      <el-table v-loading="loading" border :data="data" ref="table" style="width: 100%">
        <el-table-column prop="name" label="物流公司" min-width="120" />
        <el-table-column label="状态" min-width="120">
          <template #default="{ row }">
            <el-tag v-if="!row.selected" type="danger">关闭</el-tag>
            <el-tag v-else type="success">开启</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" align="center" width="200">
          <template #default="{ row }">
            <template v-if="!row.selected">
              <a class="link-text" @click="open(row)">开启</a>
            </template>
            <template v-else>
              <a class="link-text" @click="close(row)">关闭</a>
              <span class="op-split">|</span>
              <a class="link-text" @click="getFaceSheetInfo(row)">修改</a>
            </template>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <el-dialog v-model="openModal" :title="openModalTitle" width="700px" :close-on-click-modal="false">
      <h3 style="color: #ff3c2a; margin-bottom: 10px">是否需要电子面单</h3>
      <el-button-group style="margin-bottom: 10px">
        <el-button :type="faceSheetForm.faceSheetFlag ? 'primary' : 'default'" @click="faceSheetForm.faceSheetFlag = true">
          需要
        </el-button>
        <el-button :type="!faceSheetForm.faceSheetFlag ? 'primary' : 'default'" @click="faceSheetForm.faceSheetFlag = false">
          不需要
        </el-button>
      </el-button-group>

      <el-card v-if="openText" class="modalStyle">
        <h3 style="color: #ff3c2a; margin-bottom: 10px">请输入详细信息</h3>
        <el-form ref="formValidate" label-width="250px" label-position="right" :model="faceSheetForm" :rules="ruleValidate">
          <el-form-item label="电子面单客户账户/月结账号/客户代码" prop="customerName">
            <el-input v-model="faceSheetForm.customerName" class="faceSheetInput" />
          </el-form-item>
          <el-form-item label="客户密码/电子面单密码" prop="customerPwd">
            <el-input v-model="faceSheetForm.customerPwd" class="faceSheetInput" />
          </el-form-item>
          <el-form-item label="电子面单密钥" prop="monthCode">
            <el-input v-model="faceSheetForm.monthCode" class="faceSheetInput" />
          </el-form-item>
          <el-form-item label="归属网点/网点编码/电子面单承载编号" prop="sendSite">
            <el-input v-model="faceSheetForm.sendSite" class="faceSheetInput" />
          </el-form-item>
          <el-form-item label="收件快递员" prop="sendStaff">
            <el-input v-model="faceSheetForm.sendStaff" class="faceSheetInput" />
          </el-form-item>
          <el-form-item label="支付方式" prop="payType">
            <el-select v-model="faceSheetForm.payType" class="faceSheetInput">
              <el-option label="现付" value="1" />
              <el-option label="到付" value="2" />
              <el-option label="月结" value="3" />
              <el-option label="第三方支付(仅SF支持)" value="4" />
            </el-select>
          </el-form-item>
          <el-form-item label="快递类型" prop="expType">
            <el-input v-model="faceSheetForm.expType" class="faceSheetInput" />
          </el-form-item>
          <div style="width: 100%; text-align: center">
            <a style="padding-right: 20px" @click="frontDownload('use')">使用说明</a>
            <a @click="frontDownload('type')">快递类型</a>
          </div>
        </el-form>
      </el-card>

      <template #footer>
        <el-button @click="openModal = false">取消</el-button>
        <el-button type="primary" @click="submit">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { onMounted, ref, watch } from "vue";
import * as API_Shop from "@/api/shops";
import { Message, Modal } from "@/utils/message";

defineOptions({ name: "logistics" });

const row = ref({});
const openModal = ref(false);
const loading = ref(true);
const openModalTitle = ref("开启信息");
const ruleValidate = ref({});
const faceSheetForm = ref({
  faceSheetFlag: false,
  customerName: "",
  payType: "1",
  expType: "1",
  customerPwd: "",
  monthCode: "",
  sendSite: "",
  sendStaff: "",
});
const data = ref([]);
const openText = ref(false);
const logisticsId = ref("");

watch(
  () => faceSheetForm.value.faceSheetFlag,
  (val) => {
    openText.value = !!val;
  }
);

function init() {
  getDataList();
}
function getDataList() {
  loading.value = true;
  API_Shop.getLogistics().then((res) => {
    loading.value = false;
    if (res.success) {
      data.value = res.result;
    }
  });
}
function open(v) {
  row.value = v;
  openModal.value = true;
  openModalTitle.value = "开启信息";
  openText.value = false;
  faceSheetForm.value.faceSheetFlag = false;
}
function getFaceSheetInfo(v) {
  row.value = v;
  logisticsId.value = v.logisticsId;
  openModalTitle.value = "修改信息";
  API_Shop.getIsCheck(logisticsId.value).then((res) => {
    if (res.success) {
      faceSheetForm.value.faceSheetFlag = res.result.faceSheetFlag;
      openText.value = !!faceSheetForm.value.faceSheetFlag;
      faceSheetForm.value.customerName = res.result.customerName;
      faceSheetForm.value.customerPwd = res.result.customerPwd;
      faceSheetForm.value.monthCode = res.result.monthCode;
      faceSheetForm.value.sendSite = res.result.sendSite;
      faceSheetForm.value.sendStaff = res.result.sendStaff;
      faceSheetForm.value.payType = res.result.payType;
      faceSheetForm.value.expType = res.result.expType;
    }
  });
  openModal.value = true;
}
function frontDownload(val) {
  const a = document.createElement("a");
  if (val === "use") {
    a.href = "static/instructions.xlsx";
    a.download = "使用说明.xlsx";
  } else if (val === "type") {
    a.href = "static/logisticsType.xlsx";
    a.download = "快递类型.xlsx";
  }
  a.style.display = "none";
  document.body.appendChild(a);
  a.click();
  a.remove();
}
function submit() {
  if (!row.value.selected) {
    API_Shop.logisticsChecked(row.value.logisticsId, faceSheetForm.value).then((res) => {
      openModal.value = false;
      if (res.success) {
        Message.success("物流公司开启成功");
        init();
      }
    });
  } else {
    API_Shop.editChecked(logisticsId.value, faceSheetForm.value).then((res) => {
      if (res.success) {
        Message.success("修改成功");
        openModal.value = false;
        init();
      }
    });
  }
}
function close(v) {
  Modal.confirm({
    title: "确认关闭",
    content: "您确认关闭此物流公司?",
    loading: true,
    onOk: () => {
      API_Shop.logisticsUnChecked(v.logisticsId).then((res) => {
        Modal.remove();
        if (res.success) {
          Message.success("物流公司关闭成功");
          init();
        }
      });
    },
  });
}

onMounted(() => {
  init();
});
</script>

<style lang="scss" scoped>
.faceSheetInput {
  width: 300px;
}
.link-text {
  color: #409eff;
  cursor: pointer;
  text-decoration: none;
}
.op-split {
  margin: 0 8px;
  color: #dcdee2;
}
</style>
