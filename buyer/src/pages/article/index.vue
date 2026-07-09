<template>
  <div>
    <BaseHeader></BaseHeader>
    <Search></Search>

    <div class="title-bg"><p>文章帮助中心</p></div>
    <div class="container width_1200">
      <div class="layoutAll">
        <el-aside class="side-bar" width="200px">
          <div class="article-cate">文章分类列表</div>
          <el-menu
            class="side-menu"
            :key="menuKey"
            :default-active="String(activeName)"
            :default-openeds="openName"
            @select="onSelect"
          >
            <el-sub-menu
              v-for="(menu, index) in list"
              v-show="menu.children"
              :key="index"
              :index="menu.articleCategoryName"
            >
              <template #title>
                <span>{{ menu.articleCategoryName }}</span>
              </template>
              <el-menu-item
                v-for="(chlidren, i) in menu.children"
                :key="i"
                :index="String(chlidren.id)"
              >{{ chlidren.articleCategoryName }}</el-menu-item>
            </el-sub-menu>
          </el-menu>
        </el-aside>
        <el-main class="content ml_10">
          <ul class="article-list" v-show="showList">
            <li v-for="(article, index) in articleList" :key="index" @click="getDetail(article.id)">
              {{ article.title }}
            </li>
          </ul>
          <transition mode="out-in">
            <div v-show="!showList">
              <a class="back-btn" @click="showList = true">&lt;返回上一级</a>
              <h2 class="mt_10 mb_10">{{ detail.title }}</h2>
              <div class="mt_10 mb_10" v-html="detail.content"></div>
            </div>
          </transition>
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
          this.list = res.result
          if (this.$route.query.id) {
            this.activeName = this.detail.categoryId
            this.list.forEach(e => {
              if (e.children.length) {
                e.children.forEach(i => {
                  if (i.id === this.detail.categoryId) {
                    this.openName.push(e.articleCategoryName)
                  }
                })
              } else {
                delete e.children
              }
            })
          } else {
            this.activeName = this.list[0].children[0].id
            this.openName.push(this.list[0].articleCategoryName)
          }
          this.menuKey++
          this.getList(this.activeName)
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
.content {
  padding: 15px 50px;
}

.header {
  @include background_color($light_background_color);
}

.side-menu,
.side-bar,
.content {
  @include white_background_color();
  @include title_color($light_title_color);
}

.side-bar {
  min-height: 600px;
  height: auto;
}

.layoutAll {
  display: flex;
  min-height: 1200px;
  @include background_color($light_background_color);
}

.container {
  margin: 0 auto;
  padding: 20px 0;
}

.side-bar a {
  @include title_color($light_title_color);
}

.layout-footer-center {
  padding: 0px 15px;
  padding-bottom: 15px;
  text-align: center;
}
.title-bg{
  height: 100px;
  width: 100%;
  background-color: #7b7b7b;
  p{
    width: 1200px;
    font-size: 30px;
    height: 100px;
    line-height: 100px;
    color: #fff;
    margin: 0 auto;
    padding-left: 10px;
  }
}
.article-cate{
  width: 200px;
  height: 30px;
  color: #fff;
  line-height: 30px;
  text-align: center;
  font-size: 18px;
  background-color: #666;
}
.article-list {
  li{
    margin: 10px 0;
    color: #2D8CF0;
    &:hover{
      cursor: pointer;
    }
  }
}
</style>
