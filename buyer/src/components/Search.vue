<template>
  <div class="navbar" :class="{'small-search-box': useClass == 'fixed-show'}">
    <template v-if="useClass == 'fixed-show'">
      <div class="search search-embedded">
        <el-input
          v-model="searchData"
          size="large"
          class="search-input"
          placeholder="输入你想查找的商品"
          @focus="openPanel"
          @input="queueSuggest"
          @keyup.enter="search"
        />
        <div class="search-btn" @click="search">
          <el-icon :size="21"><SearchIcon /></el-icon>
        </div>
        <div v-if="showPanel" class="suggest-panel" @mousedown.prevent>
          <SearchSuggest
            :keyword="trimmedKeyword"
            :history="history"
            :hot-words="promotionTags"
            :suggestions="suggestions"
            :suggesting="suggesting"
            @pick="selectTags"
            @clear="clearHistory"
          />
        </div>
      </div>
    </template>
    <template v-else>
      <div class="container width_1200_auto flex flex-a-c">
        <img
          :src="$store.state.logoImg"
          v-if="showLogo"
          class="logo-img"
          alt=""
          @click="$router.push('/')"
        />
        <div class="search-box">
          <div class="search">
            <el-input
              v-model="searchData"
              size="large"
              class="search-input"
              placeholder="输入你想查找的商品"
              @focus="openPanel"
              @input="queueSuggest"
              @keyup.enter="search"
            />
            <div class="search-btn" @click="search">
              <el-icon :size="21"><SearchIcon /></el-icon>
            </div>
            <div v-if="showPanel" class="suggest-panel" @mousedown.prevent>
              <SearchSuggest
                :keyword="trimmedKeyword"
                :history="history"
                :hot-words="promotionTags"
                :suggestions="suggestions"
                :suggesting="suggesting"
                @pick="selectTags"
                @clear="clearHistory"
              />
            </div>
          </div>
          <template v-if="showTag">
            <div v-if="promotionTags.length === 0"></div>
            <div v-else class="history-list flex">
              <div
                v-for="(item, index) in promotionTags"
                :key="index"
                class="mr_10"
              >
                <span class="history-item" @click="selectTags(item)">{{ item }}</span>
              </div>
            </div>
          </template>
        </div>
      </div>
    </template>
  </div>
</template>

<script>
import storage from '@/plugins/storage.js'
import { goodsList, hotWords } from '@/api/goods.js'
import { Search as SearchIcon } from '@element-plus/icons-vue'
import SearchSuggest from '@/components/SearchSuggest.vue'

const HISTORY_KEY = 'buyerSearchHistory'
const HISTORY_LIMIT = 10

function readHistory() {
  try {
    const raw = localStorage.getItem(HISTORY_KEY)
    const list = raw ? JSON.parse(raw) : []
    return Array.isArray(list) ? list.filter((item) => typeof item === 'string' && item.trim()) : []
  } catch {
    return []
  }
}

function parseHotWords(raw) {
  if (!raw) return []
  if (Array.isArray(raw)) return raw.filter(Boolean)
  if (typeof raw !== 'string') return []
  try {
    const parsed = JSON.parse(raw)
    if (Array.isArray(parsed)) return parsed.filter(Boolean)
  } catch {
    // 旧数据可能是逗号拼接
  }
  return raw.split(',').map((item) => item.trim()).filter(Boolean)
}

