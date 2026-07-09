<template>
  <div class="search">
    <el-card>
      <el-table
        ref="table"
        v-loading="loading"
        border
        :data="data"
        style="width: 100%"
      >
        <el-table-column prop="userName" label="会员名称" min-width="120" show-overflow-tooltip />
        <el-table-column prop="mobile" label="手机号码" min-width="120" show-overflow-tooltip />
        <el-table-column prop="context" label="反馈内容" min-width="380" show-overflow-tooltip />
        <el-table-column label="类型" min-width="120">
          <template #default="{ row }">
            <span v-if="row">
              <span v-if="row.type == 'FUNCTION'">功能建议</span>
              <span v-else-if="row.type == 'OPTIMIZE'">优化反馈</span>
              <span v-else-if="row.type == 'OTHER'">其他意见</span>
              <span v-else>未知意见</span>
            </span>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="创建时间" width="170" sortable />
        <el-table-column label="操作" width="130" align="center">
          <template #default="{ row }">
            <div v-if="row" class="ops">
              <a class="link-text" @click="detail(row)">查看</a>
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

    <el-dialog v-model="detailVisible" title="详细信息" width="500px" destroy-on-close>
      <el-form ref="formValidate" :model="form" label-width="80px">
        <el-form-item label="用户名" prop="userName">
          <span>{{ form.userName }}</span>
        </el-form-item>
        <el-form-item label="手机号码" prop="mobile">
          <span>{{ form.mobile }}</span>
        </el-form-item>
        <el-form-item label="类型" prop="type">
          <span v-if="form.type == 'FUNCTION'">功能建议</span>
          <span v-if="form.type == 'OPTIMIZE'">优化反馈</span>
          <span v-if="form.type == 'OTHER'">其他意见</span>
        </el-form-item>
        <el-form-item label="反馈内容" prop="context">
          <el-input
            v-model="form.context"
            type="textarea"
            disabled
            :autosize="{ minRows: 3, maxRows: 5 }"
            style="width: 85%"
          />
        </el-form-item>
        <el-form-item label="相关材料" prop="images">
          <div v-if="form.images == null">暂无</div>
          <div v-else>
            <el-avatar
              v-for="(item, index) in form.images.split(',')"
              :key="index"
              shape="square"
              :size="80"
              :src="item"
              style="margin-right: 5px"
            />
          </div>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="detailVisible = false">取消</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script>
import { getMemberFeedback, getMemberFeedbackDetail } from "@/api/other";

export default {
  name: "feedback",
  data() {
    return {
      loading: true,
      form: {},
      searchForm: {
        pageNumber: 1,
        pageSize: 20,
        sort: "createTime",
        order: "desc",
      },
      detailVisible: false,
      data: [],
      total: 0,
    };
  },
  methods: {
    init() {
      this.getFeedback();
    },
    changePage() {
      this.getFeedback();
    },
    changePageSize() {
      this.searchForm.pageNumber = 1;
      this.getFeedback();
    },
    getFeedback() {
      this.loading = true;
      getMemberFeedback(this.searchForm).then((res) => {
        this.loading = false;
        if (res.success) {
          this.data = res.result.records;
          this.total = res.result.total;
        }
      });
    },
    detail(v) {
      getMemberFeedbackDetail(v.id).then((res) => {
        this.loading = false;
        if (res.success) {
          this.form = res.result;
          this.detailVisible = true;
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
