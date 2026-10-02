<template>
  <div>
    <!-- 统计 -->
    <div class="card">
      <h4>基本信息</h4>
      <div class="count-list flex">
        <div class="count-item" @click="navigateTo('managerGoods')">
          <div>
            <el-icon class="icon" :size="31"><Picture /></el-icon>
          </div>
          <div>
            <div class="counts">{{ homeData.goodsNum || 0 }}</div>
            <div>商品数量</div>
          </div>
        </div>
        <div class="count-item" @click="navigateTo('memberList')">
          <div>
            <el-icon class="icon" :size="31"><User /></el-icon>
          </div>
          <div>
            <div class="counts">{{ homeData.memberNum || 0 }}</div>
            <div>会员数量</div>
          </div>
        </div>
        <div class="count-item" @click="navigateTo('orderList')">
          <div>
            <el-icon class="icon" :size="31"><List /></el-icon>
          </div>
          <div>
            <div class="counts">{{ homeData.orderNum || 0 }}</div>
            <div>订单数量</div>
          </div>
        </div>
        <div class="count-item" @click="navigateTo('shopList')">
          <div>
            <el-icon class="icon" :size="31"><DataLine /></el-icon>
          </div>
          <div>
            <div class="counts">{{ homeData.storeNum || 0 }}</div>
            <div>店铺数量</div>
          </div>
        </div>
      </div>
    </div>

    <!-- 今日待办 -->
    <div class="card">
      <h4>今日待办</h4>
      <div class="todo-list flex">
        <div class="todo-item" @click="navigateTo('applyGoods')">
          <div class="counts">{{ $store.state.notices.goods || 0 }}</div>
          <div>待审核商品</div>
        </div>
        <div class="todo-item" @click="navigateTo('shopAuth')">
          <div class="counts">{{ $store.state.notices.store || 0 }}</div>
          <div>待审核店铺</div>
        </div>
        <div class="todo-item" @click="navigateTo('orderComplaint')">
          <div class="counts">{{ $store.state.notices.complain || 0 }}</div>
          <div>待审核投诉</div>
        </div>
        <div class="todo-item" @click="navigateTo('afterSaleOrder')">
          <div class="counts">{{ $store.state.notices.refund || 0 }}</div>
          <div>待审核售后</div>
        </div>
        <div class="todo-item" @click="goDistributionCash">
          <div class="counts">
            {{ $store.state.notices.distributionCash || 0 }}
          </div>
          <div>待审核分销提现</div>
        </div>
        <div class="todo-item" @click="navigateTo('accountStatementBill')">
          <div class="counts">{{ $store.state.notices.waitPayBill || 0 }}</div>
          <div>待审核分账</div>
        </div>
        <div class="todo-item" @click="goAppointmentWorkOrders">
          <div class="counts">{{ $store.state.notices.appointmentWorkOrder || 0 }}</div>
          <div>未完成预约工单</div>
        </div>
        <div class="todo-item" @click="goProcurementAudit">
          <div class="counts">{{ $store.state.notices.procurementAudit || 0 }}</div>
          <div>待审核采购单</div>
        </div>
      </div>
    </div>

    <!-- 今日，流量概括 -->
    <div class="card flow">
      <div class="flow-list flex">
        <div class="flow-item">
          <div class="flow-member">
            <div>当前在线人数</div>
            <span>
              {{ homeData.currentNumberPeopleOnline || 0 }}</span>
          </div>
          <div class="flow-wrapper">
            <h4>流量概括</h4>
            <div class="card flow-box flex">
              <div class="flow-box-item">
                <div>今日访客数</div>
                <div class="counts">
                  {{ homeData.todayUV || 0 }}
                </div>
              </div>
              <div class="flow-box-item">
                <div>昨日访客数</div>
                <div class="counts">
                  {{ homeData.yesterdayUV || 0 }}
                </div>
              </div>
            </div>

            <div class="flow-splice flex">
              <div class="flow-box-splice">
                <div>前七日访客数</div>
                <div class="counts">
                  {{ homeData.lastSevenUV || 0 }}
                </div>
              </div>
              <div class="flow-box-splice">
                <div>前三十日访客数</div>
                <div class="counts">
                  {{ homeData.lastThirtyUV || 0 }}
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="today-box">
          <h4>今日概括</h4>
          <div class="today-list flex">
            <div class="today-item">
              <div>今日订单数</div>
              <span>{{ homeData.todayOrderNum || 0 }}</span>
            </div>
            <div class="today-item">
              <div>今日交易额</div>
              <span>{{ $filters.unitPrice(homeData.todayOrderPrice || 0, "￥") }}</span>
            </div>
            <div class="today-item">
              <div>今日新增店铺</div>
              <span>{{ homeData.todayStoreNum || 0 }}</span>
            </div>
            <div class="today-item">
              <div>今日新增会员数</div>
              <span>{{ homeData.todayMemberNum || 0 }}</span>
            </div>
            <div class="today-item">
              <div>今日上架商品数量</div>
              <span>{{ homeData.todayGoodsNum || 0 }}</span>
            </div>
            <div class="today-item">
              <div>今日新增评论</div>
              <span>{{ homeData.todayMemberEvaluation || 0 }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- chart -->
    <div class="card transform">
      <div>
        <h4>最近48小时在线人数（整点为准）</h4>
        <div id="historyMemberChart"></div>
      </div>
    </div>
    <div class="card range-card">
      <div class="range-bar">
        <h4>统计范围</h4>
        <div class="range-options">
          <span
            v-for="item in rangeOptions"
            :key="item.searchType"
            :class="{ active: !rangeMonth && rangeKey === item.searchType }"
            @click="changeRange(item)"
          >{{ item.title }}</span>
          <el-select
            v-model="rangeMonth"
            clearable
            placeholder="按月"
            style="width: 140px"
            @change="changeMonth"
          >
            <el-option
              v-for="item in recentMonths"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </div>
      </div>
      <p class="range-tip">流量走势、交易趋势和热卖 TOP10 使用同一时间范围，当前为{{ rangeTitle }}。</p>
    </div>
    <!-- chart -->
    <div class="charts flex">
      <div class="chart-item">
        <h4>流量走势</h4>
        <div id="pvChart"></div>
      </div>
      <div class="chart-item">
        <h4>交易趋势</h4>
        <div id="orderChart"></div>
      </div>
    </div>

    <!-- top10商品 -->
    <div class="card transform">
      <h4>热卖商品TOP10 · {{ rangeTitle }}</h4>
      <el-table stripe :data="topHotGoodsData" style="width: 100%">
        <el-table-column type="index" label="排名" width="100" align="center" />
        <el-table-column prop="goodsName" label="商品名称" />
        <el-table-column prop="price" label="价格">
          <template #default="{ row }">
            <span :style="{ color: $mainColor }">{{ $filters.unitPrice(row.price, '￥') }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="num" label="销量" width="100" sortable />
      </el-table>
    </div>

    <!-- top10店铺 -->
    <div class="card transform">
      <h4>热卖店铺TOP10 · {{ rangeTitle }}</h4>
      <el-table stripe :data="topHotShopsData" style="width: 100%">
        <el-table-column type="index" label="排名" width="100" align="center" />
        <el-table-column prop="storeName" label="店铺名称" />
        <el-table-column prop="price" label="价格">
          <template #default="{ row }">
            <span :style="{ color: $mainColor }">{{ $filters.unitPrice(row.price, '￥') }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="num" label="销量" width="100" sortable />
      </el-table>
    </div>
  </div>
</template>

<script>
import { Picture, User, List, DataLine } from "@element-plus/icons-vue";
import { homeStatistics, hotGoods, hotShops, getNoticePage } from "@/api/index";
import * as API_Goods from "@/api/goods";
import { Chart } from "@antv/g2";
import * as API_Member from "@/api/member";
export default {
  name: "home",
  components: { Picture, User, List, DataLine },

  data() {
    return {
      topHotGoodsData: [], //热卖商品集合
      topHotShopsData: [], //热卖店铺集合
      awaitTodoData: "", //今日待办集合
      homeData: "", // 首页数据
      pvChart: "", // 流量统计
      orderChart: "", // 订单统计
      historyMemberChart: "", // 最近会员流量统计
      rangeKey: "LAST_SEVEN",
      rangeMonth: "",
      rangeOptions: [
        { title: "今天", searchType: "TODAY" },
        { title: "昨天", searchType: "YESTERDAY" },
        { title: "过去7天", searchType: "LAST_SEVEN" },
        { title: "过去30天", searchType: "LAST_THIRTY" },
      ],
    };
  },
  computed: {
    recentMonths() {
      const list = [];
      const now = new Date();
      for (let i = 0; i < 12; i += 1) {
        const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const year = date.getFullYear();
        const month = date.getMonth() + 1;
        list.push({
          value: `${year}-${month}`,
          label: `${year}年${month}月`,
        });
      }
      return list;
    },
    rangeTitle() {
      if (this.rangeMonth) {
        const found = this.recentMonths.find((item) => item.value === this.rangeMonth);
        return found ? found.label : this.rangeMonth;
      }
      const found = this.rangeOptions.find((item) => item.searchType === this.rangeKey);
      return found ? found.title : "过去7天";
    },
  },
  methods: {
    // 路由跳转
    navigateTo(name) {
      this.$router.push({
        name,
      });
    },
    // 跳转到分销提现，并打开待处理标签页
    goDistributionCash() {
      this.$router.push({
        name: 'distributionCash',
        query: { tabStatus: 'APPLY' }
      });
    },
    goAppointmentWorkOrders() {
      this.$router.push({
        name: "manager-appointment-work-orders",
        query: { serviceStatus: "OPEN" },
      });
    },
    goProcurementAudit() {
      this.$router.push({
        name: "manager-procurement-order-list",
        query: { status: "SUBMITTED" },
      });
    },
    rangeQuery() {
      if (this.rangeMonth) {
        const [year, month] = this.rangeMonth.split("-");
        return { year, month };
      }
      return { searchType: this.rangeKey || "LAST_SEVEN" };
    },
    changeRange(item) {
      this.rangeMonth = "";
      this.rangeKey = item.searchType;
      this.reloadRange();
    },
    changeMonth(value) {
      this.rangeMonth = value || "";
      if (!this.rangeMonth) {
        this.rangeKey = "LAST_SEVEN";
      }
      this.reloadRange();
    },
    reloadRange() {
      this.toHotGoods();
      this.topHotShops();
      this.getPvChart();
      this.initOrderChartList();
    },
    // top10热卖商品
    async toHotGoods() {
      let res = await hotGoods(this.rangeQuery());
      this.topHotGoodsData = res.success ? res.result || [] : [];
    },

    // top10热卖店铺
    async topHotShops() {
      let res = await hotShops(this.rangeQuery());
      this.topHotShopsData = res.success ? res.result || [] : [];
    },
    // 今日待办
    async awaitTodo() {
      let res = await getNoticePage();
      res.success ? (this.awaitTodoData = res.result) : "";
    },

    //首页统计数据
    async getHomeData() {
      let res = await homeStatistics();
      if (res.success) {
        const price = res.result.todayOrderPrice;
        const amount = price === null || price === undefined || price === "" || price === "null"
          ? 0
          : Number(price);
        res.result.todayOrderPrice = Number.isNaN(amount) ? 0 : amount;
        this.homeData = res.result;
      }
    },

    // 实例化订单图表
    async initOrderChartList() {
      this.orderChart ? this.orderChart.clear() : ''
      const res = await API_Goods.getOrderChart(this.rangeQuery());
      if (res.success) {
        this.orderChartData = res.result || [];

        if (!this.orderChart) {
          this.orderChart = new Chart({
            container: "orderChart",
            autoFit: true,
            height: 500,
            padding: [70, 70, 70, 70],
          });
        }

        this.initOrderChart(); //订单表
      }
    },

    // 订单表
    initOrderChart() {
      let data = this.orderChartData || [];

      data.forEach((item) => {
        const time = item.createTime ? String(item.createTime) : "";
        item.createTime = time.includes(" ") ? time.split(" ")[0] : time;
        item.title = "交易额";
      });
      this.orderChart.data(data);

      this.orderChart.tooltip({
        showCrosshairs: true,
        shared: true,
      });

      this.orderChart
        .line()
        .position("createTime*price")
        .label("price")
        .color("title")
        .shape("smooth");

      this.orderChart
        .point()
        .position("createTime*price")
        .label("price")
        .color("title")
        .shape("circle")
        .style({
          stroke: "#fff",
          lineWidth: 1,
        });
        this.orderChart.area().position("createTime*price").color("title").shape("smooth");

      this.orderChart.render();
    },

    // 浏览量统计图
    initPvChart() {
      let uv = [];
      let pv = [];
      const rows = Array.isArray(this.data) ? this.data : [];
      rows.forEach((item) => {
        uv.push({
          date: item.date,
          uvNum: item.uvNum,
          title: "访客数UV",
          pv: item.uvNum,
        });

        pv.push({
          date: item.date,
          pvNum: item.pvNum,
          pv: item.pvNum,
          title: "浏览量PV",
        });
      });

      let data = [...uv, ...pv];

      this.pvChart.data(data);

      this.pvChart.tooltip({
        showCrosshairs: true,
        shared: true,
      });

      this.pvChart
        .line()
        .position("date*pv")
        .color("title")
        .label("pv")
        .shape("smooth");

      this.pvChart
        .point()
        .position("date*pv")
        .color("title")
        .label("pv")
        .shape("circle")
        .style({
          stroke: "#fff",
          lineWidth: 1,
        });
      this.pvChart.area().position("date*pv").color("title").shape("smooth");

      this.pvChart.render();
    },

    // 浏览量
    async getPvChart() {
      this.pvChart ? this.pvChart.clear() : ''
      API_Member.getStatisticsList(this.rangeQuery()).then((res) => {
        if (res.result) {
          this.data = res.result || [];

          if (!this.pvChart) {
            this.pvChart = new Chart({
              container: "pvChart",
              autoFit: true,
              height: 500,
              padding: [70, 70, 70, 70],
            });
          }
          this.initPvChart();
        }
      });
    },
    // 实例化会员流量图表
    async initHistoryMemberChartList() {
      this.historyMemberChart ? this.historyMemberChart.clear() : ''
      const res = await API_Member.historyMemberChartList();
      if (res.success) {
        this.chartList = res.result;

        if (!this.historyMemberChart) {
          this.historyMemberChart = new Chart({
            container: "historyMemberChart",
            autoFit: true,
            height: 500,
            padding: [70, 70, 70, 70],
          });
        }

        this.initHistoryMemberChart();
      }
    },
    // 历史在线人数
    initHistoryMemberChart() {
      // 默认已经加载 legend-filter 交互
      let data = this.chartList;
      let num = [];
      let lastNum = [];
      data.forEach((item) => {
        num.push({
          date: item.date.substring(5),
          title: "最近48小时",
          num: item.num,
          res: item.num,
        });

        lastNum.push({
          date: item.date.substring(5),
          title: "上一周期",
          lastNum: item.lastNum || 0,
          res: item.lastNum || 0,
        });
      });
      let params = [...num, ...lastNum];
      this.historyMemberChart.data(params);

      this.historyMemberChart.tooltip({
        showCrosshairs: true,
        shared: true,
      });

      this.historyMemberChart
        .line()
        .position("date*res")
        .color("title")
        .label("res")
        .shape("smooth");
      this.historyMemberChart
        .point()
        .position("date*res")
        .color("title")
        .label("res")
        .shape("circle");

      this.historyMemberChart
        .area()
        .position("date*res")
        .color("title")
        .shape("smooth");

      this.historyMemberChart.render();
    },
    // 初始化信息
    init() {
      this.toHotGoods();
      this.topHotShops();
      this.awaitTodo();
      this.getHomeData();
      this.getPvChart();
      this.initOrderChartList();
      this.initHistoryMemberChartList();
    },
  },
  mounted() {
    this.init();
  },
};
</script>
<style lang="scss" scoped>
@import "./home.scss";
</style>