export default {
  name: 'search',
  components: { SearchIcon, SearchSuggest },
  props: {
    showTag: {
      type: Boolean,
      default: true
    },
    showLogo: {
      type: Boolean,
      default: true
    },
    storeId: {
      type: String,
      default: ""
    },
    hover: {
      type: Boolean,
      default: false
    },
    useClass:{
      type:null,
      default:''
    }
  },
  data() {
    return {
      searchData: '',
      history: [],
      panelVisible: false,
      suggestions: [],
      suggesting: false,
      suggestTimer: null,
      suggestSeq: 0,
    };
  },
  methods: {
    selectTags(item) {
      this.searchData = item;
      this.search();
    },
    remember(keyword) {
      const next = [keyword, ...this.history.filter((item) => item !== keyword)].slice(0, HISTORY_LIMIT)
      this.history = next
      localStorage.setItem(HISTORY_KEY, JSON.stringify(next))
    },
    clearHistory() {
      this.history = []
      localStorage.removeItem(HISTORY_KEY)
    },
    openPanel() {
      this.panelVisible = true
      if (this.trimmedKeyword) this.queueSuggest()
    },
    closePanel() {
      this.panelVisible = false
    },
    onDocumentClick(event) {
      if (this.$el && !this.$el.contains(event.target)) this.closePanel()
    },
    queueSuggest() {
      this.panelVisible = true
      clearTimeout(this.suggestTimer)
      const keyword = this.trimmedKeyword
      if (!keyword) {
        this.suggestions = []
        this.suggesting = false
        return
      }
      this.suggesting = true
      this.suggestTimer = setTimeout(() => this.fetchSuggest(keyword), 300)
    },
    fetchSuggest(keyword) {
      const seq = ++this.suggestSeq
      const params = { keyword, pageNumber: 1, pageSize: 8 }
      if (this.storeId) params.storeId = this.storeId
      goodsList(params).then((res) => {
        if (seq !== this.suggestSeq || keyword !== this.trimmedKeyword) return
        const records = res && res.success ? (res.result.records || []) : []
        const seen = new Set()
        const names = []
        this.promotionTags.forEach((word) => {
          if (word && String(word).toLowerCase().includes(keyword.toLowerCase()) && !seen.has(word)) {
            seen.add(word)
            names.push(word)
          }
        })
        records.forEach((item) => {
          const name = item && item.goodsName
          if (name && !seen.has(name)) {
            seen.add(name)
            names.push(name)
          }
        })
        this.suggestions = names.slice(0, 8)
      }).catch(() => {
        if (seq === this.suggestSeq) this.suggestions = []
      }).finally(() => {
        if (seq === this.suggestSeq) this.suggesting = false
      })
    },
    search () {
      const keyword = this.trimmedKeyword
      this.searchData = keyword
      this.closePanel()
      if (keyword) this.remember(keyword)
      const url = this.$route.path;
      if(url == '/goodsList'){
        this.$emit('search', keyword)
      }else{
        const pushData = {
          path:'/goodsList',
          query: { keyword },
        }
        if(this.storeId) pushData.query.storeId = this.storeId

        this.$router.push(pushData);
      }
    },
    searchStore() {
      this.$emit('search', this.trimmedKeyword)
    },
    applyHotWords(result) {
      const list = parseHotWords(result)
      this.$store.commit('SET_HOTWORDS', list)
      storage.setItem('hotWordsList', JSON.stringify(list))
    },
    loadHotWords() {
      hotWords({ count: 5 }).then((res) => {
        if (res.success && res.result) this.applyHotWords(res.result)
      }).catch(() => {
        // 热词为可选数据，失败时沿用缓存或默认热词
      })
      storage.setItem('hotWordsReloadTime', new Date().getTime())
    }
  },
  computed: {
    trimmedKeyword() {
      return (this.searchData || '').trim()
    },
    promotionTags() {
      return parseHotWords(this.$store.state.hotWordsList)
    },
    showPanel() {
      if (!this.panelVisible) return false
      if (this.trimmedKeyword) return true
      return this.history.length > 0 || this.promotionTags.length > 0
    }
  },
  watch: {
    '$route.query.keyword'(value) {
      this.searchData = value || ''
    }
  },
  created() {
    this.searchData = this.$route.query.keyword || ''
    this.history = readHistory()

    if (!this.hover) {
      const reloadTime = storage.getItem('hotWordsReloadTime')
      const time = new Date().getTime() - 5 * 60 * 1000
      if (!reloadTime || time > reloadTime) this.loadHotWords()
    }
  },
  mounted() {
    this.onDocumentClick = this.onDocumentClick.bind(this)
    document.addEventListener('click', this.onDocumentClick)
  },
  beforeUnmount() {
    clearTimeout(this.suggestTimer)
    document.removeEventListener('click', this.onDocumentClick)
  }
};
</script>
<style scoped lang="scss">
.navbar {
  height: 113px;
  background: #fff;
}

.navbar.small-search-box {
  height: 60px;
  width: 100%;
  margin: 0;
  display: flex;
  align-items: center;
  background: transparent;
}

.search-embedded {
  width: 100%;
  margin: 0;
}

.container {
  position: relative;
  height: 100%;
}

.search {
  $btn-gap: 4px;
  $btn-width: 60px;
  $input-height: 37.8px;

  position: relative;
  width: 778.4px;
  height: $input-height;
  margin: 10px 0px 5px 0;

  .search-input {
    width: 100%;

    :deep(.el-input__wrapper) {
      border: 1.4px solid $theme_color;
      box-sizing: border-box;
      border-radius: 19.6px;
      padding-left: 26px;
      padding-right: calc(#{$btn-gap * 2} + #{$btn-width});
      font-size: 14px;
      font-weight: normal;
      height: $input-height;
      color: #999;
      box-shadow: none;
    }
  }

  .search-btn {
    position: absolute;
    right: $btn-gap;
    top: $btn-gap;
    bottom: $btn-gap;
    width: $btn-width;
    border-radius: calc((#{$input-height} - #{$btn-gap * 2}) / 2);
    cursor: pointer;
    box-sizing: border-box;
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1;
    background-color: $theme_color;
    color: #ffffff;
  }
}

.search-embedded.search {
  width: 100%;
}

.search-box{
  margin-left: 28px;
}
.logo-img {
  max-width: 150px;
  cursor: pointer;
}

.history-list {
  margin-left: 28px;
}

.history-item {
  font-size: 13px;
  font-weight: normal;
  line-height: 16px;
  letter-spacing: 0px;
  margin-right: 17px;
  color: #666666;
  cursor: pointer;
}

.suggest-panel {
  position: absolute;
  left: 0;
  right: 0;
  top: calc(100% + 8px);
  z-index: 30;
  padding: 8px 0;
  background: #fff;
  border: 1px solid #eee;
  border-radius: 8px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
}

</style>
