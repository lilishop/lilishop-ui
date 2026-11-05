<template>
  <div class="logo-input">
    <UploadPicInput :model-value="modelValue" :before-select="validateSelection" placeholder="请选择图标或粘贴图片地址" @update:model-value="updateLogo" />
    <span class="hint">透明PNG，建议100×100像素，上传大小不超过10KB。</span>
  </div>
</template>
<script setup>
import UploadPicInput from '@/components/lili/upload-pic-input.vue';
import { nextTick } from 'vue';
import { ElMessage, useFormItem } from 'element-plus';
defineProps({modelValue:{type:String,default:''}});
const emit = defineEmits(['update:modelValue']);
const { formItem } = useFormItem();
function validateSelection({ file }) {
  if (!file || file.fileType !== 'image/png' || Number(file.fileSize) > 10240) {
    ElMessage.error('请选择不超过10KB的PNG图标');
    return false;
  }
  return true;
}
async function updateLogo(value) {
  emit('update:modelValue', value);
  await nextTick();
  formItem?.validate('change').catch(() => {});
}
</script>
<style scoped>
.logo-input { width: 100%; min-width: 0; }
.hint { display: block; margin-top: 8px; color: var(--el-text-color-secondary); font-size: 12px; line-height: 20px; }
</style>
