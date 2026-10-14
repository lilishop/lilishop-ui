<template>
  <div ref="rootEl">
    <el-dialog v-model="visible" title="预览图片">
      <img v-if="visible" :src="previewPicture" style="width: 100%">
    </el-dialog>
    <div class="goods-publish-page">
      <div ref="sectionNav" class="goods-section-nav">
        <button
          v-for="(tab, index) in sectionTabs"
          :key="tab.name"
          type="button"
          class="goods-section-nav-item"
          :class="{ active: activeTab === tab.name }"
          @click="jumpToTab(tab.name)"
        >
          <span class="goods-section-nav-index">{{ index + 1 }}</span>
          {{ tab.label }}
        </button>
      </div>
      <el-form ref="baseInfoFormRef" label-width="120px" :model="baseInfoForm" :rules="baseInfoFormRule">
        <div class="base-info-item">
          <div id="goods-section-basic" class="goods-section" data-section="basic">
            <div class="goods-section-hd">
              <span class="goods-section-index">{{ sectionNo("basic") }}</span>
              <div class="goods-section-hd-text">
                <h3>基础信息</h3>
                <p>类目、标题、品牌与计量单位</p>
              </div>
            </div>
            <div class="goods-section-bd">
          <div class="form-item-view">
            <el-form-item label="商品分类">
              <span class="goods-category-name">{{
                baseInfoForm.categoryName[0]
                }}</span>
              <span> &gt; {{ baseInfoForm.categoryName[1] }}</span>
              <span> &gt; {{ baseInfoForm.categoryName[2] }}</span>
            </el-form-item>
            <el-form-item label="商品名称" prop="goodsName">
              <el-input v-model="baseInfoForm.goodsName" class="goods-field" clearable placeholder="商品名称" type="text" />
            </el-form-item>

            <el-form-item label="商品价格" prop="price">
              <el-input v-model="baseInfoForm.price" class="goods-field" clearable placeholder="商品价格" type="text" />
            </el-form-item>
            <el-form-item label="商品卖点" prop="sellingPoint">
              <el-input v-model="baseInfoForm.sellingPoint" class="goods-field" clearable placeholder="商品卖点" type="text" />
            </el-form-item>
            <el-form-item class="goods-field-with-refresh" label="商品品牌" prop="brandId">
              <el-select
                v-model="baseInfoForm.brandId"
                class="goods-field"
                filterable
                clearable
                placeholder="请选择品牌"
              >
                <el-option v-for="item in brandList" :key="item.id" :label="item.name" :value="item.id" />
              </el-select>
              <el-button class="refresh-icon" circle link @click="refresh('brand')">
                <el-icon><Refresh /></el-icon>
              </el-button>
            </el-form-item>
             
              <el-form-item class="form-item-view-el goods-field-with-refresh" label="计量单位" prop="goodsUnit">
              <el-select v-model="baseInfoForm.goodsUnit" class="goods-field">
                <el-option v-for="(item, index) in goodsUnitList" :key="index" :label="item" :value="item" />
              </el-select>
              <el-button class="refresh-icon" circle link @click="refresh('goodsUnit')">
                <el-icon><Refresh /></el-icon>
              </el-button>
            </el-form-item>
          </div>
          <div class="goods-submodule">
            <div class="goods-submodule-hd">商品参数</div>
          <div class="form-item-view">
            <el-form-item v-for="(paramsItem, paramsIndex) in goodsParams" :key="paramsItem.id || paramsIndex"
              :label="`${paramsItem.paramName}：`"
              :prop="`goodsParams.${paramsIndex}.paramValue`"
              :rules="paramsItem.required ? { required: true, message: `${paramsItem.paramName}不能为空`, trigger: 'change' } : {}">
              <el-select v-model="baseInfoForm.goodsParams[paramsIndex].paramValue" class="goods-field" clearable placeholder="请选择"
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
            </div>
          </div>
          <div id="goods-section-specs" class="goods-section" data-section="specs">
            <div class="goods-section-hd">
              <span class="goods-section-index">{{ sectionNo("specs") }}</span>
              <div class="goods-section-hd-text">
                <h3>图文信息</h3>
                <p>主图、视频与商品详情描述</p>
              </div>
            </div>
            <div class="goods-section-bd">
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
              <div class="gallery-hint">主图仅支持png，jpg，jpeg格式，宽高至少600*600px，大小2M内，可拖拽调整主图顺序</div>
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
          </div>
          <div v-if="showContent" class="goods-submodule">
            <div class="goods-submodule-hd">规格描述内容</div>
          <div class="form-item-view">
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
          </div>
          <div class="goods-submodule">
            <div class="goods-submodule-hd">商品详情</div>
          <div class="form-item-view">
            <el-form-item class="form-item-view-el" label="PC商品描述" prop="intro" style="width: 100%">
              <div class="intro-editor-field">
                <editor ref="editorRef" v-model="baseInfoForm.intro" height="800px" openXss></editor>
                <div class="promise-intro-btn">
                  <el-button type="primary" @click="promiseIntroEditor">将PC商品描述同步到移动端描述
                  </el-button>
                </div>
              </div>
            </el-form-item>

            <el-form-item class="form-item-view-el" label="移动端描述" prop="skuList" style="width: 100%">
              <div class="intro-editor-field">
                <editor ref="introEditorRef" v-model="baseInfoForm.mobileIntro" height="800px" openXss></editor>
              </div>
            </el-form-item>
          </div>
          </div>
            </div>
          </div>
          <div
            v-if="isAppointmentGoods"
            id="goods-section-appointment"
            class="goods-section"
            data-section="appointment"
          >
            <div class="goods-section-hd">
              <span class="goods-section-index">{{ sectionNo("appointment") }}</span>
              <div class="goods-section-hd-text">
                <h3>预约规则</h3>
                <p>服务模式、可约日期、时段与预约政策</p>
              </div>
            </div>
            <div class="goods-section-bd">
              <appointment-publish-panel
                ref="appointmentPanel"
                v-model:settings="appointmentSettings"
                v-model:division="appointmentDivision"
                v-model:skuCapacities="skuSlotCapacities"
                :sku-info="skuInfo"
                division-target="#appointment-slot-mount"
              />
              <div class="goods-submodule">
                <div class="goods-submodule-hd">时段划分</div>
                <div id="appointment-slot-mount"></div>
              </div>
            </div>
          </div>
          <div id="goods-section-price" class="goods-section" data-section="price">
            <div class="goods-section-hd">
              <span class="goods-section-index">{{ sectionNo("price") }}</span>
              <div class="goods-section-hd-text">
                <h3>{{ priceSectionTitle }}</h3>
                <p>{{ priceSectionDesc }}</p>
              </div>
            </div>
            <div class="goods-section-bd">
          <div class="form-item-view">
            <el-form-item v-if="showSalesModel" class="form-item-view-el" label="销售模式" prop="salesModel">
              <el-radio-group
                v-if="!isVirtualLikeGoods"
                v-model="baseInfoForm.salesModel"
                @change="handleSalesModeChange"
              >
                <el-radio-button value="RETAIL">零售型</el-radio-button>
                <el-radio-button value="WHOLESALE">批发型</el-radio-button>
              </el-radio-group>
              <el-radio-group v-else v-model="baseInfoForm.salesModel">
                <el-radio-button value="RETAIL">{{
                  isECouponGoods ? "电子卡券" : isAppointmentGoods ? "预约型" : "虚拟型"
                }}</el-radio-button>
              </el-radio-group>
            </el-form-item>
            <el-form-item
              v-if="baseInfoForm.salesModel == 'WHOLESALE'"
              class="form-item-view-el wholesale-rule-form-item"
              label="销售规则"
              prop="wholesaleRule"
            >
              <div class="form-item-view-wholesale">
                <div>
                  <el-table
                    :key="'wholesale-edit-' + (baseInfoForm.goodsUnit || '')"
                    :data="wholesaleData"
                    border
                    style="width: 100%"
                  >
                    <el-table-column label="购买数量" align="center" width="220">
                      <template #default="{ $index }">
                        <el-input
                          class="wholesale-num-input"
                          v-model="wholesaleData[$index].num"
                          type="number"
                          @blur="checkWholesaleNum($index)"
                        >
                          <template #append>{{ baseInfoForm.goodsUnit || "" }}</template>
                        </el-input>
                      </template>
                    </el-table-column>
                    <el-table-column label="商品单价" align="center" width="320">
                      <template #default="{ $index }">
                        <div class="wholesale-price-cell">
                          <el-input
                            class="wholesale-price-input"
                            v-model="wholesaleData[$index].price"
                            type="number"
                            @blur="checkWholesalePrice($index)"
                          >
                            <template #append>元</template>
                          </el-input>
                          <el-button
                            v-if="$index > 0"
                            class="wholesale-price-del"
                            size="small"
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
                  <el-table
                    :key="'wholesale-preview-' + (baseInfoForm.goodsUnit || '')"
                    :data="wholesaleData"
                    border
                    class="wholesale-preview-table"
                  >
                    <el-table-column label="销售规则" width="480">
                      <template #default="{ row }">
                        {{ wholesaleRulePreview(row) }}
                      </template>
                    </el-table-column>
                  </el-table>
                </div>
              </div>
            </el-form-item>
            <el-alert
              v-if="isECouponGoods"
              class="mb_10"
              type="info"
              show-icon
              :closable="false"
              title="卡密库存不在这里填写。商品保存后，到商品列表的「卡池管理」导入卡密。"
            />
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
                          :min-width="col.minWidth || 120"
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
                            <el-button
                              v-else-if="col.slot === 'appointmentCapacity' && isAppointmentGoods"
                              link
                              type="primary"
                              @click="openAppointmentCapacity(row)"
                            >
                              设置可预约数量
                            </el-button>
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
            </div>
          </div>
          <div id="goods-section-other" class="goods-section" data-section="other">
            <div class="goods-section-hd">
              <span class="goods-section-index">{{ sectionNo("other") }}</span>
              <div class="goods-section-hd-text">
                <h3>其他信息</h3>
                <p>{{ otherSectionDesc }}</p>
              </div>
            </div>
            <div class="goods-section-bd">
          <div class="form-item-view">
            <el-form-item class="form-item-view-el" label="商品发布" prop="release">
              <el-radio-group v-model="baseInfoForm.release">
                <el-radio-button :value="1">上架</el-radio-button>
                <el-radio-button :value="0">下架</el-radio-button>
              </el-radio-group>
            </el-form-item>
            <el-form-item v-if="needsLogistics" class="form-item-view-el goods-field-with-refresh" label="运费模板" prop="templateId">
              <el-select v-model="baseInfoForm.templateId" class="goods-field">
                <el-option v-for="item in logisticsTemplate" :key="item.id" :label="item.name" :value="item.id" />
              </el-select>
              <el-button class="refresh-icon" circle link @click="refresh('template')">
                <el-icon><Refresh /></el-icon>
              </el-button>
            </el-form-item>
            <el-form-item v-if="needsLogistics && baseInfoForm.salesModel == 'WHOLESALE'" class="form-item-view-el" label="商品重量"
              prop="weight">
              <el-input v-model="baseInfoForm.weight" class="goods-field" placeholder="请输入商品重量">
                <template #append>kg</template>
              </el-input>
            </el-form-item>
            <div class="tree-bar" :class="{ 'is-empty': !shopCategory.length }">
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
                >
                  <template #empty>
                    <span class="shop-category-empty">暂无分类</span>
                  </template>
                </el-tree>
              </el-form-item>
            </div>
          </div>
            </div>
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
        ref="ossManageRef"
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
<script setup>
import {
  computed,
  getCurrentInstance,
  nextTick,
  onBeforeUnmount,
  onMounted,
  ref,
  watch,
} from "vue";
import { useRoute, useRouter } from "vue-router";
import * as API_GOODS from "@/api/goods";
import * as API_Shop from "@/api/shops";
import cloneObj from "@/utils/index";
import { Camera, Delete, Plus, Refresh, ZoomIn } from "@element-plus/icons-vue";
import vuedraggable from "vuedraggable";
import editor from "@/views/lili-components/editor/index.vue";

