<template>
  <Collapse v-model="open_panel">
    <Panel name="1">
      规格名称
      <div slot="content" class="sku-item-content">
        <Form :model="skuForm" @submit.native.prevent style="width:100%;">
          <div v-for="(item, $index) in skuInfo" :key="$index" class="sku_value">
            <Card :bordered="true" style="margin: 15px 0;">
              <FormItem label="规格名：" class="sku-item-content-name">
                <AutoComplete
                  style="width: 150px;"
                  v-model="item.name"
                  :maxlength="30"
                  :data="skuKey"
                  placeholder="请输入规格项名称"
                  :filter-method="filterMethod"
                  @on-change="skuItemChange(item.name,$index)"
                  @keyup.enter.native="editSkuItem(item, $index)"
                >
                   <!-- @on-focus="getActiveSkuItem(index, $index ,item, val)"
                   @on-blur="editSkuItem(item, $index)"
                   on-change 变更
                   on-focus	聚焦时触发	event
                   on-blur	失焦时触发
                   keyup.enter.native 回车时 -->
                </AutoComplete>
                <Button
                  type="error"
                  style="margin-left: 10px;"
                  @click="handleCloseSkuItem($index)"
                >删除</Button>
                <Checkbox
                  v-if="$index === 0"
                  style="padding: 0px 0px 0px 30px;"
                  v-model="checkedImage"
                  @on-change="handleChangeImage"
                >规格图片</Checkbox>
              </FormItem>

              <FormItem label="规格值：" class="sku-item-content-value">
                <!--规格值文本列表-->
                <div
                  v-for="(val, index) in item.spec_values"
                  :key="index"
                  style="padding: 0px 20px 10px 0px;float: left"
                >
                  <div style="display:inline-block;">
                    <AutoComplete
                      style="width: 150px; float: left"
                      v-model="val.value"
                      :maxlength="30"
                      :data="skuValue"
                      placeholder="请输入规格值名称"
                      :filter-method="filterMethod"
                      @on-change="skuValueChange(val.value,$index)"
                      @on-focus="editSkuIValue($index)"
                      @keyup.enter.native="editSkuIValue(item, val, $index, index)"
                    ></AutoComplete>
                    <Button
                      type="error"
                      style="float: left;margin-left: 10px"
                      @click="handleCloseSkuValue($index, index)"
                    >删除</Button>
                  </div>
                  <div>
                    <upload-pic-thumb
                        style="text-align: left;"
                        v-show="$index === 0 && checkedImage"
                        v-model="val.spec_image" v-on:change="thumbChange" :multiple="false" v-on:uploadchange="uploadchange"
                    />
                  </div>
                </div>
                <div style="float: left">
                  <Button type="primary" @click="addSpec($index, item)">添加规格值</Button>
                </div>
              </FormItem>
            </Card>
          </div>
        </Form>
        <Button type="primary" size="mini" @click="addSkuItem">添加规格项目</Button>
      </div>
    </Panel>
    <Panel name="2">
      规格详细
      <div slot="content">
        <div slot="content">
          <Table
            :columns="skuTableColumn"
            :data="skuTableData"
            style="width: 100%;.ivu-table-overflowX{ overflow-x: hidden;}"
            :span-method="handleSpan"
          >
            <template slot-scope="{ row }" slot="sn">
              <Input
                v-model="row.sn"
                placeholder="请输入货号"
                @on-change="updateSkuTable(row,'sn')"
                @on-focus="updateSkuTable(row,'sn')"
                @on-blur="updateSkuTable(row,'sn')"
              />
            </template>

            <template slot-scope="{ row }" slot="weight">
              <Input
                v-model="row.weight"
                placeholder="请输入重量"
                @on-change="updateSkuTable(row,'weight')"
              />
            </template>

            <template slot-scope="{ row }" slot="quantity">
              <Input
                v-model="row.quantity"
                placeholder="请输入库存"
                @on-change="updateSkuTable(row,'quantity')"
              />
            </template>

            <template slot-scope="{ row }" slot="cost">
              <Input
                v-model="row.cost"
                placeholder="请输入成本价"
                @on-change="updateSkuTable(row,'cost')"
              />
            </template>

            <template slot-scope="{ row }" slot="price">
              <Input
                v-model="row.price"
                placeholder="请输入成本价"
                @on-change="updateSkuTable(row,'price')"
              />
            </template>
          </Table>
        </div>
      </div>
    </Panel>
  </Collapse>
