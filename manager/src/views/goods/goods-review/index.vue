<template>
  <div>
    <el-card>
      <el-form
        ref="searchForm"
        :model="searchForm"
        inline
        label-width="70px"
        class="search-form"
        @keyup.enter="handleSearch"
      >
        <el-form-item label="会员名称" prop="memberName">
          <el-input
            v-model="searchForm.memberName"
            placeholder="请输入会员名称"
            clearable
            style="width: 240px"
          />
        </el-form-item>
        <el-form-item label="商品名称" prop="goodsName">
          <el-input
            v-model="searchForm.goodsName"
            placeholder="请输入商品名称"
            clearable
            style="width: 240px"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" class="search-btn" @click="handleSearch">搜索</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-card>
      <el-table ref="table" v-loading="loading" border :data="data" class="mt_10" style="width: 100%">
        <el-table-column prop="goodsName" label="商品名称" min-width="120" show-overflow-tooltip />
        <el-table-column prop="memberName" label="会员名称" min-width="120" show-overflow-tooltip />
        <el-table-column prop="content" label="评论内容" min-width="220" show-overflow-tooltip />
        <el-table-column label="是否置顶" width="100" align="center">
          <template #default="{ row }">
            <el-tag v-if="row" :type="row.top ? 'danger' : 'info'">
              {{ row.top ? "已置顶" : "未置顶" }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="评价" width="90">
          <template #default="{ row }">
            <el-tag v-if="row" :type="gradeTagType(row.grade)">{{ gradeText(row.grade) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="评价时间" width="170" />
        <el-table-column label="页面展示" width="100">
          <template #default="{ row }">
            <el-switch
              v-if="row"
              v-model="row.status"
              active-value="OPEN"
              inactive-value="CLOSE"
              inline-prompt
              active-text="展示"
              inactive-text="隐藏"
              @change="changeSwitch(row)"
            />
          </template>
        </el-table-column>
        <el-table-column label="操作" width="220" align="center" fixed="right">
          <template #default="{ row }">
            <div v-if="row" class="ops">
              <a class="link-text" @click="info(row)">查看</a>
              <span class="op-split">|</span>
              <a class="link-text" @click="updateTop(row)">{{ row.top ? "取消置顶" : "置顶评论" }}</a>
              <span class="op-split">|</span>
              <a class="link-text" @click="remove(row)">删除</a>
            </div>
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

    <el-dialog v-model="infoFlag" :title="infoTitle" width="800px" @closed="onInfoDialogClosed">
      <div class="info-list" style="overflow: hidden">
        <div class="left-container">
          <div class="product">
            <img class="img" :src="infoData.goodsImage" />
          </div>
          <div class="show">
            <label>页面展示：</label>
            <el-switch
              v-if="detailStatusReady"
              v-model="infoData.status"
              active-value="OPEN"
              inactive-value="CLOSE"
              inline-prompt
              active-text="展示"
              inactive-text="隐藏"
              style="margin-top: 3px"
              @change="changeSwitchView"
            />
          </div>
        </div>
        <div class="right-container">
          <div class="border-b">{{ infoData.goodsName }}</div>
          <div class="border-b">
            <div class="div-height">店铺名称：{{ infoData.storeName }}</div>
            <div class="div-height">订单号：{{ infoData.orderNo }}</div>
          </div>
          <div class="border-b">
            <div class="review-item">
              <el-avatar v-if="infoData.memberProfile" :src="infoData.memberProfile" :size="40" />
              <div class="review-meta">
                <div class="review-name">{{ infoData.memberName }}</div>
                <div class="review-content">{{ infoData.content }}</div>
              </div>
            </div>
            <div class="score-content">
              <span>物流评分：{{ infoData.deliveryScore }}</span>
              <span>服务评分：{{ infoData.serviceScore }}</span>
              <span>描述评分：{{ infoData.descriptionScore }}</span>
            </div>
            <div v-if="infoData.haveImage">
              评价图
              <div style="margin-left: 40px">
                <template v-if="infoData.images && infoData.images.length">
                  <img
                    v-for="(img, index) in infoData.images.split(',')"
                    :key="index"
                    style="width: 100px; height: 110px; margin-left: 2px"
                    :src="img"
                    alt=""
                  />
                </template>
              </div>
            </div>
          </div>
          <div v-if="infoData.reply" class="border-b">
            <div>
              <div style="float: left">商家回复：</div>
              <div style="margin-left: 60px">{{ infoData.reply }}</div>
            </div>
            <div v-if="infoData.haveReplyImage">
              <div style="margin-left: 60px">
                <template v-if="infoData.replyImage && infoData.replyImage.length">
                  <img
                    v-for="(img, index) in infoData.replyImage.split(',')"
                    :key="index"
                    style="width: 100px; height: 110px"
                    :src="img"
                    alt=""
                  />
                </template>
              </div>
            </div>
          </div>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import * as API_Member from "@/api/member";
import { ElMessage, ElMessageBox } from "element-plus";

export default {
  name: "goods-review",
  data() {
    return {
      infoData: {},
      infoFlag: false,
      infoTitle: "",
      currentReviewId: "",
      detailStatusReady: false,
      loading: true,
      searchForm: {
        pageNumber: 1,
        pageSize: 20,
        goodsName: "",
        sort: "createTime",
        order: "desc",
        startDate: "",
        endDate: "",
      },
      data: [],
      total: 0,
    };
  },
  methods: {
    gradeTagType(grade) {
      if (grade === "GOOD") return "success";
      if (grade === "MODERATE") return "warning";
      return "danger";
    },
    gradeText(grade) {
      if (grade === "GOOD") return "好评";
      if (grade === "MODERATE") return "中评";
      return "差评";
    },
    changeSwitchView(status) {
      if (!this.detailStatusReady || !this.currentReviewId) {
        return;
      }
      API_Member.updateMemberReview(this.currentReviewId, { status }).then((res) => {
        if (res.success) {
          ElMessage.success("修改成功!");
          this.getDataList();
        }
      });
    },
    init() {
      this.getDataList();
    },
    changePage(v) {
      this.searchForm.pageNumber = v;
      this.getDataList();
    },
    changePageSize(v) {
      this.searchForm.pageSize = v;
      this.getDataList();
    },
    handleSearch() {
      this.searchForm.pageNumber = 1;
      this.searchForm.pageSize = 20;
      this.getDataList();
    },
    changeSwitch(row) {
      if (!row || !row.id) {
        return;
      }
      API_Member.updateMemberReview(row.id, { status: row.status }).then((res) => {
        if (res.success) {
          this.getDataList();
        }
      });
    },
    updateTop(v) {
      const top = !v.top;
      API_Member.updateMemberReviewTop(v.id, { top }).then((res) => {
        if (res.success) {
          this.data = this.data.map((item) => {
            if (item.goodsId !== v.goodsId) {
              return item;
            }
            return {
              ...item,
              top: item.id === v.id ? top : false,
            };
          });
          ElMessage.success(top ? "置顶成功!" : "取消置顶成功!");
          this.init();
        }
      });
    },
    getDataList() {
      this.loading = true;
      API_Member.getMemberReview(this.searchForm)
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
    info(v) {
      this.currentReviewId = v.id;
      this.detailStatusReady = false;
      this.infoData = {};
      this.infoFlag = true;
      this.infoTitle = `用户${v.memberName}的评价详情`;
      API_Member.getMemberInfoReview(v.id).then((res) => {
        if (res.result) {
          this.infoData = res.result;
          this.$nextTick(() => {
            this.detailStatusReady = true;
          });
        }
      });
    },
    onInfoDialogClosed() {
      this.detailStatusReady = false;
      this.currentReviewId = "";
      this.infoData = {};
    },
    remove(v) {
      ElMessageBox.confirm("您确认要删除会员" + v.memberName + "的评论?", "确认删除", { type: "warning" }).then(() => {
        return API_Member.delMemberReview(v.id).then(() => {
          ElMessage.success("修改成功");
          this.init();
        });
      }).catch(() => {});
    },
  },
  mounted() {
    this.init();
  },
};
</script>

<style lang="scss" scoped>
.left-container {
  float: left;
}

.right-container {
  float: left;
  margin-left: 50px;
}

.img {
  width: 100%;
  height: 100%;
}
img {
  vertical-align: middle;
  border-style: none;
}
.product {
  width: 140px;
  height: 160px;
  border: 1px solid #d9d9d9;
  border-radius: 3px;
}
.show {
  label {
    font-size: 14px;
  }
  margin-top: 15px;
}

label {
  font-size: 12px;
  color: #666;
  margin-top: 4px;
  display: block;
  float: left;
  margin-right: 2px;
}
.border-b {
  border-bottom: 1px solid #e9e9e9;
  width: 500px;
  overflow: hidden;
  position: relative;
  margin-top: 12px;
}
.div-height {
  line-height: 25px;
}
.score-content {
  margin: 5px 0;
  span {
    margin-right: 20px;
  }
}
.review-item {
  display: flex;
  gap: 12px;
  margin-bottom: 8px;
}
.review-name {
  font-weight: 500;
}
.review-content {
  color: #666;
  margin-top: 4px;
}
.ops a {
  color: #2d8cf0;
  cursor: pointer;
  text-decoration: none;
}
.ops span {
  display: inline-block;
  margin: 0 8px;
  color: #dcdee2;
}
</style>
