<template>
  <div class="map">
    <div class="address">{{ addrContent.address }}</div>
    <div id="map-container"></div>

    <div class="search-con">
      <el-input id="input-map" v-model="mapSearch" placeholder="输入关键字搜索" clearable />
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
import AMapLoader from "@amap/amap-jsapi-loader";
import { getRegion } from "@/api/common.js";
import config from "@/config/index";
import { Message } from "@/utils/message";

defineOptions({ name: "map" });

const emit = defineEmits(["getAddress"]);

const mapSearch = ref("");
const map = ref(null);
const autoComplete = ref(null);
const geocoder = ref(null);
const positionPicker = ref(null);
const tips = ref([]);
const addrContent = ref({});
const loading = ref(false);

watch(mapSearch, (val) => {
  searchOfMap(val);
});

function ok() {
  if (addrContent.value && addrContent.value.regeocode) {
    const params = {
      cityCode: addrContent.value.regeocode.addressComponent.citycode,
      townName: addrContent.value.regeocode.addressComponent.township,
    };
    getRegion(params).then((res) => {
      if (res.success) {
        addrContent.value.addr = res.result.name.replace(/,/g, " ");
        addrContent.value.addrId = res.result.id;
        loading.value = false;
        emit("getAddress", addrContent.value);
      }
    });
  } else {
    Message.error("未获取到坐标信息！请查看高德API配置是否正确");
  }
}
function init() {
  AMapLoader.load({
    key: config.aMapKey,
    version: "",
    plugins: [
      "AMap.ToolBar",
      "AMap.Autocomplete",
      "AMap.PlaceSearch",
      "AMap.Geolocation",
      "AMap.Geocoder",
    ],
    AMapUI: {
      version: "1.1",
      plugins: ["misc/PositionPicker"],
    },
  })
    .then((AMap) => {
      map.value = new AMap.Map("map-container", {
        zoom: 12,
      });
      map.value.addControl(new AMap.ToolBar());
      map.value.addControl(new AMap.Autocomplete());
      map.value.addControl(new AMap.PlaceSearch());
      map.value.addControl(new AMap.Geocoder());

      let autoOptions = {
        city: "全国",
      };
      autoComplete.value = new AMap.Autocomplete(autoOptions);
      geocoder.value = new AMap.Geocoder(autoOptions);

      positionPicker.value = new AMapUI.PositionPicker({
        mode: "dragMap",
        map: map.value,
      });
      positionPicker.value.start();
      positionPicker.value.on("success", function (positionResult) {
        addrContent.value = positionResult;
      });
    })
    .catch(() => {});
}
function searchOfMap(val) {
  autoComplete.value.search(val, function (status, result) {
    if (status == "complete" && result.info == "OK") {
      tips.value = result.tips;
    } else {
      tips.value = [];
    }
  });
}
function selectAddr(location) {
  if (!location) {
    Message.warning("请选择正确点位");
    return false;
  }
  const lnglat = [location.lng, location.lat];
  positionPicker.value.start(lnglat);
}

onMounted(() => {
  init();
});

// 唯一引用方 multiple-map.vue 通过 ref 引用本组件但从不访问任何成员（仅监听 getAddress 事件），无需暴露成员
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
  font-weight: bold;
}

.footer {
  text-align: right;
  margin: 10px 0;
}
</style>
