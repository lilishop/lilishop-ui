<template>
  <div style="width: 362px;">
    <div class="base">
      <div>
        <img :src="storeInfo.storeLogo" class="image" />
      </div>
      <div style="margin-left: 13px">
        <div class="div-zoom">
          <span class="title_left_name"> 店铺名称：</span> <span class="title_right_name">{{ storeInfo.storeName }}</span>
          <el-tag style="margin-left: 10px;" type="danger" v-if="storeInfo.selfOperated" size="mini">自营</el-tag>
        </div>
        <div>
          <span class="title_left_name"> 联系方式:</span> <span class="title_right_name">{{ storeInfo.memberName }}</span>
        </div>
        <div>
          <el-button class="store-button" type="danger" @click="linkToStore(storeInfo.id)" size="mini"
            plain>进入店铺</el-button>
        </div>
      </div>
    </div>
    <hr class="separate" />

    <div class="separate">店铺评分: <el-rate v-model="storeInfo.serviceScore" disabled show-score text-color="#ff9900"
        score-template="{value}">
      </el-rate></div>
    <div class="separate">服务评分: <el-rate v-model="storeInfo.descriptionScore" disabled show-score text-color="#ff9900"
        score-template="{value}">
      </el-rate></div>
    <div class="separate">物流评分: <el-rate v-model="storeInfo.deliveryScore" disabled show-score text-color="#ff9900"
        score-template="{value}">
      </el-rate></div>
  </div>
</template>

<script>
import { Tag, button, rate } from 'element-ui'
export default {
  data () {
    return {
      value: null,
      colors: ['#99A9BF', '#F7BA2A', '#FF9900']
    }
  },
  components: {
    "el-tag": Tag,
    "el-button": button,
    "el-rate": rate
  },
  methods: {
  },
  props: {
    storeInfo: {
      type: Object,
      default: null,
    },
  },
}

</script>

<style scoped lang="less">
.title_left_name {
  font-size: 12px;
  color: #a1a6af;
}

.title_right_name {
  font-size: 12px;
  color: #343036;
}

.store-button {
  background-color: white;
  border-color: #F56C6C;
}

.base {
  margin-top: 5px;
  height: 120px;
  display: flex;

  div {
    margin-top: 8px;
  }

  .image {
    height: 100px;
    margin-top: 3px;
    width: 100px
  }

}

.separate {
  margin-top: 8px;
  // display: inline;
  display: flex;
  font-size: 12px;
  color: #a1a6af;
}
</style>