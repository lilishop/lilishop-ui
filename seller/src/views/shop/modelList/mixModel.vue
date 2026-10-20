<template>
  <div class="mix-model">
    <!-- 左侧 -->
    <div class="left-card">
      <left :data="data" />
      <div class="setup-box">
        <div>
          <el-button size="small" @click.stop="handleSelectModel('left')"
            >编辑
          </el-button>
        </div>
      </div>
    </div>
    <!-- 右侧 -->
    <div class="right-card">
      <right :data="data" />
      <div class="setup-box">
        <div>
          <el-button size="small" @click.stop="handleSelectModel('right')"
            >编辑
          </el-button>
        </div>
      </div>
    </div>
    <el-dialog
      v-model="showModal"
      title="装修"
      
      width="800"
      
      :close-on-click-modal="false"
     append-to-body destroy-on-close>
      <div v-if="current">
        <div class="modal-tab-bar">
          <div>
            当前模块 :
            <el-button-group>
              <el-button :type="current.model == 'goods' ? 'primary' : 'default'"
                >商品</el-button
              >
              <el-button :type="current.model == 'brand' ? 'primary' : 'default'"
                >品牌</el-button
              >
            </el-button-group>
          </div>

          <div class="flex">
            <div>图片 :</div>
            <div>
              <img class="image" :src="current.data.image.src" alt="" />
              <div>
                <div>推荐尺寸：{{ current.data.image.size }}</div>
                <div class="link-src">
                  链接地址：
                  <el-input
                    style="width: 200px"
                    v-model="current.data.image.url"
                    disabled
                  />
                </div>
                <el-button
                  size="small"
                  type="primary"
                  @click="handleSelectImg('default')"
                  >选择图片
                </el-button>
                <el-button
                  size="small"
                  class="ml_10"
                  type="primary"
                  @click="handleSelectLink('image')"
                  >选择链接
                </el-button>
              </div>
            </div>
          </div>
          <div class="flex" v-if="current.model == 'goods'">
            <div>标签 :</div>
            <el-input
              style="width: 200px"
              type="text"
              v-model="current.data.badge.label"
            />
            <el-input
              style="width: 100px; margin-left: 10px"
              disabled
              type="text"
              v-model="current.data.badge.url"
            />
            <el-button
              size="small"
              class="ml_10"
              type="primary"
              @click="handleSelectLink('badge')"
              >选择链接
            </el-button>
          </div>
          <div class="flex column-list">
            <div
              v-for="(item, index) in current.data.list"
              :key="index"
              class="draggable"
            >
              <div class="flex">
                <img alt="楼层图片" :src="item.img" class="column-img" />
                <el-button
                  size="small"
                  class="ml_10"
                  type="primary"
                  v-if="current.model == 'goods'"
                  @click="handleSelectGoods('list', index)"
                  >选择商品
                </el-button>
                <div>
                  <div  v-if="current.model == 'brand'" style="margin-bottom: 10px">
                    <el-input disabled v-model="item.url" />
                  </div>
                  <el-button
                    size="small"
                    class="ml_10"
                    type="primary"
                    v-if="current.model == 'brand'"
                    @click="handleSelectLink('list', index)"
                  >
                    选择链接
                  </el-button>
                  <el-button
                    size="small"
                    class="ml_10"
                    type="primary"
                    v-if="current.model == 'brand'"
                    @click="handleSelectImg('list', index)"
                    >选择图片
                  </el-button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </el-dialog>

    <!-- 选择商品。链接 -->
    <liliDialog
      ref="liliDialog"
      @selectedLink="selectedLink"
      @selectedGoodsData="selectedGoodsData"
    ></liliDialog>

    <!-- 选择图片 -->
    <el-dialog v-model="picModelFlag" width="1200px" append-to-body destroy-on-close>
      <ossManage
        @callback="callbackSelected"
        :is-component="true"
        :initialize="picModelFlag"
        :max-select="1"
        ref="ossManageRef"
      />
    </el-dialog>
  </div>
