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
        <template v-if="nextGrade">
          <div class="grade-next">
            距 {{ nextGrade.gradeName }} 还差 <span class="num">{{ diffExperience }}</span> 经验值
          </div>
          <el-progress
            class="grade-progress"
            :percentage="progressPercent"
            :stroke-width="8"
            :show-text="false"
            color="#f0c46c"
          />
        </template>
        <div class="grade-next" v-else>已达最高等级</div>
      </div>
    </div>

    <div class="grade-panel">
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
    </div>
    </UserCenterLayout>

  </div>

</template>

<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import { memberGradeCurrent, memberGradeList, memberGradeRules } from '@/api/member.js'

defineOptions({ name: 'MemberGrade' })

const ruleList = ref([])
const rulesLoading = ref(false)
const rulesDescription = ref('')
/** 接口返回 List MemberGradeDetailVO，每项 { grade, benefits } */
const gradeDetails = ref([])
const gradeList = ref([])
const currentGrade = ref({})
const currentExperience = ref(0)
const currentGradeId = ref('')
const selectedRuleKey = ref('')
const activeGradeTab = ref('rules')
const logLoading = ref(false)
const params = reactive({
  pageNumber: 1,
  pageSize: 20
})
const experienceLogs = ref({})

const rulesMap = computed(() => {
  const map = {}
  ruleList.value.forEach(item => {
    map[item.ruleKey] = item.ruleName
  })
  return map
})

const sortedGradeList = computed(() => {
  const list = Array.isArray(gradeList.value) ? gradeList.value.slice() : []
  list.sort((a, b) => {
    const sa = a && a.gradeSort != null ? Number(a.gradeSort) : 0
    const sb = b && b.gradeSort != null ? Number(b.gradeSort) : 0
    if (sa !== sb) return sa - sb
    const ea = a && a.requiredExperience != null ? Number(a.requiredExperience) : 0
    const eb = b && b.requiredExperience != null ? Number(b.requiredExperience) : 0
    return ea - eb
  })
  return list
})

const currentGradeIndex = computed(() => {
  if (!currentGradeId.value) return -1
  return sortedGradeList.value.findIndex(g => g && g.id === currentGradeId.value)
})

const nextGrade = computed(() => {
  const idx = currentGradeIndex.value
  if (idx < 0) return null
  return sortedGradeList.value[idx + 1] || null
})

const diffExperience = computed(() => {
  if (!nextGrade.value || nextGrade.value.requiredExperience == null) return 0
  const diff = Number(nextGrade.value.requiredExperience) - Number(currentExperience.value || 0)
  return diff > 0 ? diff : 0
})

/** 当前经验占下一级所需经验的百分比（无下一级时视为 100%） */
const progressPercent = computed(() => {
  if (!nextGrade.value || !nextGrade.value.requiredExperience) return 100
  const required = Number(nextGrade.value.requiredExperience)
  if (!required || required <= 0) return 100
  const percent = Math.round((Number(currentExperience.value || 0) / required) * 100)
  return Math.min(100, Math.max(0, percent))
})

/** 当前等级在列表详情中对应的启用权益（顺序与后台 benefits 一致） */
const currentGradeBenefits = computed(() => {
  const id = currentGradeId.value
  if (!id || !Array.isArray(gradeDetails.value) || !gradeDetails.value.length) return []
  const detail = gradeDetails.value.find(
    (d) => d && d.grade && String(d.grade.id) === String(id)
  )
  const list = detail && Array.isArray(detail.benefits) ? detail.benefits : []
  return list.filter((b) => b && b.benefitState === 'OPEN')
})

onMounted(() => {
  init()
})

function init () {
  loadRules()
  loadGradeList()
  loadCurrent()
}

function loadRules () {
  rulesLoading.value = true
  memberGradeRules()
    .then(res => {
      if (res && res.success) {
        const items = res.result && Array.isArray(res.result.items) ? res.result.items : []
        rulesDescription.value = (res.result && res.result.description) || ''
        ruleList.value = items
      }
    })
    .finally(() => {
      rulesLoading.value = false
    })
}

