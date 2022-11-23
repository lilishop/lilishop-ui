<template>
  <div class="decorate">
    <div class="decorate-title">
      {{ res.name }}
      <Button
        style="margin-left: 20px"
        size="small"
        ghost
        v-if="res.type == 'tpl_ad_list' || res.type == 'tpl_activity_list' || res.drawer"
        type="primary"
        @click="selectStyle()"
        >选择风格</Button
      >
    </div>

    <!-- 右侧显示抽屉 -->
    <Drawer title="选择风格" :closable="false" width="400" v-model="styleFlag">
      <div class="drawer">
        <div
          class="drawer-item"
          @click="clickDrawer(item, index)"
          v-for="(item, index) in modelData"
          :key="index"
          v-if="item.drawer"
        >
          <img src alt />
          <span>{{ item.name }}</span>
        </div>
      </div>
    </Drawer>

    <!-- 卡片集合 -->
    <div
      class="decorate-list"
      v-if="(res.type != 'tpl_ad_list' && res.type != 'tpl_activity_list') || res.drawer"
    >
      <div class="decorate-item" v-for="(item, index) in res.options.list" :key="index">
        <div class="decorate-item-title">
          <div>卡片</div>
          <Icon
            @click="closeDecorate(index)"
            v-if="res.close"
            size="20"
            color="#e1251b"
            type="md-close-circle"
          />
        </div>

        <div class="decorate-item-box">
          <div
            class="decorate-border"
            v-if="item.titleWay"
            v-for="(title_item, title_index) in item.titleWay"
            :key="title_index"
          >
            <div class="decorate-view">
              <div class="decorate-view-title">标题{{ title_index + 1 }}</div>
              <div>
                <Input v-model="title_item.title" />
              </div>
            </div>
            <div class="decorate-view">
              <div class="decorate-view-title">描述</div>
              <div>
                <Input v-model="title_item.desc" />
              </div>
            </div>
            <div class="decorate-view">
              <div class="decorate-view-title">绑定商品</div>
              <div
                class="decorate-view-link"
                v-if="res.options.list[0].listWay.length != 0"
              >
                <!-- 绑定商品选择器回调已选择的商品 -->
                <div
                  v-if="
                    title_item.___index == bindGoods.___index ||
                    title_item.title == bindGoods.type
                  "
                  v-for="(bindGoods, bindGoodsIndex) in res.options.list[0].listWay"
                  :key="bindGoodsIndex"
                >
                  {{ bindGoods.title }},
                </div>
              </div>
              <div>
                <Button @click="bindGoodsId(title_item)" size="small" ghost type="primary"
                  >选择商品</Button
                >
              </div>
            </div>
          </div>
          <!-- 选择照片 -->
          <div class="decorate-view" v-if="!res.notImg">
            <div class="decorate-view-title">选择照片</div>
            <div>
              <img class="show-image" :src="item.img" alt />

              <div class="tips">
                建议尺寸
                <span>{{ item.size }}</span>
              </div>
            </div>
            <div class="selectBtn">
              <Button
                size="small"
                @click="handleClickFile(item, index)"
                ghost
                type="primary"
                >选择照片</Button
              >
            </div>
          </div>
          <!-- 填写标题 -->
          <div class="decorate-view" v-if="item.title != void 0 && !res.notTitle">
            <div class="decorate-view-title">菜单标题</div>
            <div>
              <Input v-model="item.title" style="width: 200px" />
            </div>
          </div>
          <!-- 填写链接 -->
          <div class="decorate-view" v-if="!res.notLink">
            <div class="decorate-view-title">选择链接</div>
            <div v-if="item.url.length != 0" class="decorate-view-link">
              已选链接：

              <span>
                {{
                  ways.find((e) => {
                    return item.url.___type == e.name;
                  }).title
                }}
                -
                <!-- 当选择完链接之后的商品名称 -->
                <span v-if="item.url.___type == 'goods'"> {{ item.url.goodsName }}</span>
                <!-- 当选择完链接之后的分类回调 -->
                <span v-if="item.url.___type == 'category'"> {{ item.url.name }}</span>
                <!-- 当选择完链接之后的店铺回调 -->
                <span v-if="item.url.___type == 'shops'"> {{ item.url.memberName }}</span>
                <!-- 当选择完链接之后的其他回调 -->
                <span v-if="item.url.___type == 'other'"> {{ item.url.title }}</span>
                <!-- 当选择完活动之后的其他回调 -->
                <span v-if="item.url.___type == 'marketing'">
                  <span v-if="item.url.___promotion == 'SECKILL'"> 秒杀 </span>
                  <span v-if="item.url.___promotion == 'FULL_DISCOUNT'"> 满减 </span>
                  <span v-if="item.url.___promotion == 'PINTUAN'"> 拼团 </span>
                  {{ item.url.title || item.url.goodsName }}
                </span>
                <!-- 当选择完活动之后的其他回调 -->
                <span v-if="item.url.___type == 'pages'"> {{ item.url.title }}</span>
              </span>
            </div>
            <div>
              <Button ghost size="small" type="primary" @click="clickLink(item, index)"
                >选择链接</Button
              >
            </div>
          </div>

        </div>
      </div>
    </div>

    <Button
      v-if="res.type != 'tpl_ad_list' && res.type != 'tpl_activity_list' && !res.notAdd"
      type="primary"
      @click="addDecorate()"
      ghost
      >添加</Button
    >

    <liliDialog
      ref="liliDialog"
      @selectedLink="selectedLink"
      @selectedGoodsData="selectedGoodsData"
    ></liliDialog>

    <Modal width="1200px" v-model="picModelFlag">
      <ossManage  @callback="callbackSelected" ref="ossManage" />
    </Modal>
  </div>
