<template>
  <div>
    <el-card>
      <el-tabs v-model="searchForm.status">
        <el-tab-pane
          v-for="(item, index) in tabs"
          :key="index"
          :name="item.status"
          :label="item.title"
        />
      </el-tabs>

      <el-table :data="liveData" style="width: 100%">
        <el-table-column prop="name" label="直播标题" />
        <el-table-column prop="anchorName" label="主播昵称" />
        <el-table-column label="直播开始时间">
          <template #default="{ row }">
            <span v-if="row">{{ $filters.unixToDate(row.startTime) }}</span>
          </template>
        </el-table-column>
        <el-table-column label="直播结束时间">
          <template #default="{ row }">
            <span v-if="row">{{ $filters.unixToDate(row.endTime) }}</span>
          </template>
        </el-table-column>
        <el-table-column label="是否推荐" align="center">
          <template #default="{ row, $index }">
            <el-switch
              v-if="row"
              v-model="row.recommend"
              inline-prompt
              active-text="是"
              inactive-text="否"
              @change="star(row, $index)"
            />
          </template>
        </el-table-column>
        <el-table-column label="直播状态">
          <template #default="{ row }">
            <template v-if="row">
              <el-tag v-if="row.status == 'NEW'" type="primary">未开始</el-tag>
              <el-tag v-else-if="row.status == 'START'" type="success">直播中</el-tag>
              <el-tag v-else type="warning">已结束</el-tag>
            </template>
          </template>
        </el-table-column>
        <el-table-column label="操作">
          <template #default="{ row }">
            <a v-if="row" class="link-text" @click="getLiveDetail(row)">查看</a>
          </template>
        </el-table-column>
      </el-table>

      <div class="mt_10 page" style="display: flex; justify-content: flex-end; margin: 20px 0">
        <el-pagination
          :current-page="searchForm.pageNumber"
          :page-size="searchForm.pageSize"
          :page-sizes="[20, 50, 100]"
          :total="total"
          layout="total, sizes, prev, pager, next, jumper"
          size="small"
          @current-change="changePageNumber"
          @size-change="changePageSize"
        />
      </div>
    </el-card>
  </div>
</template>

<script>
import { getLiveList, whetherStar } from "@/api/promotion.js";
export default {
  data() {
    return {
      total: 0,
      searchForm: {
        pageSize: 20,
        pageNumber: 1,
        status: "NEW",
      },
      tabs: [
        { title: "直播中", status: "START" },
        { title: "未开始", status: "NEW" },
        { title: "已结束", status: "END" },
      ],
      liveData: [],
    };
  },
  watch: {
    "searchForm.status": {
      handler() {
        this.liveData = [];
        this.getStoreLives();
      },
      deep: true,
    },
  },
  mounted() {
    this.getStoreLives();
  },
  methods: {
    async star(val, index) {
      const switched = this.liveData[index].recommend;
      try {
        const res = await whetherStar({ id: val.id, recommend: switched });
        if (res.success) {
          this.getStoreLives();
          return;
        }
        this.liveData[index].recommend = !switched;
      } catch (e) {
        this.liveData[index].recommend = !switched;
      }
    },
    changePageSize(val) {
      this.searchForm.pageSize = val;
      this.getStoreLives();
    },
    changePageNumber(val) {
      this.searchForm.pageNumber = val;
      this.getStoreLives();
    },
    async getStoreLives() {
      let result = await getLiveList(this.searchForm);
      if (result.success) {
        this.liveData = result.result.records;
        this.total = result.result.total;
      }
    },
    getLiveDetail(val) {
      this.$router.push({
        path: "/live-detail",
        query: { ...val, liveStatus: this.searchForm.status },
      });
    },
  },
};
</script>

<style lang="scss" scoped>
.btns {
  margin-bottom: 10px;
  margin-top: 10px;
}
.page {
  margin-top: 20px;
}
</style>
