<template>
  <div class="model-view">
    <div class="model-view-content">
      <div class="content">
        <div class="wap-title">首页</div>
        <div class="draggable">
          <!-- 全屏 -->
          <div class="full-shadow" v-if="type == 'full'">
            <img :src="advertising[0].img" alt="" />
          </div>

        </div>
      </div>
    </div>
    <div class="model-config">
      <div class="decorate">
        <div class="decorate-title">全屏广告</div>
        <div class="decorate-list">
          <div
            class="decorate-item"
            v-for="(item, index) in advertising"
            :key="index"
          >
            <div class="decorate-item-title">
              <div>设置</div>
            </div>
            <div class="decorate-item-box">
              <!-- 选择照片 -->
              <div class="decorate-view">
                <div class="decorate-view-title">选择图片</div>
                <div>
                  <img class="show-image" :src="item.img" alt />
                  <input
                    type="file"
                    class="hidden-input"
                    @change="changeFile(item, index)"
                    ref="files"
                    :id="'files' + index"
                  />
                  <div class="tips">
                    建议尺寸
                    <span>{{ item.size }}</span>
                  </div>
                </div>
                <div class="selectBtn">
                  <el-button
                    size="small"
                    @click="handleClickFile(item, index)"
                    plain
                    type="primary"
                    >选择照片</el-button
                  >
                </div>
              </div>

              <!-- 选择连接 -->
              <div class="decorate-view">
                <div class="decorate-view-title">选择图片</div>
                <div>
                  <el-button
                    plain
                    type="primary"
                    size="small"
                    @click="clickLink(item)"
                    >选择链接</el-button
                  >
                </div>
              </div>

              <div class="decorate-view">
                <div class="decorate-view-title">当前页面状态</div>
                <div>
                  <el-tag :type="result.pageShow === 'OPEN' ? 'success' : 'danger'">
                    {{ result.pageShow === "OPEN" ? "开启" : "关闭" }}
                  </el-tag>
                </div>
              </div>
            </div>
          </div>
        </div>
        <!-- <el-button type="primary" @click="addDecorate()" ghost>添加</el-button> -->
        <liliDialog ref="liliDialog"    @selectedLink="selectedLink" :types="linkType"></liliDialog>
      </div>
      <el-dialog v-model="picModelFlag" width="1200px" append-to-body destroy-on-close>
         <ossManage @callback="callbackSelected" :is-component="true" :initialize="picModelFlag" ref="ossManageRef" />
      </el-dialog>
    </div>
  </div>
</template>
<script setup>
import { ref, reactive, watch, onMounted, nextTick } from "vue";
import { useRoute } from "vue-router";
import ossManage from "@/views/sys/oss-manage/ossManage";
import * as API_Other from "@/api/other.js";
import { useAppStore } from "@/stores/app";

const route = useRoute();
const appStore = useAppStore();

const result = ref("");
const picModelFlag = ref(false); //图片选择器
const type = ref("full"); // 是否全屏

//全屏广告
const advertising = ref([
  {
    img:
      "https://st-gdx.dancf.com/gaodingx/0/uxms/design/20200903-182035-5e87.png?x-oss-process=image/resize,w_932/interlace,1,image/format,webp",
    size: "750*1624",
  },
]);
const selectedLinks = reactive({});
const linkType = ref(""); // 选择类型

const liliDialog = ref(null);
const ossManageRef = ref(null);

watch(
  advertising,
  (val) => {
    appStore.openStyleStore = val;
  },
  { deep: true }
);

onMounted(() => {
  openPage();
});

function openPage() {
  const alertType = route.query.pagetype;
  const pageType = {
    INDEX: "INDEX",
    ALERT: "OPEN_SCREEN_PAGE",
    OPEN_SCREEN_ANIMATION: "OPEN_SCREEN_ANIMATION",
  }[alertType ? alertType : "INDEX"];

  API_Other.getOpenHomeData(pageType).then((res) => {
    appStore.openStoreId = res.result.id;
    if (res.result.pageData) {
      advertising.value = [JSON.parse(res.result.pageData)];
    }
    result.value = res.result
  });
}
// 点击链接
function clickLink(item) {
  liliDialog.value.open('link')
}
// 回调选择的链接
function selectedLink(val) {
  selectedLinks.url = val;

  advertising.value[0].config = val;
}
// 点击选择照片
function handleClickFile() {
  picModelFlag.value = true;
  nextTick(() => {
    if (ossManageRef.value) {
      ossManageRef.value.selectImage = true;
    }
  });
} // 图片选择器回显
function callbackSelected(val) {
  picModelFlag.value = false;
  if (!val?.url) return;
  advertising.value[0].img = val.url;
}
</script>
<style scoped lang="scss">
@import "./style.scss";
@import "./decorate.scss";
.decorate-radio {
  margin: 10px 0;
}
.window-shadow,
.full-shadow {
  display: flex;
  position: absolute;
  top: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.2);
  left: 0;
  align-items: center;
  justify-content: center;
}
.window-shadow {
  > img {
    width: 306px;
    height: 418px;
  }
}
.full-shadow {
  > img {
    width: 100%;
    height: 100%;
  }
}
.draggable {
  position: relative;
}

.btn-item {
  > img {
    margin: 4px 0;
    border-radius: 50%;
    width: 30px;
    height: 30px;
  }
}
</style>
