<template>
  <div class="wrapper">
    <UserCenterLayout>

    <empty v-if="list.length === 0" />
    <div class="comment-list" v-else>
      <div class="comment-cols">
        <span>订单详情</span>
        <span>评价等级</span>
        <span>评价内容</span>
        <span>操作</span>
      </div>
      <div class="comment-card" v-for="(item, index) in list" :key="item.id || index">
        <div class="comment-head">
          <div class="order-sn">
            {{ item.createTime }}<span>订单号 {{ item.orderNo }}</span>
          </div>
        </div>
        <div class="comment-body">
          <div class="goods">
            <div class="goods-thumb" @click="linkTo(`/goodsDetail?goodsId=${item.goodsId}&skuId=${item.skuId}`)">
              <img
                :src="item.goodsImage"
                loading="lazy"
                decoding="async"
                alt=""
                @error="$event.target.style.visibility = 'hidden'"
              />
            </div>
            <div class="goods-name" @click="linkTo(`/goodsDetail?goodsId=${item.goodsId}&skuId=${item.skuId}`)">
              {{ item.goodsName }}
            </div>
          </div>
          <div class="comment-cell">{{ item.grade === 'GOOD' ? '好评' : item.grade === 'WORSE' ? '差评' : '中评' }}</div>
          <div class="comment-content">{{ item.content }}</div>
          <div class="comment-ops">
            <button type="button" class="text-link" @click="evaluateDetail(item.id)">评价详情</button>
          </div>
        </div>
      </div>
      <el-skeleton v-if="loading"></el-skeleton>
    </div>
    <!-- 分页 -->
    <div class="page-size">
      <el-pagination v-model:current-page="params.pageNumber" v-model:page-size="params.pageSize"
        :total="total" :page-sizes="[20, 50, 100]" @current-change="changePageNum"
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
        pageSize: 20
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
  margin-top: 16px;

  :deep(.el-pagination) {
    justify-content: flex-end;
  }
}

.comment-list {
  --comment-cols: minmax(220px, 1.3fr) 90px minmax(160px, 1.6fr) 96px;
  --comment-gap: 12px;
  padding-top: 8px;
}

.comment-cols,
.comment-body {
  display: grid;
  grid-template-columns: var(--comment-cols);
  column-gap: var(--comment-gap);
  align-items: start;
}

.comment-cols {
  padding: 0 16px 10px;
  color: #999;
  font-size: 13px;

  span:first-child {
    padding-left: 72px;
  }

  span:nth-child(n + 2) {
    text-align: center;
  }
}

.comment-card {
  margin-bottom: 12px;
  border: 1px solid #eee;
  border-radius: 8px;
  background: #fff;
  overflow: hidden;
}

.comment-head {
  padding: 10px 16px;
  background: #f7f7f7;
  border-bottom: 1px solid #f0f0f0;
}

.order-sn {
  color: #171A26;
  font-size: 14px;
  line-height: 22px;

  span {
    margin-left: 16px;
  }
}

.comment-body {
  padding: 14px 16px;
}

.goods {
  display: grid;
  grid-template-columns: 60px minmax(0, 1fr);
  column-gap: 12px;
  align-items: start;
  min-width: 0;
}

.goods-thumb {
  width: 60px;
  height: 60px;
  border: 1px solid #f0f0f0;
  overflow: hidden;
  background: #f5f5f5;
  cursor: pointer;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
  }
}

.goods-name {
  color: #333;
  font-size: 16px;
  line-height: 22px;
  max-height: 44px;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  overflow: hidden;
  word-break: break-all;
  cursor: pointer;

  &:hover {
    color: $theme_color;
  }
}

.comment-cell,
.comment-ops {
  text-align: center;
  color: #171A26;
  font-size: 14px;
  line-height: 22px;
}

.comment-content {
  min-width: 0;
  color: #666;
  font-size: 14px;
  line-height: 22px;
  white-space: pre-wrap;
  word-break: break-all;
}

.comment-ops {
  display: flex;
  justify-content: center;
}

.text-link {
  border: none;
  background: none;
  padding: 0;
  color: #171A26;
  font-family: inherit;
  font-size: 14px;
  line-height: 22px;
  cursor: pointer;

  &:hover {
    color: $theme_color;
  }
}
</style>
