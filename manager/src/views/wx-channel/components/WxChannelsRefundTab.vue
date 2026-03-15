<template>
  <div class="wx-channel-refund">
    <Row>
      <Form :model="searchForm" inline :label-width="70" class="search-form">
        <FormItem label="退单编号" prop="channelRefundSn">
          <Input
            v-model="searchForm.channelRefundSn"
            placeholder="视频号退单编号"
            clearable
            style="width: 220px"
          />
        </FormItem>
        <FormItem label="订单编号" prop="channelOrderSn">
          <Input
            v-model="searchForm.channelOrderSn"
            placeholder="视频号订单编号"
            clearable
            style="width: 220px"
          />
        </FormItem>
        <FormItem label="会员昵称" prop="memberNickName">
          <Input v-model="searchForm.memberNickName" placeholder="请输入会员昵称" clearable style="width: 180px" />
        </FormItem>
        <FormItem label="商品名称" prop="goodsName">
          <Input v-model="searchForm.goodsName" placeholder="请输入商品名称" clearable style="width: 200px" />
        </FormItem>
        <FormItem label="状态" prop="status">
          <Input v-model="searchForm.status" placeholder="退单状态" clearable style="width: 140px" />
        </FormItem>
        <FormItem label="场景" prop="scene">
          <Select v-model="searchForm.scene" clearable style="width: 140px" placeholder="全部">
            <Option v-for="item in sceneList" :key="item.value" :value="item.value">{{ item.label }}</Option>
          </Select>
        </FormItem>
        <FormItem label="时间">
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
          >搜索</Button
        >
      </Form>
    </Row>

    <Table :loading="loading" border :columns="columns" :data="data" class="mt_10"></Table>
    <Row type="flex" justify="end" class="mt_10" style="margin-top: 10px">
      <Page
        :current="searchForm.pageNumber"
        :total="total"
        :page-size="searchForm.pageSize"
        @on-change="changePage"
        @on-page-size-change="changePageSize"
        :page-size-opts="[20, 50, 100]"
        size="small"
        show-total
        show-elevator
        show-sizer
      ></Page>
    </Row>
  </div>
</template>

<script>
import { getWxChannelsRefundPage } from "@/api/index";

export default {
  name: "WxChannelsRefundTab",
  data() {
    return {
      sceneList: [
        { label: "直播", value: "LIVE" },
        { label: "橱窗", value: "WINDOW" },
      ],
      loading: false,
      total: 0,
      data: [],
      selectDate: null,
      searchForm: {
        channelRefundSn: "",
        channelOrderSn: "",
        memberNickName: "",
        goodsName: "",
        status: "",
        scene: "",
        startTime: null,
        endTime: null,
        pageNumber: 1,
        pageSize: 20,
      },
      columns: [
        { title: "视频号退单编号", key: "channelRefundSn", minWidth: 200, tooltip: true },
        { title: "视频号订单编号", key: "channelOrderSn", minWidth: 200, tooltip: true },
        { title: "会员昵称", key: "memberNickName", minWidth: 140, tooltip: true },
        { title: "退款金额", key: "amount", width: 110 },
        {
          title: "退单状态",
          key: "status",
          width: 130,
          render: (h, params) => {
            const val = params.row.status;
            if (!val) return h("span", "-");
            return h("Tag", { props: { color: "blue" } }, val);
          },
        },
        {
          title: "下单场景",
          key: "scene",
          width: 110,
          render: (h, params) => {
            const val = params.row.scene;
            const map = {
              LIVE: { label: "直播", color: "orange" },
              WINDOW: { label: "橱窗", color: "purple" },
            };
            const item = map[val] || { label: val || "-", color: "default" };
            return h("Tag", { props: { color: item.color } }, item.label);
          },
        },
        { title: "创建时间", key: "createTime", minWidth: 160, tooltip: true },
      ],
    };
  },
  mounted() {
    this.loadPage();
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
      this.searchForm.pageNumber = 1;
      this.loadPage();
    },
    changePage(pageNumber) {
      this.searchForm.pageNumber = pageNumber;
      this.loadPage();
    },
    changePageSize(pageSize) {
      this.searchForm.pageSize = pageSize;
      this.searchForm.pageNumber = 1;
      this.loadPage();
    },
    loadPage() {
      this.loading = true;
      const params = { ...this.searchForm };
      Object.keys(params).forEach((k) => {
        if (params[k] === null || params[k] === "" || params[k] === undefined) delete params[k];
      });
      getWxChannelsRefundPage(params)
        .then((res) => {
          if (res && res.success) {
            const page = res.result || {};
            this.data = Array.isArray(page.records) ? page.records : [];
            this.total = Number(page.total || 0);
          }
        })
        .finally(() => {
          this.loading = false;
        });
    },
  },
};
</script>
