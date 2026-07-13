<template>
  <div class="live-list search">
    <el-card>
      <el-form
        ref="searchForm"
        :model="searchForm"
        inline
        label-width="90px"
        class="search-form"
        @keyup.enter="handleSearch"
      >
        <el-form-item label="直播标题" prop="title">
          <el-input
            v-model="searchForm.title"
            placeholder="请输入直播标题"
            clearable
            style="width: 240px"
          />
        </el-form-item>
        <el-form-item label="店铺名称" prop="storeName">
          <el-input
            v-model="searchForm.storeName"
            placeholder="请输入店铺名称"
            clearable
            style="width: 240px"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" class="search-btn" @click="handleSearch">搜索</el-button>
          <el-button @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-card class="mt_10">
      <el-tabs v-model="activeStatus" @tab-change="handleTabChange">
        <el-tab-pane label="全部" name="" />
        <el-tab-pane label="未开始" name="NEW" />
        <el-tab-pane label="直播中" name="LIVING" />
        <el-tab-pane label="已结束" name="ENDED" />
      </el-tabs>

      <div class="toolbar">
        <el-button type="primary" @click="handleAdd">创建直播</el-button>
      </div>

      <el-table
        ref="table"
        v-loading="loading"
        border
        :data="data"
        class="mt_10"
        style="width: 100%"
      >
        <el-table-column prop="id" label="直播间ID" width="120" />
        <el-table-column label="直播封面" width="120">
          <template #default="{ row }">
            <el-image
              v-if="row && row.coverImg"
              :src="row.coverImg"
              style="width: 80px; height: 60px"
              fit="cover"
            />
            <span v-else class="text-muted">暂无封面</span>
          </template>
        </el-table-column>
        <el-table-column prop="title" label="直播标题" min-width="180" show-overflow-tooltip />
        <el-table-column label="直播状态" width="110">
          <template #default="{ row }">
            <el-tag v-if="row" :type="liveStatusTagType(row.liveStatus)">
              {{ liveStatusText(row.liveStatus) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="开始时间" width="170">
          <template #default="{ row }">{{ row.startTime }}</template>
        </el-table-column>
        <el-table-column label="结束时间" width="170">
          <template #default="{ row }">{{ row.endTime }}</template>
        </el-table-column>
        <el-table-column prop="storeName" label="店铺名称" min-width="140" show-overflow-tooltip />
        <el-table-column label="操作" width="300" align="center" fixed="right">
          <template #default="{ row }">
            <template v-if="row">
              <!-- <a class="link-text" @click="handleView(row)">查看</a>
              <span class="op-split">|</span> -->
              <template v-if="row.liveStatus === 'NEW'">
                <a class="link-text" @click="handleEdit(row)">编辑</a>
                <span class="op-split">|</span>
              </template>
              <a class="link-text" @click="handleControl(row)">中控台</a>
              <span class="op-split">|</span>
              <a class="link-text" @click="handleShare(row)">分享</a>
              <template v-if="row.liveStatus === 'NEW'">
                <span class="op-split">|</span>
                <a class="link-text" @click="handleStart(row)">开播</a>
              </template>
              <template v-if="row.liveStatus === 'LIVING'">
                <span class="op-split">|</span>
                <a class="link-text" @click="handleEnd(row)">结束</a>
              </template>
            </template>
          </template>
        </el-table-column>
      </el-table>

      <div class="mt_10" style="display: flex; justify-content: flex-end">
        <el-pagination
          v-model:current-page="searchForm.pageNumber"
          v-model:page-size="searchForm.pageSize"
          :page-sizes="[10, 20, 50]"
          :total="total"
          layout="total, sizes, prev, pager, next, jumper"
          size="small"
          @current-change="getData"
          @size-change="changePageSize"
        />
      </div>
    </el-card>

    <el-dialog v-model="shareVisible" title="分享直播" width="560px">
      <p class="share-title">{{ shareTitle }}</p>
      <el-form label-width="60px">
        <el-form-item label="H5">
          <div style="display: flex; gap: 8px; width: 100%">
            <el-input :model-value="shareH5Url" readonly />
            <el-button type="primary" @click="copyShareUrl">复制</el-button>
          </div>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button type="primary" @click="shareVisible = false">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script>
import { queryLivePage, startLive, endLive } from "@/api/live";
import { getSetting } from "@/api/index";
import config from "@/config";

export default {
  name: "live-list",
  data() {
    return {
      loading: false,
      data: [],
      total: 0,
      activeStatus: "",
      searchForm: {
        pageNumber: 1,
        pageSize: 20,
        title: "",
        storeName: "",
      },
      shareVisible: false,
      shareTitle: "",
      shareH5Url: "",
      wapUrl: "",
    };
  },
  mounted() {
    this.loadWapSetting();
    this.getData();
  },
  methods: {
    formatTime(time) {
      if (!time) return "-";
      return this.$filters.unixToDate(time);
    },
    liveStatusText(status) {
      const map = { NEW: "未开始", LIVING: "直播中", ENDED: "已结束" };
      return map[status] || "未知";
    },
    liveStatusTagType(status) {
      const map = { NEW: "info", LIVING: "success", ENDED: "warning" };
      return map[status] || "info";
    },
    buildParams() {
      const params = {
        pageNumber: this.searchForm.pageNumber,
        pageSize: this.searchForm.pageSize,
      };
      if (this.searchForm.title) params.title = this.searchForm.title;
      if (this.searchForm.storeName) params.storeName = this.searchForm.storeName;
      if (this.activeStatus) params.liveStatus = this.activeStatus;
      return params;
    },
    getData() {
      this.loading = true;
      queryLivePage(this.buildParams())
        .then((res) => {
          this.loading = false;
          if (res.success) {
            this.data = res.result?.records || [];
            this.total = res.result?.total || 0;
          }
        })
        .catch(() => {
          this.loading = false;
        });
    },
    handleSearch() {
      this.searchForm.pageNumber = 1;
      this.getData();
    },
    handleReset() {
      this.searchForm.title = "";
      this.searchForm.storeName = "";
      this.searchForm.pageNumber = 1;
      this.getData();
    },
    handleTabChange() {
      this.searchForm.pageNumber = 1;
      this.getData();
    },
    changePageSize() {
      this.searchForm.pageNumber = 1;
      this.getData();
    },
    handleAdd() {
      this.$router.push({ path: "/live-add" });
    },
    handleView(row) {
      this.$router.push({ path: "/live-manage-detail", query: { id: row.id } });
    },
    handleEdit(row) {
      this.$router.push({ path: "/live-edit", query: { id: row.id } });
    },
    handleControl(row) {
      const route = this.$router.resolve({
        path: "/live-control-panel",
        query: { id: row.id },
      });
      window.open(route.href, "_blank");
    },
    buildH5ShareUrl(liveId) {
      const base = (this.wapUrl || BASE?.WAP_URL || config.website || "").replace(/\/?$/, "/");
      return `${base}pages/promotion/live/room?id=${liveId}`;
    },
    handleShare(row) {
      this.shareTitle = row.title || "";
      this.shareH5Url = this.buildH5ShareUrl(row.id);
      this.shareVisible = true;
    },
    copyShareUrl() {
      if (!this.shareH5Url) return;
      this.copyText(this.shareH5Url);
    },
    copyText(text) {
      const onSuccess = () => this.$Message.success("链接已复制");
      const onFail = () => this.$Message.error("复制失败，请手动复制");

      if (navigator.clipboard?.writeText) {
        navigator.clipboard
          .writeText(text)
          .then(onSuccess)
          .catch(() => {
            this.copyTextFallback(text) ? onSuccess() : onFail();
          });
        return;
      }

      this.copyTextFallback(text) ? onSuccess() : onFail();
    },
    copyTextFallback(text) {
      const textArea = document.createElement("textarea");
      textArea.value = text;
      textArea.style.position = "fixed";
      textArea.style.left = "-9999px";
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      let ok = false;
      try {
        ok = document.execCommand("copy");
      } catch (e) {
        ok = false;
      }
      document.body.removeChild(textArea);
      return ok;
    },
    handleStart(row) {
      if (row.liveStatus === "LIVING") {
        this.$Message.warning("直播间已在直播中");
        return;
      }
      if (row.liveStatus === "ENDED") {
        this.$Message.warning("直播已结束，无法开播");
        return;
      }
      this.$Modal.confirm({
        title: "确认开播",
        content: "确定要开始该直播吗？",
        onOk: () => {
          return startLive(row.id).then((res) => {
            if (res.success) {
              this.$Message.success("开播成功");
              this.getData();
            }
          });
        },
      });
    },
    handleEnd(row) {
      if (row.liveStatus !== "LIVING") {
        this.$Message.warning("仅直播中的直播间可以结束");
        return;
      }
      this.$Modal.confirm({
        title: "确认结束",
        content: "确定要结束该直播吗？",
        onOk: () => {
          return endLive(row.id).then((res) => {
            if (res.success) {
              this.$Message.success("直播已结束");
              this.getData();
            }
          });
        },
      });
    },
    loadWapSetting() {
      getSetting("BASE_SETTING")
        .then((res) => {
          if (res.success && res.result?.buyerDomain) {
            this.wapUrl = res.result.buyerDomain;
          }
        })
        .catch(() => {});
    },
  },
};
</script>

<style lang="scss" scoped>
.live-list {
  .toolbar {
    margin-bottom: 12px;
  }
  .text-muted {
    color: #909399;
    font-size: 12px;
  }
  .share-title {
    margin: 0 0 16px;
    color: #606266;
  }
}
</style>
