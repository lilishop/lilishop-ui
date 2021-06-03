<style lang="scss">
  @import "@/styles/table-common.scss";
</style>
<template>
  <div>
    <!--短信-->
    <Modal v-model="smsModal" width="530">
      <p slot="header">
        <Icon type="edit"></Icon>
        <span>短信设置</span>
      </p>
      <div>
        <Form ref="smsFormData" :model="smsFormData" label-position="left" :label-width="100" :rules="smsFormValidate">
          <FormItem label="模板名称" prop="templateName">
            <Input v-model="templateName" size="large" maxlength="9" disabled></Input>
          </FormItem>
          <FormItem label="模板代码" prop="smsCode">
            <Input v-model="smsFormData.smsCode" size="large" maxlength="30"></Input>
          </FormItem>
          <FormItem label="模板名称" prop="smsContent">
            <Input class='textarea' :rows="5" :autosize="{maxRows:5,minRows: 5}" v-model="smsFormData.smsContent" type="textarea" maxlength="150"/>
          </FormItem>
          <FormItem label="是否开启" prop="smsState">
            <i-switch v-model="smsFormData.smsState" size="large" :value="smsFormData.smsState">
              <span slot="open">开启</span>
              <span slot="close">关闭</span>
            </i-switch>
          </FormItem>
        </Form>

      </div>
      <div slot="footer" style="text-align: right">
        <Button type="success" size="large"  @click="smsFormDataEdit">设置</Button>
      </div>
    </Modal>
    <!--站内信-->
    <Modal v-model="noticeModal" width="530">
      <p slot="header">
        <Icon type="edit"></Icon>
        <span>站内信设置</span>
      </p>
      <div>
        <Form ref="noticeFormData" :model="noticeFormData" label-position="left" :label-width="100" :rules="noticeFormValidate">
          <FormItem label="模板名称" prop="templateName">
            <Input v-model="templateName" size="large" maxlength="9" disabled></Input>
          </FormItem>
          <FormItem label="模板名称" prop="smsContent">
            <Input class='textarea' :rows="5" :autosize="{maxRows:5,minRows: 5}" v-model="noticeFormData.noticeContent" type="textarea" maxlength="150"/>
          </FormItem>
        </Form>

      </div>
      <div slot="footer" style="text-align: right">
        <Button type="success" size="large"  @click="noticeFormDataEdit">设置</Button>
      </div>
    </Modal>

    <!--微信模板-->
    <Modal v-model="wechatModal" width="530">
      <p slot="header">
        <Icon type="edit"></Icon>
        <span>微信设置</span>
      </p>
      <div>
        <Form ref="wechatFormData" :model="wechatFormData" label-position="left" :label-width="100" :rules="wechatFormValidate">
          <FormItem label="模板名称" prop="templateName">
            <Input v-model="templateName" size="large" maxlength="9" disabled></Input>
          </FormItem>
          <FormItem label="头部信息" prop="first">
            <Input v-model="wechatFormData.first" size="large" maxlength="50"></Input>
          </FormItem>
          <FormItem label="备注" prop="remark">
            <Input class='textarea' :rows="5" :autosize="{maxRows:5,minRows: 5}" v-model="wechatFormData.remark" type="textarea" maxlength="150"/>
          </FormItem>
          <FormItem label="是否开启" prop="enable">
            <i-switch v-model="wechatFormData.enable" size="large" :value="smsFormData.enable">
              <span slot="open">开启</span>
              <span slot="close">关闭</span>
            </i-switch>
          </FormItem>
        </Form>

      </div>
      <div slot="footer" style="text-align: right">
        <Button type="success" size="large"  @click="wechatFormDataEdit">设置</Button>
      </div>
    </Modal>
    <Tabs value="log" @on-click="tabPaneChange" v-model="tab">
      <TabPane label="会员消息" name="MEMBER">
        <div class="search">
          <Card>

            <Row class="operation">
              <Button @click="getDataList" icon="md-refresh">刷新</Button>
              <Button type="dashed" @click="openTip=!openTip">{{openTip ? "关闭提示" : "开启提示"}}</Button>
            </Row>
            <Row v-show="openTip">
              <Alert show-icon>
                已选择
                <span class="select-count">{{selectCount}}</span> 项
                <a class="select-clear" @click="clearSelectAll">清空</a>
              </Alert>
            </Row>
            <Table
              :loading="loading"
              border
              :columns="columns"
              :data="data"
              sortable="custom"
              @on-sort-change="changeSort"
              @on-selection-change="showSelect"
              ref="memberTable"
            ></Table>
            <Row type="flex" justify="end" class="page">
              <Page
                :current="searchForm.pageNumber"
                :total="total"
                :page-size="searchForm.pageSize"
                @on-change="changePage"
                @on-page-size-change="changePageSize"
                :page-size-opts="[10,20,50]"
                size="small"
                show-total
                show-elevator
                show-sizer
              ></Page>
            </Row>
          </Card>
        </div>
      </TabPane>
      <TabPane label="店铺消息" name="SHOP">
        <div class="search">
          <Card>

            <Row class="operation">
              <Button @click="getDataList" icon="md-refresh">刷新</Button>
              <Button type="dashed" @click="openTip=!openTip">{{openTip ? "关闭提示" : "开启提示"}}</Button>
            </Row>
            <Row v-show="openTip">
              <Alert show-icon>
                已选择
                <span class="select-count">{{selectCount}}</span> 项
                <a class="select-clear" @click="clearSelectAll">清空</a>
              </Alert>
            </Row>
            <Table
              :loading="loading"
              border
              :columns="columns"
              :data="data"
              sortable="custom"
              @on-sort-change="changeSort"
              @on-selection-change="showSelect"
              ref="shopTable"
            ></Table>
            <Row type="flex" justify="end" class="page">
              <Page
                :current="searchForm.pageNumber"
                :total="total"
                :page-size="searchForm.pageSize"
                @on-change="changePage"
                @on-page-size-change="changePageSize"
                :page-size-opts="[10,20,50]"
                size="small"
                show-total
                show-elevator
                show-sizer
              ></Page>
            </Row>
          </Card>
        </div>
      </TabPane>

      <TabPane label="微信消息" name="WECHAT">
        <div class="search">
          <Card>

            <Row class="operation">
              <Button @click="weChatSync" type="primary" icon="md-add">同步微信消息</Button>
              <Button @click="getDataList" icon="md-refresh">刷新</Button>
              <Button type="dashed" @click="openTip=!openTip">{{openTip ? "关闭提示" : "开启提示"}}</Button>
            </Row>
            <Row v-show="openTip">
              <Alert show-icon>
                已选择
                <span class="select-count">{{selectCount}}</span> 项
                <a class="select-clear" @click="clearSelectAll">清空</a>
              </Alert>
            </Row>
            <Table
              :loading="loading"
              border
              :columns="weChatColumns"
              :data="weChatData"
              sortable="custom"
              @on-sort-change="changeSort"
              @on-selection-change="showSelect"
              ref="weChatTable"
            ></Table>
            <Row type="flex" justify="end" class="page">
              <Page
                :current="weChatSearchForm.pageNumber"
                :total="weChatTotal"
                :page-size="weChatSearchForm.pageSize"
                @on-change="changePage"
                @on-page-size-change="changePageSize"
                :page-size-opts="[10,20,50]"
                size="small"
                show-total
                show-elevator
                show-sizer
              ></Page>
            </Row>
          </Card>
        </div>
      </TabPane>

      <TabPane label="其他消息" name="OTHER">
        <div class="search">
          <Card>

            <Row class="operation">
              <Button @click="getDataList" icon="md-refresh">刷新</Button>
              <Button type="dashed" @click="openTip=!openTip">{{openTip ? "关闭提示" : "开启提示"}}</Button>
            </Row>
            <Row v-show="openTip">
              <Alert show-icon>
                已选择
                <span class="select-count">{{selectCount}}</span> 项
                <a class="select-clear" @click="clearSelectAll">清空</a>
              </Alert>
            </Row>
            <Table
              :loading="loading"
              border
              :columns="columns"
              :data="data"
              sortable="custom"
              @on-sort-change="changeSort"
              @on-selection-change="showSelect"
              ref="otherTable"
            ></Table>
            <Row type="flex" justify="end" class="page">
              <Page
                :current="searchForm.pageNumber"
                :total="total"
                :page-size="searchForm.pageSize"
                @on-change="changePage"
                @on-page-size-change="changePageSize"
                :page-size-opts="[10,20,50]"
                size="small"
                show-total
                show-elevator
                show-sizer
              ></Page>
            </Row>
          </Card>
        </div>
      </TabPane>
    </Tabs>
  </div>


