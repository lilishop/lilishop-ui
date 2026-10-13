<template>
  <div class="point">
    <UserCenterLayout>
    <div class="point-summary">
      <div class="point-stat">
        <div class="label">剩余积分</div>
        <div class="value">{{ pointObj.point || 0 }}</div>
      </div>
      <div class="point-stat">
        <div class="label">累计获得</div>
        <div class="value">{{ pointObj.totalPoint || 0 }}</div>
      </div>
    </div>
    <h3>积分日志</h3>
    <empty v-if="!(logData.records || []).length" />
    <div v-else class="log-list">
      <div class="log-head">
        <span>日志内容</span>
        <span>时间</span>
        <span>积分明细</span>
      </div>
      <div class="log-row" v-for="(row, index) in logData.records" :key="row.id || index">
        <div class="log-content">{{ row.content }}</div>
        <div class="log-time">{{ row.createTime }}</div>
        <div class="log-point" :class="row.pointType === 'INCREASE' ? 'is-plus' : 'is-minus'">
          <span v-if="row.pointType === 'INCREASE'">+</span>{{ row.variablePoint }}
        </div>
      </div>
    </div>
    <!-- 分页 -->
    <div class="point-pagination">
      <el-pagination
        v-model:current-page="params.pageNumber"
        v-model:page-size="params.pageSize"
        :total="logData.total"
        @current-change="changePage"
        @size-change="changePageSize"
        :page-sizes="[20, 50, 100]"
        layout="total, sizes, prev, pager, next, jumper"
      />
    </div>
    </UserCenterLayout>
  </div>
</template>
<script setup>
import { onMounted, reactive, ref } from "vue";
import { memberPoint, memberPointHistory } from '@/api/member.js'

defineOptions({ name: "Point" });

const logData = ref({}); // 积分日志
const pointObj = ref({}); // 积分明细
const loading = ref(false); // 请求接口加载框
const params = reactive({ // 积分列表请求参数
  pageNumber: 1,
  pageSize: 20
});

function getHistory() { // 获取积分历史
  memberPointHistory(params).then(res => {
    logData.value = res.result;
  })
}

function getPoint() { // 获取积分详情
  memberPoint().then(res => {
    if (res.success) pointObj.value = res.result
  })
}

function changePage(val) { // 修改页码
  params.pageNumber = val
  getHistory()
}

function changePageSize(val) { // 修改页数
  params.pageSize = val
  params.pageNumber = 1
  getHistory()
}

onMounted(() => {
  getHistory()
  getPoint()
});
</script>
<style lang="scss" scoped>
h3 {
  margin: 8px 0 12px;
  font-size: 15px;
  font-weight: 600;
  color: #333;
  line-height: 1.4;
}

.point-summary {
  display: flex;
  gap: 16px;
  margin-bottom: 20px;
}

.point-stat {
  flex: 1;
  padding: 16px 20px;
  background: #fafafa;
  border-radius: 8px;

  .label {
    color: #666;
    font-size: 14px;
    line-height: 22px;
  }

  .value {
    margin-top: 4px;
    color: $theme_color;
    font-size: 28px;
    font-weight: 600;
    line-height: 1.2;
  }
}

.log-list {
  --log-cols: minmax(0, 1.6fr) 180px 100px;
}

.log-head,
.log-row {
  display: grid;
  grid-template-columns: var(--log-cols);
  column-gap: 16px;
  align-items: start;
}

.log-head {
  padding: 0 8px 10px;
  color: #999;
  font-size: 13px;

  span:nth-child(n + 2) {
    text-align: center;
  }
}

.log-row {
  padding: 14px 8px;
  border-top: 1px solid #f0f0f0;
  font-size: 14px;
  line-height: 22px;
}

.log-content {
  min-width: 0;
  color: #171A26;
  white-space: pre-wrap;
  word-break: break-all;
}

.log-time {
  text-align: center;
  color: #171A26;
}

.log-point {
  text-align: center;
  font-weight: 600;

  &.is-plus {
    color: #19be6b;
  }

  &.is-minus {
    color: $theme_color;
  }
}

.point-pagination {
  display: flex;
  justify-content: flex-end;
  margin-top: 16px;

  :deep(.el-pagination) {
    justify-content: flex-end;
  }
}
</style>
