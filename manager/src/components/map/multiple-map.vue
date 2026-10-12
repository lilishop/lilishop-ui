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

<script setup>
import { onMounted, reactive, ref } from "vue";
import { aMapSwitch } from "@/config/index";
import mapping from "@/components/map/index.vue";
import * as API_Setup from "@/api/common.js";
import { Message } from "@/utils/message";

const emit = defineEmits(["callback"]);

const enableMap = ref(false);
const mapDefault = ref("select");
const data = reactive({
  province: [],
  city: [],
  area: [],
  street: [],
});
const chiosend = ref([]);

// 模板 ref，对应高德地图子组件
const map = ref(null);

onMounted(() => {
  chiosend.value = new Array(4).fill("");
});

function open() {
  enableMap.value = true;
  init({ id: 0 }, "province");
}
function changeMap(val) {
  mapDefault.value = val;
}
function init(val, level = "province", index) {
  if (level == 0) {
    chiosend.value.splice(3, 1, val);
  } else {
    API_Setup.getChildRegion(val.id).then((res) => {
      if (res.result.length && val.id !== 0) {
        chiosend.value[index] = val;
      } else if (!res.result.length) {
        chiosend.value[index] = val;
      }
      data[level] = res.result;
      if (level == "city") {
        data.area = [];
        data.street = [];
        chiosend.value.splice(1, 3, "", "", "");
      }
      if (level == "area") {
        data.street = [];
        chiosend.value.splice(2, 2, "", "");
      }
      if (level == "street") {
        chiosend.value.splice(3, 1, "");
      }
    });
  }
}
function getAddress(center) {
  emit("callback", {
    type: mapDefault.value,
    data: center,
  });
  enableMap.value = false;
}
function finished() {
  if (!chiosend.value[0]) {
    Message.error("请选择地址");
    return;
  }
  const params = chiosend.value.filter((item) => item !== "" && item.value !== "");
  enableMap.value = false;
  emit("callback", {
    type: mapDefault.value,
    data: params,
  });
}

// 父组件（member/index、memberRecycle、memberDetail、orderDetail、shopOperation）通过 ref 调用 open() 打开弹窗
defineExpose({ open });
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
