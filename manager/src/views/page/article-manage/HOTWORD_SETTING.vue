<template>
  <div class="layout">
    <el-form
      ref="formValidateRef"
      label-width="150px"
      label-position="right"
      :model="formValidate"
      :rules="ruleValidate"
    >
      <el-form-item label="热词默认配置" prop="hotWordsSettingItems">
        <div
          class="item-label"
          v-for="(item, index) in formValidate.hotWordsSettingItems"
          :key="index"
        >
          <div>
            <div class="item-keyword">
              <div>热词：</div>
              <el-input v-model="item.keywords" />
            </div>
            <div class="item-score">
              <div>分数：</div>
              <el-input-number :max="5" :min="0" v-model="item.score" />
            </div>
          </div>
          <div>
            <el-button type="primary" @click="formValidate.hotWordsSettingItems.splice(index, 1)">
              删除
            </el-button>
          </div>
        </div>
        <el-button @click="addSetItem">添加配置</el-button>
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
import { setSetting } from "@/api/index";
import { Message } from "@/utils/message";

const props = defineProps(["res", "type"]);

const formValidateRef = ref(null);
// 动态 $refs[name] 查找的映射表
const formRefs = { formValidate: formValidateRef };

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
  formRefs[name].value.validate((valid) => {
    if (valid) {
      setupSetting();
    } else {
      Message.error("请正确填写内容!");
    }
  });
}
function setupSetting() {
  setSetting(props.type || "HOT_WORDS", formValidate.value).then((res) => {
    if (res.success) {
      Message.success("保存成功!");
    } else {
      Message.error("保存失败!");
    }
  });
}
function init() {
  if (!props.res) {
    return;
  }
  const parsed = typeof props.res === "string" ? JSON.parse(props.res) : props.res;
  if (parsed.hotWordsSettingItems) {
    formValidate.value = { ...parsed };
  }
}
</script>

<style lang="scss" scoped>
@import "./style.scss";

.item-label {
  border-bottom: 1px solid #ededed;
  margin-bottom: 10px;
  display: flex;
  align-items: center;
  width: 500px;
  justify-content: space-between;
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
