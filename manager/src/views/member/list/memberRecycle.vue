<template>
  <div class="search">
    <el-card>
      <el-form
        ref="searchForm"
        :model="searchForm"
        inline
        label-width="70px"
        class="search-form"
        @keyup.enter="handleSearch"
      >
        <el-form-item label="会员名称" prop="username">
          <el-input
            v-model="searchForm.username"
            placeholder="请输入会员名称"
            clearable
            style="width: 240px"
          />
        </el-form-item>
        <el-form-item label="联系方式" prop="mobile">
          <el-input
            v-model="searchForm.mobile"
            placeholder="请输入会员联系方式"
            clearable
            style="width: 240px"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" class="search-btn" @click="handleSearch">搜索</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-card>
      <el-table
        ref="table"
        v-loading="loading"
        border
        :data="data"
        class="mt_10"
        style="width: 100%"
      >
        <el-table-column prop="username" label="会员名称" min-width="150" align="left" show-overflow-tooltip />
        <el-table-column prop="nickName" label="昵称" min-width="120" align="left" show-overflow-tooltip />
        <el-table-column label="联系方式" min-width="130">
          <template #default="{ row }">
            <span v-if="row">{{ row.mobile || "" }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="注册时间" min-width="180" />
        <el-table-column label="积分数量" min-width="120" align="left">
          <template #default="{ row }">
            <span v-if="row">{{ row.point == void 0 ? "0" : row.point }}</span>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200" align="center" fixed="right">
          <template #default="{ row }">
            <div v-if="row" class="ops" style="display: flex; justify-content: center">
              <template v-if="selectedMember">
                <a class="link-text" @click="callback(row)">选择</a>
                <span class="op-split">|</span>
              </template>
              <a class="link-text" @click="detail(row)">查看</a>
              <template v-if="!selectedMember">
                <span class="op-split">|</span>
                <a class="link-text" @click="enable(row)">启用</a>
                <span class="op-split">|</span>
                <a class="link-text" @click="editPerm(row)">编辑</a>
              </template>
            </div>
          </template>
        </el-table-column>
      </el-table>

      <div class="mt_10" style="display: flex; justify-content: flex-end">
        <el-pagination
          v-model:current-page="searchForm.pageNumber"
          v-model:page-size="searchForm.pageSize"
          :page-sizes="[20, 50, 100]"
          :total="total"
          layout="total, sizes, prev, pager, next, jumper"
          size="small"
          @current-change="changePage"
          @size-change="changePageSize"
        />
      </div>
    </el-card>

    <el-dialog v-model="descFlag" :title="descTitle" width="500px" destroy-on-close>
      <el-form ref="formValidate" :model="formValidate" :rules="ruleValidate" label-width="80px">
        <el-form-item label="头像">
          <img :src="formValidate.face" class="face" />
          <el-button
            type="primary"
            link
            class="upload"
            @click="openPicSelector"
          >修改</el-button>
          <input type="file" style="display: none" id="file" />
        </el-form-item>
        <el-form-item label="会员名称" prop="name">
          <el-input v-model="formValidate.username" style="width: 200px" disabled />
        </el-form-item>
        <el-form-item label="用户昵称" prop="name">
          <el-input v-model="formValidate.nickName" style="width: 200px" />
        </el-form-item>
        <el-form-item label="性别" prop="sex">
          <el-radio-group v-model="formValidate.sex">
            <el-radio-button :value="1">男</el-radio-button>
            <el-radio-button :value="0">女</el-radio-button>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="修改密码" prop="password">
          <el-input v-model="formValidate.newPassword" type="password" show-password style="width: 220px" />
        </el-form-item>
        <el-form-item label="生日" prop="birthday">
          <el-date-picker
            v-model="formValidate.birthday"
            type="date"
            value-format="YYYY-MM-DD"
            style="width: 220px"
          />
        </el-form-item>
        <el-form-item label="所在地" prop="mail">
          {{ formValidate.region || "暂无地址" }}
          <el-button style="margin-left: 10px" @click="$refs.map.open()">选择</el-button>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="descFlag = false">取消</el-button>
        <el-button type="primary" @click="handleSubmitModal">确定</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="picModelFlag" width="1200px">
      <ossManage
        ref="ossManage"
        @callback="callbackSelected"
        :isComponent="true"
        :initialize="picModelFlag"
      />
    </el-dialog>
    <multipleMap ref="map" @callback="selectedRegion" />
  </div>
</template>

<script>
import * as API_Member from "@/api/member.js";
import ossManage from "@/views/sys/oss-manage/ossManage";
import multipleMap from "@/components/map/multiple-map";
import { ElMessage, ElMessageBox } from "element-plus";
import { customRouterPush } from "@/utils/filters";

export default {
  name: "memberRecycle",
  components: {
    ossManage,
    multipleMap,
  },
  data() {
    return {
      selectedMember: false,
      descTitle: "",
      descFlag: false,
      openSearch: true,
      loading: true,
      searchForm: {
        pageNumber: 1,
        pageSize: 20,
        order: "desc",
        username: "",
        mobile: "",
        disabled: "CLOSE",
      },
      picModelFlag: false,
      formValidate: {},
      ruleValidate: {},
      data: [],
      total: 0,
    };
  },
  methods: {
    callback(val) {
      this.$emit("callback", val);
    },
    init() {
      this.getData();
    },
    changePage() {
      this.getData();
    },
    changePageSize() {
      this.searchForm.pageNumber = 1;
      this.getData();
    },
    handleSearch() {
      this.searchForm.pageNumber = 1;
      this.searchForm.pageSize = 20;
      this.getData();
    },
    editPerm(val) {
      this.descTitle = `查看用户 ${val.username}`;
      this.descFlag = true;
      this.getMemberInfo(val.id);
    },
    getMemberInfo(id) {
      API_Member.getMemberInfoData(id).then((res) => {
        if (res.result) {
          this.formValidate = res.result;
        }
      });
    },
    getData() {
      this.loading = true;
      API_Member.getMemberListData(this.searchForm).then((res) => {
        this.loading = false;
        if (res.success) {
          this.data = res.result.records;
          this.total = res.result.total;
        }
      });
    },
    openPicSelector() {
      this.picModelFlag = true;
      this.$nextTick(() => {
        if (this.$refs.ossManage) {
          this.$refs.ossManage.selectImage = true;
        }
      });
    },
    callbackSelected(val) {
      this.picModelFlag = false;
      this.formValidate.face = val.url;
    },
    selectedRegion(val) {
      if (val.type === "select") {
        const paths = val.data.map((item) => item.name).join(",");
        const ids = val.data.map((item) => item.id).join(",");
        this.formValidate.region = paths;
        this.formValidate.regionId = ids;
      } else {
        this.formValidate.region = val.data.addr;
        this.formValidate.regionId = val.data.addrId;
      }
    },
    detail(row) {
      customRouterPush({ name: "member-detail", query: { id: row.id } });
    },
    enable(v) {
      let params = {
        memberIds: [v.id],
        disabled: true,
      };
      ElMessageBox.confirm("确定启用此会员？", "提示", { type: "warning" }).then(() => {
        API_Member.updateMemberStatus(params).then((res) => {
          if (res.success) {
            ElMessage.success("启用成功");
            this.getData();
          }
        });
      }).catch(() => {});
    },
    handleSubmitModal() {
      const { nickName, sex, username, face, newPassword, id, regionId, region } = this.formValidate;
      let time = new Date(this.formValidate.birthday);
      let birthday = time.getFullYear() + "-" + (time.getMonth() + 1) + "-" + time.getDate();
      let submit = {
        regionId: regionId,
        region: region,
        nickName,
        sex,
        birthday,
        face: face || "",
        id,
      };
      if (newPassword) {
        submit.password = this.md5(newPassword);
      }
      API_Member.updateMember(submit).then((res) => {
        if (res.result) {
          ElMessage.success("修改成功！");
          this.descFlag = false;
          this.init();
        }
      });
    },
  },
  mounted() {
    this.init();
  },
};
</script>
<style lang="scss" scoped>
.face {
  width: 60px;
  height: 60px;
  border-radius: 50%;
}
.ops a {
  color: #2d8cf0;
  cursor: pointer;
  text-decoration: none;
}
.ops span {
  display: inline-block;
  margin: 0 8px;
  color: #dcdee2;
}
</style>
