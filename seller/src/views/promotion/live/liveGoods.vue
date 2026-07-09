<template>
  <div>
    <el-card>
      <el-form :model="liveForm" ref="liveForm" :rules="liveRulesForm" label-width="120px">
        <el-form-item label="直播标题" prop="name">
          <div class="form-field-block">
            <el-input disabled v-model="liveForm.name" style="width:460px"></el-input>
            <div class="tips">直播间名字，最短3个汉字，最长17个汉字，1个汉字相当于2个字符</div>
          </div>
        </el-form-item>
        <el-form-item label="主播昵称" prop="anchorName">
          <div class="form-field-block">
            <el-input disabled v-model="liveForm.anchorName" style="width:360px"></el-input>
            <div class="tips">主播昵称，最短2个汉字，最长15个汉字，1个汉字相当于2个字符</div>
          </div>
        </el-form-item>
        <el-form-item label="直播时间" prop="startTime">
          <div class="form-field-block">
            <el-date-picker
              class="live-time-picker"
              disabled
              format="YYYY-MM-DD HH:mm"
              type="datetimerange"
              v-model="times"
              @change="handleChangeTime"
              start-placeholder="开始时间"
              end-placeholder="结束时间"
              placeholder="直播计划开始时间-直播计划结束时间"
            />
            <div class="tips">直播开播时间需要在当前时间的10分钟后 并且 开始时间不能在 6 个月后</div>
          </div>
        </el-form-item>

        <el-form-item label="主播微信号" prop="anchorWechat">
          <div class="form-field-block">
            <el-input disabled v-model="liveForm.anchorWechat" style="width:360px" placeholder="主播微信号"></el-input>
            <div class="tips">主播微信号，如果未实名认证，需要先前往“小程序直播”小程序进行<a target="_black" href="https://res.wx.qq.com/op_res/9rSix1dhHfK4rR049JL0PHJ7TpOvkuZ3mE0z7Ou_Etvjf-w1J_jVX0rZqeStLfwh">实名验证</a></div>
          </div>
        </el-form-item>

        <el-form-item label="分享卡片封面" prop="feedsImg">
          <div class="form-field-block">
            <div class="upload-list" v-if="liveForm.feedsImg">
              <img :src="liveForm.feedsImg">
              <div class="upload-list-cover" @click="handleView(liveForm.feedsImg)">
                <span class="view-icon">查看</span>
              </div>
            </div>
            <div class="tips">
              直播间分享图，图片规则：建议像素800*640，大小不超过1M；
            </div>
          </div>
        </el-form-item>

        <el-form-item label="直播间背景墙" prop="coverImg">
          <div class="form-field-block">
            <div class="upload-list" v-if="liveForm.coverImg">
              <img :src="liveForm.coverImg">
              <div class="upload-list-cover" @click="handleView(liveForm.coverImg)">
                <span class="view-icon">查看</span>
              </div>
            </div>
            <div class="tips"> 直播间背景图，图片规则：建议像素1080*1920，大小不超过1M</div>
          </div>
        </el-form-item>

        <el-form-item label="直播间分享图" prop="shareImg">
          <div class="form-field-block">
            <div class="upload-list" v-if="liveForm.shareImg">
              <img :src="liveForm.shareImg">
              <div class="upload-list-cover" @click="handleView(liveForm.shareImg)">
                <span class="view-icon">查看</span>
              </div>
            </div>
            <div class="tips"> 直播间分享图，图片规则：建议像素800*640，大小不超过1M</div>
          </div>
        </el-form-item>

        <el-form-item label="商品" v-if="$route.query.id">
          <div class="form-field-block">
            <el-table class="goods-table" border :data="liveData" style="width: 100%">
            <el-table-column label="商品" min-width="200">
              <template #default="{ row, $index }">
                <div v-if="row" class="flex-goods">
                  <el-badge v-if="$index == 0 || $index == 1" is-dot type="danger" />
                  <img class="thumbnail" :src="row.thumbnail || row.goodsImage">
                  {{ row.goodsName || row.name }}
                </div>
              </template>
            </el-table-column>
            <el-table-column label="价格" min-width="160">
              <template #default="{ row }">
                <div v-if="row">
                  <div v-if="row.priceType == 1">{{ $filters.unitPrice(row.price, '￥') }}</div>
                  <div v-if="row.priceType == 2">{{ $filters.unitPrice(row.price, '￥') }}至{{ $filters.unitPrice(row.price2, '￥') }}</div>
                  <div v-if="row.priceType == 3">
                    {{ $filters.unitPrice(row.price, '￥') }}
                    <span class="original-price">{{ $filters.unitPrice(row.price2, '￥') }}</span>
                  </div>
                </div>
              </template>
            </el-table-column>
            <el-table-column label="库存" width="100">
              <template #default="{ row }">
                <span v-if="row">{{ row.quantity }}</span>
              </template>
            </el-table-column>
          </el-table>
            <div class="tips">
              直播间商品中前两个商品将自动被选为封面，伴随直播间在直播列表中显示
            </div>
          </div>
        </el-form-item>

        <el-form-item>
          <el-button type="primary" @click="createLives()">保存</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-dialog v-model="imageVisible" title="查看图片" width="600px">
      <img :src="imageSrc" v-if="imageVisible" style="width: 100%">
    </el-dialog>
  </div>
