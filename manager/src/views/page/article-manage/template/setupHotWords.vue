<template>
  <div class="layout">
    <el-form
      ref="formValidate"
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

<script>
import { setSetting, getSetting } from "@/api/index";

export default {
  data() {
    return {
      ruleValidate: {},
      formValidate: {
        saveNum: 1,
        hotWordsSettingItems: [
          {
            keywords: "",
            score: 1,
          },
        ],
      },
    };
  },
  created() {
    this.init();
  },
  methods: {
    addSetItem() {
      if (this.formValidate.hotWordsSettingItems.length >= 5) {
        this.$Message.error("最多5个热词项");
      } else {
        this.formValidate.hotWordsSettingItems.push({
          keywords: "",
          score: 1,
        });
      }
    },
    submit(name) {
      this.$refs[name].validate((valid) => {
        if (valid) {
          this.setupSetting();
        } else {
          this.$Message.error("请正确填写内容!");
        }
      });
    },
    setupSetting() {
      setSetting("HOT_WORDS", this.formValidate).then((res) => {
        if (res.success) {
          this.$Message.success("保存成功!");
        } else {
          this.$Message.error("保存失败!");
        }
        this.init();
      });
    },
    async init() {
      const res = await getSetting("HOT_WORDS");
      if (res.success && res.result) {
        this.formValidate = res.result;
      }
    },
  },
};
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
