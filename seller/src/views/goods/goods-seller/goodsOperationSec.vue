<template>
  <div>
    <el-dialog v-model="visible" title="预览图片">
      <img v-if="visible" :src="previewPicture" style="width: 100%">
    </el-dialog>
    <div class="content-goods-publish">
      <el-form ref="baseInfoForm" label-width="120px" :model="baseInfoForm" :rules="baseInfoFormRule">
        <div class="base-info-item">
          <h4>基本信息</h4>
          <div class="form-item-view">
            <el-form-item label="商品分类">
              <span class="goods-category-name">{{
                baseInfoForm.categoryName[0]
                }}</span>
              <span> &gt; {{ baseInfoForm.categoryName[1] }}</span>
              <span> &gt; {{ baseInfoForm.categoryName[2] }}</span>
            </el-form-item>
            <el-form-item label="商品名称" prop="goodsName">
              <el-input v-model="baseInfoForm.goodsName" clearable placeholder="商品名称" style="width: 260px" type="text" />
            </el-form-item>

            <el-form-item label="商品价格" prop="price">
              <el-input v-model="baseInfoForm.price" clearable placeholder="商品价格" style="width: 260px" type="text" />
            </el-form-item>
            <el-form-item label="商品卖点" prop="sellingPoint">
              <el-input v-model="baseInfoForm.sellingPoint" :rows="4" style="width: 260px" type="textarea" />
            </el-form-item>
            <el-form-item label="商品品牌" prop="brandId">
              <el-select v-model="baseInfoForm.brandId" filterable style="width: 200px">
                <el-option v-for="item in brandList" :key="item.id" :label="item.name" :value="item.id" />
              </el-select>
              <el-button class="refresh-icon" circle link @click="refresh('brand')">
                <el-icon><Refresh /></el-icon>
              </el-button>
            </el-form-item>
             
              <el-form-item class="form-item-view-el" label="计量单位" prop="goodsUnit">
              <el-select v-model="baseInfoForm.goodsUnit" style="width: 100px">
                <el-option v-for="(item, index) in goodsUnitList" :key="index" :label="item" :value="item" />
              </el-select>
              <el-button class="refresh-icon" circle link @click="refresh('goodsUnit')">
                <el-icon><Refresh /></el-icon>
              </el-button>
            </el-form-item>
            <el-form-item class="form-item-view-el" label="销售模式" prop="salesModel">
              <el-radio-group
                v-if="!isVirtualLikeGoods"
                v-model="baseInfoForm.salesModel"
                @change="handleSalesModeChange"
              >
                <el-radio-button value="RETAIL">零售型</el-radio-button>
                <el-radio-button value="WHOLESALE">批发型</el-radio-button>
              </el-radio-group>
              <el-radio-group v-else v-model="baseInfoForm.salesModel">
                <el-radio-button value="RETAIL">{{ isECouponGoods ? "电子卡券" : "虚拟型" }}</el-radio-button>
              </el-radio-group>
            </el-form-item>
            <el-form-item v-if="baseInfoForm.salesModel == 'WHOLESALE'" class="form-item-view-el" label="销售规则"
              prop="wholesaleRule">
              <div class="form-item-view-wholesale">
                <div>
                  <el-table :data="wholesaleData" border style="width: 100%">
                    <el-table-column label="购买数量" align="center">
                      <template #default="{ $index }">
                        <el-input v-model="wholesaleData[$index].num" type="number" @blur="checkWholesaleNum($index)">
                          <template #append>{{ baseInfoForm.goodsUnit || "" }}</template>
                        </el-input>
                      </template>
                    </el-table-column>
                    <el-table-column label="商品单价" align="center" width="280">
                      <template #default="{ $index }">
                        <div style="display: flex; justify-content: space-between; align-items: center">
                          <el-input
                            v-model="wholesaleData[$index].price"
                            type="number"
                            style="width: 190px"
                            @blur="checkWholesalePrice($index)"
                          >
                            <template #append>元</template>
                          </el-input>
                          <el-button
                            v-if="$index > 0"
                            size="small"
                            style="margin-left: 5px"
                            type="danger"
                            @click="handleDeleteWholesaleData($index)"
                          >
                            删除
                          </el-button>
                        </div>
                      </template>
                    </el-table-column>
                  </el-table>

                  <el-button v-if="wholesaleData.length < 3" style="margin-top: 10px" @click="handleAddWholesaleData()">
                    <el-icon><Plus /></el-icon>
                    添加价格区间
                  </el-button>
                </div>
                <div class="form-item-view-wholesale-preview">
                  <el-table :data="wholesaleData" border style="width: 100%">
                    <el-table-column label="销售规则" width="300">
                      <template #default="{ row }">
                        当商品购买数量 ≥{{ row.num }} 时，售价为 ￥{{ row.price }}/{{ baseInfoForm.goodsUnit }}
                      </template>
                    </el-table-column>
                  </el-table>
                </div>
              </div>
            </el-form-item>
            <el-form-item class="form-item-view-el" label="商品发布" prop="release">
                <el-radio-group v-model="baseInfoForm.release">
                  <el-radio-button :value="1">上架</el-radio-button>
                  <el-radio-button :value="0">下架</el-radio-button>
                </el-radio-group>
              </el-form-item>
          </div>

          <h4>商品规格及图片</h4>
          <div class="form-item-view">
            <el-form-item class="form-item-view-el required" label="主图" prop="goodsGalleryFiles">
              <div style="display: flex; flex-wrap: wrap;">
                <vuedraggable
                  v-model="baseInfoForm.goodsGalleryFiles"
                  :animation="200"
                  :item-key="draggableItemKey"
                  style="display: flex; flex-wrap: wrap"
                >
                  <template #item="{ element }">
                    <div class="demo-upload-list">
                      <img :src="element" @error="handleGoodsPictureError($event, element)" />
                      <div class="demo-upload-list-cover">
                        <div>
                          <el-button link type="primary" @click="handleViewGoodsPicture(element)">预览</el-button>
                          <el-button link type="danger" @click="handleRemoveGoodsPicture(element)">删除</el-button>
                        </div>
                      </div>
                    </div>
                  </template>
                </vuedraggable>
                <!--<Upload ref="upload"-->
                <!--:action="uploadFileUrl" :before-upload="handleBeforeUploadGoodsPicture"-->
                <!--:format="['jpg', 'jpeg', 'png', 'webp']"-->
                <!--:headers="{ ...accessToken }"-->
                <!--:max-size="2048" :on-error="() => { $Spin.hide(); }" :on-exceeded-size="handleMaxSize"-->
                <!--:on-format-error="handleFormatError" :on-progress="() => { $Spin.show(); }"-->
                <!--:on-success="handleSuccessGoodsPicture" :show-upload-list="false" multiple-->
                <!--style="margin-left: 10px"-->
                <!--type="drag">-->
                <!--<div style="width: 148px; height: 148px; line-height: 148px">-->
                <!--<Icon size="20" type="md-add"></Icon>-->
                <!--</div>-->
                <!--</Upload>-->
              </div>
              <div style="width: 100%;display: flex;justify-content: start;margin-top: 10px;">
                <el-button @click="handleCLickImg('goodsGalleryFiles')" type="primary">上传图片</el-button>
              </div>
              <el-dialog v-model="goodsPictureVisible" title="View Image">
                <img v-if="goodsPictureVisible" :src="previewGoodsPicture" style="width: 100%" />
              </el-dialog>
            </el-form-item>
            <el-form-item>
              <div style="color: grey">主图仅支持png，jpg，jpeg格式，宽高至少600*600px，大小2M内，可拖拽调整主图顺序</div>
            </el-form-item>
            <el-form-item
              class="form-item-view-el goods-video-form-item"
              :class="{ 'goods-video-form-item--multi': baseInfoForm.goodsVideo }"
              label="主图视频"
              prop="goodsVideo"
            >
              <div class="goods-video">
                <div v-if="baseInfoForm.goodsVideo" class="goods-video-preview">
                  <video :src="baseInfoForm.goodsVideo" class="video" controls style="max-width: 300px;" />
                </div>
                <div
                  class="goods-video-actions"
                  :class="{ 'goods-video-actions--with-preview': baseInfoForm.goodsVideo }"
                >
                  <el-upload
                    :action="uploadFileUrl"
                    :headers="{ ...accessToken }"
                    accept=".avi,.wmv,.mpeg,.mp4,.mov"
                    :show-file-list="false"
                    :before-upload="beforeVideoUpload"
                    :on-success="handleSuccessGoodsVideo"
                    :on-error="() => { loadingVideo = false }"
                  >
                    <el-button :loading="loadingVideo" type="primary" link>
                      {{ loadingVideo ? "正在上传..." : `${baseInfoForm.goodsVideo ? "已" : ""}上传视频` }}
                    </el-button>
                  </el-upload>
                  <el-button v-if="baseInfoForm.goodsVideo" link type="danger" @click="handleRemoveGoodsVideo">
                    删除
                  </el-button>
                </div>
              </div>
            </el-form-item>
            <div class="layout" style="width: 100%">
              <el-collapse v-model="open_panel">
                <el-collapse-item title="自定义规格项" name="1">
                    <div>
                      <div v-for="(item, $index) in skuInfo" :key="$index" class="sku-item-content">
                        <el-card>
                          <template #header>
                            <el-button link type="danger" @click="handleCloseSkuItem($index, item)">删除规格项</el-button>
                          </template>
                          <div class="sku-item-content-name">
                            <div class="sku-item-label">规格项</div>
                            <div class="sku-item-input-row">
                              <el-autocomplete
                                v-model="item.name"
                                :fetch-suggestions="(q, cb) => cb([])"
                                maxlength="30"
                                placeholder="请输入规格项名称"
                                style="width: 150px"
                                @focus="changeSkuItem(item.name)"
                                @change="editSkuItem(item.name, $index, item)"
                              />
                              <el-switch
                                v-if="$index === 0"
                                v-model="openImage"
                                style="margin-left: 10px"
                                @change="changeSkuOpenImage"
                              />
                              <span v-if="$index === 0" style="margin-left: 5px">添加规格图片</span>
                            </div>
                          </div>
                          <div class="sku-val">
                            <div class="sku-val-label">规格值 (输入完成后，鼠标点击其他地方后生效)</div>
                            <el-form :model="item" class="sku-val-form flex">
                              <!--规格值文本列表-->
                              <el-form-item v-for="(val, index) in item.spec_values" :key="index"
                                class="sku-item-content-val" label="">
                                <div class="sku-val-item">
                                  <div class="sku-val-input-row">
                                    <el-autocomplete
                                      v-model="val.value"
                                      :disabled="containsSameSkuItem"
                                      :fetch-suggestions="(q, cb) => cb([])"
                                      maxlength="30"
                                      placeholder="请输入规格值"
                                      style="width: 180px"
                                      @focus="changeSkuVals(val, item.name)"
                                      @blur="checkSkuVal(val, $index, item)"
                                      @change="skuValueChange(val, index, item)"
                                    />
                                    <el-button link type="danger" style="margin-left: 6px" @click="handleCloseSkuValue(val, index, item)">
                                      <el-icon><Delete /></el-icon>
                                    </el-button>
                                  </div>
                                  <!-- 内联错误提示 -->
                                  <div v-if="val._error" class="sku-inline-error">{{ val._error }}</div>
                                  <div v-if="$index === 0 && openImage" class="sku-val-image">
                                  <vuedraggable
                                    v-model="val.images"
                                    :animation="200"
                                    :item-key="draggableItemKey"
                                    style="display: flex; flex-wrap: wrap"
                                  >
                                    <template #item="{ element, index: imgIndex }">
                                      <div
                                        class="sku-upload-list"
                                        style="width: 180px;height: 140px"
                                      >
                                        <img :src="element" style="width: 180px;height: 140px" />
                                        <div class="sku-upload-list-cover">
                                          <div style="margin-top: 50px">
                                            <el-icon :size="25" style="cursor:pointer;margin-right:8px" @click="handleView(element)"><ZoomIn /></el-icon>
                                            <el-icon :size="25" style="cursor:pointer" @click="handleRemove(val.images, imgIndex)"><Delete /></el-icon>
                                          </div>
                                        </div>
                                      </div>
                                    </template>
                                  </vuedraggable>
                                  <el-upload
                                    v-if="val.images.length < 1"
                                    :action="uploadFileUrl"
                                    :before-upload="handleBeforeUpload"
                                    :headers="{ ...accessToken }"
                                    :on-error="() => {}"
                                    :on-exceeded-size="handleMaxSize"
                                    :on-success="(res, file) => handleSuccess(res, file, val.images)"
                                    :show-file-list="false"
                                    accept=".jpg,.jpeg,.png,.webp"
                                    drag
                                    style="width: 180px;height: 140px;margin-right: 10px"
                                  >
                                    <el-icon :size="40"><Camera /></el-icon>
                                  </el-upload>
                                  </div>
                                </div>
                              </el-form-item>

                              <el-form-item
                                v-if="item.spec_values.length < 10 && item.spec_values.length >= 1 && item.spec_values[0].value !== ''"
                                class="sku-item-content-val" label="">
                                <el-autocomplete
                                  v-model="newSkuValues[$index]"
                                  :disabled="containsSameSkuItem"
                                  :fetch-suggestions="(q, cb) => cb([])"
                                  maxlength="30"
                                  placeholder="自定义规格值"
                                  style="width: 180px"
                                  @blur="addSpec($index, item)"
                                  @keyup.enter="addSpec($index, item)"
                                />
                              </el-form-item>
                            </el-form>
                          </div>
                        </el-card>
                      </div>
                    <div style="display: flex">
                      <el-button class="add-sku-btn" type="primary" @click="addSkuItem">添加规格项
                      </el-button>
                    </div>
                    </div>
                </el-collapse-item>
                <el-collapse-item title="规格详细" name="2">
                    <div v-if="needToloadSku" class="topinfo" @click="handleLoadingSkuData">点击加载sku数据</div>
                    <div :class="needToloadSku ? 'mask' : ''">
                      <el-table :data="skuTableData" border class="mt_10" style="width: 100%">
                        <el-table-column
                          v-for="(col, colIndex) in skuTableColumn"
                          :key="colIndex"
                          :label="col.title"
                          :prop="col.key"
                          min-width="120"
                        >
                          <template #default="{ row, $index }">
                            <span v-if="col.key && !col.slot">{{ row[col.key] }}</span>
                            <el-input
                              v-else-if="col.slot === 'sn'"
                              v-model="row.sn"
                              clearable
                              placeholder="请输入货号"
                              @change="updateSkuTable(row, 'sn', $index)"
                            />
                            <el-input
                              v-else-if="col.slot === 'weight' && needsLogistics && baseInfoForm.salesModel !== 'WHOLESALE'"
                              v-model="row.weight"
                              clearable
                              placeholder="请输入重量"
                              @change="updateSkuTable(row, 'weight', $index)"
                            >
                              <template #append>kg</template>
                            </el-input>
                            <el-input
                              v-else-if="col.slot === 'quantity' && isECouponGoods"
                              :model-value="row.quantity ?? 0"
                              disabled
                              placeholder="库存"
                            >
                              <template #append>{{ baseInfoForm.goodsUnit || "" }}</template>
                            </el-input>
                            <el-input
                              v-else-if="col.slot === 'quantity'"
                              v-model="row.quantity"
                              clearable
                              placeholder="请输入库存"
                              @change="updateSkuTable(row, 'quantity', $index)"
                            >
                              <template #append>{{ baseInfoForm.goodsUnit || "" }}</template>
                            </el-input>
                            <el-input
                              v-else-if="col.slot === 'cost'"
                              v-model="row.cost"
                              clearable
                              placeholder="请输入成本价"
                              @change="updateSkuTable(row, 'cost', $index)"
                            >
                              <template #append>元</template>
                            </el-input>
                            <el-input
                              v-else-if="col.slot === 'price'"
                              v-model="row.price"
                              clearable
                              placeholder="请输入价格"
                              @change="updateSkuTable(row, 'price', $index)"
                            >
                              <template #append>元</template>
                            </el-input>
                            <el-input
                              v-else-if="col.slot === 'wholePrice0' && wholesaleData[0]"
                              v-model="wholesaleData[0].price"
                              disabled
                            >
                              <template #append>元</template>
                            </el-input>
                            <el-input
                              v-else-if="col.slot === 'wholePrice1' && wholesaleData[1]"
                              v-model="wholesaleData[1].price"
                              disabled
                            >
                              <template #append>元</template>
                            </el-input>
                            <el-input
                              v-else-if="col.slot === 'wholePrice2' && wholesaleData[2]"
                              v-model="wholesaleData[2].price"
                              disabled
                            >
                              <template #append>元</template>
                            </el-input>
                          </template>
                        </el-table-column>
                      </el-table>
                    </div>
                </el-collapse-item>
              </el-collapse>
            </div>
          </div>
          <h4 v-if="showContent">规格描述内容</h4>
          <div v-if="showContent" class="form-item-view">
            <div>
              <el-form-item :label="contentImage" class="form-item-view-el">
                <!-- {{item.url}} -->
                <div v-for="(item, index) in listImages.images" :key="index" style="width:100%;display:flex;">
                  <img :src="item.url" style="width:100px;flex:1;margin-top:10px;cursor:pointer;"
                    @click="handleView(item.url)" />
                </div>
              </el-form-item>
            </div>
          </div>
          <h4>商品详情描述</h4>
          <div class="form-item-view">
            <div class="tree-bar">
              <el-form-item class="form-item-view-el" label="店内分类" prop="shopCategory">
                <el-tree
                  ref="tree"
                  :data="shopCategory"
                  show-checkbox
                  node-key="id"
                  :props="{ label: 'title', children: 'children' }"
                  style="text-align: left"
                  @node-click="(data) => selectTree([data])"
                  @check="(_, ctx) => changeSelect(ctx.checkedNodes)"
                />
              </el-form-item>
            </div>
            <el-form-item class="form-item-view-el" label="PC商品描述" prop="intro" style="width: 100%">
              <div class="intro-editor-field">
                <editor ref="editor" v-model="baseInfoForm.intro" height="800px" openXss></editor>
                <div class="promise-intro-btn">
                  <el-button type="primary" @click="promiseIntroEditor">将PC商品描述同步到移动端描述
                  </el-button>
                </div>
              </div>
            </el-form-item>

            <el-form-item class="form-item-view-el" label="移动端描述" prop="skuList" style="width: 100%">
              <div class="intro-editor-field">
                <editor ref="introEditor" v-model="baseInfoForm.mobileIntro" height="800px" openXss></editor>
              </div>
            </el-form-item>
          </div>
          <div v-if="needsLogistics">
            <h4>商品物流信息</h4>
            <div class="form-item-view">
              <el-form-item class="form-item-view-el" label="物流模板" prop="templateId">
                <el-select v-model="baseInfoForm.templateId" style="width: 200px">
                  <el-option v-for="item in logisticsTemplate" :key="item.id" :label="item.name" :value="item.id" />
                </el-select>
                <el-button class="refresh-icon" circle link @click="refresh('template')">
                  <el-icon><Refresh /></el-icon>
                </el-button>
              </el-form-item>
              <el-form-item v-if="baseInfoForm.salesModel == 'WHOLESALE'" class="form-item-view-el" label="商品重量"
                prop="weight">
                <el-input v-model="baseInfoForm.weight" placeholder="请输入商品重量">
                  <template #append>kg</template>
                </el-input>
              </el-form-item>
            </div>
          </div>
          <h4>参数信息</h4>
          <div class="form-item-view">
            <el-form-item v-for="(paramsItem, paramsIndex) in goodsParams" :key="paramsItem.id || paramsIndex"
              :label="`${paramsItem.paramName}：`"
              :prop="`goodsParams.${paramsIndex}.paramValue`"
              :rules="paramsItem.required ? { required: true, message: `${paramsItem.paramName}不能为空`, trigger: 'change' } : {}">
              <el-select v-model="baseInfoForm.goodsParams[paramsIndex].paramValue" clearable placeholder="请选择" style="width: 200px"
                @change="(val) => selectParams(paramsItem, val, paramsIndex)">
                <el-option
                  v-for="option in getParamOptions(paramsItem.options)"
                  :key="option"
                  :label="option"
                  :value="option"
                />
              </el-select>
            </el-form-item>
          </div>
        </div>
      </el-form>
    </div>
    <!-- 底部按钮 -->
    <div class="footer">
      <div class="footer-btns">
        <el-button type="primary" @click="pre">上一步</el-button>
        <el-button :loading="submitLoading" type="primary" @click="save">
          {{ $route.query.id ? "保存" : "保存商品" }}
        </el-button>
      </div>
    </div>

    <el-dialog v-model="showGoodsVideo" title="查看视频">
      <div id="dplayer">

      </div>
    </el-dialog>

    <!--<el-dialog width="1200px" v-model="picModelFlag">-->
    <!--<ossManage @callback="callbackSelected" ref="ossManage" />-->
    <!--</el-dialog>-->
    <el-dialog v-model="picModelFlag" width="1200px" title="选择图片" append-to-body destroy-on-close>
      <ossManage
        ref="ossManage"
        :isComponent="true"
        :initialize="picModelFlag"
        :max-select="selectedFormBtnName === 'goodsGalleryFiles' ? 1 : 0"
        :hide-select-footer="true"
        @callback="callbackSelected"
        @selected="(list) => { selectedImage = list }"
      />
      <template #footer>
        <el-button @click="picModelFlag = false; selectedImage = []">取消</el-button>
        <el-button type="primary" @click="confirmUrls">确定</el-button>
      </template>
    </el-dialog>

  </div>