</template>

<script>
import { addLiveStoreGoods, getLiveGoods } from "@/api/promotion.js";
export default {
  data() {
    return {
      imageVisible: false,
      imageSrc: "",
      liveForm: {
        name: "",
        anchorName: "",
        anchorWechat: "",
        feedsImg: "",
        coverImg: "",
        shareImg: "",
        startTime: "",
      },
      times: [],
      liveData: [],
      commodityList: "",
    };
  },
  mounted() {
    if (this.$route.query.id) {
      this.getLiveDetail();
    }
    this.accessToken = {
      accessToken: this.getStore("accessToken"),
    };
  },

  methods: {
    handleView(src) {
      this.imageVisible = true;
      this.imageSrc = src;
    },
    handleMaxSize(file) {
      this.$Notice.warning({
        title: "文件大小过大",
        desc: "所选文件大小过大, 不得超过 1M.",
      });
    },
    async getLiveDetail() {
      let result = await getLiveInfo(this.$route.query.id);

      if (result.success) {
        let data = result.result;
        for (let key in data) {
          this.liveForm[key] = data[key];
        }

        this.liveData = data.commodityList;
        this.commodityList = data.commodityList;

        this.times = [
          this.$filters.unixToDate(data.startTime, "yyyy-MM-dd hh:mm"),
          this.$filters.unixToDate(data.endTime, "yyyy-MM-dd hh:mm"),
        ];
        this.liveStatus = data.status;
      }
    },
  },
};
</script>

<style lang="scss" scoped>
:deep(.el-form-item__content) {
  flex-wrap: wrap;
  align-items: flex-start;
}

.form-field-block {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  width: 100%;
}

:deep(.live-time-picker.el-date-editor--datetimerange) {
  width: 360px;
  max-width: 360px;
  flex-grow: 0;
  --el-date-editor-width: 360px;
}

.action {
  display: flex;
  :deep(.el-button) {
    margin: 0 5px !important;
  }
}
.original-price {
  margin-left: 10px;
  color: #999;
  text-decoration: line-through;
}
.thumbnail {
  width: 50px;
  height: 50px;
  border-radius: 0.4em;
}
.flex-goods {
  margin: 10px;
  display: flex;
  align-items: center;
  > img {
    margin-right: 10px;
  }
}
:deep(.el-form-item__content > .tips) {
  flex: 0 0 100%;
}

.tips {
  width: 100%;
  max-width: 460px;
  margin-top: 6px;
  line-height: 1.6;
  color: #999;
  font-size: 12px;
}
.goods-table {
  width: 1000px;
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
.view-icon {
  color: #fff;
  font-size: 20px;
  cursor: pointer;
  margin: 0 2px;
}
</style>
