<template>
  <div class="search">
    <el-card>
      <div>
        <el-button @click="refresh">刷新</el-button>
        <el-button @click="add" type="primary">添加</el-button>
      </div>
      <el-tabs @tab-click="handleClickType" v-model="currentTab" style="margin-top: 10px">
        <el-tab-pane label="运费模板" name="INFO">
          <el-empty v-if="!shipInfo.length" description="暂无运费模板，点击右上角「添加」创建" />
          <table class="ncsc-default-table order m-b-30" :key="index" v-for="(item,index) in shipInfo">
            <tbody>
              <tr>
                <td class="sep-row" colspan="20"></td>
              </tr>
              <tr>
                <th colspan="20" class="template-head">
                  <div class="template-head-inner">
                    <span class="temp-name">{{item.name}}</span>
                    <el-tag v-if="item.pricingMethod==='FREE'" type="warning" size="small">包邮</el-tag>
                    <div class="template-head-right">
                      <time class="update-time" title="最后编辑时间">{{item.updateTime}}</time>
                      <a class="action-link" @click="edit(item)">修改</a>
                      <span class="action-split">|</span>
                      <a class="action-link" @click="remove(item.id)">删除</a>
                    </div>
                  </div>
                </th>
              </tr>
              <tr v-if="item.pricingMethod!=='FREE'">
                <td class="w10 bdl"></td>
                <td class="cell-area tl w150">运送到</td>
                <td class="w150">首件(重)</td>
                <td class="w150">运费</td>
                <td class="w150">续件(重)</td>
                <td class="w150 bdr">运费</td>
              </tr>
              <template v-if="item.pricingMethod!=='FREE'">
                <tr v-for="(children,index) in item.freightTemplateChildList" :key="index">
                  <td class="bdl"></td>
                  <td class="cell-area tl w150" style="width: 60%;white-space:normal;">{{children.area}}</td>
                  <td>
                    {{children.firstCompany}}
                  </td>
                  <td>
                    <span class="yuan">￥</span><span class="integer">{{ $filters.unitPrice(children.firstPrice) }}</span>
                  </td>
                  <td>
                    {{children.continuedCompany}}
                  </td>
                  <td class="bdr">
                    <span class="yuan">￥</span><span class="integer">{{ $filters.unitPrice(children.continuedPrice) }}</span>
                  </td>
                </tr>
              </template>
            </tbody>
          </table>
        </el-tab-pane>
        <el-tab-pane v-if="csTab" :label="title" :name="operation">
          <el-form ref="formRef" :model="form" label-width="100px" :rules="formValidate">
            <el-form-item label="模板名称" prop="name">
              <el-input v-model="form.name" maxlength="10" clearable style="width: 20%" />
            </el-form-item>
            <el-form-item label="计价方式" prop="pricingMethod">
              <el-radio-group v-model="form.pricingMethod">
                <el-radio-button value="WEIGHT">按重量</el-radio-button>
                <el-radio-button value="NUM">按件数</el-radio-button>
                <el-radio-button value="FREE">包邮</el-radio-button>
              </el-radio-group>
            </el-form-item>

            <el-form-item label="详细设置" v-if="form.pricingMethod !== 'FREE'">
              <el-alert type="warning" title="点击右侧修改按钮编辑数据" :closable="false" />
              <div class="ncsu-trans-type" data-delivery="TRANSTYPE">
                <div class="entity">
                  <div class="tbl-except">
                    <table cellspacing="0" class="ncsc-default-table ship-template-edit-table">
                      <thead>
                        <tr>
                          <th class="col-area">运送到</th>
                          <th class="col-num">首件(重)</th>
                          <th class="col-num">首费</th>
                          <th class="col-num">续件(重)</th>
                          <th class="col-num">续费</th>
                          <th class="col-action">操作</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr
                          class="bd-line"
                          v-for="(item,index) in form.freightTemplateChildList"
                          :key="index"
                        >
                          <td class="col-area">
                            <span class="area-group">{{ item.area || '未设置地区' }}</span>
                          </td>
                          <td class="col-num">
                            <el-input-number
                              v-model="item.firstCompany"
                              :max="999"
                              :min="0"
                              :step="0.1"
                              controls-position="right"
                              size="small"
                            />
                          </td>
                          <td class="col-num">
                            <el-input-number
                              v-model="item.firstPrice"
                              :max="999999"
                              :min="0"
                              controls-position="right"
                              size="small"
                            />
                          </td>
                          <td class="col-num">
                            <el-input-number
                              v-model="item.continuedCompany"
                              :max="999"
                              :min="0"
                              :step="0.1"
                              controls-position="right"
                              size="small"
                            />
                          </td>
                          <td class="col-num">
                            <el-input-number
                              v-model="item.continuedPrice"
                              :max="999999"
                              :min="0"
                              controls-position="right"
                              size="small"
                            />
                          </td>
                          <td class="col-action">
                            <a class="action-link" @click="editRegion(item,index)">选择地址</a>
                            <span class="action-split">|</span>
                            <a class="action-link" @click="removeTemplateChildren(index)">删除</a>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                  <div class="tbl-attach p-5">
                    <div class="div-error" v-if="saveError">
                      <i class="fa fa-exclamation-circle" aria-hidden="true"></i>
                      指定地区城市为空或指定错误
                      首(续)件(重)费应输入大于0的整数
                    </div>

                  </div>
                </div>
              </div>
            </el-form-item>
            <el-form-item>
              <el-button v-if="form.pricingMethod !== 'FREE'" @click="addShipTemplateChildren(index)">
                为指定城市设置运费模板
              </el-button>
              <el-button @click="handleSubmit" type="primary" style="margin-right:5px">保存
              </el-button>
            </el-form-item>
          </el-form>
        </el-tab-pane>
      </el-tabs>
    </el-card>
    <multiple-region ref="region" @selected="handleSelect">

    </multiple-region>

  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import * as API_Shop from "@/api/shops";
