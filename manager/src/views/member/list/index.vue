<template>
  <div class="search">
    <Card>
      <Row @keydown.enter.native="handleSearch">
        <Form ref="searchForm" :model="searchForm" inline :label-width="70" class="search-form">
          <Form-item label="会员ID" prop="id">
            <Input type="text" v-model="searchForm.id" placeholder="请输入会员ID" clearable style="width: 240px" />
          </Form-item>

          <Form-item label="会员名称" prop="username">
            <Input type="text" v-model="searchForm.username" placeholder="请输入会员名称" clearable style="width: 240px" />
          </Form-item>

          <Form-item label="会员昵称" prop="nickName">
            <Input type="text" v-model="searchForm.nickName" placeholder="请输入会员昵称" clearable style="width: 240px" />
          </Form-item>

          <Form-item label="联系方式" prop="mobile">
            <Input type="text" v-model="searchForm.mobile" placeholder="请输入会员联系方式" clearable style="width: 240px" />
          </Form-item>
          <Button @click="handleSearch" class="search-btn" type="primary" icon="ios-search">搜索</Button>
        </Form>
      </Row>
      </Card>
      <Card>
      <Row class="operation padding-row" v-if="!selectedMember">
        <Button @click="addMember" type="primary">添加会员</Button>
      </Row>

      <Table :loading="loading" :columns="columns" class="mt_10" :data="data" ref="table"></Table>
      <Row type="flex" justify="end" class="mt_10">
        <Page :current="searchForm.pageNumber" :total="total" :page-size="searchForm.pageSize" @on-change="changePage"
          @on-page-size-change="changePageSize" :page-size-opts="[20, 50, 100]" size="small" show-total show-elevator
          show-sizer></Page>
      </Row>
    </Card>

    <!-- 添加用户模态框 -->
    <Modal v-model="addFlag" title="添加会员">
      <Form ref="addMemberForm" :model="addMemberForm" :rules="addRule" :label-width="100">
        <FormItem label="手机号码" prop="mobile" style="width: 90%;">
          <Input v-model="addMemberForm.mobile" maxlength="11" placeholder="请输入手机号码" />
        </FormItem>
        <FormItem label="会员名称" prop="username" style="width: 90%">
          <Input v-model="addMemberForm.username" maxlength="15" placeholder="请输入会员名称" />
        </FormItem>

        <FormItem label="会员密码" prop="password" style="width: 90%">
          <Input type="password" password v-model="addMemberForm.password" maxlength="20" placeholder="请输入会员密码" />
        </FormItem>
      </Form>
      <div slot="footer">
        <Button @click="addFlag = false">取消</Button>
        <Button type="primary" @click="addMemberSubmit">确定</Button>
      </div>
    </Modal>
    <!-- 修改模态框 -->
    <Modal v-model="descFlag" :title="descTitle" @on-ok="handleSubmitModal" width="500">
      <Form ref="form" :model="form" :rules="ruleValidate" :label-width="80">

        <Input v-model="form.id" v-show="false"/>

        <FormItem label="头像">
          <img :src="form.face || defaultPic" class="face" />
          <Button type="text" class="upload" @click="() => {
                this.picModelFlag = true;
                this.$refs.ossManage.selectImage = true;
              }">修改</Button>
          <input type="file" style="display: none" id="file" />
        </FormItem>
        <FormItem label="用户名" prop="name">
          <Input v-model="form.username" style="width: 200px" disabled />
        </FormItem>
        <FormItem label="用户昵称" prop="name">
          <Input v-model="form.nickName" style="width: 200px" />
        </FormItem>
        <FormItem label="性别" prop="sex">
          <RadioGroup type="button" button-style="solid" v-model="form.sex">
            <Radio :label="1">
              <span>男</span>
            </Radio>
            <Radio :label="0">
              <span>女</span>
            </Radio>
          </RadioGroup>
        </FormItem>
        <FormItem label="修改密码" prop="password">
          <Input type="password" style="width: 220px" password v-model="form.newPassword" />
        </FormItem>
        <FormItem label="生日" prop="birthday">
          <DatePicker type="date" format="yyyy-MM-dd" v-model="form.birthday" style="width: 220px"></DatePicker>
        </FormItem>
        <FormItem label="所在地" prop="mail">
          {{ form.region || '暂无地址' }}


          <Button style="margin-left: 10px;" @click="$refs.map.open()">选择</Button>

        </FormItem>
      </Form>
    </Modal>
    <Modal v-model="walletIncreaseFlag" title="增加余额" width="420">
      <Form ref="walletIncreaseForm" :model="walletIncreaseForm" :rules="walletIncreaseRule" :label-width="90">
        <FormItem label="充值金额" prop="rechargeMoney">
          <InputNumber v-model="walletIncreaseForm.rechargeMoney" :min="0.01" :precision="2" style="width: 240px" />
        </FormItem>
      </Form>
      <div slot="footer">
        <Button @click="walletIncreaseFlag = false">取消</Button>
        <Button type="primary" :loading="walletIncreaseLoading" @click="submitWalletIncrease">确定</Button>
      </div>
    </Modal>
    <Modal v-model="memberPointFlag" title="修改积分" width="420">
      <Form ref="memberPointForm" :model="memberPointForm" :rules="memberPointRule" :label-width="90">
        <FormItem label="类型" prop="type">
          <RadioGroup type="button" button-style="solid" v-model="memberPointForm.type">
            <Radio label="INCREASE">增加</Radio>
            <Radio label="REDUCE">减少</Radio>
          </RadioGroup>
        </FormItem>
        <FormItem label="积分" prop="point">
          <InputNumber v-model="memberPointForm.point" :min="1" :precision="0" style="width: 240px" />
        </FormItem>
      </Form>
      <div slot="footer">
        <Button @click="memberPointFlag = false">取消</Button>
        <Button type="primary" :loading="memberPointLoading" @click="submitMemberPoint">确定</Button>
      </div>
    </Modal>
    <Modal width="1200px" v-model="picModelFlag">
      <ossManage @callback="callbackSelected" :isComponent="true" :initialize="picModelFlag" ref="ossManage" />
    </Modal>
    <multipleMap ref="map" @callback="selectedRegion"/>
  </div>
