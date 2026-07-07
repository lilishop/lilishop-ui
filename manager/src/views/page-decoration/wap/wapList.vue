<template>
  <div class="search">
    <el-card shadow="never">
      <el-tabs v-model="params.pageType" class="page-type-tabs" @tab-change="handleTabChange">
        <el-tab-pane
          v-for="typeItem in pageTypes"
          :key="typeItem.type"
          :name="typeItem.type"
          :label="typeItem.title"
        />
      </el-tabs>
      <div class="operation mb_10">
        <el-button type="primary" @click="handleAdd()">添加页面</el-button>
        <el-button @click="goThemeSetting">主题色设置</el-button>
      </div>
      <el-table v-loading="loading" :data="list" style="width: 100%">
        <el-table-column prop="name" label="页面名称" min-width="200" show-overflow-tooltip>
          <template #default="{ row }">
            <span v-if="row">{{ row.name || "暂无模板昵称" }}</span>
          </template>
        </el-table-column>
        <el-table-column label="状态" width="120" align="center">
          <template #default="{ row }">
            <el-switch
              v-if="row"
              v-model="row.pageShow"
              inline-prompt
              active-text="开"
              inactive-text="关"
              @change="changeSwitch(row)"
            />
          </template>
        </el-table-column>
        <el-table-column label="操作" width="140" align="center" fixed="right">
          <template #default="{ row }">
            <template v-if="row">
              <a class="link-text" @click="handleEdit(row)">修改</a>
              <span class="op-split">|</span>
              <a class="link-text" @click="confirmDel(row)">删除</a>
            </template>
          </template>
        </el-table-column>
      </el-table>
      <div class="mt_10" style="display: flex; justify-content: flex-end">
        <el-pagination
          v-model:current-page="params.pageNumber"
          v-model:page-size="params.pageSize"
          :total="total"
          :page-sizes="[20, 50, 100]"
          layout="total, sizes, prev, pager, next, jumper"
          size="small"
          background
          @current-change="changePageNum"
          @size-change="changePageSize"
        />
      </div>
    </el-card>
  </div>
</template>
<script>
import * as API_Other from "@/api/other.js";
export default {
  data() {
    return {
      loading: false,
      pageTypes: [
        { type: "INDEX", title: "首页" },
        { type: "SPECIAL", title: "专题" },
      ],
      params: {
        pageNumber: 1,
        pageSize: 20,
        sort: "createTime",
        order: "desc",
        pageType: "INDEX",
        pageClientType: "H5",
      },
      total: 0,
      list: [],
    };
  },
  mounted() {
    this.init();
  },
  methods: {
    handleTabChange(val) {
      if (val == "ALERT") {
        this.$router.push({
          path: "/floorList/main",
          query: { pagetype: val },
        });
        return;
      }
      if (val == "OPEN_SCREEN_ANIMATION") {
        this.$router.push({
          path: "/floorList/main",
          query: { pagetype: val },
        });
        return;
      }
      this.params.pageNumber = 1;
      this.params.pageType = val;
      this.init();
    },

    changePageNum(val) {
      this.params.pageNumber = val;
      this.init();
    },
    changeSwitch(item) {
      this.loading = true;
      API_Other.releasePageHome(item.id).then((res) => {
        this.loading = false;
        if (res.result) {
          this.$Message.success("发布成功");
          this.init();
        }
      });
    },
    init() {
      this.loading = true;
      API_Other.getHomeList(this.params).then((res) => {
        this.loading = false;
        if (!res.result) return false;
        res.result.records.forEach((item) => {
          if (item.pageShow == "OPEN") {
            item.pageShow = true;
          } else {
            item.pageShow = false;
          }
        });
        this.list = res.result.records;
        this.total = res.result.total;
      });
    },
    handleEdit(val) {
      this.$router.push({
        path: "/floorList/main",
        query: {
          id: val.id,
          name: val.name,
          type: val.pageShow,
          pagetype: this.params.pageType,
        },
      });
    },
    handleAdd() {
      this.$router.push({
        path: "/floorList/main",
        query: { pagetype: this.params.pageType },
      });
    },
    goThemeSetting() {
      this.$router.push({ name: "theme-setting" });
    },
    changePageSize(v) {
      this.params.pageNumber = 1;
      this.params.pageSize = v;
      this.init();
    },
    confirmDel(row) {
      this.$Modal.confirm({
        title: "提示",
        content: "删除此模板？",
        onOk: () => this.handleDel(row),
      });
    },
    handleDel(val) {
      this.loading = true;
      API_Other.removePageHome(val.id).then((res) => {
        this.loading = false;
        if (res.result) {
          this.init();
          this.$Message.success("删除成功");
        }
      });
    },
  },
};
</script>
<style scoped lang="scss">
.page-type-tabs {
  margin-bottom: 16px;
}
</style>
