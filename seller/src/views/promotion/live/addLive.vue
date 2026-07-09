<template>
  <div>
    <el-card v-loading="spinShow" style="position: relative">
      <el-alert type="warning" show-icon :closable="false" style="margin-bottom: 16px">
        为了方便在创建直播间时从选择商品，请尽量提前提审直播商品
      </el-alert>

      <el-form ref="liveForm" :model="liveForm" :rules="liveRulesForm" label-width="120px">
        <el-form-item label="直播标题" prop="name">
          <el-input :disabled="liveStatus != 'NEW'" v-model="liveForm.name" style="width: 460px" />
          <div class="tips">直播间名字，最短3个汉字，最长17个汉字，1个汉字相当于2个字符</div>
        </el-form-item>
        <el-form-item label="主播昵称" prop="anchorName">
          <el-input :disabled="liveStatus != 'NEW'" v-model="liveForm.anchorName" style="width: 360px" />
          <div class="tips">主播昵称，最短2个汉字，最长15个汉字，1个汉字相当于2个字符</div>
        </el-form-item>
        <el-form-item label="直播时间" prop="startTime">
          <div class="form-field-block">
            <el-date-picker
              class="live-time-picker"
              :disabled="liveStatus != 'NEW'"
              v-model="times"
              type="datetimerange"
              value-format="YYYY-MM-DD HH:mm"
              :disabled-date="disabledDate"
              start-placeholder="开始时间"
              end-placeholder="结束时间"
              @change="handleChangeTime"
            />
            <div class="tips">
              直播开播时间需要在当前时间的10分钟后并且,开始时间不能在6个月后,直播计划结束时间（开播时间和结束时间间隔不得短于30分钟，不得超过24小时）
            </div>
          </div>
        </el-form-item>
        <el-form-item label="主播微信号" prop="anchorWechat">
          <el-input
            :disabled="liveStatus != 'NEW'"
            v-model="liveForm.anchorWechat"
            style="width: 360px"
            placeholder="主播微信号"
          />
          <div class="tips">
            主播微信号，如果未实名认证，需要先前往“小程序直播”小程序进行
            <a
              target="_blank"
              href="https://res.wx.qq.com/op_res/9rSix1dhHfK4rR049JL0PHJ7TpOvkuZ3mE0z7Ou_Etvjf-w1J_jVX0rZqeStLfwh"
            >实名验证</a>
          </div>
        </el-form-item>
        <el-form-item label="分享卡片封面" prop="feedsImg">
          <upload-pic-thumb v-model="liveForm.feedsImg" :multiple="false" />
          <div class="tips">直播间分享图，图片规则：建议像素800*640，大小不超过1M；</div>
        </el-form-item>
        <el-form-item label="直播间背景墙" prop="coverImg">
          <upload-pic-thumb v-model="liveForm.coverImg" :multiple="false" />
          <div class="tips">直播间背景图，图片规则：建议像素1080*1920，大小不超过1M</div>
        </el-form-item>
        <el-form-item label="直播间分享图" prop="shareImg">
          <upload-pic-thumb v-model="liveForm.shareImg" :multiple="false" />
          <div class="tips">直播间分享图，图片规则：建议像素800*640，大小不超过1M</div>
        </el-form-item>

        <el-form-item v-if="$route.query.id" label="商品">
          <el-button type="primary" plain :disabled="liveStatus != 'NEW'" @click="liveGoodsVisible = true">
            添加商品
          </el-button>
          <el-table class="goods-table" :data="liveData" style="width: 100%">
            <el-table-column label="商品" min-width="200">
              <template #default="{ row, $index }">
                <div class="flex-goods">
                  <el-badge v-if="$index === 0 || $index === 1" value=" " type="danger" />
                  <img class="thumbnail" :src="row.thumbnail || row.goodsImage" alt="" />
                  {{ row.goodsName || row.name }}
                </div>
              </template>
            </el-table-column>
            <el-table-column label="价格" min-width="150">
              <template #default="{ row }">
                <div v-if="row.priceType == 1">{{ $filters.unitPrice(row.price, "￥") }}</div>
                <div v-if="row.priceType == 2">
                  {{ $filters.unitPrice(row.price, "￥") }}至{{ $filters.unitPrice(row.price2, "￥") }}
                </div>
                <div v-if="row.priceType == 3">
                  {{ $filters.unitPrice(row.price2, "￥") }}
                  <span class="original-price">{{ $filters.unitPrice(row.price, "￥") }}</span>
                </div>
              </template>
            </el-table-column>
            <el-table-column label="库存" width="100">
              <template #default="{ row }">{{ row.quantity }}</template>
            </el-table-column>
            <el-table-column label="操作" width="250">
              <template #default="{ row, $index }">
                <div class="action">
                  <template v-if="liveStatus == 'NEW'">
                    <a class="link-text" @click="deleteGoods(row, $index)">删除</a>
                    <span class="op-split">|</span>
                    <a class="link-text" @click="onMove(row.id, 1)">上移</a>
                    <span class="op-split">|</span>
                    <a class="link-text" @click="onMove(row.id, 0)">下移</a>
                  </template>
                </div>
              </template>
            </el-table-column>
          </el-table>
          <div class="tips">直播间商品中前两个商品将自动被选为封面，伴随直播间在直播列表中显示</div>
        </el-form-item>

        <el-form-item>
          <el-button v-if="liveStatus == 'NEW'" type="primary" @click="createLives">保存</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-dialog v-model="imageVisible" title="查看图片" width="600px">
      <img v-if="imageVisible" :src="imageSrc" style="width: 100%" alt="" />
    </el-dialog>

    <el-dialog v-model="liveGoodsVisible" width="800px">
      <liveGoods reviewed @selectedGoods="callBackData" />
    </el-dialog>
  </div>
