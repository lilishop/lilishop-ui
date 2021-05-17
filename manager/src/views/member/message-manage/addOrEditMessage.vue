<style lang="scss">
@import "./messageManage.scss";
</style>
<template>
  <div>
    <Card>
      <p slot="title">
        <span v-if="type==0">发送新消息</span>
        <span v-else>编辑消息</span>
      </p>
      <Row>
        <Form
          ref="form"
          :model="form"
          :label-width="90"
          :rules="formValidate"
          style="position:relative"
        >
          <FormItem label="消息类型" prop="type">
            <Select v-model="form.type" placeholder="请选择" style="width:250px">
              <Option
                v-for="(item, i) in dictMessageType"
                :key="i"
                :value="item.value"
              >{{item.title}}</Option>
            </Select>
          </FormItem>
          <FormItem label="标题" prop="title">
            <Input v-model="form.title" style="width:600px" />
          </FormItem>
          <FormItem label="内容" prop="content" class="wangEditor">
            <editor v-model="form.content"></editor>
          </FormItem>
          <FormItem label="新创建账号也推送" prop="createSend">
            <i-switch size="large" v-model="form.createSend">
              <span slot="open">开启</span>
              <span slot="close">关闭</span>
            </i-switch>
          </FormItem>
          <div v-if="type==0">
            <FormItem label="发送范围">
              <RadioGroup type="button" button-style="solid" v-model="form.range">
                <Radio :label="0">全体用户</Radio>
                <Radio :label="1">指定用户成员</Radio>
              </RadioGroup>
            </FormItem>
            <div>
              <FormItem label="选择用户" v-if="form.range==1">
                <user-choose text="选择发送用户" @on-change="handleSelectUser" ref="user"></user-choose>
              </FormItem>
            </div>
          </div>
          <Form-item class="br">
            <Button
              type="primary"
              :loading="submitLoading"
              @click="handelSubmit"
              style="width:100px"
            >提交</Button>
            <Button @click="handelCancel">取消</Button>
          </Form-item>
          <Spin size="large" fix v-if="loading"></Spin>
        </Form>
      </Row>
    </Card>
  </div>
</template>

<script>
import { getMessageDataById, addMessage, editMessage } from "@/api/index";
import editor from "@/views/my-components/lili/editor";
import userChoose from "@/views/my-components/lili/user-choose";
export default {
  name: "add_edit_message",
  components: {
    userChoose,
    editor
  },
  data() {
    return {
      type: 0, // 消息类型
      loading: false, // 表单加载状态
      selectUsers: [], // 已选用户
      modalTitle: "", // 添加或编辑标题
      form: { // 表单
        // 添加或编辑表单对象初始化数据
        title: "",
        content: "",
        type: "",
        range: 0
      },
      formValidate: {
        // 表单验证规则
       /* type: [
          { required: true, message: "消息类型不能为空", trigger: "blur" }
        ],*/
        title: [{ required: true, message: "标题不能为空", trigger: "blur" }],
        content: [{ required: true, message: "内容不能为空", trigger: "blur" }]
      },
      submitLoading: false, // 添加或编辑提交状态
      dictMessageType: this.$store.state.dict.messageType, // 消息类型
      backRoute: "" // 上一个页面路由
    };
  },
  methods: {
    init() {
      this.type = this.$route.query.type;
      this.backRoute = this.$route.query.backRoute;
      if (this.type == 1) {
        this.form.id = this.$route.query.id;
        this.getData();
      }
    },
    getData() {
      this.loading = true;
      getMessageDataById(this.form.id).then(res => {
        this.loading = false;
        if (res.success) {
          // 转换null为""
          let v = res.result;
          for (let attr in v) {
            if (v[attr] == null) {
              v[attr] = "";
            }
          }
          let str = JSON.stringify(v);
          let data = JSON.parse(str);
          this.form = data;
        }
      });
    },
    handelSubmit() {
      this.$refs.form.validate(valid => {
        if (valid) {
          this.submitLoading = true;
          if (this.type == 0) {
            // 添加 避免编辑后传入id等数据 记得删除
            delete this.form.id;
            // 用户id数据
            let ids = [];
            this.selectUsers.forEach(e => {
              ids += e.id + ",";
            });
            if (ids.length > 0) {
              ids = ids.substring(0, ids.length - 1);
            }
            this.form.userIds = ids;
            addMessage(this.form).then(res => {
              this.submitLoading = false;
              if (res.success) {
                this.$Message.success("操作成功");
                this.closeCurrentPage();
              }
            });
          } else if (this.type == 1) {
            // 编辑
            editMessage(this.form).then(res => {
              this.submitLoading = false;
              if (res.success) {
                this.$Message.success("操作成功");
                this.closeCurrentPage();
              }
            });
          }
        }
      });
    },
    handleSelectUser(v) {
      this.selectUsers = v;
    },
    handelCancel() {
      this.closeCurrentPage();
    },
    // 关闭当前页面
    closeCurrentPage() {
      this.$store.commit("removeTag", "add_edit_message");
      localStorage.pageOpenedList = JSON.stringify(
        this.$store.state.app.pageOpenedList
      );
      this.$router.push({
        name: this.backRoute
      });
    }
  },
  mounted() {
    this.init();
  },
  watch: {
    // 监听路由变化
    $route(to, from) {
      if (to.name == "add_edit_message") {
        this.type = this.$route.query.type;
        if (this.type == 1) {
          this.form.id = this.$route.query.id;
          this.getData();
        }
      }
    }
  }
};
</script>
