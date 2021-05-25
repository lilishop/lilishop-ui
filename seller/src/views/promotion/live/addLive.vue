<template>
  <div>
    <Card>
      <Alert type="warning">
        创建直播
        <template slot="desc">
          为了方便在创建直播间时从选择商品，请尽量提前提审直播商品
        </template>
      </Alert>

      <Form :model="liveForm" ref="liveForm" :rules="liveRulesForm" :label-width="120">
        <FormItem label="直播标题" prop="name">
          <Input v-model="liveForm.name" style="width:460px"></Input>
          <div class="tips">直播间名字，最短3个汉字，最长17个汉字，1个汉字相当于2个字符</div>
        </FormItem>
        <FormItem label="主播昵称" prop="anchorName">
          <Input v-model="liveForm.anchorName" style="width:360px"></Input>
          <div class="tips">主播昵称，最短2个汉字，最长15个汉字，1个汉字相当于2个字符</div>
        </FormItem>
        <FormItem label="直播时间" prop="startTime">

          <DatePicker format="yyyy-MM-dd HH:mm" type="datetimerange" @on-change="handleChangeTime" :options="optionsTime" placeholder="直播计划开始时间-直播计划结束时间" style="width: 300px"></DatePicker>
          <div class="tips">直播开播时间需要在当前时间的10分钟后 并且 开始时间不能在 6 个月后</div>
        </FormItem>

        <FormItem label="主播微信号" prop="anchorWechat">
          <Input v-model="liveForm.anchorWechat" style="width:360px" placeholder="主播微信号"></Input>
          <div class="tips">主播微信号，如果未实名认证，需要先前往“小程序直播”小程序进行<a target="_black" href="https://res.wx.qq.com/op_res/9rSix1dhHfK4rR049JL0PHJ7TpOvkuZ3mE0z7Ou_Etvjf-w1J_jVX0rZqeStLfwh">实名验证</a></div>
        </FormItem>

        <!-- 分享卡片 -->
        <FormItem label="分享卡片封面" prop="feedsImg">
          <div class="upload-list" v-if="liveForm.feedsImg">
            <template>
              <img :src="liveForm.feedsImg">
              <div class="upload-list-cover">
                <Icon type="ios-eye-outline" @click.native="handleView(item.name)"></Icon>
                <Icon type="ios-trash-outline" @click.native="handleRemove(item)"></Icon>
              </div>
            </template>

          </div>
          <Upload v-if="liveForm.feedsImg.length ==0" ref="upload" :show-upload-list="false" :on-success="handleFeedsImgSuccess" :default-file-list="defaultImgList" :format="['jpg','jpeg','png']"
            :on-format-error="handleFormatError" :max-size="1024" :on-exceeded-size="handleMaxSize" :before-upload="handleBeforeUpload" multiple type="drag" :action="action" :headers="accessToken"
            style="display: inline-block;width:58px;">
            <div style="width: 58px;height:58px;line-height: 58px;">
              <Icon type="ios-camera" size="20"></Icon>
            </div>
          </Upload>
          <div class="tips">
            直播间分享图，图片规则：建议像素800*640，大小不超过1M；
          </div>
        </FormItem>

        <!-- 直播间背景墙 -->
        <FormItem label="直播间背景墙" prop="coverImg">

          <div class="upload-list" v-if="liveForm.coverImg">
            <template>
              <img :src="liveForm.coverImg">
              <div class="upload-list-cover">
                <Icon type="ios-eye-outline" @click.native="handleView(item)"></Icon>
                <Icon type="ios-trash-outline" @click.native="handleRemove(item,'coverImg')"></Icon>
              </div>
            </template>
          </div>
          <Upload v-if="liveForm.coverImg.length ==0" ref="upload" :show-upload-list="false" :on-success="handleCoverImgSuccess" :default-file-list="defaultImgList" :format="['jpg','jpeg','png']"
            :on-format-error="handleFormatError" :max-size="2048" :on-exceeded-size="handleMaxSize" :before-upload="handleBeforeUpload" multiple type="drag" :action="action" :headers="accessToken"
            style="display: inline-block;width:58px;">
            <div style="width: 58px;height:58px;line-height: 58px;">
              <Icon type="ios-camera" size="20"></Icon>
            </div>
          </Upload>
          <div class="tips"> 直播间背景图，图片规则：建议像素1080*1920，大小不超过2M</div>
        </FormItem>
        <FormItem label="商品" >
          <Button type="primary" ghost icon="md-add">添加商品</Button>
          <Table class="goods-table" :columns="liveColumns" :data="liveData"></Table>
        </FormItem>

        <FormItem>
          <Button type="primary" @click="createLives()">保存</Button>
          <Button style="margin-left: 8px">取消</Button>
        </FormItem>
      </Form>
    </Card>
    <!-- 浏览图片 -->
    <Modal title="查看图片" v-model="imageVisible">
      <img :src="imageSrc" v-if="imageVisible" style="width: 100%">
    </Modal>
  </div>
