<template>
  <el-dialog width="800" v-model="enableMap">
    <el-radio-group v-if="aMapSwitch" @change="changeMap" v-model="mapDefault">
      <el-radio label="select">地区选择</el-radio>
      <el-radio label="map">高德地图</el-radio>
    </el-radio-group>
    <div>
      <div v-if="mapDefault === 'select'">
        <div class="selector">
          <div class="selector-item" v-for="(plant, plantIndex) in Object.keys(data)" :key="plantIndex">
            <div :class="{ 'active': chiosend[plantIndex].id == item.id }" v-for="(item, index) in data[plant]"
              :key="index"
              @click="init(item, plantIndex != Object.keys(data).length - 1 ? Object.keys(data)[plantIndex + 1] : 0, plantIndex)"
              class="map-item">
              {{ item.name }}
            </div>
          </div>

        </div>
        <div class="footer">
          <el-button type="primary" @click="finished">确定</el-button>
        </div>
      </div>
      <mapping v-if="mapDefault === 'map'" ref="map" @getAddress="getAddress" />

    </div></el-dialog>
</template>

<script setup>
import { onMounted, reactive, ref } from "vue";
import { Message } from "@/utils/message";
import { aMapSwitch } from '@/config/index'
import mapping from "@/components/map/index.vue";
import * as API_Setup from "@/api/common.js";

const emit = defineEmits(['callback'])

const enableMap = ref(false)
const mapDefault = ref("select")
const data = reactive({
  province: [], //省
  city: [], //市
  area: [], //区
  street: [], //街道
})
const chiosend = ref([])

onMounted(() => {
  chiosend.value = new Array(4).fill("");
})

function open() {
  enableMap.value = true
  init({ id: 0 }, 'province');
}

defineExpose({ open })

function changeMap(val) {
  mapDefault.value = val
}

function init(val, level = 'province', index) {
  if (level == 0) {
    // 说明选择到了街道，将街道id存入数组
    chiosend.value.splice(3, 1, val);
  }
  else {
    API_Setup.getRegion(val.id).then((res) => {
      if (res.result.length && val.id !== 0) {
        chiosend.value[index] = val
      }
      else if (!res.result.length) {
        chiosend.value[index] = val
      }
      data[level] = res.result;
      if (level == 'city') {
        data.area = []
        data.street = []
        chiosend.value.splice(1, 3, "", "", "");
      }
      if (level == 'area') {
        data.street = []
        chiosend.value.splice(2, 2, "", "");
      }
      if (level == 'street') {
        chiosend.value.splice(3, 1, "");
      }
    });
  }
}

function getAddress(center) {
  emit('callback', {
    type: mapDefault.value,
    data: center
  })
  enableMap.value = false;
}

// 选择完成
function finished() {
  if (!chiosend.value[0]) {
    Message.error("请选择地址")
    return
  }
  const params = chiosend.value.filter((item) => item !== "" && item.value !== "");
  enableMap.value = false;
  emit('callback', {
    type: mapDefault.value,
    data: params
  })
}
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
