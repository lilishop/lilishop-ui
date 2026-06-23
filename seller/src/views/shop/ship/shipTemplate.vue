<template>
  <div class="search">
    <el-card>
      <el-row>
        <el-button @click="refresh">刷新</el-button>
        <el-button @click="add" type="primary">添加</el-button>
      </el-row>
      <el-tabs @tab-click="handleClickType" v-model="currentTab" style="margin-top: 10px">
        <el-tab-pane label="运费模板" name="INFO">
          <table class="ncsc-default-table order m-b-30" :key="index" v-for="(item,index) in shipInfo">
            <tbody>
              <tr>
                <td class="sep-row" colspan="20"></td>
              </tr>
              <tr>
                <th colspan="20">
                  <span class="temp-name">{{item.name}}</span>
                  <el-tag v-if="item.pricingMethod==='FREE'" class="baoyou" color="warning">包邮</el-tag>
                  <span class="fr m-r-5">
                    <time style="margin-right: 20px" title="最后编辑时间">
                      <i class="icon-time"></i>{{item.updateTime}}
                    </time>
                    <a
                      style="color:#2d8cf0;cursor:pointer;text-decoration:none"
                      @click="edit(item)"
                    >修改</a>
                    <span style="margin: 0 8px; color: #dcdee2">|</span>
                    <a
                      style="color:#2d8cf0;cursor:pointer;text-decoration:none"
                      @click="remove(item.id)"
                    >删除</a>
                  </span>
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
          <el-form ref="form" :model="form" label-width="100px" :rules="formValidate">
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
                            <a class="action-link" @click="editRegion(item,index)">修改</a>
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

<script>
import * as API_Shop from "@/api/shops";
import multipleRegion from "@/views/lili-components/multiple-region";

