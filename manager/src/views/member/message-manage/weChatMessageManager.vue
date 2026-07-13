<template>
  <div>
    <el-dialog v-model="wechatModal" title="微信设置" width="530px">
      <el-form ref="wechatFormData" :model="wechatFormData" label-width="100px">
        <el-form-item v-if="tab === 'WECHAT'" label="模板名称">
          <el-input v-model="wechatFormData.name" maxlength="9" disabled />
        </el-form-item>
        <el-form-item v-if="tab === 'WECHAT'" label="头部信息" prop="first">
          <el-input v-model="wechatFormData.first" maxlength="50" />
        </el-form-item>
        <el-form-item v-if="tab === 'WECHAT'" label="备注" prop="remark">
          <el-input v-model="wechatFormData.remark" type="textarea" :rows="5" maxlength="150" />
        </el-form-item>
        <el-form-item label="是否开启" prop="enable">
          <el-switch v-model="wechatFormData.enable" active-text="开启" inactive-text="关闭" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button v-if="tab === 'WECHAT'" type="primary" @click="wechatFormDataEdit">保存</el-button>
        <el-button v-else type="primary" @click="wechatMPFormDataEdit">保存</el-button>
      </template>
    </el-dialog>

    <el-card>
      <el-tabs v-model="tab" @tab-click="tabPaneChange">
        <el-tab-pane label="微信消息" name="WECHAT">
          <div class="search">
            <div class="operation mt_10">
              <el-button type="primary" @click="weChatSync">初始化微信消息</el-button>
            </div>
            <el-table v-loading="loading" border :data="weChatData" ref="weChatTable" style="width: 100%">
              <el-table-column prop="code" label="模板编号" width="500" sortable />
              <el-table-column label="是否开启" width="150" sortable>
                <template #default="{ row }">
                  <span v-if="row">{{ row.enable ? "开启" : "关闭" }}</span>
                </template>
              </el-table-column>
              <el-table-column prop="name" label="模板名称" width="200" sortable />
              <el-table-column prop="createTime" label="创建时间" sortable />
              <el-table-column label="操作" width="200" align="center" fixed="right">
                <template #default="{ row }">
                  <template v-if="row">
                    <a class="link-text" @click="wechatSettingAlert(row)">编辑</a>
                    <span class="op-split">|</span>
                    <a class="link-text" @click="delWeChat(row)">删除</a>
                  </template>
                </template>
              </el-table-column>
            </el-table>
            <div class="mt_10" style="display: flex; justify-content: flex-end">
              <el-pagination
                v-model:current-page="weChatSearchForm.pageNumber"
                v-model:page-size="weChatSearchForm.pageSize"
                :page-sizes="[20, 50, 100]"
                :total="weChatTotal"
                layout="total, sizes, prev, pager, next"
                size="small"
                @current-change="changePage"
                @size-change="changePageSize"
              />
            </div>
          </div>
        </el-tab-pane>

        <el-tab-pane label="微信小程序订阅消息" name="WECHATMP">
          <div class="search">
            <div class="operation mt_10">
              <el-button type="primary" @click="weChatSync('mp')">初始化微信小程序订阅消息</el-button>
            </div>
            <el-table v-loading="loading" border :data="weChatMPData" ref="weChatMPTable" style="width: 100%">
              <el-table-column prop="code" label="模板编号" width="500" sortable />
              <el-table-column label="是否开启" width="150" sortable>
                <template #default="{ row }">
                  <span v-if="row">{{ row.enable ? "开启" : "关闭" }}</span>
                </template>
              </el-table-column>
              <el-table-column prop="name" label="模板名称" width="200" sortable />
              <el-table-column prop="createTime" label="创建时间" sortable />
              <el-table-column label="操作" width="200" align="center" fixed="right">
                <template #default="{ row }">
                  <template v-if="row">
                    <a class="link-text" @click="wechatSettingAlert(row)">编辑</a>
                    <span class="op-split">|</span>
                    <a class="link-text" @click="delWeChat(row)">删除</a>
                  </template>
                </template>
              </el-table-column>
            </el-table>
            <div class="mt_10" style="display: flex; justify-content: flex-end">
              <el-pagination
                v-model:current-page="weChatMPSearchForm.pageNumber"
                v-model:page-size="weChatMPSearchForm.pageSize"
                :page-sizes="[20, 50, 100]"
                :total="weChatMPTotal"
                layout="total, sizes, prev, pager, next"
                size="small"
                @current-change="changePage"
                @size-change="changePageSize"
              />
            </div>
          </div>
        </el-tab-pane>
      </el-tabs>
    </el-card>
  </div>
</template>

<script>
import {
  wechatMessageSync,
  getWechatMessagePage,
  editWechatMessageTemplate,
  delWechatMessageTemplate,
  wechatMPMessageSync,
  getWechatMPMessagePage,
  editWechatMPMessageTemplate,
  delWechatMPMessageTemplate,
} from "@/api/setting";
import { ElMessage, ElMessageBox } from "element-plus";

