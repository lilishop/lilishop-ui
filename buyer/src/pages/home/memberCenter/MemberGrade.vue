<template>
  <div class="memberGrade">
    <UserCenterLayout title="我的等级" :tabs="['我的等级']">
    <div class="summary">
      <div class="gradeCard">
        <div class="gradeLeft">
          <img v-if="currentGrade.gradeImage" class="gradeIcon" :src="currentGrade.gradeImage" alt="等级图标" />
          <div class="gradeInfo">
            <div class="gradeNameRow">
              <span class="gradeNameText">{{ currentGrade.gradeName || '暂无等级' }}</span>
              <span v-if="currentGradeBenefits.length" class="benefitTagsInline">
                <el-tag v-for="b in currentGradeBenefits" :key="b.id" class="benefitTag" type="primary">{{ b.benefitName || '-' }}</el-tag>
              </span>
            </div>
            <div class="gradeExp">
              当前经验值：<span class="num">{{ currentExperience || 0 }}</span>
            </div>
            <div class="gradeNext" v-if="nextGrade">
              距 {{ nextGrade.gradeName }} 还差 <span class="num">{{ diffExperience }}</span> 经验值
            </div>
            <div class="gradeNext" v-else>已达最高等级</div>
          </div>
        </div>
      </div>
    </div>

    <el-tabs v-model="activeGradeTab">
      <el-tab-pane label="获取经验值方式" name="rules">
        <el-table v-loading="rulesLoading" :data="ruleList">
          <el-table-column label="获取方式" min-width="720">
            <template #default="{ row }">
              <div class="ruleItem">
                <div class="ruleTop">
                  <div class="ruleName">
                    <span>{{ row.ruleName || row.ruleKey || '-' }}</span>
                  </div>
                  <el-tag v-if="row.completed === true" color="success">已完成</el-tag>
                  <el-tag v-else color="default">未完成</el-tag>
                </div>
                <div class="ruleDesc">{{ getRuleDesc(row.ruleKey) }}</div>
                <div class="ruleMeta">
                  <span class="metaItem">单次获得：<b>+{{ row.value == null ? 0 : row.value }}</b></span>
                  <span v-if="row.maxValue != null && Number(row.maxValue) > 0" class="metaItem">限额：<b>{{ row.maxValue }}</b></span>
                  <span class="metaItem">已获得：<b>{{ row.gainedExperience == null ? 0 : row.gainedExperience }}</b></span>
                </div>
              </div>
            </template>
          </el-table-column>
        </el-table>
        <div class="rulesDesc" v-if="rulesDescription">{{ rulesDescription }}</div>
      </el-tab-pane>
      <el-tab-pane label="经验值记录" name="logs">
        <el-table v-loading="logLoading" :data="experienceLogs.records || []">
          <el-table-column prop="createTime" label="时间" align="center" min-width="160" />
          <el-table-column label="规则" align="center" min-width="160">
            <template #default="{ row }">
              <span>{{ getRuleName(row.ruleKey) }}</span>
            </template>
          </el-table-column>
          <el-table-column label="变动值" align="center" min-width="120">
            <template #default="{ row }">
              <div :style="{ color: getLogDeltaColor(row) }">
                <span v-if="getLogDeltaSign(row) === '+'">+</span>{{ getLogDeltaAbsValue(row) }}
              </div>
            </template>
          </el-table-column>
        </el-table>
        <div class="grade-pagination">
          <el-pagination
            v-model:current-page="params.pageNumber"
            v-model:page-size="params.pageSize"
            :total="experienceLogs.total || 0"
            @current-change="changePage"
            @size-change="changePageSize"
            :page-sizes="[10, 20, 50]"
            layout="total, prev, pager, next, jumper"
          />
        </div>
      </el-tab-pane>
    </el-tabs>
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
        pageSize: 10
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
h3 {
  font-size: 16px;
  margin: 20px 10px;
}

.summary {
  margin-bottom: 20px;
}

.rulesDesc {
  margin: 10px 0 0 0;
  padding: 10px 12px;
  border: 1px solid $border_color;
  border-radius: 4px;
  background: #fff;
  color: $light_sub_color;
  font-size: 12px;
  line-height: 1.7;
}

.gradeCard {
  padding: 16px;
  border: 1px solid $border_color;
  border-radius: 6px;
  background: #fff;
  background-repeat: no-repeat;
  background-size: cover;
}

.gradeLeft {
  display: flex;
  align-items: flex-start;
  gap: 12px;
}

.gradeIcon {
  width: 48px;
  height: 48px;
  object-fit: contain;
  border-radius: 4px;
  background: #fff;
}

.gradeNameRow {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px 10px;
  line-height: 1.4;
}

.gradeNameText {
  font-size: 16px;
  color: $light_title_color;
  font-weight: 600;
}

.benefitTagsInline {
  display: inline-flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 6px 8px;
  vertical-align: middle;
}

.benefitTag {
  margin: 0 !important;
}

.gradeExp,
.gradeNext {
  margin-top: 6px;
  font-size: 12px;
  color: #000;
}

.num {
  color: $theme_color;
  font-size: 16px;
}

.ruleItem {
  padding: 10px 8px;
}

.ruleTop {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
}

.ruleName {
  display: flex;
  align-items: center;
  gap: 8px;
  color: $light_title_color;
  font-size: 14px;
}

.ruleDesc {
  margin-top: 6px;
  color: $light_sub_color;
  font-size: 12px;
  line-height: 1.6;
}

.ruleMeta {
  margin-top: 8px;
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  color: $light_sub_color;
  font-size: 12px;
}

.metaItem b {
  color: $theme_color;
  font-weight: 600;
}

.grade-pagination {
  display: flex;
  justify-content: flex-end;
  margin-top: 10px;
}

</style>
