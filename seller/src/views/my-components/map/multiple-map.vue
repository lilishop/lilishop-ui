<template>
  <el-dialog v-model="enableMap" width="800px" :show-close="true" destroy-on-close>
    <el-radio-group v-model="mapDefault" @change="changeMap">
      <el-radio-button value="select">级联选择</el-radio-button>
      <el-radio-button v-if="aMapSwitch" value="map">高德地图</el-radio-button>
    </el-radio-group>
    <div>
      <div v-if="mapDefault === 'select'">
        <div class="selector">
          <div
            v-for="(plant, plantIndex) in Object.keys(data)"
            :key="plantIndex"
            class="selector-item"
          >
            <div
              v-for="(item, index) in data[plant]"
              :key="index"
              :class="{ active: chiosend[plantIndex] && chiosend[plantIndex].id == item.id }"
              class="map-item"
              @click="
                init(
                  item,
                  plantIndex != Object.keys(data).length - 1
                    ? Object.keys(data)[plantIndex + 1]
                    : 0,
                  plantIndex
                )
              "
            >
              {{ item.name }}
            </div>
          </div>
        </div>
        <div class="footer">
          <el-button type="primary" @click="finished">确定</el-button>
        </div>
      </div>
      <mapping v-if="mapDefault === 'map'" ref="map" @getAddress="getAddress" />
    </div>
  </el-dialog>
</template>

<script>
import { aMapSwitch } from "@/config/index";
import mapping from "@/views/my-components/map/index.vue";
import * as API_Setup from "@/api/common.js";

export default {
  components: { mapping },
  data() {
    return {
      aMapSwitch,
      enableMap: false,
      mapDefault: "select",
      data: {
        province: [],
        city: [],
        area: [],
        street: [],
      },
      chiosend: [],
    };
  },
  mounted() {
    this.chiosend = new Array(4).fill("");
  },
  methods: {
    open() {
      this.enableMap = true;
      this.init({ id: 0 }, "province");
    },
    changeMap(val) {
      this.mapDefault = val;
    },
    init(val, level = "province", index) {
      if (level == 0) {
        this.chiosend.splice(3, 1, val);
      } else {
        API_Setup.getChildRegion(val.id).then((res) => {
          if (res.result.length && val.id !== 0) {
            this.chiosend[index] = val;
          } else if (!res.result.length) {
            this.chiosend[index] = val;
          }
          this.data[level] = res.result;
          if (level == "city") {
            this.data.area = [];
            this.data.street = [];
            this.chiosend.splice(1, 3, "", "", "");
          }
          if (level == "area") {
            this.data.street = [];
            this.chiosend.splice(2, 2, "", "");
          }
          if (level == "street") {
            this.chiosend.splice(3, 1, "");
          }
        });
      }
    },
    getAddress(center) {
      this.$emit("callback", {
        type: this.mapDefault,
        data: center,
      });
      this.enableMap = false;
    },
    finished() {
      if (!this.chiosend[0]) {
        this.$Message.error("请选择地址");
        return;
      }
      const params = this.chiosend.filter((item) => item !== "" && item.value !== "");
      this.enableMap = false;
      this.$emit("callback", {
        type: this.mapDefault,
        data: params,
      });
    },
  },
};
</script>

<style lang="scss" scoped>
.selector {
  height: 400px;
  padding: 10px 0;
  display: flex;
}

.selector-item {
  width: 100%;
  flex: 1;
  overflow: auto;
}

.map-item {
  width: 100%;
  padding: 10px;
  border-bottom: 1px solid #eee;
  cursor: pointer;

  &:hover {
    background: #eee;
  }
}

.active {
  background: #eee;
}

.footer {
  text-align: right;
  margin: 10px 0;
}
</style>