</template>

<script setup>
import { getCurrentInstance, nextTick, ref } from "vue";
import left from "./mixs/mix-goods";
import right from "./mixs/mix-brand";
import ossManage from "@/views/sys/oss-manage/ossManage.vue";
import { formatLinkType } from "@/utils/filters";

defineOptions({ name: "mixModel" });

const props = defineProps({
  data: {
    type: Object,
    default: () => ({}),
  },
});

const { proxy } = getCurrentInstance();

const showModal = ref(false);
const current = ref(""); //当前选择的模块
const picModelFlag = ref(false);
const selectedData = ref(""); //选中的数据
const goodsIndex = ref(0); // 商品索引
const align = ref("");
const defaultCallbackImageType = ref("");

const liliDialog = ref(null);
// ossManageRef：模板 ref 与组件 import 同名，改名避免互相覆盖
const ossManageRef = ref(null);

function handleSelectImg(type, index) {
  defaultCallbackImageType.value = type;
  goodsIndex.value = index;
  // 选择图片
  picModelFlag.value = true;
  nextTick(() => {
    if (ossManageRef.value) {
      ossManageRef.value.selectImage = true;
    }
  });
}

function handleSelectGoods(val, index) {
  liliDialog.value.open("goods");
  liliDialog.value.singleGoods();
  selectedData.value = val;
  goodsIndex.value = index;
}
function handleSelectLink(val, index) {
  // 调起选择链接弹窗
  liliDialog.value.open("link");
  selectedData.value = val;
  goodsIndex.value = index;
}
// 回显图片
function callbackSelected(val) {
  picModelFlag.value = false;
  if (defaultCallbackImageType.value == "default") {
    current.value.data.image.src = val.url;
  } else {
    props.data.options[align.value].data.list[goodsIndex.value].img = val.url;

    // props.data.options[align.value].data[selectedData.value][goodsIndex.value].url = val.img
  }
}
// 选择商品回调
function selectedGoodsData(val) {
  nextTick(() => {
    props.data.options[align.value].data.list[goodsIndex.value].img =
      val[0].thumbnail;
    props.data.options[align.value].data.list[goodsIndex.value].title =
      val[0].goodsName;
    props.data.options[align.value].data.list[goodsIndex.value].price =
      val[0].price;
    props.data.options[align.value].data.list[goodsIndex.value].url =
      val[0].url;
  });
  proxy.$forceUpdate();
}
// 选择链接回调
function selectedLink(val) {
  if (selectedData.value != "list") {
    props.data.options[align.value].data[selectedData.value].url = formatLinkType(val);
  }
  if (selectedData.value == "list") {
     props.data.options[align.value].data[selectedData.value][goodsIndex.value]
    .url = formatLinkType(val);
  }
}
/*
 * 点击不同模块进行编辑
 * 判断也很简单，就是第一个第二个模块进行判断
 *
 * */
function handleSelectModel(alignVal) {
  align.value = alignVal;
  current.value = props.data.options[alignVal];
  showModal.value = true;
}
</script>

<style scoped lang="scss">
@import "./setup-box.scss";

.link-src {
  margin: 10px 0;
}

.mix-model {
  display: flex;
  justify-content: space-between;
}

.left-card,
.right-card {
  width: 584px;
  height: 344px;
  border-radius: 10px;
  opacity: 1;
  background: #ffffff;
  box-shadow: 0px 1px 13px 0px #e5e5e5;
  position: relative;

  &:hover {
    .setup-box {
      display: block;
    }
  }
}

.column-img {
  width: 100px;
  height: 100px;
}

.column-list {
  flex-wrap: wrap;

  > div {
    width: 50%;
  }
}

.image {
  max-width: 100px;
}

.modal-tab-bar {
  > .flex {
    align-items: center;
    margin: 10px 0;
  }
}

.draggable {
  > .flex {
    align-items: center;
  }
}
</style>