import multipleRegion from "@/views/lili-components/multiple-region";
import { useAppStore } from "@/stores/app";
import { Message, Modal } from "@/utils/message";

defineOptions({
  name: "shipTemplate",
});

const appStore = useAppStore();

const gotop = ref(false);
const index = ref("0");
const selectedIndex = ref(0); //选中的地址模板下标
const curItem = ref(""); //运费模板子模板
const shipInfo = ref([]); // 运费模板数据
const title = ref("添加运费模板"); // 模态框标题
const operation = ref("INFO"); // 操作状态
const currentTab = ref("INFO"); // 当前模板tab
// submitLoading:false,
const saveError = ref(false); // 是否显示错误提示
const csTab = ref(false); // 添加运费模板显示
const form = ref({
  // 添加或编辑表单对象初始化数据
  name: "",
  pricingMethod: "WEIGHT",
});
const formValidate = {
  name: [
    {
      required: true,
      message: "请输入模板名称",
      trigger: "blur",
    },
  ],
  pricingMethod: [
    // 计费方式
    {
      required: true,
      message: "请选择计费方式",
      trigger: "blur",
    },
  ],
};

const formRef = ref(null);
const region = ref(null);

const regions = computed(() => appStore.regions);

// 初始化数据
function init() {
  currentTab.value = "INFO";
  csTab.value = false;
  operation.value = "INFO";
  getData();
}
//切换tabPane
function handleClickType(tab) {
  const tabName = tab.paneName ?? tab.props?.name;
  if (tabName === "INFO") {
    getData();
    csTab.value = false;
  }
}
//添加运费模板
function add() {
  region.value.clear();
  title.value = "添加运费模板";
  csTab.value = true;
  operation.value = "ADD";
  currentTab.value = "ADD";
  saveError.value = false;
  form.value = {
    pricingMethod: "WEIGHT",
    name: "",
    freightTemplateChildList: [
      {
        area: "",
        areaId: "",
        firstCompany: 0,
        firstPrice: 0,
        continuedCompany: 0,
        continuedPrice: 0,
        selectedAll: false,
      },
    ],
  };
}
function handleScroll() {
  let scrolltop = document.documentElement.scrollTop || document.body.scrollTop;
  scrolltop > 30 ? (gotop.value = true) : (gotop.value = false);
}
//修改运费模板
function edit(item) {
  title.value = "修改运费模板";
  csTab.value = true;
  operation.value = "EDIT";
  currentTab.value = "EDIT";
  saveError.value = false;
  //给form赋值
  form.value = item;

  let top = document.documentElement.scrollTop || document.body.scrollTop;
  // 实现滚动效果
  const timeTop = setInterval(() => {
    document.body.scrollTop = document.documentElement.scrollTop = top -= 50;
    if (top <= 0) {
      clearInterval(timeTop);
    }
  }, 0);
}
//选择地区
function editRegion(item, index) {
  selectedIndex.value = index;
  curItem.value = item;

  regions.value.forEach((addr) => {
    form.value.freightTemplateChildList.forEach((child) => {
      child.area.split(",").forEach((area) => {
        if (addr.name == area) {
          addr.selectedAll = true;
          child.selectedAll = true;
        }
      });
    });
  });
  appStore.shipTemplates = form.value.freightTemplateChildList;

  region.value.open(item, index);
}
//刷细数据
function refresh() {
  csTab.value = false;
  operation.value = "INFO";
  currentTab.value = "INFO";
  getData();
  Message.success("刷新成功");
}
//运费模板数据
function getData() {
  API_Shop.getShipTemplate().then((res) => {
    shipInfo.value = Array.isArray(res.result) ? res.result : [];
  });
}
/**
 * 选择地址回调
 */