</template>
<script>
import ossManage from "@/views/sys/oss-manage/ossManage";
import { modelData } from "./config";
import ways from "@/views/lili-dialog/wap.js"; // 选择链接的类型
export default {
  components: {
    ossManage,
  },
  data() {
    return {
      ways, // 选择链接的类型
      picModelFlag: false, //图片选择器
      linkType: "goods", // dialog弹窗口类型
      styleFlag: false, //广告魔方开关
      selectedLinkIndex: "", //选择链接的索引
      modelData, // 装修数据
      selectedGoods: "", // 已选商品
      selectedLinks: "", // 已选链接
      modelList: "", // 装修列表
    };
  },
  watch: {
    res: {
      handler: (val) => {},
      deep: true,
    },
  },
  props: ["res"],
  methods: {
    // 选择风格
    selectStyle() {
      this.styleFlag = !this.styleFlag;
    },
    // 回调选择的链接
    selectedLink(val) {
      // 需删除图片中 intro 和 mobileIntro 可能存在转义符导致json出错问题
      delete val.selected;
      delete val.intro;
      delete val.mobileIntro;
      this.selectedLinks.url = val;
    },
    // 回调的商品信息
    selectedGoodsData(val) {
      if (!val) return false;
      let data = val.map((item) => {
        delete item.selected;
        delete item.intro;
        delete item.mobileIntro;
        return {
          img: item.thumbnail,
          title: item.goodsName,
          type: this.selectedGoods.title,
          ___index: this.selectedGoods.___index,
          ...item,
        };
      });

      this.res.options.list[0].listWay.push(...data);
      this.linkType = "";
    },
    // 绑定商品
    bindGoodsId(val) {
      this.selectedGoods = val;
      this.liliDialogFlag(true);
    },
    // 点击抽屉
    clickDrawer(item, index) {
      this.$emit("handleDrawer", item);
      this.styleFlag = false;
    },
    // 打开图片选择器
    liliDialogFlag(flag) {
      this.$refs.liliDialog.goodsFlag = flag;
      this.$refs.liliDialog.flag = true;
    },

    // 点击链接赋值一个唯一值，并将当前选择的模块赋值
    clickLink(val, index) {
      this.selectedLinks = val;
      this.liliDialogFlag(false);
    },
    //点击图片解析成base64
    changeFile(item, index) {
      const file = document.getElementById("files" + index).files[0];
      if (file == void 0) return false;
      const reader = new FileReader();
      reader.readAsDataURL(file);
      this.$nextTick((res) => {
        reader.onload = (e) => {
          item.img = e.target.result;
        };
      });
    },
    //添加设置
    addDecorate() {
      let way = {
        img: "https://picsum.photos/id/264/200/200",
        title: "标题",
        link: "",
        url: "",
        size: this.res.options.list[0]?.size,
      };
      this.res.options.list.push(way);
    },
    // 图片选择器回显
    callbackSelected(val) {
      this.picModelFlag = false;
      this.selectedGoods.img = val.url;
    },
    // 点击选择图片
    handleClickFile(item, index) {
      this.$refs.ossManage.selectImage = true;
      this.selectedGoods = item;
      this.picModelFlag = true;
    },
    // 关闭
    closeDecorate(index) {
      this.$nextTick(() => {
        this.res.options.list.splice(index, 1);
      });
    },
  },
};
</script>
<style scoped lang="scss">
@import "./decorate.scss";
</style>
