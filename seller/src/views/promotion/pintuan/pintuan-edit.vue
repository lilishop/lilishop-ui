<template>
  <div class="new-pintuan">
    <el-card>
      <el-form ref="form" :model="form" label-width="130px" :rules="formValidate">
        <el-form-item label="活动名称" prop="promotionName">
          <div class="form-field-block">
            <el-input
              v-model="form.promotionName"
              clearable
              style="width: 260px"
              maxlength="25"
              placeholder="请输入活动名称"
            />
            <div class="form-tip">
              活动名称将显示在店铺拼团活动列表中，供商家管理使用，最多输入25个字符
            </div>
          </div>
        </el-form-item>
        <el-form-item label="活动时间" prop="rangeTime">
          <div class="form-field-block">
            <el-date-picker
              v-model="form.rangeTime"
              class="pintuan-range-picker"
              type="datetimerange"
              format="YYYY-MM-DD HH:mm:ss"
              start-placeholder="开始时间"
              end-placeholder="结束时间"
              placeholder="请选择"
              :disabled-date="options.disabledDate"
            />
          </div>
        </el-form-item>
        <el-form-item label="成团人数" prop="requiredNum">
          <div class="form-field-block">
            <el-input v-model="form.requiredNum" style="width: 260px" placeholder="请输入成团人数">
              <template #append>人</template>
            </el-input>
            <div class="form-tip">成团人数最少为2人，最多不超过10人。</div>
          </div>
        </el-form-item>
        <el-form-item label="限购数量" prop="limitNum">
          <div class="form-field-block">
            <el-input v-model="form.limitNum" type="number" style="width: 260px" placeholder="请输入限购数量">
              <template #append>件/人</template>
            </el-input>
            <div class="form-tip">若设置为0，则为不限制购买数量。</div>
          </div>
        </el-form-item>
        <el-form-item label="虚拟成团" prop="fictitious">
          <div class="form-field-block">
            <el-radio-group v-model="form.fictitious">
              <el-radio-button :value="1">开启</el-radio-button>
              <el-radio-button :value="0">关闭</el-radio-button>
            </el-radio-group>
            <div class="form-tip">
              开启虚拟成团后，24小时内人数未满的团，系统将会模拟匿名买家凑满人数，使该团成团。您只需要对真实拼团买家发货。建议合理开启，以提高成团率。
            </div>
          </div>
        </el-form-item>
        <el-form-item label="拼团规则" prop="pintuanRule">
          <div class="form-field-block">
            <el-input
              v-model="form.pintuanRule"
              type="textarea"
              :rows="4"
              clearable
              maxlength="255"
              style="width: 260px"
              placeholder="请输入拼团规则"
            />
            <div class="form-tip">拼团规则字数不能超过255字，将在WAP拼团详情页中显示</div>
          </div>
        </el-form-item>
        <el-form-item>
          <el-button @click="closeCurrentPage">返回</el-button>
          <el-button type="primary" :loading="submitLoading" @click="handleSubmit">提交</el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script>
import { savePintuan, editPintuan, getPintuanDetail } from "@/api/promotion";

export default {
  data() {
    return {
      id: this.$route.query.id,
      form: {
        promotionName: "",
        promotionTitle: "",
        pintuanRule: "",
        requiredNum: "",
        fictitious: 0,
        limitNum: "",
        startTime: "",
        endTime: "",
        rangeTime: [],
      },
      formValidate: {
        promotionName: [{ required: true, message: "活动名称不能为空", trigger: "blur" }],
        requiredNum: [
          { required: true, message: "成团人数不能为空", trigger: "blur" },
          {
            pattern: /^([2-9]|10)?$/,
            message: "成团人数不合法",
            trigger: "blur",
          },
        ],
        limitNum: [
          { required: true, message: "限购数量不能为空", trigger: "blur" },
          {
            pattern: /^(0|[1-9]\d?|100)$/,
            message: "限购数量不合法",
            trigger: "blur",
          },
        ],
        rangeTime: [{ required: true, message: "请选择活动时间", trigger: "change" }],
      },
      submitLoading: false,
      options: {
        disabledDate(date) {
          return date && date.valueOf() < Date.now() - 86400000;
        },
      },
    };
  },
  mounted() {
    if (this.id) {
      this.getDetail();
    }
  },
  methods: {
    closeCurrentPage() {
      this.$router.back();
    },
    handleSubmit() {
      this.$refs.form.validate((valid) => {
        if (!valid) return;
        this.submitLoading = true;
        const params = JSON.parse(JSON.stringify(this.form));
        params.fictitious = !!params.fictitious;
        params.startTime = this.$filters.unixToDate(this.form.rangeTime[0] / 1000);
        params.endTime = this.$filters.unixToDate(this.form.rangeTime[1] / 1000);

        if (!params.startTime || !params.endTime) {
          this.$Message.error("活动时间不能为空");
          this.submitLoading = false;
          return;
        }
        if (new Date(params.startTime).getTime() < Date.now()) {
          this.$Message.error("拼团活动开始时间不能小于当前时间");
          this.submitLoading = false;
          return;
        }

        delete params.rangeTime;
        if (!this.id) {
          delete params.id;
          savePintuan(params).then((res) => {
            this.submitLoading = false;
            if (res.success) {
              this.$Message.success("拼团活动添加成功");
              this.closeCurrentPage();
            }
          });
        } else {
          if (params.promotionGoodsList === "") delete params.promotionGoodsList;
          editPintuan(params).then((res) => {
            this.submitLoading = false;
            if (res.success) {
              this.$Message.success("编辑成功");
              this.closeCurrentPage();
            }
          });
        }
      });
    },
    getDetail() {
      getPintuanDetail(this.id).then((res) => {
        if (res.success) {
          const data = res.result;
          data.rangeTime = [new Date(data.startTime), new Date(data.endTime)];
          this.form = data;
          this.form.fictitious = data.fictitious ? 1 : 0;
        }
      });
    },
  },
};
</script>

<style lang="scss" scoped>
.new-pintuan {
  :deep(.el-form-item__label) {
    color: #000;
  }

  :deep(.pintuan-range-picker.el-date-editor--datetimerange) {
    width: 400px;
    max-width: 100%;
    flex-grow: 0;
  }
}

.form-field-block {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  width: 100%;
}

.form-tip {
  color: #666666;
  font-size: 12px;
  line-height: 1.5;
  margin-top: 4px;
  width: 100%;
  max-width: 720px;
}
</style>
