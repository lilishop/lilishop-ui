<template>
  <div class="memberGrade">
    <UserCenterLayout>
    <div class="grade-card">
      <img v-if="currentGrade.gradeImage" class="grade-icon" :src="currentGrade.gradeImage" alt="" />
      <div class="grade-info">
        <div class="grade-name-row">
          <span class="grade-name">{{ currentGrade.gradeName || '暂无等级' }}</span>
          <span v-for="b in currentGradeBenefits" :key="b.id" class="benefit-tag">{{ b.benefitName || '-' }}</span>
        </div>
        <div class="grade-exp">当前经验值：<span class="num">{{ currentExperience || 0 }}</span></div>
        <div class="grade-next" v-if="nextGrade">
          距 {{ nextGrade.gradeName }} 还差 <span class="num">{{ diffExperience }}</span> 经验值
        </div>
        <div class="grade-next" v-else>已达最高等级</div>
      </div>
    </div>

    <div class="grade-tabs">
      <div class="grade-tab" :class="{ active: activeGradeTab === 'rules' }" @click="activeGradeTab = 'rules'">获取经验值方式</div>
      <div class="grade-tab" :class="{ active: activeGradeTab === 'logs' }" @click="activeGradeTab = 'logs'">经验值记录</div>
    </div>

    <div v-show="activeGradeTab === 'rules'" v-loading="rulesLoading">
      <empty v-if="!rulesLoading && !ruleList.length" />
      <div v-else class="rule-list">
        <div class="rule-item" v-for="row in ruleList" :key="row.ruleKey || row.id">
          <div class="rule-top">
            <div class="rule-name">{{ row.ruleName || row.ruleKey || '-' }}</div>
            <span class="rule-status" :class="{ done: row.completed === true }">{{ row.completed === true ? '已完成' : '未完成' }}</span>
          </div>
          <div class="rule-desc">{{ getRuleDesc(row.ruleKey) }}</div>
          <div class="rule-meta">
            <span>单次获得 <b>+{{ row.value == null ? 0 : row.value }}</b></span>
            <span v-if="row.maxValue != null && Number(row.maxValue) > 0">限额 <b>{{ row.maxValue }}</b></span>
            <span>已获得 <b>{{ row.gainedExperience == null ? 0 : row.gainedExperience }}</b></span>
          </div>
        </div>
      </div>
      <div class="rules-desc" v-if="rulesDescription">{{ rulesDescription }}</div>
    </div>

    <div v-show="activeGradeTab === 'logs'" v-loading="logLoading">
      <empty v-if="!(experienceLogs.records || []).length" />
      <div v-else class="log-list">
        <div class="log-head">
          <span>时间</span>
          <span>规则</span>
          <span>变动值</span>
        </div>
        <div class="log-row" v-for="(row, index) in experienceLogs.records" :key="row.id || index">
          <div class="log-time">{{ row.createTime }}</div>
          <div class="log-rule">{{ getRuleName(row.ruleKey) }}</div>
          <div class="log-point" :class="getLogDeltaSign(row) === '+' ? 'is-plus' : 'is-minus'">
            {{ getLogDeltaSign(row) }}{{ getLogDeltaAbsValue(row) }}
          </div>
        </div>
      </div>
      <div class="grade-pagination">
        <el-pagination
          v-model:current-page="params.pageNumber"
          v-model:page-size="params.pageSize"
          :total="experienceLogs.total || 0"
          @current-change="changePage"
          @size-change="changePageSize"
          :page-sizes="[20, 50, 100]"
          layout="total, sizes, prev, pager, next, jumper"
        />
      </div>
    </div>
    </UserCenterLayout>

  </div>

</template>

<script>
import { memberGradeCurrent, memberGradeList, memberGradeRules } from '@/api/member.js'

