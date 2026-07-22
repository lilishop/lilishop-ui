<template>
  <div class="wrapper">
    <UserCenterLayout title="我的足迹" :tabs="['我的足迹']">
      <template #extra>
        <el-button class="del-btn" @click="clearAll" type="primary">删除全部</el-button>
      </template>
    <!-- 订单列表 -->
    <empty v-if="list.length === 0" />
    <ul class="track-list" v-else>
      <li
        v-for="(item, index) in list"
        :key="index"
        @click="goodsDetail(item.id, item.goodsId)"
      >
        <img :src="item.thumbnail" :alt="item.goodsName" />
        <p class="ellipsis">{{ item.goodsName }}</p>
        <p>{{ $filters.unitPrice(item.price, "￥") }}</p>
        <span class="del-icon" @click.stop="clearById(item.goodsId)">
          <el-icon><Delete /></el-icon>
        </span>
      </li>
    </ul>
    <!-- 分页 -->
    <div class="page-size">
      <el-pagination
        v-model:current-page="params.pageNumber"
        v-model:page-size="params.pageSize"
        :total="total"
        :page-sizes="[10, 20, 30, 40, 50, 100]"
        layout="sizes, prev, pager, next, jumper"
        @current-change="changePageNum"
        @size-change="changePageSize"
      />
    </div>
    </UserCenterLayout>
  </div>
</template>

<script>
import { Message, Modal } from "@/utils/message";
import { Delete } from '@element-plus/icons-vue';
import { tracksList, clearTracks, clearTracksById } from "@/api/member";
export default {
  components: { Delete },
  name: "MyTrack",
  data() {
    return {
      list: [], // 我的足迹，商品列表
      spinShow: false, // 控制loading是否加载
      params: {
        pageNumber: 1,
        pageSize: 10,
        order: "desc",
        sort: "updateTime",
      },
      total: 0,
    };
  },
  mounted() {
    this.getList();
  },
  methods: {
    goodsDetail(skuId, goodsId) {
      // 跳转商品详情
      let routeUrl = this.$router.resolve({
        path: "/goodsDetail",
        query: { skuId, goodsId },
      });
      window.open(routeUrl.href, "_blank");
    },
    // 跳转店铺首页
    shopPage(id) {
      let routeUrl = this.$router.resolve({
        path: "/merchant",
        query: { id: id },
      });
      window.open(routeUrl.href, "_blank");
    },
    clearAll() {
      // 清除全部足迹
      Modal.confirm({
        title: "删除",
        content: "<p>确定要删除全部足迹吗？</p>",
        onOk: () => {
          clearTracks().then((res) => {
            if (res.success) {
              Message.success("删除成功");
              this.getList();
            }
          });
        },
        onCancel: () => {},
      });
    },
    clearById(id) {
      // 清除全部足迹
      clearTracksById(id).then((res) => {
        if (res.success) {
          Message.success("删除成功");
          this.getList();
        }
      });
    },
    changePageNum(val) {
      // 修改页码
      this.params.pageNumber = val;
      this.getList();
    },
    changePageSize(val) {
      // 修改页数
      this.params.pageNumber = 1;
      this.params.pageSize = val;
      this.getList();
    },
    getList() {
      // 获取足迹列表
      this.spinShow = true;
      tracksList(this.params).then((res) => {
        this.spinShow = false;
        if (res.success && res.result.records.length) {
          this.list = res.result.records.filter(item =>{
            return item != null
          });
          this.total = res.result.total
        } else {
          this.list = [];
        }
      });
    },
  },
};
</script>
<style scoped lang="scss">
.wrapper {
  margin-bottom: 40px;
}
.del-btn {
  margin: 0 0 10px 15px;
}

.track-list {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
  padding: 0 15px;
  box-sizing: border-box;

  li {
    width: 100%;
    min-width: 0;
    overflow: hidden;
    border: 1px solid #eee;
    position: relative;
    box-sizing: border-box;

    img {
      width: 100%;
      aspect-ratio: 1;
      object-fit: cover;
      display: block;
    }

    &:hover {
      cursor: pointer;
      box-shadow: 1px 1px 3px #999;
      .del-icon {
        display: block;
      }
    }
    p {
      padding: 0 5px;
      margin: 3px 0;
    }
    p:nth-child(2) {
      color: #999;
    }
    p:nth-child(3) {
      color: $theme_color;
    }
    .del-icon {
      display: none;
      font-size: 30px;
      background-color: rgba(0, 0, 0, 0.3);
      position: absolute;
      width: 40px;
      height: 40px;
      line-height: 40px;
      text-align: center;
      right: 0;
      top: 0;
      cursor: pointer;
    }
  }
}
.page-size {
  margin: 15px 0px;
  display: flex;
  justify-content: flex-end;
  align-items: center;
}
</style>