export default {
  title: "wechat-message-manage",
  data() {
    return {
      wechatModal: false,
      wechatFormData: {},
      wechatMPFormData: {},
      tab: "WECHAT",
      searchForm: { type: "WECHAT" },
      loading: true,
      id: "",
      weChatSearchForm: { pageNumber: 1, pageSize: 20 },
      weChatMPSearchForm: { pageNumber: 1, pageSize: 20 },
      weChatData: [],
      weChatMPData: [],
      weChatTotal: 0,
      weChatMPTotal: 0,
    };
  },
  methods: {
    init() {
      this.getDataList();
    },
    changePage(v) {
      this.searchForm.type = this.tab;
      if (this.tab === "WECHAT") {
        this.weChatSearchForm.pageNumber = v;
        this.getWechatMessagePage();
      } else {
        this.weChatMPSearchForm.pageNumber = v;
        this.getWechatMPMessagePage();
      }
    },
    changePageSize(v) {
      this.searchForm.type = this.tab;
      if (this.tab === "WECHAT") {
        this.weChatSearchForm.pageSize = v;
        this.getWechatMessagePage();
      } else {
        this.weChatMPSearchForm.pageSize = v;
        this.getWechatMPMessagePage();
      }
    },
    wechatSettingAlert(v) {
      this.wechatFormData = v;
      this.id = v.id;
      this.wechatModal = true;
    },
    weChatSync(mp) {
      ElMessageBox.confirm("确认要初始化微信小程序消息订阅?", "提示", { type: "warning" }).then(() => {
        if (mp === "mp") {
          wechatMPMessageSync().then((res) => {
            if (res.success) {
              ElMessage.success("微信小程序消息订阅初始化");
              this.getWechatMPMessagePage();
            }
          });
        } else {
          wechatMessageSync().then((res) => {
            if (res.success) {
              ElMessage.success("微信消息模板初始化成功");
              this.getWechatMessagePage();
            }
          });
        }
      }).catch(() => {});
    },
    wechatFormDataEdit() {
      this.$refs.wechatFormData.validate((valid) => {
        if (valid) {
          if (!this.wechatFormData.updateTime) {
            this.wechatFormData.updateTime = "";
          }
          editWechatMessageTemplate(this.id, this.wechatFormData).then((res) => {
            if (res.message === "success") {
              ElMessage.success("微信模板修改成功");
              this.wechatModal = false;
              this.getWechatMessagePage();
            }
          });
        }
      });
    },
    wechatMPFormDataEdit() {
      this.$refs.wechatFormData.validate((valid) => {
        if (valid) {
          editWechatMPMessageTemplate(this.id, this.wechatMPFormData).then((res) => {
            if (res.message === "success") {
              ElMessage.success("微信消息订阅模板修改成功");
              this.wechatModal = false;
              this.getWechatMPMessagePage();
            }
          });
        }
      });
    },
    delWeChat(v) {
      ElMessageBox.confirm("确定删除此模板?", "提示", { type: "warning" }).then(() => {
        if (this.tab === "WECHAT") {
          delWechatMessageTemplate(v.id).then((res) => {
            if (res.success) {
              ElMessage.success("微信模板删除成功");
              this.getWechatMessagePage();
            }
          });
        } else {
          delWechatMPMessageTemplate(v.id).then((res) => {
            if (res.success) {
              ElMessage.success("微信消息订阅删除成功");
              this.getWechatMPMessagePage();
            }
          });
        }
      }).catch(() => {});
    },
    getDataList() {
      this.getWechatMessagePage();
    },
    getWechatMessagePage() {
      this.loading = true;
      getWechatMessagePage(this.weChatSearchForm).then((res) => {
        this.loading = false;
        if (res.success) {
          this.weChatData = res.result.records;
          this.weChatTotal = res.result.total;
        }
      });
    },
    getWechatMPMessagePage() {
      this.loading = true;
      getWechatMPMessagePage(this.weChatMPSearchForm).then((res) => {
        this.loading = false;
        if (res.success) {
          this.weChatMPData = res.result.records;
          this.weChatMPTotal = res.result.total;
        }
      });
    },
    tabPaneChange(tab) {
      const v = tab.paneName || this.tab;
      this.searchForm.type = v;
      if (v === "WECHAT") {
        this.getWechatMessagePage();
      } else if (v === "WECHATMP") {
        this.getWechatMPMessagePage();
      }
    },
  },
  mounted() {
    this.init();
  },
};
</script>
<style scoped>
.link-text {
  color: #2d8cf0;
  cursor: pointer;
  text-decoration: none;
}
.op-split {
  display: inline-block;
  margin: 0 8px;
  color: #dcdee2;
}
</style>
