<template>
  <div ref="rootEl">
    <el-dialog v-model="visible" title="预览图片">
      <img alt="预览图片" v-if="visible" :src="previewPicture" style="width: 100%">
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
            <el-form-item label="SPU编码">
              <el-input :model-value="baseInfoForm.spuSn || ($route.query.id && !$route.query.copyId ? '—' : '保存后自动生成')" class="goods-field" disabled type="text" />
            </el-form-item>
            <el-form-item label="商品名称" prop="goodsName">
              <el-input v-model="baseInfoForm.goodsName" class="goods-field" clearable placeholder="商品名称" type="text" />
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
            <el-form-item class="form-item-view-el required media-form-item" label="商品图片:" prop="goodsGalleryFiles">
              <div class="media-upload-wrapper">
                <div class="media-list-container">
                  <vuedraggable
                    v-if="(baseInfoForm.goodsGalleryFiles || []).length > 0"
                    v-model="baseInfoForm.goodsGalleryFiles"
                    :animation="200"
                    :item-key="draggableItemKey"
                    class="media-draggable-list"
                  >
                    <template #item="{ element, index }">
                      <div class="media-card-item">
                        <img alt="商品图片" data-no-fallback :src="element" @error="handleGoodsPictureError($event, element)" />
                        <span v-if="index === 0" class="media-card-badge">主图</span>
                        <div class="media-card-cover">
                          <el-icon class="cover-icon" title="预览" @click.stop="handleViewGoodsPicture(element)"><ZoomIn /></el-icon>
                          <el-icon class="cover-icon" title="删除" @click.stop="handleRemoveGoodsPicture(element)"><Delete /></el-icon>
                        </div>
                      </div>
                    </template>
                  </vuedraggable>
                  <div
                    v-if="(baseInfoForm.goodsGalleryFiles || []).length < 5"
                    class="media-upload-card"
                    title="上传图片"
                    @click="handleCLickImg('goodsGalleryFiles')"
                  >
                    <el-icon class="uploader-plus-icon"><Plus /></el-icon>
                  </div>
                </div>
                <div class="media-uploader-tip">
                  <el-icon class="tip-icon"><InfoFilled /></el-icon>
                  <span>建议尺寸:800*800px,单张大小不超过2M,最多可上传5张</span>
                </div>
              </div>
              <el-dialog v-model="goodsPictureVisible" title="图片预览" width="600px" append-to-body destroy-on-close>
                <img alt="商品图片预览" v-if="goodsPictureVisible" :src="previewGoodsPicture" style="width: 100%; display: block;" />
              </el-dialog>
            </el-form-item>

            <el-form-item class="form-item-view-el media-form-item" label="商品视频:" prop="goodsVideo">
              <div class="media-upload-wrapper">
                <div class="media-list-container">
                  <div v-if="baseInfoForm.goodsVideo" class="media-card-item video-card-item">
                    <video :src="baseInfoForm.goodsVideo" class="card-video-thumb" preload="metadata" />
                    <div class="media-card-cover">
                      <el-icon class="cover-icon" title="播放预览" @click.stop="videoPreviewVisible = true"><VideoPlay /></el-icon>
                      <el-icon class="cover-icon" title="删除" @click.stop="handleRemoveGoodsVideo"><Delete /></el-icon>
                    </div>
                  </div>
                  <el-upload
                    v-else
                    :action="uploadFileUrl"
                    :headers="{ ...accessToken }"
                    accept=".mp4,.avi,.wmv,.mpeg,.mov"
                    :show-file-list="false"
                    :before-upload="beforeVideoUpload"
                    :on-success="handleSuccessGoodsVideo"
                    :on-error="() => { loadingVideo = false }"
                    class="media-uploader-action"
                  >
                    <div class="media-upload-card" :class="{ 'is-loading': loadingVideo }" title="上传视频">
                      <el-icon v-if="loadingVideo" class="is-loading uploader-plus-icon"><Loading /></el-icon>
                      <el-icon v-else class="uploader-plus-icon"><Plus /></el-icon>
                    </div>
                  </el-upload>
                </div>
                <div class="media-uploader-tip">
                  <el-icon class="tip-icon"><InfoFilled /></el-icon>
                  <span>商品视频最大限制30M，支持文件类型：mp4，推荐时长小于等于90s，大于等于6s，推荐视频比例7:9</span>
                </div>
              </div>
              <el-dialog v-model="videoPreviewVisible" title="视频预览" width="640px" append-to-body destroy-on-close>
                <video v-if="videoPreviewVisible" :src="baseInfoForm.goodsVideo" controls autoplay style="width: 100%; max-height: 480px; display: block; margin: 0 auto;" />
              </el-dialog>
            </el-form-item>
          </div>
          <div v-if="showContent" class="goods-submodule">
            <div class="goods-submodule-hd">规格描述内容</div>
          <div class="form-item-view">
            <div>
              <el-form-item :label="contentImage" class="form-item-view-el">
                <!-- {{item.url}} -->
                <div v-for="(item, index) in listImages.images" :key="index" style="width:100%;display:flex;">
                  <img alt="图片" :src="item.url" style="width:100px;flex:1;margin-top:10px;cursor:pointer;"
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
            <el-alert
              v-if="isECouponGoods"
              class="mb_10"
              type="info"
              show-icon
              :closable="false"
              title="卡密库存不在这里填写。商品保存后，到商品列表的「卡池管理」导入卡密。"
            />
            <!-- 规格模式切换栏（对齐单/多规格设置） -->
            <div class="spec-mode-switch-bar">
              <el-checkbox v-model="isMultiSpec" size="large" @change="handleMultiSpecChange">
                <span class="spec-checkbox-label">设置商品多规格</span>
              </el-checkbox>
            </div>

            <!-- 单规格模式 -->
            <div v-if="!isMultiSpec" class="single-spec-table-wrapper">
              <el-table :data="[singleSku]" border class="mt_10" style="width: 100%">
                <el-table-column label="图片" width="100" align="center">
                  <template #default="{ row }">
                    <div class="spec-sku-image-cell">
                      <div v-if="row.images && row.images.length > 0" class="spec-sku-image-preview">
                        <img :src="row.images[0]" alt="商品图片" />
                        <div class="spec-sku-image-mask">
                          <el-icon @click="row.images = []"><Delete /></el-icon>
                        </div>
                      </div>
                      <div
                        v-else
                        class="spec-sku-image-uploader"
                        title="点击选择图片，未选则默认取主图"
                        @click="handleCLickImg('selectedSingleSkuImage')"
                      >
                        <el-icon><Plus /></el-icon>
                      </div>
                    </div>
                  </template>
                </el-table-column>
                <el-table-column label="SKU编码" min-width="160">
                  <template #default="{ row }">
                    <span>{{ row.sn || '保存后自动生成' }}</span>
                  </template>
                </el-table-column>
                <el-table-column label="价格" min-width="160">
                  <template #default="{ row }">
                    <el-input v-model="row.price" placeholder="请输入价格" type="number" clearable>
                      <template #append>元</template>
                    </el-input>
                  </template>
                </el-table-column>
                <el-table-column v-if="needsLogistics" label="物流重量" min-width="150">
                  <template #default="{ row }">
                    <el-input v-model="row.weight" placeholder="请输入重量" type="number" clearable>
                      <template #append>kg</template>
                    </el-input>
                  </template>
                </el-table-column>
                <el-table-column v-if="!isECouponGoods && !isAppointmentGoods" label="库存" min-width="150">
                  <template #default="{ row }">
                    <el-input v-model="row.quantity" placeholder="请输入库存" type="number" clearable>
                      <template #append>{{ baseInfoForm.goodsUnit || "" }}</template>
                    </el-input>
                  </template>
                </el-table-column>
                <el-table-column v-if="isAppointmentGoods" label="预约设置" min-width="160" align="center">
                  <template #default="{ row }">
                    <el-button link type="primary" @click="openAppointmentCapacity(row)">设置可预约数量</el-button>
                  </template>
                </el-table-column>
              </el-table>
            </div>

            <!-- 多规格模式（对齐参考截图3） -->
            <div v-else class="multi-spec-container">
              <!-- 规格项设置区 -->
              <div class="spec-builder-list">
                <div v-for="(item, $index) in skuInfo" :key="$index" class="spec-builder-row">
                  <div class="spec-builder-left">
                    <span class="spec-star">*</span>
                    <el-input
                      v-model="item.name"
                      placeholder="规格项名称"
                      class="spec-name-input"
                      @blur="handleSpecNameChange(item, $index)"
                    />
                    <el-button
                      v-if="skuInfo.length > 1"
                      link
                      type="danger"
                      class="spec-del-link"
                      @click="handleRemoveSpecItem($index, item)"
                    >
                      删除
                    </el-button>
                    <span v-else class="spec-del-disabled">删除</span>
                  </div>

                  <div class="spec-builder-right">
                    <!-- 已添加的规格值标签流 -->
                    <div
                      v-for="(val, vIndex) in item.spec_values"
                      :key="vIndex"
                      class="spec-val-tag-wrap"
                    >
                      <el-tag
                        closable
                        size="large"
                        class="spec-val-tag"
                        @close="handleRemoveSpecValue(item, vIndex)"
                      >
                        {{ val.value }}
                      </el-tag>
                      <!-- 若开启规格图片（仅首个规格项生效） -->
                      <div v-if="$index === 0 && openImage" class="spec-val-img-box">
                        <div v-if="val.images && val.images.length > 0" class="spec-val-img-preview">
                          <img :src="val.images[0]" alt="规格图" />
                          <div class="spec-val-img-mask" @click="val.images = []">
                            <el-icon><Delete /></el-icon>
                          </div>
                        </div>
                        <div
                          v-else
                          class="spec-val-img-uploader"
                          title="上传规格图片"
                          @click="handleCLickSpecValueImg(val)"
                        >
                          <el-icon><Camera /></el-icon>
                        </div>
                      </div>
                    </div>

                    <!-- 输入新规格值 -->
                    <div class="spec-val-input-group">
                      <el-input
                        v-model="newSkuValues[$index]"
                        placeholder="请输入规格值"
                        class="spec-val-input"
                        maxlength="30"
                        clearable
                        @keyup.enter="handleAddSpecValue($index, item)"
                      />
                      <el-button
                        type="primary"
                        plain
                        class="spec-val-add-btn"
                        @click="handleAddSpecValue($index, item)"
                      >
                        添加规格值
                      </el-button>
                    </div>

                    <!-- 首个规格项可开启规格图片 -->
                    <div v-if="$index === 0" class="spec-image-checkbox">
                      <el-checkbox v-model="openImage" @change="changeSkuOpenImage">
                        添加规格图片
                      </el-checkbox>
                    </div>
                  </div>
                </div>

                <!-- 添加规格项按钮 -->
                <div v-if="skuInfo.length < 5" class="spec-add-btn-row">
                  <el-button class="add-spec-item-btn" @click="addSkuItem">
                    <el-icon><Plus /></el-icon>
                    <span>添加规格项</span>
                  </el-button>
                </div>
              </div>

              <!-- 规格详细表格（平铺展示，无多余折叠条） -->
              <div class="multi-spec-table-section">
                <div class="spec-detail-hd">
                  <div class="spec-detail-title">规格详细</div>
                  <!-- 批量填充快捷工具（仅当有多行且非占位行时展示） -->
                  <div v-if="skuTableData.length > 1 && !skuTableData[0]._isPlaceholder" class="spec-batch-fill-bar">
                    <span class="batch-title">批量设置：</span>
                    <el-input
                      v-model="batchFillPrice"
                      placeholder="价格"
                      clearable
                      class="batch-fill-input"
                    >
                      <template #append>元</template>
                    </el-input>
                    <el-input
                      v-if="needsLogistics"
                      v-model="batchFillWeight"
                      placeholder="重量"
                      clearable
                      class="batch-fill-input"
                    >
                      <template #append>kg</template>
                    </el-input>
                    <el-input
                      v-if="!isECouponGoods && !isAppointmentGoods"
                      v-model="batchFillQuantity"
                      placeholder="库存"
                      clearable
                      class="batch-fill-input"
                    >
                      <template #append>{{ baseInfoForm.goodsUnit || "件" }}</template>
                    </el-input>
                    <el-button type="primary" class="batch-apply-btn" @click="handleBatchApply">
                      应用
                    </el-button>
                  </div>
                </div>

                <el-table :data="skuTableData" border style="width: 100%">
                  <el-table-column
                    v-for="(col, colIndex) in skuTableColumn"
                    :key="colIndex"
                    :label="col.title"
                    :prop="col.key"
                    :min-width="col.minWidth || 120"
                  >
                    <template #default="{ row, $index }">
                      <span v-if="col.key && !col.slot">{{ row[col.key] }}</span>
                      <span v-else-if="col.slot === 'sn'">{{ row.sn || '保存后自动生成' }}</span>
                      <el-input
                        v-else-if="col.slot === 'weight' && needsLogistics"
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
                        v-else-if="col.slot === 'price'"
                        v-model="row.price"
                        clearable
                        placeholder="请输入价格"
                        @change="updateSkuTable(row, 'price', $index)"
                      >
                        <template #append>元</template>
                      </el-input>
                    </template>
                  </el-table-column>
                </el-table>
              </div>
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
            <el-form-item class="form-item-view-el" label="上下架" prop="release">
              <el-radio-group v-model="baseInfoForm.release">
                <el-radio-button :value="1">上架</el-radio-button>
                <el-radio-button :value="0">下架</el-radio-button>
                <el-radio-button :value="2">定时上架</el-radio-button>
              </el-radio-group>
            </el-form-item>
            <el-form-item v-if="baseInfoForm.release === 2" class="form-item-view-el" label="上架时间">
              <el-date-picker
                v-model="baseInfoForm.scheduledUpperTime"
                type="datetime"
                placeholder="请选择定时上架时间"
                format="YYYY-MM-DD HH:mm"
                value-format="YYYY-MM-DD HH:mm:ss"
                :disabled-date="disabledPastDate"
                style="width: 240px"
              />
            </el-form-item>
            <el-form-item v-if="needsLogistics" class="form-item-view-el goods-field-with-refresh" label="运费模板" prop="templateId">
              <el-select v-model="baseInfoForm.templateId" class="goods-field">
                <el-option v-for="item in logisticsTemplate" :key="item.id" :label="item.name" :value="item.id" />
              </el-select>
              <el-button class="refresh-icon" circle link @click="refresh('template')">
                <el-icon><Refresh /></el-icon>
              </el-button>
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
        :max-select="selectedFormBtnName === 'goodsGalleryFiles' ? Math.max(0, 5 - ((baseInfoForm.goodsGalleryFiles && baseInfoForm.goodsGalleryFiles.length) || 0)) : 0"
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
import { Camera, Delete, InfoFilled, Loading, Plus, Refresh, VideoPlay, ZoomIn } from "@element-plus/icons-vue";
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
import { ElMessageBox } from "element-plus";

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

