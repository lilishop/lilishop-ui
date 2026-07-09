<template>
  <div class="own-space">
    <el-card class="own-space-new">
      <div class="own-wrap">
        <div style="width:240px">
          <el-menu :default-active="activeName" @select="changeMenu">
            <el-menu-item index="基本信息">基本信息</el-menu-item>
            <el-menu-item index="安全设置">安全设置</el-menu-item>
          </el-menu>
        </div>
        <div style="padding: 8px 40px;width:100%">
          <div class="title">{{ currMenu }}</div>
          <div>
            <div v-show="currMenu=='基本信息'">
              <el-form ref="userForm" :model="userForm" label-width="90px" label-position="left">
                <el-form-item label="用户头像：">
                  <upload-pic-thumb
                    v-model="userForm.avatar"
                    :multiple="false"
                  ></upload-pic-thumb>
                </el-form-item>

                <el-form-item label="用户名：">
                  {{ userForm.username }}
                </el-form-item>
                <el-form-item label="昵称：" prop="nickName">
                  <el-input maxlength="20" v-model="userForm.nickName" style="width: 250px"/>
                </el-form-item>
                <el-form-item>
                  <el-button
                    type="primary"
                    style="width: 100px;margin-right:5px"
                    :loading="saveLoading"
                    @click="saveEdit"
                  >保存
                  </el-button>
                </el-form-item>
              </el-form>
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
    </el-card>

  </div>
</template>

<script>
import {
  userInfoEdit,
} from "@/api/index";
import uploadPicThumb from "@/components/lili/upload-pic-thumb";
import Cookies from "js-cookie";
import util from "@/libs/util";

export default {
  components: {
    uploadPicThumb
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
    // 初始化数据
    init() {
      let v = JSON.parse(Cookies.get("userInfoManager"));
      // 转换null为""
      for (let attr in v) {
        if (v[attr] == null) {
          v[attr] = "";
        }
      }
      let userInfo = JSON.parse(JSON.stringify(v));
      this.userForm = userInfo;
    },
    // 跳转修改密码页面
    changePassword() {
      util.openNewPage(this, "change-password");
      this.$router.push({
        name: "change_password"
      });
    },
    // 左侧菜单点击
    changeMenu(v) {
      this.currMenu = v;
    },
    // 保存
    saveEdit() {
      this.saveLoading = true;
      let params = this.userForm;
      userInfoEdit(params).then(res => {
        this.saveLoading = false;
        if (res.success) {
          this.$Message.success("保存成功");
          // 更新用户信息
          Cookies.set("userInfoManager", JSON.stringify(this.userForm));
          // 更新头像
          this.$store.commit("setAvatarPath", this.userForm.avatar);
          setTimeout(()=>{
            this.$router.go(0)
          },500)

        }
      });
    },
  },
  mounted() {
    this.init();
  }
};
</script>
<style lang="scss" scoped>
  .own-space {
  .own-space-new {
    :deep(.el-card__body) {
      padding: 16px 16px 16px 0;
    }
  }

  .own-wrap {
    display: flex;

    .title {
      font-size: 20px;
      color: rgba(0, 0, 0, .85);
      line-height: 28px;
      font-weight: 500;
      margin-bottom: 12px;
    }

    .safe {
      width: 100%;

      .item {
        width: 100%;
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding-top: 14px;
        padding-bottom: 14px;
        border-bottom: 1px solid #e8e8e8;

        .title {
          color: rgba(0, 0, 0, .65);
          margin-bottom: 4px;
          font-size: 14px;
          line-height: 22px;
        }

        .desc {
          color: rgba(0, 0, 0, .45);
          font-size: 14px;
          line-height: 22px;

          .red {
            color: #ed3f14;
          }

          .middle {
            color: #faad14;
          }

          .green {
            color: #52c41a;
          }
        }
      }
    }
  }
}

:deep(.upload-list){
  img {
    width: 100%;
    height: 100%;
  }
}

</style>
