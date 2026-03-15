<template>
  <div class="wx-channel-category">
    <div class="toolbar">
      <i-switch v-model="forceRefresh" size="large">
        <span slot="open">强刷</span>
        <span slot="close">缓存</span>
      </i-switch>
      <Button
        type="primary"
        @click="loadThirdCategories"
        :loading="loading"
        style="margin-left: 10px"
        >刷新</Button
      >
    </div>
    <Table border :loading="loading" :columns="columns" :data="data"></Table>
  </div>
</template>

<script>
import { getWxChannelsThirdCategory } from "@/api/index";

export default {
  name: "WxChannelsCategoryTab",
  data() {
    return {
      forceRefresh: false,
      loading: false,
      data: [],
      columns: [
        { title: "一级类目", key: "firstCatName", minWidth: 150, tooltip: true },
        { title: "二级类目", key: "secondCatName", minWidth: 150, tooltip: true },
        { title: "三级类目", key: "thirdCatName", minWidth: 200, tooltip: true },
        { title: "三级类目ID", key: "thirdCatId", width: 120 },
        { title: "类目资质", key: "qualification", minWidth: 220, tooltip: true },
        {
          title: "类目资质类型",
          key: "qualificationType",
          width: 120,
          render: (h, params) => {
            const val = params.row.qualificationType;
            const map = { 0: "不需要", 1: "必填", 2: "选填" };
            return h(
              "Tag",
              { props: { color: val === 1 ? "red" : val === 2 ? "orange" : "green" } },
              map[val] || "-"
            );
          },
        },
        { title: "商品资质", key: "productQualification", minWidth: 220, tooltip: true },
        {
          title: "商品资质类型",
          key: "productQualificationType",
          width: 120,
          render: (h, params) => {
            const val = params.row.productQualificationType;
            const map = { 0: "不需要", 1: "必填", 2: "选填" };
            return h(
              "Tag",
              { props: { color: val === 1 ? "red" : val === 2 ? "orange" : "green" } },
              map[val] || "-"
            );
          },
        },
      ],
    };
  },
  mounted() {
    this.loadThirdCategories();
  },
  methods: {
    loadThirdCategories() {
      this.loading = true;
      getWxChannelsThirdCategory({ forceRefresh: !!this.forceRefresh })
        .then((res) => {
          if (res && res.success) {
            this.data = Array.isArray(res.result) ? res.result : [];
          }
        })
        .finally(() => {
          this.loading = false;
        });
    },
  },
};
</script>

<style scoped lang="scss">
.toolbar {
  display: flex;
  align-items: center;
  margin-bottom: 12px;
}
</style>
