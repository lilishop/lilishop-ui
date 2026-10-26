<template>
  <div class="person-msg">
    <el-form ref="thirdFormRef" :model="form" :rules="rules" label-width="140px" scroll-to-error>
      <div class="section-title">店铺信息</div>
      <el-form-item prop="storeName" label="店铺名称">
        <el-input
          type="text"
          v-model="form.storeName"
          placeholder="请填写店铺名称"
        />
      </el-form-item>

      <el-form-item prop="storeLogo" label="店铺logo">
        <div class="upload-wrap">
          <el-upload
            v-if="form.storeLogo.length < 1"
            :show-file-list="false"
            :on-success="handleSuccess"
            accept=".jpg,.jpeg,.png,.gif"
            :before-upload="beforeUpload"
            :on-error="uploadErr"
            :action="action"
            :headers="accessToken"
          >
            <div class="upload-box">
              <el-icon v-if="uploadLoading" class="is-loading"><Loading /></el-icon>
              <el-icon v-else><Plus /></el-icon>
              <span>上传logo</span>
            </div>
          </el-upload>
          <div class="describe">请压缩图片在2M以内，格式为gif、jpg、png，仅可上传1张</div>
          <div class="img-list-wrap">
            <div
              class="img-list"
              v-for="(item, index) in form.storeLogo"
              :key="index"
            >
              <img :src="item" alt="" />
              <div class="cover">
                <el-icon @click="handleView(item)"><View /></el-icon>
                <el-icon @click="handleRemove(index, 'storeLogo')"><Delete /></el-icon>
              </div>
            </div>
          </div>
        </div>
      </el-form-item>
      <el-form-item prop="goodsManagementCategory" label="店铺经营类目">
        <el-select
          v-model="form.goodsManagementCategory"
          multiple
          placeholder="请选择店铺经营类目"
          style="width: 360px"
        >
          <el-option
            v-for="item in categoryList"
            :key="item.id"
            :label="item.name"
            :value="normalizeCategoryId(item.id)"
          />
        </el-select>
      </el-form-item>

      <el-form-item prop="storeAddressIdPath" label="店铺所在地">
        <div class="address-select" @click="openMap">
          <el-icon class="addr-icon"><Location /></el-icon>
          <span class="addr-text" :class="{ placeholder: !form.storeAddressPath }">
            {{ form.storeAddressPath || '请选择店铺所在地' }}
          </span>
          <span class="addr-action">{{ form.storeAddressPath ? '重新选择' : '选择' }}</span>
        </div>
      </el-form-item>
      <el-form-item prop="storeAddressDetail" label="店铺详细地址">
        <el-input
          type="text"
          v-model="form.storeAddressDetail"
          placeholder="请填写店铺详细地址"
        />
      </el-form-item>
      <el-form-item prop="storeDesc" label="店铺简介">
        <el-input
          type="textarea"
          v-model="form.storeDesc"
          maxlength="200"
          show-word-limit
          :rows="4"
          placeholder="请输入店铺简介"
        />
      </el-form-item>

      <el-form-item>
        <div class="form-actions">
          <el-button size="large" @click="$emit('change', 1)">上一步</el-button>
          <el-button type="primary" size="large" :loading="loading" @click="next"
            >提交平台审核</el-button
          >
        </div>
      </el-form-item>
    </el-form>
    <el-dialog title="图片预览" v-model="visible">
      <img :src="previewPicture" v-if="visible" style="width: 100%" />
    </el-dialog>
    <multipleMap ref="map" @callback="getAddress" />
  </div>
</template>
<script setup>
import { onBeforeUnmount, onMounted, reactive, ref } from "vue";
import { Message } from "@/utils/message";
import { Delete, Loading, Location, Plus, View } from '@element-plus/icons-vue';
import { applyThird } from '@/api/shopentry';
import { getCategory } from '@/api/goods';

import storage from '@/plugins/storage';
import { buyerUrl } from '@/plugins/request.js';


import multipleMap from "@/components/map/multiple-map";

const THIRD_APPLY_DRAFT_KEY = 'shopEntryThirdDraft';

const emit = defineEmits(['change']);

const props = defineProps({
  content: {
    default: () => ({}),
    type: Object
  }
});

const thirdFormRef = ref(null);
const map = ref(null);

const loading = ref(false); // 加载状态
const uploadLoading = ref(false); // 上传加载状态
const action = buyerUrl + '/buyer/common/upload/file'; // 上传地址
const accessToken = reactive({}); // 验证token
const previewPicture = ref(''); // 预览图片

