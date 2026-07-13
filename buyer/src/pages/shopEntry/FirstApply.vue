<template>
  <div class="company-msg">
    <el-form
      ref="firstForm"
      :model="form"
      :rules="rules"
      label-width="140px"
      @submit.prevent
      @keydown.enter.prevent
      @focusout="saveDraft"
    >
      <h4>基础信息</h4>
      <el-form-item prop="companyName" label="公司名称">
        <el-input
          type="text"
          v-model="form.companyName"
          placeholder="请填写公司信息"
        />
      </el-form-item>
      <el-form-item prop="companyAddressIdPath" label="公司所在地">
        <span>{{ form.companyAddressPath || '暂无地址' }}</span>
        <el-button type="default" style="margin-left: 10px;" @click="$refs.map.open()">选择</el-button>
      </el-form-item>
      <el-form-item prop="companyAddress" label="公司详细地址">
        <el-input
          type="text"
          v-model="form.companyAddress"
          placeholder="请填写公司详细信息"
        />
      </el-form-item>
      <el-form-item prop="employeeNum" label="员工总数">
        <el-input
          type="text"
          v-model="form.employeeNum"
          placeholder="请填写公司员工总数"
          ><template #append><span>人</span></template></el-input>
      </el-form-item>
      <el-form-item prop="companyPhone" label="公司电话">
        <el-input
          type="text"
          v-model="form.companyPhone"
          placeholder="请填写公司电话"
          ></el-input>
      </el-form-item>
      <el-form-item prop="registeredCapital" label="注册资金">
        <el-input
          type="text"
          v-model="form.registeredCapital"
          placeholder="请填写注册资金"
          ><template #append><span>万元</span></template></el-input>
      </el-form-item>
      <el-form-item prop="linkName" label="联系人姓名">
        <el-input
          type="text"
          v-model="form.linkName"
          placeholder="请填写联系人姓名"
        />
      </el-form-item>
      <el-form-item prop="linkPhone" label="联系人电话">
        <el-input
          type="text"
          v-model="form.linkPhone"
          placeholder="请填写联系人电话"
        />
      </el-form-item>
      <el-form-item prop="companyEmail" label="电子邮箱">
        <el-input
          type="text"
          v-model="form.companyEmail"
          placeholder="请填写电子邮箱"
        />
      </el-form-item>

      <h4>营业执照信息</h4>
      <el-form-item prop="licenseNum" label="营业执照号">
        <el-input
          type="text"
          v-model="form.licenseNum"
          placeholder="请填写营业执照号"
        />
      </el-form-item>
      <el-form-item prop="scope" label="法定经营范围">
        <el-input
          type="textarea"
          v-model="form.scope"
          maxlength="200"
          show-word-limit
          :rows="4"
          placeholder="请输入营业执照所示经营范围"
        />
      </el-form-item>
      <el-form-item prop="licencePhoto" label="营业执照电子版">
        <div class="upload-wrap">
          <el-upload
            ref="uploadLicence"
            :show-file-list="false"
            :on-success="handleSuccess"
            accept=".jpg,.jpeg,.png,.gif"
            :before-upload="beforeUpload"
            :on-error="uploadErr"
            :disabled="form.licencePhoto.length >= 1"
            :action="action"
            :headers="accessToken"
          >
            <el-button
              type="info"
              :loading="uploadLoading"
              :disabled="form.licencePhoto.length >= 1"
              >证照上传</el-button
            >
          </el-upload>
          <div class="describe">
            请压缩图片在2M以内，格式为gif，jpg，png，并确保文字清晰，以免上传或审核失败，仅可上传1张
          </div>
          <div class="img-list-wrap">
            <div
              class="img-list"
              v-for="(item, index) in form.licencePhoto"
              :key="index"
            >
              <img :src="item" alt="" />
              <div class="cover">
                <el-icon @click="handleView(item)"><View /></el-icon>
                <el-icon @click="handleRemove(index, 'licencePhoto')"><Delete /></el-icon>
              </div>
            </div>
          </div>
        </div>
      </el-form-item>

      <h4>法人信息</h4>
      <el-form-item prop="legalName" label="法人姓名">
        <el-input
          type="text"
          v-model="form.legalName"
          maxlength="20"
          placeholder="请输入法人姓名"
        />
      </el-form-item>
      <el-form-item prop="legalId" label="法人证件号">
        <el-input
          type="text"
          v-model="form.legalId"
          placeholder="请输入法人证件号"
        />
      </el-form-item>
      <el-form-item prop="legalPhoto" label="法人证件电子版">
        <div class="upload-wrap">
          <el-upload
            ref="uploadLegal"
            :show-file-list="false"
            :on-success="handleSuccess1"
            :before-upload="beforeUpload1"
            accept=".jpg,.jpeg,.png,.gif"
            :on-error="uploadErr"
            multiple
            :action="action"
            :headers="accessToken"
          >
            <el-button type="info" :loading="uploadLoading1">证照上传</el-button>
          </el-upload>
          <div class="describe">
            请压缩图片在2M以内，身份证正反面两张照片，确保图片清晰无缺角
          </div>
          <div class="img-list-wrap">
            <div
              class="img-list"
              v-for="(item, index) in form.legalPhoto"
              :key="index"
            >
              <img :src="item" alt="" />
              <div class="cover">
                <el-icon @click="handleView(item)"><View /></el-icon>
                <el-icon @click="handleRemove(index, 'legalPhoto')"><Delete /></el-icon>
              </div>
            </div>
          </div>
        </div>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" :loading="loading" @click="next"
          >填写财务资质信息</el-button
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
import { Message, Notice } from "@/utils/message";
import { Delete, View } from '@element-plus/icons-vue';
import { applyFirst } from '@/api/shopentry';
import * as RegExp from '@/plugins/RegExp.js';
import multipleMap from "@/components/map/multiple-map";
import storage from '@/plugins/storage';
import { buyerUrl } from '@/plugins/request.js';
const FIRST_APPLY_DRAFT_KEY = 'shopEntryFirstDraft';

