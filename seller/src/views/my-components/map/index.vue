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
<script>
import AMapLoader from "@amap/amap-jsapi-loader";
import { getRegion } from "@/api/common.js";
import config from "@/config/index";
export default {
  name: "map",
  data() {
    return {
      config,
      showMap: false,
      mapSearch: "",
      map: null,
      autoComplete: null,
      geocoder: null,
      positionPicker: null,
      tips: [],
      addrContent: {},
      loading: false,
    };
  },
  watch: {
    mapSearch(val) {
      this.searchOfMap(val);
    },
  },
  methods: {
    ok() {
      if (this.addrContent && this.addrContent.regeocode) {
        const params = {
          cityCode: this.addrContent.regeocode.addressComponent.citycode,
          townName: this.addrContent.regeocode.addressComponent.township,
        };
        getRegion(params).then((res) => {
          if (res.success) {
            this.addrContent.addr = res.result.name.replace(/,/g, " ");
            this.addrContent.addrId = res.result.id;
            this.loading = false;
            this.$emit("getAddress", this.addrContent);
          }
        });
      } else {
        this.$Message.error("未获取到坐标信息！请查看高德API配置是否正确");
      }
    },
    init() {
      AMapLoader.load({
        key: this.config.aMapKey,
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
          let that = this;
          this.map = new AMap.Map("map-container", {
            zoom: 12,
          });
          that.map.addControl(new AMap.ToolBar());
          that.map.addControl(new AMap.Autocomplete());
          that.map.addControl(new AMap.PlaceSearch());
          that.map.addControl(new AMap.Geocoder());

          let autoOptions = {
            city: "全国",
          };
          that.autoComplete = new AMap.Autocomplete(autoOptions);
          that.geocoder = new AMap.Geocoder(autoOptions);

          that.positionPicker = new AMapUI.PositionPicker({
            mode: "dragMap",
            map: that.map,
          });
          that.positionPicker.start();
          that.positionPicker.on("success", function (positionResult) {
            that.addrContent = positionResult;
          });
        })
        .catch(() => {});
    },
    searchOfMap(val) {
      let that = this;
      this.autoComplete.search(val, function (status, result) {
        if (status == "complete" && result.info == "OK") {
          that.tips = result.tips;
        } else {
          that.tips = [];
        }
      });
    },
    selectAddr(location) {
      if (!location) {
        this.$Message.warning("请选择正确点位");
        return false;
      }
      const lnglat = [location.lng, location.lat];
      this.positionPicker.start(lnglat);
    },
  },
  mounted() {
    this.init();
  },
};
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
