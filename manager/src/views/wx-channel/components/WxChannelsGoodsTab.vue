<template>
  <div class="wx-channel-goods">
    <Row>
      <Form :model="searchForm" inline :label-width="70" class="search-form">
        <FormItem label="商品名称" prop="goodsName">
          <Input
            v-model="searchForm.goodsName"
            placeholder="请输入商品名称"
            clearable
            style="width: 220px"
          />
        </FormItem>
        <FormItem label="状态" prop="status">
          <Select v-model="searchForm.status" clearable style="width: 180px" placeholder="全部">
            <Option v-for="item in statusList" :key="item.value" :value="item.value">{{ item.label }}</Option>
          </Select>
        </FormItem>
        <Button
          @click="handleSearch"
          type="primary"
          icon="ios-search"
          class="search-btn"
          :loading="loading"
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
import { getWxChannelsGoodsPage } from "@/api/index";

export default {
  name: "WxChannelsGoodsTab",
  data() {
    return {
      statusList: [
        { label: "已通过", value: "APPROVED" },
        { label: "审核中", value: "PENDING" },
        { label: "已拒绝", value: "REJECTED" },
      ],
      loading: false,
      total: 0,
      data: [],
      searchForm: {
        goodsName: "",
        status: "",
        pageNumber: 1,
        pageSize: 20,
      },
      columns: [
        {
          title: "商品图片",
          key: "goodsImage",
          width: 90,
          align: "center",
          render: (h, params) => {
            return h("img", {
              attrs: { src: params.row.goodsImage || "", alt: "加载图片失败" },
              style: {
                width: "50px",
                height: "50px",
                objectFit: "cover",
                borderRadius: "4px",
              },
            });
          },
        },
        { title: "商品名称", key: "goodsName", minWidth: 220, tooltip: true },
        { title: "店铺", key: "storeName", minWidth: 160, tooltip: true },
        { title: "分类", key: "categoryName", minWidth: 160, tooltip: true },
        { title: "销售价", key: "costPrice", width: 100 },
        { title: "视频号价", key: "channelPrice", width: 100 },
        { title: "库存", key: "stock", width: 90 },
        {
          title: "状态",
          key: "status",
          width: 110,
          render: (h, params) => {
            const val = params.row.status;
            const map = {
              APPROVED: { label: "已通过", color: "green" },
              PENDING: { label: "审核中", color: "orange" },
              REJECTED: { label: "已拒绝", color: "red" },
            };
            const item = map[val] || { label: val || "-", color: "default" };
            return h("Tag", { props: { color: item.color } }, item.label);
          },
        },
      ],
    };
  },
  mounted() {
    this.loadPage();
  },
  methods: {
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
      getWxChannelsGoodsPage({ ...this.searchForm })
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
