<template>
  <div class="seckill-goods">
    <Card>
      <Table border :columns="columns" :data="data">
        <template slot-scope="{ row }" slot="applyEndTime">
          {{ unixDate(row.applyEndTime) }}
        </template>
        <template slot-scope="{ row }" slot="hours">
          <Tag v-for="item in unixHours(row.hours)" :key="item">{{ item }}</Tag>
        </template>
      </Table>

      <Row class="operation">
        <Button @click="auditAll">批量审核</Button>
        <Button
          type="dashed"
          @click="
            () => {
              openTip = !openTip;
            }
          "
        >{{ openTip ? "关闭提示" : "开启提示" }}
        </Button
        >
      </Row>
      <Row v-show="openTip">
        <Alert show-icon>
          已选择 <span class="select-count">{{ selectCount }}</span> 项
          <a class="select-clear" @click="clearSelectAll">清空</a>
        </Alert>
      </Row>
        <Table
          :loading="loading"
          border
          class="operation"
          :columns="goodsColumns"
          :data="goodsList"
          ref="table"
          sortable="custom"
          @on-selection-change="changeSelect"
        >
          <template slot-scope="{ row }" slot="originalPrice">
            <div>{{ row.originalPrice | unitPrice("￥") }}</div>
          </template>

          <template slot-scope="{ row }" slot="quantity">
            <div>{{ row.quantity }}</div>
          </template>

          <template slot-scope="{ row }" slot="price">
            <div>{{ row.price | unitPrice("￥") }}</div>
          </template>

          <template slot-scope="{ row }" slot="promotionApplyStatus">
            <Badge
              status="success"
              v-if="row.promotionApplyStatus == 'PASS'"
              :text="promotionApplyStatus(row.promotionApplyStatus)"
            />
            <Badge
              status="blue"
              v-if="row.promotionApplyStatus == 'APPLY'"
              :text="promotionApplyStatus(row.promotionApplyStatus)"
            />
            <Badge
              status="error"
              v-if="row.promotionApplyStatus == 'REFUSE'"
              :text="promotionApplyStatus(row.promotionApplyStatus)"
            />
            <span
              v-if="row.promotionApplyStatus == 'REFUSE'"
              @click="showReason(row.failReason)"
              class="reason"
            >（拒绝原因）</span
            >
          </template>
          <template slot-scope="{ row }" slot="time">
            <Tag>{{ row.timeLine + ":00" }}</Tag>
          </template>
          <template slot-scope="{ row }" slot="QRCode">
            <img
              v-if="row.QRCode"
              :src="row.QRCode || '../../../assets/lili.png'"
              width="50px"
              height="50px"
              alt=""
            />
          </template>
          <template slot-scope="{ row }" slot="action">
            <Button
              type="success"
              size="small"
              style="margin-right: 10px"
              :disabled="row.promotionApplyStatus != 'APPLY'"
              @click="pass(row)"
            >通过
            </Button
            >
            <Button
              type="error"
              size="small"
              :disabled="row.promotionApplyStatus != 'APPLY'"
              @click="refuse(row)"
            >拒绝
            </Button
            >
          </template>
        </Table>
      <Row type="flex" justify="end" class="page">
        <Page
          :current="searchForm.pageNumber + 1"
          :total="total"
          :page-size="searchForm.pageSize"
          @on-change="changePage"
          @on-page-size-change="changePageSize"
          :page-size-opts="[10, 20, 50]"
          size="small"
          show-total
          show-elevator
          show-sizer
        ></Page>
      </Row>
    </Card>
    <Modal v-model="showModal" title="审核商品">
      <Form ref="form" :model="params" :rules="rules">
        <FormItem label="审核状态">
          <RadioGroup v-model="params.applyStatus" type="button" button-style="solid">
            <Radio label="PASS">通过</Radio>
            <Radio label="REFUSE">拒绝</Radio>
          </RadioGroup>
        </FormItem>
        <FormItem
          label="拒绝原因"
          prop="failReason"
          v-if="params.applyStatus == 'REFUSE'"
        >
          <Input
            type="textarea"
            v-model="params.failReason"
            maxlength="50"
            style="width: 260px"
            show-word-limit
          />
        </FormItem>
      </Form>
      <div slot="footer">
        <Button size="small" @click="showModal = false">取消</Button>
        <Button
          size="small"
          type="primary"
          :loading="submitLoading"
          @click="sureAudit"
        >确定
        </Button
        >
      </div>
    </Modal>
  </div>