export default {
  name: 'MemberGrade',
  data () {
    return {
      ruleList: [],
      rulesLoading: false,
      rulesDescription: '',
      /** 接口返回 List MemberGradeDetailVO，每项 { grade, benefits } */
      gradeDetails: [],
      gradeList: [],
      currentGrade: {},
      currentExperience: 0,
      currentGradeId: '',
      selectedRuleKey: '',
      activeGradeTab: 'rules',
      logLoading: false,
      gradeLoading: false,
      params: {
        pageNumber: 1,
        pageSize: 20
      },
      experienceLogs: {}
    }
  },
  computed: {
    rulesMap () {
      const map = {}
      this.ruleList.forEach(item => {
        map[item.ruleKey] = item.ruleName
      })
      return map
    },
    sortedGradeList () {
      const list = Array.isArray(this.gradeList) ? this.gradeList.slice() : []
      list.sort((a, b) => {
        const sa = a && a.gradeSort != null ? Number(a.gradeSort) : 0
        const sb = b && b.gradeSort != null ? Number(b.gradeSort) : 0
        if (sa !== sb) return sa - sb
        const ea = a && a.requiredExperience != null ? Number(a.requiredExperience) : 0
        const eb = b && b.requiredExperience != null ? Number(b.requiredExperience) : 0
        return ea - eb
      })
      return list
    },
    currentGradeIndex () {
      if (!this.currentGradeId) return -1
      return this.sortedGradeList.findIndex(g => g && g.id === this.currentGradeId)
    },
    nextGrade () {
      const idx = this.currentGradeIndex
      if (idx < 0) return null
      return this.sortedGradeList[idx + 1] || null
    },
    diffExperience () {
      if (!this.nextGrade || this.nextGrade.requiredExperience == null) return 0
      const diff = Number(this.nextGrade.requiredExperience) - Number(this.currentExperience || 0)
      return diff > 0 ? diff : 0
    },
    /** 当前等级在列表详情中对应的启用权益（顺序与后台 benefits 一致） */
    currentGradeBenefits () {
      const id = this.currentGradeId
      if (!id || !Array.isArray(this.gradeDetails) || !this.gradeDetails.length) return []
      const detail = this.gradeDetails.find(
        (d) => d && d.grade && String(d.grade.id) === String(id)
      )
      const list = detail && Array.isArray(detail.benefits) ? detail.benefits : []
      return list.filter((b) => b && b.benefitState === 'OPEN')
    },
  },
  mounted () {
    this.init()
  },
  methods: {
    init () {
      this.loadRules()
      this.loadGradeList()
      this.loadCurrent()
    },
    loadRules () {
      this.rulesLoading = true
      memberGradeRules()
        .then(res => {
          if (res && res.success) {
            const items = res.result && Array.isArray(res.result.items) ? res.result.items : []
            this.rulesDescription = (res.result && res.result.description) || ''
            this.ruleList = items
          }
        })
        .finally(() => {
          this.rulesLoading = false
        })
    },
    loadGradeList () {
      this.gradeLoading = true
      memberGradeList()
        .then(res => {
          if (res && res.success) {
            const raw = Array.isArray(res.result) ? res.result : []
            this.gradeDetails = raw
              .map((item) => {
                if (!item) return null
                if (item.grade != null) {
                  return {
                    grade: item.grade,
                    benefits: Array.isArray(item.benefits) ? item.benefits : []
                  }
                }
                return { grade: item, benefits: [] }
              })
              .filter(Boolean)
            this.gradeList = this.gradeDetails.map((d) => d.grade).filter(Boolean)
          } else {
            this.gradeDetails = []
            this.gradeList = []
          }
        })
        .finally(() => {
          this.gradeLoading = false
        })
    },
    loadCurrent () {
      this.logLoading = true
      const params = {
        pageNumber: this.params.pageNumber,
        pageSize: this.params.pageSize
      }
      if (this.selectedRuleKey) params.ruleKey = this.selectedRuleKey
      memberGradeCurrent(params)
        .then(res => {
          if (res && res.success && res.result) {
            this.currentGrade = res.result.grade || {}
            this.currentExperience = res.result.experience || 0
            this.currentGradeId = res.result.gradeId || (this.currentGrade && this.currentGrade.id) || ''
            this.experienceLogs = res.result.experienceLogs || {}
          }
        })
        .finally(() => {
          this.logLoading = false
        })
    },
    selectRule (ruleKey) {
      this.selectedRuleKey = ruleKey || ''
      this.params.pageNumber = 1
      this.loadCurrent()
    },
    changePage (val) {
      this.params.pageNumber = val
      this.loadCurrent()
    },
    changePageSize (val) {
      this.params.pageSize = val
      this.params.pageNumber = 1
      this.loadCurrent()
    },
    getRuleName (ruleKey) {
      if (!ruleKey) return '-'
      return this.rulesMap[ruleKey] || ruleKey
    },
    getRuleDesc (ruleKey) {
      const map = {
        CONSUME: '客户消费1元可获取经验值，向下取整',
        REGISTER: '会员注册成功后可获取经验值',
        SIGN_IN: '客户每日签到后可获取的经验值',
        COMMENT: '对已购买商品完成发表评价获取经验值；仅针对评论字数大于30字的评论进行发放',
        SHARE: '会员分享商城页面可获取的经验值',
        PROFILE: '完善个人基本信息可获得经验值，每个会员仅可获得一次',
        FOLLOW_STORE: '关注店铺可获得经验值，每个客户ID同店铺仅第一次关注可进行获得',
        BIND_WECHAT: '绑定微信成功后获得经验值，每个会员仅可获得一次',
        ADD_ADDRESS: '添加收货地址可获得经验值，每个会员仅可获得一次',
        SHARE_REGISTER: '仅被注册成功后可获得相应奖励经验值',
        SHARE_BUY: '仅被购买成功后可获得相应奖励经验值'
      }
      if (!ruleKey) return '-'
      return map[ruleKey] || '-'
    },
    getLogDeltaRaw (row) {
      if (!row) return 0
      const candidate = row.variableExperience != null ? row.variableExperience : (row.changeExperience != null ? row.changeExperience : (row.experience != null ? row.experience : row.value))
      if (candidate == null) return 0
      const num = Number(candidate)
      if (Number.isNaN(num)) return 0
      if (row.type === 'DECREASE') return -Math.abs(num)
      if (row.type === 'INCREASE') return Math.abs(num)
      return num
    },
    getLogDeltaSign (row) {
      const num = this.getLogDeltaRaw(row)
      return num >= 0 ? '+' : '-'
    },
    getLogDeltaAbsValue (row) {
      const num = this.getLogDeltaRaw(row)
      return Math.abs(num)
    },
    getLogDeltaColor (row) {
      return this.getLogDeltaRaw(row) >= 0 ? 'green' : 'red'
    }
  }
}
</script>

