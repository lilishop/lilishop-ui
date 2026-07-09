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

<script>
import { setSetting } from "@/api/index";

export default {
  props: ["res", "type"],
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
      setSetting(this.type || "HOT_WORDS", this.formValidate).then((res) => {
        if (res.success) {
          this.$Message.success("保存成功!");
        } else {
          this.$Message.error("保存失败!");
        }
      });
    },
    init() {
      if (!this.res) {
        return;
      }
      const parsed = typeof this.res === "string" ? JSON.parse(this.res) : this.res;
      if (parsed.hotWordsSettingItems) {
        this.formValidate = { ...parsed };
      }
    },
  },
};
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
