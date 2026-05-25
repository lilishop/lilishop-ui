<template>
  <div class="wrapper">
    <div class="content">
      <div>
        <div class="tables">
          <el-table v-loading="loading" border height="350" :data="data" style="width: 100%">
            <el-table-column prop="name" label="专题名称" show-overflow-tooltip />
            <el-table-column label="操作" width="100" fixed="right" align="center">
              <template #default="{ row, $index }">
                <el-button
                  v-if="row"
                  :type="index === $index ? 'primary' : 'default'"
                  size="small"
                  @click="selectRow(row, $index)"
                >
                  {{ index === $index ? "已选" : "选择" }}
                </el-button>
              </template>
            </el-table-column>
          </el-table>

          <el-pagination
            v-model:current-page="params.pageNumber"
            v-model:page-size="params.pageSize"
            class="mt_10"
            :total="Number(total)"
            layout="prev, pager, next, jumper"
            size="small"
            @current-change="changePageNum"
            @size-change="changePageSize"
          />
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import { getHomeList } from "@/api/other.js";
export default {
  data() {
    return {
      loading: true,
      index: 999,
      data: [],
      params: {
        sort: "createTime",
        order: "desc",
        pageClientType: "H5",
        pageNumber: 1,
        pageSize: 20,
        pageType: "SPECIAL",
      },
      total: 0,
    };
  },
  mounted() {
    this.init();
  },
  methods: {
    selectRow(row, idx) {
      this.index = idx;
      const payload = { ...row, pageType: "special", ___type: "special" };
      this.$emit("selected", [payload]);
    },
    changePageNum(val) {
      this.params.pageNumber = val;
      this.init();
    },
    changePageSize(val) {
      this.params.pageNumber = 1;
      this.params.pageSize = val;
      this.init();
    },
    async init() {
      this.params.pageClientType = this.$route.name === "renovation" ? "PC" : "H5";
      const res = await getHomeList(this.params);
      if (res.success) {
        this.loading = false;
        this.data = res.result.records;
        this.total = res.result.total;
      } else {
        this.loading = false;
      }
    },
  },
};
</script>
<style lang="scss" scoped>
img {
  max-width: 100% !important;
}
.search {
  width: 300px;
}
.page {
  margin-top: 2vh;
  text-align: right;
}
.tables {
  height: 400px;
  margin-top: 20px;
  overflow: auto;
  width: 100%;
}
.content {
  overflow: hidden;
  flex: 4;
}
.wrapper {
  overflow: hidden;
}
</style>
