<template>
  <div class="member-choose">
    <Button @click="userModalVisible=true" :icon="icon">{{text}}</Button>
    <span @click="clearSelectData" class="clear">清空已选</span>
    <Collapse simple class="collapse">
      <Panel name="1">
        已选择
        <span class="select-count">{{selectUsers.length}}</span> 人
        <p slot="content">
          <Tag
            v-for="(item, i) in selectUsers"
            :key="i"
            :name="item.id"
            color="default"
            closable
            @on-close="handleCancelUser"
          >{{item.username}}
          </Tag>
        </p>
      </Panel>
    </Collapse>
    <Drawer title="选择用户" closable v-model="userModalVisible" width="800" draggable>
      <Form ref="searchUserForm" :model="searchUserForm" inline :label-width="55">
        <Form-item label="用户名" prop="username">
          <Input
            type="text"
            v-model="searchUserForm.username"
            clearable
            placeholder="请输入用户名"
            style="width: 200px"
          />
        </Form-item>
        <Form-item style="margin-left:-35px;" class="br">
          <Button @click="handleSearchUser" type="primary" icon="ios-search">搜索</Button>
          <Button @click="handleResetUser">重置</Button>
        </Form-item>
      </Form>
      <Table
        :loading="userLoading"
        border
        :columns="userColumns"
        :data="userData"
        :height="height"
        ref="userTable"
      ></Table>
      <Row type="flex" justify="end" style="margin: 10px 0;">
        <Page
          :current="searchUserForm.pageNumber"
          :total="totalUser"
          :page-size="searchUserForm.pageSize"
          @on-change="changeUserPage"
          @on-page-size-change="changeUserPageSize"
          :page-size-opts="[10,20,50]"
          size="small"
          show-total
          show-elevator
          show-sizer
        ></Page>
      </Row>
      <div class="my-drawer-footer">
        已选择
        <span class="select-count">{{selectUsers.length}}</span> 人
        <Button @click="clearSelectData" style="margin-left:10px">清空已选</Button>
        <Button @click="userModalVisible=false" type="primary" style="margin-left:10px">关闭</Button>
      </div>
    </Drawer>
  </div>
</template>