</template>

<script>
import { uploadFile } from "@/libs/axios";
import uploadPicThumb from "@/views/my-components/lili/upload-pic-thumb";
import { addLive, addLiveGoods, editLive, getLiveInfo, delRoomLiveGoods } from "@/api/promotion";
import liveGoods from "./liveGoods";

export default {
  components: { liveGoods, uploadPicThumb },
  data() {
    return {
      spinShow: false,
      liveGoodsVisible: false,
      imageVisible: false,
      imageSrc: "",
      action: uploadFile,
      accessToken: {},
      liveStatus: "NEW",
      liveRulesForm: {
        name: [
          { required: true, message: "请输入直播标题", trigger: "blur" },
          { max: 17, min: 3, message: "直播间名字最短3个汉字，最长17个汉字" },
        ],
        anchorName: [
          { required: true, message: "请输入主播昵称", trigger: "blur" },
          { max: 15, min: 2, message: "主播昵称最短2个汉字，最长15个汉字" },
        ],
        anchorWechat: [{ required: true, message: "请输入主播微信号", trigger: "blur" }],
        startTime: [{ required: true, message: "请正确输入开始时间以及结束时间" }],
        feedsImg: [{ required: true, message: "分享卡片封面不能为空", trigger: "blur" }],
        coverImg: [{ required: true, message: "直播间背景墙不能为空", trigger: "blur" }],
        shareImg: [{ required: true, message: "直播间分享图不能为空", trigger: "blur" }],
      },
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
    };
  },
  mounted() {
    if (this.$route.query.id) {
      this.getLiveDetail();
    }
    this.accessToken = { accessToken: this.getStore("accessToken") };
  },
  methods: {
    disabledDate(date) {
      return date && date.valueOf() < Date.now() - 86400000;
    },
    async deleteGoods(val, index) {
      this.spinShow = true;
      const res = await delRoomLiveGoods(this.liveForm.roomId, val.liveGoodsId);
      if (res.success) {
        this.$Message.success("删除成功!");
        this.liveData.splice(index, 1);
      }
      this.spinShow = false;
    },
    async getLiveDetail() {
      const result = await getLiveInfo(this.$route.query.id);
      if (result.success) {
        const data = result.result;
        for (const key in data) {
          this.liveForm[key] = data[key];
        }
        this.liveData = data.commodityList;
        this.times = [
          this.$filters.unixToDate(data.startTime, "yyyy-MM-dd hh:mm"),
          this.$filters.unixToDate(data.endTime, "yyyy-MM-dd hh:mm"),
        ];
        this.liveStatus = data.status;
      }
    },
    onMove(code, dir) {
      const moveComm = (curIndex, nextIndex) => {
        const arr = this.liveData;
        arr[curIndex] = arr.splice(nextIndex, 1, arr[curIndex])[0];
        return arr;
      };
      this.liveData.some((val, index) => {
        if (val.id === code) {
          if (dir === 1 && index === 0) {
            this.$Message.warning("已在顶部！");
          } else if (dir === 0 && index === this.liveData.length - 1) {
            this.$Message.warning("已在底部！");
          } else {
            const nextIndex = dir === 1 ? index - 1 : index + 1;
            this.liveData = moveComm(index, nextIndex);
          }
          return true;
        }
        return false;
      });
    },
    callBackData(way) {
      this.liveGoodsVisible = false;
      this.spinShow = true;
      addLiveGoods({
        roomId: this.$route.query.roomId,
        liveGoodsId: way.liveGoodsId,
        goodsId: way.goodsId,
      }).then((res) => {
        if (res.success) {
          this.liveData.push(way);
        }
        this.spinShow = false;
      });
    },
    tipsDateError() {
      this.$Message.error(
        "直播开播时间需要在当前时间的10分钟后并且,开始时间不能在6个月后,直播计划结束时间（开播时间和结束时间间隔不得短于30分钟，不得超过24小时）"
      );
    },
    handleChangeTime(daterange) {
      if (!daterange || daterange.length !== 2) return;
      const siteTime = new Date().getTime() / 1000;
      const selectTime = new Date(daterange[0]).getTime() / 1000;
      const endTime = new Date(daterange[1]).getTime() / 1000;
      if (selectTime <= siteTime + 15 * 60) {
        this.tipsDateError();
        return;
      }
      if (selectTime + 30 * 60 >= endTime || selectTime + 24 * 60 * 60 <= endTime) {
        this.tipsDateError();
        return;
      }
      this.liveForm.startTime = selectTime;
      this.liveForm.endTime = endTime;
    },
    createLives() {
      this.$refs.liveForm.validate((valid) => {
        if (!valid) return;
        this.spinShow = true;
        if (this.$route.query.id) {
          this.liveForm.commodityList = JSON.stringify(this.liveForm.commodityList);
          delete this.liveForm.updateTime;
          editLive(this.liveForm).then((res) => {
            if (res.success) {
              this.$Message.success("修改成功!");
              this.$router.push({ path: "/promotion/live" });
            }
            this.spinShow = false;
          });
        } else {
          addLive(this.liveForm).then((res) => {
            if (res.success) {
              this.$Message.success("添加成功!");
              this.$router.push({ path: "/live" });
            }
            this.spinShow = false;
          });
        }
      });
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
.link-text {
  color: #409eff;
  cursor: pointer;
  text-decoration: none;
}
.op-split {
  margin: 0 8px;
  color: #dcdee2;
}
</style>