</template>
<script>
  import {
    seckillGoodsList,
    seckillDetail,
    auditApplySeckill,
  } from "@/api/promotion.js";

  export default {
    data() {
      return {
        promotionStatus: "", // 活动状态
        showModal: false, // modal显隐
        openTip: true, // 显示提示
        loading: false, // 表单加载状态
        submitLoading: false, // 加载状态
        searchForm: {
          // 搜索框初始化对象
          pageNumber: 0, // 当前页数
          pageSize: 100, // 页面大小
        },
        total: 0, // 总数
        selectList: [], // 多选数据
        selectCount: 0, // 多选计数
        data: [], // 表单数据
        columns: [ // 表头
          {
            title: "活动名称",
            key: "promotionName",
            minWidth: 120,
          },
          {
            title: "活动开始时间",
            key: "startTime",
          },
          {
            title: "报名截止时间",
            slot: "applyEndTime",
          },
          {
            title: "时间场次",
            slot: "hours",
          },
          {
            title: "活动状态",
            key: "promotionStatus",
            minWidth: 80,
            sortable: false,
            render: (h, params) => {
              if (params.row.promotionStatus == "NEW") {
                return h("div", [
                  h("Badge", {
                    props: {
                      status: "error",
                      text: "新建",
                    },
                  }),
                ]);
              } else if (params.row.promotionStatus == "START") {
                return h("div", [
                  h("Badge", {
                    props: {
                      status: "success",
                      text: "开始",
                    },
                  }),
                ]);
              } else if (params.row.promotionStatus == "END") {
                return h("div", [
                  h("Badge", {
                    props: {
                      status: "error",
                      text: "结束",
                    },
                  }),
                ]);
              } else if (params.row.promotionStatus == "CLOSE") {
                return h("div", [
                  h("Badge", {
                    props: {
                      status: "error",
                      text: "废弃",
                    },
                  }),
                ]);
              }
            },
          },
        ],
        goodsColumns: [ // 商品表单
          {type: "selection", width: 60, align: "center"},
          {
            title: "商品名称",
            key: "goodsName",
            minWidth: 120,
            tooltip: true
          },
          {
            title: "商品价格",
            slot: "originalPrice",
            width: 110,
          },
          {
            title: "库存",
            slot: "quantity",
            minWidth: 30,
            width: 90
          },
          {
            title: "活动价格",
            slot: "price",
            width: 100,
          },
          {
            title: "商家名称",
            key: "storeName",
            minWidth: 100,
            tooltip: true

          },
          {
            title: "活动场次",
            width: 100,
            slot: "time",
          },
          {
            title: "状态",
            slot: "promotionApplyStatus",
            minWidth: 30,
            width: 90,
          },

          {
            title: "操作",
            slot: "action",
            width: 150,
            align: "center",
          },
        ],
        goodsList: [], // 商品列表
        params: { // 请求参数
          seckillId: this.$route.query.id,
          applyStatus: "PASS",
          failReason: "",
          ids: "",
        },
        rules: { // 验证规则
          failReason: [{required: true, message: "请输入拒绝原因"}],
        },
      };
    },
    methods: {
      init() {
        this.getSeckillMsg();
      },

      changePage(v) {
        this.searchForm.pageNumber = v - 1;
        this.getDataList();
        this.clearSelectAll();
      },

      changePageSize(v) {
        this.searchForm.pageSize = v;
        this.getDataList();
      },

      clearSelectAll() {
        this.$refs.table.selectAll(false);
      },

      changeSelect(e) {
        // 获取选择数据
        this.selectList = e;
        this.selectCount = e.length;
        let ids = [];
        this.selectList.forEach((item) => {
          ids.push(e.id);
        });
        this.params.ids = ids.toString();
      },

      getDataList() {
        // 获取商品详情
        this.loading = true;
        this.searchForm.seckillId = this.$route.query.id;
        seckillGoodsList(this.searchForm).then((res) => {
          this.loading = false;
          if (res.success && res.result) {
            this.goodsList = res.result.records;
            this.total = res.result.total;
          }
        });
      },

      getSeckillMsg() {
        // 获取活动详情
        seckillDetail(this.$route.query.id).then((res) => {
          if (res.success && res.result) {
            this.data = [];
            this.data.push(res.result);
            this.promotionStatus = res.result.promotionStatus;
            this.getDataList();
          }
        });
      },
      delGoods(index) {
        // 删除商品
        this.goodsList.list.splice(index, 1);
      },

      unixDate(time) {
        // 处理报名截止时间
        return this.$options.filters.unixToDate(new Date(time) / 1000);
      },
      unixHours(item) {
        // 处理小时场次
        let hourArr = item.split(",");
        for (let i = 0; i < hourArr.length; i++) {
          hourArr[i] += ":00";
        }
        return hourArr;
      },
      promotionApplyStatus(key) {
        switch (key) {
          case "APPLY":
            return "申请";
            break;
          case "PASS":
            return "通过";
            break;
          case "REFUSE":
            return "拒绝";
            break;
        }
      },
      pass(row) {
        // 通过
        let params = {
          seckillId: this.$route.query.id,
          applyStatus: "PASS",
          failReason: "",
          ids: row.id,
        };
        auditApplySeckill(params).then((res) => {
          if (res && res.success) {
            this.$Message.success("已通过该商品审核");
            this.getDataList();
          }
        });
      },
      refuse(row) {
        // 拒绝
        this.params.applyStatus = "REFUSE";
        this.selectList.push(row);
        this.showModal = true;
      },
      auditAll() {
        // 批量审核
        if (this.selectCount <= 0) {
          this.$Message.warning("您还未选择要审核的商品");
          return;
        }
        this.showModal = true;
      },
      sureAudit() {
        this.selectCount = this.selectList.length;
        // 批量审核
        if (this.selectCount <= 0) {
          this.$Message.warning("您还未选择要审核的商品");
          return;
        }
        this.params.ids = this.selectList
          .filter((i) => i.promotionApplyStatus === "APPLY")
          .map((i) => i.id);
        if (this.params.ids.length <= 0) {
          this.$Message.warning("当前没有可审核的商品");
          return;
        }
        if (
          this.params.applyStatus == "REFUSE" &&
          this.params.failReason === ""
        ) {
          this.$Message.warning("审核拒绝理由不能为空");
          return;
        }
        this.submitLoading = true;
        auditApplySeckill(this.params).then((res) => {
          this.submitLoading = false;
          if (res.success) {
            this.showModal = false;
            this.$Message.success("审核成功");
            this.selectList = [];
            this.getDataList();
          }
        });
      },
      showReason(reason) {
        this.$Modal.info({
          title: "拒绝原因",
          content: reason,
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

  .reason {
    cursor: pointer;
    color: #2d8cf0;
    font-size: 12px;
  }
</style>
