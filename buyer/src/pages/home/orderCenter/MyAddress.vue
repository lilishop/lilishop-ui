<template>
  <div class="wrapper">
    <UserCenterLayout title="收货地址" :tabs="['收货地址']" more-text="添加新地址" more-to="/home/addAddress">
      <template #extra>
        <el-button type="primary" @click="add">添加新地址</el-button>
      </template>
      <div class="address-box" v-for="(item, index) in list" :key="index">
        <div class="address-header">
          <span>
            {{ item.name }}
            <el-tag class="ml_10 default-address-tag" v-if="item.isDefault">默认地址</el-tag>
            <el-tag class="ml_10" v-if="item.alias" color="warning">{{item.alias}}</el-tag>
          </span>
          <div class="address-action">
            <span @click="edit(item.id)"><el-icon><Edit /></el-icon>修改</span>
            <span @click="del(item.id)"><el-icon><Delete /></el-icon>删除</span>
          </div>
        </div>
        <div class="address-content">
          <p>
            <span class="address-content-title"> 收 货 人 :</span> {{ item.name }}
          </p>
          <p>
            <span class="address-content-title">收货地区:</span>{{ $filters.unitAddress(item.consigneeAddressPath) }}
          </p>
          <p>
            <span class="address-content-title">详细地址:</span> {{ item.detail }}
          </p>
          <p>
            <span class="address-content-title">手机号码:</span> {{ item.mobile }}
          </p>
        </div>
      </div>
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
  padding: 15px;
  margin: 0;
  border-bottom: 1px solid $border_color;

  &:last-child {
    border-bottom: 0;
  }
}

.address-header {
  cursor: pointer;
  height: 35px;
  display: flex;
  justify-content: space-between;
  @include title_color($light_title_color);
  font-size: 18px;
}

.address-content {
  cursor: pointer;
  font-size: 14px;

  > p {
    padding: 12px 0;
  }
}

.address-content-title {
 
}

.address-action {
  display: flex;
  align-items: center;
  gap: 15px;

  span {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    font-size: 14px;
    color: $theme_color;
    cursor: pointer;

    .el-icon {
      font-size: 14px;
    }
  }
}

.default-address-tag {
  background-color: #fff3f2 !important;
  border: 1px solid $theme_color !important;
  color: $theme_color !important;
}

#map-container {
  width: 500px;
  height: 300px;
}
</style>