function handleSelect(v) {
  let area = "";
  let areaId = "";
  if (v != "") {
    v.forEach((child) => {
      if (child.selectedList != "") {
        // 只显示省份

        if (child.selectedAll) {
          area += child.name + ",";
          form.value.freightTemplateChildList[
            selectedIndex.value
          ].selectedAll = true;
        }

        child.selectedList.forEach((son) => {
          if (child.selectedAll) {
            areaId += son.id + ",";
            return;
          } else {
            // 显示城市
            area += son.name + ",";
            areaId += son.id + ",";
          }
        });
      }
    });
  }
  curItem.value.area = area;
  curItem.value.areaId = areaId;
}
//添加或者修改运费模板
function handleSubmit() {
  const headers = {
    "Content-Type": "application/json;charset=utf-8",
  };

  formRef.value.validate((valid) => {
    // const regNumber = /^\+?[1-9][0-9]*$/;
    // const regMoney =
    //   /(^[1-9]([0-9]+)?(\.[0-9]{1,2})?$)|(^(0){1}$)|(^[0-9]\.[0-9]([0-9])?$)/;
    if (valid) {
      if (form.value.pricingMethod != "FREE") {
        //校验运费模板详细信息
        for (
          let i = 0;
          i < form.value.freightTemplateChildList.length;
          i++
        ) {
          if (
            form.value.freightTemplateChildList[i].area == "" ||
            form.value.freightTemplateChildList[i].firstCompany == "" ||
            // form.value.freightTemplateChildList[i].firstPrice == "" ||
            form.value.freightTemplateChildList[i].continuedCompany == ""
            // form.value.freightTemplateChildList[i].continuedPrice == ""
          ) {
            saveError.value = true;
            return;
          }
          //  if (
          //   regNumber.test(
          //     form.value.freightTemplateChildList[i].firstCompany
          //   ) == false ||
          //   regNumber.test(
          //     form.value.freightTemplateChildList[i].continuedCompany
          //   ) == false ||
          //   regMoney.test(
          //     form.value.freightTemplateChildList[i].firstPrice
          //   ) == false ||
          //   regMoney.test(
          //     form.value.freightTemplateChildList[i].continuedPrice
          //   ) == false
          // ) {
          //   saveError.value = true;
          //   return;
          // }
        }
      }

      if (operation.value == "ADD") {
        API_Shop.addShipTemplate(form.value, headers).then((res) => {
          if (res.success) {
            Message.success("新增成功");
            operation.value = "INFO";
            currentTab.value = "INFO";
            csTab.value = false;
            getData();
          }
        });
      } else {
        API_Shop.editShipTemplate(form.value.id, form.value, headers).then(
          (res) => {
            if (res.success) {
              Message.success("新增成功");
              operation.value = "INFO";
              currentTab.value = "INFO";
              csTab.value = false;
              getData();
            }
          }
        );
      }
    }
  });
}
//添加子模板
function addShipTemplateChildren() {
  const params = {
    area: "",
    areaId: "",
    firstCompany: 0,
    firstPrice: 0,
    continuedCompany: 0,
    continuedPrice: 0,
    selectedAll: false,
  };
  form.value.freightTemplateChildList.push(params);
}
//删除一个子模板
function removeTemplateChildren(index) {
  if (Object.keys(form.value.freightTemplateChildList).length == 1) {
    Message.error("必须保留一个子模板");
    return;
  }
  form.value.freightTemplateChildList.splice(index, 1);
}
//删除运费模板
function remove(id) {
  Modal.confirm({
    title: "确认删除",
    // 记得确认修改此处
    content: "您确认要删除此运费模板 ?",
    loading: true,
    onOk: () => {
      API_Shop.deleteShipTemplate(id).then((res) => {
        if (res.success) {
          Message.success("删除成功");
        }
        Modal.remove();
        getData();
      });
    },
  });
}