</template>

<script>
import multipleMap from "@/components/map/multiple-map";
import * as API_Member from "@/api/member.js";
import ossManage from "@/views/sys/oss-manage/ossManage";
import * as RegExp from "@/libs/RegExp.js";

export default {
  name: "member",
  components: {
    multipleMap,
    ossManage,
  },
  data() {
    return {
      defaultPic:require('@/assets/default.png'),
      descTitle: "", // modal标题
      descFlag: false, //编辑查看框
      loading: true, // 表单加载状态
      addFlag: false, // modal显隐控制

      addMemberForm: {
        // 添加用户表单
        mobile: "",
        username: "",
        password: "",
      },
      searchForm: {
        // 请求参数
        pageNumber: 1,
        pageSize: 20, // 页面大小
        order: "desc",
        id: "",
        username: "",
        mobile: "",
        disabled: "OPEN",
      },
      picModelFlag: false, // 选择图片
      form: {}, // 表单数据
      walletIncreaseFlag: false,
      walletIncreaseLoading: false,
      walletIncreaseForm: {
        memberId: "",
        rechargeMoney: null,
      },
      walletIncreaseRule: {
        rechargeMoney: [
          { required: true, type: "number", message: "请输入充值金额", trigger: "change" },
          {
            validator: (rule, value, callback) => {
              if (typeof value !== "number" || value <= 0) {
                callback(new Error("充值金额必须大于0"));
                return;
              }
              callback();
            },
            trigger: "change",
          },
        ],
      },
      memberPointFlag: false,
      memberPointLoading: false,
      memberPointForm: {
        memberId: "",
        point: null,
        type: "INCREASE",
      },
      memberPointRule: {
        type: [{ required: true, message: "请选择类型", trigger: "change" }],
        point: [
          { required: true, type: "number", message: "请输入积分", trigger: "change" },
          {
            validator: (rule, value, callback) => {
              if (typeof value !== "number" || value <= 0) {
                callback(new Error("积分必须大于0"));
                return;
              }
              callback();
            },
            trigger: "change",
          },
        ],
      },
      addRule: {
        // 验证规则
        mobile: [
          { required: true, message: "请输入手机号码" },
          {
            pattern: RegExp.mobile,
            message: "请输入正确的手机号",
          },
        ],
        username: [{ required: true, message: "请输入会员名称" }],
        password: [{ required: true, message: "请输入密码" }],
      },
      ruleValidate: {}, //修改验证
      columns: [
        {
          title: "会员ID",
          key: "id",
          minWidth: 120,  // 减少宽度
          tooltip: true,
        },
        {
          title: "头像",
          key: "face",
          minWidth: 80,
          align: "center",
          render: (h, params) => {
            return h("img", {
              attrs: {
                src: params.row.face || require('@/assets/default.png'),
                alt: "头像"
              },
              style: {
                width: "30px",
                height: "30px",
                borderRadius: "50%",
                objectFit: "cover"
              }
            });
          }
        },
        {
          title: "会员名称",
          key: "username",
          tooltip: true,
          minWidth: 150,  // 减少宽度
        },
        {
          title: "会员昵称",
          key: "nickName",
          tooltip: true,
          minWidth: 120,  // 减少宽度
        },
        {
          title: "联系方式",
          minWidth: 130,
          key: "mobile",
          render: (h, params) => {
            if (params.row.mobile == null) {
              return h("div", [h("span", {}, "")]);
            } else {
              return h("div", [h("span", {}, params.row.mobile)]);
            }
          },
        },
        {
          title: "注册时间",
          key: "createTime",
          minWidth: 160,  // 减少宽度
        },
        {
          title: "最后登录时间",
          key: "lastLoginDate",
          minWidth: 160,  // 减少宽度
        },

        {
          title: "积分数量",
          align: "left",
          minWidth: 120,  // 增加宽度
          render: (h, params) => {
            return h(
              "div",
              {},
              params.row.point == void 0 ? "0" : params.row.point
            );
          },
        },
        {
          title: "余额",
          key: "memberWallet",
          width: 120,
          render: (h, params) => {
            return h("priceColorScheme", {props:{value:params.row.memberWallet}} );
          },
        },
        {
          title: "操作",
          key: "action",
          align: "center",
          minWidth: 160,
          fixed: "right",
          render: (h, params) => {
            if (this.selectedMember) {
              return h(
                "div",
                {
                  style: {
                    display: "flex",
                    justifyContent: "center",
                  },
                },
                [
                  h(
                    "a",
                    {
                      style: {
                        color: "#2d8cf0",
                        cursor: "pointer",
                        textDecoration: "none",
                      },
                      on: {
                        click: () => {
                          this.callback(params.row, params.index);
                        },
                      },
                    },
                    params.row.___selected ? "已选择" : "选择"
                  ),
                ]
              );
            }

            const divider = h(
              "span",
              {
                style: {
                  margin: "0 8px",
                  color: "#dcdee2",
                },
              },
              "|"
            );

            const viewLink = h(
              "a",
              {
                style: {
                  color: "#2d8cf0",
                  cursor: "pointer",
                  textDecoration: "none",
                },
                on: {
                  click: () => {
                    this.detail(params.row);
                  },
                },
              },
              "查看"
            );

            const moreDropdown = h(
              "Dropdown",
              {
                props: {
                  trigger: "click",
                  transfer: true,
                },
                on: {
                  "on-click": (name) => {
                    if (name === "edit") {
                      this.editPerm(params.row);
                    }
                    if (name === "disabled") {
                      this.disabled(params.row);
                    }
                    if (name === "increaseWallet") {
                      this.openWalletIncrease(params.row);
                    }
                    if (name === "updatePoint") {
                      this.openMemberPoint(params.row);
                    }
                  },
                },
              },
              [
                h(
                  "a",
                  {
                    style: {
                      color: "#2d8cf0",
                      cursor: "pointer",
                      textDecoration: "none",
                      display: "inline-flex",
                      alignItems: "center",
                    },
                  },
                  [
                    h("span", "更多"),
                    h("Icon", {
                      props: {
                        type: "md-arrow-dropdown",
                      },
                      style: {
                        marginLeft: "4px",
                      },
                    }),
                  ]
                ),
                h(
                  "DropdownMenu",
                  {
                    slot: "list",
                  },
                  [
                    h(
                      "DropdownItem",
                      {
                        props: {
                          name: "edit",
                        },
                      },
                      "编辑会员"
                    ),
                    h(
                      "DropdownItem",
                      {
                        props: {
                          name: "increaseWallet",
                        },
                      },
                      "增加余额"
                    ),
                    h(
                      "DropdownItem",
                      {
                        props: {
                          name: "updatePoint",
                        },
                      },
                      "修改积分"
                    ),
                    h(
                      "DropdownItem",
                      {
                        props: {
                          name: "disabled",
                        },
                      },
                      "禁用会员"
                    ),
                  ]
                ),
              ]
            );

            return h(
              "div",
              {
                style: {
                  display: "flex",
                  justifyContent: "center",
                },
              },
              [viewLink, divider, moreDropdown]
            );
          },
        },
      ],
      data: [], // 表单数据
      total: 0, // 表单数据总数
      selectMember: [], //保存选中的用户
    };
  },
  props: {
    // 是否为选中模式
    selectedMember: {
      type: Boolean,
      default: false,
    },
    // 已选择用户数据
    selectedList: {
      type: null,
      default: () => {
        return [];
      },
    },
  },
  watch: {
    selectedList: {
      handler(val) {
        this.$set(this, "selectMember", JSON.parse(JSON.stringify(val)));
        this.init(this.data);
        // 将父级数据与当前组件数据进行匹配
      },
      deep: true,
      immediate: true,
    },
  },
  methods: {
    // 回调给父级
    callback(val, index) {
      this.selectMember.forEach(item=>{item.___selected = false})
      this.$set(val, "___selected", !val.___selected);
      console.log(val.___selected);
      console.log(this.selectMember);
      let findUser = this.selectMember.find((item) => {
        return item.id == val.id;
      });
      // 如果没有则添加
      if (!findUser) {
        this.selectMember.push(val);
      } else {
        // 有重复数据就删除
        this.selectMember.map((item, index) => {
          if (item.id == findUser.id) {
            this.selectMember.splice(index, 1);
          }
        });
      }

      this.$emit("callback", val);
    },
    // 初始化信息
    init(data) {
      data.forEach((item) => {
        if (this.selectMember.length != 0) {
          this.selectMember.forEach((member) => {
            if (member.id == item.id) {
              this.$set(item, "___selected", true);
            }
          });
        } else {
          this.$set(item, "___selected", false);
        }
      });
      this.data = data;
    },
    // 分页 改变页码
    changePage(v) {
      this.searchForm.pageNumber = v;
      this.getData();
    },
    // 分页 改变页数
    changePageSize(v) {
      this.searchForm.pageSize = v;
      this.searchForm.pageNumber = 1;
      this.getData();
    },
    // 搜索
    handleSearch() {
      this.searchForm.pageNumber = 1;
      this.searchForm.pageSize = 20;
      this.getData();
    },
    //查看详情修改
    editPerm(val) {
      this.descTitle = `查看用户 ${val.username}`;
      this.descFlag = true;

      this.getMemberInfo(val.id);
    },
    addMember() {
      this.addFlag = true;
      this.$refs.addMemberForm.resetFields();
    },
    /**
     * 查询查看会员详情
     */
    getMemberInfo(id) {
      API_Member.getMemberInfoData(id).then((res) => {
        if (res.result) {
          this.$set(this, "form", res.result);
        }
      });
    },

    //查询会员列表
    getData() {
      API_Member.getMemberListData(this.searchForm).then((res) => {
        if (res.result.records) {
          this.loading = false;
          this.init(res.result.records);
          this.total = res.result.total;
        }
      });
    },
    // 选中的图片
    callbackSelected(val) {
      this.picModelFlag = false;
      this.form.face = val.url;
    },
    //添加会员提交
    addMemberSubmit() {
      this.addMemberForm.password = this.md5(this.addMemberForm.password);
      this.$refs.addMemberForm.validate((valid) => {
        if (valid) {
          API_Member.addMember(this.addMemberForm).then((res) => {
            if (res.result) {
              this.$refs.addMemberForm.resetFields();
              this.getData();
              this.$Message.success("添加成功！");
              this.addFlag = false;
            }
          });
        }
      });
    },

    // 选中的地址
    selectedRegion(val) {
      if(val.type === 'select'){
        const paths = val.data.map(item => item.name).join(',')
        const ids = val.data.map(item => item.id).join(',')

        this.$set(this.form,'region',paths)
        this.$set(this.form,'regionId',ids)

      }
      else{
        this.$set(this.form,'region',val.data.addr)
        this.$set(this.form,'regionId',val.data.addrId)
      }
    },
    //查看会员
    detail(row) {
      this.$options.filters.customRouterPush({ name: "member-detail", query: { id: row.id } })
    },

    //禁用会员
    disabled(v) {
      let params = {
        memberIds: [v.id],
        disabled: false,
      };
      this.$Modal.confirm({
        title: "提示",
        content: "<p>确认禁用此会员？</p>",
        onOk: () => {
          API_Member.updateMemberStatus(params).then((res) => {
            if (res.success) {
              this.$Message.success("禁用成功");
              this.getData();
            } else {
              // this.$Message.error(res.message);
            }
          });
        },
      });
    },

    openWalletIncrease(row) {
      this.walletIncreaseLoading = false;
      this.$set(this, "walletIncreaseForm", { memberId: row.id, rechargeMoney: null });
      this.walletIncreaseFlag = true;
      this.$nextTick(() => {
        this.$refs.walletIncreaseForm && this.$refs.walletIncreaseForm.resetFields();
      });
    },
    submitWalletIncrease() {
      this.$refs.walletIncreaseForm.validate((valid) => {
        if (!valid) return;
        this.walletIncreaseLoading = true;
        API_Member.increaseMemberWallet({
          memberId: this.walletIncreaseForm.memberId,
          rechargeMoney: this.walletIncreaseForm.rechargeMoney,
        })
          .then((res) => {
            if (res && res.success) {
              this.$Message.success("充值成功");
              this.walletIncreaseFlag = false;
              this.getData();
            } else {
              this.$Message.error((res && res.message) || "充值失败");
            }
          })
          .finally(() => {
            this.walletIncreaseLoading = false;
          });
      });
    },

    openMemberPoint(row) {
      this.memberPointLoading = false;
      this.$set(this, "memberPointForm", { memberId: row.id, point: null, type: "INCREASE" });
      this.memberPointFlag = true;
      this.$nextTick(() => {
        this.$refs.memberPointForm && this.$refs.memberPointForm.resetFields();
      });
    },
    submitMemberPoint() {
      this.$refs.memberPointForm.validate((valid) => {
        if (!valid) return;
        this.memberPointLoading = true;
        API_Member.updateMemberPoint({
          memberId: this.memberPointForm.memberId,
          point: this.memberPointForm.point,
          type: this.memberPointForm.type,
        })
          .then((res) => {
            if (res && res.success) {
              this.$Message.success("修改成功");
              this.memberPointFlag = false;
              this.getData();
            } else {
              this.$Message.error((res && res.message) || "修改失败");
            }
          })
          .finally(() => {
            this.memberPointLoading = false;
          });
      });
    },

    // 提交修改数据
    handleSubmitModal() {
      const { nickName, sex, username, face, newPassword,id,regionId,region } = this.form;
      let time = new Date(this.form.birthday);
      let birthday = this.form.birthday=== undefined?'':
        time.getFullYear() + "-" + (time.getMonth() + 1) + "-" + time.getDate();
      let submit = {
        regionId,
        region,
        nickName,

        sex,
        birthday,
        face,
        id
      };

      if (newPassword) {
        submit.password = this.md5(newPassword);
      }
      API_Member.updateMember(submit).then((res) => {
        if (res.result) {
          this.$Message.success("修改成功！");
          this.getData();
        }
      });
    },
  },
  mounted() {
    this.getData();
  },
};
</script>
<style lang="scss" scoped>
::v-deep .ivu-table-wrapper {
  width: 100%;
}
::v-deep .ivu-card {
  width: 100%;
}
.face {
  width: 60px;
  height: 60px;
  border-radius: 50%;
}

</style>
