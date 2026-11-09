<template>
  <div>
    <TopBar></TopBar>
    <SearchHeader></SearchHeader>

    <div class="container width_1200">
      <h1 class="page-title">文章帮助中心</h1>
      <div class="layoutAll">
        <el-aside class="side-bar" width="220px">
          <div class="article-cate">文章分类</div>
          <p v-if="categoryError" role="alert" class="load-message">
            分类加载失败，可先浏览全部文章。
            <el-button link type="primary" :loading="categoryLoading" @click="getCateList">重试分类</el-button>
          </p>
          <el-button link type="primary" @click="onSelect('')">全部文章</el-button>
          <el-menu
            class="side-menu"
            :key="menuKey"
            :default-active="String(activeName)"
            :default-openeds="openName"
            @select="onSelect"
          >
            <template v-for="(menu, index) in list" :key="menu.id || index">
              <el-sub-menu v-if="menu.children && menu.children.length" :index="String(menu.id)">
                <template #title>
                  <span @click="onSelect(menu.id)">{{ menu.articleCategoryName }}</span>
                </template>
                <el-menu-item
                  v-for="(child, i) in menu.children"
                  :key="child.id || i"
                  :index="String(child.id)"
                >{{ child.articleCategoryName }}</el-menu-item>
              </el-sub-menu>
              <el-menu-item v-else :index="String(menu.id)">{{ menu.articleCategoryName }}</el-menu-item>
            </template>
          </el-menu>
        </el-aside>
        <el-main class="content">
          <div v-if="contentError" role="alert" class="load-message">
            {{ contentError }}
            <el-button link type="primary" @click="retryContent">重新加载</el-button>
          </div>
          <el-skeleton v-if="contentLoading" :rows="5" animated />
          <ul class="article-list" v-show="showList && !contentLoading && !contentError">
            <li v-if="!articleList.length" class="article-empty">暂无文章</li>
            <li v-for="(article, index) in articleList" :key="article.id || index" @click="getDetail(article.id)">
              {{ article.title }}
            </li>
          </ul>
          <el-pagination v-if="showList && !contentLoading && !contentError && total > params.pageSize"
            :current-page="params.pageNumber" :page-size="params.pageSize" :total="total"
            layout="prev, pager, next" @current-change="changePage" />
          <div v-show="!showList && !contentLoading && !contentError" class="article-detail">
            <button type="button" class="back-btn" @click="getList()">返回列表</button>
            <h2>{{ detail.title }}</h2>
            <div class="article-html" v-html="detail.content"></div>
          </div>
        </el-main>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, reactive, ref } from 'vue'
import TopBar from '@/components/indexDecorate/components/TopBar.vue';
import SearchHeader from '@/components/indexDecorate/components/SearchHeader.vue';
import { useRoute } from 'vue-router'
import { articleCateList, articleDetail, articleList as fetchArticleList } from '@/api/common.js'

defineOptions({ name: 'ArticleIndex' })

const route = useRoute()

const list = ref([])
const detail = ref({})
const articleList = ref([])
const activeName = ref('')
const openName = ref([])
const menuKey = ref(0)
const params = reactive({ pageNumber: 1, pageSize: 20, categoryId: '', sort: 'sort' })
const showList = ref(true)
const total = ref(0)
const categoryError = ref(false)
const categoryLoading = ref(false)
const contentError = ref('')
const contentLoading = ref(false)
const detailId = ref('')
let contentRequestId = 0

/** 切换分类时重置分页，并使之前的列表或正文请求失效。 */
function onSelect(id) {
  activeName.value = id
  params.pageNumber = 1
  return getList(id)
}

/** 独立加载分类；分类服务不可用时保留全部文章入口，不阻断正文和列表。 */
async function getCateList() {
  if (categoryLoading.value) return
  categoryLoading.value = true
  categoryError.value = false
  try {
    const res = await articleCateList({ skipMessage: true })
    if (!res.success || !Array.isArray(res.result)) throw new Error('分类响应无效')
    list.value = res.result
    openName.value = list.value.filter(item => Array.isArray(item.children) && item.children.length)
      .map(item => String(item.id))
    menuKey.value++
  } catch {
    categoryError.value = true
  } finally {
    categoryLoading.value = false
  }
}