import { uploadFile } from "@/libs/axios";
import { regular } from "@/utils";
import ossManage from "@/views/sys/oss-manage/ossManage";
import AppointmentPublishPanel from "./components/AppointmentPublishPanel.vue";
import {
  defaultAppointmentSettings,
  defaultSlotDivision,
} from "@/constants/appointment";
import { getStore } from "@/libs/storage";
import { Message, Notice } from "@/utils/message";

defineOptions({ name: "goodsOperationSec" });

const props = defineProps({
  firstData: {
    default: () => ({}),
    type: Object,
  },
});

const route = useRoute();
const router = useRouter();
const { proxy } = getCurrentInstance();

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

const baseInfoFormRule = {
  goodsName: [regular.REQUIRED, regular.WHITE_SPACE, regular.VARCHAR60],
  price: [regular.REQUIRED, { validator: checkPrice }],
  sellingPoint: [regular.REQUIRED, regular.VARCHAR60],
  goodsUnit: [{ required: true, message: "请选择计量单位" }],
  name: [regular.REQUIRED, regular.VARCHAR5],
  value: [regular.REQUIRED, regular.VARCHAR60],
  templateId: [regular.REQUIRED],
  weight: [regular.REQUIRED],
};

const params = {
  pageNumber: 1,
  pageSize: 1000,
};

const openImage = ref(false);
const needToloadSku = ref(false);
const total = ref(0);
const goodsVideo = ref("");
const showContent = ref(false);
const loadingVideo = ref(false);
const listImages = ref([]);
const newSkuValues = ref([]);
const contentImage = ref("");
const accessToken = ref(""); //令牌token
const goodsParams = ref([]);
const categoryId = ref(""); // 商品分类第三级id
const activeTab = ref("basic");
const scrollingByClick = ref(false);
//提交状态
const submitLoading = ref(false);
//上传图片路径
const uploadFileUrl = uploadFile;
// 预览图片路径
const previewPicture = ref("");
//商品图片
const previewGoodsPicture = ref("");
//展示图片层
const visible = ref(false);
//展示商品图片
const goodsPictureVisible = ref(false);
//选择的sku
const selectedSku = ref({});

/** 发布商品基本参数 */
const baseInfoForm = ref({
  salesModel: "RETAIL",
  /** 商品相册列表 */
  goodsGalleryFiles: [],
  /** 是否立即发布 true 立即发布 false 放入仓库 */
  release: 1,
  /** 是否为推荐商品 */
  recommend: 1,
  /** 店铺分类 */
  storeCategoryPath: "",
  brandId: "",
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
});

// 原 Options API 中直接挂在 this 上的非响应式字段
let goodsId;
let currentSkuItem = "";
let scrollParent = null;
let _onPublishScroll;
let _scrollTick = false;
let _scrollClickTimer;

const wholesaleData = ref([
  {
    num: 0,
    price: 0,
    goodsId,
  },
]);

const invalidGoodsGalleryFiles = ref([]);
const goodsPictureFallback =
  "data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%20width%3D%22148%22%20height%3D%22148%22%20viewBox%3D%220%200%20148%20148%22%3E%3Crect%20width%3D%22148%22%20height%3D%22148%22%20fill%3D%22%23f5f7fa%22/%3E%3Ctext%20x%3D%2274%22%20y%3D%2274%22%20text-anchor%3D%22middle%22%20dominant-baseline%3D%22middle%22%20font-size%3D%2212%22%20fill%3D%22%23999%22%3EImage%20unavailable%3C/text%3E%3C/svg%3E";
/** 表格头 */
const skuTableColumn = ref([]);
/** 表格数据 */
const skuTableData = ref([]);
// 持久化的sku数据
const skuTableDataCopy = ref([]);
// 持久化的sku数据
const skuInfoCopy = ref([]);
/** 默认的规格参数 */
const skuData = ref([]);
/** 默认的规格值 */
const skuVals = ref([]);
// 某一规格名下的规格值
const skuVal = ref([]);
// 规格展开的项
const open_panel = ref(["1", "2"]);
/** 要提交的规格数据*/
const skuInfo = ref([]);
/** 物流模板 **/
const logisticsTemplate = ref([]);

/** 固定列校验提示内容 */
const validatatxt = ref("请输入0~99999999之间的数字值");
//参数panel展示
const params_panel = ref([]);
/** 存储未通过校验的单元格位置  */
const validateError = ref([]);
const currentSkuVal = ref("");
/** 品牌列表 */
const brandList = ref([]);
/** 店铺分类列表 */
const shopCategory = ref([]);
/** 商品单位列表 */
const goodsUnitList = ref([]);
const containsSameSkuItem = ref(false);
const containsSameSkuValue = ref(false);
const containsSameSkuNewValue = ref(false);
// 展示商品视频
const showGoodsVideo = ref(false);
const ignoreColumn = [
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
];
const picModelFlag = ref(false); // 图片选择器
const selectedFormBtnName = ref(""); // 点击图片绑定form
const selectedImage = ref([]);
const lastEditSkuValue = ref('');
const appointmentSettings = ref(defaultAppointmentSettings());
const appointmentDivision = ref(defaultSlotDivision());
const skuSlotCapacities = ref({});

