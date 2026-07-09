<template>
  <div class="new-goods">
    <div class="left">
      <div class="top-header" :style="{ background: options.left.bgColor }">
        <span>{{ options.left.title }}</span>
        <span @click="linkTo(options.left.url)" class="hover-pointer"
          >{{ options.left.secondTitle }} &gt;</span>
      </div>
      <div class="content">
        <div
          class="con-item hover-pointer"
          v-for="(item, index) in options.left.list"
          :key="index"
          @click="linkTo(item.url)"
        >
          <div>
            <p>{{ item.name }}</p>
            <p class="describe">{{ item.describe }}</p>
          </div>
          <img :src="item.img" alt="" />
        </div>
      </div>
    </div>

    <div class="middle">
      <div class="top-header" :style="{ background: options.middle.bgColor }">
        <span>{{ options.middle.title }}</span>
        <span class="hover-pointer" @click="linkTo(options.middle.url)"
          >{{ options.middle.secondTitle }} &gt;</span>
      </div>
      <div class="content">
        <div
          class="con-item hover-pointer"
          v-for="(item, index) in options.middle.list"
          :key="index"
          @click="linkTo(item.url)"
        >
          <div>
            <p>{{ item.name }}</p>
            <p class="describe">{{ item.describe }}</p>
          </div>
          <img :src="item.img" alt="" />
        </div>
      </div>
    </div>

    <div class="right">
      <div class="top-header" :style="{ background: options.right.bgColor }">
        <span>{{ options.right.title }}</span>
        <span @click="linkTo(options.right.url)" class="hover-pointer"
          >{{ options.right.secondTitle }} &gt;</span>
      </div>
      <div class="content">
        <div
          v-for="(item, index) in options.right.list"
          :key="index"
          class="hover-pointer"
          @click="linkTo(item.url)"
        >
          <div class="img-wrap">
            <img :src="item.img" alt="" />
            <div class="jiaobiao" :class="'jiaobiao' + (index + 1)">
              {{ index + 1 }}
            </div>
          </div>
          <p>{{ item.name }}</p>
          <p>{{ $filters.unitPrice(item.price, "￥") }}</p>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