onMounted(() => {
  init();
  window.addEventListener("scroll", handleScroll, true);
});
</script>
<style lang="scss" scoped>
.ncsc-default-table thead th {
  line-height: 20px;
  color: #555;
  background-color: #fafafa;
  text-align: center;
  height: 20px;
  padding: 9px 0;
  border-bottom: solid 1px #ddd;
}

.ncsc-default-table {
  line-height: 20px;
  width: 100%;
  border-collapse: collapse;

  tbody th {
    background-color: #fafafa;
    border: solid #e6e6e6;
    border-width: 1px 0;
    padding: 4px 0;
  }

  tbody td {
    color: #606266;
    background-color: #fff;
    text-align: center;
    padding: 8px 0;
  }
}

.order tbody tr td {
  border-bottom: 1px solid #e6e6e6;
  vertical-align: top;
}

.order tbody tr td.bdr {
  border-right: 1px solid #e6e6e6;
}

.order tbody tr th {
  border: solid 1px #ddd;
}

.order tbody tr td.sep-row {
  height: 14px;
  border: 0;
}

.w10 {
  width: 10px !important;
}

.tl {
  text-align: left !important;
}

.order tbody tr td.bdl {
  border-left: 1px solid #e6e6e6;
}

.order tbody tr th.template-head {
  padding: 0;
}

.template-head-inner {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 12px;
}

.temp-name {
  font-size: 14px;
  font-weight: 600;
  color: #303133;
}

.template-head-right {
  margin-left: auto;
  display: flex;
  align-items: center;
  font-weight: normal;
  font-size: 13px;
}

.update-time {
  margin-right: 16px;
  color: #909399;
  font-size: 12px;
}

.m-b-30 {
  margin-bottom: 10px !important;
}

thead {
  display: table-header-group;
  vertical-align: middle;
  border-color: inherit;
}

tr {
  display: table-row;
  vertical-align: inherit;
  border-color: inherit;
}

caption,
th {
  text-align: left;
}

.tl {
  text-align: left !important;
}

colgroup {
  display: table-column-group;
}

button,
input,
select,
textarea {
  font-family: inherit;
  font-size: inherit;
  line-height: inherit;
}

.bd-line td {
  border-bottom: solid 1px #eee;
}

.w40 {
  width: 60px !important;
}

.w60 {
  width: 100px !important;
  margin: 0 auto;
}

Input[type="text"],
Input[type="password"],
Input.text,
Input.password {
  display: inline-block;
  min-height: 20px;
  padding: 10px;
  border: solid 1px #e6e9ee;
  outline: 0 none;
}

ncsc-default-table {
  line-height: 20px;
  width: 100%;
  border-collapse: collapse;
  clear: both;
}

.ncsu-trans-type {
  background-color: #fff;
  border: solid #ddd 1px;
}

i,
cite,
em {
  font-style: normal;
}

.cell-area {
  width: 50%;
}

.ship-template-edit-table {
  table-layout: fixed;

  th,
  td {
    padding: 10px 12px;
    vertical-align: middle;
    border-bottom: 1px solid #eee;
  }

  thead th {
    text-align: center;
    font-weight: 500;
    color: #555;
    background-color: #fafafa;
  }

  .col-area {
    width: 32%;
    text-align: left;
    word-break: break-all;
    white-space: normal;
    color: #333;
  }

  .col-num {
    width: 14%;
    text-align: center;
  }

  .col-action {
    width: 12%;
    text-align: center;
    white-space: nowrap;
  }

  :deep(.el-input-number) {
    width: 100%;
    max-width: 130px;
  }

  :deep(.el-input-number .el-input__wrapper) {
    padding-left: 8px;
    padding-right: 32px;
  }
}

.action-link {
  color: #2d8cf0;
  cursor: pointer;
  text-decoration: none;
}

.action-split {
  margin: 0 6px;
  color: #dcdee2;
}

.div-error {
  margin-left: 7px;
  margin-bottom: -8px;
  font-size: 15px;
  color: #f00;
}

.action-link:hover {
  text-decoration: underline;
}
</style>
