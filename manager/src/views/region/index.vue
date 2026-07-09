<template>
  <el-card>
    <div class="operation mb_10">
      <el-button type="primary" :loading="asyncLoading" @click="handleAsyncRegion">
        同步数据
      </el-button>
    </div>

    <el-table
      v-loading="loading"
      :data="tableData"
      row-key="id"
      border
      lazy
      :load="loadChildren"
      :tree-props="{ children: 'children', hasChildren: 'hasChildren' }"
      style="width: 100%"
    >
      <el-table-column prop="name" label="地区名称" min-width="200" />
      <el-table-column label="级别" width="100">
        <template #default="{ row }">
          <span v-if="row">{{ levelMap[row.level] || row.level }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="adCode" label="区域编码" min-width="120" />
      <el-table-column label="城市代码" min-width="120">
        <template #default="{ row }">
          <span v-if="row">{{ row.cityCode && row.cityCode !== "null" ? row.cityCode : "" }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="center" label="经纬度" min-width="140" show-overflow-tooltip />
      <el-table-column prop="orderNum" label="排序" width="80" />
    </el-table>
  </el-card>
</template>

<script>
import { ElMessage } from "element-plus";
import { getChildRegion, asyncRegion } from "@/api/index";

export default {
  data() {
    return {
      loading: false,
      asyncLoading: false,
      num: 10,
      tableData: [],
      levelMap: {
        country: "国家",
        province: "省份",
        city: "市",
        district: "区县",
        street: "街道",
      },
    };
  },
  mounted() {
    this.loadRoot();
  },
  methods: {
    isLeafRegion(child, parentName = "") {
      return (
        child.level === "street" ||
        child.name === "台湾省" ||
        parentName === "香港特别行政区" ||
        parentName === "澳门特别行政区"
      );
    },
    mapRegionRow(child, parentName = "") {
      return {
        ...child,
        cityCode: child.cityCode === "null" ? "" : child.cityCode,
        hasChildren: !this.isLeafRegion(child, parentName),
      };
    },
    loadRoot() {
      this.loading = true;
      getChildRegion(0)
        .then((res) => {
          this.tableData = (res.result || []).map((item) => this.mapRegionRow(item));
        })
        .finally(() => {
          this.loading = false;
        });
    },
    loadChildren(row, _treeNode, resolve) {
      getChildRegion(row.id).then((res) => {
        if (!res.result?.length) {
          resolve([]);
          return;
        }
        resolve(res.result.map((child) => this.mapRegionRow(child, row.name)));
      });
    },
    handleAsyncRegion() {
      this.num = 10;
      this.$Modal.confirm({
        title: "确定更新？",
        content: "更新后店铺以及用户地区绑定数据将全部错乱",
        onOk: () => {
          this.asyncLoading = true;
          let messageInstance = null;
          const showCountdown = () => {
            if (messageInstance) messageInstance.close();
            messageInstance = ElMessage.info({
              message: `地区数据将在 ${this.num} 秒后更新`,
              duration: 0,
              showClose: true,
            });
          };
          showCountdown();
          const number = setInterval(() => {
            this.num--;
            showCountdown();
          }, 1000);
          setTimeout(() => {
            clearInterval(number);
            if (messageInstance) messageInstance.close();
            ElMessage.closeAll();
            asyncRegion().then(() => {
              this.asyncLoading = false;
              this.$Message.success("地区数据正在更新中！");
              this.loadRoot();
            });
          }, 10000);
        },
      });
    },
  },
};
</script>

<style scoped lang="scss">
.operation {
  margin-bottom: 12px;
}
</style>
