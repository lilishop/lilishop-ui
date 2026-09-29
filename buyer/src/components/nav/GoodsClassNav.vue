<template>
  <div class="item-class-show">
    <div class="head-bar">
      <!-- 有商品分类展示商品分类 -->
      <template v-if="$route.query.categoryId">
        <div @click="cateClick(tabBar, 1)">{{ tabBar.name }}</div>
        <template v-if="tabBar.first && tabBar.first.name">
          <el-icon><ArrowRight /></el-icon>
          <div class="bar">
            {{ tabBar.first.name }} <el-icon><ArrowDown /></el-icon>
            <ul>
              <li v-for="item in tabBar.children" :key="item.id" @click="cateClick(item, 2)">
                {{ item.name }}
              </li>
            </ul>
          </div>
        </template>
        <template v-if="tabBar.second && tabBar.second.name">
          <el-icon><ArrowRight /></el-icon>
          <div class="bar">
            {{ tabBar.second.name }} <el-icon><ArrowDown /></el-icon>
            <ul>
              <li v-for="item in tabBar.first.children" :key="item.id" @click="cateClick(item, 3)">
                {{ item.name }}
              </li>
            </ul>
          </div>
        </template>
      </template>
      <!-- 无商品分类，展示搜索结果 -->
      <template v-else>
        <div class="result-label">全部结果</div>
        <el-icon><ArrowRight /></el-icon>
        <div class="result-keyword">“{{params.keyword}}”</div>
      </template>
      <!-- 所选分类 -->
      <a
        class="selected-item"
        @click="cancelSelected(item, index)"
        v-for="(item, index) in selectedItem"
        :key="index"
        :title="item.name"
      >
        <span>{{ item.type }}：</span><span>{{ item.name }}</span><el-icon><Close /></el-icon>
      </a>
    </div>

    <!-- 筛选主体 -->
    <div class="content">
      <!-- 品牌， 有图片，独立出来 -->
      <div class="brand" v-show="tagsContent[0].show && tagsContent[0].values.length">
        <div>
          {{ tagsContent[0].key }}：
        </div>
        <div>
          <ul :class="{ 'show-more': tagsContent[0].more }">
            <li :class="{ 'is-active': !isGroupSelected(0) }" @click="selectAll(0)">
              <span>全部</span>
            </li>
            <li
              @click="selectBrand(item.name, 0)"
              v-for="(item, index) in tagsContent[0].values"
              :key="index"
            >
              <span>{{ item.name }}</span>
            </li>
          </ul>

          <div class="btn" v-show="rowOverflow[0]">
            <span @click="moreBrand(0)"
              >{{ tagsContent[0].more ? "收起" : "更多"
              }}<el-icon><ArrowUp v-if="tagsContent[0].more" /><ArrowDown v-else /></el-icon></span>
          </div>
        </div>
      </div>

      <!-- 其他筛选项 -->
      <template v-for="(tag, tagIndex) in tagsContent">
        <div class="other" v-if="tag.show && tagIndex !== 0" v-show="tagIndex < showTagCount" :key="tagIndex">
          <div>
            {{ tag.key }}：
          </div>
          <div>
            <ul
              :class="{ 'show-more': tag.more }"
              :data-index="tagIndex"
              class="list"
            >
              <li
                class="item"
                :class="{ 'is-active': !isGroupSelected(tagIndex) }"
                @click="selectAll(tagIndex)"
              >全部</li>
              <li
                @click="selectBrand(item, tagIndex)"
                class="item"
                v-for="(item, index) in tag.values"
                :key="index"
              >
                {{ item }}
              </li>
            </ul>

            <div class="btn" v-show="rowOverflow[tagIndex]">
              <span @click="moreBrand(tagIndex)"
                >{{ tag.more ? "收起" : "更多"
                }}<el-icon><ArrowUp v-if="tag.more" /><ArrowDown v-else /></el-icon></span>
            </div>
          </div>
        </div>
      </template>
      <div @click="moreOptions" v-if="tagsContent.length>4" class="more-options">
      {{showTagCount===5?'更多筛选项':'收起筛选项'}}
      </div>
    </div>
  </div>
</template>

