<template>
  <div class="model-view">
    <div class="model-view-content">
      <div class="content">
        <div class="wap-title">首页</div>
        <div class="draggable">
          <div class="position">
            <div class="btn-item">
              <img
                src="https://shopro-1253949872.file.myqcloud.com/uploads/20200704/f6b9c9d20d21df541ac52e9548486e1a.png"
                alt=""
              />
            </div>
            <div class="btn-item" v-for="(item, index) in btnWay" :key="index">
              <img :src="item.img" alt="" />
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="model-config">
      <div class="decorate">
        <div class="decorate-title">悬浮按钮</div>

        <div class="decorate-list">
          <div
            class="decorate-item"
            v-for="(item, index) in btnWay"
            :key="index"
          >
            <div class="decorate-item-title">
              <div>图标{{ index + 1 }}</div>
              <Icon
                @click="closeDecorate(index)"
                size="20"
                color="#e1251b"
                type="md-close-circle"
              />
            </div>
            <div class="decorate-item-box">
              <!-- 选择照片 -->
              <div class="decorate-view">
                <div class="decorate-view-title">选择图标</div>
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
            </div>
          </div>
        </div>

        <Button type="primary" @click="addDecorate()" ghost>添加</Button>
      </div>
    </div>
  </div>
</template>
<script>
import { btnWay } from "./btn.js";
export default {
  data() {
    return {
      btnWay,
    };
  },
  methods: {},
  mounted() {
    console.log(this.btnWay);
  },
  methods: {
    //添加设置
    addDecorate() {
      let way = {
        img: "https://picsum.photos/id/264/200/200",
        title: "标题",
        size: this.btnWay[0].size,
      };
      this.btnWay.push(way);
    },

    // 关闭
    closeDecorate(index) {
      this.$nextTick(() => {
        this.btnWay.splice(index, 1);
      });
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
    // 点击选择照片
    handleClickFile(item, index) {
      document.getElementById("files" + index).click();
      // console.log(let files = files)
    },
  },
};
</script>
<style scoped lang="scss">
@import "./style.scss";
@import "./decorate.scss";
.draggable {
  position: relative;
}
.position {
  position: absolute;
  right: 30px;
  bottom: 50px;
  display: flex;
  flex-direction: column-reverse;
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