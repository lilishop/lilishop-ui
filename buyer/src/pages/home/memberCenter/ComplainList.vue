<template>
  <div class="wrapper">
    <card _Title="我的投诉"  />

    <div class="order">
      <div class="order-title">
        <div class="order-row title">
          <div class="col-12">商品信息</div>
          <div class="col-4">投诉状态</div>
          <div class="col-4">投诉主题</div>
          <div class="col-4">投诉内容</div>
        </div>
      </div>
      <empty v-if="list.length === 0" />

      <div class="order-item" v-else v-for="(item, index) in list" :key="index">
        <div>
          <div class="title order-item-title">
            <span>投诉单号:{{item.id}}</span>
            <span class="color999 ml_10">{{item.createTime}}</span>
            <span class="hover-pointer fontsize_12 eval-detail" @click="goDetail(item.id)">投诉详情</span>
            <span class="hover-pointer fontsize_12 eval-detail" style="right: 90px" v-if="item.complainStatus === 'APPLYING' || item.complainStatus === 'NEW'" @click="cancel(item.id)">取消投诉</span>
          </div>
          <div class="order-item-view">
            <div class="col-12 item-view-name">
              <div class="order-img hover-color" @click="linkTo(`/goodsDetail?goodsId=${item.goodsId}&skuId=${item.skuId}`)">
                <img :src="item.goodsImage" alt="" />
              </div>
              <div class="order-name hover-color" @click="linkTo(`/goodsDetail?goodsId=${item.goodsId}&skuId=${item.skuId}`)">
                {{item.goodsName}}
              </div>
            </div>
            <div class="col-4">{{statusLabel[item.complainStatus]}}</div>
            <div class="col-4">
              <div class="content">{{item.complainTopic}}</div>
            </div>
            <div class="col-4">
              <el-tooltip>
                <div class="content">{{item.content}}</div>
                <template #content>
                  <div style="white-space: normal;">
                    {{item.content}}
                  </div>
                </template>
              </el-tooltip>
            </div>
          </div>
        </div>
      </div>
      <el-skeleton v-if="loading"></el-skeleton>
    </div>
    <!-- 分页 -->
    <div class="page-size">
      <el-pagination :total="total" @current-change="changePageNum"
        @size-change="changePageSize"
        :page-size="params.pageSize" layout="total, sizes, prev, pager, next"></el-pagination>
    </div>
  </div>
</template>

<script>
import {complainList, clearComplain} from '@/api/member.js';
export default {
  name: 'ComplainList',
  data () {
    return {
      loading: false, // 加载状态
      list: [], // 投诉列表
      statusLabel: { // 投诉状态
        NO_APPLY: '未申请',
        APPLYING: '申请中',
        COMPLETE: '已完成',
        EXPIRED: '已失效',
        CANCEL: '已取消',
        NEW: '新订单'
      },
      total: 0, // 投诉总数
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
    getList () { // 获取投诉列表
      complainList(this.params).then(res => {
        if (res.success) {
          const list = res.result.records;
          this.list = list;
          this.total = res.result.total
        }
      })
    },
    changePageNum (val) { // 改变页码
      this.params.pageNumber = val;
      this.getList()
    },
    changePageSize (val) { // 改变页数
      this.params.pageNumber = 1;
      this.params.pageSize = val;
      this.getList()
    },
    cancel (id) { // 取消投诉
      this.$Modal.confirm({
        title: '取消投诉',
        content: '<p>确定取消投诉吗？</p>',
        onOk: () => {
          clearComplain(id).then((res) => {
            if (res.success) {
              this.$Message.success('取消投诉成功');
              this.getList();
            }
          });
        },
        onCancel: () => { }
      });
    },
    goDetail (id) { // 跳转投诉详情
      this.$router.push({path: '/home/complainDetail', query: { id }})
    }
  }
};
</script>

<style scoped lang="scss">
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
  flex-wrap: nowrap;
  width: 100%;
  box-sizing: border-box;
  padding: 10px 20px;

  .col-12,
  .col-4 {
    box-sizing: border-box;
    padding: 0 8px;
  }

  .col-12 {
    flex: 0 0 50%;
    max-width: 50%;
  }

  .col-4 {
    flex: 0 0 16.666667%;
    max-width: 16.666667%;
  }
}

.order-item-view {
  align-items: flex-start;
}
.order-item {
  text-align: center;
  border: 1px solid $border_color;
  margin: 10px 0;
}
.order-row {
  text-align: center;
}
.content {
  color: #999;
  max-height: 60px;
  overflow: hidden;
  word-break: break-all;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 3;
}

.eval-detail {
  position: absolute;
  right: 20px;
  &:hover{
    color: $theme_color;
  }
}
.page-size{
  text-align: right;
}
</style>
