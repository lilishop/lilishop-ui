<template>
  <div>
    <el-card>
      <el-form ref="form" :model="form" label-width="120px" :rules="formRule">
        <div class="base-info-item">
          <h4>基本信息</h4>
          <div class="form-item-view">
            <el-form-item label="活动名称" prop="promotionName">
              <el-input
                v-model="form.promotionName"
                placeholder="请填写活动名称"
                clearable
                style="width: 260px"
              />
            </el-form-item>
            <el-form-item label="报名截止时间" prop="applyEndTime">
              <el-date-picker
                v-model="form.applyEndTime"
                type="datetime"
                format="YYYY-MM-DD HH:mm:ss"
                value-format="YYYY-MM-DD HH:mm:ss"
                placeholder="请选择"
                clearable
                style="width: 200px"
              />
            </el-form-item>
            <el-form-item label="活动开始时间" prop="startTime">
              <el-date-picker
                v-model="form.startTime"
                type="date"
                format="YYYY-MM-DD"
                value-format="YYYY-MM-DD"
                placeholder="请选择"
                clearable
                style="width: 200px"
              />
            </el-form-item>
            <el-form-item label="抢购时间段" prop="seckillPeriod">
              <el-tag
                v-for="item in form.seckillPeriod"
                :key="item"
                closable
                class="period-tag"
                @close="removePeriodTime(item)"
              >
                {{ item >= 10 ? item : "0" + item }}:00
              </el-tag>
              <el-input-number
                v-if="showAddPeriod"
                :max="23"
                :min="0"
                v-model="periodTime"
                @blur="addPeriodTime"
              />
              <el-button @click="addPeriod">添加时间段</el-button>
            </el-form-item>
            <el-form-item label="申请规则" prop="seckillRule">
              <el-input
                v-model="form.seckillRule"
                placeholder="申请规则"
                clearable
                style="width: 260px"
              />
            </el-form-item>
          </div>
          <div class="foot-btn">
            <el-button @click="closeCurrentPage" style="margin-right: 5px">返回</el-button>
            <el-button type="primary" :loading="submitLoading" @click="handleSubmit">提交</el-button>
          </div>
        </div>
      </el-form>
    </el-card>
  </div>
</template>

<script>
import { updateSeckill, seckillDetail } from "@/api/promotion";

export default {
  name: "addSeckill",
  data() {
    return {
      form: {
        promotionName: "",
        applyEndTime: "",
        startTime: "",
        seckillPeriod: [],
        seckillRule: "",
        promotionStatus: "NEW",
      },
      id: this.$route.query.id,
      periodTime: null,
      showAddPeriod: false,
      submitLoading: false,
      formRule: {
        promotionName: [{ required: true, message: "请填写活动名称" }],
        applyEndTime: [{ required: true, message: "请填写报名截止时间" }],
        seckillPeriod: [{ required: true, message: "请填写抢购时间段" }],
        startTime: [{ required: true, message: "请填写活动开始时间" }],
        seckillRule: [{ required: true, message: "请输入申请规则" }],
      },
    };
  },
  mounted() {
    if (this.id) {
      this.getData();
    }
  },
  methods: {
    closeCurrentPage() {
      this.$store.commit("removeTag", "manager-seckill-add");
      localStorage.pageOpenedList = JSON.stringify(this.$store.state.app.pageOpenedList);
      this.$router.go(-1);
    },
    getData() {
      seckillDetail(this.id).then((res) => {
        if (res.success) {
          const data = res.result;
          data.seckillPeriod = res.result.hours.split(",");
          this.form = data;
        }
      });
    },
    addPeriod() {
      this.addPeriodTime();
      this.showAddPeriod = true;
    },
    addPeriodTime() {
      this.showAddPeriod = false;
      if (this.periodTime !== null && !this.form.seckillPeriod.includes(this.periodTime)) {
        this.form.seckillPeriod.push(this.periodTime);
      }
    },
    removePeriodTime(name) {
      this.form.seckillPeriod = this.form.seckillPeriod.filter((i) => i !== name);
    },
    handleSubmit() {
      this.$refs.form.validate((valid) => {
        if (valid) {
          this.submitLoading = true;
          this.form.hours = this.form.seckillPeriod.toString();
          delete this.form.createTime;
          delete this.form.updateTime;
          delete this.form.endTime;
          delete this.form.seckillApplyList;
          const params = { ...this.form };
          const startTs = new Date(this.form.startTime).getTime();
          const applyTs = new Date(this.form.applyEndTime).getTime();
          params.startTime = this.$filters.unixToDate(startTs / 1000);
          params.applyEndTime = this.$filters.unixToDate(applyTs / 1000);
          updateSeckill(params).then((res) => {
            this.submitLoading = false;
            if (res && res.success) {
              this.$Message.success("编辑成功");
              this.closeCurrentPage();
            }
          });
        }
      });
    },
  },
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

.period-tag {
  margin-right: 10px;
}

:deep(.el-form-item) {
  margin-bottom: 30px;
}
</style>