<style scoped lang="scss">
.grade-card {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 8px;
  padding: 16px;
  background: #fafafa;
  border-radius: 8px;
}

.grade-icon {
  width: 56px;
  height: 56px;
  object-fit: contain;
  flex-shrink: 0;
}

.grade-name-row {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
}

.grade-name {
  color: #171A26;
  font-size: 18px;
  font-weight: 600;
  line-height: 1.4;
}

.benefit-tag {
  padding: 0 8px;
  border-radius: 4px;
  background: #fff;
  color: $theme_color;
  font-size: 14px;
  line-height: 22px;
}

.grade-exp,
.grade-next {
  margin-top: 6px;
  color: #666;
  font-size: 14px;
  line-height: 22px;
}

.num {
  color: $theme_color;
  font-size: 16px;
  font-weight: 600;
}

.grade-tabs {
  display: flex;
  gap: 24px;
  margin: 16px 0;
  border-bottom: 1px solid #f0f0f0;
}

.grade-tab {
  position: relative;
  padding: 10px 0;
  color: #666;
  font-size: 14px;
  line-height: 22px;
  cursor: pointer;

  &.active {
    color: $theme_color;
    font-weight: 600;

    &::after {
      content: '';
      position: absolute;
      left: 0;
      right: 0;
      bottom: 0;
      height: 2px;
      background: $theme_color;
    }
  }
}

.rule-item {
  padding: 14px 0;
  border-top: 1px solid #f0f0f0;

  &:first-child {
    border-top: none;
  }
}

.rule-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.rule-name {
  color: #171A26;
  font-size: 16px;
  line-height: 22px;
}

.rule-status {
  flex-shrink: 0;
  padding: 0 8px;
  border-radius: 4px;
  background: #f5f5f5;
  color: #999;
  font-size: 14px;
  line-height: 22px;

  &.done {
    background: #f6ffed;
    color: #19be6b;
  }
}

.rule-desc {
  margin-top: 6px;
  color: #666;
  font-size: 14px;
  line-height: 22px;
}

.rule-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  margin-top: 8px;
  color: #666;
  font-size: 14px;
  line-height: 22px;

  b {
    color: $theme_color;
    font-weight: 600;
  }
}

.rules-desc {
  margin-top: 16px;
  padding: 12px 16px;
  border-radius: 8px;
  background: #fafafa;
  color: #666;
  font-size: 14px;
  line-height: 22px;
  white-space: pre-wrap;
  word-break: break-all;
}

.log-list {
  --log-cols: 180px minmax(0, 1fr) 100px;
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

.log-time,
.log-rule {
  color: #171A26;
}

.log-rule,
.log-point {
  text-align: center;
}

.log-point {
  font-weight: 600;

  &.is-plus {
    color: #19be6b;
  }

  &.is-minus {
    color: $theme_color;
  }
}

.grade-pagination {
  display: flex;
  justify-content: flex-end;
  margin-top: 16px;

  :deep(.el-pagination) {
    justify-content: flex-end;
  }
}
</style>
