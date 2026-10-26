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
            <el-button link type="primary" @click="evaluateDetail(item.id)">评价详情</el-button>
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

<script setup>
import { reactive, ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { evolutionList } from '@/api/order.js';

defineOptions({ name: 'CommentList' });

const router = useRouter();

const commentWay = ref([`待评价`, `待追评`, `已评价`]); // 评价分类
const loading = ref(false); // 加载状态
const list = ref([]); // 评价列表
const total = ref(0); // 评价总数
const params = reactive({ // 请求参数
  pageNumber: 1,
  pageSize: 20
});

function getList () { // 获取评价列表
  evolutionList(params).then(res => {
    if (res.success) {
      const records = res.result.records;
      records.forEach(element => {
        element.descriptionScore = Number(element.descriptionScore)
      });
      list.value = records;
      total.value = res.result.total
    }
  })
}

function changePageNum (val) { // 修改页码
  params.pageNumber = val;
  getList()
}

function changePageSize (val) { // 修改页数
  params.pageNumber = 1;
  params.pageSize = val;
  getList()
}

function evaluateDetail (id) { // 跳转评价详情
  router.push({path: '/home/evalDetail', query: { id }})
}

onMounted(() => {
  getList()
});
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
</style>
