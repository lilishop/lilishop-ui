<template>
  <div class="search seckill">
    <el-card>
      <el-form
        ref="searchForm"
        :model="searchForm"
        inline
        label-width="70px"
        class="search-form"
        @keyup.enter="handleSearch"
      >
        <el-form-item label="活动名称" prop="promotionName">
          <el-input
            v-model="searchForm.promotionName"
            placeholder="请输入活动名称"
            clearable
            style="width: 240px"
          />
        </el-form-item>
        <el-form-item label="活动状态" prop="promotionStatus">
          <el-select
            v-model="searchForm.promotionStatus"
            placeholder="请选择"
            clearable
            style="width: 240px"
          >
            <el-option label="未开始" value="NEW" />
            <el-option label="已开始/上架" value="START" />
            <el-option label="已结束/下架" value="END" />
            <el-option label="紧急关闭/作废" value="CLOSE" />
          </el-select>
        </el-form-item>
        <el-form-item label="活动时间">
          <el-date-picker
            v-model="selectDate"
            type="daterange"
            clearable
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            style="width: 240px"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" class="search-btn" @click="handleSearch">搜索</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-card>
      <el-tabs v-model="activeTab" class="mt_10">
        <el-tab-pane label="秒杀活动列表" name="list">
          <el-table
            ref="table"
            v-loading="loading"
            border
            :data="data"
            class="mt_10"
            style="width: 100%"
          >
            <el-table-column
              prop="promotionName"
              label="活动名称"
              min-width="140"
              show-overflow-tooltip
            />
            <el-table-column prop="startTime" label="开始时间" width="180" />
            <el-table-column prop="applyEndTime" label="申请截止时间" width="180" />
            <el-table-column label="活动状态" width="110">
              <template #default="{ row }">
                <el-tag v-if="row" :type="promotionStatusTagType(row.promotionStatus)">
                  {{ promotionStatusText(row.promotionStatus) }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column
              prop="seckillRule"
              label="申请规则"
              min-width="120"
              show-overflow-tooltip
            />
            <el-table-column label="操作" width="250" align="center" fixed="right">
              <template #default="{ row }">
                <template v-if="row">
                  <a
                    v-if="row.promotionStatus === 'CLOSE' || row.promotionStatus === 'NEW'"
                    class="link-text"
                    @click="edit(row)"
                  >
                    编辑
                  </a>
                  <a v-else class="link-text" @click="manage(row)">查看</a>
                  <span v-if="row.promotionStatus" class="op-split">|</span>
                  <a
                    v-if="row.promotionStatus == 'NEW'"
                    class="link-text"
                    @click="manage(row)"
                  >
                    管理
                  </a>
                  <span v-if="row.promotionStatus == 'NEW'" class="op-split">|</span>
                  <a
                    v-if="row.promotionStatus == 'START' || row.promotionStatus == 'NEW'"
                    class="link-text"
                    @click="off(row)"
                  >
                    关闭
                  </a>
                </template>
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
        </el-tab-pane>
        <el-tab-pane label="秒杀活动设置" name="setup" lazy>
          <setupSeckill />
        </el-tab-pane>
      </el-tabs>
    </el-card>
  </div>
</template>

<script>
import { getSeckillList, delSeckill, updateSeckillStatus } from "@/api/promotion";
import setupSeckill from "@/views/promotions/seckill/seckill-setup";

export default {
  name: "seckill",
  components: {
    setupSeckill,
  },
  data() {
    return {
      activeTab: "list",
      selectDate: [],
      loading: true,
      searchForm: {
        pageNumber: 1,
        pageSize: 20,
        sort: "createTime",
        order: "desc",
      },
      data: [],
      total: 0,
    };
  },
  methods: {
    promotionStatusText(status) {
      const map = {
        NEW: "未开始",
        START: "已开始",
        END: "已结束",
        CLOSE: "已关闭",
      };
      return map[status] || "未知";
    },
    promotionStatusTagType(status) {
      const map = {
        NEW: "info",
        START: "success",
        END: "danger",
        CLOSE: "danger",
      };
      return map[status] || "danger";
    },
    init() {
      this.getDataList();
    },
    changePage(v) {
      this.searchForm.pageNumber = v;
      this.getDataList();
    },
    changePageSize(v) {
      this.searchForm.pageNumber = 1;
      this.searchForm.pageSize = v;
      this.getDataList();
    },
    handleSearch() {
      this.searchForm.pageNumber = 1;
      this.searchForm.pageSize = 20;
      this.getDataList();
    },
    edit(v) {
      this.$router.push({ name: "manager-seckill-add", query: { id: v.id } });
    },
    manage(v) {
      this.$router.push({ name: "seckill-goods", query: { id: v.id } });
    },
    off(v) {
      this.$Modal.confirm({
        title: "提示",
        content: "您确定要下架该活动吗？",
        onOk: () => {
          updateSeckillStatus(v.id).then((res) => {
            if (res.success) {
              this.$Message.success("下架成功");
              this.getDataList();
            }
          });
        },
      });
    },
    expire(v) {
      this.$Modal.confirm({
        title: "提示",
        content: "您确定要作废该活动吗？",
        onOk: () => {
          delSeckill(v.id).then((res) => {
            if (res.success) {
              this.$Message.success("作废成功");
              this.getDataList();
            }
          });
        },
      });
    },
    getDataList() {
      this.loading = true;
      if (this.selectDate && this.selectDate[0] && this.selectDate[1]) {
        this.searchForm.startTime = new Date(this.selectDate[0]).getTime();
        this.searchForm.endTime = new Date(this.selectDate[1]).getTime();
      } else {
        this.searchForm.startTime = null;
        this.searchForm.endTime = null;
      }
      getSeckillList(this.searchForm)
        .then((res) => {
          if (res.success) {
            this.data = res.result.records;
            this.total = res.result.total;
          }
        })
        .finally(() => {
          this.loading = false;
        });
    },
  },
  mounted() {
    this.init();
  },
};
</script>

<style lang="scss" scoped>
.link-text {
  color: #409eff;
  cursor: pointer;
  text-decoration: none;
  margin-right: 5px;
}
.op-split {
  margin: 0 8px;
  color: #dcdee2;
}
.mt_10 {
  margin-top: 10px;
}
</style>
