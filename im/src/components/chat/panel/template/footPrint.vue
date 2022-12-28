<template>
  <div class="box" @scroll="scrollBottom">
    <div class="tab">
      <el-tabs v-model="activeName" @tab-click="handleClick">
        <el-tab-pane label="最近浏览" name="first"></el-tab-pane>
      </el-tabs>
    </div>
    <dl>
      <dd v-for="item in list" v-infinite-scroll="loadMore">
        <div class="base" @click="linkToGoods(item.goodsId, item.id)">
          <div>
            <img :src="item.thumbnail" class="image" />
          </div>
          <div style="margin-left: 13px">
            <a>{{ item.goodsName }}</a>
            <div>
              <span style="color: red;">￥{{ item.price }}</span>
            </div>
          </div>
        </div>
      </dd>
    </dl>
  </div>
</template>

<script>
import { Tag, button, Tabs, TabPane, InfiniteScroll } from 'element-ui'
export default {
  directives: {
    "infinite-scroll": InfiniteScroll,
  },
  data () {
    return {
      activeName: 'first'
    }
  },
  components: {
    "el-tag": Tag,
    "el-button": button,
    "el-tabs": Tabs,
    "el-tab-pane": TabPane,
  },
  methods: {
    scrollBottom (e) {
      const { scrollTop, scrollHeight, clientHeight } = e.srcElement
      if (scrollTop + clientHeight >= scrollHeight) {
        if (this.noMore) return
        this.$emit('loadMore')
      }
    },
    loadMore () {

    },
    handleClick (tab, event) {
      console.log(tab, event);
    }
  },
  props: {
    list: {
      type: Array,
      default: [],
    },
  },
  mounted () {
    console.log(this.list, 'list');
  }
}

</script>

<style scoped lang="less">
/deep/ .el-tabs__item.is-top:last-child {
  color: black;
}

/deep/.el-tabs__active-bar {
  background-color: #f23030;
}

/deep/ .el-tabs__nav.is-top {
  height: 50px;
}

.tab {
  display: flex;
  justify-content: center;
  align-items: center;
}

.box {
  height: 500px;
  overflow: auto;
  width: 350px;
}

.store-button {
  background-color: white;
  border-color: #F56C6C;
}

.base {
  margin-top: 5px;
  height: 120px;
  display: flex;

  div {
    overflow: hidden;
    text-overflow: ellipsis;
    margin-top: 8px;
    white-space: nowrap;
    margin-top: 4px;
  }

  .image {
    height: 100px;
    margin-top: 3px;
    width: 100px
  }

}

.separate {
  margin-top: 8px;
}
</style>