// 模板 ref：baseInfoForm/editor/ossManage 与顶层变量重名，模板 ref 改名避免互相覆盖
const rootEl = ref(null);
const sectionNav = ref(null);
const baseInfoFormRef = ref(null);
const editorRef = ref(null);
const introEditorRef = ref(null);
const appointmentPanel = ref(null);
const tree = ref(null);
const ossManageRef = ref(null);

/** 卡密商品：库存只读展示 quantity，提交时 quantity 传 0（FR-S-01 / P-02） */
const isECouponGoods = computed(() => {
  return baseInfoForm.value.goodsType === "E_COUPON";
});
/** 预约商品：规则区 + 时段库存，SKU 数量列隐藏 */
const isAppointmentGoods = computed(() => {
  return baseInfoForm.value.goodsType === "APPOINTMENT_GOODS";
});
const isVirtualGoods = computed(() => {
  return baseInfoForm.value.goodsType === "VIRTUAL_GOODS";
});
const isVirtualLikeGoods = computed(() => {
  return isVirtualGoods.value || isECouponGoods.value || isAppointmentGoods.value;
});
const hideSkuQuantity = computed(() => {
  return isECouponGoods.value || isAppointmentGoods.value;
});
/** 仅实物需要运费模板；E_COUPON 强制 templateId=0（§6.1） */
const needsLogistics = computed(() => {
  return baseInfoForm.value.goodsType === "PHYSICAL_GOODS";
});
/** 预约、卡券固定零售，不展示销售模式切换 */
const showSalesModel = computed(() => {
  return !isECouponGoods.value && !isAppointmentGoods.value;
});
const priceSectionTitle = computed(() => {
  if (isAppointmentGoods.value) return "规格与可约数量";
  if (isECouponGoods.value) return "规格价格";
  return "价格库存";
});
const priceSectionDesc = computed(() => {
  if (isAppointmentGoods.value) return "规格、售价与各时段可预约数量";
  if (isECouponGoods.value) return "规格与售价，库存由卡池管理";
  return "销售模式、规格与库存";
});
const otherSectionDesc = computed(() => {
  if (needsLogistics.value) return "上架状态、运费模板与店内分类";
  return "上架状态与店内分类";
});
const sectionTabs = computed(() => {
  const tabs = [
    { name: "basic", label: "基础信息" },
    { name: "specs", label: "图文信息" },
  ];
  if (isAppointmentGoods.value) {
    tabs.push({ name: "appointment", label: "预约规则" });
  }
  tabs.push(
    { name: "price", label: "价格库存" },
    { name: "other", label: "其他信息" },
  );
  return tabs;
});

// 如果点击了展示商品视频，则初始化商品视频
watch(showGoodsVideo, (val) => {
  if (val) {
    initVideo();
  }
});

