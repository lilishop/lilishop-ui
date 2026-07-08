<template>
  <div class="search">
    <el-card>
      <el-form ref="searchForm" :model="searchForm" inline label-width="70px" class="search-form" @keyup.enter="handleSearch">
        <el-form-item label="搜索日志" prop="searchKey">
          <el-input v-model="searchForm.searchKey" placeholder="请输入搜索日志内容" clearable style="width: 240px" />
        </el-form-item>
        <el-form-item label="操作人" prop="operatorName">
          <el-input v-model="searchForm.operatorName" placeholder="请输入操作人" clearable style="width: 240px" />
        </el-form-item>
        <el-form-item label="创建时间">
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
          <el-button type="primary" class="search-btn" @click="handleSearch">搜索</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-card>
      <el-table
        v-loading="loading"
        border
        :data="data"
        ref="table"
        style="width: 100%"
      >
        <el-table-column prop="name" label="操作名称" min-width="100" fixed="left" show-overflow-tooltip />
        <el-table-column prop="customerLog" label="日志内容" min-width="120" fixed="left" show-overflow-tooltip />
        <el-table-column prop="username" label="操作用户" width="115" />
        <el-table-column prop="ip" label="IP" width="150" />
        <el-table-column prop="ipInfo" label="IP信息" width="150" show-overflow-tooltip />
        <el-table-column prop="requestUrl" label="请求路径" width="150" show-overflow-tooltip />
        <el-table-column prop="requestType" label="请求类型" width="130" align="center" />
        <el-table-column prop="requestParam" label="请求参数" min-width="100" show-overflow-tooltip />
        <el-table-column prop="costTime" label="耗时-毫秒" width="140" align="center" />
        <el-table-column label="操作时间" width="170" align="center">
          <template #default="{ row }">
            <span v-if="row">{{ unixToDate(row.createTime / 1000) }}</span>
          </template>
        </el-table-column>
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
    </el-card>
  </div>
</template>

<script>
import { ElMessage } from "element-plus";
import { unixToDate } from "@/utils/filters";
import { getLogListData } from "@/api/index";

export default {
  name: "log-manage",
  data() {
    return {
      loading: true,
      selectDate: null,
      searchForm: {
        type: 1,
        searchKey: "",
        operatorName: "",
        pageNumber: 1,
        pageSize: 20,
        startDate: "",
        endDate: "",
        sort: "createTime",
        order: "desc",
      },
      data: [],
      total: 0,
    };
  },
  methods: {
    unixToDate,
    init() {
      this.getLogList();
    },
    changePage(v) {
      this.searchForm.pageNumber = v;
      this.getLogList();
    },
    changePageSize(v) {
      this.searchForm.pageNumber = 1;
      this.searchForm.pageSize = v;
      this.getLogList();
    },
    selectDateRange(v) {
      if (v && v.length === 2) {
        this.searchForm.startDate = v[0];
        this.searchForm.endDate = v[1];
      } else {
        this.searchForm.startDate = "";
        this.searchForm.endDate = "";
      }
    },
    handleSearch() {
      this.searchForm.pageNumber = 1;
      if (this.selectDate && this.selectDate.length === 2) {
        this.searchForm.startDate = this.selectDate[0];
        this.searchForm.endDate = this.selectDate[1];
      }
      this.getLogList();
    },
    getLogList() {
      this.loading = true;
      getLogListData(this.searchForm).then((res) => {
        this.loading = false;
        if (res && res.success) {
          this.data = res.result.records;
          this.total = res.result.total;
        } else {
          this.data = [];
          this.total = 0;
          ElMessage.error((res && res.message) || "日志查询失败");
        }
      });
    },
  },
  mounted() {
    this.init();
  },
};
</script>
