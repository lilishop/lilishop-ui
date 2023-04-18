<template>
  <div class="search">
    <Card>
      <Form
        ref="searchForm"
        :model="searchForm"
        inline
        :label-width="100"
        class="search-form"
      >
        <Form-item label="商户名称" prop="merchantShortname">
          <Input
            type="text"
            v-model="searchForm.merchantShortname"
            placeholder="请输入商户名称"
            clearable
            style="width: 200px"
          />
        </Form-item>
        <Form-item label="业务申请编号" prop="outRequestNo">
          <Input
            type="text"
            v-model="searchForm.outRequestNo"
            placeholder="请输入业务申请编号"
            clearable
            style="width: 200px"
          />
        </Form-item>
        <Form-item label="主体类型">
          <Select
            v-model="searchForm.organizationType"
            placeholder="请选择"
            clearable
            style="width: 200px"
          >
            <Option
              v-for="item in mainType"
              :value="item.value"
              :key="item.value"
            >{{ item.title }}</Option
            >
          </Select>
        </Form-item>

        <Form-item label="创建时间" prop="createTime">
          <DatePicker
            v-model="selectDate"
            type="datetimerange"
            format="yyyy-MM-dd HH:mm:ss"
            clearable
            @on-change="selectDateRange"
            placeholder="选择起始时间"
            style="width: 200px"
          ></DatePicker>
        </Form-item>
        <Button
          @click="handleSearch"
          type="primary"
          icon="ios-search"
          class="search-btn"
        >搜索</Button
        >
        <Button @click="hanleReset" class="search-btn" icon="md-refresh"
        >重置</Button
        >
      </Form>
      <Row class="operation padding-row">
        <Button @click="add" type="primary">服务商进件</Button>
      </Row>
      <Table
        :loading="loading"
        border
        :columns="columns"
        :data="data"
        ref="table"
      >
        <template
          template
          slot="applymentIdfoslot"
          slot-scope="scope"
          v-if="scope.row.applymentId != null"
        >
          {{ `微信支付单号${scope.row.applymentId}` }}
        </template>
        <template
          template
          slot="organizationType"
          slot-scope="scope"
          v-if="scope.row.organizationType != null"
        >
          {{
            mainType.find((item) => scope.row.organizationType == item.value)
              .title
          }}
        </template>
        <template slot="contactInfoslot" slot-scope="{ row }">
          <div
            style="margin-top: 5px; height: 30px; display: flex"
            v-if="row.contactInfo.contact_name"
          >
            <div style="margin-left: 13px; margin-top: 3px">
              <div class="div-zoom">
                <span>{{
                    `超级管理员姓名:${row.contactInfo.contact_name}`
                  }}</span>
              </div>
            </div>
          </div>
          <div
            style="margin-top: 5px; height: 30px; display: flex"
            v-if="row.contactInfo.contact_id_number"
          >
            <div style="margin-left: 13px; margin-top: 3px">
              <div class="div-zoom">
                <span>{{
                    `超级管理员身份证件号码:${row.contactInfo.contact_id_number}`
                  }}</span>
              </div>
            </div>
          </div>
          <div
            style="margin-top: 5px; height: 30px; display: flex"
            v-if="row.contactInfo.openid"
          >
            <div style="margin-left: 13px; margin-top: 3px">
              <div class="div-zoom">
                <span>{{
                    `超级管理员微信OpenID:${row.contactInfo.openid}`
                  }}</span>
              </div>
            </div>
          </div>
          <div
            style="margin-top: 5px; height: 80px; display: flex"
            v-if="row.contactInfo.contact_id_doc_copy"
          >
            <div style="margin-left: 13px; margin-top: 3px">
              <div class="div-zoom">
                <img :src="row.contactInfo.contact_id_doc_copy" />
              </div>
            </div>
          </div>
        </template>
        <template slot="settlementInfoslot" slot-scope="{ row }">
          <div style="margin-top: 5px; height: 30px; display: flex">
            <div style="margin-left: 13px; margin-top: 3px">
              <div class="div-zoom" v-if="row.settlementInfo">
                <span>{{
                    `入驻结算规则ID:${row.settlementInfo.settlement_id}`
                  }}</span>
              </div>
            </div>
          </div>
          <div style="margin-top: 5px; height: 30px; display: flex">
            <div style="margin-left: 13px; margin-top: 3px">
              <div class="div-zoom" v-if="row.settlementInfo">
                <span>{{
                    `所属行业:${row.settlementInfo.qualification_type}`
                  }}</span>
              </div>
            </div>
          </div>
          <!-- <div style="margin-top: 5px; height: 80px; display: flex">
            <div style="margin-left: 13px; margin-top: 3px">
              <div class="div-zoom">
                <img :src="row.settlementInfo.qualifications" />
              </div>
            </div>
          </div> -->
        </template>
        <template slot="payChannelSlot" slot-scope="{ row }">
          <div v-for="(item, index) in row.payChannelDTOS" :key="index">
            {{ item.channelTypeDesc }} <span v-if="item.authMessage">-</span>
            {{ item.authMessage }}
          </div>
        </template>
      </Table>
      <Row type="flex" justify="end" class="mt_10">
        <Page
          :current="searchForm.pageNumber"
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
  </div>
