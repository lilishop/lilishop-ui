<template>
  <div class="search">
    <el-card>
      <el-tabs v-model="activeTab" @tab-change="onTabChange">
        <el-tab-pane label="订单核销" name="verify">
          <el-form class="verify-form" @submit.prevent>
            <el-form-item label="核销码">
              <el-input
                v-model="code"
                placeholder="请输入核销码"
                clearable
                maxlength="32"
                style="width: 280px"
                @keyup.enter="confirmVerify"
              />
            </el-form-item>
            <el-form-item>
              <el-button type="primary" :loading="lookingUp" @click="confirmVerify">确定</el-button>
            </el-form-item>
          </el-form>
        </el-tab-pane>
        <el-tab-pane label="核销记录" name="records">
          <el-table v-loading="loading" :data="records" border style="width: 100%">
            <el-table-column prop="code" label="核销码" min-width="120" />
            <el-table-column prop="orderSn" label="订单编号" min-width="200" show-overflow-tooltip />
            <el-table-column prop="orderItemSn" label="订单货物编号" min-width="200" show-overflow-tooltip />
            <el-table-column label="商品信息" min-width="260">
              <template #default="{ row }">
                <div v-if="row" class="goods-cell">
                  <img v-if="row.image" :src="row.image" class="goods-image" alt="" />
                  <div>
                    <div>{{ row.goodsName || "—" }}</div>
                    <div v-if="specText(row.specs)" class="goods-spec">{{ specText(row.specs) }}</div>
                  </div>
                </div>
              </template>
            </el-table-column>
            <el-table-column prop="verifiedTime" label="核销时间" width="170" />
            <el-table-column prop="verifierName" label="核销员" min-width="120" show-overflow-tooltip />
          </el-table>
          <div class="pager">
            <el-pagination
              v-model:current-page="pageNumber"
              v-model:page-size="pageSize"
              :page-sizes="[10, 20, 50]"
              :total="total"
              layout="total, sizes, prev, pager, next, jumper"
              size="small"
              @current-change="loadRecords"
              @size-change="onSizeChange"
            />
          </div>
        </el-tab-pane>
      </el-tabs>
    </el-card>

    <el-dialog v-model="confirmVisible" title="确认核销" width="720px" :close-on-click-modal="false">
      <div class="preview-meta">
        <span>核销码：{{ preview.code || "—" }}</span>
        <span>订单编号：{{ preview.orderSn || "—" }}</span>
      </div>
      <el-table :data="preview.goods || []" border>
        <el-table-column prop="orderItemSn" label="订单货物编号" min-width="180" show-overflow-tooltip />
        <el-table-column label="商品信息" min-width="260">
          <template #default="{ row }">
            <div v-if="row" class="goods-cell">
              <img v-if="row.image" :src="row.image" class="goods-image" alt="" />
              <div>
                <div>{{ row.goodsName || "—" }}</div>
                <div v-if="specText(row.specs)" class="goods-spec">{{ specText(row.specs) }}</div>
              </div>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="num" label="数量" width="80" />
      </el-table>
      <template #footer>
        <el-button @click="confirmVisible = false">取消</el-button>
        <el-button type="primary" :loading="submitting" @click="submitVerify">确认核销</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script>
import { confirmVerification, getVerificationRecords, previewVerification } from "@/api/order";

export default {
  name: "orderVerification",
  data() {
    return {
      activeTab: "verify",
      code: "",
      lookingUp: false,
      submitting: false,
      confirmVisible: false,
      preview: {
        code: "",
        orderSn: "",
        goods: [],
      },
      loading: false,
      records: [],
      total: 0,
      pageNumber: 1,
      pageSize: 20,
    };
  },
  methods: {
    specText(specs) {
      if (!specs) return "";
      try {
        const obj = typeof specs === "string" ? JSON.parse(specs) : specs;
        if (!obj || typeof obj !== "object") return "";
        return Object.keys(obj)
          .filter((key) => key !== "images")
          .map((key) => `${key}：${obj[key]}`)
          .join(" ");
      } catch (e) {
        return "";
      }
    },
    confirmVerify() {
      const code = (this.code || "").trim();
      if (!code) {
        this.$Message.warning("请输入核销码");
        return;
      }
      this.lookingUp = true;
      previewVerification(code)
        .then((res) => {
          this.lookingUp = false;
          if (res.success && res.result) {
            this.preview = {
              code: res.result.code || code,
              orderSn: res.result.orderSn || "",
              goods: res.result.goods || [],
            };
            this.confirmVisible = true;
          }
        })
        .catch(() => {
          this.lookingUp = false;
        });
    },
    submitVerify() {
      const code = (this.preview.code || "").trim();
      if (!code) {
        this.$Message.warning("请输入核销码");
        return;
      }
      this.submitting = true;
      confirmVerification(code)
        .then((res) => {
          this.submitting = false;
          if (res.success) {
            this.$Message.success(res.result || "核销成功");
            this.confirmVisible = false;
            this.code = "";
            this.preview = { code: "", orderSn: "", goods: [] };
            this.pageNumber = 1;
            this.loadRecords();
          }
        })
        .catch(() => {
          this.submitting = false;
        });
    },
    onTabChange(name) {
      if (name === "records") {
        this.loadRecords();
      }
    },
    onSizeChange() {
      this.pageNumber = 1;
      this.loadRecords();
    },
    loadRecords() {
      this.loading = true;
      getVerificationRecords({
        pageNumber: this.pageNumber,
        pageSize: this.pageSize,
      })
        .then((res) => {
          this.loading = false;
          if (res.success) {
            this.records = res.result.records || [];
            this.total = res.result.total || 0;
          }
        })
        .catch(() => {
          this.loading = false;
        });
    },
  },
};
</script>

<style lang="scss" scoped>
.verify-form {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 12px 0 4px;
}
.preview-meta {
  display: flex;
  gap: 24px;
  margin-bottom: 12px;
  color: #303133;
}
.goods-cell {
  display: flex;
  align-items: center;
  gap: 10px;
}
.goods-image {
  width: 48px;
  height: 48px;
  object-fit: cover;
  flex-shrink: 0;
}
.goods-spec {
  margin-top: 4px;
  color: #909399;
  font-size: 12px;
}
.pager {
  display: flex;
  justify-content: flex-end;
  margin-top: 12px;
}
</style>
