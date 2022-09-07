<template>
  <li
    v-drag-item
    :style="{
      top: zoneTop,
      left: zoneLeft,
      width: zoneWidth,
      height: zoneHeight,
    }"
  >
    <ul
      v-change-size
      class="hz-m-box"
      :class="{
        'hz-z-hidden': tooSmall,
        'hz-m-hoverbox': !hideZone,
      }"
    >
      <li class="hz-u-index" :title="`热区${index + 1}`">{{ index + 1 }}</li>
      
      <li
        title="删除该热区"
        v-show="!hideZone"
        class="hz-u-close hz-icon hz-icon-trash"
        @click.prevent.stop="delItem(index)"
        @mousedown.stop
        @mouseup.stop
        @mousemove.stop
      ></li>
      <li
        title="编辑该热区"
        v-show="!hideZone"
        class="hz-u-close hz-icon hz-icon-edit"
        @click.prevent.stop="showModalFn(index)"
        @mousedown.stop
        @mouseup.stop
        @mousemove.stop
      >
        <img width="17" height="17" src="../assets/styles/icons8-edit-64.png"></img>
      </li>
      <li class="hz-flex-img">
        <img class="hz-u-img" :src="zoneForm.img" />
      </li>
      <li class="hz-u-square hz-u-square-tl" data-pointer="dealTL"></li>
      <li class="hz-u-square hz-u-square-tc" data-pointer="dealTC"></li>
      <li class="hz-u-square hz-u-square-tr" data-pointer="dealTR"></li>
      <li class="hz-u-square hz-u-square-cl" data-pointer="dealCL"></li>
      <li class="hz-u-square hz-u-square-cr" data-pointer="dealCR"></li>
      <li class="hz-u-square hz-u-square-bl" data-pointer="dealBL"></li>
      <li class="hz-u-square hz-u-square-bc" data-pointer="dealBC"></li>
      <li class="hz-u-square hz-u-square-br" data-pointer="dealBR"></li>
    </ul>
   
    <Modal
      v-model="showModal"
      title="编辑热区"
      draggable
      scrollable
      :mask="false"
      ok-text="保存"
      @on-ok="saveZone"
      @on-cancel="cancelZone"
    >
      <div>
        <div class="hz-edit-img">
          <img class="show-image" :src="zoneForm.img" alt />
        </div>

        <Form :model="zoneForm" :label-width="80">
          <!-- <FormItem label="图片链接：">
            <Input v-model="zoneForm.img"></Input>
            <Button size="small" type="primary" @click="handleSelectImg"
              >选择图片</Button
            >
            :v-model="zoneForm.type === 'goods' ? zoneForm.goodsName : zoneForm.link"
          </FormItem> -->
          <FormItem label="跳转链接：">
            <Input type="textarea" v-if="zoneForm.type === 'other' && zoneForm.title === '外部链接'" v-model="zoneForm.link" ></Input>
            <Button size="small" type="primary" @click="handleSelectLink"
              >选择链接</Button
            >
          </FormItem>
        </Form>
      </div>
    </Modal>
    <!-- 选择商品。链接 -->
    <liliDialog ref="liliDialog" @selectedLink="selectedLink"></liliDialog>
    <!-- 选择图片 -->
    <Modal width="1200px" v-model="picModelFlag" footer-hide>
      <ossManage
        @callback="callbackSelected"
        :isComponent="true"
        ref="ossManage"
      />
    </Modal>
  </li>
</template>

<script>
import changeSize from "../directives/changeSize";
import dragItem from "../directives/dragItem";
import ossManage from "@/views/sys/oss-manage/ossManage";

export default {
  name: "Zone",
  components: {
    ossManage,
  },

  data() {
    return {
      zoneTop: "",
      zoneLeft: "",
      zoneWidth: "",
      zoneHeight: "",
      hideZone: false,
      tooSmall: false,
      showModal: false,
      picModelFlag: false,
      currentIndex: 0,
      currentShowIndex: -1,
      zoneForm: {
        img: "",
        link: "",
        type: "",
      },
    };
  },
  props: ["index", "setting"],
  mounted() {
    this.setZoneInfo(this.setting);
  },
  methods: {
    setZoneInfo(val) {
      this.zoneTop = this.getZoneStyle(val.topPer);
      this.zoneLeft = this.getZoneStyle(val.leftPer);
      this.zoneWidth = this.getZoneStyle(val.widthPer);
      this.zoneHeight = this.getZoneStyle(val.heightPer);
      this.tooSmall = val.widthPer < 0.01 && val.heightPer < 0.01;
      this.zoneForm.link = val.link;
      this.settingZone(val);
    },
    handlehideZone(isHide = true) {
      if (this.hideZone === isHide) {
        return;
      }

      this.hideZone = isHide;
    },
    changeInfo(info = {}) {
      const { index } = this;

      this.$emit("changeInfo", {
        info,
        index,
        zoneInfo: this.zoneForm,
      });
    },
    showModalFn(index) {
      this.showModal = true;
      this.currentIndex = index;
    },
    // 选择图片
    handleSelectImg() {
      this.$refs.ossManage.selectImage = true;
      this.picModelFlag = true;
    },
    // 选择图片回调
    callbackSelected(item) {
      this.picModelFlag = false;
      this.zoneForm.img = item.url;
    },

    // 调起选择链接弹窗
    handleSelectLink(item, index) {
      if (item) this.selectedNav = item;
      this.$refs.liliDialog.open("link");
    },
    // 已选链接
    selectedLink(val) {
      this.zoneForm.link = this.$options.filters.formatLinkType(val);
      this.settingZone(val);
      this.changeInfo(this.zoneForm);
    },
    settingZone(val) {
      this.zoneForm.type = val.___type || val.type;
      this.zoneForm.title = val.title;
      switch (val.___type) {
        case "goods":
          this.zoneForm.id = val.id;
          this.zoneForm.goodsId = val.goodsId;
          this.zoneForm.goodsName = val.goodsName;
          break;
        case "category":
          this.zoneForm.id = val.allId;
          this.zoneForm.name = val.name;
          break;
        case "shops":
          this.zoneForm.id = val.id;
          this.zoneForm.storeName = val.storeName;
          break;
        case "pages":
          this.zoneForm.id = val.id;
          this.zoneForm.___path = val.___path;
          this.zoneForm.title = val.title;
          break;
        case "marketing":
          this.zoneForm.id = val.id;
          this.zoneForm.goodsId = val.goodsId;
          this.zoneForm.goodsName = val.goodsName;
          break;
        default:
          break;
      }
    },
    saveZone() {},
    cancelZone() {
      this.showModal = false;
    },
    delZone() {
      this.delItem(this.currentIndex);
    },
    delItem(index) {
      this.$emit("delItem", index);
    },
    getZoneStyle(val) {
      return `${(val || 0) * 100}%`;
    },
  },

  watch: {
    setting: {
      handler: function (val) {
        this.setZoneInfo(val);
      },
      deep: true,
    },
  },
  directives: {
    changeSize,
    dragItem,
  },
};
</script>
