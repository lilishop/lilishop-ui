<template>
  <Card class="card">
    <div v-for="(item,index) in instantDelivery" :key="index">
      <div class="cardBox">
        <div class="methodItem">

          <span v-if="item.image = ''">暂无封面</span>
          <img v-else :src=item.images height="172" width="440"/>
          <h4>{{item.deliveryName}}</h4></div>
        <div class="bar">
          <div v-if="item.deliveryOpen==1" class="status" style="color: rgb(53, 189, 129);">已启用</div>
          <div v-else class="status" style="color: rgb(53, 189, 129);">
            <a class="links" style="color: rgb(53, 189, 129);" @click="openDelivery(item)">启用</a>&nbsp;<span
            style="color: red;">(未启用)</span>
          </div>
          <div class="div-edit">
            <Upload
              multiple
              :action=action
              :show-upload-list="false"
              :format="['jpg', 'jpeg', 'png', 'gif']"
              :on-success="uploadSuccess"
            >
              <a class="links" @click="deliveryBean = item.deliveryBean">更换封面</a>
            </Upload>

          </div>
          <div>
            <a class="links" @click="edit">编辑</a>
          </div>
        </div>
      </div>
      <Modal
        :title="modalTitle"
        v-model="modalVisible"
        :width="500"
      >
        <Form ref="form" :model="form" :label-width="90">
          <Form-item :label="config.name" v-for="(config,q) in item.configItems" :key="config">
            <div>
              <Input
                type="text"
                v-model="config.value"
                clearable
                placeholder="请输入您的请求参数，均不能为空"
                style="width: 300px"
                v-if="config.type == 'text'"
              />
            </div>
          </Form-item>
        </Form>
        <div slot="footer">
          <Button type="text" @click="modalVisible = false">取消</Button>
          <Button type="primary" :loading="submitLoading" @click="saveDeliverySubmit(item)">保存</Button>
        </div>
      </Modal>
    </div>


  </Card>

</template>

<script>
  import * as API_Setting from "@/api/setting";
  import editor from "@/views/my-components/lili/editor";
  import {commonUrl} from '@/libs/axios'


  export default {
    name: "instantDelivery",
    components: {
      editor
    },
    data() {
      return {
        deliveryBean: "", // 封面
        action: commonUrl + '/common/upload/file', // 上传地址
        loading: true, // 表单加载状态
        modalVisible: false, // 修改同城配送模态框
        modalTitle: "", // 修改同城配送标题
        instantDelivery: [{ // 列表
          configItems: []
        }

        ], //同城配送数据
        searchForm: {
          // 搜索框初始化对象
          pageNumber: 1, // 当前页数
          pageSize: 10, // 页面大小
        },
        selectDate: null,
        form: {},
        // 表单验证规则
        formValidate: {},
        submitLoading: false, // 添加或编辑提交状态
      };
    },
    methods: {
      init() {
        this.getData();
      },
      //修改同城配送方案
      edit() {
        this.modalVisible = true
        this.modalTitle = "编辑同城配送"
      },
      saveDeliverySubmit(item) {
        const headers = {
          "Content-Type": "application/json;charset=utf-8"
        }
        this.loading = true
        API_Setting.editInstantDelivery(item.deliveryBean, item.configItems, headers).then((res) => {
          this.loading = false;
          if (res.success) {
            this.instantDelivery = (res.result.records);
            this.modalVisible = false
            this.$Message.success("保存成功");
            this.getData()
          }
        });
      },
      //开启某个同城配送
      openDelivery(item) {
        this.$Modal.confirm({
          title: "确定开启？",
          content: "确认开启当前同城配送方案",
          onOk: () => {
            API_Setting.openInstantDelivery(item.deliveryBean).then((res) => {
              if (res.success) {
                this.$Message.success("开启成功");
                this.getData();
              }
            });
          },
        });
      },
      //封面上传成功方法
      uploadSuccess(res) {
        const params = {
          images: res.result
        }
        this.loading = true
        API_Setting.editInstantDeliveryImage(this.deliveryBean, params).then((res) => {
          this.loading = false;
          if (res.success) {
            this.$Message.success("更换成功");
            this.getData()
          }
        });
      },
      getData() {
        this.loading = true;
        API_Setting.getInstantDelivery(this.searchForm).then((res) => {
          this.loading = false;
          if (res.success) {
            this.instantDelivery = res.result.records;
          }
        });
        this.loading = false;
      },
    },
    mounted() {
      this.init();
    },
  };
</script>
<style lang="scss" scoped>
  .cardBox {
    display: inline-block;
    border-radius: 2px;
    line-height: 1.5;
    margin-right: 20px;
    width: 300px;
    border: 1px solid #eee;
    padding: 10px;
  }

  .methodItem {
    width: 100%;
    border: 1px solid #f5f5f5;
    text-align: center;
    padding: 20px 0;
  }

  methodItem img {
    width: 220px;
    height: 86px;
  }

  methodItem h4 {
    font-size: 14px;
    color: #333;
    margin-top: 5px;
  }

  .methodItem img {
    width: 220px;
    height: 86px;
  }

  .div-edit {
    margin-left: 50px
  }

  .bar {
    -webkit-flex-direction: row;
    -ms-flex-direction: row;
    flex-direction: row;
    display: -webkit-box;
    display: -webkit-flex;
    display: -ms-flexbox;
    display: flex;
    -webkit-box-pack: justify;
    -webkit-justify-content: space-between;
    -ms-flex-pack: justify;
    justify-content: space-between;
    -webkit-align-items: center;
    -webkit-box-align: center;
    -ms-flex-align: center;
    align-items: center;
    padding: 10px 8px 0;
  }

  .ivu-upload {
    height: 21px;
    margin-left: 15px;
  }
</style>
