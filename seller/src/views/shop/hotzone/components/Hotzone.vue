<template>
  <div class="hotzone-box">
    <div class="hotzone-item">
      <div ref="content" class="hz-m-wrap">
        <img class="hz-u-img" :src="image" />
        <ul class="hz-m-area" v-add-item>
          <zone
            class="hz-m-item"
            v-for="(zone, index) in zones"
            :key="index"
            :index="index"
            :setting="zone"
            :ref="`zone${index}`"
            @delItem="removeItem($event)"
            @changeInfo="changeInfo($event)"
          ></zone>
        </ul>
      </div>
    </div>
    <div>
      <div class="hotzone-add-box-body">
        <div
          v-for="(zone, index) in zones"
          :key="index"
          class="hotzone-box-item-main"
        >
          <div class="hotzone-box-item wes-2">
            <div>{{ index + 1 }}</div>
            <div @click="editZone(index)">
              <div class="hotzone-box-item-text">
                {{ showZoneText(zone) }}
              </div>
            </div>
            <div class="flex">
              <div class="hotzone-btn" @click="editZone(index)">修改</div>
              &nbsp;&nbsp;&nbsp;&nbsp;
              <div class="hotzone-btn" @click="delZone(index)">删除</div>
            </div>
          </div>
        </div>
      </div>
      <div class="hotzone-add-box-footer" @click="addHotzone">
        <svg
          viewBox="64 64 896 896"
          focusable="false"
          class=""
          data-icon="plus"
          width="1em"
          height="1em"
          fill="currentColor"
          aria-hidden="true"
        >
          <path
            d="M482 152h60q8 0 8 8v704q0 8-8 8h-60q-8 0-8-8V160q0-8 8-8z"
          ></path>
          <path
            d="M176 474h672q8 0 8 8v60q0 8-8 8H176q-8 0-8-8v-60q0-8 8-8z"
          ></path>
        </svg>
        <div class="hotzone-add-box-text">添加热区</div>
      </div>
    </div>
  </div>
</template>

<script>
import Zone from "./Zone";
import addItem from "../directives/addItem";

export default {
  name: "HotZone",
  data() {
    return {
      zones: [],
    };
  },
  props: {
    image: {
      type: String,
      required: true,
    },
    zonesInit: {
      type: Array,
      default: () => [],
    },
    max: {
      type: Number,
    },
  },
  mounted() {
    this.zones = this.zonesInit.concat();
  },
  methods: {
    async addHotzone() {
      let perInfo = {
        topPer: 0.15,
        leftPer: 0.3,
        widthPer: 0.2,
        heightPer: 0.2,
        img: "",
        link: "",
        type: "",
        title: "",
      };
      let images = await this.getImageSize(this.image);
      if (images) {
        if (images.height >= 1000) {
          perInfo.heightPer = this.convertNumberToDecimal(images.height) / (images.height / 1000);
        } else {
          perInfo.heightPer = this.convertNumberToDecimal(images.height);
        }
        perInfo.widthPer = this.convertNumberToDecimal(images.width) / 2;
      }
      this.addItem(perInfo);
    },
    convertNumberToDecimal(num) {
      if (num >= 10000) {
        return num / 100000;
      } else if (num >= 1000) {
        return num / 10000;
      } else if (num >= 100) {
        return num / 1000;
      } else if (num >= 10) {
        return num / 100;
      }
    },
    getImageSize(url) {
      return new Promise(function (resolve, reject) {
        let image = new Image();
        image.onload = function () {
          resolve({
            width: image.width,
            height: image.height,
          });
        };
        image.onerror = function () {
          reject(new Error("error"));
        };
        image.src = url;
      });
    },
    editZone(index) {
      this.$refs[`zone${index}`][0].showModalFn(index);
    },
    delZone(index) {
      this.$refs[`zone${index}`][0].delItem(index);
    },
    showZoneText(zone) {
      switch (zone.type) {
        case "goods":
          return `商品：${zone.goodsName}`;
        case "category":
          return `分类：${zone.name}`;
        case "shops":
          return `店铺：${zone.storeName}`;
        case "pages":
          return `文章：${zone.title}`;
        case "marketing":
          return `促销活动商品：${zone.goodsName}`;
        case "other":
          return `${zone.title}`;
        default:
          return "请选择跳转链接";
      }
    },
    changeInfo(res) {
      let { info, index, zoneInfo } = res;
      info = { ...zoneInfo, ...info };
      // 改变热区并发送change通知
      Object.assign(this.zones[index], info);
      this.hasChange("changeInfo");
      this.$forceUpdate();
    },
    addItem(setting) {
      this.zones.push(setting);
      this.$emit("choose");
      // this.hasChange()  不应该发送通知，mouseup判定成功才应该发
      // this.$emit('add', setting)
    },
    eraseItem(index = this.zones.length - 1) {
      this.zones.splice(index, 1);
      this.$emit("erase", index);
    },
    isOverRange() {
      let { max, zones } = this;

      return max && zones.length > max;
    },
    overRange() {
      const index = this.zones.length - 1;

      this.zones.splice(index, 1);
      this.$emit("overRange", index);
    },
    removeItem(index = this.zones.length - 1) {
      this.zones.splice(index, 1);
      this.hasChange("removeItem");
      this.$emit("remove", index);
    },
    changeItem(info, isAdd) {
      const index = this.zones.length - 1;
      // 改变热区并发送change通知
      Object.assign(this.zones[index], info);
      this.hasChange("changeItem");
      isAdd && this.$emit("add", this.zones[index]);
    },
    hasChange(from) {
      this.$emit("change", this.zones);
    },
  },
  directives: {
    addItem,
  },
  components: {
    Zone,
  },
};
</script>

<style scoped lang="scss">
@import "../assets/styles/main.css";
.hotzone-box {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 468px;
  > div {
    margin: 6px;
    padding: 12px;
    border-radius: 10px;
    height: 100%;
  }
  > div:nth-of-type(1) {
    // display: flex;
    width: 50%;
    overflow: auto;
    // justify-content: center;
    background: #ededed;
  }
  > div:nth-of-type(2) {
    width: 50%;
    background: #f7f7f7;
  }
}

.hotzone-add-box-body {
  height: 90%;
  overflow-y: auto;
}

.hotzone-box-item-main {
  margin-top: 10px;
  margin-bottom: 20px;
}

.hotzone-box-item {
  align-items: center;
  display: flex;
  border-bottom: 1px solid #ededed;
  font-size: 12px;
  justify-content: space-between;
  padding: 5px 10px 0;
  width: 100%;
}

.hotzone-add-box-footer {
  align-items: center;
  background: #fff;
  border: none;
  border-radius: 5px;
  color: #ff5c58;
  display: flex;
  height: 40px;
  justify-content: center;
  margin-top: 10px;
  cursor: pointer;
}

.hotzone-btn {
  cursor: pointer;
}

.hotzone-box-item-text {
  width: 200px;
  cursor: pointer;
}

.hotzone-add-box-text {
  font-size: 12px;
  line-height: 20px;
  margin: 0 0 0 4px;
}
</style>
