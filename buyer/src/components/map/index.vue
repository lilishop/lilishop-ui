<template>
  <div class="map">

    <div class="address">{{ addrContent.address }}</div>
    <div id="map-container"></div>

    <div class="search-con">
      <el-input placeholder="输入关键字搜索" id="input-map" v-model="mapSearch" />
      <ul>
        <li v-for="(tip, index) in tips" :key="index" @click="selectAddr(tip.location)">
          <p>{{ tip.name }}</p>
          <p>{{ tip.district + tip.address }}</p>
        </li>
      </ul>
    </div>
    <div class="footer">
      <el-button type="primary" :loading="loading" @click="ok">确定</el-button>
    </div>
  </div>
</template>
<script setup>
import { onMounted, ref, watch } from "vue";
import { Message } from "@/utils/message";
import AMapLoader from "@amap/amap-jsapi-loader";
import { handleRegion } from "@/api/address.js";
import config from "@/config/index";

defineOptions({ name: "map" });

const emit = defineEmits(["getAddress"]);

const showMap = ref(false); // 地图显隐
const mapSearch = ref(""); // 地图搜索
let map = null; // 初始化地图
let autoComplete = null; // 初始化搜索方法
let geocoder = null; // 初始化地理、坐标转化
let positionPicker = null; // 地图拖拽选点
const tips = ref([]); //搜索关键字列表
const addrContent = ref({}); // 回显地址信息
const loading = ref(false); // 加载状态

watch(mapSearch, function (val) {
  searchOfMap(val);
});

function ok() {

  if (addrContent.value && addrContent.value.regeocode) {
    const params = {
      cityCode: addrContent.value.regeocode.addressComponent.citycode,
      townName: addrContent.value.regeocode.addressComponent.township,
    };
    handleRegion(params).then((res) => {
      if (res.success) {
        addrContent.value.addr = res.result.name.replace(/,/g, " ");
        addrContent.value.addrId = res.result.id;
        loading.value = false;

        emit("getAddress", addrContent.value);
      }
    });
  } else {
    Message.error('未获取到坐标信息！请查看高德API配置是否正确')
  }

}

function init() {
  AMapLoader.load({
    key: config.aMapKey, // 申请好的Web端开发者Key，首次调用 load 时必填
    version: "", // 指定要加载的 JSAPI 的版本，缺省时默认为 1.4.15
    plugins: [
      "AMap.ToolBar",
      "AMap.Autocomplete",
      "AMap.PlaceSearch",
      "AMap.Geolocation",
      "AMap.Geocoder",
    ], // 需要使用的的插件列表，如比例尺'AMap.Scale'等
    AMapUI: {
      // 是否加载 AMapUI，缺省不加载
      version: "1.1", // AMapUI 缺省 1.1
      plugins: ["misc/PositionPicker"], // 需要加载的 AMapUI ui插件
    },
  })
    .then((AMap) => {
      map = new AMap.Map("map-container", {
        zoom: 12,
      });
      map.addControl(new AMap.ToolBar());
      map.addControl(new AMap.Autocomplete());
      map.addControl(new AMap.PlaceSearch());
      map.addControl(new AMap.Geocoder());

      // 实例化Autocomplete
      let autoOptions = {
        city: "全国",
      };
      autoComplete = new AMap.Autocomplete(autoOptions); // 搜索
      geocoder = new AMap.Geocoder(autoOptions);

      positionPicker = new AMapUI.PositionPicker({
        // 拖拽选点
        mode: "dragMap",
        map: map,
      });
      positionPicker.start();
      /**
       *
       * 所有回显数据，都在positionResult里面
       * 需要字段可以查找
       *
       */
      positionPicker.on("success", function (positionResult) {
        addrContent.value = positionResult;
      });
    })
    .catch((e) => {
      console.warn('地图组件加载失败', e);
    });
}

function searchOfMap(val) {
  // 地图搜索
  autoComplete.search(val, function (status, result) {
    // 搜索成功时，result即是对应的匹配数据
    if (status == "complete" && result.info == "OK") {
      tips.value = result.tips;
    } else {
      tips.value = [];
    }
  });
}

function selectAddr(location) {
  // 选择坐标
  if (!location) {
    Message.warning("请选择正确点位");
    return false;
  }
  const lnglat = [location.lng, location.lat];
  positionPicker.start(lnglat);
}

onMounted(() => {
  init();
});
</script>
<style lang="scss" scoped>
#map-container {
  width: 500px;
  height: 400px;
}

.search-con {
  position: absolute;
  right: 20px;
  top: 64px;
  width: 260px;

  ul {
    width: 260px;
    height: 360px;
    overflow: scroll;

    li {
      padding: 5px;

      p:nth-child(2) {
        color: #999;
        font-size: 12px;
      }

      &:hover {
        background-color: #eee;
        cursor: pointer;
      }
    }
  }
}

.address {
  margin-bottom: 10px;
  // color: $theme_color;
  font-weight: bold;
}

.footer {
  text-align: right;
  margin: 10px 0;
}
</style>