<script>
  import {getMember} from "@/api/member";

  export default {
    name: "userChoose",
    props: {
      text: {
        type: String,
        default: "选择会员"
      },
      icon: {
        type: String,
        default: "md-person-add"
      }
    },
    data() {
      return {
        height: 500, // 表格高度
        userLoading: true, // 加载状态
        userModalVisible: false, // modal显隐
        selectUsers: [], // 已选用户
        searchUserForm: { // 请求参数
          username: "",
          pageNumber: 1, // 当前页数
          pageSize: 10, // 页面大小
          sort: "createTime", // 默认排序字段
          order: "desc" // 默认排序方式
        },
        userColumns: [ // 表头
          {
            type: "index",
            width: 60,
            align: "center"
          },
          {
            title: "用户名",
            key: "username",
            minWidth: 140,
            sortable: true
          },
          {
            title: "头像",
            key: "face",
            width: 80,
            align: "center",
            render: (h, params) => {
              return h("Avatar", {
                props: {
                  src: params.row.face
                }
              });
            }
          },
          {
            title: "手机",
            key: "mobile",
            width: 125,
            sortable: true
          },
          {
            title: "状态",
            key: "status",
            align: "center",
            width: 120,
            render: (h, params) => {
              if (params.row.delFlag == 0) {
                return h("div", [
                  h("Badge", {
                    props: {
                      status: "success",
                      text: "正常启用"
                    }
                  })
                ]);
              } else if (params.row.delFlag == -1) {
                return h("div", [
                  h("Badge", {
                    props: {
                      status: "error",
                      text: "禁用"
                    }
                  })
                ]);
              }
            }
          },
          {
            title: "创建时间",
            key: "createTime",
            sortable: true,
            sortType: "desc",
            width: 170
          },
          {
            title: "操作",
            key: "action",
            width: 130,
            align: "center",
            fixed: "right",
            render: (h, params) => {
              let select;
              this.selectUsers.forEach(item => {
                if (item.id === params.row.id) {
                  select = params.row
                }
              });

              if (select) {
                return h("div", [
                  h(
                  "Button",
                  {
                    props: {
                      type: "info",
                      size: "small"
                    },
                    on: {
                      click: () => {
                        this.chooseCancel(params.row);
                      }
                    }
                  },
                  "取消选择"
                  )
                ]);
              } else {
                return h("div", [
                  h(
                  "Button",
                  {
                    props: {
                      type: "info",
                      size: "small"
                    },
                    on: {
                      click: () => {
                        this.chooseUser(params.row);
                      }
                    }
                  },
                  "选择"
                  )
                ]);
              }
            }
          }
        ],
        userData: [], // 用户数据
        totalUser: 0 // 数量
      };
    },
    methods: {
      changeUserPage(v) {
        this.searchUserForm.pageNumber = v;
        this.getUserDataList();
      },
      changeUserPageSize(v) {
        this.searchUserForm.pageSize = v;
        this.getUserDataList();
      },
      getUserDataList() {
        this.userLoading = true;
        getMember(this.searchUserForm).then(res => {
          this.userLoading = false;
          if (res.success) {
            this.userData = res.result.records;
            this.totalUser = res.result.total;
          }
        });
      },
      handleSearchUser() {
        this.searchUserForm.pageNumber = 1;
        this.searchUserForm.pageSize = 10;
        this.getUserDataList();
      },
      handleResetUser() {
        this.$refs.searchUserForm.resetFields();
        this.searchUserForm.pageNumber = 1;
        this.searchUserForm.pageSize = 9;
        this.$refs.dep.clearSelect();
        this.searchUserForm.departmentId = "";
        // 重新加载数据
        this.getUserDataList();
      },
      setData(v) {
        this.selectUsers = v;
        this.$emit("on-change", this.selectUsers);
      },
      chooseCancel(v){
        let _index;
        this.selectUsers.forEach((e,index) => {
          if (v.id == e.id) {
            _index = index;
          }
        });

        if(_index||_index==0){
          this.selectUsers.splice(_index,1);
          this.$emit("on-change", this.selectUsers);
        }
      },
      chooseUser(v) {
        // 去重
        let that = this;
        let flag = true;
        this.selectUsers.forEach(e => {
          if (v.id == e.id) {
            flag = false;
          }
        });
        if (flag) {
          let u = {
            id: v.id,
            username: v.username
          };
          this.selectUsers.push(u);
          this.$emit("on-change", this.selectUsers);
        }
      },
      clearSelectData() {
        this.selectUsers = [];
        this.$emit("on-change", this.selectUsers);
      },
      handleCancelUser(e, id) {
        // 删除所选用户
        let newArray = [];
        this.selectUsers.forEach(e => {
          if (id != e.id) {
            newArray.push(e);
          }
        });
        this.selectUsers = newArray;
        this.$emit("on-change", this.selectUsers);
        this.$Message.success("删除所选用户成功");
      }
    },
    created() {
      // 计算高度
      this.height = Number(document.documentElement.clientHeight - 230);
      this.getUserDataList();
    }
  };
</script>

<style lang="scss" scoped>
  .member-choose {
    .clear {
      font-size: 12px;
      margin-left: 15px;
      color: #40a9ff;
      cursor: pointer;
    }

    .collapse {
      font-size: 12px;
      margin-top: 15px;
      width: 500px;
    }

    .select-count {
      font-weight: 600;
      color: #40a9ff;
    }
  }

  .my-drawer-footer {
    z-index: 10;
    width: 100%;
    position: absolute;
    bottom: 0;
    left: 0;
    border-top: 1px solid #e8e8e8;
    padding: 10px 16px;
    text-align: right;
    background: #fff;
  }
</style>
