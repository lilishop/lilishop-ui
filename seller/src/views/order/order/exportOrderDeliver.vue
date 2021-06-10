<template>
  <Card>
    <div class="step-list">
      <div class="step-item" @click="handleCheckStep(item)" :class="{'active':item.checked}" v-for="(item,index) in stepList" :key="index">
        <img class="img" :src="item.img" alt="">
        <div>
          <h2>{{item.title}}</h2>
        </div>
      </div>
    </div>

    <div v-for="(item,index) in stepList" :key="index">
      <!-- 下载 -->
      <div v-if="item.checked && index ==0" class="tpl">

        <Button @click="downLoad">下载导入模板</Button>
      </div>
      <!-- 上传 -->
      <div v-if="item.checked && index ==1" class="tpl">
        <Upload style="width:50%; height:400px;" accept="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel" multiple type="drag"
          action="//jsonplaceholder.typicode.com/posts/">
          <div style="padding: 50px 0">
            <Icon type="ios-cloud-upload" size="102" style="color: #3399ff"></Icon>
            <h2>选择或拖拽文件上传</h2>
          </div>
        </Upload>
      </div>
      <!-- 上传 -->
      <div v-if="item.checked && index ==2" class="tpl">
        <h1>发货完成</h1>

        <div>
          <Button>关闭页面</Button>
        </div>
      </div>

    </div>

  </Card>
</template>

<script>
import { downLoadDeliverExcel } from "@/api/order.js";
export default {
  data() {
    return {
      // 步骤集合
      stepList: [
        {
          img: require("@/assets/download.png"),
          title: "1.下载批量发货导入模板",
          checked: true,
        },
        {
          img: require("@/assets/upload.png"),
          title: "2.上传数据",
          checked: false,
        },
        {
          img: require("@/assets/success.png"),
          title: "3.完成",
          checked: false,
        },
      ],
    };
  },
  mounted() {},
  methods: {
    // 点击选择步骤
    handleCheckStep(val) {
      this.stepList.map((item) => {
        item.checked = false;
      });
      val.checked = true;
    },

    async downLoad() {
      let res = await downLoadDeliverExcel({ orderIds: "1402886442132217857" });
      console.log(res);
    },
  },
};
</script>

<style lang="scss" scoped>
.step-list {
  width: 80%;
  min-width: 500px;
  max-width: 1160px;
  margin: 0 auto;
  display: flex;
  padding: 40px;
  justify-content: space-between;
}
h2 {
  text-align: center;
  margin: 10px 0;
}
.tpl {
  margin: 50px 0;
  display: flex;
  justify-content: center;
}
.active {
  background: #efefef;
  border-radius: 0.8em;
}
.step-item {
  width: 100%;
  padding: 0 20px;
  display: flex;
  align-items: center;
  flex-direction: column;
  justify-content: center;
  transition: 0.35s;
  cursor: pointer;
}
img {
  width: 100px;
  height: 100px;
}
</style>
