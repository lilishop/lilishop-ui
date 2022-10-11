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
                  <Button
                    size="small"
                    @click="handleClickFile(item, index)"
                    ghost
                    type="primary"
                    >选择照片</Button
                  >
                </div>
              </div>

              <!-- 选择连接 -->
              <div class="decorate-view">
                <div class="decorate-view-title">选择图片</div>
                <div>
                  <Button
                    ghost
                    type="primary"
                    size="small"
                    @click="clickLink(item)"
                    >选择链接</Button
                  >
                </div>
              </div>
            </div>
          </div>
        </div>
        <!-- <Button type="primary" @click="addDecorate()" ghost>添加</Button> -->
        <liliDialog ref="liliDialog"    @selectedLink="selectedLink" :types="linkType"></liliDialog>
      </div>
      <Modal width="1200px" v-model="picModelFlag">
         <ossManage @callback="callbackSelected" ref="ossManage" />
      </Modal>
    </div>
  </div>
</template>
<script>
import ossManage from "@/views/sys/oss-manage/ossManage";
import * as API_Other from "@/api/other.js";
export default {
   components: {
    ossManage,
  },
  data() {
    return {
      picModelFlag: false, //图片选择器
      type: "full", // 是否全屏

      //全屏广告
      advertising: [
         {
          img:
            "https://st-gdx.dancf.com/gaodingx/0/uxms/design/20200903-182035-5e87.png?x-oss-process=image/resize,w_932/interlace,1,image/format,webp",
          size: "750*1624",
        },
      ],
      selectedLinks: {},
      linkType: "", // 选择类型
    };
  },
   watch: {
    advertising: {
      handler(val) {
        this.$store.state.openStyleStore = val;
        console.log(
          "this.$store.state.openStyleStore",
          this.$store.state.openStyleStore
        );
      },
      deep: true,
    },
  },
  mounted() {
    this.openPage();
  },
  methods: {
    openPage() {
      const alertType = this.$route.query.pagetype;
      const pageType = {
        INDEX: "INDEX",
        ALERT: "OPEN_SCREEN_PAGE",
        OPEN_SCREEN_ANIMATION: "OPEN_SCREEN_ANIMATION",
      }[alertType ? alertType : "INDEX"];

      API_Other.getOpenHomeData(pageType).then((res) => {
        this.$store.state.openStoreId = res.result.id;
        res.result.pageData
          ? this.$set(this, "advertising", [JSON.parse(res.result.pageData)])
          : "";
      });
    },
    // 点击链接
    clickLink(item) {
      this.$refs.liliDialog.open('link')
    },
    // 回调选择的链接
    selectedLink(val) {
      this.selectedLinks.url = val;

      this.advertising[0].config = val;
    },
    // 点击选择照片
    handleClickFile() {
      this.$refs.ossManage.selectImage = true;
      this.picModelFlag = true;
    }, // 图片选择器回显
    callbackSelected(val) {
      this.picModelFlag = false;
      this.advertising[0].img = val.url;
    }
  },
};
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
