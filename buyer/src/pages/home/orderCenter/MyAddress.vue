<template>
  <div class="wrapper">
    <UserCenterLayout>
      <template #extra>
        <el-button type="primary" @click="add">添加新地址</el-button>
      </template>
      <div class="address-list" v-if="list.length">
        <div class="address-box" v-for="(item, index) in list" :key="index">
          <div class="address-header">
            <div class="address-title">
              <span class="address-name">{{ item.name }}</span>
              <span class="address-mobile">{{ item.mobile }}</span>
              <el-tag size="small" class="default-address-tag" v-if="item.isDefault">默认地址</el-tag>
              <el-tag size="small" class="alias-tag" v-if="item.alias">{{item.alias}}</el-tag>
            </div>
            <div class="address-action">
              <span @click="edit(item.id)"><el-icon><Edit /></el-icon>修改</span>
              <span class="del-btn" @click="del(item.id)"><el-icon><Delete /></el-icon>删除</span>
            </div>
          </div>
          <div class="address-content">
            <p>
              <span class="address-content-title">收货地区</span>
              <span>{{ $filters.unitAddress(item.consigneeAddressPath) }}</span>
            </p>
            <p>
              <span class="address-content-title">详细地址</span>
              <span>{{ item.detail }}</span>
            </p>
          </div>
        </div>
      </div>
      <el-empty v-else description="暂无收货地址" />
    </UserCenterLayout>
  </div>
</template>

<script>
import { Message, Modal } from "@/utils/message";
import { Delete, Edit } from '@element-plus/icons-vue';
import { memberAddress, delMemberAddress } from '@/api/address.js';

export default {
  components: { Delete, Edit },
  name: 'MyAddress',

  data () {
    return {
      list: [] // 地址列表
    };
  },
  methods: {
    add () {
      this.$router.push('/home/addAddress');
    },
    edit (id) {
      // 编辑地址
      this.$router.push({ path: '/home/addAddress', query: { id: id } });
    },
    del (id) {
      // 删除地址
      Modal.confirm({
        title: '提示',
        content: '你确定删除这个收货地址',
        onOk: () => {
          delMemberAddress(id).then((res) => {
            if (res.success) {
              Message.success('删除成功');
              this.getAddrList();
            }
          });
        },
        onCancel: () => {
          Message.info('取消删除');
        }
      });
    },
    getAddrList () {
      // 获取地址列表
      memberAddress().then((res) => {
        console.log(res);
        if (res.success) {
          this.list = res.result.records;
        }
      });
    }
  },
  mounted () {
    this.getAddrList();
  }
};
</script>

<style scoped lang="scss">
.wrapper {
  margin-bottom: 40px;
}

.address-box {
  margin-bottom: 16px;
  padding: 18px 20px;
  border: 1px solid #ebedf0;
  border-radius: 8px;
  background: #fff;
  transition: box-shadow 0.2s ease, border-color 0.2s ease;

  &:last-child {
    margin-bottom: 0;
  }

  &:hover {
    border-color: #dcdfe6;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.06);
  }
}

.address-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-bottom: 12px;
  border-bottom: 1px dashed #ebedf0;
}

.address-title {
  display: flex;
  align-items: center;
  min-width: 0;
}

.address-name {
  font-size: 16px;
  font-weight: 600;
  color: $light_title_color;
}

.address-mobile {
  margin-left: 14px;
  font-size: 14px;
  color: #909399;
}

.address-content {
  padding-top: 6px;
  font-size: 14px;
  color: #606266;

  > p {
    display: flex;
    padding: 6px 0;
    line-height: 22px;
  }
}

.address-content-title {
  flex-shrink: 0;
  width: 70px;
  color: #909399;
}

.address-action {
  display: flex;
  align-items: center;
  flex-shrink: 0;
  gap: 16px;
  margin-left: 16px;

  span {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    font-size: 13px;
    color: #909399;
    cursor: pointer;
    transition: color 0.2s ease;

    &:hover {
      color: $theme_color;
    }

    .el-icon {
      font-size: 14px;
    }
  }

  .del-btn:hover {
    color: #f56c6c;
  }
}

.default-address-tag {
  margin-left: 10px;
  background-color: #fff3f2 !important;
  border: 1px solid $theme_color !important;
  color: $theme_color !important;
}

.alias-tag {
  margin-left: 10px;
}

#map-container {
  width: 500px;
  height: 300px;
}
</style>