export default {
  props: {
    data: {
      type: Object,
      default: null
    }
  },
  data () {
    return {
      options: this.data.options // 装修数据
    };
  },
  methods: {}
};
</script>
<style lang="scss" scoped>
.new-goods {
  display: flex;
  justify-content: space-between;
  align-items: stretch;
  > div {
    width: 393px;
    height: 440px;
    overflow: hidden;
  }

  .left > .content {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    grid-template-rows: repeat(3, 1fr);
    flex-direction: unset;
    overflow: hidden;
    > div {
      width: 100%;
      height: 100%;
      min-width: 0;
      min-height: 0;
      overflow: hidden;
      box-sizing: border-box;
      display: flex;
      padding: 6px 4px 4px 6px;
      border-style: solid;
      border-color: #eee;
      border-width: 0;
      border-bottom-width: 1px;
      border-right-width: 1px;
      img {
        width: 64px;
        height: 64px;
        margin-top: 2px;
        flex-shrink: 0;
        object-fit: cover;
      }
      > div {
        flex: 1;
        min-width: 0;
        p {
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          font-size: 12px;
          line-height: 1.3;
        }
        .describe {
          margin-top: 4px;
          font-size: 11px;
        }
      }
    }
    > div:nth-child(1) {
      grid-row: span 2;
      flex-direction: column;
      justify-content: space-between;
      align-items: center;
      text-align: center;
      padding: 8px 6px;
      img {
        width: 120px;
        height: 120px;
        margin-top: 6px;
      }
      > div {
        flex: unset;
        width: 100%;
        p {
          white-space: normal;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
        }
        .describe {
          margin-top: 6px;
          white-space: normal;
        }
      }
    }
    > div:nth-child(2),
    > div:nth-child(3),
    > div:nth-child(5) {
      border-right-width: 0;
    }
    > div:nth-child(4),
    > div:nth-child(5) {
      border-bottom-width: 0;
    }
  }

  .middle > .content {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    grid-template-rows: repeat(3, 1fr);
    flex-direction: unset;
    > div {
      width: 100%;
      height: 100%;
      min-width: 0;
      overflow: hidden;
      box-sizing: border-box;
      border-style: solid;
      border-color: #eee;
      border-width: 0;
      border-bottom-width: 1px;
      border-right-width: 1px;
    }
    > div:nth-child(2n) {
      border-right-width: 0;
    }
    > div:nth-child(n + 5) {
      border-bottom-width: 0;
    }
  }

  .right > .content {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    grid-template-rows: repeat(2, 1fr);
    flex-direction: unset;
    flex-wrap: unset;
    font-size: 12px;
    overflow: hidden;
    > div {
      position: relative;
      width: 100%;
      height: 100%;
      min-height: 0;
      box-sizing: border-box;
      padding: 4px 4px 2px;
      display: flex;
      flex-direction: column;
      align-items: center;
      overflow: hidden;
      border-bottom: 1px solid #eee;
      border-right: 1px solid #eee;
      .img-wrap {
        position: relative;
        width: 80px;
        height: 80px;
        flex-shrink: 0;
        img {
          width: 100%;
          height: 100%;
          display: block;
          object-fit: cover;
        }
        .jiaobiao {
          position: absolute;
          width: 23px;
          height: 23px;
          top: 0;
          right: 0;
          margin: 0;
          padding: 0;
          max-height: none;
          overflow: visible;
          display: block;
          background: url(../../../assets/images/festival_icon.png) no-repeat;
          color: #fff;
          text-align: center;
          line-height: 23px;
          font-size: 12px;
          -webkit-line-clamp: unset;
          -webkit-box-orient: unset;
        }
        .jiaobiao1,
        .jiaobiao4 {
          background-position: -2px -30px;
        }
        .jiaobiao2,
        .jiaobiao5 {
          background-position: -31px -30px;
        }
        .jiaobiao3,
        .jiaobiao6 {
          background-position: -60px -30px;
        }
      }
      > p:nth-child(2) {
        width: 100%;
        height: auto;
        max-height: 32px;
        line-height: 16px;
        margin-top: 4px;
        overflow: hidden;
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
        text-align: center;
      }
      > p:nth-child(3) {
        color: $theme_color;
        margin-top: 2px;
        line-height: 1.2;
        flex-shrink: 0;
      }
    }
    > div:nth-child(3n) {
      border-right: none;
    }
    > div:nth-child(n + 4) {
      border-bottom: none;
    }
  }

  .top-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    height: 50px;
    padding: 0 10px;
    background: #c43d7e;
    color: #fff;
    span:nth-child(1) {
      font-size: 20px;
    }
    span:nth-child(2) {
      font-size: 12px;
    }
  }
  .content {
    padding: 10px 12px 0;
    display: flex;
    flex-wrap: wrap;
    flex-direction: column;
    height: 370px;
    box-sizing: border-box;
    overflow: hidden;
  }
  .con-item {
    width: 185px;
    height: 120px;
    display: flex;
    padding-left: 10px;
    padding-top: 10px;
    img {
      width: 90px;
      height: 90px;
      margin-top: 10px;
    }
  }
  .middle > .content .con-item {
    width: 100%;
    max-width: 100%;
    height: 100%;
    min-width: 0;
    min-height: 0;
    overflow: hidden;
    box-sizing: border-box;
    padding: 6px 4px 4px 6px;
    img {
      width: 64px;
      height: 64px;
      margin-top: 2px;
      flex-shrink: 0;
    }
    > div {
      flex: 1;
      min-width: 0;
      p {
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        font-size: 12px;
        line-height: 1.3;
      }
      .describe {
        margin-top: 4px;
        font-size: 11px;
      }
    }
  }
  .left > .content .con-item {
    width: 100%;
    max-width: 100%;
    height: 100%;
  }
  .describe {
    color: #999;
    font-size: 12px;
    margin-top: 15px;
  }
}
</style>
