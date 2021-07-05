<template>
  <div class="goods-operation">
    <!-- 选择商品类型 -->
    <Modal v-model="selectGoodsType" width="550" :closable="false">
      <div class="goods-type-list" v-if="!showGoodsTemplates">
        <div class="goods-type-item" :class="{'active-goods-type':item.check}" @click="handleClickGoodsType(item)"
             v-for="(item,index) in goodsTypeWay" :key="index">
          <img :src="item.img"/>
          <div>
            <h2>{{ item.title }}</h2>
            <p>{{ item.desc }}</p>
          </div>
        </div>
      </div>
      <div v-else class="goods-type-list">
        <h2 @click="showGoodsTemplates = !showGoodsTemplates">返回</h2>
        <div class="goods-type-item template-item" @click="handleClickGoodsTemplate(item)"
             v-for="(item,index) in goodsTemplates" :key="index">
          <img :src="item.thumbnail"/>
          <div>
            <h2>{{ item.goodsName }}</h2>
            <p>{{ item.sellingPoint || '' }}</p>
          </div>
        </div>

      </div>

    </Modal>

    <div class="step-list">
      <steps :current="activestep" simple style="height:60px;margin-top: 10px" process-status="process">
        <div class="step-view">
          <step title="选择商品品类"/>
        </div>
        <div class="step-view">
          <step title="填写商品详情"/>
        </div>
        <div class="step-view">
          <step title="商品发布成功"/>
        </div>
      </steps>
    </div>
    <div class="content-goods-publish" v-show="activestep === 0">
      <div class="goods-category">
        <ul v-if="categoryListLevel1 && categoryListLevel1.length > 0">
          <li v-for="(item, index) in categoryListLevel1" :class="{ activeClass: index == activeCategoryIndex1 }"
              @click="handleSelectCategory(item, index, 1)" :key="index">
            <span>{{ item.name }}</span>
            <span>&gt;</span>
          </li>
        </ul>
        <ul v-if="categoryListLevel2 && categoryListLevel2.length > 0">
          <li v-for="(item, index) in categoryListLevel2" :class="{ activeClass: index == activeCategoryIndex2 }"
              @click="handleSelectCategory(item, index, 2)" :key="index">
            <span>{{ item.name }}</span>
            <span>&gt;</span>
          </li>
        </ul>
        <ul v-if="categoryListLevel3 && categoryListLevel3.length > 0">
          <li v-for="(item, index) in categoryListLevel3" :class="{ activeClass: index == activeCategoryIndex3 }"
              @click="handleSelectCategory(item, index, 3)" :key="index">
            <span>{{ item.name }}</span>
          </li>
        </ul>
      </div>
      <p class="current-goods-category">
        您当前选择的商品类别是：
        <span>{{ activeCategoryName1 }}</span>
        <span v-show="activeCategoryName2">> {{ activeCategoryName2 }}</span>
        <span v-show="activeCategoryName3">> {{ activeCategoryName3 }}</span>
      </p>
      <template v-if="!$route.query.id && draftId">
        <Divider>已选商品模版:{{checkedTemplate()}}</Divider>
      </template>
    </div>

    <div class="content-goods-publish" v-show="activestep === 1">
      <Form ref="baseInfoForm" :model="baseInfoForm" :label-width="120" :rules="baseInfoFormRule">
        <div class="base-info-item">
          <h4>基本信息</h4>
          <div class="form-item-view">
            <FormItem label="商品分类">
              <span class="goods-category-name">{{ activeCategoryName1 }}</span>
              <span v-show="activeCategoryName2">> {{ activeCategoryName2 }}</span>
              <span v-show="activeCategoryName3">> {{ activeCategoryName3 }}</span>
              <span v-if="!activeCategoryName1" v-html="baseInfoForm.category_name"></span>
            </FormItem>
            <FormItem label="商品名称" prop="goodsName">
              <Input type="text" v-model="baseInfoForm.goodsName" placeholder="商品名称" clearable style="width: 260px"/>
            </FormItem>

            <FormItem label="商品卖点" prop="sellingPoint">
              <Input v-model="baseInfoForm.sellingPoint" type="textarea" :rows="4" style="width: 260px"/>
            </FormItem>
            <FormItem label="商品品牌" prop="brandId">
              <Select v-model="baseInfoForm.brandId" style="width: 200px">
                <Option v-for="item in brandList" :value="item.id" :key="item.id" :label="item.name"></Option>
              </Select>
            </FormItem>
          </div>
          <h4>商品交易信息</h4>
          <div class="form-item-view">
            <FormItem class="form-item-view-el" label="计量单位" prop="goodsUnit">
              <Select v-model="baseInfoForm.goodsUnit" style="width: 100px">
                <Option v-for="unit in goodsUnitList" :key="unit" :value="unit">{{ unit }}
                </Option>
              </Select>
            </FormItem>
            <FormItem class="form-item-view-el" label="销售模式" prop="salesModel">
              <RadioGroup type="button" v-if="baseInfoForm.goodsType!='VIRTUAL_GOODS'" button-style="solid"
                          v-model="baseInfoForm.salesModel">
                <Radio title="零售型" label="RETAIL">
                  <span>零售型</span>
                </Radio>
                <Radio title="批发型" label="WHOLESALE">
                  <span>批发型</span>
                </Radio>
              </RadioGroup>
              <RadioGroup type="button" v-else button-style="solid" v-model="baseInfoForm.salesModel">
                <Radio title="零售型" label="RETAIL">
                  <span>虚拟型</span>
                </Radio>

              </RadioGroup>

            </FormItem>
          </div>
          <h4>商品规格及图片</h4>
          <div class="form-item-view">
            <FormItem label="商品编号" prop="sn">
              <Input type="text" v-model="baseInfoForm.sn" placeholder="商品编号" clearable style="width: 260px"/>
            </FormItem>
            <FormItem label="商品价格" prop="price">
              <Input type="text" v-model="baseInfoForm.price" placeholder="商品价格" clearable style="width: 260px"/>
            </FormItem>
            <FormItem label="市场价格" prop="cost">
              <Input type="text" v-model="baseInfoForm.cost" placeholder="市场价格" clearable style="width: 260px"/>
            </FormItem>
            <FormItem class="form-item-view-el required" label="商品图片" prop="goodsGalleryFiles">
              <vuedraggable
                :list="baseInfoForm.goodsGalleryFiles"
                :animation="200"
                style="display:inline-block;"
                ghost-class="thumb-ghost"
              >
                <div class="demo-upload-list" v-for="(item, __index) in baseInfoForm.goodsGalleryFiles" :key="__index">
                  <template v-if="item.status === 'finished'">
                    <img :src="item.url"/>
                    <div class="demo-upload-list-cover">
                      <div>
                        <Icon type="ios-eye-outline" size="30" @click.native="handleViewGoodsPicture(item.url)"></Icon>
                        <Icon type="ios-trash-outline" size="30" @click.native="handleRemoveGoodsPicture(item)"></Icon>
                      </div>
                    </div>
                  </template>
                  <template v-else>
                    <Progress v-if="item.showProgress" :percent="item.percentage" hide-info></Progress>
                  </template>
                </div>
              </vuedraggable>
              <Upload ref="upload" :show-upload-list="false" :default-file-list="baseInfoForm.goodsGalleryFiles"
                      :on-success="handleSuccessGoodsPicture" :format="['jpg', 'jpeg', 'png']"
                      :on-format-error="handleFormatError" :on-exceeded-size="handleMaxSize"
                      :before-upload="handleBeforeUploadGoodsPicture" multiple type="drag" :action="uploadFileUrl"
                      :headers="accessToken" style="display: inline-block;margin-left:10px;">
                <div style="width: 80px; height: 80px; line-height: 80px">
                  <Icon type="ios-camera" size="20"></Icon>
                </div>
              </Upload>

              <Modal title="View Image" v-model="goodsPictureVisible">
                <img :src="previewGoodsPicture" v-if="goodsPictureVisible" style="width: 100%"/>
              </Modal>
            </FormItem>

            <div class="layout" style="width: 100%">
              <Collapse v-model="open_panel">
                <Panel name="1">
                  规格名称
                  <div slot="content" class="sku-item-content">
                    <Form :model="skuForm" @submit.native.prevent>
                      <div class="sku-item" v-for="(item, $index) in skuInfo" :key="$index">
                        <Card :bordered="true">
                          <FormItem label="规格名：" class="sku-item-content-name">
                            <AutoComplete style="width: 150px" v-model="item.name" :maxlength="30"
                                          placeholder="请输入规格项名称"
                                          :filter-method="filterMethod" :data="skuData"
                                          @on-change="editSkuItem">
                            </AutoComplete>
                            <Button type="error" style="margin-left: 10px" @click="handleCloseSkuItem($index)">删除
                            </Button>
                          </FormItem>

                          <FormItem label="规格值：" prop="sku">
                            <!--规格值文本列表-->
                            <div v-for="(val, index) in item.spec_values" :key="index"
                                 style="padding: 0px 20px 10px 0px; float: left">
                              <div>
                                <AutoComplete style="width: 150px; float: left" v-model="val.value"
                                  :maxlength="30" placeholder="请输入规格值名称"
                                  :filter-method="filterMethod" :data="skuVal"
                                  @on-focus="changeSkuVals(item.name)"
                                  @on-change="skuValueChange(val.value, $index, item)">
                                </AutoComplete>
                                <Button type="error" style="margin-left: 10px" @click="handleCloseSkuValue(item, index)">
                                  删除
                                </Button>
                              </div>
                            </div>
                            <div style="float: left">
                              <Button type="primary" @click="addSpec($index, item)">添加规格值</Button>
                            </div>
                          </FormItem>
                        </Card>
                      </div>
                    </Form>
                    <Button class="add-sku-btn" type="primary" size="mini" @click="addSkuItem">添加规格项目</Button>
                  </div>
                </Panel>
                <Panel name="2">
                  规格详细
                  <div slot="content">
                    <div slot="content">
                      <Table :columns="skuTableColumn" :data="skuTableData" style="
                          width: 100%;
                          .ivu-table-overflowX {
                            overflow-x: hidden;
                          }
                        ">
                        <template slot-scope="{ row }" slot="sn">
                          <Input v-model="row.sn" placeholder="请输入货号" @on-change="updateSkuTable(row, 'sn')"/>
                        </template>

                        <template slot-scope="{ row }" slot="weight" v-if="baseInfoForm.goodsType!='VIRTUAL_GOODS'">
                          <Input v-model="row.weight" placeholder="请输入重量" @on-change="updateSkuTable(row, 'weight')"/>
                        </template>

                        <template slot-scope="{ row }" slot="quantity">
                          <Input v-model="row.quantity" placeholder="请输入库存"
                                 @on-change="updateSkuTable(row, 'quantity')"/>
                        </template>

                        <template slot-scope="{ row }" slot="cost">
                          <Input v-model="row.cost" placeholder="请输入成本价" @on-change="updateSkuTable(row, 'cost')"/>
                        </template>

                        <template slot-scope="{ row }" slot="price">
                          <Input v-model="row.price" placeholder="请输入价格" @on-change="updateSkuTable(row, 'price')"/>
                        </template>
                        <template slot-scope="{ row }" slot="images">
                          <Button @click="editSkuPicture(row)">编辑图片</Button>
                          <Modal v-model="showSkuPicture" :styles="{ top: '30px' }" class-name="sku-preview-modal"
                                 title="编辑图片" ok-text="结束编辑" @on-ok="updateSkuPicture()" cancel-text="取消">
                            <div class="preview-picture">
                              <img v-if="previewPicture !== ''" :src="previewPicture"/>
                            </div>
                            <Divider/>
                            <div class="sku-upload-list" v-for="(img, __index) in selectedSku.images" :key="__index">
                              <template v-if="img.status === 'finished'">
                                <img :src="img.url"/>
                                <div class="sku-upload-list-cover">
                                  <Icon type="ios-eye-outline" @click="handleView(img.url)"></Icon>
                                  <Icon type="ios-trash-outline" @click="handleRemove(img, __index)"></Icon>
                                </div>
                              </template>
                              <template v-else>
                                <Progress v-if="img.showProgress" :percent="img.percentage" hide-info></Progress>
                              </template>
                            </div>
                            <Upload ref="uploadSku" :show-upload-list="false" :default-file-list="row.images"
                                    :on-success="handleSuccess" :format="['jpg', 'jpeg', 'png']"
                                    :on-format-error="handleFormatError" :on-exceeded-size="handleMaxSize"
                                    :before-upload="handleBeforeUpload" multiple type="drag" :action="uploadFileUrl"
                                    :headers="accessToken" style="display: inline-block; width: 58px">
                              <div>
                                <Icon type="ios-camera" size="55"></Icon>
                              </div>
                            </Upload>
                          </Modal>
                        </template>
                      </Table>

                    </div>
                  </div>
                </Panel>
              </Collapse>
            </div>
          </div>
          <h4>商品详情描述</h4>
          <div class="form-item-view">
            <div class="tree-bar">
              <FormItem
                class="form-item-view-el"
                label="店内分类"
                prop="shopCategory"
              >
                <Tree
                  ref="tree"
                  :data="shopCategory"
                  show-checkbox
                  @on-select-change="selectTree"
                  @on-check-change="changeSelect"
                  :check-strictly="!strict"
                ></Tree>
              </FormItem>
            </div>
            <FormItem class="form-item-view-el" label="商品描述" prop="intro">
              <editor id="intro" v-model="baseInfoForm.intro"></editor>
            </FormItem>
            <FormItem class="form-item-view-el" label="移动端描述" prop="skuList">
              <editor id="mobileIntr" v-model="baseInfoForm.mobileIntro"></editor>
            </FormItem>
          </div>
          <div v-if="baseInfoForm.goodsType!='VIRTUAL_GOODS'">
            <h4>商品物流信息</h4>
            <div class="form-item-view">
              <FormItem class="form-item-view-el" label="商品重量" prop="weight">
                <Input v-model="baseInfoForm.weight">
                  <span slot="append">kg</span>
                </Input>
              </FormItem>

              <FormItem
                class="form-item-view-el"
                label="物流模板"
                prop="templateId"
              >
                <Select v-model="baseInfoForm.templateId" style="width: 200px">
                  <Option
                    v-for="item in logisticsTemplate"
                    :value="item.id"
                    :key="item.id"
                  >{{ item.name }}
                  </Option>
                </Select>
              </FormItem>
            </div>
            <h4>其他信息</h4>
            <div class="form-item-view">
              <FormItem class="form-item-view-el" label="商品发布" prop="release">
                <RadioGroup type="button" button-style="solid" v-model="baseInfoForm.release">
                  <Radio title="立即发布" label="true">
                    <span>立即发布</span>
                  </Radio>
                  <Radio title="放入仓库" label="false">
                    <span>放入仓库</span>
                  </Radio>
                </RadioGroup>
              </FormItem>
              <FormItem class="form-item-view-el" label="商品推荐" prop="skuList">
                <RadioGroup type="button" button-style="solid" v-model="baseInfoForm.recommend">
                  <Radio title="推荐" label="true">
                    <span>推荐</span>
                  </Radio>
                  <Radio title="不推荐" label="false">
                    <span>不推荐</span>
                  </Radio>
                </RadioGroup>
              </FormItem>
            </div>
            <div class="form-item-view-bottom">
              <Collapse v-model="params_panel" v-for="(paramsGroup,groupIndex) in goodsParams"
                        :title="paramsGroup.groupName"
                        class="mb_10"
                        style="text-align: left" :key="paramsGroup.groupName">
                <Panel :name="paramsGroup.groupName">
                  {{paramsGroup.groupName}}
                  <p slot="content">
                    <FormItem v-for="( params, paramsIndex) in paramsGroup.params" :key="paramsIndex"
                              :label="`${params.paramName}：`">
                      <Select v-model="params.paramValue" placeholder="请选择" style="width: 200px" clearable
                              @on-change="selectParams(paramsGroup,groupIndex,params,paramsIndex,params.paramValue)">
                        <Option v-for="option in params.options.split(',')" :label="option"
                                :value="option" :key="option"></Option>
                      </Select>
                    </FormItem>
                  </p>
                </Panel>
              </Collapse>
            </div>

          </div>
        </div>
      </Form>
    </div>
    <div class="content-goods-publish" v-show="activestep === 2">
      <template>

        <div class="success" style="text-align: left">
          <h1>恭喜您，商品发布成功!</h1>
          <div class="goToGoodsList" @click="gotoGoodsList">
            <a>去店铺查看商品列表>></a>
          </div>
          <div class="operation">
            <h3>您还可以：</h3>
            <div>
              1、继续
              <a @click="gotoBack">发布商品</a>
            </div>
            <div>
              2、进入卖家中心，管理
              <a @click="gotoGoodsList">商品列表</a>
            </div>
          </div>
        </div>

      </template>
    </div>
    <div class="footer">
      <ButtonGroup>
        <Button type="primary" @click="pre" v-if="activestep === 1 && isPublish">上一步
        </Button>
        <Button type="primary" @click="selectGoodsType=!selectGoodsType" v-if="activestep === 0">商品类型
        </Button>
        <Button type="primary" @click="next" v-if="activestep === 0">下一步
        </Button>
        <Button type="primary" @click="save" :loading="submitLoading" v-if="activestep === 1">
          {{ this.goodsId ? "保存" : "保存商品" }}
        </Button>
        <Button type="primary" @click="saveToDraft" v-if="activestep === 1">
          保存为模版
        </Button>
      </ButtonGroup>

    </div>
  </div>
