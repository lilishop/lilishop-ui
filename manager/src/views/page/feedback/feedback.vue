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

<script setup>
import { ref, reactive, onMounted } from "vue";
import { getMemberFeedback, getMemberFeedbackDetail } from "@/api/other";

defineOptions({ name: "feedback" });

// 模板 el-table / el-form 的模板 ref（对应原 $refs.table / $refs.formValidate）
const table = ref(null);
const formValidate = ref(null);

const loading = ref(true);
const form = ref({});
const searchForm = reactive({
  pageNumber: 1,
  pageSize: 20,
  sort: "createTime",
  order: "desc",
});
const detailVisible = ref(false);
const data = ref([]);
const total = ref(0);

function init() {
  getFeedback();
}
function changePage() {
  getFeedback();
}
function changePageSize() {
  searchForm.pageNumber = 1;
  getFeedback();
}
function getFeedback() {
  loading.value = true;
  getMemberFeedback(searchForm).then((res) => {
    loading.value = false;
    if (res.success) {
      data.value = res.result.records;
      total.value = res.result.total;
    }
  });
}
function detail(v) {
  getMemberFeedbackDetail(v.id).then((res) => {
    loading.value = false;
    if (res.success) {
      form.value = res.result;
      detailVisible.value = true;
    }
  });
}

onMounted(() => {
  init();
});
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
