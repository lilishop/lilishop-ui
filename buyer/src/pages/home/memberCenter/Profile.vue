<template>
  <div class="wrapper">
    <UserCenterLayout title="用户信息" :tabs="['用户信息']">
      <el-form :model="formItem" :rules="rules" ref="form" label-width="80px">
      <el-form-item label="头像" class="avatar-form-item">
        <div class="avatar-upload">
          <el-avatar v-if="formItem.face" :src="formItem.face" :size="80" />
          <el-avatar v-else :size="80"><el-icon><User /></el-icon></el-avatar>
          <el-upload
            :show-file-list="false"
            :on-success="handleSuccess"
            :format="['jpg','jpeg','png']"
            :action="action"
            :headers="accessToken"
          >
            <el-button>上传头像</el-button>
          </el-upload>
        </div>
      </el-form-item>
      <el-form-item label="昵称" prop="nickName">
        <el-input class="profile-field" v-model="formItem.nickName" placeholder="" />
      </el-form-item>

      <el-form-item label="生日">
        <el-date-picker
          class="profile-field"
          type="date"
          placeholder="选择您的生日"
          v-model="formItem.birthday"
        />
      </el-form-item>
      <el-form-item label="性别">
        <el-radio-group v-model="formItem.sex" type="button" button-style="solid">
          <el-radio :label="1">男</el-radio>
          <el-radio :label="0">女</el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="save">确认修改</el-button>

      </el-form-item>
      </el-form>
    </UserCenterLayout>
  </div>
</template>

<script>
import { Message } from "@/utils/message";
import { editMemberInfo } from '@/api/account.js';
import { getMemberMsg } from '@/api/login.js';
import { buyerUrl } from '@/plugins/request.js';
import storage from '@/plugins/storage.js';
import { User } from '@element-plus/icons-vue';
export default {
  components: { User },
  name: 'Profile',
  data () {
    return {
      rules: { // 验证规则
        nickName: [{required: true, message: '用户昵称不能为空'}, { max: 16, message: '用户昵称不能超过15个字符' }]
      },
      formItem: {}, // 表单数据
      action: buyerUrl + '/buyer/common/upload/file', // 上传接口
      accessToken: {} // 验证token
    }
  },
  mounted () {
    this.accessToken.accessToken = storage.getItem('accessToken');
    this.loadUserInfo();
  },
  methods: {
    loadUserInfo () {
      const rawUserInfo = storage.getItem('userInfo');
      if (rawUserInfo) {
        this.applyUserInfo(JSON.parse(rawUserInfo));
        return;
      }
      if (!storage.getItem('accessToken')) {
        this.redirectToLogin();
        return;
      }
      getMemberMsg().then(res => {
        if (res.success && res.result) {
          storage.setItem('userInfo', res.result);
          this.applyUserInfo(res.result);
        } else {
          this.redirectToLogin();
        }
      }).catch(() => {
        this.redirectToLogin();
      });
    },
    applyUserInfo (userInfo) {
      this.formItem = { ...userInfo };
      this.formItem.birthday = this.normalizeBirthday(this.formItem.birthday);
    },
    redirectToLogin () {
      this.$router.push({
        path: '/login',
        query: {
          rePath: this.$route.path,
          query: JSON.stringify(this.$route.query || {}),
        },
      });
    },
    normalizeBirthday (value) {
      if (!value) return ''
      if (value instanceof Date) return value
      if (typeof value === 'number') return new Date(value)
      if (typeof value === 'string') {
        const m = value.match(/^(\d{4})-(\d{2})-(\d{2})/)
        if (m) return new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]))
        const d = new Date(value)
        return isNaN(d.getTime()) ? '' : d
      }
      return ''
    },
    formatBirthday (value) {
      if (!value) return null
      if (typeof value === 'string') {
        const m = value.match(/^(\d{4})-(\d{2})-(\d{2})/)
        return m ? `${m[1]}-${m[2]}-${m[3]}` : null
      }
      const d = value instanceof Date ? value : new Date(value)
      if (isNaN(d.getTime())) return null
      const yyyy = d.getFullYear()
      const mm = String(d.getMonth() + 1).padStart(2, '0')
      const dd = String(d.getDate()).padStart(2, '0')
      return `${yyyy}-${mm}-${dd}`
    },
    save () { // 保存
      this.$refs.form.validate(valid => {
        if (valid) {
          let params = {
            birthday: this.formatBirthday(this.formItem.birthday),
            face: this.formItem.face,
            nickName: this.formItem.nickName,
            sex: this.formItem.sex
          }
          editMemberInfo(params).then(res => {
            if (res.success) {
              Message.success('修改个人资料成功')
              storage.setItem('userInfo', res.result)
              this.$router.go(0)
            }
          })
        }
      })
    },
    handleSuccess (res, file) { // 上传成功
      this.formItem['face'] = res.result
    },
  }

}
</script>

<style scoped lang="scss">
.avatar-form-item {
  :deep(.el-form-item__label) {
    height: 90px;
    line-height: 90px;
    display: flex;
    align-items: center;
  }
}

.avatar-upload {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 10px;

  :deep(.el-avatar) {
    margin-top: 10px;
  }

  :deep(.el-upload) {
    display: block;
  }
}

.profile-field {
  width: 187px;
}

:deep(.profile-field.el-date-editor) {
  width: 187px;
}
</style>
