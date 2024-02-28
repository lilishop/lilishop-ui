<template>
  <div class="wrapper">
    <Button @click="handleClickUploadImage">上传图片</Button>
    <Modal v-model="show" width="850" @on-ok="callback" title="上传图片">
      <div class="import-oss" @click="importOSS">
        从资源库中导入
      </div>
      <div style="display: flex; flex-wrap: wrap">
        <vuedraggable
          :animation="200"
          :list="images"
        >
          <div
            v-for="(item, __index) in images"
            :key="__index"
            class="upload-list"
          >
            <template>
              <img alt="image" :src="item.url"/>
              <div class="upload-list-cover">
                <div>
                  <Icon
                    size="30"
                    type="md-search"
                    @click.native="$previewImage(item.url)"
                  ></Icon>
                  <Icon
                    size="30"
                    type="md-trash"
                    @click.native="handleRemoveGoodsPicture(__index)"
                  ></Icon>
                </div>
              </div>
            </template>
          </div>
        </vuedraggable>
        <div class="upload-box">
          <Upload
            ref="upload"
            :action="uploadFileUrl"
            :format="['jpg', 'jpeg', 'png']"
            :headers="{ ...accessToken }"
            :max-size="10240"
            :on-exceeded-size="handleMaxSize"
            :on-format-error="handleFormatError"
            :on-success="handleSuccessGoodsPicture"
            :show-upload-list="false"
            multiple
            type="drag"
          >
            <div style="width: 148px; height: 148px; line-height: 148px">
              <Icon size="20" type="md-add"></Icon>
            </div>
          </Upload>
        </div>
      </div>
    </Modal>

    <Modal width="1000" v-model="showOssManager" @on-ok="confirmUrls">
    <OssManage ref="ossManage" :isComponent="true" @selected="(list)=>{ selectedImage = list}" @callback="handleCallback" />
    </Modal>
  </div>
</template>
<script>
import vuedraggable from "vuedraggable";
import {uploadFile} from "@/libs/axios";
// import OssManage from "@/views/sys/oss-manage/ossManage";
import OssManage from "@/views/shop/ossManage";
export default {
  name: "upload-image",
  components: {
    OssManage,
    vuedraggable,
  },
  data() {
    return {
      show: false, // 是否显示弹窗
      uploadFileUrl: uploadFile, // 上传地址
      accessToken:"",
      showOssManager:false, // 是否显示oss管理弹窗
      images:[],
      selectedImage:[]
    }
  },
  mounted() {
    this.accessToken = {
      accessToken: this.getStore("accessToken"),
    };
  },
  methods: {
    handleClickUploadImage(){
      this.show = true;
    },
    // 回调给父级
    callback() {
      // 先给数据做一下处理 然后将数据传给父级
      const formatImages = this.images.map((item) => item.url);
      this.$emit('callback',formatImages)
    },
    // 移除商品图片
    handleRemoveGoodsPicture(__index) {
      this.images.splice(__index, 1);
    },
    // 图片大小不正确
    handleMaxSize(file) {
      this.$Notice.warning({
        title: "超过文件大小限制",
        desc: "图片大小不能超过10MB",
      });
    },
    // 图片格式不正确
    handleFormatError(file) {
      this.$Notice.warning({
        title: "文件格式不正确",
        desc: "文件 " + file.name + " 的格式不正确",
      });
    },
    // sku图片上传成功
    handleSuccessGoodsPicture(res, file) {
      if (file.response) {
        file.url = file.response.result;
        this.images.push(file);
      }
    },
    confirmUrls(){
      this.selectedImage.length ? this.selectedImage.forEach(element => {
        this.images.push({ url: element.url })
      }):''
      this.showOssManager = false
    },
    handleCallback(val){
      this.$Message.success("导入成功")
      this.images.push({url:val.url})
    },
    // 从资源库中导入图片
    importOSS(){
      this.showOssManager = true;
      this.$refs.ossManage.selectImage = true;
    }
  }
}
</script>

<style scoped lang="scss">
.import-oss{
  margin-bottom: 10px;
  text-align: right;
  color: $theme_color;
  cursor: pointer;

}
.wrapper{
  margin: 10px 0;
}

.upload-list {
  width: 150px;
  height: 150px;
  text-align: center;
  border: 1px solid transparent;
  border-radius: 4px;
  display: inline-block;
  background: #fff;
  position: relative;
  margin-right: 4px;
  vertical-align: bottom;
}

.upload-box{
  margin: 10px 0;

}

.upload-list img {
  width: 100%;
  height: 100%;
}

.upload-list-cover {
  display: none;
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;

  right: 0;
  background: rgba(0, 0, 0, 0.6);

  justify-content: space-between;
  align-items: center;
  flex-direction: column;
}

.upload-list:hover .upload-list-cover {
  display: flex;
}

.upload-list-cover div {
  margin-top: 50px;
  width: 100%;

  >i {
    width: 50%;
    margin-top: 8px;
    color: #fff;
    font-size: 20px;
    cursor: pointer;
  }
}

</style>