</template>

<script>
import {regular} from "@/utils";
import editor from "@/views/my-components/lili/editor";
import * as API_GOODS from "@/api/goods";
import * as API_Shop from "@/api/shops";

import cloneObj from "@/utils/index";
import vuedraggable from "vuedraggable";
export default {
  name: "addGoods",
  components: {
    editor,
    vuedraggable
  },
  watch: {
    selectGoodsType: {
      handler(val) {
        if (val && this.baseInfoForm.goodsType) {
          this.goodsTypeWay.forEach((item) => {
            item.check = false;
            if (item.type == this.baseInfoForm.goodsType) {
              item.check = true;
            }
            if (!item.type) {
              this.defaultBaseInfo();
            }
          });
        }
      },
    },
    $route(to, from) {
      if (to.query.draftId) {
        this.draftId = to.query.draftId;
        this.activestep = 1;
        this.isOperationGoods = false;
        this.GET_GoodData();
      } else if (to.query.id) {
        this.activestep = 1;
        this.goodsId = this.$route.query.id;
        this.GET_GoodData();
      } else {
        this.selectGoodsType = true;
        this.defaultBaseInfo();
      }
    },
  },
  data() {
    // 表单验证项，商品价格
    const checkPrice = (rule, value, callback) => {
      if (!value && value !== 0) {
        return callback(new Error("商品价格不能为空"));
      }
      setTimeout(() => {
        if (!regular.money.test(value)) {
          callback(new Error("请输入正整数或者两位小数"));
        } else if (parseFloat(value) > 99999999) {
          callback(new Error("商品价格设置超过上限值"));
        } else {
          callback();
        }
      }, 1000);
    };
    // 表单验证项，商品编号
    const checkSn = (rule, value, callback) => {
      if (!value) {
        callback(new Error("商品编号不能为空"));
      } else if (!/^[a-zA-Z0-9_\\-]+$/g.test(value)) {
        callback(new Error("请输入数字、字母、下划线或者中划线"));
      } else {
        callback();
      }
    };
    // 表单验证项，商品重量
    const checkWeight = (rule, value, callback) => {
      if (!value && typeof value !== "number") {
        callback(new Error("重量不能为空"));
      } else if (!regular.money.test(value)) {
        callback(new Error("请输入正整数或者两位小数"));
      } else if (parseFloat(value) > 99999999) {
        callback(new Error("商品重量设置超过上限值"));
      } else {
        callback();
      }
    };

    return {
      selectGoodsType: false, //是否选择商品类型
      showGoodsTemplates: false, //是否显示选择商品模板
      goodsTypeWay: [
        {
          title: "实物商品",
          img: require("@/assets/goodsType1.png"),
          desc: "零售批发，物流配送",
          type: "PHYSICAL_GOODS",
          check: false,
        },
        {
          title: "虚拟商品",
          img: require("@/assets/goodsType2.png"),
          desc: "虚拟核验，无需物流",
          type: "VIRTUAL_GOODS",
          check: false,
        },
        {
          title: "商品模板导入",
          img: require("@/assets/goodsTypeTpl.png"),
          desc: "商品模板，一键导入",
          check: false,
        },
      ],
      //提交状态
      submitLoading: false,
      //上传图片路径
      uploadFileUrl: API_GOODS.uploadFile,
      // 预览图片
      previewPicture: "",
      //商品图片
      previewGoodsPicture: "",
      //展示图片层
      visible: false,
      //展示商品图片
      goodsPictureVisible: false,
      //展示sku图片
      showSkuPicture: false,
      //选择的sku
      selectedSku: {},
      //选择店铺分类
      strict: true,
      //模版 / 草稿 id
      draftId: undefined,
      /** 当前激活步骤*/
      activestep: 0,
      //是否在编辑商品
      isOperationGoods: true,
      //是否在发布商品
      isPublish: false,
      /** 当前点击的1级分类索引*/
      activeCategoryIndex1: -1,

      /** 当前点击的2级分类索引*/
      activeCategoryIndex2: -1,

      /** 当前点击的3级分类索引*/
      activeCategoryIndex3: -1,
      /** 当前商品分类名称1*/
      activeCategoryName1: "",

      /** 当前商品分类名称2*/
      activeCategoryName2: "",

      /** 当前商品分类名称3*/
      activeCategoryName3: "",
      /** 1级分类列表*/
      categoryListLevel1: [],

      /** 2级分类列表*/
      categoryListLevel2: [],

      /** 3级分类列表*/
      categoryListLevel3: [],

      /** 请求的商品参数组列表 */
      goodsParams: [],
      /** 当前状态/模式 默认发布商品0 编辑商品1 编辑草稿箱商品2 */
      currentStatus: 0,

      baseInfoForm: {
        salesModel: "RETAIL",
        /** 商品重量 */
        weight: "",
        /** 商品相册列表 */
        goodsGalleryFiles: [],
        /** 是否立即发布 0 立即发布 1放入仓库 */
        release: "true",
        /** 是否为推荐商品 */
        recommend: "true",
        /** 店铺分类 */
        storeCategoryPath: "",
        brandId: 0,
        /** 计量单位 **/
        goodsUnit: "",
        /** 商品类型 **/
        goodsType: "",
        /** 分类路径 **/
        categoryPath: "",
        /** 商品卖点 **/
        sellingPoint: "",
        /** 商品详情 **/
        intro: "",
        mobileIntro: "",
        updateSku: true,
        /** 是否重新生成sku */
        regeneratorSkuFlag: false,
        /** 物流模板id **/
        templateId: '',
        /** 参数组*/
        goodsParamsDTOList: [],
      },
      /** 表单数据*/
      skuForm: {},
      /** 表格头 */
      skuTableColumn: [],
      /** 表格数据 */
      skuTableData: [],

      /** 默认的规格参数 */
      skuData: [],

      /** 默认的规格值 */
      skuVals: [],
      // 某一规格名下的规格值
      skuVal: [],
      open_panel: [1, 2],

      /** 要提交的规格数据*/
      skuInfo: [],

      /** 规格图片 */
      images: [],

      /** 物流模板 **/
      logisticsTemplate: [],

      /** 固定列校验提示内容 */
      validatatxt: "请输入0~99999999之间的数字值",
      //参数panel展示
      params_panel: [],
      /** 存储未通过校验的单元格位置  */
      validateError: [],
      baseInfoFormRule: {
        goodsName: [
          {required: true, message: "请输入商品名称"},
          {
            whitespace: true,
            message: "商品名称不可为纯空格",
          },
          {
            min: 3,
            max: 60,
            message: "长度在 3 到 60 个字符",
          },
        ],
        sn: [
          {required: true, message: "请输入商品编号"},
          {validator: checkSn},
        ],
        price: [
          {required: true, message: "请输入商品价格"},
          {validator: checkPrice},
        ],
        cost: [
          {required: true, message: "请输入市场价格"},
          {validator: checkPrice},
        ],
        weight: [
          {required: true, message: "请输入物流参数"},
          {validator: checkWeight},
        ],
        templateId: [{required: true, message: '请选择物流模板'}],
        sellingPoint: [{required: true, message: "请输入商品卖点"}],
        goodsUnit: [{required: true, message: "请选择计量单位"}],
      },
      /** 品牌列表 */
      brandList: [],
      collapseVal: [],
      /** 店铺分类列表 */
      shopCategory: [],
      /** 商品单位列表 */
      goodsUnitList: {},
      goodsTemplates: [],
      ignoreColumn: [
        "_index",
        "_rowKey",
        "sn",
        "cost",
        "price",
        "weight",
        "quantity",
        "specId",
        "specValueId",
      ],
      skuValVisible: true,
    };
  },

  mounted() {
    this.accessToken = {
      accessToken: this.getStore("accessToken"),
    };
    // 获取物流模板
    API_Shop.getShipTemplate().then((res) => {
      if (res.success) {
        this.logisticsTemplate = res.result;
      }
    })

    // 编辑商品
    if (this.$route.query.id) {
      this.activestep = 1;
      this.goodsId = this.$route.query.id;
      this.GET_GoodData();
      this.selectGoodsType = false;

    }
    // 编辑模板
    else if (this.$route.query.draftId) {
      this.draftId = this.$route.query.draftId;
      this.activestep = 1;
      this.isOperationGoods = false;
      this.GET_GoodData();
      this.selectGoodsType = false;
    }
    //新增商品
    else {
      this.selectGoodsType = true;
      this.defaultBaseInfo();
    }
  },
  methods: {
    // 默认还原数据
    defaultBaseInfo() {
      this.baseInfoForm = {
        salesModel: "RETAIL",
        weight: "",
        goodsGalleryFiles: [],
        release: "true",
        recommend: "true",
        storeCategoryPath: "",
        brandId: 0,
        goodsUnit: "",
        goodsType: "",
        categoryPath: "",
        sellingPoint: "",
        intro: "",
        mobileIntro: "",
        updateSku: true,
        regeneratorSkuFlag: false,
        templateId: '',
        goodsParamsDTOList: [],
      };
      this.activestep = 0;
      this.isPublish = true;
      this.GET_GoodsTemplate();

      this.GET_NextLevelCategory();
    },
     // 获取已选模板
    checkedTemplate () {
      if(this.goodsTemplates.length) {
        return this.goodsTemplates.find(item=>{return item.id == this.draftId}).goodsName
      } else {
        return ""
      }
    },
    // 选择商品模板
    handleClickGoodsTemplate(val) {
      this.draftId = val.id;
      this.selectGoodsType = false;
      this.GET_GoodData();
      this.activestep = 1;
    },
    // 点击商品类型
    handleClickGoodsType(val) {
      this.goodsTypeWay.map((item) => {
        return (item.check = false);
      });

      val.check = !val.check;
      if (!val.type) {
        this.showGoodsTemplates = true;
      } else {
        this.baseInfoForm.goodsType = val.type;
        this.draftId = "";
      }
    },
    // 获取商品模板
    GET_GoodsTemplate() {
      let searchParams = {
        saveType: "TEMPLATE",
        sort: "create_time",
        order: "desc",
      };
      API_GOODS.getDraftGoodsListData(searchParams).then((res) => {
        if (res.success) {
          this.goodsTemplates = res.result.records;
        }
      });
    },
    /**
     * 选择参数
     * @paramsGroup 参数分组
     * @groupIndex 参数分组下标
     * @params 参数选项
     * @paramIndex 参数下标值
     * @value 参数选项值
     */
    selectParams(paramsGroup, groupIndex, params, paramsIndex, value) {
      if (!this.baseInfoForm.goodsParamsDTOList[groupIndex]) {
        this.baseInfoForm.goodsParamsDTOList[groupIndex] = {
          groupId:'',
          groupName:'',
          goodsParamsItemDTOList:[]
        }
      }
      //赋予分组id
      this.baseInfoForm.goodsParamsDTOList[groupIndex].groupId = paramsGroup.groupId
      //赋予分组名称
      this.baseInfoForm.goodsParamsDTOList[groupIndex].groupName = paramsGroup.groupName
      //参数详细为空，则赋予
      if (!this.baseInfoForm.goodsParamsDTOList[groupIndex].goodsParamsItemDTOList[paramsIndex]) {
        this.baseInfoForm.goodsParamsDTOList[groupIndex].goodsParamsItemDTOList[paramsIndex]={
          paramName: '',
          paramValue: '',
          isIndex: '',
          required: '',
          paramId: ''
        }
      }
      this.baseInfoForm.goodsParamsDTOList[groupIndex].goodsParamsItemDTOList[paramsIndex]={
        paramName: params.paramName,
        paramValue: value,
        isIndex: params.isIndex,
        required: params.required,
        paramId: params.id
      }

    },

    // 编辑sku图片
    editSkuPicture(row) {
      if (row.images && row.images.length > 0) {
        this.previewPicture = row.images[0].url;
      }
      this.selectedSku = row;
      this.showSkuPicture = true;
    },
    handleView (url) {
      this.previewPicture = url;
      this.visible = true;
    },
    handleRemove(item, index) {
      this.selectedSku.images = this.selectedSku.images.filter(
        (i) => i.url !== item.url
      );
      if (this.selectedSku.images.length > 0 && index === 0) {
        this.previewPicture = this.selectedSku.images[0].url;
      } else if (this.selectedSku.images.length < 0) {
        this.previewPicture = "";
      }
    },
    handleViewGoodsPicture(url) {
      this.previewGoodsPicture = url;
      this.goodsPictureVisible = true;
    },
    handleRemoveGoodsPicture(file) {
      this.baseInfoForm.goodsGalleryFiles =
        this.baseInfoForm.goodsGalleryFiles.filter((i) => i.url !== file.url);
    },
    updateSkuPicture() {
      this.baseInfoForm.regeneratorSkuFlag = true;
      let _index = this.selectedSku._index;
      this.skuTableData[_index] = this.selectedSku;
    },
    handleSuccess(res, file) {
      if (file.response) {
        file.url = file.response.result;
        if (this.selectedSku.images) {
          this.selectedSku.images.push(file);
        } else {
          this.selectedSku.images = [file];
        }
        this.previewPicture = file.url;
      }
    },
    handleSuccessGoodsPicture(res, file, fileList) {
      console.log(res, file, fileList);
      file.url = res.result;
      this.baseInfoForm.goodsGalleryFiles = fileList;
    },
    handleFormatError(file) {
      this.$Notice.warning({
        title: "文件格式不正确",
        desc:
          "File format of " +
          file.name +
          " is incorrect, please select jpg or png.",
      });
    },
    handleMaxSize(file) {
      this.$Notice.warning({
        title: "超过文件大小限制",
        desc: "图片  " + file.name + " 不能超过2mb",
      });
    },
    handleBeforeUploadGoodsPicture() {
      const check = this.baseInfoForm.goodsGalleryFiles.length < 5;
      if (!check) {
        this.$Notice.warning({
          title: "Up to five pictures can be uploaded.",
        });
      }
      return check;
    },
    handleBeforeUpload() {
      const check =
        this.selectedSku.images !== undefined &&
        this.selectedSku.images.length > 5;
      if (check) {
        this.$Notice.warning({
          title: "Up to five pictures can be uploaded.",
        });
      }
      return !check;
    },
    // 跳转商品列表
    gotoGoodsList() {
      this.$router.push({name: "goods"});
    },
    gotoBack() {
      this.$router.go();
    },
    /** 查询商品品牌列表 */
    getGoodsBrandList() {
      API_GOODS.getCategoryBrandListDataSeller(this.categoryId).then(
        (response) => {
          this.brandList = response;
        }
      );
    },
    // 获取商品单位
    GET_GoodsUnit() {
      API_GOODS.getGoodsUnitList().then((res) => {
        if (res.success) {
          this.goodsUnitList = res.result.records.map((i) => i.name);
        }
      });
    },
    // 获取当前店铺分类
    GET_ShopGoodsLabel() {
      API_GOODS.getShopGoodsLabelListSeller().then((res) => {
        if (res.success) {
          let shopCategories = !this.baseInfoForm.storeCategoryPath
            ? []
            : this.baseInfoForm.storeCategoryPath.split(",");

          this.shopCategory = res.result.map((i) => {
            i.title = i.labelName;
            i.expand = false;
            i.checked = shopCategories.some((o) => o === i.id);
            i.children = i.children.map((j) => {
              j.title = j.labelName;
              j.expand = false;
              j.checked = shopCategories.some((o) => o === j.id);
              return j;
            });
            return i;
          });
        }
      });
    },
    // 编辑时获取商品信息
    async GET_GoodData() {
      let response = {};
      if (this.draftId) {
        response = await API_GOODS.getDraftGoodsDetail(this.draftId);
      } else {
        response = await API_GOODS.getGoods(this.$route.query.id);
        this.goodsId = response.result.id;
      }
      this.baseInfoForm = {
        ...this.baseInfoForm,
        ...response.result,
      };

      this.baseInfoForm.release = "true";
      this.baseInfoForm.recommend = this.baseInfoForm.recommend
        ? "true"
        : "false";

      //分类名称展示
      this.activeCategoryName1 = response.result.categoryName[0];
      this.activeCategoryName2 = response.result.categoryName[1];
      this.activeCategoryName3 = response.result.categoryName[2];

      this.baseInfoForm.categoryId = response.result.categoryPath.split(",");


      if (
        response.result.goodsGalleryList &&
        response.result.goodsGalleryList.length > 0
      ) {
        this.baseInfoForm.goodsGalleryFiles =
          response.result.goodsGalleryList.map((i) => {
            let files = {url: i};
            return files;
          });
      }

      this.categoryId = this.baseInfoForm.categoryId[2];

      this.Get_SkuInfoByCategory(this.categoryId)

      this.renderGoodsDetailSku(response.result.skuList);

      /** 查询品牌列表 */
      this.getGoodsBrandList();
      /** 查询商品参数 */
      this.GET_GoodsParams();
      /** 查询店铺商品分类 */
      this.GET_ShopGoodsLabel();
      this.GET_GoodsUnit();
    },
    // 渲染sku数据
    renderGoodsDetailSku(skuList) {
      let skus = [];
      let skusInfo = [];
      skuList.map((e) => {
        let sku = {
          id: e.id,
          sn: e.sn,
          price: e.price,
          cost: e.cost,
          quantity: e.quantity,
          weight: e.weight,
        };
        e.specList.forEach((u) => {
          if (u.specName === "images") {
            sku.images = u.specImage;
          } else {
            sku[u.specName] = u.specValue;
            if (
              !skusInfo.some((s) => s.name === u.specName) &&
              !this.ignoreColumn.includes(u.specName)
            ) {
              skusInfo.push({
                name: u.specName,
                spec_id: u.specNameId,
                spec_values: [
                  {
                    id: u.specValueId,
                    name: u.specName,
                    value: u.specValue,
                  },
                ],
              });
            } else {
              skusInfo = skusInfo.map((sk) => {
                if (
                  !sk.spec_values.some((s) => s.value === u.specValue) &&
                  sk.name === u.specName
                ) {
                  sk.spec_values.push({
                    id: u.specValueId,
                    name: u.specName,
                    value: u.specValue,
                  });
                }
                if (!sk.spec_id && u.specName === "specId") {
                  sk.spec_id = u.specValue;
                }
                return sk;
              });
            }
          }
        });
        skus.push(sku);
      });
      this.skuInfo = skusInfo;
      /**
       * 渲染规格详细表格
       */
      this.renderTableData();
      this.skuTableData = skus;
    },

    /** 根据当前分类id查询商品应包含的参数 */
    GET_GoodsParams() {
      API_GOODS.getCategoryParamsListDataSeller(this.categoryId).then(
        (response) => {
          if (!response || response.length <= 0) {
            return;
          }
          this.goodsParams = response;

          //展开选项卡
          this.goodsParams.forEach(item => {
              this.params_panel.push(item.groupName)
            }
          )
          if (this.baseInfoForm.goodsParamsDTOList) {
            // 已选值集合
            const paramsArr = []
            this.baseInfoForm.goodsParamsDTOList.forEach(group =>{
              group.goodsParamsItemDTOList.forEach(param => {
                param.groupId = group.groupId
                paramsArr.push(param)
              })
            })
            // 循环参数分组
            this.goodsParams.forEach((parmsGroup) => {
              parmsGroup.params.forEach(param => {
              
                paramsArr.forEach(arr=>{
                  if(param.paramName == arr.paramName){
                    param.paramValue = arr.paramValue
                  }
                })
              })
            });
          } else {
            this.baseInfoForm.goodsParamsDTOList = []
          }
        }
      );
    },

    /** 添加规格项 */
    addSkuItem() {
      if (this.skuInfo.length >= 5) {
        this.$Message.error("规格项不能大于5个！");
        return;
      }
      // 写入对象，下标，具体对象
      this.$set(this.skuInfo, this.skuInfo.length, {
        spec_values: [],
      });
      /**
       * 渲染规格详细表格
       */
      this.renderTableData();
    },
    // 编辑规格名
    editSkuItem() {
      this.renderTableData();
    },
    // 编辑规格值
    async skuValueChange(val, index, item) {
 
      /**
       * 渲染规格详细表格
       */
      this.renderTableData();
    },
    // 获取焦点时，取得规格名对应的规格值
    changeSkuVals(name) {
      if (name) {
        this.skuData.forEach((e, index) => {
          if (e === name) {
            if (this.skuVal.length != this.skuVals[index].length) {
              this.skuVal = this.skuVals[index]
            }
          }
        })
      }
    },
    /** 移除当前规格项 进行数据变化*/
    handleCloseSkuItem($index) {
      this.skuInfo.splice($index, 1);
      /**
       * 渲染规格详细表格
       */
      this.renderTableData();
    },
    // 添加规格值的验证
    validateEmpty(params) {
      let flag = true;
      params.forEach((item) => {
        for (var key in item) {
          if (item[key] != "0" && !item.value) {
            this.$Message.error("请必填规格项");
            flag = false;
            return false; // 终止程序
          }
        }
      });

      return flag;
    },
    /** 添加当前规格项的规格值*/
    addSpec($index, item) {

      if (this.validateEmpty(item.spec_values)) {
        if (item.spec_values.length >= 10) {
          this.$Message.error("规格值不能大于10个！");
          return;
        }
        this.$set(
          item.spec_values,
          item.spec_values.length,
          {
            name: item.name,
          }
        );
        this.baseInfoForm.regeneratorSkuFlag = true;
        /**
         * 渲染规格详细表格
         */
        this.renderTableData();
      }
    },

    /** 移除当前规格值 */
    handleCloseSkuValue(item, index) {
      item.spec_values.splice(index, 1);

      this.baseInfoForm.regeneratorSkuFlag = true;
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
      let pushData = [];
      //渲染头部
      this.skuInfo.forEach((sku) => {
        //列名称
        let columnName = sku.name;
        pushData.push({
          title: columnName,
          key: columnName,
        });
      });
      
      this.baseInfoForm.goodsType != "VIRTUAL_GOODS"
        ? pushData.push({
          title: "重量",
          slot: "weight",
        })
        : "";
      pushData.push(
        {
          title: "货号",
          slot: "sn",
        },
        {
          title: "库存",
          slot: "quantity",
        },
        {
          title: "成本价",
          slot: "cost",
        },
        {
          title: "价格",
          slot: "price",
        },
        {
          title: "图片",
          slot: "images",
        }
      );

      this.skuTableColumn = pushData;
      //克隆所有渲染的数据
      let cloneTemp = cloneObj(this.skuInfo);

      //数据清空一次
      this.skuTableData = [];
      //判定 是否存在规格分组
      if (cloneTemp[0]) {
        //存放最终结果
        let result = [];
        //循环选中的 sku 数据
        cloneTemp[0].spec_values.forEach((specItem) => {
          result.push({
            [cloneTemp[0].name]: specItem.value,
            images: this.baseInfoForm.goodsGalleryFiles || [],
          });
        });
        cloneTemp.splice(0, 1);
        result = this.specIterator(result, cloneTemp);
        this.skuTableData = result;
      }
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
        result.forEach((resItem) => {
          cloneTemp[0].spec_values.forEach((valItem) => {
            let obj = cloneObj(resItem);
            obj[cloneTemp[0].name] = valItem.value;
            table.push(obj);
          });
        });
        result = [];
        table.forEach((t) => {
          result.push(t);
        });
        //清除当前循环的分组
        cloneTemp.splice(0, 1);
        
      } else {
        return result;
      }
      return this.specIterator(result, cloneTemp);
    },
    /** 根据分类id获取系统设置规格信息*/
    Get_SkuInfoByCategory(categoryId) {
      if (categoryId) {
        API_GOODS.getGoodsSpecInfoSeller(categoryId).then(res => {
            if (res.length) {
              res.forEach(e => {
                this.skuData.push(e.specName)
                const vals = e.specValue ? e.specValue.split(',') : []
                this.skuVals.push(Array.from(new Set(vals)))
              })
            }
          }
        );
      }
    },
    /** 自动完成表单所需方法*/
    filterMethod(value, option) {
      return option.toUpperCase().indexOf(value.toUpperCase()) !== -1;
    },
    // 节流函数
    throttle (fn,time) {
      let startTime = new Date();//初始时间
      return function(){
        let time_ = (new Date() - startTime) >= time;//判断时间间隔是否大于传入的time值，返回布尔值
        if(time_){
          fn.apply(this);
          startTime = new Date();//函数执行完后更新初始时间的值
        }
      }
    },
    /** 数据改变之后 抛出数据 */
    updateSkuTable(row, item) {
      let index = row._index;
      this.baseInfoForm.regeneratorSkuFlag = true;
      // this.skuTableData[index][item] = row[item];
      /** 进行自定义校验 判断是否是数字（小数也能通过）重量 */
      if (item === "weight") {
        if (
          !/^[+]{0,1}(\d+)$|^[+]{0,1}(\d+\.\d+)$/.test(row[item]) ||
          parseInt(row[item]) < 0 ||
          parseInt(row[item]) > 99999999
        ) {
          // 校验未通过 加入错误存储列表中
          this.validateError.push([index, item]);
          this.validatatxt = "请输入0~99999999之间的数字值";
          return;
        }
      } else if (item === "quantity") {
        if (
          !/^[0-9]\d*$/.test(row[item]) ||
          parseInt(row[item]) < 0 ||
          parseInt(row[item]) > 99999999
        ) {
          // 库存
          this.validateError.push([index, item]);
          this.validatatxt = "请输入0~99999999之间的整数";
          return;
        }
      } else if (item === "cost" || item === "price") {
        if (
          !regular.money.test(row[item]) ||
          parseInt(row[item]) < 0 ||
          parseInt(row[item]) > 99999999
        ) {
          // 成本价 价格
          this.validateError.push([index, item]);
          this.validatatxt = "请输入0~99999999之间的价格";
          return;
        }
      }
      this.skuTableData[index][item] = row[item];
    },
    /** 上一步*/
    pre() {
      window.scrollTo(0, 0);
      this.loading = true;
      if (this.activestep === 1) {
        this.toPreCount > 0
          ? this.GET_NextLevelCategory()
          : this.GET_NextLevelCategory(null, 0, true);
        if (this.activestep-- < 0) this.activestep = 0;
        this.toPreCount++;
        this.loading = false;
      } else {
        this.activestep--;
        this.loading = false;
      }
    },
    /** 下一步*/
    next() {
      window.scrollTo(0, 0);
      if (this.activestep === 0 && this.draftId) {
        this.activestep = 1;
        this.GET_GoodData();
        return;
      }
      this.GET_GoodsParams();
      /** 1级校验 */
      this.loading = true;
      if (this.activestep === 0 && !this.baseInfoForm.goodsType) {
        this.$Message.error('请选择商品类型')
        this.loading = false;
        return
      }
      if (this.activestep === 0 && !this.activeCategoryName1) {
        this.$Message.error("请选择商品分类");
        this.loading = false;
        return;
      } else if (this.activestep === 0 && this.activeCategoryIndex3 === -1) {
        this.$Message.error("必须选择到三级分类");
        this.loading = false;
        return;
      } else if (
        this.activestep === 0 &&
        this.activeCategoryName3 &&
        this.currentStatus === 0
      ) {
        /** 获取该商城分类下 商品参数信息 */
        /** 查询品牌列表 */
        this.getGoodsBrandList();
        /** 查询分类绑定的规格信息 */
        this.Get_SkuInfoByCategory(this.baseInfoForm.categoryId);
        // 获取商品单位
        this.GET_GoodsUnit();
        // 获取当前店铺分类
        this.GET_ShopGoodsLabel();
      }

      /** 2级校验 */
      if (this.activestep === 1) {
        this.$refs["baseInfoForm"].validate((valid) => {
          if (valid) {
            /** 规格校验 */
            if (!this.skuFormVali()) {
              this.loading = false;
              return;
            }
            this.loading = false;
            if (this.activestep++ > 2) return;
          } else {
            this.loading = false;
            this.$message.error(
              "表单中存在未填写或者填写有误的地方,已有错误标示，请检查并正确填写"
            );
          }
        });
        return;
      }
      /** 下一步 */
      this.loading = false;
      if (this.activestep++ > 2) return;
    },
    // 店内分类选择
    selectTree(v) {
      if (v.length > 0) {
        // 转换null为""
        for (let attr in v[0]) {
          if (v[0][attr] == null) {
            v[0][attr] = "";
          }
        }
        let str = JSON.stringify(v[0]);
        let menu = JSON.parse(str);
        this.form = menu;
        this.editTitle = menu.title;
      }
    },
    // 店内分类选中
    changeSelect(v) {
      this.selectCount = v.length;
      let ids = "";
      v.forEach(function (e) {
        ids += e.id + ",";
      });
      ids = ids.substring(0, ids.length - 1);
      this.baseInfoForm.storeCategoryPath = ids;
    },
    /**  添加商品 **/
    save() {
      this.submitLoading = true;
      this.$refs["baseInfoForm"].validate((valid) => {
        if (valid) {
          if (
            this.baseInfoForm.goodsGalleryFiles &&
            this.baseInfoForm.goodsGalleryFiles.length <= 0
          ) {
            this.submitLoading = false;
            this.$Message.error("请上传商品图片");
            return;
          }
          if (this.baseInfoForm.templateId === '') this.baseInfoForm.templateId = 0;
          let flag = false;
          let paramValue = "";
          // //参数校验
          // this.baseInfoForm.goodsParamsList.forEach((e) => {
          //   if (
          //     (e.required === 1 && e.paramValue === null) ||
          //     e.paramValue === undefined
          //   ) {
          //     flag = true;
          //     paramValue = e.paramName;
          //   }
          // });
          if (flag) {
            this.$Message.error(paramValue + " 参数值不能为空");
            this.submitLoading = false;
            return;
          }

          this.baseInfoForm.skuList = this.skuTableData.map((sku) => {
            delete sku._index;
            delete sku._rowKey;
            delete sku.specNameId;
            delete sku.specValueId;
            return sku;
          });

          if (this.baseInfoForm.goodsGalleryFiles.length > 0) {
            this.baseInfoForm.goodsGalleryList =
              this.baseInfoForm.goodsGalleryFiles.map((i) => i.url);
          }
          /** 参数校验 **/
          /* Object.keys(this.baseInfoForm.goodsParamsList).forEach((item) => {
          });*/

          if (this.goodsId) {
            API_GOODS.editGoods(this.goodsId, this.baseInfoForm).then((res) => {
              if (res.success) {
                this.submitLoading = false;
                this.$router.go(-1);
              } else {
                this.submitLoading = false;
              }
            });
          } else {
            // this.baseInfoForm.goodsType = "NORMAL";
            API_GOODS.createGoods(this.baseInfoForm).then((res) => {
              if (res.success) {
                this.submitLoading = false;
                this.activestep = 2;
                window.scrollTo(0, 0);
              } else {
                this.submitLoading = false;
              }
            });
          }
        } else {
          this.submitLoading = false;
        }
      });
    },
    /** 保存为模板 */
    saveToDraft() {
      this.baseInfoForm.skuList = this.skuTableData;
      if (this.baseInfoForm.goodsGalleryFiles.length > 0) {
        this.baseInfoForm.goodsGalleryList =
          this.baseInfoForm.goodsGalleryFiles.map((i) => i.url);
      }
      this.baseInfoForm.categoryName = [];
      this.baseInfoForm.saveType = 'TEMPLATE';

      if (this.draftId) {
        this.baseInfoForm.id = this.draftId;
        this.$Modal.confirm({
          title: "当前模板已存在",
          content: "当前模板已存在，保存为新模板或替换原模板",
          okText: "保存新模板",
          cancelText: "替换旧模板",
          closable: true,
          onOk: () => {
            delete this.baseInfoForm.id;
            this.SAVE_DRAFT_GOODS();
            return;
          },
          onCancel: () => {
            this.SAVE_DRAFT_GOODS();
            return;
          },
        });
        return;
      }

      this.$Modal.confirm({
        title: "保存模板",
        content: "是否确定保存",
        okText: "保存",
        closable: true,
        onOk: () => {
          this.SAVE_DRAFT_GOODS();
        },
      });
    },
    SAVE_DRAFT_GOODS() { // 保存模板
      API_GOODS.saveDraftGoods(this.baseInfoForm).then((res) => {
        if (res.success) {
          this.$Message.info("保存成功！");
          this.$router.back();
        }
      });
    },
    /** 选择商城商品分类 */
    handleSelectCategory(row, index, level) {
      if (level === 1) {
        this.baseInfoForm.categoryPath = row.id;
        this.activeCategoryName1 = row.name;
        this.activeCategoryName2 = this.activeCategoryName3 = "";
        this.activeCategoryIndex1 = index;
        this.activeCategoryIndex2 = -1;
        this.activeCategoryIndex3 = -1;
        this.categoryListLevel2 = this.categoryListLevel1[index].children;
        this.categoryListLevel3 = [];
      } else if (level === 2) {
        this.baseInfoForm.categoryPath =
          this.baseInfoForm.categoryPath + "," + row.id;
        this.activeCategoryName2 = row.name;
        this.activeCategoryName3 = "";
        this.activeCategoryIndex2 = index;
        this.activeCategoryIndex3 = -1;
        this.categoryListLevel3 = this.categoryListLevel2[index].children;
      } else {
        this.baseInfoForm.categoryPath =
          this.baseInfoForm.categoryPath + "," + row.id;
        this.activeCategoryName3 = row.name;
        this.activeCategoryIndex3 = index;
      }
      // 设置当前商城分类ID
      this.baseInfoForm.categoryId = row.id;
      this.categoryId = row.id;
      this.baseInfoForm.categoryName = row.name;
    },
    /** 查询下一级 商城商品分类*/
    GET_NextLevelCategory(row, level, not_click = false) {
      this.loading = true;
      const _id = row && row.id !== 0 ? row.id : 0;
      API_GOODS.getGoodsCategoryAll().then((res) => {
        if (res.success && res.result) {
          this.categoryListLevel1 = res.result;
        }
      });
    },
  },
};
</script>

<style lang="scss" scoped>
@import "./addGoods.scss";
</style>
