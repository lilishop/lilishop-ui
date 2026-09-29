<template>
  <div>
    <BaseHeader></BaseHeader>
    <Search></Search>

    <div class="container width_1200">
      <h1 class="page-title">文章帮助中心</h1>
      <div class="layoutAll">
        <el-aside class="side-bar" width="220px">
          <div class="article-cate">文章分类</div>
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
          <ul class="article-list" v-show="showList">
            <li v-if="!articleList.length" class="article-empty">暂无文章</li>
            <li v-for="(article, index) in articleList" :key="article.id || index" @click="getDetail(article.id)">
              {{ article.title }}
            </li>
          </ul>
          <div v-show="!showList" class="article-detail">
            <button type="button" class="back-btn" @click="showList = true">返回列表</button>
            <h2>{{ detail.title }}</h2>
            <div class="article-html" v-html="detail.content"></div>
          </div>
        </el-main>
      </div>
    </div>
  </div>
</template>

<script>
import { articleCateList, articleDetail, articleList } from '@/api/common.js'

export default {
  name: 'ArticleIndex',
  data () {
    return {
      list: [],
      detail: '',
      articleList: [],
      activeName: '1347456734864367616',
      openName: [],
      menuKey: 0,
      params: {
        pageNumber: 1,
        pageSize: 100,
        categoryId: '',
        sort: 'sort'
      },
      showList: true
    };
  },
  methods: {
    onSelect (id) {
      this.getList(id)
      this.detail = ''
      this.showList = true
    },
    getCateList () {
      articleCateList().then(res => {
        if (res.success) {
          this.list = res.result || []
          this.openName = []
          if (this.$route.query.id && this.detail && this.detail.categoryId) {
            this.activeName = this.detail.categoryId
            this.list.forEach(e => {
              const children = e.children || []
              const hitParent = String(e.id) === String(this.activeName)
              const hitChild = children.some(i => i && String(i.id) === String(this.activeName))
              if ((hitParent || hitChild) && children.length) {
                this.openName.push(String(e.id))
              }
            })
          } else if (this.list[0] && this.list[0].id) {
            this.activeName = this.list[0].id
            if (this.list[0].children && this.list[0].children.length) {
              this.openName.push(String(this.list[0].id))
            }
          }
          this.menuKey++
          if (this.activeName) {
            this.getList(this.activeName)
          }
        }
      })
    },
    getList (id) {
      this.params.categoryId = id
      articleList(this.params).then(res => {
        if (res.success) {
          this.articleList = res.result.records
        }
      })
    },
    async getDetail (id) {
      await articleDetail(id).then(res => {
        if (res.success) {
          this.detail = res.result
          this.showList = false
        }
      })
    }
  },
  async mounted () {
    const articleId = this.$route.query.id
    if (articleId) {
      await this.getDetail(articleId)
    }
    this.getCateList()
  }
};
</script>

<style scoped lang="scss">
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