const baseInfoFormRule = {
  goodsName: [regular.REQUIRED, regular.WHITE_SPACE, regular.VARCHAR60],
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
//展示商品视频
const videoPreviewVisible = ref(false);
//选择的sku
const selectedSku = ref({});

/** 发布商品基本参数 */
const baseInfoForm = ref({
  salesModel: "RETAIL",
  /** SPU编码（后端自动生成，只读展示） */
  spuSn: "",
  /** 商品相册列表 */
  goodsGalleryFiles: [],
  /** 是否立即发布 1 立即上架 0 立即下架 2 定时上架 */
  release: 1,
  /** 定时上架时间（release 为 2 时必填） */
  scheduledUpperTime: "",
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
// 本次会话中新建成功的商品ID（含复制商品场景），用于保存失败重试时走编辑而不是重复创建
let createdGoodsId;
let currentSkuItem = "";
let scrollParent = null;
let _onPublishScroll;
let _scrollTick = false;
let _scrollClickTimer;

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
/** 是否开启多规格模式（默认单规格） */
const isMultiSpec = ref(false);
/** 单规格模式下的 SKU 数据 */
const singleSku = ref({
  id: "",
  sn: "",
  price: "",
  cost: 1,
  quantity: "",
  weight: "",
  images: []
});
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
  return "商品规格、售价与库存";
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
  if (val === "goodsGalleryFiles" && (baseInfoForm.value.goodsGalleryFiles || []).length >= 5) {
    Message.warning("商品图片最多可上传5张");
    return;
  }
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
// 当前正在上传图片的规格值对象
let currentSpecValue = null;
function handleCLickSpecValueImg(val) {
  currentSpecValue = val;
  handleCLickImg("selectedSpecValueImage");
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
  } else if (selectedFormBtnName.value === "selectedSingleSkuImage") {
    singleSku.value.images = [val.url];
  } else if (selectedFormBtnName.value === "selectedSpecValueImage") {
    if (currentSpecValue) {
      currentSpecValue.images = [val.url];
    }
  } else if (selectedFormBtnName.value === "goodsGalleryFiles") {
    if (!baseInfoForm.value.goodsGalleryFiles) {
      baseInfoForm.value.goodsGalleryFiles = [];
    }
    if (baseInfoForm.value.goodsGalleryFiles.length < 5) {
      baseInfoForm.value.goodsGalleryFiles.push(val.url);
    } else {
      Message.warning("商品图片最多可上传5张");
    }
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
  } else if (selectedFormBtnName.value === "selectedSingleSkuImage") {
    if (urls.length > 0) {
      singleSku.value.images = [urls[0]];
    }
  } else if (selectedFormBtnName.value === "selectedSpecValueImage") {
    if (currentSpecValue && urls.length > 0) {
      currentSpecValue.images = [urls[0]];
    }
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
  const container = document.querySelector(".single-page-con");
  if (container) return container;

  let node = rootEl.value && rootEl.value.parentElement;
  while (node && node !== document.body && node !== document.documentElement) {
    const style = window.getComputedStyle(node);
    if (
      (style.overflowY === "auto" || style.overflowY === "scroll") &&
      node.scrollHeight > node.clientHeight
    ) {
      return node;
    }
    node = node.parentElement;
  }
  return document.scrollingElement || document.documentElement || document.body || window;
}
function bindPublishScroll() {
  unbindPublishScroll();
  scrollParent = getScrollParent();
  _onPublishScroll = () => onPublishScroll();
  if (scrollParent && scrollParent.addEventListener) {
    scrollParent.addEventListener("scroll", _onPublishScroll, { passive: true });
  }
  window.addEventListener("scroll", _onPublishScroll, { passive: true, capture: true });
}
function unbindPublishScroll() {
  if (scrollParent && _onPublishScroll && scrollParent.removeEventListener) {
    scrollParent.removeEventListener("scroll", _onPublishScroll);
  }
  if (_onPublishScroll) {
    window.removeEventListener("scroll", _onPublishScroll, { capture: true });
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

  // 滚动到底部时优先高亮最后一个 tab
  const scrollTop = scroller.scrollTop !== undefined ? scroller.scrollTop : window.scrollY;
  const clientHeight = scroller.clientHeight || window.innerHeight;
  const scrollHeight = scroller.scrollHeight || document.documentElement.scrollHeight;
  if (scrollTop + clientHeight >= scrollHeight - 30 && sectionTabs.value.length > 0) {
    const lastTab = sectionTabs.value[sectionTabs.value.length - 1].name;
    if (activeTab.value !== lastTab) {
      activeTab.value = lastTab;
      handleTabChange(lastTab);
    }
    return;
  }

  const navHeight = (sectionNav.value && sectionNav.value.offsetHeight) || 56;
  const scrollerTop = scroller.getBoundingClientRect ? scroller.getBoundingClientRect().top : 0;
  const marker = scrollerTop + navHeight + 20;

  let current = sectionTabs.value[0]?.name || "basic";
  sectionTabs.value.forEach((tab) => {
    const el = document.getElementById(`goods-section-${tab.name}`);
    if (el) {
      const rect = el.getBoundingClientRect();
      if (rect.top <= marker) {
        current = tab.name;
      }
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
    if (!el) {
      scrollingByClick.value = false;
      return;
    }
    const navHeight = (sectionNav.value && sectionNav.value.offsetHeight) || 56;
    if (
      scroller &&
      scroller.getBoundingClientRect &&
      scroller !== window &&
      scroller !== document.body &&
      scroller !== document.documentElement
    ) {
      const top =
        el.getBoundingClientRect().top -
        scroller.getBoundingClientRect().top +
        scroller.scrollTop -
        navHeight -
        8;
      scroller.scrollTo({ top: Math.max(top, 0), behavior: "smooth" });
    } else {
      const top = el.getBoundingClientRect().top + window.scrollY - navHeight - 8;
      window.scrollTo({ top: Math.max(top, 0), behavior: "smooth" });
    }
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
    if (key === "salesModel") {
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

function beforeVideoUpload(file) {
  const allowTypes = ["avi", "wmv", "mpeg", "mp4", "mov"];
  const ext = (file.name.split(".").pop() || "").toLowerCase();
  if (!allowTypes.includes(ext)) {
    Message.warning("视频格式仅支持 avi、wmv、mpeg、mp4、mov");
    return false;
  }
  const maxSize = 30 * 1024 * 1024;
  if (file.size > maxSize) {
    Message.warning("商品视频最大限制30M");
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
  baseInfoForm.value.salesModel = "RETAIL";
  baseInfoForm.value.release = !draftId && !route.query.copyId && response.result.marketEnable === "DOWN" ? 0 : 1;
  // 已设置定时上架的商品，编辑时回显为定时上架
  if (!draftId && !route.query.copyId && response.result.scheduledUpperTime) {
    baseInfoForm.value.release = 2;
    baseInfoForm.value.scheduledUpperTime = response.result.scheduledUpperTime;
  }
  baseInfoForm.value.brandId = normalizeBrandId(baseInfoForm.value.brandId);
  categoryId.value = response.result.categoryPath.split(",")[2];

  // 如果是复制商品，需要清除ID，确保提交时作为新商品
  if (route.query.copyId) {
    baseInfoForm.value.id = "";
    // 复制商品是新商品，SPU编码由后端重新生成
    baseInfoForm.value.spuSn = "";
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

  if (isECouponGoods.value || isAppointmentGoods.value) {
    baseInfoForm.value.salesModel = "RETAIL";
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

  // 复制商品/草稿场景：SPU编码为空时进入页面即生成
  if (!baseInfoForm.value.spuSn && (!route.query.id || route.query.copyId)) {
    baseInfoForm.value.spuSn = generateSpuCode();
  }

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
  if (skusInfo.length > 0) {
    isMultiSpec.value = true;
    skuInfo.value = skusInfo;
    skuTableData.value = skus;
    renderTableData(skus);
  } else {
    isMultiSpec.value = false;
    skuInfo.value = [];
    skuTableData.value = [];
    skuTableColumn.value = [];
    if (skuList && skuList.length > 0) {
      const first = skuList[0];
      singleSku.value = {
        id: first.id || "",
        sn: first.sn || generateSkuCode(),
        price: first.price !== undefined && first.price !== null ? first.price : "",
        cost: first.cost !== undefined && first.cost !== null ? first.cost : 1,
        quantity: first.quantity !== undefined && first.quantity !== null ? first.quantity : "",
        weight: first.weight !== undefined && first.weight !== null ? first.weight : "",
        images: (first.goodsGalleryList && first.goodsGalleryList.length > 0) ? first.goodsGalleryList : []
      };
    }
  }
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
// 批量设置相关变量
const batchFillPrice = ref("");
const batchFillQuantity = ref("");
const batchFillWeight = ref("");

function handleBatchApply() {
  if (skuTableData.value.length === 0 || skuTableData.value[0]._isPlaceholder) return;
  const p = (batchFillPrice.value || "").toString().trim();
  const q = (batchFillQuantity.value || "").toString().trim();
  const w = (batchFillWeight.value || "").toString().trim();

  if (p === "" && q === "" && w === "") {
    Message.warning("请至少输入一项批量设置的数值");
    return;
  }

  if (p !== "") {
    if (isNaN(Number(p)) || Number(p) < 0) {
      Message.warning("批量价格请输入正确的非负数字");
      return;
    }
  }

  if (w !== "") {
    if (isNaN(Number(w)) || Number(w) < 0) {
      Message.warning("批量重量请输入正确的非负数字");
      return;
    }
  }

  if (q !== "") {
    if (!/^\d+$/.test(q) || Number(q) < 0) {
      Message.warning("批量库存请输入正确的整数");
      return;
    }
  }

  skuTableData.value.forEach(row => {
    if (p !== "") row.price = p;
    if (q !== "") row.quantity = q;
    if (w !== "") row.weight = w;
  });
  Message.success("批量设置成功");
}

/** 切换多规格模式 */
function handleMultiSpecChange(val) {
  if (val) {
    if (!skuInfo.value || skuInfo.value.length === 0) {
      skuInfo.value = [
        {
          name: "规格1",
          spec_values: []
        }
      ];
      newSkuValues.value = [""];
    }
    renderTableData(skuTableData.value);
  } else {
    const hasSpecData = (skuInfo.value && skuInfo.value.some(i => i.spec_values && i.spec_values.length > 0)) || (skuTableData.value && skuTableData.value.length > 0 && !skuTableData.value[0]._isPlaceholder);
    if (hasSpecData) {
      ElMessageBox.confirm("切换为单规格将清空当前已配置的多规格属性，是否继续？", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
      }).then(() => {
        isMultiSpec.value = false;
        if (skuTableData.value && skuTableData.value[0]) {
          if (skuTableData.value[0].price !== undefined && skuTableData.value[0].price !== "") singleSku.value.price = skuTableData.value[0].price;
          if (skuTableData.value[0].quantity !== undefined && skuTableData.value[0].quantity !== "") singleSku.value.quantity = skuTableData.value[0].quantity;
          if (skuTableData.value[0].weight !== undefined && skuTableData.value[0].weight !== "") singleSku.value.weight = skuTableData.value[0].weight;
        }
        skuInfo.value = [];
        skuTableData.value = [];
        skuTableColumn.value = [];
      }).catch(() => {
        isMultiSpec.value = true;
      });
    } else {
      isMultiSpec.value = false;
      skuInfo.value = [];
      skuTableData.value = [];
      skuTableColumn.value = [];
    }
  }
}

/** 添加规格项 */
function addSkuItem() {
  if (skuInfo.value.length >= 5) {
    Message.warning("规格项不能大于5个！");
    return;
  }
  if (skuInfo.value.find((i) => !i.name || i.name.trim() === "")) {
    Message.warning("规格项名称不能为空！");
    return;
  }
  let nextNum = skuInfo.value.length + 1;
  while (skuInfo.value.some(i => i.name === `规格${nextNum}`)) {
    nextNum++;
  }
  const newName = `规格${nextNum}`;
  skuInfo.value.push({
    name: newName,
    spec_values: [],
  });
  newSkuValues.value[skuInfo.value.length - 1] = "";

  renderTableData(skuTableData.value);
}

/** 删除规格项 */
function handleRemoveSpecItem($index, item) {
  if (skuInfo.value.length <= 1) {
    Message.warning("至少保留一个规格项！");
    return;
  }
  skuInfo.value.splice($index, 1);
  newSkuValues.value.splice($index, 1);
  renderTableData(skuTableData.value);
}

/** 编辑规格项名称失焦检查 */
function handleSpecNameChange(item, $index) {
  const trimmed = (item.name || "").trim();
  if (!trimmed) {
    item.name = `规格${$index + 1}`;
  }
  const hasDup = skuInfo.value.filter((i, idx) => idx !== $index && i.name === item.name).length > 0;
  if (hasDup) {
    Message.warning("已存在相同规格项名称！");
    return;
  }
  item.spec_values.forEach(v => {
    v.name = item.name;
  });
  renderTableData(skuTableData.value);
}

/** 添加当前规格项的规格值 */
function handleAddSpecValue($index, item) {
  const val = (newSkuValues.value[$index] || "").trim();
  if (!val) {
    Message.warning("请输入规格值");
    return;
  }
  if (item.spec_values.some(i => i.value === val)) {
    Message.warning("已存在相同规格值！");
    return;
  }
  if (item.spec_values.length >= 10) {
    Message.warning("规格值不能大于10个！");
    return;
  }

  item.spec_values.push({
    name: item.name,
    value: val,
    images: []
  });
  newSkuValues.value[$index] = "";
  renderTableData(skuTableData.value);
}

/** 移除当前规格值 */
function handleRemoveSpecValue(item, vIndex) {
  item.spec_values.splice(vIndex, 1);
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
          sn: existingCombination.sn || generateSkuCode(),
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
        sn: existingCombination.sn || generateSkuCode(),
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
  pushData.push({
    title: "价格",
    slot: "price",
  });

  // 有重量的情况
  if (needsLogistics.value) {
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
      title: "SKU编码",
      slot: "sn",
    },
  );

  skuTableColumn.value = pushData;

  // 生成规格组合
  if (skuInfo.value.length > 0) {
    const newCombinations = generateSkuCombinations(skuInfo.value);

    // 如果还没有添加任何规格值，渲染一行平滑的占位行，避免出现空数据提示框
    if (newCombinations.length === 0) {
      const prevRow = (Array.isArray(skus) && skus[0]) || {};
      const placeholderRow = {
        _isPlaceholder: true,
        id: "",
        sn: "",
        price: prevRow.price || singleSku.value.price || "",
        weight: prevRow.weight || singleSku.value.weight || "",
        quantity: (prevRow.quantity !== undefined && prevRow.quantity !== "")
          ? prevRow.quantity
          : (singleSku.value.quantity !== undefined && singleSku.value.quantity !== "" ? singleSku.value.quantity : defaultSkuQuantity()),
        cost: prevRow.cost || singleSku.value.cost || "",
        images: baseInfoForm.value.goodsGalleryFiles || []
      };
      skuInfo.value.forEach(info => {
        placeholderRow[info.name] = "-";
      });
      skuTableData.value = [placeholderRow];
      assignSkuTableIndex();
      return;
    }

    const prevRow = (Array.isArray(skus) && skus[0]) || {};
    const fallbackPrice = prevRow.price || singleSku.value.price || "";
    const fallbackWeight = prevRow.weight || singleSku.value.weight || "";
    const fallbackQuantity = (prevRow.quantity !== undefined && prevRow.quantity !== "")
      ? prevRow.quantity
      : (singleSku.value.quantity !== undefined && singleSku.value.quantity !== "" ? singleSku.value.quantity : defaultSkuQuantity());

    // 保留原有组合的属性值
    skuTableData.value = newCombinations.map(combination => {
      // 查找匹配的原有组合（排除占位行）
      const existingCombination = Array.isArray(skus) && skus.find(item => {
        if (!item || item._isPlaceholder) return false;
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
          sn: existingCombination.sn || generateSkuCode(),
          quantity: hideSkuQuantity.value
            ? (existingCombination.quantity ?? 0)
            : (existingCombination.quantity || ""),
          cost: existingCombination.cost || "",
          price: existingCombination.price || "",
          weight: existingCombination.weight || ""
        };
      } else {
        // 新组合使用继承值或默认值
        return {
          ...combination,
          id: "",
          sn: generateSkuCode(),
          quantity: fallbackQuantity,
          cost: "",
          price: fallbackPrice,
          weight: fallbackWeight
        };
      }
    });
    assignSkuTableIndex();
  } else {
    skuTableData.value = [];
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
/**
 * 保存/发布商品
 * 包含表单校验、业务逻辑预校验、SKU组装及接口提交全流程
 */
function save() {
  // 防重复提交：若当前已有请求处于 loading 状态，则直接拦截
  if (submitLoading.value) return;

  // 1. 规格项与规格值查重校验
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

  // 2. 检查分类下的必填商品参数是否均已填写
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

  // 3. 执行 el-form 表单校验（在校验未通过时不开启 loading，直接引导用户修改）
  baseInfoFormRef.value.validate(async (valid, fields) => {
    try {
      if (!valid) {
        jumpToTab(tabForInvalidFields(fields));
        Message.error("还有必填项未做处理，请检查表单");
        return;
      }

      baseInfoForm.value.salesModel = "RETAIL";

      // 判断是否是复制商品（复制商品时不复用原有 goodsId，重新生成）
      if (!route.query.copyId) {
        baseInfoForm.value.goodsId = goodsId;
      }

      // 同步富文本编辑器内容至表单对象
      syncIntroFromEditors();
      let submit = JSON.parse(JSON.stringify(baseInfoForm.value));
      submit.salesModel = "RETAIL";

      // 5. 商品主图相册校验
      if (
        submit.goodsGalleryFiles &&
        submit.goodsGalleryFiles.length <= 0
      ) {
        jumpToTab("specs");
        Message.error("请上传商品图片");
        return;
      }
      const invalidGalleryFiles = (submit.goodsGalleryFiles || []).filter((url) =>
        invalidGoodsGalleryFiles.value.includes(url)
      );
      if (invalidGalleryFiles.length > 0) {
        jumpToTab("specs");
        Message.error("存在已失效的商品主图，请删除后重新上传");
        return;
      }

      // 兜底运费模板与品牌默认值
      if (submit.templateId === "") submit.templateId = 0;
      if (submit.brandId === "" || submit.brandId == null) submit.brandId = 0;

      // 6. 电子卡券商品特殊参数处理
      if (isECouponGoods.value) {
        submit.templateId = 0;
        submit.salesModel = "RETAIL";
      }

      // 7. 预约服务商品特殊参数与预约时段规则校验
      if (isAppointmentGoods.value) {
        submit.templateId = 0;
        submit.salesModel = "RETAIL";
        if (!appointmentPanel.value?.validateRules()) {
          jumpToTab("appointment");
          return;
        }
        if (!appointmentPanel.value?.validateDivision()) {
          jumpToTab("appointment");
          return;
        }
        Object.assign(submit, appointmentPanel.value.buildSubmitPayload());
      }
      let flag = false;
      let paramValue = "";

      if (flag) {
        Message.error(paramValue + " 参数值不能为空");
        return;
      }

      // 8. 商品单位有效性检查
      if (goodsUnitList.value && !goodsUnitList.value.find(i => i === baseInfoForm.value.goodsUnit)) {
        submit.goodsUnit = "";
        Message.error("商品单位不存在");
        jumpToTab("basic");
        return;
      }

      // 9. 组装 SKU 列表数据
      submit.skuList = [];

      if (!isMultiSpec.value) {
        // --- 单规格模式校验与组装 ---
        const p = singleSku.value.price;
        if (p === "" || p == null || isNaN(Number(p)) || Number(p) < 0) {
          jumpToTab("price");
          Message.error("请在规格设置中填写商品价格！");
          return;
        }
        if (!isECouponGoods.value && !isAppointmentGoods.value) {
          const q = singleSku.value.quantity;
          if (q === "" || q == null || isNaN(Number(q)) || Number(q) < 0) {
            jumpToTab("price");
            Message.error("请在规格设置中填写商品库存！");
            return;
          }
        }
        if (needsLogistics.value) {
          const w = singleSku.value.weight;
          if (w === "" || w == null || isNaN(Number(w)) || Number(w) < 0) {
            jumpToTab("price");
            Message.error("请在规格设置中填写商品物流重量！");
            return;
          }
        }

        const skuCopy = {
          cost: 1,
          price: Number(singleSku.value.price),
          quantity: resolveSubmitQuantity(singleSku.value),
          sn: singleSku.value.sn || "",
          weight: needsLogistics.value ? Number(singleSku.value.weight || 0) : 0,
          images: (singleSku.value.images && singleSku.value.images.length > 0)
            ? singleSku.value.images
            : (submit.goodsGalleryFiles || []).slice(0, 1)
        };
        if (singleSku.value.id) {
          skuCopy.id = singleSku.value.id;
        }
        if (isAppointmentGoods.value && appointmentPanel.value) {
          skuCopy.slotCapacities = appointmentPanel.value.buildSkuSlotCapacities(singleSku.value);
        }
        submit.skuList.push(skuCopy);
      } else {
        // --- 多规格模式校验与组装 ---
        if (skuTableData.value.length === 0 || skuTableData.value[0]._isPlaceholder) {
          jumpToTab("price");
          Message.error("已开启多规格，请至少添加一个有效的规格值！");
          return;
        }
        let skuInfoNames = skuInfo.value.map((n) => n.name);
        let containEmptyImage = false;
        skuTableData.value.map((sku) => {
          let skuCopy = {
            cost: 1,
            price: sku.price,
            quantity: resolveSubmitQuantity(sku),
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
                skuCopy.images = item.images;
              }
            });
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

        // 规格图片完整性校验
        if (containEmptyImage) {
          Message.error("开启规格图片，所有规格图片不能为空！");
          jumpToTab("price");
          return;
        }

        // 前置校验：多规格下必须有至少一条 SKU 数据
        if (!submit.skuList || submit.skuList.length === 0) {
          jumpToTab("price");
          Message.error("已开启多规格，请至少添加一个有效的规格值！");
          return;
        }

        // 检查 SKU 价格有效性
        for (let i = 0; i < submit.skuList.length; i++) {
          const skuPrice = submit.skuList[i].price;
          if (skuPrice === "" || skuPrice == null || isNaN(Number(skuPrice)) || Number(skuPrice) < 0) {
            jumpToTab("price");
            Message.error(`请在价格库存中填写第 ${i + 1} 行规格的商品价格！`);
            return;
          }
        }
      }

      // 取第一个 SKU 或者价格最低的 SKU 的值赋给商品（SPU）价格
      const validPrices = submit.skuList
        .map((s) => Number(s.price))
        .filter((p) => !isNaN(p) && p >= 0);
      if (validPrices.length > 0) {
        submit.price = Math.min(...validPrices);
      } else if (submit.skuList[0] && submit.skuList[0].price !== undefined && !isNaN(Number(submit.skuList[0].price))) {
        submit.price = Number(submit.skuList[0].price);
      } else {
        submit.price = 0;
      }
      baseInfoForm.value.price = submit.price;

      if (submit.goodsGalleryFiles && submit.goodsGalleryFiles.length > 0) {
        submit.goodsGalleryList = submit.goodsGalleryFiles.map(
          (i) => i
        );
      }
      /** 参数校验 **/
      /* Object.keys(submit.goodsParamsList).forEach((item) => {
      });*/
      // 定时上架：先校验时间，保存时按下架处理，保存成功后再调用定时上架接口
      const scheduledUpper = submit.release === 2;
      const scheduledUpperTime = submit.scheduledUpperTime;
      delete submit.scheduledUpperTime;
      if (scheduledUpper) {
        if (!scheduledUpperTime) {
          Message.error("请选择定时上架时间！");
          return;
        }
        if (new Date(scheduledUpperTime.replace(/-/g, "/")).getTime() <= Date.now()) {
          Message.error("定时上架时间必须晚于当前时间！");
          return;
        }
      }
      submit.release = submit.release === 1;
      submit.recommend
        ? (submit.recommend = true)
        : (submit.recommend = false);

      // 11. 前端所有校验均通过，正式发起网络请求并激活保存按钮 loading
      submitLoading.value = true;
      try {
        // 编辑商品；新建/复制成功后重试也走编辑，避免重复创建
        const editId = goodsId && !route.query.copyId ? goodsId : createdGoodsId;
        if (editId) {
          // 编辑商品
          const res = await API_GOODS.editGoods(editId, submit);
          if (res && res.success) {
            if (scheduledUpper) {
              await scheduleUpper(editId, scheduledUpperTime);
            }
            router.go(-1);
          }
        } else {
          // 新增商品 / 复制商品
          const res = await API_GOODS.createGoods(submit);
          if (res && res.success) {
            // 记录新商品ID：后续定时设置失败重试时走编辑而不是重复创建
            if (res.result) {
              createdGoodsId = res.result;
            }
            if (scheduledUpper && res.result) {
              await scheduleUpper(res.result, scheduledUpperTime);
            }
            proxy.$parent.activestep = 2;
            window.scrollTo(0, 0);
          }
        }
      } catch (err) {
        // 请求失败时，Axios 响应拦截器已统一弹出错误提示（如业务校验 400 报错）
        console.error("保存商品请求异常:", err);
      } finally {
        // 关键兜底：无论成功、业务失败、网络超时还是接口报错，确保复位 submitLoading，防止按钮卡死
        submitLoading.value = false;
      }
    } catch (e) {
      // 捕获表单数据组装阶段可能的意外异常，确保 loading 状态准确复位
      submitLoading.value = false;
      console.error("表单处理异常:", e);
    }
  });
}
function disabledPastDate(date) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return date.getTime() < today.getTime();
}
// 设置定时上架；失败时给出明确提示（商品已保存，仅定时未生效），不阻断保存流程
async function scheduleUpper(id, time) {
  try {
    await API_GOODS.scheduleGoodsMarket({
      goodsIds: [id],
      status: "UPPER",
      triggerTime: time,
      reason: "商家定时上架",
    });
  } catch (e) {
    Message.warning("商品已保存，但定时上架设置失败，请在商品编辑页重新设置");
  }
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

/** 生成SPU编码：P + yyyyMMddHHmmss + 2位随机数（与后端 GoodsCodeGenerator 规则一致） */
function generateSpuCode() {
  const d = new Date();
  const p = (n) => String(n).padStart(2, "0");
  const ts = `${d.getFullYear()}${p(d.getMonth() + 1)}${p(d.getDate())}${p(d.getHours())}${p(d.getMinutes())}${p(d.getSeconds())}`;
  return "P" + ts + p(Math.floor(Math.random() * 100));
}

/** 生成SKU编码：S + yyyyMMddHHmmss + 4位随机数（与后端 GoodsCodeGenerator 规则一致） */
function generateSkuCode() {
  const d = new Date();
  const p = (n) => String(n).padStart(2, "0");
  const ts = `${d.getFullYear()}${p(d.getMonth() + 1)}${p(d.getDate())}${p(d.getHours())}${p(d.getMinutes())}${p(d.getSeconds())}`;
  return "S" + ts + String(Math.floor(Math.random() * 10000)).padStart(4, "0");
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
    // 进入发布页即生成SPU编码，随表单提交
    baseInfoForm.value.spuSn = generateSpuCode();
    // 单规格SKU编码同步生成
    singleSku.value.sn = generateSkuCode();

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
  overflow: visible;
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
  top: -10px;
  z-index: 100;
  display: flex;
  align-items: center;
  height: 56px;
  margin: -10px -10px 12px -10px;
  padding: 0 16px;
  background: #fff;
  border-radius: 0;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
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

.goods-field {
  width: 260px;
}

/* 图文信息 - 卡片式上传样式 */
.media-form-item {
  margin-bottom: 22px;

  :deep(.el-form-item__label) {
    font-size: 14px;
    color: #303133;
    padding-top: 6px;
    font-weight: 500;
  }

  :deep(.el-form-item__content) {
    line-height: normal;
  }
}

.media-upload-wrapper {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}

.media-list-container {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 12px;
  margin: 0;
  padding: 0;
}

.media-draggable-list {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 12px;
  margin: 0;
  padding: 0;

  &:empty {
    display: none !important;
  }
}

/* 虚线加号卡片 */
.media-upload-card {
  width: 98px;
  height: 98px;
  border: 1px dashed #dcdfe6;
  border-radius: 4px;
  background-color: #fafafa;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-sizing: border-box;
  transition: all 0.25s ease;

  &:hover {
    border-color: var(--el-color-primary, #409eff);
    background-color: #f5f9ff;

    .uploader-plus-icon {
      color: var(--el-color-primary, #409eff);
    }
  }

  .uploader-plus-icon {
    font-size: 32px;
    color: #8c8c8c;
    transition: color 0.25s ease;
  }

  &.is-loading {
    cursor: not-allowed;
    background-color: #f5f7fa;
  }
}

.media-uploader-action {
  display: inline-block;
  line-height: 0;
  margin: 0;
  padding: 0;

  :deep(.el-upload) {
    display: block;
    line-height: 0;
    margin: 0;
    padding: 0;
  }
}

/* 已上传卡片（图片 / 视频） */
.media-card-item {
  position: relative;
  width: 98px;
  height: 98px;
  border: 1px solid #e4e7ed;
  border-radius: 4px;
  background-color: #fff;
  overflow: hidden;
  box-sizing: border-box;
  cursor: grab;
  user-select: none;

  &:active {
    cursor: grabbing;
  }

  img,
  .card-video-thumb {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
  }

  .media-card-badge {
    position: absolute;
    left: 0;
    top: 0;
    z-index: 2;
    padding: 0 6px;
    height: 18px;
    line-height: 18px;
    background: rgba(64, 158, 255, 0.9);
    color: #fff;
    font-size: 11px;
    border-bottom-right-radius: 4px;
    pointer-events: none;
  }

  .media-card-cover {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: 3;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 14px;
    background: rgba(0, 0, 0, 0.6);
    opacity: 0;
    transition: opacity 0.2s ease;

    .cover-icon {
      color: #fff;
      font-size: 18px;
      cursor: pointer;
      transition: all 0.2s ease;

      &:hover {
        transform: scale(1.2);
        color: var(--el-color-primary, #409eff);
      }

      &[title="删除"]:hover {
        color: #f56c6c;
      }
    }
  }

  &:hover .media-card-cover {
    opacity: 1;
  }

  &.video-card-item {
    cursor: default;
  }
}

/* 下方提示文字 */
.media-uploader-tip {
  display: flex;
  align-items: center;
  gap: 5px;
  margin-top: 8px;
  font-size: 12px;
  color: #8c8c8c;
  line-height: 18px;

  .tip-icon {
    font-size: 13px;
    color: #8c8c8c;
    flex-shrink: 0;
  }
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

/* 单/多规格切换与单规格表格样式 */
.spec-mode-switch-bar {
  display: flex;
  align-items: center;
  margin-bottom: 16px;
  padding: 8px 16px;
  background: #f8f9fb;
  border-radius: 4px;
  border: 1px solid #ebeef5;

  .spec-checkbox-label {
    font-size: 14px;
    font-weight: 600;
    color: #303133;
  }
}

.single-spec-table-wrapper {
  width: 100%;
  margin-bottom: 16px;
}

.spec-sku-image-cell {
  display: flex;
  align-items: center;
  justify-content: center;
}

.spec-sku-image-preview {
  position: relative;
  width: 52px;
  height: 52px;
  border-radius: 4px;
  overflow: hidden;
  border: 1px solid #dcdfe6;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .spec-sku-image-mask {
    position: absolute;
    inset: 0;
    background: rgba(0, 0, 0, 0.55);
    display: flex;
    align-items: center;
    justify-content: center;
    opacity: 0;
    transition: opacity 0.2s;
    color: #fff;
    cursor: pointer;
    font-size: 16px;

    &:hover {
      color: #f56c6c;
    }
  }

  &:hover .spec-sku-image-mask {
    opacity: 1;
  }
}

.spec-sku-image-uploader {
  width: 52px;
  height: 52px;
  border: 1px dashed #dcdfe6;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: #909399;
  background: #fafafa;
  transition: all 0.2s;

  &:hover {
    border-color: var(--el-color-primary, #409eff);
    color: var(--el-color-primary, #409eff);
    background: #f5f9ff;
  }
}

.sku-card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;

  .sku-card-title {
    font-weight: 600;
    color: #303133;
  }

  .sku-card-tip {
    font-size: 12px;
    color: #909399;
  }
}

/* 多规格构建器全新样式（对齐规范布局） */
.multi-spec-container {
  width: 100%;
  margin-top: 12px;

  .spec-builder-list {
    margin-bottom: 20px;
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .spec-builder-row {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 16px;
    padding: 12px 16px;
    background: #fbfbfb;
    border: 1px solid #ebeef5;
    border-radius: 6px;
  }

  .spec-builder-left {
    display: inline-flex;
    align-items: center;
    gap: 8px;

    .spec-star {
      color: #f56c6c;
      font-weight: bold;
      font-size: 14px;
    }

    .spec-name-input {
      width: 140px;
    }

    .spec-del-link {
      font-size: 13px;
      padding: 0 4px;
    }

    .spec-del-disabled {
      font-size: 13px;
      color: #c0c4cc;
      cursor: not-allowed;
      padding: 0 4px;
    }
  }

  .spec-builder-right {
    display: inline-flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 10px;
    flex: 1;

    .spec-val-tag-wrap {
      display: inline-flex;
      align-items: center;
      gap: 6px;
    }

    .spec-val-tag {
      font-size: 13px;
      height: 32px;
      line-height: 30px;
      border-radius: 4px;
    }

    .spec-val-img-box {
      width: 32px;
      height: 32px;

      .spec-val-img-preview {
        position: relative;
        width: 32px;
        height: 32px;
        border-radius: 4px;
        overflow: hidden;
        border: 1px solid #dcdfe6;

        img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .spec-val-img-mask {
          position: absolute;
          inset: 0;
          background: rgba(0, 0, 0, 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          color: #fff;
          opacity: 0;
          cursor: pointer;
          font-size: 14px;
          transition: opacity 0.2s;

          &:hover {
            color: #f56c6c;
          }
        }

        &:hover .spec-val-img-mask {
          opacity: 1;
        }
      }

      .spec-val-img-uploader {
        width: 32px;
        height: 32px;
        border: 1px dashed #c0c4cc;
        border-radius: 4px;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        color: #909399;
        font-size: 14px;
        background: #fff;
        transition: all 0.2s;

        &:hover {
          border-color: var(--el-color-primary, #409eff);
          color: var(--el-color-primary, #409eff);
        }
      }
    }

    .spec-val-input-group {
      display: inline-flex;
      align-items: center;
      gap: 6px;

      .spec-val-input {
        width: 140px;
      }

      .spec-val-add-btn {
        height: 32px;
      }
    }

    .spec-image-checkbox {
      margin-left: 8px;
    }
  }

  .spec-add-btn-row {
    display: flex;
    align-items: center;

    .add-spec-item-btn {
      border-style: dashed;
      color: var(--el-color-primary, #409eff);
      border-color: var(--el-color-primary, #409eff);
      background: #fdfdfd;

      &:hover {
        background: #ecf5ff;
      }
    }
  }

  .multi-spec-table-section {
    margin-top: 16px;

    .spec-detail-hd {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 12px;

      .spec-detail-title {
        font-size: 14px;
        font-weight: 600;
        color: #303133;
      }

      .spec-batch-fill-bar {
        display: inline-flex;
        align-items: center;
        flex-wrap: wrap;
        gap: 10px;
        background: #f8f9fa;
        padding: 6px 12px;
        border-radius: 6px;
        border: 1px solid #ebeef5;

        .batch-title {
          font-size: 13px;
          font-weight: 500;
          color: #606266;
          white-space: nowrap;
        }

        .batch-fill-input {
          width: 140px;

          :deep(.el-input__inner) {
            text-align: left;
          }

          :deep(.el-input-group__append) {
            padding: 0 10px;
            background-color: #f5f7fa;
            color: #909399;
            font-size: 12px;
          }
        }

        .batch-apply-btn {
          margin-left: 4px;
        }
      }
    }
  }
}


</style>
