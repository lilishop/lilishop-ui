<template>
  <div class="layout">
    <el-form
      ref="formRef"
      label-width="150px"
      label-position="right"
      :model="formValidate"
      :rules="ruleValidate"
    >
      <el-form-item label="热词默认配置" prop="hotWordsSettingItems">
        <div class="hotwords-config">
          <div
            class="item-label"
            v-for="(item, index) in formValidate.hotWordsSettingItems"
            :key="index"
          >
            <div class="item-fields">
              <div class="item-keyword">
                <div>热词：</div>
                <el-input v-model="item.keywords" />
              </div>
              <div class="item-score">
                <div>分数：</div>
                <el-input-number :max="5" :min="0" v-model="item.score" />
              </div>
            </div>
            <div class="item-actions">
              <el-button
                type="primary"
                @click="formValidate.hotWordsSettingItems.splice(index, 1)"
              >
                删除
              </el-button>
              <el-button v-if="index === formValidate.hotWordsSettingItems.length - 1" @click="addSetItem">
                添加配置
              </el-button>
            </div>
          </div>
        </div>
      </el-form-item>
      <el-form-item label="每日持久化热词数量" prop="saveNum">
        <el-input-number :min="0" v-model="formValidate.saveNum" />
      </el-form-item>

      <div class="label-btns">
        <el-button type="primary" @click="submit('formValidate')">保存</el-button>
      </div>
    </el-form>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { setSetting, getSetting } from "@/api/index";
import { Message } from "@/utils/message";

const formRef = ref(null);
const ruleValidate = ref({});
const formValidate = ref({
  saveNum: 1,
  hotWordsSettingItems: [
    {
      keywords: "",
      score: 1,
    },
  ],
});

init();

function addSetItem() {
  if (formValidate.value.hotWordsSettingItems.length >= 5) {
    Message.error("最多5个热词项");
  } else {
    formValidate.value.hotWordsSettingItems.push({
      keywords: "",
      score: 1,
    });
  }
}
function submit(name) {
  formRef.value.validate((valid) => {
    if (valid) {
      setupSetting();
    } else {
      Message.error("请正确填写内容!");
    }
  });
}
function setupSetting() {
  setSetting("HOT_WORDS", formValidate.value).then((res) => {
    if (res.success) {
      Message.success("保存成功!");
    } else {
      Message.error("保存失败!");
    }
    init();
  });
}
async function init() {
  const res = await getSetting("HOT_WORDS");
  if (res.success && res.result) {
    formValidate.value = res.result;
  }
}
</script>

<style lang="scss" scoped>
.item-label {
  border-bottom: 1px solid #ededed;
  margin-bottom: 10px;
  display: flex;
  align-items: center;
  width: 560px;
  justify-content: space-between;
  gap: 12px;
}

.item-fields {
  flex: 1;
  min-width: 0;
}

.item-actions {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-shrink: 0;
}

.item-keyword,
.item-score {
  display: flex;
  align-items: center;
  margin-bottom: 10px;

  > div {
    margin-right: 20px;
  }
}

.item-keyword .el-input {
  width: 200px;
}
</style>