/** 按分类分页查询公开文章；只接收最新一次请求结果，失败不冒充空列表。 */
async function getList(id = activeName.value) {
  const requestId = ++contentRequestId
  showList.value = true
  contentLoading.value = true
  contentError.value = ''
  params.categoryId = id || ''
  try {
    const res = await fetchArticleList({ ...params }, { skipMessage: true })
    if (!res.success || !Array.isArray(res.result?.records)) throw new Error('列表响应无效')
    if (requestId !== contentRequestId) return
    articleList.value = res.result.records
    total.value = Number(res.result.total) || 0
  } catch {
    if (requestId === contentRequestId) contentError.value = '文章加载失败，请稍后重试。'
  } finally {
    if (requestId === contentRequestId) contentLoading.value = false
  }
}

/** 加载指定文章；失败可原地重试，过时的正文响应不得覆盖用户新选择。 */
async function getDetail(id) {
  const requestId = ++contentRequestId
  detailId.value = id
  showList.value = false
  contentLoading.value = true
  contentError.value = ''
  try {
    const res = await articleDetail(id, { skipMessage: true })
    if (!res.success || !res.result) throw new Error('文章不存在')
    if (requestId !== contentRequestId) return
    detail.value = res.result
  } catch {
    if (requestId === contentRequestId) contentError.value = '文章详情加载失败或已不存在，请稍后重试。'
  } finally {
    if (requestId === contentRequestId) contentLoading.value = false
  }
}

/** 重试当前列表或正文，保留分类和分页条件。 */
function retryContent() {
  return showList.value ? getList() : getDetail(detailId.value)
}

/** 切换文章列表页码，沿用当前分类。 */
function changePage(page) {
  params.pageNumber = page
  return getList()
}

onMounted(() => {
  getCateList()
  if (route.query.id) getDetail(route.query.id)
  else getList()
})
</script>

<style scoped lang="scss">
.load-message {
  padding: 12px;
  color: #64748b;
  font-size: 13px;
}

.container {
  margin: 0 auto;
  padding: 20px 0 40px;
}

.page-title {
  margin: 0 0 16px;
  color: #171A26;
  font-size: 20px;
  font-weight: 600;
  line-height: 28px;
}

.layoutAll {
  display: flex;
  align-items: stretch;
  gap: 16px;
}

.side-bar,
.content {
  background: #fff;
  border: 1px solid #eee;
  border-radius: 4px;
}

.side-bar {
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
  overflow: hidden;
}

.article-cate {
  height: 48px;
  padding: 0 16px;
  border-bottom: 1px solid #f0f0f0;
  color: #171A26;
  font-size: 15px;
  font-weight: 600;
  line-height: 48px;
}

.side-menu {
  flex: 1;
  border-right: none;
  padding: 8px 0 12px;

  :deep(.el-sub-menu__title),
  :deep(.el-menu-item) {
    height: 40px;
    line-height: 40px;
    color: #171A26;
    font-size: 14px;
  }

  :deep(.el-sub-menu__title:hover),
  :deep(.el-menu-item:hover) {
    background: #fafafa;
    color: $theme_color;
  }

  :deep(.el-menu-item.is-active),
  :deep(.el-sub-menu.is-active > .el-sub-menu__title) {
    background: #fff5f4;
    color: $theme_color;
  }
}

.content {
  flex: 1;
  min-width: 0;
  padding: 4px 28px 12px;
}

.article-list {
  margin: 0;
  padding: 0;
  list-style: none;

  li {
    margin: 0 -28px;
    padding: 16px 28px;
    border-bottom: 1px solid #f0f0f0;
    color: #171A26;
    font-size: 15px;
    line-height: 22px;
    cursor: pointer;

    &:last-child {
      border-bottom: none;
    }

    &:hover {
      background: #fafafa;
      color: $theme_color;
    }
  }
}

.article-empty {
  color: #999 !important;
  cursor: default !important;

  &:hover {
    color: #999 !important;
  }
}

.back-btn {
  margin-top: 16px;
  padding: 0;
  border: none;
  background: none;
  color: #438cde;
  font-family: inherit;
  font-size: 14px;
  line-height: 22px;
  cursor: pointer;

  &:hover {
    color: $theme_color;
  }
}

.article-detail h2 {
  margin: 16px 0 20px;
  color: #171A26;
  font-size: 22px;
  font-weight: 600;
  line-height: 32px;
}

.article-html {
  color: #333;
  font-size: 15px;
  line-height: 1.8;
  word-break: break-word;

  :deep(img) {
    max-width: 100%;
    height: auto;
  }

  :deep(p) {
    margin: 0 0 12px;
  }
}
</style>
