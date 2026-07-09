<template>
  <div class="renovation">
    <div class="model-list">
      <div class="classification-title">基础模块</div>
      <draggable
        tag="ul"
        :list="modelData"
        :item-key="getModelKey"
        :clone="cloneModel"
        :group="{ name: 'model', pull: 'clone', put: false }"
        :sort="false"
        ghost-class="ghost"
        handle=".model-item"
      >
        <template #item="{ element: model }">
          <li class="model-item">
            <el-icon><Picture /></el-icon>
            <span>{{ model.name }}</span>
          </li>
        </template>
      </draggable>
    </div>
    <div class="show-content">
      <model-form ref="modelForm" :data="modelForm"></model-form>
    </div>
    <div class="btn-bar" :class="{'top':isHiddenBar}">
      <el-button type="primary" :loading="submitLoading" @click="saveTemplate">保存模板</el-button>
      <el-button class="ml_10" @click="resetTemplate">还原模板</el-button>
      <el-button class="ml_10" @click="witeLocalStore">将装修内容写入到本地</el-button>
      <el-button class="ml_10" v-if="hasCache" @click="clearCache">清空本地装修缓存</el-button>
    </div>
  </div>
</template>
<script>
import { Picture } from "@element-plus/icons-vue";
import { modelData } from "./modelConfig";
import Draggable from "vuedraggable";
import ModelForm from "./modelForm.vue";
import * as API_floor from "@/api/other.js";
export default {
  components: {
    Draggable,
    ModelForm,
    Picture,
  },
  mounted() {
    const setting = window.localStorage.getItem('admin-setting') ? JSON.parse(window.localStorage.getItem('admin-setting')) : {};
    this.isHiddenBar = setting.isUseTabsRouter
     const cache = this.getStore('managerPCPageCache')
    this.hasCache = !!cache;
      if(cache){
        this.$Modal.confirm({
        title: '提示',
        content: '获取到本地有缓存数据，是否使用缓存数据？',
        okText: '使用',
        cancelText: '取消',
        onOk: () => {
          let pageData = cache;
          if (pageData) {
            pageData = JSON.parse(pageData);
            if (pageData.list[0].type === "topAdvert") {
              this.$refs.modelForm.topAdvert = pageData.list[0];
              this.$refs.modelForm.navList = pageData.list[1];
              pageData.list.splice(0, 2);
              this.modelForm = pageData;
            } else {
              this.modelForm = { list: [] };
            }
          } else {
            this.modelForm = { list: [] };
          }
        }
      });
    }
    this.getTemplateItem(this.$route.query.id);
  },
  data() {
    return {
      hasCache:false,
      modelData,
      modelForm: { list: [] },
      submitLoading: false,
      isHiddenBar:true,
    };
  },
  methods: {
    getModelKey(model) {
      return model.type || model.name;
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
    clearCache(){
      this.setStore('managerPCPageCache', '')
      this.$Message.success('清除成功')
    },
    witeLocalStore(){
      const data ={...this.modelForm}
      data.list.unshift(this.$refs.modelForm.navList);
      data.list.unshift(this.$refs.modelForm.topAdvert);
      this.setStore('managerPCPageCache', data)
      this.$Message.success('写入成功')
    },
    saveTemplate() {
      this.submitTemplate(this.$route.query.pageShow ? 'OPEN' : 'CLOSE')
    },
    submitTemplate(pageShow) {
      this.submitLoading = true
      const modelForm = JSON.parse(JSON.stringify(this.modelForm))
      modelForm.list.unshift(this.$refs.modelForm.navList);
      modelForm.list.unshift(this.$refs.modelForm.topAdvert);
      const data = {
        id: this.$route.query.id,
        pageData: JSON.stringify(modelForm),
        pageShow: this.$route.query.pageType === 'SPECIAL' ? 'CLOSE' : pageShow,
        pageClientType: 'PC',
      };
      API_floor.updateHome(this.$route.query.id, data).then((res) => {
        this.submitLoading = false
        if (res.success) {
          this.$Message.success("保存模板成功");
        }
      });
    },
    resetTemplate() {
      this.getTemplateItem(this.$route.query.id);
    },
    getTemplateItem(id) {
      API_floor.getHomeData(id).then((res) => {
        if (res.success) {
          let pageData = res.result.pageData;
          if (pageData) {
            pageData = JSON.parse(pageData);
            if (pageData.list[0].type === "topAdvert") {
              this.$refs.modelForm.topAdvert = pageData.list[0];
              this.$refs.modelForm.navList = pageData.list[1];
              pageData.list.splice(0, 2);
              this.modelForm = pageData;
            } else {
              this.modelForm = { list: [] };
            }
          } else {
            this.modelForm = { list: [] };
          }
        }
      });
    },
  },
  watch: {
    modelForm: {
      deep: true,
      handler: function (val) {
        console.log(val);
      },
    },
  },
};
</script>
<style lang="scss" scoped>
.renovation {
  position: relative;
  display: flex;
}
.model-list {
  width: 130px;
  height: 620px;
  overflow-y: auto;
  padding: 10px;
  background: #fff;
  margin-top: 80px;
  position: fixed;
  z-index: 100;
  box-shadow: 1px 1px 10px #999;
  .classification-title {
    width: 100%;
    height: 30px;
    line-height: 30px;
    text-align: center;
  }
  :deep(ul) {
    width: 100%;
    margin: 0;
    padding: 0;
    display: flex;
    flex-direction: column;
    align-items: center;
  }
  .model-item {
    width: 110px;
    height: 30px;
    background: #eee;
    margin-top: 10px;
    line-height: 30px;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 4px;
    color: #999;
    transition:0.15s;
    border-radius: 4px;
    &:hover {
      background: $theme_color;
      cursor: move;
      color: #fff;
    }
  }
  .ghost::after {
    border: none;
    height: 0;
    content: "";
  }
}
.show-content {
  margin-left: 150px;
  margin-top: 60px;
}
.ghost {
  background: #fff;
  height: 30px;
  position: relative;
  &::after {
    content: "松开鼠标添加模块";
    position: absolute;
    background: #fff;
    border: 1px dashed #409eff;
    color: #409eff;
    top: 0;
    left: 0;
    width: 100%;
    height: 50px;
    text-align: center;
    line-height: 50px;
  }
}
.btn-bar {
  position: fixed;
  width: 100%;
  background: #fff;
  height: 50px;
  padding: 10px;
  box-shadow: 1px 1px 10px #999;
  z-index: 99;
}
.top{
  top: 100px;
}
</style>
