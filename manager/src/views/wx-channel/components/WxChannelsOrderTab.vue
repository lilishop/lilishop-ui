<template>
  <div class="wx-channel-order">
    <el-form :model="searchForm" inline label-width="70px" class="search-form">
      <el-form-item label="订单编号" prop="channelOrderSn">
        <el-input v-model="searchForm.channelOrderSn" placeholder="视频号订单编号" clearable style="width: 220px" />
      </el-form-item>
      <el-form-item label="会员昵称" prop="memberNickName">
        <el-input v-model="searchForm.memberNickName" placeholder="请输入会员昵称" clearable style="width: 180px" />
      </el-form-item>
      <el-form-item label="商品名称" prop="goodsName">
        <el-input v-model="searchForm.goodsName" placeholder="请输入商品名称" clearable style="width: 200px" />
      </el-form-item>
      <el-form-item label="状态" prop="status">
        <el-input v-model="searchForm.status" placeholder="订单状态" clearable style="width: 140px" />
      </el-form-item>
      <el-form-item label="场景" prop="scene">
        <el-select v-model="searchForm.scene" clearable style="width: 140px" placeholder="全部">
          <el-option v-for="item in sceneList" :key="item.value" :label="item.label" :value="item.value" />
        </el-select>
      </el-form-item>
      <el-form-item label="下单时间">
        <el-date-picker
          v-model="selectDate"
          type="daterange"
          value-format="YYYY-MM-DD"
          clearable
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          style="width: 240px"
          @change="selectDateRange"
        />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" class="search-btn" :loading="loading" @click="handleSearch">搜索</el-button>
      </el-form-item>
    </el-form>

    <el-table v-loading="loading" border :data="data" class="mt_10" style="width: 100%">
      <el-table-column prop="channelOrderSn" label="视频号订单编号" min-width="200" show-overflow-tooltip />
      <el-table-column prop="orderSn" label="平台订单编号" min-width="200" show-overflow-tooltip />
      <el-table-column prop="memberNickName" label="会员昵称" min-width="140" show-overflow-tooltip />
      <el-table-column prop="amount" label="订单金额" width="110" />
      <el-table-column label="订单状态" width="130">
        <template #default="{ row }">
          <el-tag v-if="row && row.status" type="primary">{{ row.status }}</el-tag>
          <span v-else-if="row">-</span>
        </template>
      </el-table-column>
      <el-table-column prop="channelName" label="带货视频号" min-width="160" show-overflow-tooltip />
      <el-table-column label="下单场景" width="110">
        <template #default="{ row }">
          <el-tag v-if="row" :type="sceneTagType(row.scene)">{{ sceneLabel(row.scene) }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="createTime" label="创建时间" min-width="160" show-overflow-tooltip />
    </el-table>

    <div class="mt_10" style="display: flex; justify-content: flex-end">
      <el-pagination
        v-model:current-page="searchForm.pageNumber"
        v-model:page-size="searchForm.pageSize"
        :page-sizes="[20, 50, 100]"
        :total="total"
        layout="total, sizes, prev, pager, next, jumper"
        size="small"
        @current-change="changePage"
        @size-change="changePageSize"
      />
    </div>
  </div>
</template>

<script>
import { getWxChannelsOrderPage } from "@/api/index";

export default {
  name: "WxChannelsOrderTab",
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
    };
  },
  mounted() {
    this.loadPage();
  },
  methods: {
    sceneLabel(val) {
      const map = { LIVE: "直播", WINDOW: "橱窗" };
      return map[val] || val || "-";
    },
    sceneTagType(val) {
      const map = { LIVE: "warning", WINDOW: "" };
      return map[val] || "info";
    },
    selectDateRange(v) {
      if (!v || v.length !== 2) {
        this.searchForm.startTime = null;
        this.searchForm.endTime = null;
        return;
      }
      const start = v[0] ? new Date(`${v[0]}T00:00:00`).getTime() : null;
      const end = v[1] ? new Date(`${v[1]}T23:59:59`).getTime() : null;
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
      getWxChannelsOrderPage(params)
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