function loadGradeList () {
  memberGradeList()
    .then(res => {
      if (res && res.success) {
        const raw = Array.isArray(res.result) ? res.result : []
        gradeDetails.value = raw
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
        gradeList.value = gradeDetails.value.map((d) => d.grade).filter(Boolean)
      } else {
        gradeDetails.value = []
        gradeList.value = []
      }
    })
}

function loadCurrent () {
  logLoading.value = true
  const reqParams = {
    pageNumber: params.pageNumber,
    pageSize: params.pageSize
  }
  if (selectedRuleKey.value) reqParams.ruleKey = selectedRuleKey.value
  memberGradeCurrent(reqParams)
    .then(res => {
      if (res && res.success && res.result) {
        currentGrade.value = res.result.grade || {}
        currentExperience.value = res.result.experience || 0
        currentGradeId.value = res.result.gradeId || (currentGrade.value && currentGrade.value.id) || ''
        experienceLogs.value = res.result.experienceLogs || {}
      }
    })
    .finally(() => {
      logLoading.value = false
    })
}

function changePage (val) {
  params.pageNumber = val
  loadCurrent()
}

function changePageSize (val) {
  params.pageSize = val
  params.pageNumber = 1
  loadCurrent()
}

function getRuleName (ruleKey) {
  if (!ruleKey) return '-'
  return rulesMap.value[ruleKey] || ruleKey
}

function getRuleDesc (ruleKey) {
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
}

function getLogDeltaRaw (row) {
  if (!row) return 0
  const candidate = row.variableExperience != null ? row.variableExperience : (row.changeExperience != null ? row.changeExperience : (row.experience != null ? row.experience : row.value))
  if (candidate == null) return 0
  const num = Number(candidate)
  if (Number.isNaN(num)) return 0
  if (row.type === 'DECREASE') return -Math.abs(num)
  if (row.type === 'INCREASE') return Math.abs(num)
  return num
}

function getLogDeltaSign (row) {
  const num = getLogDeltaRaw(row)
  return num >= 0 ? '+' : '-'
}

function getLogDeltaAbsValue (row) {
  const num = getLogDeltaRaw(row)
  return Math.abs(num)
}
</script>

<style scoped lang="scss">
.grade-card {
  display: flex;
  align-items: center;
  gap: 20px;
  padding: 24px 28px;
  border-radius: 12px;
  background: linear-gradient(135deg, #3a4157 0%, #23262f 100%);
  box-shadow: 0 6px 20px rgba(35, 38, 47, 0.25);
}

.grade-icon {
  width: 64px;
  height: 64px;
  object-fit: contain;
  flex-shrink: 0;
}

.grade-info {
  flex: 1;
  min-width: 0;
}

.grade-name-row {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
}

.grade-name {
  color: #f0c46c;
  font-size: 20px;
  font-weight: 600;
  line-height: 1.4;
  letter-spacing: 1px;
}

.benefit-tag {
  padding: 0 10px;
  border: 1px solid rgba(240, 196, 108, 0.4);
  border-radius: 10px;
  background: rgba(240, 196, 108, 0.12);
  color: #f0d9a8;
  font-size: 12px;
  line-height: 20px;
}

.grade-exp,
.grade-next {
  margin-top: 8px;
  color: rgba(255, 255, 255, 0.75);
  font-size: 14px;
  line-height: 22px;
}

.num {
  color: #f0c46c;
  font-size: 16px;
  font-weight: 600;
}

.grade-progress {
  margin-top: 10px;

  :deep(.el-progress-bar__outer) {
    background: rgba(255, 255, 255, 0.15);
  }
}

.grade-panel {
  margin-top: 16px;
  padding: 4px 20px 20px;
  border: 1px solid #eee;
  border-radius: 8px;
  background: #fff;
}

.grade-tabs {
  display: flex;
  gap: 24px;
  margin-bottom: 16px;
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
