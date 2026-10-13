<template>
  <div class="wrapper">
    <UserCenterLayout>

    <empty v-if="list.length === 0" />
    <div class="complain-list" v-else>
      <div class="complain-cols">
        <span>商品信息</span>
        <span>投诉状态</span>
        <span>投诉主题</span>
        <span>投诉内容</span>
        <span>操作</span>
      </div>
      <div class="complain-card" v-for="(item, index) in list" :key="item.id || index">
        <div class="complain-head">
          <div class="order-sn">
            {{ item.createTime }}<span>投诉单号 {{ item.id }}</span>
          </div>
        </div>
        <div class="complain-body">
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
          <div class="complain-cell">{{ statusLabel[item.complainStatus] || item.complainStatus }}</div>
          <div class="complain-topic">{{ item.complainTopic }}</div>
          <div class="complain-content">{{ item.content }}</div>
          <div class="complain-ops">
            <button type="button" class="text-link" @click="goDetail(item.id)">投诉详情</button>
            <button
              v-if="item.complainStatus === 'APPLYING' || item.complainStatus === 'NEW'"
              type="button"
              class="text-link"
              @click="cancel(item.id)"
            >取消投诉</button>
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
import { reactive, ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import { Message, Modal } from "@/utils/message";
import { complainList, clearComplain } from '@/api/member.js';

defineOptions({ name: 'ComplainList' });

const router = useRouter();

const loading = ref(false); // 加载状态
const list = ref([]); // 投诉列表
const statusLabel = { // 投诉状态
  NO_APPLY: '未申请',
  APPLYING: '申请中',
  COMPLETE: '已完成',
  EXPIRED: '已失效',
  CANCEL: '已取消',
  NEW: '新订单'
};
const total = ref(0); // 投诉总数
const params = reactive({ // 请求参数
  pageNumber: 1,
  pageSize: 20
});

function getList() { // 获取投诉列表
  complainList(params).then(res => {
    if (res.success) {
      list.value = res.result.records;
      total.value = res.result.total
    }
  })
}

function changePageNum(val) { // 改变页码
  params.pageNumber = val;
  getList()
}

function changePageSize(val) { // 改变页数
  params.pageNumber = 1;
  params.pageSize = val;
  getList()
}

function cancel(id) { // 取消投诉
  Modal.confirm({
    title: '取消投诉',
    content: '确定取消投诉吗？',
    onOk: () => {
      clearComplain(id).then((res) => {
        if (res.success) {
          Message.success('取消投诉成功');
          getList();
        }
      });
    },
    onCancel: () => { }
  });
}

function goDetail(id) { // 跳转投诉详情
  router.push({ path: '/home/complainDetail', query: { id } })
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

.complain-list {
  --complain-cols: minmax(220px, 1.3fr) 90px minmax(100px, 0.8fr) minmax(160px, 1.4fr) 96px;
  --complain-gap: 12px;
  padding-top: 8px;
}

.complain-cols,
.complain-body {
  display: grid;
  grid-template-columns: var(--complain-cols);
  column-gap: var(--complain-gap);
  align-items: start;
}

.complain-cols {
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

.complain-card {
  margin-bottom: 12px;
  border: 1px solid #eee;
  border-radius: 8px;
  background: #fff;
  overflow: hidden;
}

.complain-head {
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

.complain-body {
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

.complain-cell,
.complain-topic,
.complain-ops {
  color: #171A26;
  font-size: 14px;
  line-height: 22px;
}

.complain-cell,
.complain-ops {
  text-align: center;
}

.complain-topic,
.complain-content {
  min-width: 0;
  white-space: pre-wrap;
  word-break: break-all;
}

.complain-content {
  color: #666;
  font-size: 14px;
  line-height: 22px;
}

.complain-ops {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
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










