<template>
  <div class="wrapper">
    <UserCenterLayout title="评论/晒单" :tabs="['评论/晒单']">

    <div class="order">
      <div class="order-title">
        <div class="order-row title">
          <div class="order-detail-title col-10">订单详情</div>
          <div class="col-4">收货人</div>
          <div class="col-4">评价等级</div>
          <div class="col-4">评价内容</div>
          <div class="col-2"></div>
        </div>
      </div>
      <empty v-if="list.length === 0" />

      <div class="order-item" v-else v-for="(item, index) in list" :key="index">
        <div>
          <div class="title order-item-title">
            <span>订单号:{{item.orderNo}}</span>
            <span class="color999 ml_10">{{item.createTime}}</span>
            <span class="hover-pointer fontsize_12 eval-detail" @click="evaluateDetail(item.id)">评价详情</span>
          </div>
          <div class="order-item-view">
            <div class="item-view-name col-10">
              <div class="order-img hover-color" @click="linkTo(`/goodsDetail?goodsId=${item.goodsId}&skuId=${item.skuId}`)">
                <img :src="item.goodsImage" alt="" />
              </div>
              <div class="order-name hover-color" @click="linkTo(`/goodsDetail?goodsId=${item.goodsId}&skuId=${item.skuId}`)">
                {{item.goodsName}}
              </div>
            </div>
            <div class="col-4">{{ $filters.secrecyMobile(item.createBy ) }}</div>
            <div class="col-4">
              {{item.grade==='GOOD'?'好评' : item.grade === 'WORSE'?'差评' : '中评'}}
            </div>
            <div class="col-4">
              <el-tooltip>
                  <div class="content">{{item.content}}</div>
                  <template #content>
                    <div style="white-space: normal;word-break:break-all">
                      {{item.content}}
                    </div>
                  </template>
              </el-tooltip>
            </div>
            <div class="col-2"></div>
          </div>
        </div>
      </div>
      <el-skeleton v-if="loading"></el-skeleton>
    </div>
    <!-- 分页 -->
    <div class="page-size">
      <el-pagination v-model:current-page="params.pageNumber" v-model:page-size="params.pageSize"
        :total="total" @current-change="changePageNum"
        @size-change="changePageSize" layout="total, sizes, prev, pager, next, jumper"></el-pagination>
    </div>
    </UserCenterLayout>
  </div>
</template>

<script>
import {evolutionList} from '@/api/order.js';
export default {
  name: 'CommentList',
  data () {
    return {
      commentWay: [`待评价`, `待追评`, `已评价`], // 评价分类
      loading: false, // 加载状态
      list: [], // 评价列表
      total: 0, // 评价总数
      params: { // 请求参数
        pageNumber: 1,
        pageSize: 10
      }
    };
  },
  mounted () {
    this.getList()
  },
  methods: {
    getList () { // 获取评价列表
      evolutionList(this.params).then(res => {
        if (res.success) {
          const list = res.result.records;
          list.forEach(element => {
            element.descriptionScore = Number(element.descriptionScore)
          });
          this.list = list;
          this.total = res.result.total
        }
      })
    },
    changePageNum (val) { // 修改页码
      this.params.pageNumber = val;
      this.getList()
    },
    changePageSize (val) { // 修改页数
      this.params.pageNumber = 1;
      this.params.pageSize = val;
      this.getList()
    },
    evaluateDetail (id) { // 跳转评价详情
      this.$router.push({path: '/home/evalDetail', query: { id }})
    }
  }
};
</script>

<style scoped lang="scss">
.page-size {
  display: flex;
  justify-content: flex-end;
}
.order-img {
  > img {
    width: 60px;
    height: 60px;
    border: 1px solid $border_color;
    box-sizing: border-box;
  }
}
.title {
  @include background_color($light_background_color);
}
.item-view-name {
  display: flex;
}
.order-name {
  display: -webkit-box;

  -webkit-box-orient: vertical;

  -webkit-line-clamp: 2;

  overflow: hidden;
  text-align: left;
  padding: 0 10px;
  font-size: 13px;
  @include content_color($light_content_color);
}
.order-item-title {
  padding: 5px 20px;
  text-align: left;
  font-size: 13px;
  position: relative;
}
.order-row,
.order-item-view {
  display: flex;
  align-items: center;

  > [class*='col-'] {
    box-sizing: border-box;
    padding: 0 8px;
  }

  > .col-12 {
    flex: 0 0 50%;
    max-width: 50%;
  }

  > .col-10 {
    flex: 0 0 41.666667%;
    max-width: 41.666667%;
  }

  > .col-4 {
    flex: 0 0 16.666667%;
    max-width: 16.666667%;
  }

  > .col-2 {
    flex: 0 0 8.333333%;
    max-width: 8.333333%;
  }

  > .col-6 {
    flex: 0 0 25%;
    max-width: 25%;
  }
}

.order-item-view {
  padding: 10px 20px;
  align-items: flex-start;
}
.order-item {
  text-align: center;
  border: 1px solid $border_color;
  margin: 10px 0;
}
.order-row {
  padding: 10px 0;
  text-align: center;
}
.order-detail-title {
  text-align: left;
  padding-left: 20px !important;
}
.content {
  color: #999;
  max-height: 60px;
  overflow: hidden;
  // word-wrap: break-word;
  display:-webkit-box;
  -webkit-box-orient:vertical;/*设置方向*/
  -webkit-line-clamp:3;/*设置超过为省略号的行数*/
  word-break:break-all; 
}

.eval-detail {
  position: absolute;
  right: 20px;
  &:hover{
    color: $theme_color;
  }
}
</style>
