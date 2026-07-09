<template>
  <div>
    <el-card>
      <el-form
        ref="searchForm"
        :model="searchForm"
        inline
        label-width="70px"
        class="search-form"
        @keyup.enter.prevent="handleSearch"
      >
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
      <div class="operation">
        <el-button type="primary" @click="add">添加</el-button>
      </div>

      <el-table
        ref="table"
        v-loading="loading"
        border
        :data="data"
        class="mt_10"
        style="width: 100%"
      >
        <el-table-column label="商品名称" min-width="250">
          <template #default="{ row }">
            <div v-if="row" class="goods-msg">
              <img :src="row.thumbnail" width="60" height="60" alt="" />
              <div>
                <div class="div-zoom">
                  <a class="link-text" @click="linkTo(row.goodsId, row.skuId)">{{ row.goodsName }}</a>
                </div>
                <el-popover trigger="hover" title="扫码在手机中查看" placement="top" width="180">
                  <template #reference>
                    <img
                      src="../../assets/qrcode.svg"
                      class="hover-pointer"
                      width="20"
                      height="20"
                      alt="qrcode"
                    />
                  </template>
                  <vue-qr
                    :text="wapLinkTo(row.goodsId, row.skuId)"
                    :margin="0"
                    color-dark="#000"
                    color-light="#fff"
                    :size="150"
                  />
                </el-popover>
              </div>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="商品价格" min-width="110">
          <template #default="{ row }">
            <span v-if="row" :style="{ color: $mainColor }">{{ $filters.unitPrice(row.price, "￥") }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="quantity" label="库存" min-width="80" />
        <el-table-column prop="createTime" label="添加时间" min-width="160" />
        <el-table-column label="佣金金额" min-width="110">
          <template #default="{ row }">
            <span v-if="row" :style="{ color: $mainColor }">
              {{ $filters.unitPrice(row.commission ?? 0, "￥") }}
            </span>
          </template>
        </el-table-column>
        <el-table-column label="操作" min-width="100" align="center" fixed="right">
          <template #default="{ row }">
            <a v-if="row" class="link-text" @click="remove(row)">删除</a>
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
          @current-change="changePage"
          @size-change="changePageSize"
        />
      </div>
    </el-card>

    <liliDialog ref="liliDialog" @selectedGoodsData="selectedGoodsData" />

    <el-dialog
      v-model="modalVisible"
      :title="modalTitle"
      width="500px"
      :close-on-click-modal="false"
      append-to-body
    >
      <el-form ref="form" :model="form" label-width="100px" :rules="formValidate">
        <el-form-item label="分销佣金" prop="commission">
          <el-input v-model="form.commission" clearable placeholder="请输入分销佣金" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="modalVisible = false">取消</el-button>
        <el-button type="primary" :loading="submitLoading" @click="handleSubmit">提交</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script>
import {
  getDistributionGoods,
  distributionGoodsCancel,
  distributionGoodsCheck,
} from "@/api/distribution";
import liliDialog from "@/views/lili-dialog";
import vueQr from "vue-qr";

export default {
  name: "distributionGoods",
  components: { liliDialog, vueQr },
  data() {
    return {
      modalVisible: false,
      modalTitle: "添加分销商品",
      submitLoading: false,
      loading: true,
      searchForm: {
        pageNumber: 1,
        pageSize: 10,
        sort: "createTime",
        order: "desc",
      },
      form: {
        commission: 1,
      },
      skuId: 0,
      formValidate: {
        commission: [
          { required: true, message: "请输入大于1小于9999的合法佣金金额", trigger: "blur" },
          {
            pattern: /^[1-9]\d{0,3}(\.\d{1,2})?$/,
            message: "请输入大于1小于9999的合法佣金金额",
            trigger: "blur",
          },
        ],
      },
      data: [],
      total: 0,
    };
  },
  methods: {
    init() {
      this.getDataList();
    },
    add() {
      this.$refs.liliDialog.goodsData = [];
      this.$refs.liliDialog.open("goods", "single");
    },
    selectedGoodsData(selected) {
      if (!selected?.length) return;
      this.modalVisible = true;
      this.form.commission = 1;
      this.modalTitle = "添加分销商品";
      this.skuId = selected[0].id;
    },
    handleSubmit() {
      this.$refs.form.validate((valid) => {
        if (!valid) return;
        this.submitLoading = true;
        distributionGoodsCheck(this.skuId, this.form)
          .then((res) => {
            if (res?.success || res?.message === "success") {
              this.$Message.success("添加成功");
            }
            this.modalVisible = false;
            this.getDataList();
          })
          .finally(() => {
            this.submitLoading = false;
          });
      });
    },
    changePage(v) {
      this.searchForm.pageNumber = v;
      this.getDataList();
    },
    changePageSize(v) {
      this.searchForm.pageSize = v;
      this.searchForm.pageNumber = 1;
      this.getDataList();
    },
    handleSearch() {
      this.searchForm.pageNumber = 1;
      this.getDataList();
    },
    getDataList() {
      this.loading = true;
      getDistributionGoods(this.searchForm)
        .then((res) => {
          if (res?.success) {
            const page = res.result || {};
            this.data = page.records || [];
            this.total = page.total || 0;
          } else {
            this.data = [];
            this.total = 0;
          }
        })
        .finally(() => {
          this.loading = false;
        });
    },
    remove(row) {
      this.$Modal.confirm({
        title: "确认删除",
        content: "您确认要删除此分销商品吗?",
        loading: true,
        onOk: () => {
          distributionGoodsCancel(row.id).then((res) => {
            this.$Modal.remove();
            if (res?.success) {
              this.$Message.success("删除成功");
              this.getDataList();
            }
          });
        },
      });
    },
  },
  mounted() {
    this.init();
  },
};
</script>

<style lang="scss" scoped>
.operation {
  margin: 10px 0;
}

.goods-msg {
  display: flex;
  align-items: flex-start;
  gap: 13px;
  padding: 5px 0;

  img {
    object-fit: contain;
  }
}

.link-text {
  color: #409eff;
  cursor: pointer;
  text-decoration: none;
}

.div-zoom {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  margin-bottom: 4px;
}

.hover-pointer {
  cursor: pointer;
  vertical-align: middle;
}

.mt_10 {
  margin-top: 10px;
}
</style>