<script>
import { ArrowDown, ArrowRight, ArrowUp, Close } from '@element-plus/icons-vue';
import * as APIGoods from '@/api/goods';
export default {
  components: { ArrowDown, ArrowRight, ArrowUp, Close },
  name: 'GoodsClassNav',
  data () {
    return {
      tabBar: {
        name: '',
        children: [],
        first: null,
        second: null
      },
      showTagCount: 5, // 展示的搜索项数量
      tagsContent: [
        // 标签
        {
          key: '品牌',
          more: false,
          show: true,
          values: []
        }
      ],
      selectedItem: [], // 已选分类集合 顶部展示
      brandIds: [], // 品牌id合集
      params: {}, // 请求参数
      rowOverflow: {} // 一行排不下时才显示更多
    };
  },
  computed: {
    cateList () { // 商品分类
      return this.$store.state.category || []
    }
  },
  watch: {
    selectedItem: {
      // 监听已选条件，来调用列表接口
      handler (val) {
        let classification = [];
        this.params.brandId = ''
        this.params.prop = ''
        val.forEach((item) => {
          if (item.type === '品牌') {
            this.params.brandId = this.brandIds.join('@');
          } else {
            const nameArr = item.name.split('、');
            nameArr.forEach((name) => {
              classification.push(item.type + '_' + name);
            });
          }
        });
        this.params.prop = classification.join('@');
        this.getFilterList(this.params);
        this.$emit('getParams', this.params);
      },
      deep: true
    },
    '$route': { // 监听路由
      handler (val, oVal) {
        if (this.$route.query.categoryId) {
          let cateId = this.$route.query.categoryId.split(',')
          Object.assign(this.params, this.$route.query)
          this.params.categoryId = cateId[cateId.length - 1]
        } else {
          Object.assign(this.params, this.$route.query)
        }
        this.getFilterList(this.params)
        this.getNav()
      },
      deep: true
    }
  },
  methods: {
    getNav () { // 获取商品分类，分类下展示
      if (!this.$route.query.categoryId) return
      if (!this.cateList.length) { // 商品分类存储在localstorage，接口未调用成功前再次刷新数据
        setTimeout(() => {
          this.getNav()
        }, 500)
        return
      }
      const arr = this.$route.query.categoryId.split(',')
      const source = this.cateList.find((e) => e.id === arr[0])
      if (!source) return
      const tabBar = {
        id: source.id,
        name: source.name,
        parentId: source.parentId,
        children: source.children || [],
        first: null,
        second: null,
      }
      if (arr.length > 1) {
        tabBar.first = tabBar.children.find((e) => e.id === arr[1]) || null
      }
      if (arr.length > 2 && tabBar.first && tabBar.first.children) {
        tabBar.second = tabBar.first.children.find((e) => e.id === arr[2]) || null
      }
      this.tabBar = tabBar
    },
    cateClick (item, index) { // 点选分类
      switch (index) {
        case 1:
          this.$router.push({
            path: '/goodsList',
            query: {categoryId: item.id}
          })
          break;
        case 2:
          this.$router.push({
            path: '/goodsList',
            query: {categoryId: [item.parentId, item.id].toString()}
          })
          break;
        case 3:
          this.$router.push({
            path: '/goodsList',
            query: {categoryId: [this.tabBar.id, item.parentId, item.id].toString()}
          })
          break;
      }
    },
    isGroupSelected (index) {
      const group = this.tagsContent[index];
      if (!group) return false;
      return this.selectedItem.some((selected) => selected.type === group.key);
    },
    selectAll (index) {
      const group = this.tagsContent[index];
      if (!group) return;
      const selectedIndex = this.selectedItem.findIndex((selected) => selected.type === group.key);
      if (selectedIndex === -1) return;
      this.cancelSelected(this.selectedItem[selectedIndex], selectedIndex);
    },
    selectBrand (item, index) {
      const type = this.tagsContent[index].key;
      if (this.selectedItem.some((selected) => selected.type === type)) {
        return;
      }
      this.selectedItem.push({
        type,
        name: item
      });
      this.tagsContent[index].show = false;
      if (index === 0) {
        this.appendBrandIdsByNames([item]);
      }
    },

    cancelSelected (item, index) {
      // 顶部栏 取消已选中的项
      this.selectedItem.splice(index, 1);

      this.tagsContent.forEach((tag, index) => {
        if (tag.key === item.type) {
          tag.show = true;
          tag.more = false;
        }
      });
      if (item.type === '品牌') {
        this.brandIds = [];
      }
    },
    moreBrand (index) {
      // 更多按钮
      const flag = !this.tagsContent[index].more
      this.tagsContent[index]['more'] = flag
      this.$nextTick(() => this.measureRows())
    },
    measureRows () {
      if (!this.$el) return
      const next = {}
      const brand = this.$el.querySelector('.brand ul')
      if (brand && brand.offsetParent) {
        next[0] = !!(this.tagsContent[0] && this.tagsContent[0].more) || brand.scrollHeight > brand.clientHeight + 1
      }
      this.$el.querySelectorAll('.other .list').forEach((list) => {
        if (!list.offsetParent) return
        const index = Number(list.dataset.index)
        const tag = this.tagsContent[index]
        next[index] = !!(tag && tag.more) || list.scrollHeight > list.clientHeight + 1
      })
      const prev = this.rowOverflow
      const keys = new Set([...Object.keys(prev), ...Object.keys(next)])
      const changed = [...keys].some((key) => !!prev[key] !== !!next[key])
      if (changed) this.rowOverflow = next
    },
    appendBrandIdsByNames (names) {
      const selectedNames = names || [];
      const brands = this.tagsContent[0] && this.tagsContent[0].values ? this.tagsContent[0].values : [];
      brands.forEach((val) => {
        if (selectedNames.includes(val.name) && val.value && !this.brandIds.includes(val.value)) {
          this.brandIds.push(val.value);
        }
      });
    },
    getFilterList (params) {
      // 筛选、分类  列表
      APIGoods.filterList(params).then((res) => {
        if (res.success) {
          const data = res.result;
          const hiddenKeys = new Set(this.selectedItem.map((item) => item.type));
          this.tagsContent = [{
            key: '品牌',
            more: false,
            show: !hiddenKeys.has('品牌'),
            values: data.brands || []
          }].concat(data.paramOptions || []);
          this.tagsContent.forEach((item) => {
            item.show = !hiddenKeys.has(item.key);
            item.more = false;
          });
          this.$nextTick(() => this.measureRows())
        }
      });
    },
    // 展示更多搜索项
    moreOptions () {
      this.showTagCount = this.showTagCount === 5 ? 100 : 5
      this.$nextTick(() => this.measureRows())
    }
  },
  mounted () {
    // 有分类id就根据id搜索
    if (this.$route.query.categoryId) {
      let cateId = this.$route.query.categoryId.split(',')
      Object.assign(this.params, this.$route.query)
      this.params.categoryId = cateId[cateId.length - 1]
    } else {
      Object.assign(this.params, this.$route.query)
    }
    this.getFilterList(this.params);
    this.getNav();
    window.addEventListener('resize', this.measureRows)
  },
  beforeUnmount () {
    window.removeEventListener('resize', this.measureRows)
  }
}
</script>