</template>
<script>
import * as API_GOODS from "@/api/goods";
import * as API_Shop from "@/api/shops";
import cloneObj from "@/utils/index";
import { Camera, Delete, Plus, Refresh, ZoomIn } from "@element-plus/icons-vue";
import vuedraggable from "vuedraggable";
import tinymec from "@/views/lili-components/editor/index.vue";

import { uploadFile } from "@/libs/axios";
import { regular } from "@/utils";
import DPlayer from 'dplayer';
import ossManage from "@/views/sys/oss-manage/ossManage";


export default {
  name: "goodsOperationSec",
  components: {
    Camera,
    Delete,
    Plus,
    Refresh,
    ZoomIn,
    editor: tinymec,
    vuedraggable,
    ossManage,
  },
  props: {
    firstData: {
      default: {},
      type: Object,
    },
  },
  computed: {
    /** 卡密商品：库存只读展示 quantity，提交时 quantity 传 0（FR-S-01 / P-02） */
    isECouponGoods() {
      return this.baseInfoForm.goodsType === "E_COUPON";
    },
    isVirtualGoods() {
      return this.baseInfoForm.goodsType === "VIRTUAL_GOODS";
    },
    isVirtualLikeGoods() {
      return this.isVirtualGoods || this.isECouponGoods;
    },
    /** 仅实物需要运费模板；E_COUPON 强制 templateId=0（§6.1） */
    needsLogistics() {
      return this.baseInfoForm.goodsType === "PHYSICAL_GOODS";
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
      openImage: false,
      needToloadSku: false,
      total: 0,
      goodsVideo: "",
      showContent: false,
      loadingVideo: false,
      listImages: [],
      newSkuValues: [],
      contentImage: "",
      previewImage: '', // 预览图片地址
      global: 0,
      accessToken: "", //令牌token
      goodsParams: [],
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
        goodsVideo: "",
        /** 商品参数用于验证 */
        goodsParams: [],
      },
      invalidGoodsGalleryFiles: [],
      goodsPictureFallback:
        "data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%20width%3D%22148%22%20height%3D%22148%22%20viewBox%3D%220%200%20148%20148%22%3E%3Crect%20width%3D%22148%22%20height%3D%22148%22%20fill%3D%22%23f5f7fa%22/%3E%3Ctext%20x%3D%2274%22%20y%3D%2274%22%20text-anchor%3D%22middle%22%20dominant-baseline%3D%22middle%22%20font-size%3D%2212%22%20fill%3D%22%23999%22%3EImage%20unavailable%3C/text%3E%3C/svg%3E",
      /** 表格头 */
      skuTableColumn: [],
      /** 表格数据 */
      skuTableData: [],
      // 持久化的sku数据
      skuTableDataCopy: [],
      // 持久化的sku数据
      skuInfoCopy: [],
      /** 默认的规格参数 */
      skuData: [],
      /** 默认的规格值 */
      skuVals: [],
      // 某一规格名下的规格值
      skuVal: [],
      // 规格展开的项
      open_panel: ["1", "2"],
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
      containsSameSkuItem: false,
      containsSameSkuValue: false,
      containsSameSkuNewValue: false,
      // 展示商品视频
      showGoodsVideo: false,
      ignoreColumn: [
        // 添加规格时需要忽略的参数
        "_index",
        "_rowKey",
        "sn",
        // "cost",
        "price",
        "weight",
        "quantity",
        // "alertQuantity",
        "specId",
        "specValueId",
      ],
      picModelFlag: false, // 图片选择器
      selectedFormBtnName: "", // 点击图片绑定form
      selectedImage: [],
      lastEditSkuValue: '',
    };
  },
  watch: {
    // 如果点击了展示商品视频，则初始化商品视频
    showGoodsVideo(val) {
      if (val) {
        this.initVideo();
      }
    }
  },
  methods: {
    /** E_COUPON 提交固定传 0，真实库存由卡池 syncSkuStock 同步至 quantity */
    resolveSubmitQuantity(sku) {
      if (this.isECouponGoods) {
        return 0;
      }
      return sku.quantity;
    },
    defaultSkuQuantity() {
      return this.isECouponGoods ? 0 : "";
    },
    draggableItemKey(item) {
      return item;
    },
    // 选择图片modal
    handleCLickImg(val, index) {
      this.selectedImage = [];
      this.picModelFlag = true;
      this.selectedFormBtnName = val;
      this.$nextTick(() => {
        if (this.$refs.ossManage) {
          this.$refs.ossManage.selectImage = true;
        }
      });
    },
    handleLoadingSkuData() {
      this.needToloadSku = false
      this.renderTableData(this.skuTableData)
    },
    changeSkuOpenImage() {
      this.skuTableData.forEach(item => {
        item.images = []
      })
      if (this.skuInfo.length > 0 && this.skuInfo[0].spec_values.length > 0) {
        this.skuInfo[0].spec_values.forEach(item => {
          item.images = []
        })
      }
    },
    // ship大小不正确
    handleVideoMaxSize(file) {
      this.$Notice.warning({
        title: "超过文件大小限制",
        desc: "视频大小不能超过10MB",
      });
    },
    parseOssSelectionUrl(item) {
      if (!item) return "";
      if (typeof item === "string") {
        const index = item.indexOf(",");
        return index >= 0 ? item.slice(index + 1) : item;
      }
      return item.url || "";
    },
    // 图片选择后回调
    callbackSelected(val) {
      this.picModelFlag = false;
      if (!val?.url) {
        return;
      }
      if (this.selectedFormBtnName === "selectedSkuImages") {
        if (!this.selectedSku.images) {
          this.selectedSku.images = [];
        }
        this.selectedSku.images.push(val.url);
      } else {
        this.baseInfoForm[this.selectedFormBtnName].push(val.url);
      }
    },
    confirmUrls() {
      const urls = (this.selectedImage || [])
        .map((item) => this.parseOssSelectionUrl(item))
        .filter(Boolean);
      if (!urls.length) {
        this.$Message.warning("请选择图片");
        return;
      }
      if (this.selectedFormBtnName === "selectedSkuImages") {
        if (!this.selectedSku.images) {
          this.selectedSku.images = [];
        }
        urls.forEach((url) => {
          if (this.selectedSku.images.length < 5) {
            this.selectedSku.images.push(url);
          }
        });
      } else if (this.selectedFormBtnName === "goodsGalleryFiles") {
        urls.forEach((url) => {
          if (this.baseInfoForm.goodsGalleryFiles.length < 5) {
            this.baseInfoForm.goodsGalleryFiles.push(url);
          }
        });
      } else if (this.selectedFormBtnName) {
        const target = this.baseInfoForm[this.selectedFormBtnName];
        if (Array.isArray(target)) {
          urls.forEach((url) => target.push(url));
        }
      }
      this.selectedImage = [];
      this.picModelFlag = false;
    },
    // 局部刷新
    refresh(v) {
      if (v == 'template') {
        this.GET_ShipTemplate('localRefresh');
      } else if (v == 'goodsUnit') {
        this.goodsUnitList = []
        this.GET_GoodsUnit('localRefresh');
      } else {
        this.getGoodsBrandList('localRefresh');
      }
    },
    getImages(v) {
      this.previewImage = v;
      this.visible = true;
    },
    mouseOver(v) {
      this.showContent = true
      this.listImages = v
      if (this.listImages.images.length <= 0) {
        this.contentImage = '规格专属图片暂无'
      } else {
        this.contentImage = '当前规格专属图片'
      }
    },
    mouseLeave() {
      // this.showContent = false
    },
    getParamOptions(options) {
      if (!options) return [];
      return String(options)
        .split(",")
        .map((i) => i.trim())
        .filter((i) => i);
    },
    selectParams(params, value, paramsIndex) {
      if (!Array.isArray(this.baseInfoForm.goodsParamsDTOList)) {
        this.baseInfoForm.goodsParamsDTOList = [];
      }
      
      // 确保baseInfoForm.goodsParams存在
      if (!Array.isArray(this.baseInfoForm.goodsParams)) {
        this.baseInfoForm.goodsParams = [];
      }
      
      // 确保对应索引的参数项存在
      if (!this.baseInfoForm.goodsParams[paramsIndex]) {
        this.baseInfoForm.goodsParams[paramsIndex] = {};
      }
      
      // 更新baseInfoForm中的值用于验证
      this.baseInfoForm.goodsParams[paramsIndex].paramValue = value || '';
      
      const list = this.baseInfoForm.goodsParamsDTOList;
      const paramId = params && params.id ? String(params.id) : "";
      const index = list.findIndex((i) => String(i.paramId) === paramId);

      if (!value && value !== 0) {
        if (index >= 0) {
          list.splice(index, 1);
        }
        // 清空表单项的值
        params.paramValue = '';
        return;
      }
      const newItem = {
        paramId,
        paramName: params.paramName,
        paramValue: value,
        isIndex: params.isIndex || 0,
        required: params.required || 0,
        sort: params.sort || 0,
      };

      if (index >= 0) {
        list[index] = newItem;
      } else {
        list.push(newItem);
      }

      // 同步更新表单项的值
      params.paramValue = value;
    },
    // 编辑sku图片
    editSkuPicture(row) {
      this.showContent = false
      if (row.images && row.images.length > 0) {
        this.previewPicture = row.images[0];
      }
      this.selectedSku = row;
      this.showSkuPicture = true;
    },
    // 初始化视频操作
    initVideo() {
      if (this.baseInfoForm.goodsVideo) {
        this.goodsVideo = new DPlayer({
          container: document.getElementById('dplayer'),
          video: {
            url: this.baseInfoForm.goodsVideo,
            pic: ''
          },
        });
      }
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
      item.splice(index, 1)
      this.previewPicture = "";
    },
    // 查看商品大图
    handleViewGoodsPicture(url) {
      if (this.invalidGoodsGalleryFiles.includes(url)) {
        this.$Message.warning("图片链接已失效，请重新上传主图");
        return;
      }
      this.previewGoodsPicture = url;
      this.goodsPictureVisible = true;
    },
    handleGoodsPictureError(event, url) {
      if (!this.invalidGoodsGalleryFiles.includes(url)) {
        this.invalidGoodsGalleryFiles.push(url);
      }
      const img = event && event.target;
      if (!img || img.dataset.fallbackApplied) return;
      img.dataset.fallbackApplied = "true";
      img.src = this.goodsPictureFallback;
    },
    // 移除商品图片
    handleRemoveGoodsPicture(file) {
      this.baseInfoForm.goodsGalleryFiles =
        this.baseInfoForm.goodsGalleryFiles.filter((i) => i !== file);
      this.invalidGoodsGalleryFiles =
        this.invalidGoodsGalleryFiles.filter((i) => i !== file);
    },
    assignSkuTableIndex() {
      this.skuTableData.forEach((row, index) => {
        row._index = index;
      });
    },
    // 更新sku图片
    updateSkuPicture() {
      this.baseInfoForm.regeneratorSkuFlag = true;
      let _index = this.selectedSku._index;
      if (_index === undefined || _index === null) {
        _index = this.skuTableData.indexOf(this.selectedSku);
      }
      if (_index >= 0) {
        this.skuTableData[_index] = this.selectedSku;
      }
    },
    // sku图片上传成功
    handleSuccess(res, file, images) {
      if (file.response) {
        file.url = file.response.result;
        if (images) {
          images.push(file.url);
        } else {
          images = [file.url];
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
      this.syncWholesalePriceToSku();
    },
    handleDeleteWholesaleData(index) {
      this.wholesaleData.splice(index, 1);
      this.renderTableData(this.skuTableData);
      this.syncWholesalePriceToSku();
    },
    // 同步批发价格到SKU
    syncWholesalePriceToSku() {
      if (this.baseInfoForm.salesModel === 'WHOLESALE' && this.wholesaleData.length > 0) {
        // 使用第一个批发价格作为SKU的基础价格
        const basePrice = this.wholesaleData[0].price || 0;
        this.skuTableData.forEach(sku => {
          sku.price = basePrice;
        });
      }
    },
    // 处理销售模式切换
    handleSalesModeChange() {
      this.renderTableData(this.skuTableData);
      // 如果切换到批发模式，同步价格
      if (this.baseInfoForm.salesModel === 'WHOLESALE') {
        this.syncWholesalePriceToSku();
      }
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
      this.syncWholesalePriceToSku();
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
      this.syncWholesalePriceToSku();
    },
    // 商品图片上传成功
    handleSuccessGoodsPicture(res, file) {
      if (file.response) {
        file.url = file.response.result;
        this.baseInfoForm.goodsGalleryFiles.push(file.url);
      }
    },
    // 图片格式不正确
    handleFormatError(file) {
      this.$Notice.warning({
        title: "文件格式不正确",
        desc: "文件 " + file.name + " 的格式不正确",
      });
    },
    handleSuccessGoodsVideo(res, file) {
      if (file.response) {
        file.url = file.response.result;
        this.baseInfoForm.goodsVideo = file.url;
      }
      this.loadingVideo = false;
    },
    handleRemoveGoodsVideo() {
      this.baseInfoForm.goodsVideo = "";
      this.showGoodsVideo = false;
      if (this.goodsVideo && typeof this.goodsVideo.destroy === "function") {
        this.goodsVideo.destroy();
      }
      this.goodsVideo = "";
    },
    // 图片大小不正确
    handleMaxSize(size = 2) {
      this.$Notice.warning({
        title: "超过文件大小限制",
        desc: `图片大小不能超过${size}MB`,
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
    getGoodsBrandList(type) {
      API_GOODS.getCategoryBrandListDataSeller(this.categoryId).then(
        (response) => {
          this.brandList = response;
          if (type === 'localRefresh') {
            this.$Message.success("刷新成功");
          }
        }
      ).catch(() => {
        if (type === 'localRefresh') {
          this.$Message.error("刷新失败，请重试");
        }
      });
    },

    // 获取商品单位
    GET_GoodsUnit(type) {
      API_GOODS.getGoodsUnitList(this.params).then((res) => {
        if (res.success) {
          this.goodsUnitList.push(...res.result.records.map((i) => i.name));
          this.total = res.result.total;
        }
        if (type === 'localRefresh' && res.success) {
          this.$Message.success("刷新成功");
        } else if (type === 'localRefresh') {
          this.$Message.error("刷新失败，请重试");
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
      this.invalidGoodsGalleryFiles = [];
      this.baseInfoForm = { ...this.baseInfoForm, ...response.result };
      this.baseInfoForm.release = 1; //即使是被放入仓库，修改的时候也会显示会立即发布
      this.categoryId = response.result.categoryPath.split(",")[2];

      // 如果是复制商品，需要清除ID，确保提交时作为新商品
      if (this.$route.query.copyId) {
        this.baseInfoForm.id = "";
      }

      if (
        response.result.goodsGalleryList &&
        response.result.goodsGalleryList.length > 0
      ) {
        this.baseInfoForm.goodsGalleryFiles =
          response.result.goodsGalleryList.map((i) => {
            return i;
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

      this.renderGoodsDetailSku(response.result.skuList);

      /** 查询品牌列表 */
      this.getGoodsBrandList();

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
      /** 查询商品参数 */
      this.GET_GoodsParams();
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
          // cost: e.cost,
          quantity: e.quantity,
          // alertQuantity: e.alertQuantity,
          weight: e.weight,
        };
        if (e.goodsGalleryList && e.goodsGalleryList.length >= 1) {
          this.openImage = true
        } else {
          this.openImage = false
        }
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
                    images: e.goodsGalleryList || []
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
                    images: e.goodsGalleryList || []
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
      const pcContent = this.$refs.editor?.getContent?.() ?? this.baseInfoForm.intro ?? "";
      this.baseInfoForm.intro = pcContent;
      this.baseInfoForm.mobileIntro = pcContent;
      this.$nextTick(() => {
        this.$refs.introEditor?.setContent?.(pcContent);
      });
    },

    /** 根据当前分类id查询商品应包含的参数 */
    GET_GoodsParams() {
      this.goodsParams = [];
      this.params_panel = [];
      API_GOODS.getCategoryParamsListDataSeller(this.categoryId).then(
        (response) => {
          const list = Array.isArray(response)
            ? response
            : Array.isArray(response?.result)
              ? response.result
              : [];
          if (!list.length) {
            return;
          }

          if (!Array.isArray(this.baseInfoForm.goodsParamsDTOList)) {
            this.baseInfoForm.goodsParamsDTOList = [];
          }

          const mergedSelected = new Map();
          const selectedList = [];
          this.baseInfoForm.goodsParamsDTOList.forEach((item) => {
            if (!item) return;
            if (Array.isArray(item.goodsParamsItemDTOList)) {
              selectedList.push(...item.goodsParamsItemDTOList);
            } else if (item.paramId || item.paramName) {
              selectedList.push(item);
            }
          });
          selectedList.forEach((param) => {
            if (!param) return;
              const key = param.paramId ? String(param.paramId) : param.paramName;
              if (!key) return;
              mergedSelected.set(key, param);
          });

          this.baseInfoForm.goodsParamsDTOList = Array.from(mergedSelected.values()).map((p) => {
            return {
              paramId: p.paramId ? String(p.paramId) : "",
              paramName: p.paramName,
              paramValue: p.paramValue,
              isIndex: p.isIndex || 0,
              required: p.required || 0,
              sort: p.sort || 0,
            };
          });

          const findSelectedValue = (param) => {
            if (!param) return undefined;
            const byId = mergedSelected.get(String(param.id));
            if (byId) return byId.paramValue;
            const byName = mergedSelected.get(param.paramName);
            if (byName) return byName.paramValue;
            return undefined;
          };

          const isGrouped = list[0] && Array.isArray(list[0].params);
          const flatParams = isGrouped
            ? list.reduce((acc, g) => {
              if (g && Array.isArray(g.params)) {
                acc.push(...g.params);
              }
              return acc;
            }, [])
            : list;

          this.goodsParams = flatParams
            .map((p) => {
              const selectedValue = findSelectedValue(p);
              return {
                ...p,
                paramValue:
                  selectedValue !== undefined ? selectedValue : (p.paramValue || ""),
              };
            })
            .sort((a, b) => Number(a.sort || 0) - Number(b.sort || 0));

          // 初始化baseInfoForm.goodsParams用于表单验证
          this.baseInfoForm.goodsParams = [];
          this.goodsParams.forEach((param, index) => {
            this.baseInfoForm.goodsParams[index] = {
              paramValue: param.paramValue || ''
            };
          });

          // 确保表单验证能正确初始化
          this.$nextTick(() => {
            if (this.$refs.baseInfoForm) {
              this.$refs.baseInfoForm.clearValidate();
            }
          });
        }
      );
    },
    /** 添加规格项 */
    addSkuItem() {
      if (this.containsSameSkuItem) {
        this.$Message.error("存在重复规格项！");
        return;
      }
      if (this.containsSameSkuValue) {
        this.$Message.error("存在重复规格值！");
        return;
      }
      if (this.skuInfo.length >= 5) {
        this.$Message.error("规格项不能大于5个！");
        return;
      }
      if (this.skuInfo.find((i) => i.name === "")) {
        this.$Message.error("规格项不能为空！");
        return;
      }
      this.skuInfo.push({
        spec_values: [{ name: "", value: "", images: [] }],
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
        this.containsSameSkuItem = true;
        return;
      }
      this.containsSameSkuItem = false;
      if (this.zz(0, val) > 20) {
        this.$Message.error("规格值最多十个字符长度！");
        // val = val.toString().slice(0, 4);
        this.skuInfo[index].name = this.countCharacters(val, 10);
        this.$forceUpdate();// 调用该方法会触发组件的重新渲染
        // return;
      }
      this.skuTableData = this.skuTableData.map((e) => {
        e[val] = e[this.currentSkuItem];
        delete e[this.currentSkuItem];
        return e;
      });

      this.skuInfo[index].name = val;
      this.skuInfo[index].spec_values.forEach((e) => {
        e.name = val;
      });
      this.currentSkuItem = val;
      this.renderTableData(this.skuTableData);
    },
    // 正则验证（中文超过10个英文数字超过20个）
    zz(len, value) {
      for (let i = 0; i < value.length; i++) {
        //正则表达式判断中文
        if (/[\u4e00-\u9fa5]/.test(value[i])) {
          len += 2;
        } else {
          len++;
        }
      }
      return len;
    },
    countCharacters(defaultStr, defaultNum) {
      let str = '' + defaultStr || '',
        num = +defaultNum || 0,
        res = '',
        length = 0;
      if (!str || !num) {
        return str;
      }
      // 循环字符串，判断长度 最少也会返回一个字
      for (const i in str) {
        res += str[i];
        // 测试长度
        length += /[\u4e00-\u9fa5]/.test(str[i]) ? 2 : 1;
        // 如果长度大于设置长度 或者 循环到最后则终止循环
        if (length >= num || +i == str.length - 1) {
          break;
        }
      }
      return res;
    },
    // 编辑规格值
    skuValueChange(val, index, item) {

      if (val.value === '') {
        return;
      }
      if (this.skuTableData.find((i) => i[val.name] === val.value)) {
        this.$Message.error("已存在相同规格值！");

        this.skuInfo = cloneObj(this.skuInfoCopy);
        this.skuTableData = cloneObj(this.skuTableDataCopy);
        return;
      }

      this.containsSameSkuValue = false;
      if (this.zz(0, val.value) > 20) {
        this.$Message.error("规格值最多十个字符长度！");
        // val.value = val.value.toString().slice(0, 4);
        // 使用传入的 item 引用，避免对未定义的 $index 访问
        item.spec_values[index].value = this.countCharacters(val.value, 10);
        this.$forceUpdate();// 调用该方法会触发组件的重新渲染
        // return;
      }
      this.lastEditSkuValue = val.value;
      let curVal = this.currentSkuVal;
      this.skuTableData = this.skuTableData.map((e) => {
        if (e[val.name] === curVal) {
          e[val.name] = val.value;
        }
        return e;
      });
      this.currentSkuVal = val.value;
      this.skuTableDataCopy = cloneObj(this.skuTableData);
      this.skuInfoCopy = cloneObj(this.skuInfo);
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
    checkSkuVal(val, groupIndex, spec) {
      if (val.value === "") {
        // 内联错误提示，不使用弹窗
        val._error = '规格值不能为空！';

        // 如果规格项和规格名称存在，从表格数据中移除包含该空规格值的行
        if (spec && spec.name && this.skuInfo[groupIndex]) {
          // 从表格数据中过滤掉包含该空规格值的行
          this.skuTableData = this.skuTableData.filter(item => {
            return item[spec.name] !== val.value && item[spec.name] !== "";
          });

          // 重新渲染表格数据
          this.renderTableData(this.skuTableData);
        }
      } else if (val._error) {
        // 清除错误
        delete val._error;
        if (this.skuInfo[groupIndex]) {
          this.skuInfo[groupIndex].spec_values = this.skuInfo[groupIndex].spec_values.filter((i) => i.value !== "");
        }
        // this.skuTableData = this.skuTableData.filter(
        //   (e) => e[spec && spec.name] !== this.lastEditSkuValue
        // );
      }

      // 判断是否存在重复规格值
      if (!this.skuTableData.find((i) => i[val.name] === val.value)) {
        this.skuTableDataCopy = cloneObj(this.skuTableData);
        this.skuInfoCopy = cloneObj(this.skuInfo);
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
      if (!this.newSkuValues[$index]) {
        this.$Message.error("请输入规格值");
        return;
      }

      if (this.containsSameSkuItem) {
        this.$Message.error("存在重复规格项！");
        return;
      }

      if (item.spec_values.find((i) => i.value === this.newSkuValues[$index])) {
        this.newSkuValues[$index] = "";
        this.skuInfo = cloneObj(this.skuInfoCopy);
        this.skuTableData = cloneObj(this.skuTableDataCopy);
        this.$Message.error("存在重复规格值！");
        this.containsSameSkuNewValue = true;
        return;
      }

      if (this.validateEmpty(item.spec_values)) {
        if (item.spec_values.length >= 10) {
          this.$Message.error("规格值不能大于10个！");
          return;
        }
        let beforeLength = item.spec_values.length;
        let itemValue = {
          name: item.name,
          value: this.newSkuValues[$index],
        };
        if (this.openImage) {
          itemValue.images = []
        } else {
          itemValue.images = this.baseInfoForm.goodsGalleryFiles
        }
        item.spec_values.push(itemValue);

        // 生成新的规格组合
        const newCombinations = this.generateSkuCombinations(this.skuInfo);

        // 保留原有组合的属性值
        this.skuTableData = newCombinations.map(combination => {
          // 查找匹配的原有组合
          const existingCombination = this.skuTableData.find(item => {
            // 检查所有规格项是否匹配
            return this.skuInfo.every(info => {
              return item[info.name] === combination[info.name];
            });
          });

          if (existingCombination) {
            // 保留原有组合的属性值
            return {
              ...combination,
              id: existingCombination.id || "",
              sn: existingCombination.sn || "",
              quantity: this.isECouponGoods
                ? (existingCombination.quantity ?? 0)
                : (existingCombination.quantity || ""),
              cost: existingCombination.cost || "",
              price: existingCombination.price || "",
              weight: existingCombination.weight || ""
            };
          } else {
            // 新组合使用默认值
            return {
              ...combination,
              quantity: this.defaultSkuQuantity(),
            };
          }
        });
        this.baseInfoForm.regeneratorSkuFlag = true;
        this.newSkuValues[$index] = "";

        this.skuTableDataCopy = cloneObj(this.skuTableData);
        this.skuInfoCopy = cloneObj(this.skuInfo);
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

      // 从规格项中移除规格值
      this.skuInfo.forEach((i) => {
        if (i.name === spec.name) {
          i.spec_values.splice(index, 1);
        }
      });

      // 生成新的规格组合
      const newCombinations = this.generateSkuCombinations(this.skuInfo);

      // 保留原有组合的属性值
      this.skuTableData = newCombinations.map(combination => {
        // 查找匹配的原有组合
        const existingCombination = this.skuTableData.find(item => {
          // 检查所有规格项是否匹配
          return this.skuInfo.every(info => {
            return item[info.name] === combination[info.name];
          });
        });

        if (existingCombination) {
          // 保留原有组合的属性值
          return {
            ...combination,
            id: existingCombination.id || "",
            sn: existingCombination.sn || "",
            quantity: this.isECouponGoods
              ? (existingCombination.quantity ?? 0)
              : (existingCombination.quantity || ""),
            cost: existingCombination.cost || "",
            price: existingCombination.price || "",
            weight: existingCombination.weight || ""
          };
        } else {
          // 新组合使用默认值
          return {
            ...combination,
            quantity: this.defaultSkuQuantity(),
          };
        }
      });

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
          // {
          //   title: "成本价",
          //   slot: "cost",
          // },
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
        this.needsLogistics &&
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
        // {
        //   title: "库存预警",
        //   slot: "alertQuantity",
        // },
        {
          title: "货号",
          slot: "sn",
        },
      );

      this.skuTableColumn = pushData;

      // 生成规格组合
      if (this.skuInfo.length > 0) {
        const newCombinations = this.generateSkuCombinations(this.skuInfo);

        // 保留原有组合的属性值
        this.skuTableData = newCombinations.map(combination => {
          // 查找匹配的原有组合
          const existingCombination = skus.find(item => {
            // 检查所有规格项是否匹配
            return this.skuInfo.every(info => {
              return item[info.name] === combination[info.name];
            });
          });

          if (existingCombination) {
            // 保留原有组合的属性值
            return {
              ...combination,
              id: existingCombination.id || "",
              sn: existingCombination.sn || "",
              quantity: this.isECouponGoods
                ? (existingCombination.quantity ?? 0)
                : (existingCombination.quantity || ""),
              cost: existingCombination.cost || "",
              price: existingCombination.price || (this.baseInfoForm.salesModel === 'WHOLESALE' && this.wholesaleData.length > 0 ? this.wholesaleData[0].price : ""),
              weight: existingCombination.weight || ""
            };
          } else {
            // 新组合使用默认值，批发模式下设置默认价格
            return {
              ...combination,
              id: "",
              sn: "",
              quantity: this.defaultSkuQuantity(),
              cost: "",
              price: this.baseInfoForm.salesModel === 'WHOLESALE' && this.wholesaleData.length > 0 ? this.wholesaleData[0].price : "",
              weight: ""
            };
          }
        });
        this.assignSkuTableIndex();
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
              // [spec[0].name]: skus[index][spec[0].name] ? skus[index][spec[0].name] : specItem.value,
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
          } else if (specItem.value !== "") {
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
    /**
     * 生成所有可能的规格组合
     * @param {Array} skuInfo 规格信息
     * @returns {Array} 所有可能的规格组合
     */
    generateSkuCombinations(skuInfo) {
      if (!skuInfo || skuInfo.length === 0) {
        return [];
      }

      // 提取每个规格项的规格值
      const specValues = skuInfo.map(item => {
        return item.spec_values
          .filter(val => val.value !== "") // 过滤掉空值
          .map(val => ({
            name: item.name,
            value: val.value,
            images: val.images || this.baseInfoForm.goodsGalleryFiles || []
          }));
      });

      // 如果有规格项没有有效的规格值，返回空数组
      if (specValues.some(values => values.length === 0)) {
        return [];
      }

      // 递归生成所有组合
      const generateCombinations = (index, current) => {
        if (index === specValues.length) {
          // 基本属性
          const combination = {
            images: this.baseInfoForm.goodsGalleryFiles || []
          };

          // 添加规格属性
          current.forEach(spec => {
            combination[spec.name] = spec.value;

            // 如果是第一个规格项且有图片，使用其图片
            if (spec.name === skuInfo[0].name) {
              combination.images = spec.images;
            }
          });

          return [combination];
        }

        const results = [];
        for (const value of specValues[index]) {
          results.push(...generateCombinations(index + 1, [...current, value]));
        }
        return results;
      };

      return generateCombinations(0, []);
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
    updateSkuTable(row, item, rowIndex) {
      let index = rowIndex;
      if (index === undefined || index === null) {
        index = row._index;
      }
      if (index === undefined || index === null) {
        index = this.skuTableData.indexOf(row);
      }
      if (index < 0 || !this.skuTableData[index]) {
        return;
      }
      row._index = index;
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
      }
      this.$nextTick(() => {
        if (this.skuTableData[index]) {
          this.skuTableData[index][item] = row[item];
        }
      });
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
      if (this.containsSameSkuItem) {
        this.$Message.error("存在重复规格项！");
        return;
      }
      if (this.containsSameSkuValue) {
        this.$Message.error("存在重复规格值！");
        return;
      }
      let checkFlag = false;
      let missingParams = [];
      this.goodsParams.forEach((param) => {
        if (!param || !param.required) return;
        const check = this.baseInfoForm.goodsParamsDTOList.some((paramsItem) => {
          if (String(paramsItem.paramId) !== String(param.id)) return false;
          return !!paramsItem.paramValue;
        });
        if (!check) {
          checkFlag = true;
          missingParams.push(param.paramName);
        }
      });
      if (checkFlag) {
        this.$Message.error(`以下参数为必填项：${missingParams.join('、')}`);
        return;
      }
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

          // 判断是否是复制商品
          if (!this.$route.query.copyId) {
            this.baseInfoForm.goodsId = this.goodsId;
          }
          let submit = JSON.parse(JSON.stringify(this.baseInfoForm));
          if (
            submit.goodsGalleryFiles &&
            submit.goodsGalleryFiles.length <= 0
          ) {
            this.submitLoading = false;
            this.$Message.error("请上传商品图片");
            return;
          }
          const invalidGalleryFiles = submit.goodsGalleryFiles.filter((url) =>
            this.invalidGoodsGalleryFiles.includes(url)
          );
          if (invalidGalleryFiles.length > 0) {
            this.submitLoading = false;
            this.$Message.error("存在已失效的商品主图，请删除后重新上传");
            return;
          }
          if (submit.templateId === "") submit.templateId = 0;
          if (this.isECouponGoods) {
            submit.templateId = 0;
            submit.salesModel = "RETAIL";
          }
          let flag = false;
          let paramValue = "";

          if (flag) {
            this.$Message.error(paramValue + " 参数值不能为空");
            this.submitLoading = false;
            return;
          }

          if (this.goodsUnitList && !this.goodsUnitList.find(i => i === this.baseInfoForm.goodsUnit)) {
            submit.goodsUnit = ""
            this.$Message.error("商品单位不存在");
            this.submitLoading = false;
            return;
          }
          let skuInfoNames = this.skuInfo.map((n) => n.name);
          submit.skuList = [];
          let containEmptyImage = false;
          this.skuTableData.map((sku) => {
            let skuCopy = {
              cost: 1,
              price: sku.price,
              quantity: this.resolveSubmitQuantity(sku),
              // alertQuantity: sku.alertQuantity,
              sn: sku.sn,
              images: [],
            };
            if (this.openImage) {
              this.skuInfo[0].spec_values.forEach(item => {
                if (!item.images || item.images.length === 0) {
                  containEmptyImage = true;
                  return;
                }
                if (item.value === sku[this.skuInfo[0].name]) {
                  skuCopy.images = item.images
                }
              })

            }
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
          if (containEmptyImage) {
            this.$Message.error("开启规格图片，所有规格图片不能为空！");
            this.submitLoading = false;
            return;
          }
          if (submit.goodsGalleryFiles.length > 0) {
            submit.goodsGalleryList = submit.goodsGalleryFiles.map(
              (i) => i
            );
          }
          /** 参数校验 **/
          /* Object.keys(submit.goodsParamsList).forEach((item) => {
          });*/
          submit.release ? (submit.release = true) : (submit.release = false);
          submit.recommend
            ? (submit.recommend = true)
            : (submit.recommend = false);
          // 判断是否是复制商品
          if (this.goodsId && !this.$route.query.copyId) {
            API_GOODS.editGoods(this.goodsId, submit).then((res) => {
              if (res.success) {
                this.submitLoading = false;
                this.$router.go(-1);
              } else {
                this.submitLoading = false;
              }
            }).catch(() => {
              this.submitLoading = false;
              this.$Message.error("保存失败，请重试");
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
    GET_ShipTemplate(type) {
      // 获取物流模板
      API_Shop.getShipTemplate().then((res) => {
        if (res.success) {
          this.logisticsTemplate = res.result;
        }
        if (type === 'localRefresh' && res.success) {
          this.$Message.success("刷新成功");
        } else if (type === 'localRefresh') {
          this.$Message.error("刷新失败，请重试");
        }
      });
    }
  },
  mounted() {
    this.accessToken = {
      accessToken: this.getStore("accessToken"),
    };
    this.GET_ShipTemplate()
    if (this.$route.query.id || this.$route.query.draftId) {
      // 编辑商品、模板
      this.GET_GoodData(this.$route.query.id, this.$route.query.draftId);
    } else if (this.$route.query.copyId) {
      // 复制商品
      this.GET_GoodData(this.$route.query.copyId);
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
/* 规格值内联错误提示样式 */
.sku-inline-error {
  font-size: 12px;
  line-height: 16px;
  color: #ed4014; /* 与 iview 错误色系一致 */
  margin-left: 4px;
  margin-top: 4px;
  white-space: nowrap;
}
@import "./addGoods.scss";
</style>

<style scoped>
.el-select .el-select-dropdown {
  overflow: hidden !important;
}

.editor-alert {
  text-align: left;
}

.intro-editor-field {
  width: calc(100% - 400px);
}

.promise-intro-btn {
  margin-top: 12px;
  text-align: left;
}

.footer {
  display: flex;
  justify-content: center;
}

.footer-btns {
  display: flex;
  gap: 12px;
  justify-content: center;
}



/* .tox-notifications-container{
  display: none !important;
} */
.goods-video-form-item {
  align-items: center;
}

.goods-video-form-item--multi {
  align-items: flex-start;
}

.goods-video-form-item--multi :deep(.el-form-item__label) {
  padding-top: 8px;
}

.goods-video-form-item :deep(.el-form-item__content) {
  display: flex;
  align-items: center;
}

.goods-video-form-item--multi :deep(.el-form-item__content) {
  align-items: flex-start;
}

.goods-video {
  align-items: flex-start;
  display: flex;
  flex-direction: column;
  width: 100%;
}

.goods-video-preview {
  display: flex;
  align-items: center;
}

.goods-video-actions {
  display: flex;
  align-items: center;
  gap: 10px;
  min-height: 32px;
}

.goods-video-actions--with-preview {
  margin-top: 8px;
}

.goods-video-actions :deep(.el-upload) {
  display: inline-flex;
  align-items: center;
  vertical-align: middle;
}

.mb-10 {
  margin-bottom: 10px;
}

.view-video {
  margin: 0 10px;
}

.refresh-icon {
  margin-left: 10px;
}
</style>