const visible = ref(false); // 图片预览
const form = ref({ // 表单数据
  storeLogo: [],
  goodsManagementCategory: [],
  storeName: "",
  storeAddressDetail: "",
  storeDesc: "",
  storeAddressIdPath: "",
  storeAddressPath: "",
  storeCenter: "",
});
const rules = { // 验证规则
  goodsManagementCategory: [
    { required: true, message: '请选择店铺经营类目' }
  ],
  storeName: [{ required: true, message: '请填写店铺名称' }],
  storeLogo: [{ required: true, message: '请上传店铺logo' }],
  storeDesc: [{ required: true, message: '请填写店铺简介' }],
  storeCenter: [{ required: true, message: '请选择店铺位置' }],
  storeAddressIdPath: [{ required: true, message: '请选择店铺位置' }],
  storeAddressDetail: [{ required: true, message: '请输入店铺详细地址' }]
};
const categoryList = ref([]); // 分类数据

function openMap() {
  map.value?.open();
}

// 下一步
function next () {
  thirdFormRef.value.validate((valid) => {
    if (valid) {
      loading.value = true;
      let params = JSON.parse(JSON.stringify(form.value));
      params.storeLogo = form.value.storeLogo.toString();
      params.goodsManagementCategory = form.value.goodsManagementCategory.toString();
      applyThird(params)
        .then((res) => {
          loading.value = false;
          if (res.success) {
            sessionStorage.removeItem(THIRD_APPLY_DRAFT_KEY);
            emit('change', 3);
          }
        })
        .catch(() => {
          loading.value = false;
        });
    }
  });
}
// 上传之前
function beforeUpload (file) {
  uploadLoading.value = true;
  if (form.value.storeLogo.length >= 1) {
    Message.warning('最多上传一张图片')
    uploadLoading.value = false;
    return false;
  }
  return validateUploadFile(file);
}
function validateUploadFile (file) {
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
  const isAllowedType = allowedTypes.includes(file.type);
  const isLt2M = file.size / 1024 / 1024 < 2;
  if (!isAllowedType) {
    uploadLoading.value = false;
    Message.warning('上传文件格式不正确');
    return false;
  }
  if (!isLt2M) {
    uploadLoading.value = false;
    Message.warning('文件大小不能超过2M');
    return false;
  }
  return true;
}
// 上传成功回调（el-upload 只认 HTTP 状态码，业务失败 success:false 也会进这里，需要判断）
function handleSuccess (res, file) {
  uploadLoading.value = false;
  if (res && res.success && res.result) {
    form.value.storeLogo = [res.result];
  } else {
    Message.error(res && res.message ? res.message : '上传失败，请重试');
  }
}
// 上传失败（非 2xx：err.message 通常是响应体字符串，尝试解析出服务端提示）
function uploadErr (err) {
  uploadLoading.value = false;
  let msg = '上传失败，请重试';
  try {
    const body = JSON.parse(err && err.message);
    if (body && body.message) msg = body.message;
  } catch (e) { /* 非 JSON 响应，用默认提示 */ }
  Message.error(msg);
}
// 查看图片
function handleView (item) {
  previewPicture.value = item;
  visible.value = true;
}
// 删除图片
function handleRemove (index, listName) {
  form.value[listName].splice(index, 1);
}
// 选择坐标回调
function getAddress (val) {
  if(val.type === 'select'){
    const paths = val.data.map(item => item.name).join(',')
    const ids = val.data.map(item => item.id).join(',')
    form.value["storeAddressPath"] = paths;
    form.value["storeAddressIdPath"] = ids;
    form.value.storeCenter = val.data[val.data.length - 1].center
  }else{
    form.value["storeAddressPath"] = val.data.addr;
    form.value["storeAddressIdPath"] = val.data.addrId;

      form.value['storeCenter'] = val.data.position.lng + ',' + val.data.position.lat
    ;
  }
}
// 获取商品分类
function getCategoryList () {
  getCategory(0).then((res) => {
    if (res.success) {
      categoryList.value = res.result || [];
      syncCategorySelection();
    }
  });
}
function normalizeCategoryId (id) {
  return id == null ? '' : String(id);
}
function syncCategorySelection () {
  if (!Array.isArray(form.value.goodsManagementCategory)) {
    form.value.goodsManagementCategory = [];
    return;
  }
  form.value.goodsManagementCategory = form.value.goodsManagementCategory.map(
    (id) => normalizeCategoryId(id)
  );
}
function createEmptyForm () {
  return {
    storeLogo: [],
    goodsManagementCategory: [],
    storeName: "",
    storeAddressDetail: "",
    storeDesc: "",
    storeAddressIdPath: "",
    storeAddressPath: "",
    storeCenter: "",
  };
}
function initFormFromContent (content) {
  const src = content && Object.keys(content).length
    ? JSON.parse(JSON.stringify(content))
    : {};
  form.value = {
    ...createEmptyForm(),
    ...src,
  };
  form.value.storeLogo = src.storeLogo
    ? String(src.storeLogo).split(",").filter(Boolean)
    : [];
  form.value.goodsManagementCategory = src.goodsManagementCategory
    ? String(src.goodsManagementCategory).split(",").filter(Boolean)
    : [];
  ["storeName", "storeAddressDetail", "storeDesc", "storeAddressIdPath", "storeAddressPath", "storeCenter"].forEach((key) => {
    if (form.value[key] == null) form.value[key] = "";
  });
}
function restoreDraft () {
  const draft = sessionStorage.getItem(THIRD_APPLY_DRAFT_KEY);
  if (!draft) return;
  try {
    const parsed = JSON.parse(draft);
    form.value = {
      ...createEmptyForm(),
      ...parsed,
      storeLogo: Array.isArray(parsed.storeLogo) ? parsed.storeLogo : [],
      goodsManagementCategory: Array.isArray(parsed.goodsManagementCategory)
        ? parsed.goodsManagementCategory
        : [],
    };
  } catch (e) {
    sessionStorage.removeItem(THIRD_APPLY_DRAFT_KEY);
  }
}
function saveDraft () {
  sessionStorage.setItem(THIRD_APPLY_DRAFT_KEY, JSON.stringify(form.value));
}