</template>
<script>
  import { regular } from "@/utils";
  import uploadPicThumb from "../lili/upload-pic-thumb.vue";
  import cloneObj from "@/utils/index";
export default {
  name: "goodsSku",
  components: {
    uploadPicThumb
  },
  props: {
    open_panel: {
      type: [String, Number],
      default: false
    },
    /** 是否自动生成货号 */
    productSn: {
      type: Boolean,
      default: false
    },
    /** 当前商品编号 */
    goodsSn: {
      type: [String, Number],
      default: ['', 0]
    }
  },
  data() {
    return {
      /** 请求数据*/
      skuData: [],

      /** 当前可选择的 规格名称*/
      skuKey: [],

      /** 当前可选择的 规格值*/
      skuValue: [],

      /** 表单数据*/
      skuForm: {},
      /** 表格头 */
      skuTableColumn: [],
      /** 表格数据 */
      skuTableData: [
        {
          sn: '',
          weight: '',
          quantity: '',
          cost: '',
          price: ''
        }
      ],
      /** 要提交的规格数据*/
      skuInfo: [],

      /** 当前规格项下的规格值列表*/
      specList: [],

      /** 当前规格项索引 */
      activeSkuItemIndex: 0,

      /** 当前规格项 */
      activeSkuItem: {},

      /** 规格图片 */
      images: [],
      /** 当前规格值索引 */
      activeSkuValIndex: 0,

      /** 当前规格值 */
      activeSkuVal: {},
      /** 存储未通过校验的单元格位置  */
      validateError: [],
      //规格照片
      checkedImage:false
    };
  },
  mounted(){

  },
  watch: {
    /** 自动生成货号 */
    productSn() {
      if (this.productSn && this.skuTableData.length > 0) {
        let count = 1
        this.skuTableData.forEach(key => {
          key.sn = this.goodsSn + '-00000' + count
          count++
        })
        /** 异步更新skuTableData数据 */
        this.$emit("getTableData", this.skuTableData);
      }
    }
  },
  methods: {
    uploadchange(url){
      /**
       * 渲染规格详细表格
       */
      this.renderTableData();
    },
    /** 添加规格项 */
    addSkuItem() {
      // 写入对象，下标，具体对象
      this.$set(this.skuInfo, this.skuInfo.length, {
        spec_values: []
      });
      /**
       * 渲染规格详细表格
       */
      this.renderTableData();
    },

    /** 移除当前规格项 进行数据变化*/
    handleCloseSkuItem($index) {
      this.skuInfo.splice($index, 1);
      /**
       * 渲染规格详细表格
       */
      this.renderTableData();
    },

    /** 规格变更  */
    skuItemChange(value, $index) {
      this.activeSkuItemIndex = $index;
      //判定是否存在这个规格分组
      let item = this.findSpec(value);
      /** 更新skuInfo数据 */
      this.$set(this.skuInfo[this.activeSkuItemIndex], "name", item.name);
      this.$set(this.skuInfo[this.activeSkuItemIndex], "spec_values", []);
      /**
       * 渲染规格详细表格
       */
      this.renderTableData();
    },
    /**
     * 根据规格项名称，搜索对应的规格对象（如果是服务器设置过的话）
     */
    findSpec(name) {
      let spec = { name: name };
      this.skuData.forEach(item => {
        if (item.name === name) {
          spec = item;
        }
      });
      return spec;
    },

    /** 选中/不选中 添加规格图片 是否显示上传组件*/
    handleChangeImage(val) {
      this.$set(this.skuInfo, this.skuInfo.length, {});
      this.skuInfo.splice(this.skuInfo.length - 1, 1);
      this.checkedImage = val;
      /** 如果 图片按钮不显示 则置空图片列表中的所有图片数据 并且spec_type设置为0 */
      if (!val) {
        this.skuInfo.forEach(key => {
          if (key.spec_values) {
            key.spec_values.forEach(item => {
              item.spec_image = "";
            });
          }
        });
      }
       /**
        * 渲染规格详细表格
        */
      this.renderTableData();


    },

    /** 规格值 */

    /** 添加当前规格项的规格值*/
    addSpec($index, item) {
      this.activeSkuItemIndex = $index;
      this.$set(
        this.skuInfo[$index].spec_values,
        this.skuInfo[$index].spec_values.length,
        {
          name: item.name
        }
      );
      /**
       * 渲染规格详细表格
       */
      this.renderTableData();
    },

    /** 移除当前规格值 */
    handleCloseSkuValue($index, index) {
      this.skuInfo[$index].spec_values.splice(index, 1);
      /**
       * 渲染规格详细表格
       */
      this.renderTableData();
    },

    /** 选择规格值时触发 */
    skuValueChange(val) {
      /** 更新skuInfo数据 */
      let _arr = cloneObj(this.skuInfo[this.activeSkuItemIndex]);
      this.$set(_arr.spec_values[this.activeSkuValIndex], "name", _arr.name);
      this.$set(this.skuInfo, this.activeSkuItemIndex, _arr);
      /**
       * 渲染规格详细表格
       */
      this.renderTableData();
    },

    /** 编辑规格值时触发 */
    editSkuIValue($index) {
      if (this.skuInfo.length >= $index) {
        let data = this.findSpec(this.skuInfo[$index].name);
        this.skuValue = data.value;
      }
      /**
       * 渲染规格详细表格
       */
      this.renderTableData();
    },
    /** 获取编辑时的skuInfo信息 */
    getSkuInfo() {
      /** 下拉列表数据(skuData)存在时 检测productSkuInfo中对应的规格(spec_id)项 并且赋值于skuInfo中对应的规格项信息（描述 + 名称） */
      if (this.categoryId) {
        API_spec.getSpecValuesListData(this.categoryId, {}).then(response => {
          this.skuData = response;
          if (
            this.skuData.length > 0 &&
            Array.isArray(this.productSkuInfo) &&
            this.productSkuInfo.length > 0
          ) {
            this.skuInfo = cloneObj(this.productSkuInfo);
            if (this.skuInfo.length > 0) {
              this.skuInfo.forEach(key => {
                this.skuData.forEach(item => {
                  if (key.spec_id === item.spec_id) {
                    key.name = item.name;
                    key.spec_memo = item.spec_memo;
                  }
                });
              });
            }
            /** 如果存在图片则进行显示 */
            if (this.skuInfo[0].spec_values[0].spec_type === 1) {
              this.checkedImage = true;
            }
            /** 触发一次数据转换（规格选择数据=> 规格表格数据） */
          }
        });
      }
      /**
       * 渲染规格详细表格
       */
      this.renderTableData();
    },
    /**
     * 渲染table所需要的column 和 data
     */
    renderTableData() {
      this.skuTableColumn = [];
      this.skuTableData = [];

      //渲染头部

      this.skuInfo.forEach(sku => {
        //列名称
        let columnName = sku.name;
        this.skuTableColumn.push({
          title: columnName,
          key: columnName
        });
      });
      this.skuTableColumn.push(
        {
          title: "货号",
          slot: "sn"
        },
        {
          title: "重量",
          slot: "weight"
        },
        {
          title: "库存",
          slot: "quantity"
        },
        {
          title: "成本价",
          slot: "cost"
        },
        {
          title: "价格",
          slot: "price"
        }
      );

      //克隆所有渲染的数据
      let cloneTemp = cloneObj(this.skuInfo);

      //数据清空一次
      this.skuTableData = [];
      //判定 是否存在规格分组
      if (cloneTemp[0]) {
        //存放最终结果
        let result = [];

        //记录存放表格的 key
        //循环选中的 sku 数据
        if(this.checkedImage===false){
         cloneTemp[0].spec_values.forEach(specItem => {
           result.push({
             [specItem.name]: specItem.value
           });
         });
        }else{
          cloneTemp[0].spec_values.forEach(specItem => {
            result.push({
              [specItem.name]: specItem.value,
              images: specItem.spec_image
            });
          });
        }

        cloneTemp.splice(0, 1);

        result = this.specIterator(result, cloneTemp);
        result = this.defaultParams(result);
        this.skuTableData = result;
      }
      this.$emit("getTableData", this.skuTableData);
    },

    /** 自动完成表单所需方法*/
    filterMethod(value, option) {
      return option.toUpperCase().indexOf(value.toUpperCase()) !== -1;
    },

    /** 根据分类id获取系统设置规格信息*/
    Get_SkuInfoByCategory() {
      if (this.baseInfoForm.categoryId) {
        getGoodsSpecInfo(this.baseInfoForm.categoryId, {}).then(response => {
          this.skuData = response;
          if (this.skuData.length > 0) {
            this.skuData.forEach(spec => {
              this.skuKey.push(spec.name);
            });
          }
        });
      }
    },
    /** 检测是否未通过0-99999999之间的数字校验 */
    isValidate(index, scope) {
      return this.validateError.some(key => {
        return key[0] === index && key[1] === scope.$index
      })
    },
    /** 数据改变之后 抛出数据 */
    updateSkuTable(row, item) {
      let index = row._index;
      this.skuTableData[index][item] = row[item];
      /** 进行自定义校验 判断是否是数字（小数也能通过）重量 */
      if (
        (!/^[+]{0,1}(\d+)$|^[+]{0,1}(\d+\.\d+)$/.test(row[item]) &&
          item === "weight") ||
        parseInt(row[item]) < 0 ||
        parseInt(row[item]) > 99999999
      ) {
        this.$Message.error("请输入0~99999999之间的数字值");
        return;
      } else if (
        (item === "quantity" && !/^[0-9]\d*$/.test(row[item])) ||
        parseInt(row[item]) < 0 ||
        parseInt(row[item]) > 99999999
      ) {
        // 库存
        this.$Message.error("请输入0~99999999之间的整数");
        return;
      } else if (
        ((item === "cost" || item === "price") &&
          !regular.money.test(row[item])) ||
        parseInt(row[item]) < 0 ||
        parseInt(row[item]) > 99999999
      ) {
        // 成本价 价格
        this.$Message.error("请输入0~99999999之间的价格");
        return;
      }
      this.skuTableData[index][item] = row[item];
      this.$emit("getTableData", this.skuTableData);
      // console.log(999, this.skuTableData)
    },
    /**
     * 迭代属性，形成表格
     * result 渲染的数据
     * array spec数据
     */
    specIterator(result, cloneTemp) {
      //是否还可以循环
      if (cloneTemp.length > 0) {
        let table = [];
        result.forEach(resItem => {
          let tableItem = [];
          cloneTemp[0].spec_values.forEach(valItem => {
            let obj = cloneObj(resItem);
            obj[valItem.name] = valItem.value;
            table.push(obj);
          });
        });
        result = [];
        table.forEach(t => {
          result.push(t);
        });
        //清除当前循环的分组
        cloneTemp.splice(0, 1);
      } else {
        return result;
      }
      return this.specIterator(result, cloneTemp);
    },
    showData() {
      // console.log(JSON.stringify(this.skuTableData));
      // console.warn(this.specList);
    },
    /**
     * 添加固有属性
     */
    defaultParams(tableData) {
      return tableData;
    },

    handleSpan({ row, column, rowIndex, columnIndex }) {},

    thumbChange(){
      this.$emit("getTableData", this.skuTableData);
    }
  },
};
</script>

<style lang="scss" scoped>
.layout {
    margin-bottom: 20px;

    .sku-item-content {
        display: flex;
        flex-direction: column;
        align-items: flex-start;
        justify-content: center;
        width: 100%;

        .sku-item-content-name {
            margin-top: 24px;
            display: flex;
            align-items: flex-start;
            width: 100%;
        }
    }
    .demo-upload-list{
        display: inline-block;
        width: 60px;
        height: 60px;
        text-align: center;
        line-height: 60px;
        border: 1px solid transparent;
        border-radius: 4px;
        overflow: hidden;
        background: #fff;
        position: relative;
        box-shadow: 0 1px 1px rgba(0,0,0,.2);
        margin-right: 4px;
    }
    .demo-upload-list img{
        width: 100%;
        height: 100%;
    }
    .demo-upload-list-cover{
        display: none;
        position: absolute;
        top: 0;
        bottom: 0;
        left: 0;
        right: 0;
        background: rgba(0,0,0,.6);
    }
    .demo-upload-list:hover .demo-upload-list-cover{
        display: block;
    }
    .demo-upload-list-cover i{
        color: #fff;
        font-size: 20px;
        cursor: pointer;
        margin: 0 2px;
    }

}
</style>
