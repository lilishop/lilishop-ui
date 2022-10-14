<template>
  <div>
    <div class="content-goods-publish">
      <Form
        ref="baseInfoForm"
        :label-width="120"
        :model="baseInfoForm"
        :rules="baseInfoFormRule"
      >
        <div class="base-info-item">
          <h4>基本信息</h4>
          <div class="form-item-view">
            <FormItem label="商品分类">
              <span class="goods-category-name">{{
                this.baseInfoForm.categoryName[0]
              }}</span>
              <span> &gt; {{ this.baseInfoForm.categoryName[1] }}</span>
              <span> &gt; {{ this.baseInfoForm.categoryName[2] }}</span>
            </FormItem>
            <FormItem label="商品名称" prop="goodsName">
              <Input
                v-model="baseInfoForm.goodsName"
                clearable
                placeholder="商品名称"
                style="width: 260px"
                type="text"
              />
            </FormItem>

            <FormItem label="商品价格" prop="price">
              <Input
                v-model="baseInfoForm.price"
                clearable
                placeholder="商品价格"
                style="width: 260px"
                type="text"
              />
            </FormItem>
            <FormItem label="商品卖点" prop="sellingPoint">
              <Input
                v-model="baseInfoForm.sellingPoint"
                :rows="4"
                style="width: 260px"
                type="textarea"
              />
            </FormItem>
            <FormItem label="商品品牌" prop="brandId">
              <Select
                v-model="baseInfoForm.brandId"
                filterable
                style="width: 200px"
              >
                <Option
                  v-for="item in brandList"
                  :key="item.id"
                  :label="item.name"
                  :value="item.id"
                ></Option>
              </Select>
            </FormItem>
          </div>
          <h4>商品交易信息</h4>
          <div class="form-item-view">
            <FormItem
              class="form-item-view-el"
              label="计量单位"
              prop="goodsUnit"
            >
              <Select v-model="baseInfoForm.goodsUnit" style="width: 100px">
                <Option
                  v-for="(item, index) in goodsUnitList"
                  :key="index"
                  :value="item"
                  >{{ item }}
                </Option>
              </Select>
            </FormItem>
            <FormItem
              class="form-item-view-el"
              label="销售模式"
              prop="salesModel"
            >
              <RadioGroup
                v-if="baseInfoForm.goodsType != 'VIRTUAL_GOODS'"
                v-model="baseInfoForm.salesModel"
                button-style="solid"
                type="button"
                @on-change="renderTableData(skuTableData)"
              >
                <Radio label="RETAIL" title="零售型">零售型</Radio>
                <Radio label="WHOLESALE" title="批发型">批发型</Radio>
              </RadioGroup>
              <RadioGroup
                v-else
                v-model="baseInfoForm.salesModel"
                button-style="solid"
                type="button"
              >
                <Radio label="RETAIL" title="零售型">
                  <span>虚拟型</span>
                </Radio>
              </RadioGroup>
            </FormItem>
            <FormItem
              v-if="baseInfoForm.salesModel == 'WHOLESALE'"
              class="form-item-view-el"
              label="销售规则"
              prop="wholesaleRule"
            >
              <div class="form-item-view-wholesale">
                <div>
                  <Table
                    :columns="wholesaleColumns"
                    :data="wholesaleData"
                    border
                  >
                    <template slot="wholesaleNum" slot-scope="{ row, index }">
                      <div>
                        <Input
                          v-model="wholesaleData[index].num"
                          min="1"
                          number
                          type="number"
                          @on-blur="checkWholesaleNum(index)"
                        >
                          <span slot="append">{{
                            baseInfoForm.goodsUnit || ""
                          }}</span>
                        </Input>
                      </div>
                    </template>
                    <template slot="wholesalePrice" slot-scope="{ row, index }">
                      <div
                        style="
                          display: flex;
                          justify-content: space-between;
                          align-items: center;
                        "
                      >
                        <Input
                          v-model="wholesaleData[index].price"
                          min="1"
                          number
                          style="width: 190px"
                          type="number"
                          @on-blur="checkWholesalePrice(index)"
                        >
                          <span slot="append">元</span>
                        </Input>
                        <Button
                          v-if="index > 0"
                          size="small"
                          style="margin-left: 5px"
                          type="error"
                          @click="handleDeleteWholesaleData(index)"
                          >删除
                        </Button>
                      </div>
                    </template>
                  </Table>

                  <Button
                    v-if="wholesaleData.length < 3"
                    icon="md-add"
                    style="margin-top: 10px"
                    @click="handleAddWholesaleData()"
                  >
                    添加价格区间
                  </Button>
                </div>
                <div class="form-item-view-wholesale-preview">
                  <Table
                    :columns="wholesalePreviewColumns"
                    :data="wholesaleData"
                    border
                  ></Table>
                </div>
              </div>
            </FormItem>
          </div>
          <h4>商品规格及图片</h4>
          <div class="form-item-view">
            <FormItem
              class="form-item-view-el required"
              label="商品图片"
              prop="goodsGalleryFiles"
            >
              <div style="display: flex; flex-wrap: flex-start">
                <vuedraggable
                  :animation="200"
                  :list="baseInfoForm.goodsGalleryFiles"
                >
                  <div
                    v-for="(item, __index) in baseInfoForm.goodsGalleryFiles"
                    :key="__index"
                    class="demo-upload-list"
                  >
                    <template>
                      <img :src="item.url" />
                      <div class="demo-upload-list-cover">
                        <div>
                          <Icon
                            size="30"
                            type="md-search"
                            @click.native="handleViewGoodsPicture(item.url)"
                          ></Icon>
                          <Icon
                            size="30"
                            type="md-trash"
                            @click.native="handleRemoveGoodsPicture(item)"
                          ></Icon>
                        </div>
                      </div>
                    </template>
                  </div>
                </vuedraggable>

                <Upload
                  ref="upload"
                  :action="uploadFileUrl"
                  :before-upload="handleBeforeUploadGoodsPicture"
                  :format="['jpg', 'jpeg', 'png']"
                  :headers="{ ...accessToken }"
                  :max-size="1024"
                  :on-exceeded-size="handleMaxSize"
                  :on-format-error="handleFormatError"
                  :on-success="handleSuccessGoodsPicture"
                  :show-upload-list="false"
                  multiple
                  style="margin-left: 10px"
                  type="drag"
                >
                  <div style="width: 148px; height: 148px; line-height: 148px">
                    <Icon size="20" type="md-add"></Icon>
                  </div>
                </Upload>
              </div>
              <Modal v-model="goodsPictureVisible" title="View Image">
                <img
                  v-if="goodsPictureVisible"
                  :src="previewGoodsPicture"
                  style="width: 100%"
                />
              </Modal>
            </FormItem>
            <div class="layout" style="width: 100%">
              <Collapse v-model="open_panel">
                <Panel name="1">
                  自定义规格项
                  <div slot="content">
                    <Form>
                      <div
                        v-for="(item, $index) in skuInfo"
                        :key="$index"
                        class="sku-item-content"
                      >
                        <Card :bordered="true" class="ivu-card-body">
                          <Button
                            slot="extra"
                            type="primary"
                            @click="handleCloseSkuItem($index, item)"
                          >
                            删除规格
                          </Button>
                          <div>
                            <FormItem
                              class="sku-item-content-val flex"
                              label="规格名"
                            >
                              <AutoComplete
                                v-model="item.name"
                                :data="skuData"
                                :filter-method="filterMethod"
                                :maxlength="30"
                                placeholder="请输入规格名称"
                                style="width: 150px"
                                @on-focus="changeSkuItem(item.name)"
                                @on-change="
                                  editSkuItem(item.name, $index, item)
                                "
                              >
                              </AutoComplete>
                            </FormItem>
                          </div>
                          <div class="flex sku-val">
                            <Form :model="item" class="flex">
                              <!--规格值文本列表-->
                              <FormItem
                                v-for="(val, index) in item.spec_values"
                                :key="index"
                                class="sku-item-content-val flex"
                                label="规格项"
                              >
                                <AutoComplete
                                  ref="input"
                                  v-model="val.value"
                                  :data="skuVal"
                                  :filter-method="filterMethod"
                                  :maxlength="30"
                                  placeholder="请输入规格项"
                                  style="width: 150px"
                                  @on-focus="changeSkuVals(val, item.name)"
                                  @on-blur="checkSkuVal(val, index)"
                                  @on-change="skuValueChange(val, index, item)"
                                >
                                </AutoComplete>
                                <Button
                                  size="small"
                                  style="margin-left: 10px"
                                  type="primary"
                                  @click="handleCloseSkuValue(val, index, item)"
                                >
                                  删除
                                </Button>
                              </FormItem>
                            </Form>
                          </div>
                          <div>
                            <Button @click="addSpec($index, item)"
                              >添加规格值
                            </Button>
                          </div>
                        </Card>
                      </div>
                    </Form>
                    <Button
                      class="add-sku-btn"
                      size="small"
                      type="primary"
                      @click="addSkuItem"
                      >添加规格项
                    </Button>
                    &nbsp;
                    <Button
                      class="add-sku-btn"
                      size="small"
                      type="warning"
                      @click="handleClearSku"
                      >清空规格项
                    </Button>
                  </div>
                </Panel>
                <Panel name="2">
                  规格详细
                  <div slot="content">
                    <div slot="content">
                      <Table
                        :columns="skuTableColumn"
                        :data="skuTableData"
                        class="mt_10"
                        style="
                          width: 100%;
                          .ivu-table-overflowX {
                            overflow-x: hidden;
                          }
                        "
                      >
                        <template slot="sn" slot-scope="{ row }">
                          <Input
                            v-model="row.sn"
                            clearable
                            placeholder="请输入货号"
                            @on-change="updateSkuTable(row, 'sn')"
                          />
                        </template>
                        <div
                          v-if="baseInfoForm.goodsType !== 'VIRTUAL_GOODS'"
                          slot="weight"
                          slot-scope="{ row }"
                        >
                          <Input
                            v-model="row.weight"
                            clearable
                            placeholder="请输入重量"
                            @on-change="updateSkuTable(row, 'weight')"
                          >
                            <span slot="append">kg</span>
                          </Input>
                        </div>
                        <template slot="quantity" slot-scope="{ row }">
                          <Input
                            v-model="row.quantity"
                            clearable
                            placeholder="请输入库存"
                            @on-change="updateSkuTable(row, 'quantity')"
                          >
                            <span slot="append">{{
                              baseInfoForm.goodsUnit || ""
                            }}</span>
                          </Input>
                        </template>
                        <template slot="cost" slot-scope="{ row }">
                          <Input
                            v-model="row.cost"
                            clearable
                            placeholder="请输入成本价"
                            @on-change="updateSkuTable(row, 'cost')"
                          >
                            <span slot="append">元</span>
                          </Input>
                        </template>
                        <template slot="price" slot-scope="{ row }">
                          <Input
                            v-model="row.price"
                            clearable
                            placeholder="请输入价格"
                            @on-change="updateSkuTable(row, 'price')"
                          >
                            <span slot="append">元</span>
                          </Input>
                        </template>
                        <template slot="wholePrice0" slot-scope="{ row }">
                          <Input
                            v-if="wholesaleData[0]"
                            v-model="wholesaleData[0].price"
                            clearable
                            disabled
                          >
                            <span slot="append">元</span>
                          </Input>
                        </template>
                        <template slot="wholePrice1" slot-scope="{ row }">
                          <Input
                            v-if="wholesaleData[1]"
                            v-model="wholesaleData[1].price"
                            clearable
                            disabled
                          >
                            <span slot="append">元</span>
                          </Input>
                        </template>
                        <template slot="wholePrice2" slot-scope="{ row }">
                          <Input
                            v-if="wholesaleData[2]"
                            v-model="wholesaleData[2].price"
                            clearable
                            disabled
                          >
                            <span slot="append">元</span>
                          </Input>
                        </template>
                        <template slot="images" slot-scope="{ row }">
                          <Button @click="editSkuPicture(row)">编辑图片</Button>
                          <Modal
                            v-model="showSkuPicture"
                            :styles="{ top: '30px' }"
                            cancel-text="取消"
                            class-name="sku-preview-modal"
                            ok-text="结束编辑"
                            title="编辑图片"
                            @on-ok="updateSkuPicture()"
                          >
                            <div class="preview-picture">
                              <img
                                v-if="previewPicture !== ''"
                                :src="previewPicture"
                              />
                            </div>
                            <Divider />
                            <vuedraggable
                              :animation="200"
                              :list="selectedSku.images"
                              style="display: inline-block"
                            >
                              <div
                                v-for="(img, __index) in selectedSku.images"
                                :key="__index"
                                class="sku-upload-list"
                              >
                                <template>
                                  <img :src="img.url" />
                                  <div class="sku-upload-list-cover">
                                    <Icon
                                      type="md-search"
                                      @click="handleView(img.url)"
                                    ></Icon>
                                    <Icon
                                      type="md-trash"
                                      @click="handleRemove(img, __index)"
                                    ></Icon>
                                  </div>
                                </template>
                              </div>
                            </vuedraggable>
                            <Upload
                              ref="uploadSku"
                              :action="uploadFileUrl"
                              :before-upload="handleBeforeUpload"
                              :format="['jpg', 'jpeg', 'png']"
                              :headers="{ ...accessToken }"
                              :max-size="1024"
                              :on-exceeded-size="handleMaxSize"
                              :on-format-error="handleFormatError"
                              :on-success="handleSuccess"
                              :show-upload-list="false"
                              multiple
                              style="display: inline-block; width: 58px"
                              type="drag"
                            >
                              <div>
                                <Icon size="55" type="ios-camera"></Icon>
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
                  :check-strictly="false"
                  :data="shopCategory"
                  show-checkbox
                  style="text-align: left"
                  @on-select-change="selectTree"
                  @on-check-change="changeSelect"
                ></Tree>
              </FormItem>
            </div>
            <FormItem
              class="form-item-view-el"
              label="PC商品描述"
              prop="intro"
              style="width: 100%"
            >
              <editor
                ref="editor"
                v-model="baseInfoForm.intro"
                :init="{ ...initEditor, height: '800px' }"
                openXss
              ></editor>
              <div class="promise-intro-btn">
                <Button type="primary" @click="promiseIntroEditor"
                  >将PC商品描述同步到移动端描述
                </Button>
              </div>
            </FormItem>

            <FormItem
              class="form-item-view-el"
              label="移动端描述"
              prop="skuList"
              style="width: 100%"
            >
              <editor
                ref="editor"
                v-model="baseInfoForm.mobileIntro"
                :init="{ ...initEditor, height: '800px' }"
                openXss
              ></editor>
            </FormItem>
          </div>
          <div v-if="baseInfoForm.goodsType != 'VIRTUAL_GOODS'">
            <h4>商品物流信息</h4>
            <div class="form-item-view">
              <FormItem
                class="form-item-view-el"
                label="物流模板"
                prop="templateId"
              >
                <Select v-model="baseInfoForm.templateId" style="width: 200px">
                  <Option
                    v-for="item in logisticsTemplate"
                    :key="item.id"
                    :value="item.id"
                    >{{ item.name }}
                  </Option>
                </Select>
              </FormItem>
              <FormItem
                v-if="baseInfoForm.salesModel == 'WHOLESALE'"
                class="form-item-view-el"
                label="商品重量"
                prop="weight"
              >
                <Input
                  v-model="baseInfoForm.weight"
                  placeholder="请输入商品重量"
                >
                  <span slot="append">kg</span></Input
                >
              </FormItem>
            </div>
            <h4>其他信息</h4>
            <div class="form-item-view">
              <FormItem
                class="form-item-view-el"
                label="商品发布"
                prop="release"
              >
                <RadioGroup
                  v-model="baseInfoForm.release"
                  button-style="solid"
                  type="button"
                >
                  <Radio :label="1" title="立即发布">
                    <span>立即发布</span>
                  </Radio>
                  <Radio :label="0" title="放入仓库">
                    <span>放入仓库</span>
                  </Radio>
                </RadioGroup>
              </FormItem>
              <FormItem
                class="form-item-view-el"
                label="商品推荐"
                prop="skuList"
              >
                <RadioGroup
                  v-model="baseInfoForm.recommend"
                  button-style="solid"
                  type="button"
                >
                  <Radio :label="1" title="推荐">
                    <span>推荐</span>
                  </Radio>
                  <Radio :label="0" title="不推荐">
                    <span>不推荐</span>
                  </Radio>
                </RadioGroup>
              </FormItem>
            </div>
            <div class="form-item-view-bottom">
              <Collapse
                v-for="(paramsGroup, groupIndex) in goodsParams"
                :key="paramsGroup.groupName"
                v-model="params_panel"
                :title="paramsGroup.groupName"
                class="mb_10"
                style="text-align: left"
              >
                <Panel :name="paramsGroup.groupName">
                  {{ paramsGroup.groupName }}
                  <p slot="content">
                    <FormItem
                      v-for="(params, paramsIndex) in paramsGroup.params"
                      :key="paramsIndex"
                      :label="`${params.paramName}：`"
                    >
                      <Select
                        v-model="params.paramValue"
                        clearable
                        placeholder="请选择"
                        style="width: 200px"
                        @on-change="
                          selectParams(
                            paramsGroup,
                            groupIndex,
                            params,
                            paramsIndex,
                            params.paramValue
                          )
                        "
                      >
                        <Option
                          v-for="option in params.options.split(',')"
                          :key="option"
                          :label="option"
                          :value="option"
                        ></Option>
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
    <!-- 底部按钮 -->
    <div class="footer">
      <ButtonGroup>
        <Button type="primary" @click="pre">上一步 </Button>
        <Button :loading="submitLoading" type="primary" @click="save">
          {{ this.$route.query.id ? "保存" : "保存商品" }}
        </Button>
        <Button type="primary" @click="saveToDraft">保存为模版</Button>
      </ButtonGroup>
    </div>
  </div>