if (Object.keys(props.content).length) {
  initFormFromContent(props.content);
} else {
  restoreDraft();
}

onMounted(() => {
  accessToken.accessToken = storage.getItem('accessToken');
  getCategoryList();
});

onBeforeUnmount(() => {
  saveDraft();
});
</script>
<style lang="scss" scoped>
.section-title {
  display: flex;
  align-items: center;
  margin: 24px 0 18px;
  font-size: 16px;
  font-weight: 600;
  color: #303133;

  &::before {
    content: '';
    width: 4px;
    height: 18px;
    border-radius: 2px;
    background: $theme_color;
    margin-right: 8px;
  }
}
.el-input {
  width: 360px;
}
.el-textarea {
  width: 640px;
  max-width: 100%;
}
.address-select {
  display: flex;
  align-items: center;
  width: 360px;
  height: 32px;
  padding: 0 12px;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  cursor: pointer;
  transition: border-color 0.2s;
  background: #fff;

  &:hover {
    border-color: $theme_color;
  }

  .addr-icon {
    color: #909399;
    margin-right: 6px;
    flex-shrink: 0;
  }

  .addr-text {
    flex: 1;
    color: #303133;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;

    &.placeholder {
      color: #a8abb2;
    }
  }

  .addr-action {
    color: $theme_color;
    margin-left: 8px;
    flex-shrink: 0;
  }
}
.form-actions {
  margin-top: 8px;

  .el-button {
    min-width: 120px;
  }

  .el-button--primary {
    min-width: 240px;
  }
}
.img-list-wrap {
  display: flex;
  flex-wrap: wrap;
  align-items: flex-start;
  gap: 10px;
  margin-top: 10px;
}

.img-list {
  display: block;
  flex-shrink: 0;
  width: 100px;
  height: 100px;
  position: relative;
  overflow: hidden;
  border: 1px solid #eee;
  border-radius: 8px;
  box-sizing: border-box;
  background-color: #f5f5f5;

  img {
    display: block;
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .cover {
    display: none;
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.6);
    align-items: center;
    justify-content: space-around;
    :deep(.el-icon) {
      color: #fff;
      font-size: 24px;
      cursor: pointer;
    }
  }
  &:hover .cover {
    display: flex;
  }
}

.upload-wrap {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  width: 100%;

  :deep(.el-upload) {
    display: block;
  }

  :deep(.el-upload-list) {
    display: none;
  }
}

.upload-box {
  width: 120px;
  height: 120px;
  border: 1px dashed #c0c4cc;
  border-radius: 8px;
  background: #fafafa;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 6px;
  color: #909399;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.2s;

  .el-icon {
    font-size: 26px;
  }

  &:hover {
    border-color: $theme_color;
    color: $theme_color;
  }
}

.describe {
  display: block;
  width: 100%;
  margin-top: 8px;
  margin-bottom: 0;
  line-height: 1.5;
  font-size: 12px;
  color: #999;
}
</style>