export default {
  name: "shipTemplate",
  components: {
    multipleRegion,
  },
  data() {
    return {
      gotop: false,
      index:'0',
      selectedIndex: 0, //选中的地址模板下标
      item: "", //运费模板子模板
      shipInfo: [], // 运费模板数据
      title: "添加运费模板", // 模态框标题
      operation: "INFO", // 操作状态
      currentTab: "INFO", // 当前模板tab
      // submitLoading:false,
      saveError: false, // 是否显示错误提示
      csTab: false, // 添加运费模板显示
      form: {
        // 添加或编辑表单对象初始化数据
        name: "",
        pricingMethod: "WEIGHT",
      },
      formValidate: {
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
      },
    };
  },
  computed: {
    regions() {
      return this.$store.state.regions;
    },
  },
  methods: {
    // 初始化数据
    init() {
      this.currentTab = "INFO";
      this.csTab = false;
      this.operation = "INFO";
      this.getData();
    },
    //切换tabPane
    handleClickType(tab) {
      const tabName = tab.paneName ?? tab.props?.name;
      if (tabName === "INFO") {
        this.getData();
        this.csTab = false;
      }
    },
    //添加运费模板
    add() {
      this.$refs.region.clear();
      this.title = "添加运费模板";
      this.csTab = true;
      this.operation = "ADD";
      this.currentTab = "ADD";
      this.saveError = false;
      this.form = {
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
    },
    handleScroll(){
       let scrolltop = document.documentElement.scrollTop || document.body.scrollTop;
      scrolltop > 30 ? (this.gotop = true) : (this.gotop = false);
    },
    //修改运费模板
    edit(item) {
      this.title = "修改运费模板";
      this.csTab = true;
      this.operation = "EDIT";
      this.currentTab = "EDIT";
      this.saveError = false;
      //给form赋值
      this.form = item;

      let top = document.documentElement.scrollTop || document.body.scrollTop;
      // 实现滚动效果
      const timeTop = setInterval(() => {
        document.body.scrollTop = document.documentElement.scrollTop = top -= 50;
        if (top <= 0) {
          clearInterval(timeTop);
        }
      }, 0);
    },
    //选择地区
    editRegion(item, index) {
      this.selectedIndex = index;
      this.item = item;

      this.regions.forEach((addr) => {
        this.form.freightTemplateChildList.forEach((child) => {
          child.area.split(",").forEach((area) => {
            if (addr.name == area) {
              addr.selectedAll = true;
              child.selectedAll = true;
            }
          });
        });
      });
      this.$store.state.shipTemplate = this.form.freightTemplateChildList;

      this.$refs.region.open(item, index);
    },
    //刷细数据
    refresh() {
      this.csTab = false;
      this.operation = "INFO";
      this.currentTab = "INFO";
      this.getData();
      this.$Message.success("刷新成功");
    },
    //运费模板数据
    getData() {
      API_Shop.getShipTemplate().then((res) => {
        this.shipInfo = Array.isArray(res.result) ? res.result : [];
      });
    },
    /**
     * 选择地址回调
     */
    handleSelect(v) {
      let area = "";
      let areaId = "";
      if (v != "") {
        v.forEach((child) => {
          if (child.selectedList != "") {
            // 只显示省份

            if (child.selectedAll) {
              area += child.name + ",";
              this.form.freightTemplateChildList[
                this.selectedIndex
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
      this.item.area = area;
      this.item.areaId = areaId;
    },
    //添加或者修改运费模板
    handleSubmit() {
      const headers = {
        "Content-Type": "application/json;charset=utf-8",
      };

      this.$refs.form.validate((valid) => {
        // const regNumber = /^\+?[1-9][0-9]*$/;
        // const regMoney =
        //   /(^[1-9]([0-9]+)?(\.[0-9]{1,2})?$)|(^(0){1}$)|(^[0-9]\.[0-9]([0-9])?$)/;
        if (valid) {
          if (this.form.pricingMethod != "FREE") {
            //校验运费模板详细信息
            for (
              let i = 0;
              i < this.form.freightTemplateChildList.length;
              i++
            ) {
              if (
                this.form.freightTemplateChildList[i].area == "" ||
                this.form.freightTemplateChildList[i].firstCompany == "" ||
                // this.form.freightTemplateChildList[i].firstPrice == "" ||
                this.form.freightTemplateChildList[i].continuedCompany == ""
                // this.form.freightTemplateChildList[i].continuedPrice == ""
              ) {
                this.saveError = true;
                return;
              }
              //  if (
              //   regNumber.test(
              //     this.form.freightTemplateChildList[i].firstCompany
              //   ) == false ||
              //   regNumber.test(
              //     this.form.freightTemplateChildList[i].continuedCompany
              //   ) == false ||
              //   regMoney.test(
              //     this.form.freightTemplateChildList[i].firstPrice
              //   ) == false ||
              //   regMoney.test(
              //     this.form.freightTemplateChildList[i].continuedPrice
              //   ) == false
              // ) {
              //   this.saveError = true;
              //   return;
              // }
            }
          }

          if (this.operation == "ADD") {
            API_Shop.addShipTemplate(this.form, headers).then((res) => {
              if (res.success) {
                this.$Message.success("新增成功");
                this.operation = "INFO";
                this.currentTab = "INFO";
                this.csTab = false;
                this.getData();
              }
            });
          } else {
            API_Shop.editShipTemplate(this.form.id, this.form, headers).then(
              (res) => {
                if (res.success) {
                  this.$Message.success("新增成功");
                  this.operation = "INFO";
                  this.currentTab = "INFO";
                  this.csTab = false;
                  this.getData();
                }
              }
            );
          }
        }
      });
    },
    //添加子模板
    addShipTemplateChildren() {
      const params = {
        area: "",
        areaId: "",
        firstCompany: 0,
        firstPrice: 0,
        continuedCompany: 0,
        continuedPrice: 0,
        selectedAll: false,
      };
      this.form.freightTemplateChildList.push(params);
    },
    //删除一个子模板
    removeTemplateChildren(index) {
      if (Object.keys(this.form.freightTemplateChildList).length == 1) {
        this.$Message.error("必须保留一个子模板");
        return;
      }
      this.form.freightTemplateChildList.splice(index, 1);
    },
    //删除运费模板
    remove(id) {
      this.$Modal.confirm({
        title: "确认删除",
        // 记得确认修改此处
        content: "您确认要删除此运费模板 ?",
        loading: true,
        onOk: () => {
          API_Shop.deleteShipTemplate(id).then((res) => {
            if (res.success) {
              this.$Message.success("删除成功");
            }
            this.$Modal.remove();
            this.getData();
          });
        },
      });
    },
  },
  mounted() {
    this.init();
    window.addEventListener("scroll", this.handleScroll, true);
  },
};
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
    color: #999;
    background-color: #fff;
    text-align: center;
    padding: 6px 0;
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

.order tbody tr th .temp-name {
  float: left;
  font-size: 14px;
  color: #555;
  // line-height: 44px;
  margin: 7px 0 0 10px;
}

.m-r-5 {
  margin-right: 5px !important;
}

.fr {
  float: right !important;
}

.m-b-30 {
  margin-bottom: 10px !important;
}

Button {
  margin: 3px 5px 0px 5px;
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
.baoyou {
  margin: 6px 10px 0;
}
/* 操作链接与分隔符不加粗 */
.order tbody tr th .fr a {
  font-weight: normal;
}
.order tbody tr th .fr span {
  font-weight: normal;
}
</style>