export default {
  components: { multipleMap, View, Delete },
  emits: ['change'],
  props: {
    content: {
      default: {},
      type: Object
    }
  },
  data () {
    return {
      action: buyerUrl + '/buyer/common/upload/file', // 上传地址
      accessToken: {}, // 验证token
      visible: false, // 预览图片
      loading: false, // 加载状态

      previewPicture: '', // 预览图片url
      form: { // 表单数据
        companyName: '',
        companyAddressIdPath: '',
        companyAddressPath: '',
        companyAddress: '',
        employeeNum: '',
        companyPhone: '',
        registeredCapital: '',
        linkName: '',
        linkPhone: '',
        companyEmail: '',
        licenseNum: '',
        scope: '',
        legalName: '',
        legalId: '',
        legalPhoto: [],
        licencePhoto: []
      },
      rules: { // 验证规则
        companyName: [{ required: true, message: '请填写公司信息' }],
        companyAddressIdPath: [{ required: true, message: '请选择公司所在地' }],
        companyAddress: [{ required: true, message: '请填写公司详细地址' }],
        employeeNum: [
          { required: true, message: '请填写公司员工总数' },
          { pattern: RegExp.integer, message: '只能填写正整数' }
        ],
        registeredCapital: [
          { required: true, message: '请填写公司注册资金' },
          { pattern: RegExp.integer, message: '只能填写正整数' }
        ],
        linkName: [{ required: true, message: '请填写联系人姓名' }],
        linkPhone: [
          { required: true, message: '请填写联系人电话' },
          { pattern: RegExp.mobile, message: '请填写正确的号码' }
        ],
        companyPhone: [
          { required: true, message: '请填写公司电话' },
          { pattern: RegExp.mobile, message: '请填写正确的号码' }
        ],
        companyEmail: [
          { required: true, message: '请填写电子邮箱' },
          { type: 'email', message: '请输入正确的邮箱' }
        ],
        licenseNum: [
          { required: true, message: '请填写营业执照号' },
          { pattern: RegExp.licenseNum, message: '请输入正确的营业执照号' }
        ],
        scope: [{ required: true, message: '请填写营业执照所示经营范围' }],
        legalPhoto: [{ required: true, message: '请上传法人身份证照片' }],
        licencePhoto: [{ required: true, message: '请上传营业执照' }],
        legalName: [{ required: true, message: '请输入法人姓名' }],
        legalId: [
          { required: true, message: '请输入法人证件号' },
          { pattern: RegExp.IDCard, message: '请输入正确的证件号' }
        ]
      },
      uploadLoading1: false, // 上传loading
      uploadLoading: false, // 上传loading
      contentInitialized: false
    };
  },
  methods: {
    // 获取店铺地址
    getAddress(val){
      if(val.type === 'select'){
        const paths = val.data.map(item => item.name).join(',')
        const ids = val.data.map(item => item.id).join(',')
        this.form['companyAddressIdPath'] = ids
        this.form['companyAddressPath'] = paths
      }else{
        this.form['companyAddressIdPath'] = val.data.addrId
        this.form['companyAddressPath'] = val.data.addr
      }
    },

    // 下一步
    next () {
      this.$refs.firstForm.validate((valid) => {
        if (valid) {
          this.loading = true;
          let params = JSON.parse(JSON.stringify(this.form));
          params.legalPhoto = this.form.legalPhoto.toString();
          params.licencePhoto = this.normalizeLicencePhoto(this.form.licencePhoto);
          applyFirst(params)
            .then((res) => {
              this.loading = false;
              if (res.success) {
                sessionStorage.removeItem(FIRST_APPLY_DRAFT_KEY);
                this.$emit('change', 1);
              }
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
      if (this.form.licencePhoto.length >= 1) {
        Message.warning('最多上传一张图片')
        this.uploadLoading = false;
        return false;
      }
      return this.validateUploadFile(file);
    },
    // 上传之前
    beforeUpload1 (file) {
      this.uploadLoading1 = true;
      if (this.form.legalPhoto.length >= 2) {
        Message.warning('最多上传两张图片')
        this.uploadLoading1 = false;
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
        this.uploadLoading1 = false;
        Message.warning('上传文件格式不正确');
        return false;
      }
      if (!isLt2M) {
        this.uploadLoading = false;
        this.uploadLoading1 = false;
        Message.warning('文件大小不能超过2M');
        return false;
      }
      return true;
    },
    // 上传成功回调
    handleSuccess (res, file) {
      this.uploadLoading = false;
      this.form.licencePhoto = [res.result];
    },
    // 上传成功回调
    handleSuccess1 (res, file) {
      this.uploadLoading1 = false;
      this.form.legalPhoto.push(res.result);
    },
    // 上传失败
    uploadErr () {
      this.uploadLoading = false;
      this.uploadLoading1 = false;
    },
    // 上传失败回调
    handleFormatError (file) {
      this.uploadLoading = false;
      this.uploadLoading1 = false;
      Notice.warning({
        title: 'The file format is incorrect',
        desc: '上传文件格式不正确'
      });
    },
    // 上传大小限制
    handleMaxSize (file) {
      this.uploadLoading = false;
      this.uploadLoading1 = false;
      Notice.warning({
        title: 'Exceeding file size limit',
        desc: '文件大小不能超过2M'
      });
    },
    // 图片查看
    handleView (item) {
      this.previewPicture = item;
      this.visible = true;
    },
    // 删除图片
    handleRemove (index, listName) {
      this.form[listName].splice(index, 1);
    },
    normalizeLicencePhoto (value) {
      if (Array.isArray(value)) {
        return value.length ? value[0] : '';
      }
      return value ? String(value).split(',').filter(Boolean)[0] || '' : '';
    },
    initFormFromContent(content) {
      if (!content || !Object.keys(content).length) return;
      this.form = JSON.parse(JSON.stringify(content));
      this.form.legalPhoto = content.legalPhoto
        ? String(content.legalPhoto).split(',').filter(Boolean)
        : [];
      this.form.licencePhoto = content.licencePhoto
        ? String(content.licencePhoto).split(',').filter(Boolean).slice(0, 1)
        : [];
      this.contentInitialized = true;
    },
    restoreDraft() {
      const draft = sessionStorage.getItem(FIRST_APPLY_DRAFT_KEY);
      if (!draft) return;
      try {
        const parsed = JSON.parse(draft);
        this.form = {
          legalPhoto: [],
          licencePhoto: [],
          ...parsed,
        };
        this.form.legalPhoto = Array.isArray(parsed.legalPhoto) ? parsed.legalPhoto : [];
        this.form.licencePhoto = Array.isArray(parsed.licencePhoto)
          ? parsed.licencePhoto.slice(0, 1)
          : [];
      } catch (e) {
        sessionStorage.removeItem(FIRST_APPLY_DRAFT_KEY);
      }
    },
    saveDraft() {
      sessionStorage.setItem(FIRST_APPLY_DRAFT_KEY, JSON.stringify(this.form));
    }
  },
  watch: {
    content: {
      immediate: true,
      handler(val) {
        if (this.contentInitialized || !val || !Object.keys(val).length) return;
        this.initFormFromContent(val);
      }
    }
  },
  mounted () {
    this.accessToken.accessToken = storage.getItem('accessToken');
    if (Object.keys(this.content).length) {
      this.initFormFromContent(this.content);
    } else {
      this.restoreDraft();
    }
  },
  beforeUnmount() {
    this.saveDraft();
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