/** E_COUPON / APPOINTMENT 提交固定传 0，预约品库存走 slot_capacity */
function resolveSubmitQuantity(sku) {
  if (isECouponGoods.value || isAppointmentGoods.value) {
    return 0;
  }
  return sku.quantity;
}
function defaultSkuQuantity() {
  return isECouponGoods.value || isAppointmentGoods.value ? 0 : "";
}
function openAppointmentCapacity(row) {
  appointmentPanel.value?.openSkuCapacityDialog(row);
}
function draggableItemKey(item) {
  return item;
}
// 选择图片modal
function handleCLickImg(val, index) {
  selectedImage.value = [];
  picModelFlag.value = true;
  selectedFormBtnName.value = val;
  nextTick(() => {
    if (ossManageRef.value) {
      ossManageRef.value.selectImage = true;
    }
  });
}
function handleLoadingSkuData() {
  needToloadSku.value = false
  renderTableData(skuTableData.value)
}
function changeSkuOpenImage() {
  skuTableData.value.forEach(item => {
    item.images = []
  })
  if (skuInfo.value.length > 0 && skuInfo.value[0].spec_values.length > 0) {
    skuInfo.value[0].spec_values.forEach(item => {
      item.images = []
    })
  }
}
function parseOssSelectionUrl(item) {
  if (!item) return "";
  if (typeof item === "string") {
    const index = item.indexOf(",");
    return index >= 0 ? item.slice(index + 1) : item;
  }
  return item.url || "";
}
// 图片选择后回调
function callbackSelected(val) {
  picModelFlag.value = false;
  if (!val?.url) {
    return;
  }
  if (selectedFormBtnName.value === "selectedSkuImages") {
    if (!selectedSku.value.images) {
      selectedSku.value.images = [];
    }
    selectedSku.value.images.push(val.url);
  } else {
    baseInfoForm.value[selectedFormBtnName.value].push(val.url);
  }
}
function confirmUrls() {
  const urls = (selectedImage.value || [])
    .map((item) => parseOssSelectionUrl(item))
    .filter(Boolean);
  if (!urls.length) {
    Message.warning("请选择图片");
    return;
  }
  if (selectedFormBtnName.value === "selectedSkuImages") {
    if (!selectedSku.value.images) {
      selectedSku.value.images = [];
    }
    urls.forEach((url) => {
      if (selectedSku.value.images.length < 5) {
        selectedSku.value.images.push(url);
      }
    });
  } else if (selectedFormBtnName.value === "goodsGalleryFiles") {
    urls.forEach((url) => {
      if (baseInfoForm.value.goodsGalleryFiles.length < 5) {
        baseInfoForm.value.goodsGalleryFiles.push(url);
      }
    });
  } else if (selectedFormBtnName.value) {
    const target = baseInfoForm.value[selectedFormBtnName.value];
    if (Array.isArray(target)) {
      urls.forEach((url) => target.push(url));
    }
  }
  selectedImage.value = [];
  picModelFlag.value = false;
}
// 局部刷新
function refresh(v) {
  if (v == 'template') {
    GET_ShipTemplate('localRefresh');
  } else if (v == 'goodsUnit') {
    goodsUnitList.value = []
    GET_GoodsUnit('localRefresh');
  } else {
    getGoodsBrandList('localRefresh');
  }
}
function getParamOptions(options) {
  if (!options) return [];
  return String(options)
    .split(",")
    .map((i) => i.trim())
    .filter((i) => i);
}
function selectParams(params, value, paramsIndex) {
  if (!Array.isArray(baseInfoForm.value.goodsParamsDTOList)) {
    baseInfoForm.value.goodsParamsDTOList = [];
  }

  // 确保baseInfoForm.goodsParams存在
  if (!Array.isArray(baseInfoForm.value.goodsParams)) {
    baseInfoForm.value.goodsParams = [];
  }

  // 确保对应索引的参数项存在
  if (!baseInfoForm.value.goodsParams[paramsIndex]) {
    baseInfoForm.value.goodsParams[paramsIndex] = {};
  }

  // 更新baseInfoForm中的值用于验证
  baseInfoForm.value.goodsParams[paramsIndex].paramValue = value || '';

  const list = baseInfoForm.value.goodsParamsDTOList;
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
}
// 初始化视频操作
async function initVideo() {
  if (baseInfoForm.value.goodsVideo) {
    const { default: DPlayer } = await import("dplayer");
    goodsVideo.value = new DPlayer({
      container: document.getElementById('dplayer'),
      video: {
        url: baseInfoForm.value.goodsVideo,
        pic: ''
      },
    });
  }
}
function pre() {
  // 上一步
  proxy.$parent.activestep--;
}
function handleTabChange(name) {
  if (name !== "specs") {
    return;
  }
  nextTick(() => {
    editorRef.value?.getEditor?.()?.dispatch?.("ResizeEditor");
    introEditorRef.value?.getEditor?.()?.dispatch?.("ResizeEditor");
  });
}
function getScrollParent() {
  let node = rootEl.value && rootEl.value.parentElement;
  while (node && node !== document.body) {
    const overflowY = window.getComputedStyle(node).overflowY;
    if (overflowY === "auto" || overflowY === "scroll") {
      return node;
    }
    node = node.parentElement;
  }
  return null;
}
function bindPublishScroll() {
  unbindPublishScroll();
  scrollParent = getScrollParent();
  if (scrollParent) {
    _onPublishScroll = () => onPublishScroll();
    scrollParent.addEventListener("scroll", _onPublishScroll, { passive: true });
  }
}
function unbindPublishScroll() {
  if (scrollParent && _onPublishScroll) {
    scrollParent.removeEventListener("scroll", _onPublishScroll);
  }
  scrollParent = null;
}
function onPublishScroll() {
  if (scrollingByClick.value) return;
  if (_scrollTick) return;
  _scrollTick = true;
  requestAnimationFrame(() => {
    _scrollTick = false;
    syncActiveTabByScroll();
  });
}
function syncActiveTabByScroll() {
  const scroller = scrollParent || getScrollParent();
  if (!scroller) return;
  const navHeight = (sectionNav.value && sectionNav.value.offsetHeight) || 48;
  const marker = scroller.getBoundingClientRect().top + navHeight + 12;
  let current = "basic";
  sectionTabs.value.forEach((tab) => {
    const el = document.getElementById(`goods-section-${tab.name}`);
    if (el && el.getBoundingClientRect().top <= marker) {
      current = tab.name;
    }
  });
  if (activeTab.value !== current) {
    activeTab.value = current;
    handleTabChange(current);
  }
}
function sectionNo(name) {
  const index = sectionTabs.value.findIndex((tab) => tab.name === name);
  return index >= 0 ? index + 1 : "";
}
function jumpToTab(name) {
  activeTab.value = name;
  scrollingByClick.value = true;
  handleTabChange(name);
  nextTick(() => {
    const el = document.getElementById(`goods-section-${name}`);
    const scroller = scrollParent || getScrollParent();
    if (!el || !scroller) {
      scrollingByClick.value = false;
      return;
    }
    const navHeight = (sectionNav.value && sectionNav.value.offsetHeight) || 48;
    const top =
      el.getBoundingClientRect().top -
      scroller.getBoundingClientRect().top +
      scroller.scrollTop -
      navHeight -
      8;
    scroller.scrollTo({ top: Math.max(top, 0), behavior: "smooth" });
    window.clearTimeout(_scrollClickTimer);
    _scrollClickTimer = window.setTimeout(() => {
      scrollingByClick.value = false;
    }, 600);
  });
}
function tabForInvalidFields(fields) {
  const keys = Object.keys(fields || {});
  for (const key of keys) {
    if (key === "goodsGalleryFiles" || key === "goodsVideo" || key === "intro" || key === "skuList") {
      return "specs";
    }
    if (key === "salesModel" || key === "wholesaleRule") {
      return "price";
    }
    if (key === "shopCategory" || key === "templateId" || key === "weight") {
      return "other";
    }
  }
  return "basic";
}
// 预览图片
function handleView(url) {
  previewPicture.value = url;
  visible.value = true;
}
// 移除已选图片
function handleRemove(item, index) {
  item.splice(index, 1)
  previewPicture.value = "";
}
// 查看商品大图
function handleViewGoodsPicture(url) {
  if (invalidGoodsGalleryFiles.value.includes(url)) {
    Message.warning("图片链接已失效，请重新上传主图");
    return;
  }
  previewGoodsPicture.value = url;
  goodsPictureVisible.value = true;
}
function handleGoodsPictureError(event, url) {
  if (!invalidGoodsGalleryFiles.value.includes(url)) {
    invalidGoodsGalleryFiles.value.push(url);
  }
  const img = event && event.target;
  if (!img || img.dataset.fallbackApplied) return;
  img.dataset.fallbackApplied = "true";
  img.src = goodsPictureFallback;
}
// 移除商品图片
function handleRemoveGoodsPicture(file) {
  baseInfoForm.value.goodsGalleryFiles =
    baseInfoForm.value.goodsGalleryFiles.filter((i) => i !== file);
  invalidGoodsGalleryFiles.value =
    invalidGoodsGalleryFiles.value.filter((i) => i !== file);
}
function assignSkuTableIndex() {
  skuTableData.value.forEach((row, index) => {
    row._index = index;
  });
}
// sku图片上传成功
function handleSuccess(res, file, images) {
  if (file.response) {
    file.url = file.response.result;
    if (images) {
      images.push(file.url);
    }
    previewPicture.value = file.url;
  }
}
function handleAddWholesaleData() {
  if (
    wholesaleData.value.length === 1 &&
    (wholesaleData.value[0].price <= 0 || wholesaleData.value[0].num <= 0)
  ) {
    Message.error("请输入正确的销售规则");
    return;
  }
  if (wholesaleData.value.length < 3) {
    wholesaleData.value.push({
      price:
        Number(wholesaleData.value[wholesaleData.value.length - 1].price) -
        0.01,
      num:
        Number(wholesaleData.value[wholesaleData.value.length - 1].num) + 1,
      goodsId,
    });
  }
  renderTableData(skuTableData.value);
  syncWholesalePriceToSku();
}
function wholesaleRulePreview(row) {
  const unit = baseInfoForm.value.goodsUnit || "";
  const unitText = unit ? `/${unit}` : "";
  return `当商品购买数量 ≥${row.num} 时，售价为 ￥${row.price}${unitText}`;
}
function handleDeleteWholesaleData(index) {
  wholesaleData.value.splice(index, 1);
  renderTableData(skuTableData.value);
  syncWholesalePriceToSku();
}
// 同步批发价格到SKU
function syncWholesalePriceToSku() {
  if (baseInfoForm.value.salesModel === 'WHOLESALE' && wholesaleData.value.length > 0) {
    // 使用第一个批发价格作为SKU的基础价格
    const basePrice = wholesaleData.value[0].price || 0;
    skuTableData.value.forEach(sku => {
      sku.price = basePrice;
    });
  }
}
// 处理销售模式切换
function handleSalesModeChange() {
  renderTableData(skuTableData.value);
  // 如果切换到批发模式，同步价格
  if (baseInfoForm.value.salesModel === 'WHOLESALE') {
    syncWholesalePriceToSku();
  }
}
function checkWholesaleNum(index) {
  if (wholesaleData.value[index].num < 0) {
    Message.error("购买数量必须大于0");
    wholesaleData.value[index].num = 0;
    return;
  }
  if (
    index > 0 &&
    wholesaleData.value[index - 1].num >= wholesaleData.value[index].num
  ) {
    Notice.error({
      title: "在批发模式的销售规则中",
      desc: "下一个购买数量必须大于上一个购买数量",
      duration: 5,
    });
    wholesaleData.value[index].num = wholesaleData.value[index - 1].num + 1;
  }
  renderTableData(skuTableData.value);
  syncWholesalePriceToSku();
}
function checkWholesalePrice(index) {
  if (wholesaleData.value[index].price < 0) {
    Message.error("商品单价必须大于0");
    wholesaleData.value[index].price = 0;
    return;
  }
  if (
    index > 0 &&
    wholesaleData.value[index - 1].price <= wholesaleData.value[index].price
  ) {
    Notice.error({
      title: "在批发模式的销售规则中",
      desc: "下一个商品单价必须小于上一个商品单价",
      duration: 5,
    });
    wholesaleData.value[index].price =
      wholesaleData.value[index - 1].price - 0.01;
  }
  renderTableData(skuTableData.value);
  syncWholesalePriceToSku();
}
function beforeVideoUpload(file) {
  const allowTypes = ["avi", "wmv", "mpeg", "mp4", "mov"];
  const ext = (file.name.split(".").pop() || "").toLowerCase();
  if (!allowTypes.includes(ext)) {
    Message.warning("视频格式仅支持 avi、wmv、mpeg、mp4、mov");
    return false;
  }
  const maxSize = 50 * 1024 * 1024;
  if (file.size > maxSize) {
    Message.warning("视频大小不能超过 50MB");
    return false;
  }
  loadingVideo.value = true;
}
function handleSuccessGoodsVideo(res, file) {
  if (file.response) {
    file.url = file.response.result;
    baseInfoForm.value.goodsVideo = file.url;
  }
  loadingVideo.value = false;
}
function handleRemoveGoodsVideo() {
  baseInfoForm.value.goodsVideo = "";
  showGoodsVideo.value = false;
  if (goodsVideo.value && typeof goodsVideo.value.destroy === "function") {
    goodsVideo.value.destroy();
  }
  goodsVideo.value = "";
}
// 图片大小不正确
function handleMaxSize(size = 2) {
  Notice.warning({
    title: "超过文件大小限制",
    desc: `图片大小不能超过${size}MB`,
  });
}
// sku图片上传前钩子
function handleBeforeUpload(file) {
  const check =
    selectedSku.value.images !== undefined &&
    selectedSku.value.images.length > 5;
  if (check) {
    Notice.warning({ title: "图片数量不能大于五张" });
    return false;
  }
}

/** 无品牌时后端用 0，选择器空值用空字符串，避免 el-select 直接显示 0 */
function normalizeBrandId(id) {
  if (id === 0 || id === "0" || id == null || id === "") return "";
  return id;
}

/** 查询商品品牌列表 */
function getGoodsBrandList(type) {
  API_GOODS.getCategoryBrandListDataSeller(categoryId.value).then(
    (response) => {
      brandList.value = response;
      if (type === 'localRefresh') {
        Message.success("刷新成功");
      }
    }
  ).catch(() => {
    if (type === 'localRefresh') {
      Message.error("刷新失败，请重试");
    }
  });
}