</template>

<script>
import { uploadFile } from "@/api/index";
import { getLiveGoods } from "@/api/promotion";
export default {
  data() {
    return {
      imageVisible: false, //查看图片的dailog
      imageSrc: "", //查看图片的路径
      action: uploadFile, // 上传地址
      accessToken: {}, // 验证token
      // 不能选择今天以前的时间
      optionsTime: {
        disabledDate(date) {
          return date && date.valueOf() < Date.now() - 86400000;
        },
      },
      // 直播间数据上传规则
      liveRulesForm: {
        name: [
          { required: true, message: "请输入直播标题", trigger: "blur" },
          { max: 17, min: 3, message: "直播间名字最短3个汉字，最长17个汉字" },
        ],
        anchorName: [
          { required: true, message: "请输入主播昵称", trigger: "blur" },
          { max: 15, min: 2, message: "主播昵称最短2个汉字，最长15个汉字" },
        ],
        anchorWechat: [
          { required: true, message: "请输入主播微信号", trigger: "blur" },
        ],
        startTime: [
          {
            required: true,
            message: "请输入开始时间以及结束时间",
            trigger: "blur",
          },
        ],
        feedsImg: [
          { required: true, message: "分享卡片封面不能为空", trigger: "blur" },
        ],
        coverImg: [
          { required: true, message: "直播间背景墙不能为空", trigger: "blur" },
        ],
      },
      liveForm: {
        feedsImg: "", //分享卡片封面
        coverImg: "", //直播间背景墙
      },
      // 直播商品表格表头
      liveColumns: [
        {
          title: "商品",
        },
        {
          title: "价格",
        },
        {
          title: "库存",
        },
        {
          title: "链接",
        },
        {
          title: "操作",
        },
      ],
      liveData: [], //直播商品集合
    };
  },
  mounted() {
    this.accessToken = {
      accessToken: this.getStore("accessToken"),
    };
  },
  methods: {
    /**
     * 上传图片查看图片
     */
    handleView(src) {
      this.imageVisible = true;
      this.imageSrc = src;
    },

    /**
     * 删除上传的图片
     */
    handleRemove(val, type) {
      if (type == "coverImg") {
        this.liveForm.coverImg = "";
      } else {
        this.liveForm.feedsImg = "";
      }
    },
    /**
     * 直播间背景图上传成功回调
     */
    handleCoverImgSuccess(res) {
      this.liveForm.coverImg = res.result;
    },

    /**
     * 分享卡片封面上传成功回调
     */
    handleFeedsImgSuccess(res) {
      this.liveForm.feedsImg = res.result;
    },

    /**
     * 直播间背景图
     */
    handleCoverImgSuccess(res) {
      this.liveForm.coverImg.push(res.result);
    },

    /**
     * 选择时间后的回调
     */
    handleChangeTime(daterange) {
      this.liveForm.startTime = new Date(daterange[0]).getTime() / 1000;
      this.liveForm.endTime = new Date(daterange[1]).getTime() / 1000;
    },

    /**
     * 对图片错误进行回调
     */
    handleFormatError(file) {
      this.$Notice.warning({
        title: "请上传正确的图片格式！",
        desc: file.name + " 格式不为 jpg or png.",
      });
    },

    /**
     * 对图片的大小进行处理回调
     */
    handleMaxSize(file) {
      this.$Notice.warning({
        title: "图片超过限制大小！",
        desc: file.name + "图片超过规定限制大小，请重新上传",
      });
    },

    /**
     * 限制只能上传一张图片
     */
    handleBeforeUpload() {
      const check = this.liveForm.feedsImg.length < 1;
      if (!check) {
        this.$Notice.warning({
          title: "最多上传一张图片",
        });
      }
      return check;
    },
    createLives() {},
  },
};
</script>

<style lang="scss" scoped>
.tips {
  color: #999;
  font-size: 12px;
}
.goods-table {
  width: 800px;
  margin: 10px 0;
}
.upload-list {
  display: inline-block;
  width: 60px;
  height: 60px;
  text-align: center;
  line-height: 60px;
  border: 1px solid transparent;
  border-radius: 4px;
  overflow: hidden;
  background: #fff;
  position: relative;
  box-shadow: 0 1px 1px rgba(0, 0, 0, 0.2);
  margin-right: 4px;
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
}
.upload-list:hover .upload-list-cover {
  display: block;
}
.upload-list-cover i {
  color: #fff;
  font-size: 20px;
  cursor: pointer;
  margin: 0 2px;
}
</style>
