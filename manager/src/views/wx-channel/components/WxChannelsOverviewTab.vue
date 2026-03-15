<template>
  <div class="wx-channel-overview">
    <Row>
      <Form :model="searchForm" inline :label-width="70" class="search-form">
        <FormItem label="统计时间">
          <DatePicker
            type="daterange"
            v-model="selectDate"
            format="yyyy-MM-dd"
            clearable
            @on-change="selectDateRange"
            placeholder="选择起始时间"
            style="width: 240px"
          ></DatePicker>
        </FormItem>
        <Button @click="handleSearch" type="primary" icon="ios-search" class="search-btn" :loading="loading"
          >查询</Button
        >
      </Form>
    </Row>

    <Row :gutter="16" style="margin-top: 12px">
      <Col :xs="24" :sm="12" :md="8">
        <Card dis-hover>
          <div class="overview-card">
            <div class="label">视频号总销售额</div>
            <div class="value">{{ summary.totalSales || 0 }}</div>
          </div>
        </Card>
      </Col>
      <Col :xs="24" :sm="12" :md="8">
        <Card dis-hover>
          <div class="overview-card">
            <div class="label">直播间销售额</div>
            <div class="value">{{ summary.liveSales || 0 }}</div>
          </div>
        </Card>
      </Col>
      <Col :xs="24" :sm="12" :md="8">
        <Card dis-hover>
          <div class="overview-card">
            <div class="label">橱窗销售额</div>
            <div class="value">{{ summary.windowSales || 0 }}</div>
          </div>
        </Card>
      </Col>
    </Row>
    <Row :gutter="16" style="margin-top: 16px">
      <Col :xs="24" :sm="12" :md="8">
        <Card dis-hover>
          <div class="overview-card">
            <div class="label">视频号退款总金额</div>
            <div class="value">{{ summary.totalRefund || 0 }}</div>
          </div>
        </Card>
      </Col>
      <Col :xs="24" :sm="12" :md="8">
        <Card dis-hover>
          <div class="overview-card">
            <div class="label">直播间退款金额</div>
            <div class="value">{{ summary.liveRefund || 0 }}</div>
          </div>
        </Card>
      </Col>
      <Col :xs="24" :sm="12" :md="8">
        <Card dis-hover>
          <div class="overview-card">
            <div class="label">橱窗退款金额</div>
            <div class="value">{{ summary.windowRefund || 0 }}</div>
          </div>
        </Card>
      </Col>
    </Row>
  </div>
</template>

<script>
import { getWxChannelsOverviewSummary } from "@/api/index";

export default {
  name: "WxChannelsOverviewTab",
  data() {
    return {
      loading: false,
      selectDate: null,
      searchForm: {
        startTime: null,
        endTime: null,
      },
      summary: {
        totalSales: 0,
        liveSales: 0,
        windowSales: 0,
        totalRefund: 0,
        liveRefund: 0,
        windowRefund: 0,
      },
    };
  },
  mounted() {
    this.loadSummary();
  },
  methods: {
    selectDateRange(v) {
      if (!v || v.length !== 2) {
        this.searchForm.startTime = null;
        this.searchForm.endTime = null;
        return;
      }
      const startStr = v[0];
      const endStr = v[1];
      const start = startStr ? new Date(`${startStr}T00:00:00`).getTime() : null;
      const end = endStr ? new Date(`${endStr}T23:59:59`).getTime() : null;
      this.searchForm.startTime = Number.isFinite(start) ? start : null;
      this.searchForm.endTime = Number.isFinite(end) ? end : null;
    },
    handleSearch() {
      this.loadSummary();
    },
    loadSummary() {
      this.loading = true;
      const params = { ...this.searchForm };
      Object.keys(params).forEach((k) => {
        if (params[k] === null || params[k] === "" || params[k] === undefined) delete params[k];
      });
      getWxChannelsOverviewSummary(params)
        .then((res) => {
          if (res && res.success) {
            this.summary = { ...this.summary, ...(res.result || {}) };
          }
        })
        .finally(() => {
          this.loading = false;
        });
    },
  },
};
</script>

<style scoped lang="scss">
.overview-card {
  display: flex;
  flex-direction: column;
}
.overview-card .label {
  color: #666;
  font-size: 13px;
}
.overview-card .value {
  margin-top: 8px;
  font-size: 22px;
  font-weight: 600;
  color: #17233d;
}
</style>
