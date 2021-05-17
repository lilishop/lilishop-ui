<template>
  <div class="floor-list">
    <div class="list">
      <div class="template-saved" v-for="item in templateList" :key="item.id">
        <div class="template-title">
          <span>{{ item.name }}</span>
          <span :class="{ 'theme-color': item.pageShow == 'OPEN' }">{{
            item.pageShow == "OPEN" ? "已发布" : "未发布"
          }}</span>
        </div>
        <div class="template-content">
          <!-- <img :src="item.img || require(`@/assets/img-error.png`)" alt=""> -->
          <div class="cover">
            <Button icon="md-color-palette" @click="decorate(item.id)"
              >装修</Button
            >
            <Button icon="md-pricetags" @click="Template(item)">编辑</Button>
            <Button
              icon="md-send"
              v-if="item.pageShow == 'CLOSE'"
              @click="releaseTemplate(item.id)"
              >发布</Button
            >
            <Button
              icon="md-trash"
              v-if="item.pageShow == 'CLOSE'"
              @click="delTemplate(item.id)"
              >删除</Button
            >
          </div>
        </div>
      </div>
      <div class="new-template" @click="createTemp">
        <Icon type="md-add" />
        <div>新建模板</div>
      </div>
    </div>
    <Modal
      v-model="showModal"
      title="模板设置"
      draggable
      width="600"
      :z-index="100"
      :loading="loading"
      mask-closable="false"
      @on-ok="newTemplate"
      @on-cancel="showModal = false"
    >
      <Form ref="form" :model="formData" :rules="rules" :label-width="80">
        <FormItem label="模板名称" prop="name">
          <Input v-model="formData.name" placeholder="请输入模板名称" />
        </FormItem>
      </Form>
    </Modal>
  </div>
</template>

<script>
import * as API_floor from "@/api/other.js";
export default {
  name: "floorList",
  data() {
    return {
      showModal: false,
      templateList: [],
      formData: {
        status: false,
        name: "",
      },
      rules: {
        name: [{ required: true, message: "请输入模板名称", trigger: "blur" }],
      },
      loading: true,
    };
  },
  mounted() {
    let height = window.innerHeight - 150;
    document.querySelector(".floor-list").style.height = height + "px";
    this.getTemplateList();
  },
  methods: {
    newTemplate() {
      // 添加，编辑模板
      this.$refs.form.validate((valid) => {
        if (valid) {
          const data = this.formData;
          data.status ? (data.pageShow = "OPEN") : (data.pageShow = "CLOSE");
          delete data.status;
          (data.pageType = "INDEX"), (data.pageClientType = "PC");
          if (data.id) {
            API_floor.updateHome(data.id, data).then((res) => {
              this.$Message.success("编辑模板成功");
              this.showModal = false;
              this.getTemplateList();
            });
          } else {
            API_floor.setHomeSetup(data).then((res) => {
              this.$Message.success("新建模板成功");
              this.showModal = false;
              this.getTemplateList();
            });
          }
        } else {
          this.loading = false;
        }
      });
    },

    createTemp() {
      // 新建表单
      this.$refs.form.resetFields();
      this.showModal = true;
    },

    Template(item) {
      // 编辑表单
      item.pageShow == "OPEN" ? (item.status = true) : (item.status = false);
      this.formData = item;
      this.showModal = true;
    },

    decorate(id) {
      // 装修
      this.$router.push({ name: "renovation", query: { id: id } });
    },

    getTemplateList() {
      //模板列表
      let params = {
        pageNumber: 1,
        pageSize: 999,
        pageType: "INDEX",
        pageClientType: "PC",
      };
      API_floor.getHomeList(params).then((res) => {
        if (res.success) {
          this.templateList = res.result.records;
        }
      });
    },

    releaseTemplate(id) {
      //发布模板
      API_floor.releasePageHome(id).then((res) => {
        if (res.success) {
          this.$Message.success("发布模板成功");
          this.getTemplateList();
        }
      });
    },

    delTemplate(id) {
      this.$Modal.confirm({
        title: "提示",
        content: "<p>确定删除该模板吗？</p>",
        onOk: () => {
          API_floor.removePageHome(id).then((res) => {
            if (res.success) {
              this.$Message.success("删除模板成功");
              this.getTemplateList();
            }
          });
        },
        onCancel: () => {},
      });
    },
  },
  computed: {},
};
</script>

<style lang="scss" scoped>
.floor-list {
  background-color: #fff;
  width: 100%;
}
.list {
  width: 100%;
  height: 100%;
  padding: 10px;
  display: flex;
  flex-wrap: wrap;
  > div {
    width: 260px;
    height: 450px;
    margin: 10px 15px;
    border: 1px solid #eee;
    border-radius: 5px;
  }
  .new-template {
    cursor: pointer;
    display: flex;
    align-items: center;
    flex-direction: column;
    justify-content: center;
    border: 2px dashed $theme_color;
    color: $theme_color;
    background: #f88c7138;
    .ivu-icon {
      font-size: 30px;
      margin-bottom: 10px;
    }
  }
  .template-saved {
    overflow: hidden;
    .template-title {
      padding: 10px;
      background: #eee;
      display: flex;
      justify-content: space-between;
      .theme-color {
        color: $theme_color;
      }
    }
  }
  .template-content {
    height: 407px;
    width: 100%;
    position: relative;
    background: #ddd;
    &:hover {
      .cover {
        visibility: visible;
      }
    }
    img {
      width: 100%;
      height: 100%;
    }
    .cover {
      visibility: hidden;
      width: 100%;
      height: 407px;
      background: rgba(0, 0, 0, 0.3);
      position: absolute;
      top: 0;
      left: 0;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      .ivu-btn {
        margin-bottom: 10px;
        background: transparent;
        color: #fff;
        border-color: #fff;
        &:hover {
          background-color: $theme_color;
        }
      }
    }
  }
}
</style>
