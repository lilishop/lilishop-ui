<template>
  <div class="person-msg">
    <el-form ref="thirdForm" :model="form" :rules="rules" label-width="140px">
      <h4>基础信息</h4>
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
            ref="uploadLogo"
            :show-file-list="false"
            :on-success="handleSuccess"
            accept=".jpg,.jpeg,.png,.gif"
            :before-upload="beforeUpload"
            :on-error="uploadErr"
            :disabled="form.storeLogo.length >= 1"
            :action="action"
            :headers="accessToken"
          >
            <el-button type="info" :loading="uploadLoading" :disabled="form.storeLogo.length >= 1">上传logo</el-button>
          </el-upload>
          <div class="describe">请压缩图片在2M以内，格式为gif，jpg，png，仅可上传1张</div>
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
          placeholder="请选择"
          style="width: 300px"
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
        <span>{{ form.storeAddressPath || '暂无地址' }}</span>
        <el-button type="default" style="margin-left: 10px;" @click="$refs.map.open()">选择</el-button>
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
        <el-button @click="$emit('change', 1)">返回</el-button>
        <el-button type="primary" :loading="loading" @click="next"
          >提交平台审核</el-button
        >
      </el-form-item>
    </el-form>
    <el-dialog title="View Image" v-model="visible">
      <img :src="previewPicture" v-if="visible" style="width: 100%" />
    </el-dialog>
    <multipleMap ref="map" @callback="getAddress" />
  </div>
</template>
<script>
import { Message } from "@/utils/message";
import { Delete, View } from '@element-plus/icons-vue';
import { applyThird } from '@/api/shopentry';
import { getCategory } from '@/api/goods';

import storage from '@/plugins/storage';
import { buyerUrl } from '@/plugins/request.js';


import multipleMap from "@/components/map/multiple-map";


export default {
  emits: ['change'],
  props: {
    content: {
      default: {},
      type: Object
    }
  },
  components: { multipleMap, View, Delete },
  data () {
    return {
      loading: false, // 加载状态
      uploadLoading: false, // 上传加载状态
      action: buyerUrl + '/buyer/common/upload/file', // 上传地址
      accessToken: {}, // 验证token
      previewPicture: '', // 预览图片

      visible: false, // 图片预览
      form: { // 表单数据
        storeLogo: [],
        goodsManagementCategory: [],
      },
      rules: { // 验证规则
        goodsManagementCategory: [
          { required: true, message: '请选择店铺经营类目' }
        ],
        storeName: [{ required: true, message: '请填写店铺名称' }],
        storeLogo: [{ required: true, message: '请上传店铺logo' }],
        storeDesc: [{ required: true, message: '请填写店铺简介' }],
        storeCenter: [{ required: true, message: '请选择店铺位置' }],
        storeAddressIdPath: [{ required: true, message: '请选择店铺位置' }],
        storeAddressDetail: [{ required: true, message: '请输入店铺详细地址' }]
      },
      categoryList: [] // 分类数据
    };
  },
  methods: {
    // 下一步
    next () {
      this.$refs.thirdForm.validate((valid) => {
        if (valid) {
          this.loading = true;
          let params = JSON.parse(JSON.stringify(this.form));
          params.storeLogo = this.form.storeLogo.toString();
          params.goodsManagementCategory = this.form.goodsManagementCategory.toString();
          applyThird(params)
            .then((res) => {
              this.loading = false;
              if (res.success) this.$emit('change', 3);
            })
            .catch(() => {
              this.loading = false;
            });
        } else {
          console.log('error');
        }
      });
    },
    // 上传之前
    beforeUpload (file) {
      this.uploadLoading = true;
      if (this.form.storeLogo.length >= 1) {
        Message.warning('最多上传一张图片')
        this.uploadLoading = false;
        return false;
      }
      return this.validateUploadFile(file);
    },
    validateUploadFile (file) {
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
      const isAllowedType = allowedTypes.includes(file.type);
      const isLt2M = file.size / 1024 / 1024 < 2;
      if (!isAllowedType) {
        this.uploadLoading = false;
        Message.warning('上传文件格式不正确');
        return false;
      }
      if (!isLt2M) {
        this.uploadLoading = false;
        Message.warning('文件大小不能超过2M');
        return false;
      }
      return true;
    },
    // 上传成功回调
    handleSuccess (res, file) {
      this.uploadLoading = false;
      this.form.storeLogo = [res.result];
    },
    // 上传失败
    uploadErr () {
      this.uploadLoading = false;
    },
    // 查看图片
    handleView (item) {
      this.previewPicture = item;
      this.visible = true;
    },
    // 删除图片
    handleRemove (index, listName) {
      this.form[listName].splice(index, 1);
    },
    // 选择坐标回调
    getAddress (val) {
      if(val.type === 'select'){
        const paths = val.data.map(item => item.name).join(',')
        const ids = val.data.map(item => item.id).join(',')
        this.form["storeAddressPath"] = paths;
        this.form["storeAddressIdPath"] = ids;
        this.form.storeCenter = val.data[val.data.length - 1].center
      }else{
        this.form["storeAddressPath"] = val.data.addr;
        this.form["storeAddressIdPath"] = val.data.addrId;
        
          this.form['storeCenter'] = val.data.position.lng + ',' + val.data.position.lat
        ;
      }
    },
    // 获取商品分类
    getCategoryList () {
      getCategory(0).then((res) => {
        if (res.success) {
          this.categoryList = res.result || [];
          this.syncCategorySelection();
        }
      });
    },
    normalizeCategoryId (id) {
      return id == null ? '' : String(id);
    },
    syncCategorySelection () {
      if (!Array.isArray(this.form.goodsManagementCategory)) {
        this.form.goodsManagementCategory = [];
        return;
      }
      this.form.goodsManagementCategory = this.form.goodsManagementCategory.map(
        (id) => this.normalizeCategoryId(id)
      );
    },
  },
  mounted () {
    this.accessToken.accessToken = storage.getItem('accessToken');
    if (this.content && Object.keys(this.content).length) {
      this.form = JSON.parse(JSON.stringify(this.content));
      this.form.storeLogo = this.content.storeLogo
        ? String(this.content.storeLogo).split(',').filter(Boolean)
        : [];
      this.form.goodsManagementCategory = this.content.goodsManagementCategory
        ? String(this.content.goodsManagementCategory).split(',').filter(Boolean)
        : [];
    }
    this.getCategoryList();
  }
};
</script>
<style lang="scss" scoped>
h4 {
  margin-bottom: 10px;
  padding: 0 10px;
  border: 1px solid #ddd;
  background-color: #f8f8f8;
  font-weight: bold;
  color: #333;
  font-size: 14px;
  line-height: 40px;
  text-align: left;
}
.el-input {
  width: 300px;
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
