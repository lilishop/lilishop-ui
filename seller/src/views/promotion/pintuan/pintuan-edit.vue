<template>
  <div class="new-pintuan">
    <el-card>
      <el-form ref="formRef" :model="form" label-width="130px" :rules="formValidate">
        <el-form-item label="活动名称" prop="promotionName">
          <div class="form-field-block">
            <el-input
              v-model="form.promotionName"
              clearable
              style="width: 260px"
              maxlength="25"
              placeholder="请输入活动名称"
            />
            <div class="form-tip">
              活动名称将显示在店铺拼团活动列表中，供商家管理使用，最多输入25个字符
            </div>
          </div>
        </el-form-item>
        <el-form-item label="活动时间" prop="rangeTime">
          <div class="form-field-block">
            <el-date-picker
              v-model="form.rangeTime"
              class="pintuan-range-picker"
              type="datetimerange"
              format="YYYY-MM-DD HH:mm:ss"
              start-placeholder="开始时间"
              end-placeholder="结束时间"
              placeholder="请选择"
              :disabled-date="options.disabledDate"
            />
          </div>
        </el-form-item>
        <el-form-item label="成团人数" prop="requiredNum">
          <div class="form-field-block">
            <el-input v-model="form.requiredNum" style="width: 260px" placeholder="请输入成团人数">
              <template #append>人</template>
            </el-input>
            <div class="form-tip">成团人数最少为2人，最多不超过10人。</div>
          </div>
        </el-form-item>
        <el-form-item label="限购数量" prop="limitNum">
          <div class="form-field-block">
            <el-input v-model="form.limitNum" type="number" style="width: 260px" placeholder="请输入限购数量">
              <template #append>件/人</template>
            </el-input>
            <div class="form-tip">若设置为0，则为不限制购买数量。</div>
          </div>
        </el-form-item>
        <el-form-item label="虚拟成团" prop="fictitious">
          <div class="form-field-block">
            <el-radio-group v-model="form.fictitious">
              <el-radio-button :value="1">开启</el-radio-button>
              <el-radio-button :value="0">关闭</el-radio-button>
            </el-radio-group>
            <div class="form-tip">
              开启虚拟成团后，24小时内人数未满的团，系统将会模拟匿名买家凑满人数，使该团成团。您只需要对真实拼团买家发货。建议合理开启，以提高成团率。
            </div>
          </div>
        </el-form-item>
        <el-form-item label="拼团商品">
          <div class="form-field-block">
            <div class="operation">
              <el-button type="primary" @click="openSkuList">选择商品</el-button>
            </div>
            <el-table v-if="goodsData.length" border :data="goodsData" style="width: 100%">
              <el-table-column label="商品名称" min-width="200">
                <template #default="{ row }">
                  <div class="goods-cell">
                    <img v-if="row?.thumbnail" :src="row.thumbnail" class="goods-thumb" alt="" />
                    <span class="goods-name">{{ row?.goodsName }}</span>
                  </div>
                </template>
              </el-table-column>
              <el-table-column label="SKU编码" min-width="140" show-overflow-tooltip>
                <template #default="{ row }">
                  {{ row?.sn || "-" }}
                </template>
              </el-table-column>
              <el-table-column label="规格" min-width="120" show-overflow-tooltip>
                <template #default="{ row }">
                  {{ row?.simpleSpecs || "-" }}
                </template>
              </el-table-column>
              <el-table-column label="原价" width="110">
                <template #default="{ row }">
                  <span v-if="row">{{ $filters.unitPrice(row.originalPrice, "￥") }}</span>
                </template>
              </el-table-column>
              <el-table-column label="拼团价" width="160">
                <template #default="{ row }">
                  <el-input-number
                    v-if="row"
                    v-model="row.price"
                    :min="promotionPriceMin(row.goodsType)"
                    :precision="2"
                    :controls="false"
                    size="small"
                    style="width: 100%"
                  />
                </template>
              </el-table-column>
              <el-table-column label="拼团库存" width="160">
                <template #default="{ row }">
                  <el-input-number
                    v-if="row"
                    v-model="row.quantity"
                    :min="1"
                    :precision="0"
                    :controls="false"
                    size="small"
                    style="width: 100%"
                  />
                </template>
              </el-table-column>
              <el-table-column label="操作" width="90" align="right">
                <template #default="{ $index }">
                  <a class="link-text" @click="delGoods($index)">删除</a>
                </template>
              </el-table-column>
            </el-table>
            <div class="form-tip">
              可不添加商品直接创建活动，后续通过拼团活动列表的「管理」入口添加商品
            </div>
          </div>
        </el-form-item>
        <el-form-item>
          <el-button @click="closeCurrentPage">返回</el-button>
          <el-button type="primary" :loading="submitLoading" @click="handleSubmit">提交</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <liliDialog ref="liliDialogRef" @selectedGoodsData="selectedGoodsData" />
  </div>
</template>