<style scoped lang="scss">
/** 头部展示筛选项 */
.head-bar {
  width: 100%;
  background: #fff;
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  min-height: 48px;
  align-items: center;
  padding: 8px 16px;
  border: 1px solid #eee;
  border-bottom: none;
  border-radius: 4px 4px 0 0;
  color: #666;
  font-size: 14px;
  box-sizing: border-box;

  > div:first-child {
    padding: 0;
    font-size: 14px;
    font-weight: 400;
    color: #666;
    &:hover {
      color: $theme_color;
      cursor: pointer;
    }
  }

  .result-label {
    color: #666;
  }

  .result-keyword {
    margin-left: 4px;
    color: #171A26;
    font-size: 15px;
    font-weight: 600;
  }

  > .el-icon {
    color: #ccc;
    font-size: 12px;
  }

  .bar {
    position: relative;
    display: inline-flex;
    align-items: center;
    gap: 4px;
    height: 28px;
    margin: 0 4px;
    padding: 0 10px;
    border: 1px solid #e5e5e5;
    border-radius: 4px;
    background: #fff;
    color: #171A26;
    font-size: 14px;
    line-height: 26px;

    &:hover {
      border-color: $theme_color;
      color: $theme_color;
      cursor: pointer;

      ul {
        display: flex;
      }

      > .el-icon {
        transform: rotate(180deg);
      }
    }

    ul {
      display: none;
      position: absolute;
      top: calc(100% + 6px);
      left: 0;
      z-index: 5;
      width: 280px;
      margin: 0;
      padding: 8px;
      flex-wrap: wrap;
      list-style: none;
      background: #fff;
      border: 1px solid #eee;
      border-radius: 4px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);

      li {
        width: 33.33%;
        padding: 6px 8px;
        box-sizing: border-box;
        color: #171A26;
        font-size: 14px;
        line-height: 20px;
        text-align: left;

        &:hover {
          color: $theme_color;
          cursor: pointer;
        }
      }
    }
  }
  //所选分类
  .selected-item {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    max-width: 240px;
    height: 28px;
    margin: 0;
    padding: 0 8px;
    border: 1px solid #ffd0cb;
    border-radius: 4px;
    background: #fff5f4;
    color: #666;
    font-size: 13px;
    line-height: 26px;
    text-decoration: none;
    box-sizing: border-box;
    cursor: pointer;

    span:first-child {
      flex-shrink: 0;
      color: #666;
    }

    span:nth-child(2) {
      min-width: 0;
      overflow: hidden;
      color: $theme_color;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .el-icon {
      position: static;
      flex-shrink: 0;
      width: 14px;
      height: 14px;
      color: #999;
      font-size: 12px;
      line-height: 1;
      background: transparent;
    }

    &:hover {
      border-color: $theme_color;
      background: #fff5f4;

      .el-icon {
        color: $theme_color;
        background: transparent;
      }
    }
  }
}
/** 筛选主体 */
.content {
  background: #fff;
  border: 1px solid #eee;
  border-top: none;
  margin: 0 0 12px;
  border-radius: 0 0 4px 4px;
}
/** 品牌 start */
.brand {
  border-bottom: 1px solid #f0f0f0;
  display: flex;
  min-height: 44px;
  font-size: 14px;
  > div:first-child {
    width: 88px;
    background: transparent;
    padding-left: 16px;
    line-height: 44px;
    color: #666;
    font-weight: 400;
    flex-shrink: 0;
  }
  > div:last-child {
    flex: 1;
    min-width: 0;
    width: auto;
    padding: 0 16px;
    position: relative;
    ul {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      width: calc(100% - 72px);
      height: 44px;
      margin: 0;
      padding: 0;
      overflow: hidden;
      list-style: none;
      li {
        flex: 0 0 auto;
        width: auto;
        max-width: none;
        height: 44px;
        margin: 0 40px 0 0;
        line-height: 44px;
        overflow: visible;
        padding: 0;
        cursor: pointer;

        &:hover span {
          color: $theme_color;
        }

        &.is-active span {
          color: $theme_color;
          font-weight: 400;
        }

        span {
          display: block;
          overflow: visible;
          color: #171A26;
          text-align: left;
          font-size: 14px;
          font-weight: 400;
          line-height: 44px;
          white-space: nowrap;
          text-overflow: clip;
          cursor: pointer;
        }
      }
    }
    .show-more {
      height: auto;
      max-height: none;
      overflow: visible;
    }
    .btn {
      position: absolute;
      right: 16px;
      top: 8px;
      span {
        margin-left: 12px;
        color: #438cde;
        display: inline-flex;
        align-items: center;
        gap: 2px;
        padding: 0;
        border: none;
        font-size: 14px;
        line-height: 28px;
        &:hover {
          cursor: pointer;
          color: $theme_color;
        }
      }
    }
  }
}
/** 品牌 end */
/** 其他筛选项  start */
.other {
  border-bottom: 1px solid #f0f0f0;
  display: flex;
  min-height: 44px;
  font-size: 14px;
  &:last-child {
    border: none;
  }
  > div:first-child {
    width: 88px;
    background: transparent;
    padding-left: 16px;
    line-height: 44px;
    color: #666;
    font-weight: 400;
    flex-shrink: 0;
  }
  > div:last-child {
    flex: 1;
    min-width: 0;
    width: auto;
    padding: 0 16px;
    position: relative;
    .list {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      width: calc(100% - 72px);
      height: 44px;
      margin: 0;
      padding: 0;
      overflow: hidden;
      list-style: none;
      .item {
        flex: 0 0 auto;
        width: auto;
        max-width: none;
        height: 44px;
        margin: 0 40px 0 0;
        line-height: 44px;
        color: #171A26;
        overflow: visible;
        white-space: nowrap;
        text-overflow: clip;
        font-size: 14px;
        font-weight: 400;
        padding: 0;
        cursor: pointer;
        &:hover {
          color: $theme_color;
        }

        &.is-active {
          color: $theme_color;
          font-weight: 400;
        }
      }
    }

    .show-more {
      height: auto;
      max-height: none;
      overflow: visible;
    }

    .btn {
      position: absolute;
      right: 16px;
      top: 8px;
      span {
        margin-left: 12px;
        color: #438cde;
        display: inline-flex;
        align-items: center;
        gap: 2px;
        padding: 0;
        border: none;
        font-size: 14px;
        line-height: 28px;
        &:hover {
          cursor: pointer;
          color: $theme_color;
        }
      }
    }
  }
}
.more-options{
  margin: 0;
  padding: 10px 16px;
  color: #438cde;
  font-size: 14px;
  cursor: pointer;
  text-align: right;
}
.more-options:hover{
  color: $theme_color;
}
/** 其他筛选项  end */
</style>
