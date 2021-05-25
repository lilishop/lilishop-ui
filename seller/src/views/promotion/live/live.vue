<template>
  <div>
    <Card>
      <Form ref="searchForm" :model="searchForm" inline :label-width="100" class="search-form">
        <Form-item label="优惠券名称">
          <Input type="text" v-model="searchForm.couponName" placeholder="请输入优惠券名称" clearable style="width: 200px" />
        </Form-item>
        <Form-item label="活动状态" prop="promotionStatus">
          <Select v-model="searchForm.promotionStatus" placeholder="请选择" clearable style="width: 200px">
            <Option value="NEW">未开始</Option>
            <Option value="START">已开始/上架</Option>
            <Option value="END">已结束/下架</Option>
            <Option value="CLOSE">紧急关闭/作废</Option>
          </Select>
        </Form-item>
        <Form-item label="活动时间">
          <DatePicker v-model="selectDate" type="daterange" clearable placeholder="选择起始时间" style="width: 200px"></DatePicker>
        </Form-item>
        <Button @click="handleSearch" type="primary" class="search-btn" icon="ios-search">搜索</Button>
      </Form>
      <div class="btns">
        <Button @click="createLive()" type="primary">创建直播</Button>
      </div>
      <Tabs>
        <!-- 标签栏 -->
        <TabPane v-for="(item,index) in tabs" :key="index" :label="item.title">
          <Table :columns="liveColumns" :data="liveData"></Table>
          <Row type="flex" justify="end" class="page">
            <Page :current="searchForm.pageNumber + 1" :total="total" :page-size="searchForm.pageSize" @on-change="changePage" @on-page-size-change="changePageSize" :page-size-opts="[10, 20, 50]"
              size="small" show-total show-elevator show-sizer></Page>
          </Row>
        </TabPane>

      </Tabs>

    </Card>
  </div>
</template>

<script>
import { getLivesList } from "@/api/promotion.js";
export default {
  data() {
    return {
      // 查询数据的总数
      total: "",
      // 查询的form
      searchForm: {
        pageSize: 10,
        pageNumber: 1,
      },
      // 直播tab选项栏
      tabs: [
        {
          title: "全部",
        },
        {
          title: "直播中",
        },
        {
          title: "未开始",
        },
        {
          title: "已结束",
        },
      ],
      liveColumns: [
        {
          title: "直播标题",
          key: "a",
        },
        {
          title: "直播时间",
          key: "a",
        },
        {
          title: "主播昵称",
          key: "a",
        },
        {
          title: "直播状态",
          key: "a",
        },
        {
          title: "操作",
          key: "a",
        },
      ], //table中显示的title
      liveData: [], //table中显示的直播数据
    };
  },
  mounted() {
    this.getStoreLives();
  },
  methods: {
    /**
     * 获取店铺直播间列表
     */
    async getStoreLives() {
      let result = await getLivesList();
      if (result.success) {
        this.liveData = result.records;
      }
    },

    /**
     * 获取
     */

    /**
     * 创建直播
     */
    createLive(){
      this.$router.push({path:'/add-live'})
    },

    /**
     * 点击分页数据回调
     */
    changePageSize() {},
    /**
     * 点击分页回调
     */
    changePage() {},
  },
};
</script>

<style lang="scss" scoped>
@import "@/styles/table-common.scss";
.btns{
  margin-top: 10px;
}
</style>
