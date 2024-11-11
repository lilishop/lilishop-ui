<template>
  <div class="wrapper">
    <Tabs :value="wap[0].title" class="tabs">
      <TabPane
        :label="item.title"
        :name="item.title"
        @click="clickTag(item, i)"
        v-for="(item, i) in wap"
        :key="i"
      >
        <component
          ref="lili-component"
          :is="templateWay[item.name]"
          @selected="
            (val) => {
              changed = val;
            }
          "
        />
      </TabPane>
      <!-- </template> -->
    </Tabs>
  </div>
</template>
<script>
import wap from "./wap.js";
import goodsDialog from "./goods-dialog";
import templateWay from "./template/index";
export default {
  components: {
    goodsDialog
  },
  data() {
    return {
      templateWay, // 模板数据
      changed: "", // 变更模板
      selected: 0, // 已选数据
      selectedLink: "", //选中的链接
      wap, // tab标签
    };
  },
  watch: {
    changed: {
      handler(val) {
        console.log(val,'changed')
        this.$emit("selectedLink", val[0]); //因为是单选，所以直接返回第一个
      },
      deep: true
    }
  },
  mounted() {
    this.$nextTick(() => {
      this.$refs["lili-component"][0].type = "single"; //商品页面设置成为单选
    });
    let url  = window.location.href
    if(url.indexOf('/floorList/renovation') != -1){
      //此处去重防止移动楼层多次点击push 太多数据
      let obj = {};
            this.wap = this.wap.reduce((cur, next) => {
              //对象去重
              if (next.title != undefined) {
                obj[next.title]
                  ? ""
                  : (obj[next.title] = true && cur.push(next));
              }
              return cur;
      }, []);
      if (this.$route.path !== '/floorList/main') {
        this.wap.forEach((items, indexs) => {
          if (items.title == '活动') {
            this.wap.splice(indexs, 1)
          }
        })
      }
    }else{
      this.wap.push( {
        title: "活动",
        url: "3",
        name: "marketing"
      })
      let obj = {};
            this.wap = this.wap.reduce((cur, next) => {
              //对象去重
              if (next.title != undefined) {
                obj[next.title]
                  ? ""
                  : (obj[next.title] = true && cur.push(next));
              }
              return cur;
      }, []);
    }
    this.wap.forEach((item) => {
      if (item) {
        item.selected = false;
      }
    });
  },
  methods: {
    // isVisible(item) {
    //   const type = this.$route.query.pagetype;
    //   if (type == "INDEX" && [ "discover"].includes(item.name)) {
    //     return false;
    //   }else if(type == "DISCOVER" && item.name == 'special'){
    //     return false;
    //   }else{
    //     return true
    //   }
    // },
  }
};
</script>
<style scoped lang="scss">
@import "./style.scss";
.wap-content-list {
  display: flex;
  flex-wrap: wrap;
}
.wap-flex {
  margin: 2px;
}
.tabs {
  width: 100%;
}

/deep/ .ivu-modal {
  overflow: hidden;
  height: 650px !important;
}
/deep/ .ivu-modal-body {
  width: 100%;
  height: 500px;
  overflow: hidden;
}
</style>
