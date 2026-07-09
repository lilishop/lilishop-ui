<template>
  <div class="point">
    <UserCenterLayout title="我的积分" :tabs="['我的积分']">
    <div class="point-content">
      <span>剩余积分：<span>{{ pointObj.point || 0 }}</span></span>
      <span>累计获得：<span>{{ pointObj.totalPoint || 0 }}</span></span>
    </div>
    <h3>积分日志</h3>
    <el-table :data="logData.records || []">
      <el-table-column prop="content" label="日志内容" align="center" />
      <el-table-column prop="createTime" label="时间" align="center" />
      <el-table-column label="积分明细" align="center">
        <template #default="{ row }">
          <div :style="{ color: row.pointType === 'INCREASE' ? 'green' : 'red' }">
            <span v-if="row.pointType === 'INCREASE'">+</span>{{ row.variablePoint }}
          </div>
        </template>
      </el-table-column>
    </el-table>
    <!-- 分页 -->
    <div class="point-pagination">
      <el-pagination
        v-model:current-page="params.pageNumber"
        v-model:page-size="params.pageSize"
        :total="logData.total"
        @current-change="changePage"
        @size-change="changePageSize"
        :page-sizes="[10, 20, 50]"
        layout="total, prev, pager, next, jumper"
      />
    </div>
    </UserCenterLayout>
  </div>
</template>
<script>
import {memberPoint, memberPointHistory} from '@/api/member.js'

export default {
  name: 'Point',
  data () {
    return {
      logData: {}, // 积分日志
      pointObj: {}, // 积分明细
      loading: false, // 请求接口加载框
      params: { // 积分列表请求参数
        pageNumber: 1,
        pageSize: 10
      },
    }
  },
  mounted () {
    this.getHistory()
    this.getPoint()
  },
  methods: {
    getHistory () { // 获取积分历史
      memberPointHistory(this.params).then(res => {
        this.logData = res.result;
      })
    },
    getPoint () { // 获取积分详情
      memberPoint().then(res => {
        if (res.success) this.pointObj = res.result
      })
    },
    changePage (val) { // 修改页码
      this.params.pageNumber = val
      this.getHistory()
    },
    changePageSize (val) { // 修改页数
      this.params.pageSize = val
      this.params.pageNumber = 1
      this.getHistory()
    }
  }
}
</script>
<style lang="scss" scoped>
h3 {
  font-size: 16px;
  margin: 20px 10px;
}

.point-content {
  text-align: center;
  margin-bottom: 30px;

  > span {
    color: #999;
    margin-right: 100px;

    span {
      color: $theme_color;
      font-size: 24px;
    }
  }
}

.point-pagination {
  display: flex;
  justify-content: flex-end;
  margin-top: 10px;
}
</style>