</template>
<script>
import * as API_GOODS from "@/api/goods";
import * as API_Shop from "@/api/shops";
import cloneObj from "@/utils/index";
import vuedraggable from "vuedraggable";
import Editor from "@tinymce/tinymce-vue";
import { initEditor } from "@/views/lili-components/editor/config";
import { uploadFile } from "@/libs/axios";
import { regular } from "@/utils";

export default {
  name: "goodsOperationSec",
  components: {
    editor: Editor,
    vuedraggable,
  },
  props: {
    firstData: {
      default: {},
      type: Object,
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
    return {
      regular,
      initEditor,
      total: 0,
      global: 0,
      accessToken: "", //令牌token
      goodsParams: "",
      categoryId: "", // 商品分类第三级id
      //提交状态
      submitLoading: false,
      //上传图片路径
      uploadFileUrl: uploadFile,
      // 预览图片路径
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
      wholesalePreviewColumns: [
        {
          title: "销售规则",
          width: 300,
          render: (h, params) => {
            let guide =
              "当商品购买数量 ≥" +
              params.row.num +
              " 时，售价为 ￥" +
              params.row.price +
              " /" +
              this.baseInfoForm.goodsUnit;
            return h("div", guide);
          },
        },
      ],
      wholesaleColumns: [
        {
          title: "购买数量",
          key: "num",
          align: "center",
          slot: "wholesaleNum",
        },
        {
          title: "商品单价",
          key: "price",
          align: "center",
          width: "280px",
          slot: "wholesalePrice",
        },
      ],
      wholesaleData: [
        {
          num: 0,
          price: 0,
          goodsId: this.goodsId,
        },
      ],
      /** 发布商品基本参数 */
      baseInfoForm: {
        salesModel: "RETAIL",
        /** 商品相册列表 */
        goodsGalleryFiles: [],
        /** 是否立即发布 true 立即发布 false 放入仓库 */
        release: 1,
        /** 是否为推荐商品 */
        recommend: 1,
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
        templateId: "",
        /** 参数组*/
        goodsParamsDTOList: [],
        /** 商品分类中文名 */
        categoryName: [],
      },
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
      // 规格展开的项
      open_panel: [1, 2],
      /** 要提交的规格数据*/
      skuInfo: [],
      /** 物流模板 **/
      logisticsTemplate: [],

      /** 固定列校验提示内容 */
      validatatxt: "请输入0~99999999之间的数字值",
      //参数panel展示
      params_panel: [],
      /** 存储未通过校验的单元格位置  */
      validateError: [],
      baseInfoFormRule: {
        goodsName: [regular.REQUIRED, regular.WHITE_SPACE, regular.VARCHAR60],
        price: [regular.REQUIRED, { validator: checkPrice }],
        sellingPoint: [regular.REQUIRED, regular.VARCHAR60],
        goodsUnit: [{ required: true, message: "请选择计量单位" }],
        name: [regular.REQUIRED, regular.VARCHAR5],
        value: [regular.REQUIRED, regular.VARCHAR60],
        templateId: [regular.REQUIRED],
        weight: [regular.REQUIRED],
      },
      params: {
        pageNumber: 1,
        pageSize: 1000,
      },
      currentSkuVal: "",
      skuInfoRules: {},
      /** 品牌列表 */
      brandList: [],
      /** 店铺分类列表 */
      shopCategory: [],
      /** 商品单位列表 */
      goodsUnitList: [],
      ignoreColumn: [
        // 添加规格时需要忽略的参数
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
    };
  },
  methods: {
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
          groupId: "",
          groupName: "",
          goodsParamsItemDTOList: [],
        };
      }
      //赋予分组id、分组名称
      this.baseInfoForm.goodsParamsDTOList[groupIndex].groupId =
        paramsGroup.groupId;
      this.baseInfoForm.goodsParamsDTOList[groupIndex].groupName =
        paramsGroup.groupName;

      //参数详细为空，则赋予
      if (
        !this.baseInfoForm.goodsParamsDTOList[groupIndex]
          .goodsParamsItemDTOList[paramsIndex]
      ) {
        this.baseInfoForm.goodsParamsDTOList[groupIndex].goodsParamsItemDTOList[
          paramsIndex
        ] = {
          paramName: "",
          paramValue: "",
          isIndex: "",
          // required: "",
          paramId: "",
          sort: "",
        };
      }
      this.baseInfoForm.goodsParamsDTOList[groupIndex].goodsParamsItemDTOList[
        paramsIndex
      ] = {
        paramName: params.paramName,
        paramValue: value,
        isIndex: params.isIndex,
        // required: params.required,
        paramId: params.id,
        sort: params.sort,
      };
    },
    // 编辑sku图片
    editSkuPicture(row) {
      if (row.images && row.images.length > 0) {
        this.previewPicture = row.images[0].url;
      }
      this.selectedSku = row;
      this.showSkuPicture = true;
    },
    pre() {
      // 上一步
      this.$parent.activestep--;
    },
    // 预览图片
    handleView(url) {
      this.previewPicture = url;
      this.visible = true;
    },
    // 移除已选图片
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
    // 查看商品大图
    handleViewGoodsPicture(url) {
      this.previewGoodsPicture = url;
      this.goodsPictureVisible = true;
    },
    // 移除商品图片
    handleRemoveGoodsPicture(file) {
      this.baseInfoForm.goodsGalleryFiles =
        this.baseInfoForm.goodsGalleryFiles.filter((i) => i.url !== file.url);
    },
    // 更新sku图片
    updateSkuPicture() {
      this.baseInfoForm.regeneratorSkuFlag = true;
      let _index = this.selectedSku._index;
      this.skuTableData[_index] = this.selectedSku;
    },
    // sku图片上传成功
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
    handleAddWholesaleData() {
      if (
        this.wholesaleData.length === 1 &&
        (this.wholesaleData[0].price <= 0 || this.wholesaleData[0].num <= 0)
      ) {
        this.$Message.error("请输入正确的销售规则");
        return;
      }
      if (this.wholesaleData.length < 3) {
        this.wholesaleData.push({
          price:
            Number(this.wholesaleData[this.wholesaleData.length - 1].price) -
            0.01,
          num:
            Number(this.wholesaleData[this.wholesaleData.length - 1].num) + 1,
          goodsId: this.goodsId,
        });
      }
      this.renderTableData(this.skuTableData);
    },
    handleDeleteWholesaleData(index) {
      this.wholesaleData.splice(index, 1);
      this.renderTableData(this.skuTableData);
    },
    checkWholesaleNum(index) {
      if (this.wholesaleData[index].num < 0) {
        this.$Message.error("购买数量必须大于0");
        this.wholesaleData[index].num = 0;
        return;
      }
      if (
        index > 0 &&
        this.wholesaleData[index - 1].num >= this.wholesaleData[index].num
      ) {
        this.$Notice.error({
          title: "在批发模式的销售规则中",
          desc: "下一个购买数量必须大于上一个购买数量",
          duration: 5,
        });
        this.wholesaleData[index].num = this.wholesaleData[index - 1].num + 1;
      }
      this.renderTableData(this.skuTableData);
    },
    checkWholesalePrice(index) {
      if (this.wholesaleData[index].price < 0) {
        this.$Message.error("商品单价必须大于0");
        this.wholesaleData[index].price = 0;
        return;
      }
      if (
        index > 0 &&
        this.wholesaleData[index - 1].price <= this.wholesaleData[index].price
      ) {
        this.$Notice.error({
          title: "在批发模式的销售规则中",
          desc: "下一个商品单价必须小于上一个商品单价",
          duration: 5,
        });
        this.wholesaleData[index].price =
          this.wholesaleData[index - 1].price - 0.01;
      }
      this.renderTableData(this.skuTableData);
    },
    // 商品图片上传成功
    handleSuccessGoodsPicture(res, file) {
      if (file.response) {
        file.url = file.response.result;
        this.baseInfoForm.goodsGalleryFiles.push(file);
      }
    },
    // 图片格式不正确
    handleFormatError(file) {
      this.$Notice.warning({
        title: "文件格式不正确",
        desc: "文件 " + file.name + " 的格式不正确",
      });
    },
    // 图片大小不正确
    handleMaxSize(file) {
      this.$Notice.warning({
        title: "超过文件大小限制",
        desc: "图片大小不能超过1MB",
      });
    },
    // 图片上传前钩子
    handleBeforeUploadGoodsPicture(file) {
      const check = this.baseInfoForm.goodsGalleryFiles.length < 5;
      if (!check) {
        this.$Notice.warning({
          title: "图片数量不能大于五张",
        });
        return false;
      }
    },
    // sku图片上传前钩子
    handleBeforeUpload(file) {
      const check =
        this.selectedSku.images !== undefined &&
        this.selectedSku.images.length > 5;
      if (check) {
        this.$Notice.warning({ title: "图片数量不能大于五张" });
        return false;
      }
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
      API_GOODS.getGoodsUnitList(this.params).then((res) => {
        if (res.success) {
          this.goodsUnitList.push(...res.result.records.map((i) => i.name));
          this.total = res.result.total;
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
    async GET_GoodData(id, draftId) {
      let response = {};
      if (draftId) {
        response = await API_GOODS.getDraftGoodsDetail(draftId);
      } else {
        response = await API_GOODS.getGoods(id);
        this.goodsId = response.result.id;
      }

      response.result.recommend
        ? (response.result.recommend = 1)
        : (response.result.recommend = 0);
      this.baseInfoForm = { ...this.baseInfoForm, ...response.result };
      this.baseInfoForm.release = 1; //即使是被放入仓库，修改的时候也会显示会立即发布
      this.categoryId = response.result.categoryPath.split(",")[2];

      if (
        response.result.goodsGalleryList &&
        response.result.goodsGalleryList.length > 0
      ) {
        this.baseInfoForm.goodsGalleryFiles =
          response.result.goodsGalleryList.map((i) => {
            return { url: i };
          });
      }

      if (
        response.result.wholesaleList &&
        response.result.wholesaleList.length > 0
      ) {
        this.wholesaleData = response.result.wholesaleList;
      }

      if (response.result.salesModel === "WHOLESALE") {
        this.baseInfoForm.weight = response.result.skuList[0].weight;
      }

      this.Get_SkuInfoByCategory(this.categoryId);

      this.renderGoodsDetailSku(response.result.skuList);

      /** 查询品牌列表 */
      this.getGoodsBrandList();
      /** 查询商品参数 */
      this.GET_GoodsParams();
      /** 查询店铺商品分类 */
      this.GET_ShopGoodsLabel();
      this.GET_GoodsUnit();

      if (this.firstData.category) {
        const cateId = [];
        this.baseInfoForm.categoryName = [];
        this.firstData.category.forEach((cate) => {
          this.baseInfoForm.categoryName.push(cate.name);
          cateId.push(cate.id);
        });
        this.categoryId = cateId[2];

        this.baseInfoForm.categoryPath = cateId.toString();
      }
      this.firstData.goodsType &&
        (this.baseInfoForm.goodsType = this.firstData.goodsType);
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
                    value: u.specValue || "",
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
                    value: u.specValue || "",
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
      this.skuTableData = skus;
      this.renderTableData(skus);
    },
    // 将pc商品描述同步给移动端
    promiseIntroEditor() {
      this.baseInfoForm.mobileIntro = this.baseInfoForm.intro;
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
          this.goodsParams.forEach((item) => {
            this.params_panel.push(item.groupName);
          });
          if (this.baseInfoForm.goodsParamsDTOList) {
            // 已选值集合
            const paramsArr = [];
            this.baseInfoForm.goodsParamsDTOList.forEach((group) => {
              group.goodsParamsItemDTOList.forEach((param) => {
                param.groupId = group.groupId;
                paramsArr.push(param);
              });
            });
            // 循环参数分组
            this.goodsParams.forEach((paramsGroup) => {
              paramsGroup.params.forEach((param) => {
                paramsArr.forEach((arr) => {
                  if (param.paramName === arr.paramName) {
                    param.paramValue = arr.paramValue;
                  }
                });
              });
            });
          } else {
            this.baseInfoForm.goodsParamsDTOList = [];
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
      if (this.skuInfo.find((i) => i.name === "")) {
        this.$Message.error("规格项不能为空！");
        return;
      }
      // 写入对象，下标，具体对象
      this.$set(this.skuInfo, this.skuInfo.length, {
        spec_values: [{ name: "", value: "" }],
        name: "",
      });

      this.renderTableData(this.skuTableData);
    },
    changeSkuItem(val) {
      this.currentSkuItem = val;
    },
    // 编辑规格名
    editSkuItem(val, index, item) {
      if (this.skuTableData.find((i) => i[val])) {
        this.$Message.error("已存在相同规格项！");
        return;
      }
      this.skuTableData = this.skuTableData.map((e) => {
        e[val] = e[this.currentSkuItem];
        delete e[this.currentSkuItem];
        return e;
      });
      this.currentSkuItem = val;
      this.renderTableData(this.skuTableData);
    },
    // 编辑规格值
    skuValueChange(val, index, item) {
      if (this.skuTableData.find((i) => i[val.name] === val.value)) {
        this.$Message.error("已存在相同规格值！");
        return;
      }
      let curVal = this.currentSkuVal;
      this.skuTableData = this.skuTableData.map((e) => {
        if (e[val.name] === curVal) {
          e[val.name] = val.value;
        }
        return e;
      });
      this.currentSkuVal = val.value;
      this.renderTableData(this.skuTableData);
    },
    // 获取焦点时，取得规格名对应的规格值
    changeSkuVals(val, name) {
      this.currentSkuVal = val.value;
      if (name) {
        this.skuData.forEach((e, index) => {
          if (e === name) {
            if (this.skuVal.length !== this.skuVals[index].length) {
              this.skuVal = this.skuVals[index];
            }
          }
        });
      }
    },
    checkSkuVal(val) {
      if (val.value === "") {
        this.$Message.error("规格值不能为空！");
      }
    },
    /** 移除当前规格项 进行数据变化*/
    handleCloseSkuItem($index, item) {
      if ($index === 0 && this.skuInfo.length === 1) {
        this.skuInfo = [];
        this.skuTableData = [];
      } else {
        // 获取当前操作的规格项，在规格项数组中的位置（下标）
        let itemIndex = 0;
        this.skuInfo.forEach((i, _index) => {
          if (i.name === item.name) {
            itemIndex = _index;
          }
        });
        if (itemIndex === this.skuInfo.length - 1) {
          // 如果当前为最后一个规格项，则按照下标按照最后一个规格项生成规则删除
          // 最后一个规格项生成规格数据规则： 如为最后一个规格项，则在规格列表每隔1个中删除n(n为最后一个规格项的规格值列表数量 - 1)个规格数据，生成一个规格数据

          // 除了当前操作的规格项的规格项列表，用于获取所有规格项的规格值列表总数
          let filterSkuInfo = this.skuInfo.filter((i) => i.name !== item.name);
          let index = 1;
          let totalLength = 1;
          filterSkuInfo.forEach((skuInfo) => {
            totalLength *= skuInfo.spec_values.length;
          });
          // 去除第一个，因为第一个不需要生成新的规格数据
          item.spec_values.splice(0, 1);
          for (let i = 0; i < totalLength; i++) {
            // 移除对应的规格数据
            this.skuTableData.splice(index, item.spec_values.length);
            index++;
          }
        } else {
          // 当前规格项生成规格数据的时候，每次应该生成的条数
          let currentNum =
            this.skuInfo[this.skuInfo.length - 1].spec_values.length;
          for (let i = this.skuInfo.length - 2; i > itemIndex; i--) {
            // 计算每次删除规格数据后移动的位置（计算规则为，以最后的规格项的规格值数量为基础，乘以其他规格项的规格值总数）
            currentNum *= this.skuInfo[i].spec_values.length;
          }
          // 移除对应规格数据的起始索引，起始位置为每次生成条数的下一位
          let beginIndex = currentNum + 1;

          let filterSkuInfo = this.skuInfo.filter((i) => i.name !== item.name);
          let totalLength = 1;
          filterSkuInfo.forEach((skuInfo) => {
            totalLength *= skuInfo.spec_values.length;
          });
          for (let i = 0; i < totalLength; i++) {
            // 移除对应的规格数据，删除数量为 每次生成条数 * （当前规格项的规格值总数 - 1）
            this.skuTableData.splice(
              beginIndex,
              currentNum * (item.spec_values.length - 1)
            );
            beginIndex += currentNum;
          }
        }
        this.skuInfo.splice($index, 1);

        this.skuTableData = this.skuTableData.map((e) => {
          delete e[item.name];
          return e;
        });
      }
      /**
       * 渲染规格详细表格
       */
      this.renderTableData(this.skuTableData);
    },
    // 添加规格值的验证
    validateEmpty(params) {
      let flag = true;
      params.forEach((item) => {
        for (const key in item) {
          if (item[key] !== "0" && !item.value) {
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
        let beforeLength = item.spec_values.length;
        this.$set(item.spec_values, item.spec_values.length, {
          name: item.name,
          value: "",
        });
        if (item.spec_values.length > 1) {
          let index = beforeLength;
          let filterSkuInfo = this.skuInfo.filter((i) => i.name !== item.name);
          let totalLength = 1;
          filterSkuInfo.forEach((skuInfo) => {
            totalLength *= skuInfo.spec_values.length;
          });
          if ($index === 0) {
            index = 1;
            for (let i = 0; i < totalLength; i++) {
              let find = cloneObj(this.skuTableData[index - 1]);
              find[item.name] = "";
              find.id = "";
              find.price && (find.price = "");
              find.sn && (find.sn = "");
              find.cost && (find.cost = "");
              find.quantity && (find.quantity = "");
              find.weight && (find.weight = "");

              this.skuTableData.splice(this.skuTableData.length, 0, find);
              index ++;
            }
          } else {
            for (let i = 0; i < totalLength; i++) {
              let find = cloneObj(this.skuTableData[index - 1]);
              find[item.name] = "";
              find.id = "";
              find.price && (find.price = "");
              find.sn && (find.sn = "");
              find.cost && (find.cost = "");
              find.quantity && (find.quantity = "");
              find.weight && (find.weight = "");

              this.skuTableData.splice(index, 0, find);
              index += $index === 0 ? beforeLength : beforeLength + 1;
            }
          }
        }
        this.baseInfoForm.regeneratorSkuFlag = true;
      }
    },
    handleClearSku() {
      this.skuInfo = [];
      this.skuTableData = [];
      this.renderTableData(this.skuTableData);
    },
    /** 移除当前规格值 */
    handleCloseSkuValue(item, index, spec) {
      if (spec.spec_values.length <= 1) {
        this.$Message.error("至少保留一个规格值！");
        return;
      }
      this.skuInfo.forEach((i) => {
        if (i.name === spec.name) {
          i.spec_values.splice(index, 1);
        }
      });
      this.skuTableData = this.skuTableData.filter(
        (e) => e[spec.name] !== item.value
      );
      this.baseInfoForm.regeneratorSkuFlag = true;
    },

    /**
     * 渲染table所需要的column 和 data
     */
    renderTableData(skus) {
      this.skuTableColumn = [];
      let pushData = [];
      // 渲染头部
      this.skuInfo.forEach((sku) => {
        // 列名称
        let columnName = sku.name;
        pushData.push({
          title: columnName,
          key: columnName,
        });
      });

      // 有成本价和价格的情况
      if (this.baseInfoForm.salesModel !== "WHOLESALE") {
        pushData.push(
          {
            title: "成本价",
            slot: "cost",
          },
          {
            title: "价格",
            slot: "price",
          }
        );
      }

      if (this.baseInfoForm.salesModel === "WHOLESALE" && this.wholesaleData) {
        this.wholesaleData.forEach((item, index) => {
          pushData.push({
            title: "购买量 ≥ " + item.num,
            slot: "wholePrice" + index,
          });
        });
      }

      // 有重量的情况
      if (
        this.baseInfoForm.goodsType !== "VIRTUAL_GOODS" &&
        this.baseInfoForm.salesModel !== "WHOLESALE"
      ) {
        pushData.push({
          title: "重量",
          slot: "weight",
        });
      }

      pushData.push(
        {
          title: "库存",
          slot: "quantity",
        },
        {
          title: "货号",
          slot: "sn",
        },
        {
          title: "图片",
          slot: "images",
        }
      );

      this.skuTableColumn = pushData;
      //克隆所有渲染的数据
      if (this.skuInfo.length > 0) {
        //存放最终结果
        let result = [];
        this.skuIndex = 0;

        this.skuTableData = this.specIterator(
          result,
          this.skuInfo,
          this.skuTableData
        );
      }
    },

    /**
     * 迭代属性，形成表格
     * result 渲染的数据
     * array spec数据
     */
    specIterator(result, spec, skus) {
      let table = result;
      if (spec.length > 0) {
        //清除当前循环的分组
        let cloneTemp = cloneObj(spec);
        cloneTemp.shift();
        spec[0].spec_values.forEach((specItem) => {
          let index = this.skuIndex;
          if (table[index]) {
            table[index][spec[0].name] = specItem.value;
          } else if (skus && skus[index] && specItem.value !== "") {
            let obj = {
              ...skus[index],
              id: skus[index].id,
              sn: skus[index].sn,
              quantity: skus[index].quantity,
              cost: skus[index].cost,
              price: skus[index].price,
              [spec[0].name]: specItem.value,
              images:
                skus[index].images || this.baseInfoForm.goodsGalleryFiles || [],
            };
            if (specItem.value !== "") {
              obj.id = skus[index].id;
            }
            if (skus[index].weight !== "") {
              obj.weight = skus[index].weight;
            }
            table.push(obj);
          } else {
            table.push({
              [spec[0].name]: specItem.value,
              images: this.baseInfoForm.goodsGalleryFiles || [],
            });
          }

          table = this.specIterator(table, cloneTemp, skus, index);
        });
      } else {
        this.skuIndex++;
      }
      return table;
    },
    /** 根据分类id获取系统设置规格信息*/
    Get_SkuInfoByCategory(categoryId) {
      if (categoryId) {
        API_GOODS.getGoodsSpecInfoSeller(categoryId).then((res) => {
          if (res.length) {
            res.forEach((e) => {
              this.skuData.push(e.specName);
              const vals = e.specValue ? e.specValue.split(",") : [];
              this.skuVals.push(Array.from(new Set(vals)));
            });
          }
        });
      }
    },
    // 判断相同数组的值
    scalarArrayEquals(array1, array2) {
      return (
        array1.length === array2.length &&
        array1.every(function (v, i) {
          return v === array2[i];
        })
      );
    },
    /** 自动完成表单所需方法*/
    filterMethod(value, option) {
      return option.toUpperCase().indexOf(value.toUpperCase()) !== -1;
    },
    /** 数据改变之后 抛出数据 */
    updateSkuTable(row, item, type = "default") {
      let index = row._index;
      this.baseInfoForm.regeneratorSkuFlag = true;
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
      this.$nextTick(() => {
        this.skuTableData[index][item] = row[item];
      });
      // this.$set(this.skuTableData,[index][item],row[item])
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

      if (ids.length > 100) {
        this.$Message.error("选择了过多的店铺分类，请谨慎选择");
      }
      this.baseInfoForm.storeCategoryPath = ids;
    },
    /**  添加商品 **/
    save() {
      this.submitLoading = true;
      this.$refs["baseInfoForm"].validate((valid) => {
        if (valid) {
          if (this.baseInfoForm.salesModel === "WHOLESALE") {
            for (let i = 0; i < this.wholesaleData.length; i++) {
              this.checkWholesaleNum(i);
              this.checkWholesalePrice(i);
              this.wholesaleData[i].goodsId = this.goodsId;
            }
            this.baseInfoForm.wholesaleList = this.wholesaleData;
          }
          this.baseInfoForm.goodsId = this.goodsId;
          let submit = JSON.parse(JSON.stringify(this.baseInfoForm));
          if (
            submit.goodsGalleryFiles &&
            submit.goodsGalleryFiles.length <= 0
          ) {
            this.submitLoading = false;
            this.$Message.error("请上传商品图片");
            return;
          }
          if (submit.templateId === "") submit.templateId = 0;
          let flag = false;
          let paramValue = "";

          if (flag) {
            this.$Message.error(paramValue + " 参数值不能为空");
            this.submitLoading = false;
            return;
          }
          let skuInfoNames = this.skuInfo.map((n) => n.name);
          submit.skuList = [];
          this.skuTableData.map((sku) => {
            let skuCopy = {
              cost: sku.cost,
              price: sku.price,
              quantity: sku.quantity,
              sn: sku.sn,
              images: sku.images,
            };
            if (sku.weight) {
              skuCopy.weight = sku.weight;
            }
            if (this.baseInfoForm.weight) {
              skuCopy.weight = this.baseInfoForm.weight;
            }
            if (sku.id) {
              skuCopy.id = sku.id;
            }
            for (let skuInfoName of skuInfoNames) {
              skuCopy[skuInfoName] = sku[skuInfoName];
            }
            submit.skuList.push(skuCopy);
          });
          if (submit.goodsGalleryFiles.length > 0) {
            submit.goodsGalleryList = submit.goodsGalleryFiles.map(
              (i) => i.url
            );
          }
          /** 参数校验 **/
          /* Object.keys(submit.goodsParamsList).forEach((item) => {
          });*/
          submit.release ? (submit.release = true) : (submit.release = false);
          submit.recommend
            ? (submit.recommend = true)
            : (submit.recommend = false);
          if (this.goodsId) {
            API_GOODS.editGoods(this.goodsId, submit).then((res) => {
              if (res.success) {
                this.submitLoading = false;
                this.$router.go(-1);
              } else {
                this.submitLoading = false;
              }
            });
          } else {
            API_GOODS.createGoods(submit).then((res) => {
              if (res.success) {
                this.submitLoading = false;
                this.$parent.activestep = 2;
                window.scrollTo(0, 0);
              } else {
                this.submitLoading = false;
              }
            });
          }
        } else {
          this.submitLoading = false;

          this.$Message.error("还有必填项未做处理，请检查表单");
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
      this.baseInfoForm.saveType = "TEMPLATE";

      if (this.$route.query.draftId) {
        this.baseInfoForm.id = this.$route.query.draftId;
        this.$Modal.confirm({
          title: "当前模板已存在",
          content: "当前模板已存在，保存为新模板或替换原模板",
          okText: "保存新模板",
          cancelText: "替换旧模板",
          closable: true,
          onOk: () => {
            delete this.baseInfoForm.id;
            this.SAVE_DRAFT_GOODS();
          },
          onCancel: () => {
            this.SAVE_DRAFT_GOODS();
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
    SAVE_DRAFT_GOODS() {
      if (this.baseInfoForm.salesModel === "WHOLESALE") {
        this.baseInfoForm.wholesaleList = this.wholesaleData;
      }
      // 保存模板
      API_GOODS.saveDraftGoods(this.baseInfoForm).then((res) => {
        if (res.success) {
          this.$Message.info("保存成功！");
          this.$router.push({ name: "template-goods" });
        }
      });
    },
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
    });
    if (this.$route.query.id || this.$route.query.draftId) {
      // 编辑商品、模板
      this.GET_GoodData(this.$route.query.id, this.$route.query.draftId);
    } else {
      // 新增商品、模板
      if (this.firstData.tempId) {
        // 选择模板
        this.GET_GoodData("", this.firstData.tempId);
      } else {
        const cateId = [];
        this.firstData.category.forEach((cate) => {
          this.baseInfoForm.categoryName.push(cate.name);
          cateId.push(cate.id);
        });
        this.categoryId = cateId[2];
        this.baseInfoForm.categoryPath = cateId.toString();
        this.baseInfoForm.goodsType = this.firstData.goodsType;
        /** 获取该商城分类下 商品参数信息 */
        this.GET_GoodsParams();
        /** 查询品牌列表 */
        this.getGoodsBrandList();
        /** 查询分类绑定的规格信息 */
        this.Get_SkuInfoByCategory(this.categoryId);
        // 获取商品单位
        this.GET_GoodsUnit();
        // 获取当前店铺分类
        this.GET_ShopGoodsLabel();
      }
    }
  },
};
</script>
<style lang="scss" scoped>
@import "./addGoods.scss";
</style>

<style scoped>
.ivu-select .ivu-select-dropdown {
  overflow: hidden !important;
}

/* .tox-notifications-container{
  display: none !important;
} */
</style>
