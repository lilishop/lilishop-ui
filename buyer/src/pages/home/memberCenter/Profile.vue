<template>
  <div class="wrapper">
    <UserCenterLayout>
      <el-form class="profile-form" :model="formItem" :rules="rules" ref="formRef" label-width="72px" label-position="left">
        <el-form-item label="头像" class="avatar-form-item">
          <div class="avatar-upload">
            <el-avatar v-if="formItem.face" :src="formItem.face" :size="72" />
            <el-avatar v-else :size="72"><el-icon><User /></el-icon></el-avatar>
            <el-upload
              :show-file-list="false"
              :on-success="handleSuccess"
              :format="['jpg','jpeg','png']"
              :action="action"
              :headers="accessToken"
            >
              <button type="button" class="ghost-btn">上传头像</button>
            </el-upload>
          </div>
        </el-form-item>
        <el-form-item label="昵称" prop="nickName">
          <el-input class="profile-field" v-model="formItem.nickName" maxlength="16" placeholder="请输入昵称" />
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
          <div class="sex-group">
            <button type="button" class="sex-btn" :class="{ active: formItem.sex === 1 }" @click="formItem.sex = 1">男</button>
            <button type="button" class="sex-btn" :class="{ active: formItem.sex === 0 }" @click="formItem.sex = 0">女</button>
          </div>
        </el-form-item>
        <el-form-item>
          <button type="button" class="op-btn" @click="save">确认修改</button>
        </el-form-item>
      </el-form>
    </UserCenterLayout>
  </div>
</template>

<script setup>
import { onMounted, reactive, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import { Message } from "@/utils/message";
import { editMemberInfo } from '@/api/account.js';
import { getMemberMsg } from '@/api/login.js';
import { buyerUrl } from '@/plugins/request.js';
import storage from '@/plugins/storage.js';
import { User } from '@element-plus/icons-vue';

defineOptions({ name: 'Profile' });

const route = useRoute();
const router = useRouter();

const formRef = ref(null);

const rules = { // 验证规则
  nickName: [{required: true, message: '用户昵称不能为空'}, { max: 16, message: '用户昵称不能超过15个字符' }]
};
const formItem = ref({}); // 表单数据
const action = buyerUrl + '/buyer/common/upload/file'; // 上传接口
const accessToken = reactive({}); // 验证token

onMounted(() => {
  accessToken.accessToken = storage.getItem('accessToken');
  loadUserInfo();
});

function loadUserInfo () {
  const rawUserInfo = storage.getItem('userInfo');
  if (rawUserInfo) {
    applyUserInfo(JSON.parse(rawUserInfo));
    return;
  }
  if (!storage.getItem('accessToken')) {
    redirectToLogin();
    return;
  }
  getMemberMsg().then(res => {
    if (res.success && res.result) {
      storage.setItem('userInfo', res.result);
      applyUserInfo(res.result);
    } else {
      redirectToLogin();
    }
  }).catch(() => {
    redirectToLogin();
  });
}
function applyUserInfo (userInfo) {
  formItem.value = { ...userInfo };
  formItem.value.birthday = normalizeBirthday(formItem.value.birthday);
}
function redirectToLogin () {
  router.push({
    path: '/login',
    query: {
      rePath: route.path,
      query: JSON.stringify(route.query || {}),
    },
  });
}
function normalizeBirthday (value) {
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
}
function formatBirthday (value) {
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
}
function save () { // 保存
  formRef.value.validate(valid => {
    if (valid) {
      let params = {
        birthday: formatBirthday(formItem.value.birthday),
        face: formItem.value.face,
        nickName: formItem.value.nickName,
        sex: formItem.value.sex
      }
      editMemberInfo(params).then(res => {
        if (res.success) {
          Message.success('修改个人资料成功')
          storage.setItem('userInfo', res.result)
          router.go(0)
        }
      })
    }
  })
}
function handleSuccess (res, file) { // 上传成功
  formItem.value['face'] = res.result
}
</script>

<style scoped lang="scss">
.profile-form {
  max-width: 480px;
  padding-top: 4px;

  :deep(.el-form-item) {
    margin-bottom: 22px;
    align-items: center;
  }

  :deep(.el-form-item__label) {
    height: auto;
    line-height: 22px;
    color: #666;
    font-size: 14px;
  }

  :deep(.el-input__wrapper),
  :deep(.el-date-editor.el-input__wrapper) {
    min-height: 36px;
  }
}

.avatar-form-item {
  align-items: center;
}

.avatar-upload {
  display: flex;
  align-items: center;
  gap: 16px;

  :deep(.el-upload) {
    display: flex;
    align-items: center;
  }
}

.profile-field {
  width: 320px;
}

:deep(.profile-field.el-date-editor) {
  width: 320px;
}

.sex-group {
  display: flex;
  gap: 8px;
}

.sex-btn,
.ghost-btn,
.op-btn {
  height: 32px;
  padding: 0 16px;
  border-radius: 4px;
  font-family: inherit;
  font-size: 14px;
  line-height: 30px;
  cursor: pointer;
}

.sex-btn,
.ghost-btn {
  border: 1px solid #ddd;
  background: #fff;
  color: #171A26;

  &:hover {
    border-color: $theme_color;
    color: $theme_color;
  }
}

.sex-btn.active {
  border-color: $theme_color;
  background: #fff5f4;
  color: $theme_color;
}

.op-btn {
  min-width: 96px;
  border: 1px solid $theme_color;
  background: $theme_color;
  color: #fff;

  &:hover {
    opacity: 0.9;
  }
}
</style>

