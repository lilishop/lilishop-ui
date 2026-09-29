<template>
  <div class="wrapper">
    <UserCenterLayout>
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
        <div class="thumb">
          <img :src="item.thumbnail" :alt="item.goodsName" />
        </div>
        <p class="goods-name">{{ item.goodsName }}</p>
        <p class="goods-price">{{ $filters.unitPrice(item.price, "￥") }}</p>
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
        :page-sizes="[20, 50, 100]"
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
        pageSize: 20,
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
  margin: 0;
}

.track-list {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 16px;
  margin: 4px 0 0;
  padding: 0;
  list-style: none;

  li {
    display: flex;
    flex-direction: column;
    min-width: 0;
    border: 1px solid #f0f0f0;
    border-radius: 8px;
    overflow: hidden;
    background: #fff;
    position: relative;
    box-sizing: border-box;

    &:hover {
      cursor: pointer;
      box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);

      .del-icon {
        display: flex;
      }
    }
  }

  .thumb {
    width: 100%;
    aspect-ratio: 1;
    background: #f5f5f5;
    overflow: hidden;

    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      display: block;
    }
  }

  .goods-name {
    margin: 10px 12px 0;
    color: #333;
    font-size: 13px;
    line-height: 1.4;
    height: 36px;
    display: -webkit-box;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 2;
    overflow: hidden;
  }

  .goods-price {
    margin: 8px 12px 12px;
    color: $theme_color;
    font-size: 16px;
    font-weight: 600;
    line-height: 1.2;
  }

  .del-icon {
    display: none;
    align-items: center;
    justify-content: center;
    position: absolute;
    right: 8px;
    top: 8px;
    width: 28px;
    height: 28px;
    border-radius: 50%;
    background: rgba(0, 0, 0, 0.45);
    color: #fff;
    font-size: 14px;
    cursor: pointer;
  }
}
.page-size {
  margin: 15px 0px;
  display: flex;
  justify-content: flex-end;
  align-items: center;
}
</style>
