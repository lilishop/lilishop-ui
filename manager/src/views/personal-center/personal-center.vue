<style lang="scss" scoped>
@import "./personal-center.scss";
</style>

<template>
  <div class="own-space">
    <Card class="own-space-new">
      <div class="own-wrap">
        <div style="width:240px">
          <Menu :active-name="activeName" theme="light" @on-select="changeMenu">
            <MenuItem name="基本信息">基本信息</MenuItem>
            <MenuItem name="安全设置">安全设置</MenuItem>
          </Menu>
        </div>
        <div style="padding: 8px 40px;width:100%">
          <div class="title">{{ currMenu }}</div>
          <div>
            <div v-show="currMenu=='基本信息'">
              <Form ref="userForm" :model="userForm" :label-width="90" label-position="left">
                <FormItem label="用户头像：">
                  <upload-pic-thumb
                    v-model="userForm.avatar"
                    :multiple="false"
                  ></upload-pic-thumb>
                </FormItem>

                <FormItem label="用户名：">
                  {{ userForm.username }}
                </FormItem>
                <FormItem label="昵称：" prop="nickName">
                  <Input v-model="userForm.nickName" style="width: 250px"/>
                </FormItem>
                <FormItem>
                  <Button
                    type="primary"
                    style="width: 100px;margin-right:5px"
                    :loading="saveLoading"
                    @click="saveEdit"
                  >保存
                  </Button>
                </FormItem>
              </Form>
            </div>
            <div v-show="currMenu=='安全设置'" class="safe">
              <div class="item">
                <div>
                  <div class="title">账户密码</div>
                </div>
                <div>
                  <a @click="changePassword">修改</a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Card>

  </div>
</template>

<script>
import {
  userInfo,
  userInfoEdit,
} from "@/api/index";
import CountDownButton from "@/views/my-components/lili/count-down-button";
import uploadPicThumb from "@/views/my-components/lili/upload-pic-thumb";
import Cookies from "js-cookie";
import util from "@/libs/util";

export default {
  components: {
    uploadPicThumb,
    CountDownButton
  },
  name: "personal-enter",
  data() {
    return {
      activeName: "基本信息", // 激活的tab
      userForm: { // 用户信息
        avatar: "",
        nickname: ""
      },
      saveLoading:false,//loading 状态
      currMenu: "基本信息" // 当前菜单
    };
  },
  methods: {
    init() {
      let v = JSON.parse(Cookies.get("userInfo"));
      // 转换null为""
      for (let attr in v) {
        if (v[attr] == null) {
          v[attr] = "";
        }
      }
      let userInfo = JSON.parse(JSON.stringify(v));
      this.userForm = userInfo;
      console.log(userInfo)
    },
    changePassword() {
      util.openNewPage(this, "change-password");
      this.$router.push({
        name: "change_password"
      });
    },
    changeMenu(v) {
      this.currMenu = v;
    },
    saveEdit() {
      this.saveLoading = true;
      let params = this.userForm;
      userInfoEdit(params).then(res => {
        this.saveLoading = false;
        if (res.success) {
          this.$Message.success("保存成功");
          // 更新用户信息
          Cookies.set("userInfo", this.userForm);
          // 更新头像
          this.$store.commit("setAvatarPath", this.userForm.avatar);

          setTimeout(()=>{
            this.$router.go(0)
          },500)

        }
      });
    },
    updateUserInfo() {
      // 更新用户信息
      userInfo().then(res => {
        if (res.success) {
          // 避免超过大小限制
          delete res.result.permissions;
          if (this.getStore("saveLogin")) {
            // 保存7天
            Cookies.set("userInfo", JSON.stringify(res.result), {
              expires: 7
            });
          } else {
            Cookies.set("userInfo", JSON.stringify(res.result));
          }
          this.setStore("userInfo", res.result);
        }
      });
    },
    changeMessage(v) {
      this.setStore("messageOpen", v);
    }
  },
  mounted() {
    let type = this.$route.query.type;
    this.init();
  }
};
</script>
