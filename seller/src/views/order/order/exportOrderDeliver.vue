<template>
  <el-card>
    <div class="step-list">
      <div
        v-for="(item, index) in stepList"
        :key="index"
        class="step-item"
        :class="{ active: item.checked }"
        @click="handleCheckStep(item)"
      >
        <img class="img" :src="item.img" alt="" />
        <div>
          <h2>{{ item.title }}</h2>
        </div>
      </div>
    </div>

    <div v-for="(item, index) in stepList" :key="'step-' + index">
      <div v-if="item.checked && index === 0" class="tpl">
        <el-button @click="downLoad">下载导入模板</el-button>
      </div>
      <div v-if="item.checked && index === 1" class="tpl">
        <el-upload
          drag
          name="files"
          style="width: 50%; height: 400px"
          accept="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
          :action="action"
          :headers="accessToken"
          :before-upload="handleUpload"
          :show-file-list="false"
        >
          <el-icon :size="102" style="color: #3399ff"><UploadFilled /></el-icon>
          <h2>选择或拖拽文件上传</h2>
        </el-upload>
      </div>
      <div v-if="item.checked && index === 2" class="tpl success">
        <h1>发货完成</h1>
        <div>
          <el-button class="btn" @click="close">关闭页面</el-button>
          <el-button class="btn" type="primary" @click="navigationToGoodsOrder">商品订单</el-button>
        </div>
      </div>
    </div>
  </el-card>
</template>

<script>
import { UploadFilled } from "@element-plus/icons-vue";
import { downLoadDeliverExcel, uploadDeliverExcel } from "@/api/order.js";
import { baseUrl } from "@/libs/axios.js";
import downloadImg from "@/assets/download.png";
import uploadImg from "@/assets/upload.png";
import successImg from "@/assets/success.png";

export default {
  components: { UploadFilled },
  data() {
    return {
      file: "",
      action: baseUrl + "/order/order/batchDeliver",
      accessToken: {},
      stepList: [
        {
          img: downloadImg,
          title: "1.下载批量发货导入模板",
          checked: true,
        },
        {
          img: uploadImg,
          title: "2.上传数据",
          checked: false,
        },
        {
          img: successImg,
          title: "3.完成",
          checked: false,
        },
      ],
    };
  },
  mounted() {
    this.accessToken.accessToken = this.getStore("accessToken");
  },
  methods: {
    handleCheckStep(val) {
      if (val.title.search("3") === -1) {
        this.stepList.forEach((item) => {
          item.checked = false;
        });
        val.checked = true;
      }
    },
    handleUpload(file) {
      this.file = file;
      this.upload();
      return false;
    },
    navigationToGoodsOrder() {
      this.$router.push({ path: "/order/orderList" });
    },
    close() {
      this.$store.commit("removeTag", "export-order-deliver");
      localStorage.storeOpenedList = JSON.stringify(this.$store.state.app.storeOpenedList);
      this.$router.go(-1);
    },
    async upload() {
      const fd = new FormData();
      fd.append("files", this.file);
      const res = await uploadDeliverExcel(fd);
      if (res.success) {
        this.stepList.forEach((item) => {
          item.checked = false;
        });
        this.stepList[2].checked = true;
      }
    },
    downLoad() {
      downLoadDeliverExcel()
        .then((res) => {
          const blob = new Blob([res], {
            type: "application/vnd.ms-excel;charset=utf-8",
          });
          if ("download" in document.createElement("a")) {
            const link = document.createElement("a");
            link.download = "批量发货导入模板.xls";
            link.style.display = "none";
            link.href = URL.createObjectURL(blob);
            document.body.appendChild(link);
            link.click();
            URL.revokeObjectURL(link.href);
            document.body.removeChild(link);
          } else {
            navigator.msSaveBlob(blob, "批量发货导入模板.xls");
          }
        })
        .catch((err) => {
          console.log(err);
        });
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
.success {
  align-items: center;
  flex-direction: column;
  > h1 {
    font-size: 28px;
    margin: 10px;
  }
  :deep(.btn) {
    margin: 10px;
  }
}
</style>