// 获取商品单位
function GET_GoodsUnit(type) {
  API_GOODS.getGoodsUnitList(params).then((res) => {
    if (res.success) {
      goodsUnitList.value.push(...res.result.records.map((i) => i.name));
      total.value = res.result.total;
    }
    if (type === 'localRefresh' && res.success) {
      Message.success("刷新成功");
    } else if (type === 'localRefresh') {
      Message.error("刷新失败，请重试");
    }
  });
}
// 获取当前店铺分类
function GET_ShopGoodsLabel() {
  API_GOODS.getShopGoodsLabelListSeller().then((res) => {
    if (res.success) {
      const shopCategories = !baseInfoForm.value.storeCategoryPath
        ? []
        : baseInfoForm.value.storeCategoryPath.split(",").filter(Boolean);

      shopCategory.value = res.result.map((i) => {
        i.title = i.labelName;
        i.expand = false;
        i.children = i.children.map((j) => {
          j.title = j.labelName;
          j.expand = false;
          return j;
        });
        return i;
      });

      nextTick(() => {
        tree.value?.setCheckedKeys(shopCategories);
      });
    }
  });
}
// 编辑时获取商品信息
async function GET_GoodData(id, draftId) {
  let response = {};
  if (draftId) {
    response = await API_GOODS.getDraftGoodsDetail(draftId);
  } else {
    response = await API_GOODS.getGoods(id);
    goodsId = response.result.id;
  }

  response.result.recommend
    ? (response.result.recommend = 1)
    : (response.result.recommend = 0);
  invalidGoodsGalleryFiles.value = [];
  baseInfoForm.value = { ...baseInfoForm.value, ...response.result };
  baseInfoForm.value.release = 1; //即使是被放入仓库，修改的时候也会显示会立即发布
  baseInfoForm.value.brandId = normalizeBrandId(baseInfoForm.value.brandId);
  categoryId.value = response.result.categoryPath.split(",")[2];

  // 如果是复制商品，需要清除ID，确保提交时作为新商品
  if (route.query.copyId) {
    baseInfoForm.value.id = "";
  }

  if (
    response.result.goodsGalleryList &&
    response.result.goodsGalleryList.length > 0
  ) {
    baseInfoForm.value.goodsGalleryFiles =
      response.result.goodsGalleryList.map((i) => {
        return i;
      });
  }

  if (
    response.result.wholesaleList &&
    response.result.wholesaleList.length > 0
  ) {
    wholesaleData.value = response.result.wholesaleList;
  }

  if (isECouponGoods.value || isAppointmentGoods.value) {
    baseInfoForm.value.salesModel = "RETAIL";
  }

  if (response.result.salesModel === "WHOLESALE" && showSalesModel.value) {
    baseInfoForm.value.weight = response.result.skuList[0].weight;
  }

  renderGoodsDetailSku(response.result.skuList);
  nextTick(() => {
    if (isAppointmentGoods.value) {
      appointmentPanel.value?.hydrateFromGoods(response.result);
    }
  });

  /** 查询品牌列表 */
  getGoodsBrandList();

  /** 查询店铺商品分类 */
  GET_ShopGoodsLabel();
  GET_GoodsUnit();

  if (props.firstData.category) {
    const cateId = [];
    baseInfoForm.value.categoryName = [];
    props.firstData.category.forEach((cate) => {
      baseInfoForm.value.categoryName.push(cate.name);
      cateId.push(cate.id);
    });
    categoryId.value = cateId[2];

    baseInfoForm.value.categoryPath = cateId.toString();
  }
  props.firstData.goodsType &&
    (baseInfoForm.value.goodsType = props.firstData.goodsType);

  /** 查询商品参数 */
  GET_GoodsParams();

  nextTick(() => {
    editorRef.value?.setContent?.(baseInfoForm.value.intro);
    introEditorRef.value?.setContent?.(baseInfoForm.value.mobileIntro);
  });
}
/** TinyMCE 的 v-model 可能滞后，提交前从编辑器实例取最新 HTML */
function syncIntroFromEditors() {
  const pcEditor = editorRef.value;
  const mobileEditor = introEditorRef.value;
  if (pcEditor?.getContent) {
    baseInfoForm.value.intro = pcEditor.getContent() ?? "";
  }
  if (mobileEditor?.getContent) {
    baseInfoForm.value.mobileIntro = mobileEditor.getContent() ?? "";
  }
}
// 渲染sku数据
function renderGoodsDetailSku(skuList) {
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
      openImage.value = true
    } else {
      openImage.value = false
    }
    e.specList.forEach((u) => {
      if (u.specName === "images") {
        sku.images = u.specImage;
      } else {
        sku[u.specName] = u.specValue;
        if (
          !skusInfo.some((s) => s.name === u.specName) &&
          !ignoreColumn.includes(u.specName)
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
  skuInfo.value = skusInfo;
  skuTableData.value = skus;
  renderTableData(skus);
}
// 将pc商品描述同步给移动端
function promiseIntroEditor() {
  syncIntroFromEditors();
  const pcContent = baseInfoForm.value.intro ?? "";
  baseInfoForm.value.mobileIntro = pcContent;
  nextTick(() => {
    introEditorRef.value?.setContent?.(pcContent);
  });
}

/** 根据当前分类id查询商品应包含的参数 */
function GET_GoodsParams() {
  goodsParams.value = [];
  params_panel.value = [];
  API_GOODS.getCategoryParamsListDataSeller(categoryId.value).then(
    (response) => {
      const list = Array.isArray(response)
        ? response
        : Array.isArray(response?.result)
          ? response.result
          : [];
      if (!list.length) {
        return;
      }

      if (!Array.isArray(baseInfoForm.value.goodsParamsDTOList)) {
        baseInfoForm.value.goodsParamsDTOList = [];
      }

      const mergedSelected = new Map();
      const selectedList = [];
      baseInfoForm.value.goodsParamsDTOList.forEach((item) => {
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

      baseInfoForm.value.goodsParamsDTOList = Array.from(mergedSelected.values()).map((p) => {
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

      goodsParams.value = flatParams
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
      baseInfoForm.value.goodsParams = [];
      goodsParams.value.forEach((param, index) => {
        baseInfoForm.value.goodsParams[index] = {
          paramValue: param.paramValue || ''
        };
      });

      // 确保表单验证能正确初始化
      nextTick(() => {
        if (baseInfoFormRef.value) {
          baseInfoFormRef.value.clearValidate();
        }
      });
    }
  );
}
/** 添加规格项 */
function addSkuItem() {
  if (containsSameSkuItem.value) {
    Message.error("存在重复规格项！");
    return;
  }
  if (containsSameSkuValue.value) {
    Message.error("存在重复规格值！");
    return;
  }
  if (skuInfo.value.length >= 5) {
    Message.error("规格项不能大于5个！");
    return;
  }
  if (skuInfo.value.find((i) => i.name === "")) {
    Message.error("规格项不能为空！");
    return;
  }
  skuInfo.value.push({
    spec_values: [{ name: "", value: "", images: [] }],
    name: "",
  });

  renderTableData(skuTableData.value);
}
function changeSkuItem(val) {
  currentSkuItem = val;
}
// 编辑规格名
function editSkuItem(val, index, item) {
  if (skuTableData.value.find((i) => i[val])) {
    Message.error("已存在相同规格项！");
    containsSameSkuItem.value = true;
    return;
  }
  containsSameSkuItem.value = false;
  if (zz(0, val) > 20) {
    Message.error("规格值最多十个字符长度！");
    // val = val.toString().slice(0, 4);
    skuInfo.value[index].name = countCharacters(val, 10);
    proxy.$forceUpdate();// 调用该方法会触发组件的重新渲染
    // return;
  }
  skuTableData.value = skuTableData.value.map((e) => {
    e[val] = e[currentSkuItem];
    delete e[currentSkuItem];
    return e;
  });

  skuInfo.value[index].name = val;
  skuInfo.value[index].spec_values.forEach((e) => {
    e.name = val;
  });
  currentSkuItem = val;
  renderTableData(skuTableData.value);
}
// 正则验证（中文超过10个英文数字超过20个）
function zz(len, value) {
  for (let i = 0; i < value.length; i++) {
    //正则表达式判断中文
    if (/[\u4e00-\u9fa5]/.test(value[i])) {
      len += 2;
    } else {
      len++;
    }
  }
  return len;
}
function countCharacters(defaultStr, defaultNum) {
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
}
// 编辑规格值
function skuValueChange(val, index, item) {

  if (val.value === '') {
    return;
  }
  if (skuTableData.value.find((i) => i[val.name] === val.value)) {
    Message.error("已存在相同规格值！");

    skuInfo.value = cloneObj(skuInfoCopy.value);
    skuTableData.value = cloneObj(skuTableDataCopy.value);
    return;
  }

  containsSameSkuValue.value = false;
  if (zz(0, val.value) > 20) {
    Message.error("规格值最多十个字符长度！");
    // val.value = val.value.toString().slice(0, 4);
    // 使用传入的 item 引用，避免对未定义的 $index 访问
    item.spec_values[index].value = countCharacters(val.value, 10);
    proxy.$forceUpdate();// 调用该方法会触发组件的重新渲染
    // return;
  }
  lastEditSkuValue.value = val.value;
  let curVal = currentSkuVal.value;
  skuTableData.value = skuTableData.value.map((e) => {
    if (e[val.name] === curVal) {
      e[val.name] = val.value;
    }
    return e;
  });
  currentSkuVal.value = val.value;
  skuTableDataCopy.value = cloneObj(skuTableData.value);
  skuInfoCopy.value = cloneObj(skuInfo.value);
  renderTableData(skuTableData.value);
}
// 获取焦点时，取得规格名对应的规格值
function changeSkuVals(val, name) {
  currentSkuVal.value = val.value;
  if (name) {
    skuData.value.forEach((e, index) => {
      if (e === name) {
        if (skuVal.value.length !== skuVals.value[index].length) {
          skuVal.value = skuVals.value[index];
        }
      }
    });
  }
}
function checkSkuVal(val, groupIndex, spec) {
  if (val.value === "") {
    // 内联错误提示，不使用弹窗
    val._error = '规格值不能为空！';

    // 如果规格项和规格名称存在，从表格数据中移除包含该空规格值的行
    if (spec && spec.name && skuInfo.value[groupIndex]) {
      // 从表格数据中过滤掉包含该空规格值的行
      skuTableData.value = skuTableData.value.filter(item => {
        return item[spec.name] !== val.value && item[spec.name] !== "";
      });

      // 重新渲染表格数据
      renderTableData(skuTableData.value);
    }
  } else if (val._error) {
    // 清除错误
    delete val._error;
    if (skuInfo.value[groupIndex]) {
      skuInfo.value[groupIndex].spec_values = skuInfo.value[groupIndex].spec_values.filter((i) => i.value !== "");
    }
    // skuTableData.value = skuTableData.value.filter(
    //   (e) => e[spec && spec.name] !== lastEditSkuValue.value
    // );
  }

  // 判断是否存在重复规格值
  if (!skuTableData.value.find((i) => i[val.name] === val.value)) {
    skuTableDataCopy.value = cloneObj(skuTableData.value);
    skuInfoCopy.value = cloneObj(skuInfo.value);
  }
}
/** 移除当前规格项 进行数据变化*/
function handleCloseSkuItem($index, item) {
  if ($index === 0 && skuInfo.value.length === 1) {
    skuInfo.value = [];
    skuTableData.value = [];
  } else {
    // 获取当前操作的规格项，在规格项数组中的位置（下标）
    let itemIndex = 0;
    skuInfo.value.forEach((i, _index) => {
      if (i.name === item.name) {
        itemIndex = _index;
      }
    });
    if (itemIndex === skuInfo.value.length - 1) {
      // 如果当前为最后一个规格项，则按照下标按照最后一个规格项生成规则删除
      // 最后一个规格项生成规格数据规则： 如为最后一个规格项，则在规格列表每隔1个中删除n(n为最后一个规格项的规格值列表数量 - 1)个规格数据，生成一个规格数据

      // 除了当前操作的规格项的规格项列表，用于获取所有规格项的规格值列表总数
      let filterSkuInfo = skuInfo.value.filter((i) => i.name !== item.name);
      let index = 1;
      let totalLength = 1;
      filterSkuInfo.forEach((skuInfo) => {
        totalLength *= skuInfo.spec_values.length;
      });
      // 去除第一个，因为第一个不需要生成新的规格数据
      item.spec_values.splice(0, 1);
      for (let i = 0; i < totalLength; i++) {
        // 移除对应的规格数据
        skuTableData.value.splice(index, item.spec_values.length);
        index++;
      }
    } else {
      // 当前规格项生成规格数据的时候，每次应该生成的条数
      let currentNum =
        skuInfo.value[skuInfo.value.length - 1].spec_values.length;
      for (let i = skuInfo.value.length - 2; i > itemIndex; i--) {
        // 计算每次删除规格数据后移动的位置（计算规则为，以最后的规格项的规格值数量为基础，乘以其他规格项的规格值总数）
        currentNum *= skuInfo.value[i].spec_values.length;
      }
      // 移除对应规格数据的起始索引，起始位置为每次生成条数的下一位
      let beginIndex = currentNum + 1;

      let filterSkuInfo = skuInfo.value.filter((i) => i.name !== item.name);
      let totalLength = 1;
      filterSkuInfo.forEach((skuInfo) => {
        totalLength *= skuInfo.spec_values.length;
      });
      for (let i = 0; i < totalLength; i++) {
        // 移除对应的规格数据，删除数量为 每次生成条数 * （当前规格项的规格值总数 - 1）
        skuTableData.value.splice(
          beginIndex,
          currentNum * (item.spec_values.length - 1)
        );
        beginIndex += currentNum;
      }
    }
    skuInfo.value.splice($index, 1);

    skuTableData.value = skuTableData.value.map((e) => {
      delete e[item.name];
      return e;
    });
  }
  /**
   * 渲染规格详细表格
   */
  renderTableData(skuTableData.value);
}
// 添加规格值的验证
function validateEmpty(params) {
  let flag = true;
  params.forEach((item) => {
    for (const key in item) {
      if (item[key] !== "0" && !item.value) {
        Message.error("请必填规格项");
        flag = false;
        return false; // 终止程序
      }
    }
  });

  return flag;
}
/** 添加当前规格项的规格值*/
function addSpec($index, item) {
  if (!newSkuValues.value[$index]) {
    Message.error("请输入规格值");
    return;
  }

  if (containsSameSkuItem.value) {
    Message.error("存在重复规格项！");
    return;
  }

  if (item.spec_values.find((i) => i.value === newSkuValues.value[$index])) {
    newSkuValues.value[$index] = "";
    skuInfo.value = cloneObj(skuInfoCopy.value);
    skuTableData.value = cloneObj(skuTableDataCopy.value);
    Message.error("存在重复规格值！");
    containsSameSkuNewValue.value = true;
    return;
  }

  if (validateEmpty(item.spec_values)) {
    if (item.spec_values.length >= 10) {
      Message.error("规格值不能大于10个！");
      return;
    }
    let itemValue = {
      name: item.name,
      value: newSkuValues.value[$index],
    };
    if (openImage.value) {
      itemValue.images = []
    } else {
      itemValue.images = baseInfoForm.value.goodsGalleryFiles
    }
    item.spec_values.push(itemValue);

    // 生成新的规格组合
    const newCombinations = generateSkuCombinations(skuInfo.value);

    // 保留原有组合的属性值
    skuTableData.value = newCombinations.map(combination => {
      // 查找匹配的原有组合
      const existingCombination = skuTableData.value.find(item => {
        // 检查所有规格项是否匹配
        return skuInfo.value.every(info => {
          return item[info.name] === combination[info.name];
        });
      });

      if (existingCombination) {
        // 保留原有组合的属性值
        return {
          ...combination,
          id: existingCombination.id || "",
          sn: existingCombination.sn || "",
          quantity: hideSkuQuantity.value
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
          quantity: defaultSkuQuantity(),
        };
      }
    });
    baseInfoForm.value.regeneratorSkuFlag = true;
    newSkuValues.value[$index] = "";

    skuTableDataCopy.value = cloneObj(skuTableData.value);
    skuInfoCopy.value = cloneObj(skuInfo.value);
  }
}
/** 移除当前规格值 */
function handleCloseSkuValue(item, index, spec) {
  if (spec.spec_values.length <= 1) {
    Message.error("至少保留一个规格值！");
    return;
  }

  // 从规格项中移除规格值
  skuInfo.value.forEach((i) => {
    if (i.name === spec.name) {
      i.spec_values.splice(index, 1);
    }
  });

  // 生成新的规格组合
  const newCombinations = generateSkuCombinations(skuInfo.value);

  // 保留原有组合的属性值
  skuTableData.value = newCombinations.map(combination => {
    // 查找匹配的原有组合
    const existingCombination = skuTableData.value.find(item => {
      // 检查所有规格项是否匹配
      return skuInfo.value.every(info => {
        return item[info.name] === combination[info.name];
      });
    });

    if (existingCombination) {
      // 保留原有组合的属性值
      return {
        ...combination,
        id: existingCombination.id || "",
        sn: existingCombination.sn || "",
        quantity: hideSkuQuantity.value
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
        quantity: defaultSkuQuantity(),
      };
    }
  });

  baseInfoForm.value.regeneratorSkuFlag = true;
}

/**
 * 渲染table所需要的column 和 data
 */
function renderTableData(skus) {
  skuTableColumn.value = [];
  let pushData = [];
  // 渲染头部
  skuInfo.value.forEach((sku) => {
    // 列名称
    let columnName = sku.name;
    pushData.push({
      title: columnName,
      key: columnName,
    });
  });
  // 有成本价和价格的情况
  if (baseInfoForm.value.salesModel !== "WHOLESALE") {
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

  if (baseInfoForm.value.salesModel === "WHOLESALE" && wholesaleData.value) {
    wholesaleData.value.forEach((item, index) => {
      pushData.push({
        title: "购买量 ≥ " + item.num,
        slot: "wholePrice" + index,
      });
    });
  }

  // 有重量的情况
  if (
    needsLogistics.value &&
    baseInfoForm.value.salesModel !== "WHOLESALE"
  ) {
    pushData.push({
      title: "重量",
      slot: "weight",
    });
  }
  if (isAppointmentGoods.value) {
    pushData.push({
      title: "可预约数量",
      slot: "appointmentCapacity",
      minWidth: 160,
    });
  } else if (!isECouponGoods.value) {
    pushData.push({
      title: "库存",
      slot: "quantity",
    });
  }
  pushData.push(
    // {
    //   title: "库存预警",
    //   slot: "alertQuantity",
    // },
    {
      title: "货号",
      slot: "sn",
    },
  );

  skuTableColumn.value = pushData;

  // 生成规格组合
  if (skuInfo.value.length > 0) {
    const newCombinations = generateSkuCombinations(skuInfo.value);

    // 保留原有组合的属性值
    skuTableData.value = newCombinations.map(combination => {
      // 查找匹配的原有组合
      const existingCombination = skus.find(item => {
        // 检查所有规格项是否匹配
        return skuInfo.value.every(info => {
          return item[info.name] === combination[info.name];
        });
      });

      if (existingCombination) {
        // 保留原有组合的属性值
        return {
          ...combination,
          id: existingCombination.id || "",
          sn: existingCombination.sn || "",
          quantity: hideSkuQuantity.value
            ? (existingCombination.quantity ?? 0)
            : (existingCombination.quantity || ""),
          cost: existingCombination.cost || "",
          price: existingCombination.price || (baseInfoForm.value.salesModel === 'WHOLESALE' && wholesaleData.value.length > 0 ? wholesaleData.value[0].price : ""),
          weight: existingCombination.weight || ""
        };
      } else {
        // 新组合使用默认值，批发模式下设置默认价格
        return {
          ...combination,
          id: "",
          sn: "",
          quantity: defaultSkuQuantity(),
          cost: "",
          price: baseInfoForm.value.salesModel === 'WHOLESALE' && wholesaleData.value.length > 0 ? wholesaleData.value[0].price : "",
          weight: ""
        };
      }
    });
    assignSkuTableIndex();
  }
}

/**
 * 生成所有可能的规格组合
 * @param {Array} skuInfo 规格信息
 * @returns {Array} 所有可能的规格组合
 */
function generateSkuCombinations(skuInfo) {
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
        images: val.images || baseInfoForm.value.goodsGalleryFiles || []
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
        images: baseInfoForm.value.goodsGalleryFiles || []
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
}

/** 数据改变之后 抛出数据 */
function updateSkuTable(row, item, rowIndex) {
  let index = rowIndex;
  if (index === undefined || index === null) {
    index = row._index;
  }
  if (index === undefined || index === null) {
    index = skuTableData.value.indexOf(row);
  }
  if (index < 0 || !skuTableData.value[index]) {
    return;
  }
  row._index = index;
  baseInfoForm.value.regeneratorSkuFlag = true;
  /** 进行自定义校验 判断是否是数字（小数也能通过）重量 */
  if (item === "weight") {
    if (
      !/^[+]{0,1}(\d+)$|^[+]{0,1}(\d+\.\d+)$/.test(row[item]) ||
      parseInt(row[item]) < 0 ||
      parseInt(row[item]) > 99999999
    ) {
      // 校验未通过 加入错误存储列表中
      validateError.value.push([index, item]);
      validatatxt.value = "请输入0~99999999之间的数字值";
      return;
    }
  } else if (item === "quantity") {
    if (
      !/^[0-9]\d*$/.test(row[item]) ||
      parseInt(row[item]) < 0 ||
      parseInt(row[item]) > 99999999
    ) {
      // 库存
      validateError.value.push([index, item]);
      validatatxt.value = "请输入0~99999999之间的整数";
      return;
    }
  }
  nextTick(() => {
    if (skuTableData.value[index]) {
      skuTableData.value[index][item] = row[item];
    }
  });
}
// 店内分类选择
function selectTree(v) {
  if (v.length > 0) {
    // 转换null为""
    for (let attr in v[0]) {
      if (v[0][attr] == null) {
        v[0][attr] = "";
      }
    }
  }
}
// 店内分类选中
function changeSelect(v) {
  let ids = "";
  v.forEach(function (e) {
    ids += e.id + ",";
  });
  ids = ids.substring(0, ids.length - 1);

  if (ids.length > 100) {
    Message.error("选择了过多的店铺分类，请谨慎选择");
  }
  baseInfoForm.value.storeCategoryPath = ids;
}
/**  添加商品 **/
function save() {
  if (containsSameSkuItem.value) {
    jumpToTab("price");
    Message.error("存在重复规格项！");
    return;
  }
  if (containsSameSkuValue.value) {
    jumpToTab("price");
    Message.error("存在重复规格值！");
    return;
  }
  let checkFlag = false;
  let missingParams = [];
  goodsParams.value.forEach((param) => {
    if (!param || !param.required) return;
    const check = baseInfoForm.value.goodsParamsDTOList.some((paramsItem) => {
      if (String(paramsItem.paramId) !== String(param.id)) return false;
      return !!paramsItem.paramValue;
    });
    if (!check) {
      checkFlag = true;
      missingParams.push(param.paramName);
    }
  });
  if (checkFlag) {
    jumpToTab("basic");
    Message.error(`以下参数为必填项：${missingParams.join('、')}`);
    return;
  }
  submitLoading.value = true;
  baseInfoFormRef.value.validate((valid, fields) => {
    if (valid) {
      if (baseInfoForm.value.salesModel === "WHOLESALE") {
        for (let i = 0; i < wholesaleData.value.length; i++) {
          checkWholesaleNum(i);
          checkWholesalePrice(i);
          wholesaleData.value[i].goodsId = goodsId;
        }
        baseInfoForm.value.wholesaleList = wholesaleData.value;
      }

      // 判断是否是复制商品
      if (!route.query.copyId) {
        baseInfoForm.value.goodsId = goodsId;
      }
      syncIntroFromEditors();
      let submit = JSON.parse(JSON.stringify(baseInfoForm.value));
      if (
        submit.goodsGalleryFiles &&
        submit.goodsGalleryFiles.length <= 0
      ) {
        submitLoading.value = false;
        jumpToTab("specs");
        Message.error("请上传商品图片");
        return;
      }
      const invalidGalleryFiles = submit.goodsGalleryFiles.filter((url) =>
        invalidGoodsGalleryFiles.value.includes(url)
      );
      if (invalidGalleryFiles.length > 0) {
        submitLoading.value = false;
        jumpToTab("specs");
        Message.error("存在已失效的商品主图，请删除后重新上传");
        return;
      }
      if (submit.templateId === "") submit.templateId = 0;
      if (submit.brandId === "" || submit.brandId == null) submit.brandId = 0;
      if (isECouponGoods.value) {
        submit.templateId = 0;
        submit.salesModel = "RETAIL";
      }
      if (isAppointmentGoods.value) {
        submit.templateId = 0;
        submit.salesModel = "RETAIL";
        if (!appointmentPanel.value?.validateRules()) {
          submitLoading.value = false;
          jumpToTab("appointment");
          return;
        }
        if (!appointmentPanel.value?.validateDivision()) {
          submitLoading.value = false;
          jumpToTab("appointment");
          return;
        }
        Object.assign(submit, appointmentPanel.value.buildSubmitPayload());
      }
      let flag = false;
      let paramValue = "";

      if (flag) {
        Message.error(paramValue + " 参数值不能为空");
        submitLoading.value = false;
        return;
      }

      if (goodsUnitList.value && !goodsUnitList.value.find(i => i === baseInfoForm.value.goodsUnit)) {
        submit.goodsUnit = ""
        Message.error("商品单位不存在");
        submitLoading.value = false;
        jumpToTab("basic");
        return;
      }
      let skuInfoNames = skuInfo.value.map((n) => n.name);
      submit.skuList = [];
      let containEmptyImage = false;
      skuTableData.value.map((sku) => {
        let skuCopy = {
          cost: 1,
          price: sku.price,
          quantity: resolveSubmitQuantity(sku),
          // alertQuantity: sku.alertQuantity,
          sn: sku.sn,
          images: [],
        };
        if (openImage.value) {
          skuInfo.value[0].spec_values.forEach(item => {
            if (!item.images || item.images.length === 0) {
              containEmptyImage = true;
              return;
            }
            if (item.value === sku[skuInfo.value[0].name]) {
              skuCopy.images = item.images
            }
          })

        }
        if (sku.weight) {
          skuCopy.weight = sku.weight;
        }
        if (baseInfoForm.value.weight) {
          skuCopy.weight = baseInfoForm.value.weight;
        }
        if (sku.id) {
          skuCopy.id = sku.id;
        }
        for (let skuInfoName of skuInfoNames) {
          skuCopy[skuInfoName] = sku[skuInfoName];
        }
        if (isAppointmentGoods.value && appointmentPanel.value) {
          skuCopy.slotCapacities = appointmentPanel.value.buildSkuSlotCapacities(sku);
        }
        submit.skuList.push(skuCopy);
      });
      if (containEmptyImage) {
        Message.error("开启规格图片，所有规格图片不能为空！");
        submitLoading.value = false;
        jumpToTab("price");
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
      if (goodsId && !route.query.copyId) {
        API_GOODS.editGoods(goodsId, submit).then((res) => {
          if (res.success) {
            submitLoading.value = false;
            router.go(-1);
          } else {
            submitLoading.value = false;
          }
        }).catch(() => {
          submitLoading.value = false;
          Message.error("保存失败，请重试");
        });
      } else {
        API_GOODS.createGoods(submit).then((res) => {
          if (res.success) {
            submitLoading.value = false;
            proxy.$parent.activestep = 2;
            window.scrollTo(0, 0);
          } else {
            submitLoading.value = false;
          }
        });
      }
    } else {
      submitLoading.value = false;
      jumpToTab(tabForInvalidFields(fields));
      Message.error("还有必填项未做处理，请检查表单");
    }
  });
}
function GET_ShipTemplate(type) {
  // 获取物流模板
  API_Shop.getShipTemplate().then((res) => {
    if (res.success) {
      logisticsTemplate.value = res.result;
    }
    if (type === 'localRefresh' && res.success) {
      Message.success("刷新成功");
    } else if (type === 'localRefresh') {
      Message.error("刷新失败，请重试");
    }
  });
}

onMounted(() => {
  accessToken.value = {
    accessToken: getStore("accessToken"),
  };
  GET_ShipTemplate()
  if (route.query.id || route.query.draftId) {
    // 编辑商品、模板
    GET_GoodData(route.query.id, route.query.draftId);
  } else if (route.query.copyId) {
    // 复制商品
    GET_GoodData(route.query.copyId);
  } else if (props.firstData.tempId) {
    // 选择模板
    GET_GoodData("", props.firstData.tempId);
  } else {
    // 新增商品
    const cateId = [];
    (props.firstData.category || []).forEach((cate) => {
      baseInfoForm.value.categoryName.push(cate.name);
      cateId.push(cate.id);
    });
    categoryId.value = cateId[2];
    baseInfoForm.value.categoryPath = cateId.toString();
    baseInfoForm.value.goodsType = props.firstData.goodsType;

    GET_GoodsParams();
    getGoodsBrandList();
    GET_GoodsUnit();
    GET_ShopGoodsLabel();
  }
  nextTick(() => {
    bindPublishScroll();
    handleTabChange("specs");
  });
});

onBeforeUnmount(() => {
  window.clearTimeout(_scrollClickTimer);
  unbindPublishScroll();
});
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

.goods-publish-page {
  .base-info-item {
    > div {
      padding-left: 0;
    }

    h4 {
      margin: 20px 0 16px;
      padding: 0 0 0 8px;
      border: none;
      border-left: 3px solid var(--el-color-primary);
      background: transparent;
      line-height: 16px;
      font-size: 14px;
      font-weight: 600;
      color: #252931;
    }
  }
}

.tree-bar.is-empty {
  min-height: auto !important;
}

.tree-bar :deep(.el-tree__empty-block) {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  min-height: 32px;
  height: auto;
  width: auto;
}

.tree-bar :deep(.el-tree__empty-text),
.shop-category-empty {
  position: static;
  left: auto;
  top: auto;
  transform: none;
  white-space: nowrap;
  writing-mode: horizontal-tb;
}
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

.goods-publish-page {
  padding: 0;
  background: transparent;
  box-shadow: none;
  border-radius: 0;
  text-align: left;
}

.goods-publish-page :deep(.base-info-item > div) {
  padding-left: 0;
}

.goods-publish-page :deep(.base-info-item h4) {
  margin: 20px 0 16px;
  padding: 0 0 0 8px;
  border: none;
  border-left: 3px solid var(--el-color-primary);
  background: transparent;
  line-height: 16px;
  font-size: 14px;
  font-weight: 600;
  color: #252931;
}

.goods-section-nav {
  position: sticky;
  top: 0;
  z-index: 20;
  display: flex;
  align-items: center;
  height: 56px;
  margin: 0 0 12px;
  padding: 0 12px;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.06);
}

.goods-section-nav-item {
  position: relative;
  display: inline-flex;
  align-items: center;
  height: 56px;
  padding: 0 18px;
  border: none;
  background: transparent;
  color: #555;
  font-size: 14px;
  cursor: pointer;
}

.goods-section-nav-index {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 18px;
  height: 18px;
  margin-right: 8px;
  border: 1px solid #c9cdd4;
  border-radius: 50%;
  color: #85878a;
  font-size: 12px;
  line-height: 18px;
}

.goods-section-nav-item.active {
  color: var(--el-color-primary);
  font-weight: 600;
}

.goods-section-nav-item.active .goods-section-nav-index {
  border-color: var(--el-color-primary);
  background: var(--el-color-primary);
  color: #fff;
}

.goods-section-nav-item.active::after {
  content: "";
  position: absolute;
  left: 18px;
  right: 18px;
  bottom: 0;
  height: 2px;
  background: var(--el-color-primary);
}

.goods-section-nav-item:hover {
  color: var(--el-color-primary);
}

.goods-section {
  scroll-margin-top: 68px;
  margin-bottom: 12px;
  padding-left: 0 !important;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.06);
}

.goods-section-hd {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 20px 24px 16px;
  border-bottom: 1px solid #f0f0f0;
}

.goods-section-index {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  margin-top: 1px;
  border-radius: 50%;
  background: var(--el-color-primary);
  color: #fff;
  font-size: 13px;
  font-weight: 600;
  line-height: 24px;
  flex-shrink: 0;
}

.goods-section-hd-text h3 {
  margin: 0;
  color: #252931;
  font-size: 16px;
  font-weight: 600;
  line-height: 24px;
}

.goods-section-hd-text p {
  margin: 2px 0 0;
  color: #85878a;
  font-size: 12px;
  line-height: 18px;
}

.goods-section-bd {
  padding: 20px 24px 24px;
}

.goods-section .form-item-view {
  padding-left: 0;
}

.goods-submodule {
  margin-top: 8px;
  padding-top: 20px;
  border-top: 1px dashed #eee;
}

.goods-submodule-hd {
  margin: 0 0 16px;
  padding-left: 8px;
  border-left: 3px solid var(--el-color-primary);
  color: #252931;
  font-size: 14px;
  font-weight: 600;
  line-height: 16px;
}

.gallery-hint {
  color: grey;
  white-space: nowrap;
}

.goods-field {
  width: 260px;
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

.wholesale-rule-form-item {
  width: 100% !important;
  min-width: 900px;
}

.wholesale-preview-table {
  width: 480px;
}

.wholesale-preview-table :deep(.el-table__cell .cell) {
  overflow: visible;
  white-space: nowrap;
}

.wholesale-rule-form-item :deep(.el-form-item__content) {
  width: 100%;
}

.wholesale-num-input {
  width: 190px;
}

.wholesale-num-input :deep(.el-input__wrapper) {
  min-width: 140px;
}

.wholesale-price-cell {
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
}

.wholesale-price-input {
  width: 190px;
}

.wholesale-price-del {
  position: absolute;
  top: 50%;
  left: 50%;
  margin-left: 100px;
  transform: translateY(-50%);
}
</style>
