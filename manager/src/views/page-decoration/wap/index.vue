<template>
  <div class="wrapper">
    <!-- 拖拽栏 ，展示栏  -->
    <div class="model-view">
      <div class="model-view-menu">
        <draggable
          class="model-view-menu-item"
          :list="modelData"
          :item-key="getModelKey"
          :clone="cloneModel"
          :move="handleMove"
          :group="{ name: 'model', pull: 'clone', put: false, animation: 150 }"
          :sort="false"
          ghost-class="ghost"
        >
          <template #item="{ element: model }">
            <li
              v-if="!model.drawer && !model.drawerPromotions"
              class="model-item"
            >
              <img src alt />
              <span>{{ model.name }}</span>
            </li>
          </template>
        </draggable>
      </div>

      <div class="model-view-content">
        <div class="content">
          <div class="wap-title">首页</div>
          <draggable
            class="draggable"
            group="model"
            ghost-class="ghost"
            @add="handleContentlAdd"
            @end="handleContentlEnd"
            v-model="contentData.list"
            :item-key="getContentItemKey"
          >
            <template #item="{ element, index }">
              <div class="list">
                <component
                  class="component"
                  :class="{ active: selected == index }"
                  @click="handleComponent(element, index)"
                  :is="templates[element.type]"
                  :res="element.options"
                ></component>
                <el-icon
                  v-if="selected == index"
                  @click="closeComponent(index)"
                  class="close"
                  :size="25"
                  color="#e1251b"
                >
                  <CircleClose />
                </el-icon>
              </div>
            </template>
          </draggable>
        </div>
      </div>

      <!-- 右侧栏 -->
      <div class="model-config">
        <decorate
          @handleDrawer="handleDrawer"
          v-if="decorateData"
          :res="decorateData"
        ></decorate>
      </div>
    </div>
  </div>
</template>
<script>
import { CircleClose } from "@element-plus/icons-vue";
import templates from "./template/index";
import Draggable from "vuedraggable";
import { modelData } from "./config";
import decorate from "./decorate";
import * as API_Other from "@/api/other";
import * as API_Promotions from "@/api/promotion";
export default {
  components: {
    Draggable,
    decorate,
    CircleClose,
  },
  data() {
    return {
      templates, // 模板类型
      modelData, // 装修模型
      qrcode: "", // 二维码
      selected: 0, // 已选下标
      contentData: {
        // 总数据
        list: [],
      },
      decorateData: "", // 装修数据
      decoratePromotionsData: "", // 装修数据
    };
  },
  watch: {
    contentData: {
      handler(val) {
        this.$store.state.styleStore = val;
      },
      deep: true,
    },
  },
  mounted() {
    this.init();
  },

  methods: {
    getModelKey(model) {
      return model.type || model.name;
    },
    getContentItemKey(element) {
      return element.key || element.model || element.type;
    },
    cloneModel(model) {
      const key = Date.now() + "_" + Math.ceil(Math.random() * 99999);
      const cloned = JSON.parse(JSON.stringify(model));
      return {
        ...cloned,
        key,
        model: cloned.type + "_" + key,
      };
    },
    // 初始化数据
    init() {
      // 先读缓存，如果缓存有值则读缓存。
      const cache = this.getStore('managerMobilePageCache')
        if(cache){
          this.$Modal.confirm({
          title: '提示',
          content: '获取到本地有缓存数据，是否使用缓存数据？',
          okText: '使用',
          cancelText: '取消',
          onOk: () => {
            const data = JSON.parse(cache);
            this.contentData = data;
          }
        });

        }
      if (!this.$route.query.id) return false;

      API_Other.getHomeData(this.$route.query.id).then((res) => {
        this.contentData = JSON.parse(res.result.pageData);

        this.handleComponent(this.contentData.list[0], 0);
      });

    },

    // 中间组件拖动，右侧数据绑定不变
    handleContentlEnd(evt) {
      const { newIndex } = evt;
      this.handleComponent(this.contentData.list[newIndex], newIndex);
    },

    // 关闭楼层装修
    closeComponent(index) {
      this.$nextTick(() => {
        this.decorateData = "";

        // 如果当前楼层不为一
        if (this.contentData.list.length > 1) {
          // 如果当前最底层 给下一层赋值

          if (index - 1 == -1) {
            this.handleComponent(this.contentData.list[index], index);
          } else {
            // 如果不是最底层给上一层赋值
            this.handleComponent(this.contentData.list[index - 1], index - 1);
          }
          this.contentData.list.splice(index, 1);
        } else {
          this.contentData.list.splice(index, 1);
        }
      });
    },

    // 点击楼层装修
    handleComponent(val, index) {
      this.selected = index;
      this["decorateData"] = val;
    },
    // 右侧栏回调
    handleDrawer(val) {
      let newIndex = this.selected;
      if (val.promotionsType) {
        if (this.contentData.list[newIndex].options.list.length >= 2) {
          this.$Message.error("最多只能展示两个活动");
          return;
        }
        if (val.promotionsType === "LIVE") {
          API_Promotions.getLiveList({
            status: "START",
            pageSize: 1,
            pageNumber: 1,
          }).then((listRes) => {
            const records = listRes.result?.records || [];
            if (!listRes.success || records.length === 0) {
              this.$Message.warning("暂无进行中的直播活动");
              return;
            }
            API_Promotions.getLiveInfo(records[0].id).then((infoRes) => {
              if (infoRes.success) {
                this.contentData.list[newIndex].options.list.push({
                  type: val.promotionsType,
                  title: val.name,
                  title1: val.subName,
                  color1: val.subColor,
                  bk_color: val.subBkColor,
                  data: infoRes.result.commodityList
                    ? infoRes.result.commodityList.splice(0, 2)
                    : [],
                });
              }
            });
          });
        } else {
          API_Promotions.getAllPromotion().then((res) => {
            let exist = this.contentData.list[newIndex].options.list.find(
              (i) => i.type === val.promotionsType
            );

            if (res.success && !exist) {
              this.contentData.list[newIndex].options.list.push({
                data: res.result[val.promotionsType]
                  ? res.result[val.promotionsType].splice(0, 2)
                  : [],
                type: val.promotionsType,
                title1: val.subName,
                color1: val.subColor,
                bk_color: val.subBkColor,
                title: val.name,
              });
            }
          });
        }
        this.contentData.list[newIndex] = {
          ...val,
          options: {
            ...this.contentData.list[newIndex].options,
          },
          model: val.type,
        };
      } else {
        this.decorateData = "";

        this.contentData.list[newIndex] = {
          ...val,
          options: {
            ...val.options,
          },
          model: val.type,
        };
        this.contentData.list = JSON.parse(
          JSON.stringify(this.contentData.list)
        );
        this["decorateData"] = this.contentData.list[newIndex];
      }
    },

    // 封装拖拽参数
    package(val, newIndex) {
      this.contentData.list[newIndex] = "";
      val = JSON.parse(JSON.stringify(val));
      const key = val.key || Date.now() + "_" + Math.ceil(Math.random() * 99999);
      this.contentData.list[newIndex] = {
        ...val,
        options: {
          ...val.options,
        },
        key,
        model: val.model || val.type + "_" + key,
      };
    },
    // 拖动
    handleContentlAdd(evt) {
      const { newIndex } = evt;

      this.package(this.contentData.list[newIndex], newIndex);
      this.handleComponent(this.contentData.list[newIndex], newIndex);
    },
    handleMove() {
      return true;
    },
  },
};
</script>
<style scoped lang="scss">
@import "./style.scss";
</style>