</template>

<script>
import { getConstruction, syncStatus } from "@/api/shops";
export default {
  name: "agencyList",
  data() {
    return {
      labelFlag: false,
      Choices: "multiple",
      showHide: false,
      loading: true, // 表单加载状态
      storeId: "",
      labelForm: {
        label: "",
      },
      searchForm: {
        // 搜索框初始化对象
        pageNumber: 1, // 当前页数
        pageSize: 10, // 页面大小
        sort: "createTime", // 默认排序字段
        order: "desc", // 默认排序方式
        startDate: "", // 起始时间
        endDate: "", // 终止时间
      },
      selectDate: null, // 创建时间
      columns: [
        // 表头
        {
          title: "商户名称",
          key: "merchantShortname",
          width: 200,
          align: "left",
        },
        {
          title: "主体类型",
          key: "organizationType",
          width: 100,
          tooltip: true,
          slot: "organizationType",
        },
        {
          title: "业务申请编号",
          key: "outRequestNo",
          width: 200,
          tooltip: true,
        },
        {
          title: "申请状态",
          width: 160,
          key: "applymentStateMsg",
        },
        {
          title: "错误信息",
          key: "errorMessage",
          align: "left",
          width: 170,
        },
        {
          title: "特约商户号",
          key: "subMchid",
          align: "left",
          width: 170,
        },
        {
          title: "签约链接",
          key: "signUrl",
          align: "left",
        },
        {
          title: "操作",
          key: "action",
          width: 250,
          align: "center",
          fixed: "right",
          render: (h, params) => {
            return h("div", [
              h(
                "Button",
                {
                  props: {
                    type: "info",
                    size: "small",
                    ghost: true,
                  },
                  style: {
                    marginRight: "5px",
                  },
                  on: {
                    click: () => {
                      this.edit(params.row);
                    },
                  },
                },
                "编辑"
              ),
              h(
                "Button",
                {
                  props: {
                    type: "info",
                    size: "small",
                    ghost: true,
                  },
                  style: {
                    marginRight: "5px",
                  },
                  on: {
                    click: () => {
                      this.tosync(params.row);
                    },
                  },
                },
                "同步"
              ),
            ]);
          },
        },
      ],
      data: [], // 表单数据
      total: 0, // 表单数据总数
      selectedShop: false, //用于是否选择店铺
    };
  },
  computed: {
    mainType() {
      return this.$store.state.app.weChatApplyList;
    },
  },
  methods: {
    hanleReset() {
      this.searchForm = {
        // 搜索框初始化对象
        pageNumber: 1, // 当前页数
        pageSize: 10, // 页面大小
        sort: "createTime", // 默认排序字段
        order: "desc", // 默认排序方式
        startDate: "", // 起始时间
        endDate: "", // 终止时间
      };
      this.selectDate = null;
      this.init();
    },
    // 隐藏model
    hide() {
      this.showHide = false;
    },
    // 回调给父级
    callback(val) {
      this.$emit("callback", val);
    },
    // 初始化数据
    init() {
      this.getDataList();
    },
    // 分页 改变页码
    changePage(v) {
      this.searchForm.pageNumber = v;
      this.getDataList();
    },
    // 分页 改变页数
    changePageSize(v) {
      this.searchForm.pageNumber = 1;
      this.searchForm.pageSize = v;
      this.getDataList();
    },
    // 搜索
    handleSearch() {
      this.searchForm.pageNumber = 1;
      this.searchForm.pageSize = 10;
      this.getDataList();
    },
    // 起止时间分别赋值
    selectDateRange(v) {
      if (v) {
        this.searchForm.startDate = v[0];
        this.searchForm.endDate = v[1];
      }
    },
    // 获取列表数据
    getDataList() {
      this.loading = true;
      // 带多条件搜索参数获取表单数据 请自行修改接口
      getConstruction(this.searchForm).then((res) => {
        this.loading = false;
        if (res.success) {
          this.data = res.result.records;
          console.log(this.data);
          this.total = res.result.total;
        }
      });
      this.total = this.data.length;
      this.loading = false;
    },
    openLabelModal(val) {
      this.storeId = val.id;
      this.labelFlag = true;
    },
    tosync(row) {
      syncStatus(row.outRequestNo).then((res) => {
        if (res.success) {
          this.$Message.success("同步成功");
          this.getDataList();
        }
      });
    },
    async labelSubmit() {
      await increaseLabel(this.storeId, this.labelForm).then((res) => {
        if (res.success) {
          this.$Message.success("设置成功");
          this.getDataList();
          this.labelFlag = false;
        }
      });
    },
    // 添加店铺
    add() {
      this.$router.push({ path: "/submitApplication" });
    },
    // 修改店铺
    edit(v) {
      this.$router.push({
        path: "submitApplication",
        query: { id: v.outRequestNo },
      });
    },
    // 关闭店铺
    disable(v) {
      this.$Modal.confirm({
        title: "确认关闭",
        content: "您确认要关闭店铺 " + v.storeName + " ?",
        loading: true,
        onOk: () => {
          disableShop(v.id).then((res) => {
            this.$Modal.remove();
            if (res.success) {
              this.$Message.success("操作成功");
              this.getDataList();
            }
          });
        },
      });
    },
    //查看店铺详细
    detail(row) {
      this.$router.push({ name: "agency-detail", query: { id: row.id } });
    },
    // 审核店铺
    audit(v) {
      this.$Modal.confirm({
        title: "审核店铺",
        content: "您确认要审核通过店铺 " + v.storeName + " ?",
        okText: "通过",
        cancelText: "驳回",
        loading: true,
        onOk: () => {
          shopAudit(v.id, 0).then((res) => {
            this.$Modal.remove();
            if (res.success) {
              this.$Message.success("操作成功");
              this.getDataList();
            }
          });
        },
        onCancel: () => {
          shopAudit(v.id, 1).then((res) => {
            this.$Modal.remove();
            if (res.success) {
              this.$Message.success("操作成功");
              this.getDataList();
            }
          });
        },
      });
    },
    // 启用店铺
    enable(v) {
      this.$Modal.confirm({
        title: "确认开启",
        content: "您确认要开启店铺 " + v.storeName + " ?",
        loading: true,
        onOk: () => {
          enableBrand(v.id).then((res) => {
            this.$Modal.remove();
            if (res.success) {
              this.$Message.success("操作成功");
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
<style scoped lang="scss">
img {
  margin-right: 10px;
  width: 100px;
  height: 100px;
}
</style>
