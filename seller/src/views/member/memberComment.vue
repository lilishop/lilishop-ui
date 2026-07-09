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
        <el-form-item label="会员名称" prop="memberName">
          <el-input v-model="searchForm.memberName" clearable placeholder="请输入会员名称" style="width: 240px" />
        </el-form-item>
        <el-form-item label="商品名称" prop="goodsName">
          <el-input v-model="searchForm.goodsName" clearable placeholder="请输入商品名" style="width: 240px" />
        </el-form-item>
        <el-form-item label="评价" prop="grade">
          <el-select v-model="searchForm.grade" placeholder="请选择" clearable style="width: 240px">
            <el-option label="好评" value="GOOD" />
            <el-option label="中评" value="MODERATE" />
            <el-option label="差评" value="WORSE" />
          </el-select>
        </el-form-item>
        <el-form-item label="评论日期">
          <el-date-picker
            v-model="selectDate"
            type="datetimerange"
            value-format="YYYY-MM-DD HH:mm:ss"
            clearable
            start-placeholder="开始时间"
            end-placeholder="结束时间"
            style="width: 360px"
            @change="selectDateRange"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" class="search-btn" @click="handleSearch">搜索</el-button>
          <el-button class="search-btn" @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-card>
      <el-table v-loading="loading" border :data="data" ref="table" class="mt_10" style="width: 100%">
        <el-table-column prop="memberName" label="会员名称" min-width="150" show-overflow-tooltip />
        <el-table-column prop="goodsName" label="商品名称" min-width="150" show-overflow-tooltip />
        <el-table-column prop="content" label="评价内容" min-width="300" show-overflow-tooltip />
        <el-table-column label="评价" width="100">
          <template #default="{ row }">
            <el-tag v-if="row.grade === 'GOOD'" type="success">好评</el-tag>
            <el-tag v-else-if="row.grade === 'MODERATE'" type="warning">中评</el-tag>
            <el-tag v-else type="danger">差评</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="状态" width="100">
          <template #default="{ row }">
            <el-tag v-if="row.status === 'OPEN'" type="success">展示</el-tag>
            <el-tag v-else type="danger">隐藏</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="回复状态" width="110">
          <template #default="{ row }">
            <el-tag v-if="row.replyStatus" type="success">已回复</el-tag>
            <el-tag v-else type="primary">未回复</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="创建日期" width="170" />
        <el-table-column label="操作" align="center" fixed="right" width="100">
          <template #default="{ row }">
            <a class="link-text" @click="detail(row)">详细</a>
          </template>
        </el-table-column>
      </el-table>

      <div class="mt_10" style="display: flex; justify-content: flex-end">
        <el-pagination
          v-model:current-page="searchForm.pageNumber"
          v-model:page-size="searchForm.pageSize"
          :page-sizes="[10, 20, 50]"
          :total="total"
          layout="total, sizes, prev, pager, next, jumper"
          size="small"
          @current-change="changePage"
          @size-change="changePageSize"
        />
      </div>
    </el-card>

    <el-dialog v-model="modalVisible" :title="modalTitle" width="500px" :close-on-click-modal="false">
      <el-form ref="form" :model="form" label-width="100px" :rules="formValidate">
        <el-form-item label="评价内容">
          <span v-if="!content">暂无评价</span>
          <el-input v-else v-model="content" type="textarea" maxlength="200" disabled :rows="4" style="width: 90%" />
        </el-form-item>
        <el-form-item v-if="detailInfo.haveImage == 1" label="评价图片" style="padding-top: 10px">
          <upload-pic-thumb v-model="image" :disable="true" :remove="false" :isView="true" />
        </el-form-item>
        <el-form-item label="回复内容" prop="reply">
          <el-input
            v-if="!replyStatus"
            v-model="form.reply"
            type="textarea"
            maxlength="200"
            :rows="4"
            clearable
            style="width: 90%"
          />
          <el-input v-else v-model="form.reply" type="textarea" maxlength="200" disabled :rows="4" style="width: 90%" />
        </el-form-item>
        <el-form-item
          v-if="detailInfo.haveReplyImage == 1 || !replyStatus"
          label="回复图片"
          prop="replyImage"
          style="padding-top: 18px"
        >
          <upload-pic-thumb v-if="!replyStatus" v-model="form.replyImage" :limit="5" />
          <upload-pic-thumb v-else v-model="form.replyImage" :disable="true" :remove="false" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="modalVisible = false">取消</el-button>
        <el-button v-if="!replyStatus" type="primary" :loading="submitLoading" @click="handleSubmit">回复</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script>
import * as API_Member from "@/api/member";
import uploadPicThumb from "@/views/my-components/lili/upload-pic-thumb";

export default {
  name: "memberComment",
  components: { uploadPicThumb },
  data() {
    return {
      detailInfo: {},
      image: [],
      replyStatus: false,
      modalVisible: false,
      modalTitle: "",
      loading: true,
      content: "",
      searchForm: {
        pageNumber: 1,
        pageSize: 10,
        sort: "createTime",
        order: "desc",
        startTime: "",
        endTime: "",
      },
      selectDate: null,
      form: {
        replyImage: [],
        reply: "",
      },
      formValidate: {
        reply: [{ required: true, message: "请输入回复内容", trigger: "blur" }],
      },
      submitLoading: false,
      data: [],
      total: 0,
    };
  },
  methods: {
    init() {
      this.getDataList();
    },
    changePage() {
      this.getDataList();
    },
    changePageSize() {
      this.searchForm.pageNumber = 1;
      this.getDataList();
    },
    handleSearch() {
      this.searchForm.pageNumber = 1;
      this.searchForm.pageSize = 10;
      this.getDataList();
    },
    handleReset() {
      this.searchForm = {
        pageNumber: 1,
        pageSize: 10,
        sort: "createTime",
        order: "desc",
        startTime: "",
        endTime: "",
      };
      this.selectDate = null;
      this.getDataList();
    },
    selectDateRange(v) {
      if (v && v.length === 2) {
        this.searchForm.startTime = v[0];
        this.searchForm.endTime = v[1];
      } else {
        this.searchForm.startTime = "";
        this.searchForm.endTime = "";
      }
    },
    getDataList() {
      this.loading = true;
      API_Member.getMemberReview(this.searchForm).then((res) => {
        this.loading = false;
        if (res.success) {
          this.data = res.result.records;
          this.total = res.result.total;
        }
      });
    },
    handleSubmit() {
      this.$refs.form.validate((valid) => {
        if (valid) {
          API_Member.replyMemberReview(this.form.id, this.form).then((res) => {
            this.submitLoading = false;
            if (res.success) {
              this.$Message.success("回复成功");
              this.getDataList();
              this.modalVisible = false;
            }
          });
        }
      });
    },
    detail(v) {
      this.form.replyImage = [];
      this.loading = true;
      API_Member.getMemberInfoReview(v.id).then((res) => {
        this.loading = false;
        if (res.success) {
          this.form.id = res.result.id;
          this.content = res.result.content;
          this.form.reply = res.result.reply;
          this.replyStatus = res.result.replyStatus;
          this.image = res.result.images ? (res.result.images || "").split(",") : [];
          this.form.replyImage = res.result.replyImage ? (res.result.replyImage || "").split(",") : [];
          this.detailInfo = res.result;
          this.modalVisible = true;
          this.modalTitle = "详细";
        }
      });
    },
  },
  mounted() {
    this.init();
  },
};
</script>

<style lang="scss">
@import "@/styles/table-common.scss";
.link-text {
  color: #409eff;
  cursor: pointer;
  text-decoration: none;
}
</style>