</template>

<script>
  import {
    getMessageData,
    editSmsMessageTemplate,
    editNoticeMessage,
    wechatMessageSync,
    getWechatMessagePage,
    editWechatMessageTemplate,
    delWechatMessageTemplate
  } from "@/api/setting";

  export default {
    title: "message-manage",
    data() {
      return {
        messageTemplate:'',// 当前消息模板
        messageTemplateId:'', // 当前消息模板id
        templateName:'', // 模板名称
        smsModal: false,//短信
        smsFormData:{ // 模板表单数据
          smsState:'',
          smsContent:'',
          smsCode: ''
        },
        smsFormValidate:{ // 验证规则
          smsCode: [{ required: true, message: '请输入短信编码'}],
          smsContent: [{ required: true, message: '请输入短信内容'}],
        },
        noticeModal: false, // 站内信
        noticeFormData:{ // 站内信表单
          noticeContent:''
        },
        noticeFormValidate:{ // 验证规则
          noticeContent: [{ required: true, message: '请输入站内信内容'}],
        },
        wechatModal:false,//微信消息
        wechatFormData:{ // 微信表单
          remark:'',
          first:'',
          enable:'',
        },
        wechatFormValidate:{ // 验证规则
          remark: [{ required: true, message: '请输入站内信内容'}],
          first: [{ required: true, message: '请输入头部文字信息'}],
        },
        tab: "MEMBER", // tabName
        openTip: true,  // 提示展示
        loading: true, // 表单加载状态
        selectCount: 0, // 多选计数
        selectList: [], // 多选数据
        drop: false, // 更多搜索项
        dropDownContent: "展开", // drop显示内容
        dropDownIcon: "ios-arrow-down", // drop图标
        searchForm: {
          // 搜索框对应data对象
          type: "MEMBER",
          pageNumber: 1, // 当前页数
          pageSize: 10, // 页面大小
          sort: "createTime", // 默认排序字段
          order: "desc", // 默认排序方式
          startDate: "", // 起始时间
          endDate: "" // 终止时间
        },
        //微信消息查询
        weChatSearchForm: {
          // 搜索框对应data对象
          pageNumber: 1, // 当前页数
          pageSize: 10, // 页面大小
          sort: "createTime", // 默认排序字段
          order: "desc", // 默认排序方式
        },
        selectDate: null, // 选择日期绑定modal
        columns: [
          // 表头
          {
            type: "selection",
            width: 60,
            align: "center"
          },
          {
            title: "ID",
            key: "id",
            width: 180,
            sortable: true
          },
          {
            title: "模板名称",
            key: "name",
            width: 300,
            sortable: true
          },
          {
            title: "创建时间",
            key: "createTime",
            sortable: true,
            sortType: "desc"
          },
          {
            title: "操作",
            key: "action",
            width: 280,
            align: "center",
            fixed: "right",
            render: (h, params) => {
              return h("div", [
                h(
                  "Button",
                  {
                    props: {
                      size: "small"
                    },
                    style: {
                      marginRight: "5px"
                    },
                    on: {
                      click: () => {
                        this.smsSettingAlert(params.row);
                      }
                    }
                  },
                  "短信设置"
                ),
                h(
                  "Button",
                  {
                    props: {
                      type: "primary",
                      size: "small"
                    },
                    style: {
                      marginRight: "5px"
                    },
                    on: {
                      click: () => {
                        this.noticeSettingAlert(params.row);
                      }
                    }
                  },
                  "站内信设置"
                )
              ]);
            }
          }
        ],
        data: [], // 表单数据
        total: 0, // 表单数据总数
        weChatColumns: [
          // 表头
          {
            type: "selection",
            width: 60,
            align: "center"
          },
          {
            title: "模板编号",
            key: "code",
            width: 500,
            sortable: true
          },
          {
            title: "是否开启",
            key: "enable",
            sortable: true,
            width: 150,
            render: (h, params) => {
              if (params.row.enable == true) {
                return h('div', [
                  h('span', {
                  }, '开启'),
                ]);
              }  else {
                return h('div', [
                  h('span', {
                  }, '关闭'),
                ]);
              }
            },
          },
          {
            title: "模板名称",
            key: "name",
            width: 200,
            sortable: true
          },
          {
            title: "创建时间",
            key: "createTime",
            sortable: true,
            sortType: "desc",
          },
          {
            title: "操作",
            key: "action",
            width: 200,
            align: "center",
            fixed: "right",
            render: (h, params) => {
              return h("div", [
                h(
                  "Button",
                  {
                    props: {
                      type: "primary",
                      size: "small"
                    },
                    style: {
                      marginRight: "5px"
                    },
                    on: {
                      click: () => {
                        this.wechatSettingAlert(params.row);
                      }
                    }
                  },
                  "编辑"
                ),
                h(
                  "Button",
                  {
                    props: {
                      type: "error",
                      size: "small"
                    },
                    style: {
                      marginRight: "5px"
                    },
                    on: {
                      click: () => {
                        this.delWeChat(params.row);
                      }
                    }
                  },
                  "删除"
                )
              ]);
            }
          }
        ],
        weChatData: [], // 表单数据
        weChatTotal: 0, // 表单数据总数
      };
    },
    methods: {
      init() {
        this.getDataList();
      },
      dropDown() {
        if (this.drop) {
          this.dropDownContent = "展开";
          this.dropDownIcon = "ios-arrow-down";
        } else {
          this.dropDownContent = "收起";
          this.dropDownIcon = "ios-arrow-up";
        }
        this.drop = !this.drop;
      },
      changePage(v) {
        this.searchForm.type = this.tab;
        this.searchForm.pageNumber = v;
        this.getDataList();
        this.clearSelectAll();
      },
      changePageSize(v) {
        this.searchForm.type = this.tab;
        this.searchForm.pageSize = v;
        this.getDataList();
      },
      //短信设置弹出框
      smsSettingAlert(v){
        this.smsFormData.smsState = v.smsState == 'OPEN' ? true:false
        this.smsFormData.smsContent = v.smsContent
        this.smsFormData.smsCode = v.smsCode
        this.templateName = v.name
        this.messageTemplateId = v.id
        this.smsModal = true
      },
      //站内信弹出框
      noticeSettingAlert(v){
        this.noticeFormData.noticeContent = v.noticeContent
        this.templateName = v.name
        this.messageTemplateId = v.id
        this.noticeModal = true
      },
      //微信弹出框
      wechatSettingAlert(v){
        this.wechatFormData.remark = v.remark
        this.wechatFormData.first = v.first
        this.wechatFormData.enable = v.enable
        this.templateName = v.name
        this.messageTemplateId = v.id
        this.wechatModal = true
      },
      //短信设置保存
      smsFormDataEdit(){
        this.$refs['smsFormData'].validate((valid) => {
          if (valid) {
             if(this.smsFormData.smsState){
               this.smsFormData.smsState = "OPEN"
             }else{
               this.smsFormData.smsState = "CLOSE"
             }
            editSmsMessageTemplate(this.messageTemplateId,this.smsFormData).then(res => {
              if(res.message === 'success') {
                this.$Message.success('短信模板修改成功');
                this.smsModal = false;
                this.getDataList();
              }
            });
          }
        })
      },
      //微信设置保存
      wechatFormDataEdit(){
        this.$refs['wechatFormData'].validate((valid) => {
          if (valid) {
            editWechatMessageTemplate(this.messageTemplateId,this.wechatFormData).then(res => {
              if(res.message === 'success') {
                this.$Message.success('微信模板修改成功');
                this.wechatModal = false;
                this.getWechatMessagePage();
              }
            });
          }
        })
      },
      //站内信设置保存
      noticeFormDataEdit(){
        this.$refs['noticeFormData'].validate((valid) => {
          if (valid) {
            editNoticeMessage(this.messageTemplateId,this.noticeFormData).then(res => {
              if(res.message === 'success') {
                this.$Message.success('站内信修改成功');
                this.noticeModal = false;
                this.getDataList();
              }
            });
          }
        })
      },
      //同步微信消息
      weChatSync(){
        this.$Modal.confirm({
          title: "提示",
          // 记得确认修改此处
          content: "确认要同步微信消息模板?",
          loading: true,
          onOk: () => {
            // 同步微信消息模板
            wechatMessageSync().then(res => {
              this.$Modal.remove();
              if(res.success) {
                this.$Message.success('微信消息模板同步成功');
              }
            });
          }
        });

      },
      //删除微信模消息
      delWeChat(v){
        this.$Modal.confirm({
          title: "提示",
          content: "确定删除此模板?",
          loading: true,
          onOk: () => {
            // 删除微信消息模板
            delWechatMessageTemplate(v.id).then(res => {
              if(res.success) {
                this.$Modal.remove();
                this.$Message.success('微信模板删除成功');
                this.getWechatMessagePage()
              }
            });
          }
        });

      },
      selectDateRange(v) {
        if (v) {
          this.searchForm.startDate = v[0];
          this.searchForm.endDate = v[1];
        }
      },
      getDataList() {
        this.loading = true;
        getMessageData(this.searchForm).then(res => {
          this.loading = false;
          if (res.success) {
            this.data = res.result.records;
            this.total = res.result.total;
          }
        });
      },
      //分页获取微信消息
      getWechatMessagePage(){
        getWechatMessagePage(this.weChatSearchForm).then(res => {
          this.loading = false;
          if (res.success) {
            this.weChatData = res.result.records;
            this.weChatTotal = res.result.total;
          }
        });
      },
      //tab切换事件
      tabPaneChange(v) {
        this.searchForm.pageNumber = 1;
        this.searchForm.pageSize = 10;
        this.searchForm.type = v;
        //如果是微信消息则走单独的接口
        if(v === "WECHAT"){
          this.getWechatMessagePage();
        }else{
          this.getDataList();
        }

      },
      handleSearch() {
        this.searchForm.pageNumber = 1;
        this.searchForm.pageSize = 10;
        this.getDataList();
      },
      handleReset() {
        this.$refs.searchForm.resetFields();
        this.searchForm.pageNumber = 1;
        this.searchForm.pageSize = 10;
        this.selectDate = null;
        this.searchForm.startDate = "";
        this.searchForm.endDate = "";
        // 重新加载数据
        this.getDataList();
      },
      changeSort(e) {
        this.searchForm.sort = e.key;
        this.searchForm.order = e.order;
        if (e.order == "normal") {
          this.searchForm.order = "";
        }
        this.getDataList();
      },
      showSelect(e) {
        this.selectList = e;
        this.selectCount = e.length;
      },
      clearSelectAll() {
        this.$refs.memberTable.selectAll(false);
        this.$refs.weChatTable.selectAll(false);
        this.$refs.shopTable.selectAll(false);
        this.$refs.otherTable.selectAll(false);

      }
    },
    mounted() {
      this.init();
    }
  };
</script>