<script setup>
import { onMounted, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import { savePintuan, editPintuan, getPintuanDetail } from "@/api/promotion";
import liliDialog from "@/views/lili-dialog";
import { promotionPriceMin } from "@/constants/goodsType";
import { Message } from "@/utils/message";
import { unixToDate } from "@/utils/filters";

const route = useRoute();
const router = useRouter();

const id = ref(route.query.id);
const form = ref({
  promotionName: "",
  promotionTitle: "",
  requiredNum: "",
  fictitious: 0,
  limitNum: "",
  startTime: "",
  endTime: "",
  rangeTime: [],
});
const formValidate = ref({
  promotionName: [{ required: true, message: "活动名称不能为空", trigger: "blur" }],
  requiredNum: [
    { required: true, message: "成团人数不能为空", trigger: "blur" },
    {
      pattern: /^([2-9]|10)?$/,
      message: "成团人数不合法",
      trigger: "blur",
    },
  ],
  limitNum: [
    { required: true, message: "限购数量不能为空", trigger: "blur" },
    {
      pattern: /^(0|[1-9]\d?|100)$/,
      message: "限购数量不合法",
      trigger: "blur",
    },
  ],
  rangeTime: [{ required: true, message: "请选择活动时间", trigger: "change" }],
});
const submitLoading = ref(false);
const options = ref({
  disabledDate(date) {
    return date && date.valueOf() < Date.now() - 86400000;
  },
});

const formRef = ref(null);
const liliDialogRef = ref(null);
const goodsData = ref([]);

onMounted(() => {
  if (id.value) {
    getDetail();
  } else {
    const now = new Date();
    form.value.rangeTime = [now, new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)];
  }
});

function closeCurrentPage() {
  router.back();
}

function openSkuList() {
  const data = JSON.parse(JSON.stringify(goodsData.value));
  data.forEach((e) => {
    e.id = e.skuId;
  });
  liliDialogRef.value.goodsData = data;
  liliDialogRef.value.open("goods");
}

function selectedGoodsData(selected) {
  const existingMap = new Map(goodsData.value.map((item) => [item.skuId, item]));
  goodsData.value = selected.map((item) => {
    const existed = existingMap.get(item.id);
    if (existed) {
      return existed;
    }
    return {
      goodsName: item.goodsName,
      sn: item.sn,
      simpleSpecs: item.simpleSpecs,
      price: item.price,
      originalPrice: item.price,
      quantity: item.quantity,
      storeId: item.storeId,
      sellerName: item.sellerName,
      thumbnail: item.thumbnail,
      skuId: item.id,
      categoryPath: item.categoryPath,
      goodsId: item.goodsId,
      goodsType: item.goodsType,
    };
  });
}

function delGoods(index) {
  goodsData.value.splice(index, 1);
}

function buildGoodsParams(params) {
  if (!goodsData.value.length) {
    delete params.promotionGoodsList;
    return true;
  }
  for (const item of goodsData.value) {
    if (item.price === "" || item.price === null || item.price === undefined) {
      Message.warning(`请填写【${item.goodsName}】的拼团价`);
      return false;
    }
    if (!item.quantity || item.quantity <= 0) {
      Message.warning(`请填写【${item.goodsName}】的拼团库存`);
      return false;
    }
  }
  params.promotionGoodsList = goodsData.value.map((item) => ({
    ...item,
    promotionId: id.value,
    startTime: params.startTime,
    endTime: params.endTime,
  }));
  params.scopeId = goodsData.value.map((item) => item.skuId).join(",");
  return true;
}

function handleSubmit() {
  formRef.value.validate((valid) => {
    if (!valid) return;
    submitLoading.value = true;
    const params = JSON.parse(JSON.stringify(form.value));
    params.fictitious = !!params.fictitious;
    params.startTime = unixToDate(form.value.rangeTime[0] / 1000);
    params.endTime = unixToDate(form.value.rangeTime[1] / 1000);

    if (!params.startTime || !params.endTime) {
      Message.error("活动时间不能为空");
      submitLoading.value = false;
      return;
    }

    delete params.rangeTime;
    if (!buildGoodsParams(params)) {
      submitLoading.value = false;
      return;
    }
    if (!id.value) {
      delete params.id;
      savePintuan(params)
        .then((res) => {
          if (res.success) {
            Message.success("拼团活动添加成功");
            closeCurrentPage();
          }
        })
        .catch(() => {})
        .finally(() => {
          submitLoading.value = false;
        });
    } else {
      editPintuan(params)
        .then((res) => {
          if (res.success) {
            Message.success("编辑成功");
            closeCurrentPage();
          }
        })
        .catch(() => {})
        .finally(() => {
          submitLoading.value = false;
        });
    }
  });
}
function getDetail() {
  getPintuanDetail(id.value).then((res) => {
    if (res.success) {
      const data = res.result;
      goodsData.value = data.promotionGoodsList || [];
      delete data.promotionGoodsList;
      data.rangeTime = [new Date(data.startTime), new Date(data.endTime)];
      form.value = data;
      form.value.fictitious = data.fictitious ? 1 : 0;
    }
  });
}
</script>

<style lang="scss" scoped>
.new-pintuan {
  :deep(.el-form-item__label) {
    color: #000;
  }

  :deep(.pintuan-range-picker.el-date-editor--datetimerange) {
    width: 400px;
    max-width: 100%;
    flex-grow: 0;
  }
}

.form-field-block {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  width: 100%;
}

.form-tip {
  color: #666666;
  font-size: 12px;
  line-height: 1.5;
  margin-top: 4px;
  width: 100%;
  max-width: 720px;
}

.operation {
  margin-bottom: 10px;
  display: flex;
  gap: 10px;
}

.goods-cell {
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
}

.goods-thumb {
  width: 40px;
  height: 40px;
  object-fit: cover;
  border-radius: 4px;
  flex-shrink: 0;
}

.goods-name {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.link-text {
  color: #409eff;
  cursor: pointer;
  text-decoration: none;
}
</style>
