<template>
  <div class="renovation">
    <!-- 左侧模块列表 -->
    <div class="model-list">
      <div class="classification-title">基础模块</div>
      <draggable tag="ul" :list="modelData" v-bind="{group:{ name:'model', pull:'clone',put:false},sort:false, ghostClass: 'ghost'}" @end="handleMoveEnd" @start="handleMoveStart" :move="handleMove">
        <li v-for="(model, index) in modelData" :key="index" class="model-item">
          <Icon :type="model.icon" />
          <span>{{model.name}}</span>
        </li>
      </draggable>
    </div>
    <!-- 中间展示模块 -->
    <div class="show-content">
      <model-form ref="modelForm" :data="modelForm"></model-form>
    </div>
    <!-- 操作按钮 -->
    <div class="btn-bar">
      <Button type="primary" @click="saveTemplate">保存模板</Button>
      <Button class="ml_10" @click="resetTemplate">还原模板</Button>
    </div>
  </div>
</template>
<script>
import { modelData } from "./modelConfig";
import Draggable from "vuedraggable";
import ModelForm from "./modelForm.vue";
import * as API_floor from "@/api/other.js";
export default {
  components: {
    Draggable,
    ModelForm,
  },
  mounted() {
    this.getTemplateItem(this.$route.query.id);
  },
  data() {
    return {
      modelData, // 可选模块数据
      modelForm: { list: [] }, // 模板数据
    };
  },
  methods: {
    saveTemplate() {
      // 保存模板
      this.submitTemplate(this.$route.query.pageShow ? 'OPEN' : 'CLOSE')
    },
    // 提交模板
    submitTemplate(pageShow) {
      this.modelForm.list.unshift(this.$refs.modelForm.navList);
      this.modelForm.list.unshift(this.$refs.modelForm.topAdvert);
      const modelForm = JSON.stringify(this.modelForm);
      const data = {
        id: this.$route.query.id,
        pageData: modelForm,
        pageShow
      };
      API_floor.updateHome(this.$route.query.id, data).then((res) => {
        if (res.success) {
          this.$Message.success("保存模板成功");
        }
      });
    },
    resetTemplate() {
      // 还原模板
      this.getTemplateItem(this.$route.query.id);
    },
    getTemplateItem(id) {
      // 获取模板数据
      API_floor.getHomeData(id).then((res) => {
        if (res.success) {
          let pageData = res.result.pageData;
//           let pageData = {
// 	"list": [{
// 		"type": "topAdvert",
// 		"img": "https://lilishop-oss.oss-cn-beijing.aliyuncs.com/9fc491bd51484690a405ce0fab1bb118.jpeg",
// 		"url": "/merchant?id=1376369067769724928",
// 		"bgColor": "#377CFA",
// 		"size": "1200*80"
// 	}, {
// 		"type": "navBar",
// 		"list": [{
// 			"name": "秒杀",
// 			"url": "/seckill"
// 		}, {
// 			"name": "优惠券",
// 			"url": "/coupon"
// 		}, {
// 			"name": "商家中心",
// 			"url": "https://store-b2b2c.pickmall.cn"
// 		}]
// 	}, {
// 		"type": "carousel",
// 		"name": "图片轮播",
// 		"icon": "md-image",
// 		"showName": "",
// 		"size": "790*340",
// 		"options": {
// 			"list": [{
// 				"img": "https://lilishop-oss.oss-cn-beijing.aliyuncs.com/fda3ca6646a6401b9c4cc664af3a8bb6.png",
// 				"url": "/goodsList?cateId=1348576427264204943"
// 			}, {
// 				"img": "https://lilishop-oss.oss-cn-beijing.aliyuncs.com/885ba98892d048049c158296bc4c6759.png",
// 				"url": "/goodsList?cateId=1348576427268399379"
// 			}, {
// 				"img": "https://lilishop-oss.oss-cn-beijing.aliyuncs.com/8e33ab68ef734558bdc158d6b1b1451f.png",
// 				"url": "/goodsList?cateId=1348576427264204982"
// 			}]
// 		},
// 		"key": "1612497034000_84734",
// 		"model": "carousel_1612497034000_84734"
// 	}, {
// 		"type": "seckill",
// 		"name": "促销活动",
// 		"icon": "md-image",
// 		"showName": "",
// 		"options": {
// 			"list": [{
// 				"time": 6,
// 				"goodsList": [{
// 					"img": "/img/1.389c5949.jpg",
// 					"price": 20,
// 					"originalPrice": 30,
// 					"name": "阿迪达斯三叶草asdasdafads123213a",
// 					"url": ""
// 				}, {
// 					"img": "/img/2.8b41a762.jpg",
// 					"price": 20,
// 					"originalPrice": 30,
// 					"name": "阿迪达斯三叶草asdasdafadsa",
// 					"url": ""
// 				}, {
// 					"img": "/img/3.0448ed98.jpg",
// 					"price": 20,
// 					"originalPrice": 30,
// 					"name": "阿迪达斯三叶草asdasdafadsa",
// 					"url": ""
// 				}, {
// 					"img": "/img/4.b7944e24.jpg",
// 					"price": 20,
// 					"originalPrice": 30,
// 					"name": "阿迪达斯三叶草asdasdafadsa",
// 					"url": ""
// 				}, {
// 					"img": "/img/5.a172e11a.jpg",
// 					"price": 20,
// 					"originalPrice": 30,
// 					"name": "阿迪达斯三叶草asdasdafadsa",
// 					"url": ""
// 				}, {
// 					"img": "/img/1.389c5949.jpg",
// 					"price": 20,
// 					"originalPrice": 30,
// 					"name": "阿迪达斯三叶草asdasdafadsa",
// 					"url": ""
// 				}, {
// 					"img": "/img/2.8b41a762.jpg",
// 					"price": 20,
// 					"originalPrice": 30,
// 					"name": "阿迪达斯三叶草asdasdafadsa",
// 					"url": ""
// 				}, {
// 					"img": "/img/3.0448ed98.jpg",
// 					"price": 20,
// 					"originalPrice": 30,
// 					"name": "阿迪达斯三叶草asdasdafadsa",
// 					"url": ""
// 				}, {
// 					"img": "/img/4.b7944e24.jpg",
// 					"price": 20,
// 					"originalPrice": 30,
// 					"name": "阿迪达斯三叶草asdasdafadsa",
// 					"url": ""
// 				}, {
// 					"img": "/img/5.a172e11a.jpg",
// 					"price": 20,
// 					"originalPrice": 30,
// 					"name": "阿迪达斯三叶草asdasdafadsa",
// 					"url": ""
// 				}]
// 			}, {
// 				"time": 8,
// 				"goodsList": [{
// 					"img": "/img/1.389c5949.jpg",
// 					"url": ""
// 				}, {
// 					"img": "/img/2.8b41a762.jpg",
// 					"url": ""
// 				}, {
// 					"img": "/img/3.0448ed98.jpg",
// 					"url": ""
// 				}, {
// 					"img": "/img/4.b7944e24.jpg",
// 					"url": ""
// 				}, {
// 					"img": "/img/5.a172e11a.jpg",
// 					"url": ""
// 				}]
// 			}, {
// 				"time": 10,
// 				"goodsList": [{
// 					"img": "/img/1.389c5949.jpg",
// 					"url": ""
// 				}, {
// 					"img": "/img/2.8b41a762.jpg",
// 					"url": ""
// 				}, {
// 					"img": "/img/3.0448ed98.jpg",
// 					"url": ""
// 				}, {
// 					"img": "/img/4.b7944e24.jpg",
// 					"url": ""
// 				}, {
// 					"img": "/img/5.a172e11a.jpg",
// 					"url": ""
// 				}]
// 			}, {
// 				"time": 12,
// 				"goodsList": [{
// 					"img": "/img/1.389c5949.jpg",
// 					"url": ""
// 				}, {
// 					"img": "/img/2.8b41a762.jpg",
// 					"url": ""
// 				}, {
// 					"img": "/img/3.0448ed98.jpg",
// 					"url": ""
// 				}, {
// 					"img": "/img/4.b7944e24.jpg",
// 					"url": ""
// 				}, {
// 					"img": "/img/5.a172e11a.jpg",
// 					"url": ""
// 				}]
// 			}, {
// 				"time": 14,
// 				"goodsList": []
// 			}, {
// 				"time": 16,
// 				"goodsList": []
// 			}, {
// 				"time": 18,
// 				"goodsList": []
// 			}]
// 		},
// 		"key": "1628048373000_83760",
// 		"model": "seckill_1628048373000_83760"
// 	}, {
// 		"type": "discountAdvert",
// 		"name": "折扣广告",
// 		"icon": "md-image",
// 		"options": {
// 			"bgImg": "",
// 			"classification": [{
// 				"img": "https://lilishop-oss.oss-cn-beijing.aliyuncs.com/1dd9c20ffad245e89e6dc516d6603719.jpg",
// 				"url": "/goodsDetail?id=1354319273359335424",
// 				"size": "190*210"
// 			}, {
// 				"img": "https://lilishop-oss.oss-cn-beijing.aliyuncs.com/d64d48fa56b340f59bd3064aa8d4bdca.png",
// 				"url": "/goodsDetail?skuId=1376845635973545984&goodsId=1376845635923214336",
// 				"size": "190*210"
// 			}, {
// 				"img": "https://lilishop-oss.oss-cn-beijing.aliyuncs.com/51fc954e0f0f4feda97611a2fecc0ad1.png",
// 				"url": "/goodsDetail?skuId=1376544591066431488&goodsId=1376544590403731456",
// 				"size": "190*210"
// 			}, {
// 				"img": "https://lilishop-oss.oss-cn-beijing.aliyuncs.com/fde5349e6b4c438d884ee36ae8c97096.png",
// 				"url": "/goodsDetail?skuId=1376554436532371456&goodsId=1376554435945168896",
// 				"size": "190*210"
// 			}, {
// 				"img": "https://lilishop-oss.oss-cn-beijing.aliyuncs.com/d64d48fa56b340f59bd3064aa8d4bdca.png",
// 				"url": "/goodsDetail?skuId=1376556775628603392&goodsId=1376556775007846400",
// 				"size": "190*210"
// 			}, {
// 				"img": "https://lilishop-oss.oss-cn-beijing.aliyuncs.com/5259dbfb17fd482894021b86140d2871.png",
// 				"url": "/goodsDetail?skuId=1381792993853308928&goodsId=1377083477941288960",
// 				"size": "190*210"
// 			}, {
// 				"img": "https://lilishop-oss.oss-cn-beijing.aliyuncs.com/a9593607de404546953055f279fd5d54.png",
// 				"url": "/goodsDetail?skuId=1381793060458856448&goodsId=1377085464581767168",
// 				"size": "190*210"
// 			}, {
// 				"img": "https://lilishop-oss.oss-cn-beijing.aliyuncs.com/d53cbd59ce3a4efd8c3c8f476c91f3e9.png",
// 				"url": "/goodsDetail?skuId=1381791842919514112&goodsId=1376443041593688064",
// 				"size": "190*210"
// 			}, {
// 				"img": "https://lilishop-oss.oss-cn-beijing.aliyuncs.com/b95573e65d2b4ffa8e7ed96d94da37c9.png",
// 				"url": "/goodsDetail?skuId=1381792775162298368&goodsId=1377077664103268352",
// 				"size": "190*210"
// 			}, {
// 				"img": "https://lilishop-oss.oss-cn-beijing.aliyuncs.com/6a5182bc98a347a5926e3be24e55719f.png",
// 				"url": "/goodsDetail?skuId=1381793449228894208&goodsId=1377098934119301120",
// 				"size": "190*210"
// 			}],
// 			"brandList": [{
// 				"img": "https://lilishop-oss.oss-cn-beijing.aliyuncs.com/905c55d7dc7044328314c94adfbe6051.png",
// 				"url": "",
// 				"size": "240*105"
// 			}, {
// 				"img": "https://lilishop-oss.oss-cn-beijing.aliyuncs.com/de02941684f6423db05fe84ade7bbf35.png",
// 				"url": "",
// 				"size": "240*105"
// 			}, {
// 				"img": "https://lilishop-oss.oss-cn-beijing.aliyuncs.com/9f6ad605ba4047db90109d45ab9265ca.png",
// 				"url": "",
// 				"size": "240*105"
// 			}, {
// 				"img": "https://lilishop-oss.oss-cn-beijing.aliyuncs.com/0dd24fb3bc554158973a3deda5edfda5.png",
// 				"url": "",
// 				"size": "240*105"
// 			}]
// 		},
// 		"key": "1612497041000_99064",
// 		"model": "discountAdvert_1612497041000_99064"
// 	}, {
// 		"type": "recommend",
// 		"name": "好货推荐",
// 		"icon": "md-image",
// 		"options": {
// 			"contentLeft": {
// 				"title": "发现好货",
// 				"secondTitle": "查看更多",
// 				"bgColor": "#449dae",
// 				"url": "/goodsDetail?id=1346742995118743552",
// 				"list": [{
// 					"img": "https://lilishop-oss.oss-cn-beijing.aliyuncs.com/b20243bc89a149a398b6d7ef9a097938.jpg?x-oss-process=style/400X400",
// 					"name": "小米 (MI)Redmi K40 Pro 白色",
// 					"describe": "也许是每一款经典系列都应该有一个独特的故事吧",
// 					"url": "/goodsDetail?skuId=1376544591276146688&goodsId=1376544590403731456",
// 					"size": "160*160",
// 					"price": 3999
// 				}, {
// 					"img": "https://lilishop-oss.oss-cn-beijing.aliyuncs.com/a4c2b5073fd84d60bfe38d6a6c0044c9.jpeg?x-oss-process=style/400X400",
// 					"name": "一加 OnePlus 9  紫色",
// 					"describe": " 8GB+128GB 5G手机",
// 					"url": "/goodsDetail?skuId=1376373278989352960&goodsId=1376373278360207360",
// 					"size": "80*80",
// 					"price": 3799
// 				}, {
// 					"img": "https://lilishop-oss.oss-cn-beijing.aliyuncs.com/df6377650f94456087316c1c9a381952.jpeg?x-oss-process=style/400X400",
// 					"name": "一加 OnePlus 9  黑色",
// 					"describe": " 8GB+128GB 5G手机",
// 					"url": "/goodsDetail?skuId=1376373279131959296&goodsId=1376373278360207360",
// 					"size": "80*80",
// 					"price": 3899
// 				}, {
// 					"img": "https://lilishop-oss.oss-cn-beijing.aliyuncs.com/30b3030b9bb44e758146d8eca63a1242.jpeg?x-oss-process=style/400X400",
// 					"name": "vivo iQOO 7 黑色",
// 					"describe": "UFS 3.1 双模5G全网通手机",
// 					"url": "/goodsDetail?skuId=1376521744352804864&goodsId=1376521743522332672",
// 					"size": "80*80",
// 					"price": 4198
// 				}, {
// 					"img": "https://lilishop-oss.oss-cn-beijing.aliyuncs.com/d86a06718d88422baf7422cb0d8b71db.jpeg?x-oss-process=style/400X400",
// 					"name": "vivo iQOO 7 白色",
// 					"describe": "UFS 3.1 双模5G全网通手机",
// 					"url": "/goodsDetail?skuId=1376521744608657408&goodsId=1376521743522332672",
// 					"size": "80*80",
// 					"price": 4298
// 				}, {
// 					"img": "https://lilishop-oss.oss-cn-beijing.aliyuncs.com/b3dccb22364f42c9bec193d64f140abb.jpg?x-oss-process=style/400X400",
// 					"name": "Apple iPhone 12 黑色",
// 					"describe": " 移动联通电信5G全网通手机",
// 					"url": "/goodsDetail?skuId=1376529926336806912&goodsId=1376529925690884096",
// 					"size": "80*80",
// 					"price": 4200
// 				}, {
// 					"img": "https://lilishop-oss.oss-cn-beijing.aliyuncs.com/af4e8d5341b1433c8d23d44dbf9bf37f.jpg?x-oss-process=style/400X400",
// 					"name": "Apple iPhone 12 白色",
// 					"describe": " 移动联通电信5G全网通手机",
// 					"url": "/goodsDetail?skuId=1376529926533939200&goodsId=1376529925690884096",
// 					"size": "80*80",
// 					"price": 4100
// 				}]
// 			},
// 			"contentRight": {
// 				"title": "特色推荐",
// 				"secondTitle": "查看更多",
// 				"bgColor": "#a25684",
// 				"url": "/goodsDetail?skuId=1376541893952798720&goodsId=1376541893319458816",
// 				"list": [{
// 					"img": "https://lilishop-oss.oss-cn-beijing.aliyuncs.com/0544e5c117a348998d80061f7a900400.jpg?x-oss-process=style/400X400",
// 					"name": "佳能 EOS 200D II ",
// 					"describe": "佳能(Canon) 2代数码单反相机",
// 					"url": "/goodsDetail?skuId=1376541893755666432&goodsId=1376541893319458816",
// 					"size": "220*110",
// 					"price": 4449
// 				}, {
// 					"img": "https://lilishop-oss.oss-cn-beijing.aliyuncs.com/e58eae43b3784a1bb1bdf13937442e2d.jpg?x-oss-process=style/400X400",
// 					"name": "荣耀Play4T Pro 黑色",
// 					"describe": "骁龙865丨30W快充",
// 					"url": "/goodsDetail?skuId=1376547794663243776&goodsId=1376547793954406400",
// 					"size": "220*110",
// 					"price": 2999
// 				}, {
// 					"img": "https://lilishop-oss.oss-cn-beijing.aliyuncs.com/745f6ef25634428a8b1972ce23c9c7b3.jpg?x-oss-process=style/400X400",
// 					"name": "小米Redmi K30 ",
// 					"describe": "小米（MI）至尊纪念版",
// 					"url": "/goodsDetail?skuId=1376554436532371456&goodsId=1376554435945168896",
// 					"size": "220*110",
// 					"price": 3000
// 				}, {
// 					"img": "https://lilishop-oss.oss-cn-beijing.aliyuncs.com/5fc6e64e189c4c378e72757af663ff3a.png?x-oss-process=style/400X400",
// 					"name": "魅族12 白色",
// 					"describe": "2K四曲微弧屏丨4400W前摄光学防抖",
// 					"url": "/goodsDetail?skuId=1376559979762286592&goodsId=1376559979007311872",
// 					"size": "220*110",
// 					"price": 4999
// 				}]
// 			}
// 		},
// 		"key": "1612497146000_38763",
// 		"model": "recommend_1612497146000_38763"
// 	}, {
// 		"type": "newGoodsSort",
// 		"name": "新品排行",
// 		"icon": "md-image",
// 		"options": {
// 			"left": {
// 				"title": "特卖",
// 				"secondTitle": "更333",
// 				"bgColor": "#c43d7e",
// 				"url": "/goodsDetail?id=1346742995596894208",
// 				"list": [{
// 					"name": "小米（MI）Redmi K30 至尊纪念版 白色",
// 					"describe": "满269减50,满999减100",
// 					"img": "https://lilishop-oss.oss-cn-beijing.aliyuncs.com/6fed4b19c53c4b88a5123301dede09c9.jpg?x-oss-process=style/400X400",
// 					"url": "/goodsDetail?skuId=1376554436721115136&goodsId=1376554435945168896",
// 					"size": "160*160",
// 					"price": 4000
// 				}, {
// 					"name": "红气垫 阿玛尼",
// 					"describe": "轻透精华气垫粉底液",
// 					"img": "https://lilishop-oss.oss-cn-beijing.aliyuncs.com/7896c015be3f4418a99e6ca2efcae386.jpg?x-oss-process=style/400X400",
// 					"url": "/goodsDetail?skuId=1381796259035086848&goodsId=1377122967070179328",
// 					"size": "90*90",
// 					"price": 400
// 				}, {
// 					"name": "MAXFACTOR 蜜丝佛陀",
// 					"describe": " 三合一粉底液",
// 					"img": "https://lilishop-oss.oss-cn-beijing.aliyuncs.com/75b2a1a1f4d74470a9da19158ff805ac.jpg?x-oss-process=style/400X400",
// 					"url": "/goodsDetail?skuId=1381796144429924352&goodsId=1377121719424122880",
// 					"size": "90*90",
// 					"price": 333
// 				}, {
// 					"name": "ARMANI阿玛尼",
// 					"describe": "紧颜粉底液 03",
// 					"img": "https://lilishop-oss.oss-cn-beijing.aliyuncs.com/389b2ce90fd0425a8a9d988890ad46d2.jpg?x-oss-process=style/400X400",
// 					"url": "/goodsDetail?skuId=1381789991541145600&goodsId=1377127936569638912",
// 					"size": "90*90",
// 					"price": 666
// 				}, {
// 					"name": "NYX 焕彩16色眼影盘",
// 					"describe": " 大地色",
// 					"img": "https://lilishop-oss.oss-cn-beijing.aliyuncs.com/53b1c3cc1f1d4085917c282179f3e2fa.jpg?x-oss-process=style/400X400",
// 					"url": "/goodsDetail?skuId=1377137907063586816&goodsId=1377137906799345664",
// 					"size": "90*90",
// 					"price": 100
// 				}]
// 			},
// 			"middle": {
// 				"title": "新品",
// 				"secondTitle": "更多新品",
// 				"bgColor": "#e66a07",
// 				"url": "",
// 				"list": [{
// 					"name": "母亲原味牛肉棒",
// 					"describe": "烧烤味",
// 					"img": "https://lilishop-oss.oss-cn-beijing.aliyuncs.com/c9cbc345f3014affbb09a80306303c7c.jpg?x-oss-process=style/400X400",
// 					"url": "/goodsDetail?skuId=1381793449233088512&goodsId=1377098934119301120",
// 					"size": "90*90",
// 					"price": 8
// 				}, {
// 					"name": "百草味 原味芒果干",
// 					"describe": "原味",
// 					"img": "https://lilishop-oss.oss-cn-beijing.aliyuncs.com/54dcb9cd0fea4f1f8243e12d49c28af9.png?x-oss-process=style/400X400",
// 					"url": "/goodsDetail?skuId=1381791842915319808&goodsId=1376443041593688064",
// 					"size": "90*90",
// 					"price": 15
// 				}, {
// 					"name": "YSL 圣罗兰 ",
// 					"describe": "清新花果香",
// 					"img": "https://lilishop-oss.oss-cn-beijing.aliyuncs.com/31731869956848be8fc34f6751136977.jpg?x-oss-process=style/400X400",
// 					"url": "/goodsDetail?skuId=1381796591895052288&goodsId=1377145942322446336",
// 					"size": "90*90",
// 					"price": 886
// 				}, {
// 					"name": "雀巢(Nestle) 威化饼干",
// 					"describe": "牛奶味",
// 					"img": "https://lilishop-oss.oss-cn-beijing.aliyuncs.com/fe5b8167b0264c53836d08a6a7003cf0.jpeg?x-oss-process=style/400X400",
// 					"url": "/goodsDetail?skuId=1381797095073120256&goodsId=1377805575856848896",
// 					"size": "90*90",
// 					"price": 9.9
// 				}, {
// 					"name": "夏威夷果 百草味",
// 					"describe": "坚果 ",
// 					"img": "https://lilishop-oss.oss-cn-beijing.aliyuncs.com/999746fb087a40a280c2ef2c5abb7cc3.jpg?x-oss-process=style/400X400",
// 					"url": "/goodsDetail?skuId=1381792548812488704&goodsId=1377071458592751616",
// 					"size": "90*90",
// 					"price": 37
// 				}, {
// 					"name": "范思哲VERSACE",
// 					"describe": "清新水果香",
// 					"img": "https://lilishop-oss.oss-cn-beijing.aliyuncs.com/9b04d1580fb84e67939392a65b9d708d.jpg?x-oss-process=style/400X400",
// 					"url": "/goodsDetail?skuId=1381796537792724992&goodsId=1377143657961881600",
// 					"size": "90*90",
// 					"price": 199
// 				}]
// 			},
// 			"right": {
// 				"title": "排行榜",
// 				"secondTitle": "精品风向标",
// 				"bgColor": "#b62323",
// 				"url": "",
// 				"list": [{
// 					"name": "小米 (MI)Redmi K40 Pro 黑色",
// 					"price": 2999,
// 					"img": "https://lilishop-oss.oss-cn-beijing.aliyuncs.com/9064c20d62f24bfaa5d3854f72a83c6c.jpg?x-oss-process=style/400X400",
// 					"url": "/goodsDetail?skuId=1376544591066431488&goodsId=1376544590403731456"
// 				}, {
// 					"name": "一加 OnePlus 9  黑色",
// 					"price": 3899,
// 					"img": "https://lilishop-oss.oss-cn-beijing.aliyuncs.com/df6377650f94456087316c1c9a381952.jpeg?x-oss-process=style/400X400",
// 					"url": "/goodsDetail?skuId=1376373279131959296&goodsId=1376373278360207360"
// 				}, {
// 					"name": "一加 OnePlus 9 紫色",
// 					"price": 5000,
// 					"img": "https://lilishop-oss.oss-cn-beijing.aliyuncs.com/cc724307f056420eb14c5bd35608a024.jpg?x-oss-process=style/400X400",
// 					"url": "/goodsDetail?skuId=1376556775628603392&goodsId=1376556775007846400"
// 				}, {
// 					"name": "Apple iPhone 12 白色",
// 					"price": 4100,
// 					"img": "https://lilishop-oss.oss-cn-beijing.aliyuncs.com/af4e8d5341b1433c8d23d44dbf9bf37f.jpg?x-oss-process=style/400X400",
// 					"url": "/goodsDetail?skuId=1376529926533939200&goodsId=1376529925690884096"
// 				}, {
// 					"name": "荣耀Play4T Pro 黑色",
// 					"price": 2999,
// 					"img": "https://lilishop-oss.oss-cn-beijing.aliyuncs.com/e58eae43b3784a1bb1bdf13937442e2d.jpg?x-oss-process=style/400X400",
// 					"url": "/goodsDetail?skuId=1376547794663243776&goodsId=1376547793954406400"
// 				}, {
// 					"name": "魅族12 蓝色",
// 					"price": 3999,
// 					"img": "https://lilishop-oss.oss-cn-beijing.aliyuncs.com/9ebe5bdb79c840ed9619b4fc72de21a9.png?x-oss-process=style/400X400",
// 					"url": "/goodsDetail?skuId=1376559979577737216&goodsId=1376559979007311872"
// 				}]
// 			}
// 		},
// 		"key": "1612497051000_82856",
// 		"model": "newGoodsSort_1612497051000_82856"
// 	}, {
// 		"type": "firstAdvert",
// 		"name": "首页广告",
// 		"icon": "md-image",
// 		"options": {
// 			"list": [{
// 				"name": "爆款直降",
// 				"describe": "爆款最高直降1000元",
// 				"img": "https://lilishop-oss.oss-cn-beijing.aliyuncs.com/24e82e04abb3430399a888e845f74a54.png",
// 				"url": "/goodsDetail?id=1351420391981867008",
// 				"fromColor": "#e89621",
// 				"toColor": "#f5c568",
// 				"size": "170*170"
// 			}, {
// 				"name": "休闲零食",
// 				"describe": "小嘴停不住",
// 				"img": "https://lilishop-oss.oss-cn-beijing.aliyuncs.com/1bed3dd6c8f04397ae598b626391869b.png",
// 				"url": "",
// 				"fromColor": "#325bb4",
// 				"toColor": "#4c9afe",
// 				"size": "170*170"
// 			}, {
// 				"name": "潮流手机",
// 				"describe": "潮流好货无忧购",
// 				"img": "https://lilishop-oss.oss-cn-beijing.aliyuncs.com/8770b83f90c3409694d36f2ef9b559e4.png",
// 				"url": "",
// 				"fromColor": "#1c9daf",
// 				"toColor": "#40cda7",
// 				"size": "170*170"
// 			}, {
// 				"name": "新品好货",
// 				"describe": "新品好货送好礼",
// 				"img": "https://lilishop-oss.oss-cn-beijing.aliyuncs.com/cf8665501b9e4856bb658c17014e35a2.png",
// 				"url": "",
// 				"fromColor": "#d13837",
// 				"toColor": "#df6d4f",
// 				"size": "170*170"
// 			}, {
// 				"name": "LILI生鲜",
// 				"describe": "年货带回家 满199减60",
// 				"img": "https://lilishop-oss.oss-cn-beijing.aliyuncs.com/bd17d2ade7764a049e430d2e2e899b16.png",
// 				"url": "",
// 				"fromColor": "#ca4283",
// 				"toColor": "#eb75cf",
// 				"size": "170*170"
// 			}, {
// 				"name": "LILI众筹",
// 				"describe": "备孕有孕检测仪",
// 				"img": "https://lilishop-oss.oss-cn-beijing.aliyuncs.com/8cd10a71b92c4ff2866f6fdd3a69ded2.png",
// 				"url": "",
// 				"fromColor": "#5d40c1",
// 				"toColor": "#8c5fdb",
// 				"size": "170*170"
// 			}]
// 		},
// 		"key": "1612497063000_39466",
// 		"model": "firstAdvert_1612497063000_39466"
// 	}, {
// 		"type": "newGoodsSort",
// 		"name": "新品排行",
// 		"icon": "md-image",
// 		"options": {
// 			"left": {
// 				"title": "特卖",
// 				"secondTitle": "更多特卖",
// 				"bgColor": "#c43d7e",
// 				"url": "",
// 				"list": [{
// 					"name": "新年心愿单",
// 					"describe": "满269减50,满999减100",
// 					"img": "/img/decorate6.3b8e00a9.jpeg",
// 					"url": "",
// 					"size": "160*160"
// 				}, {
// 					"name": "Ms.Maggie 冬季时尚",
// 					"describe": "满269减50",
// 					"img": "/img/decorate6.3b8e00a9.jpeg",
// 					"url": "",
// 					"size": "90*90"
// 				}, {
// 					"name": "Ms.Maggie 冬季时尚",
// 					"describe": "满269减50",
// 					"img": "/img/decorate6.3b8e00a9.jpeg",
// 					"url": "",
// 					"size": "90*90"
// 				}, {
// 					"name": "Ms.Maggie 冬季时尚",
// 					"describe": "满269减50",
// 					"img": "/img/decorate6.3b8e00a9.jpeg",
// 					"url": "",
// 					"size": "90*90"
// 				}, {
// 					"name": "阿迪达斯 领跑时尚",
// 					"describe": "满269减50",
// 					"img": "/img/decorate6.3b8e00a9.jpeg",
// 					"url": "",
// 					"size": "90*90"
// 				}]
// 			},
// 			"middle": {
// 				"title": "新品",
// 				"secondTitle": "更多新品",
// 				"bgColor": "#e66a07",
// 				"url": "",
// 				"list": [{
// 					"name": "阿迪达斯 领跑时尚",
// 					"describe": "满269减50",
// 					"img": "/img/decorate6.3b8e00a9.jpeg",
// 					"url": "",
// 					"size": "90*90"
// 				}, {
// 					"name": "阿迪达斯 领跑时尚",
// 					"describe": "满269减50",
// 					"img": "/img/decorate6.3b8e00a9.jpeg",
// 					"url": "",
// 					"size": "90*90"
// 				}, {
// 					"name": "阿迪达斯 领跑时尚",
// 					"describe": "满269减50",
// 					"img": "/img/decorate6.3b8e00a9.jpeg",
// 					"url": "",
// 					"size": "90*90"
// 				}, {
// 					"name": "阿迪达斯 领跑时尚",
// 					"describe": "满269减50",
// 					"img": "/img/decorate6.3b8e00a9.jpeg",
// 					"url": "",
// 					"size": "90*90"
// 				}, {
// 					"name": "阿迪达斯 领跑时尚",
// 					"describe": "满269减50",
// 					"img": "/img/decorate6.3b8e00a9.jpeg",
// 					"url": "",
// 					"size": "90*90"
// 				}, {
// 					"name": "阿迪达斯 领跑时尚",
// 					"describe": "满269减50",
// 					"img": "/img/decorate6.3b8e00a9.jpeg",
// 					"url": "",
// 					"size": "90*90"
// 				}]
// 			},
// 			"right": {
// 				"title": "排行榜",
// 				"secondTitle": "精品风向标",
// 				"bgColor": "#b62323",
// 				"url": "",
// 				"list": [{
// 					"name": "小米红米3s手机壳保护套红米3高配版指纹男女款潮版磨砂硬壳防摔 收藏截图 送大礼包",
// 					"price": 14.9,
// 					"img": "/img/decorate7.2e150fd1.jpeg",
// 					"url": ""
// 				}, {
// 					"name": "小米红米3s手机壳保护套红米3高配版指纹男女款潮版磨砂硬壳防摔 收藏截图 送大礼包",
// 					"price": 14.9,
// 					"img": "/img/decorate7.2e150fd1.jpeg",
// 					"url": ""
// 				}, {
// 					"name": "小米红米3s手机壳保护套红米3高配版指纹男女款潮版磨砂硬壳防摔 收藏截图 送大礼包",
// 					"price": 14.9,
// 					"img": "/img/decorate7.2e150fd1.jpeg",
// 					"url": ""
// 				}, {
// 					"name": "小米红米3s手机壳保护套红米3高配版指纹男女款潮版磨砂硬壳防摔 收藏截图 送大礼包",
// 					"price": 14.9,
// 					"img": "/img/decorate7.2e150fd1.jpeg",
// 					"url": ""
// 				}, {
// 					"name": "小米红米3s手机壳保护套红米3高配版指纹男女款潮版磨砂硬壳防摔 收藏截图 送大礼包",
// 					"price": 14.9,
// 					"img": "/img/decorate7.2e150fd1.jpeg",
// 					"url": ""
// 				}, {
// 					"name": "小米红米3s手机壳保护套红米3高配版指纹男女款潮版磨砂硬壳防摔 收藏截图 送大礼包",
// 					"price": 14.9,
// 					"img": "/img/decorate7.2e150fd1.jpeg",
// 					"url": ""
// 				}]
// 			}
// 		}
// 	}, {
// 		"type": "notEnough",
// 		"name": "还没逛够",
// 		"icon": "md-image",
// 		"options": {
// 			"list": [
// 				[{
// 					"img": "https://lilishop-oss.oss-cn-beijing.aliyuncs.com/217488c7baa44c99a447f4e31eb8642f.jpg?x-oss-process=style/400X400",
// 					"name": "肉类零食 白芝麻猪肉脯 香辣味",
// 					"price": 36,
// 					"url": "/goodsDetail?skuId=1381792263700480000&goodsId=1377064344218501120"
// 				}, {
// 					"img": "https://lilishop-oss.oss-cn-beijing.aliyuncs.com/3e7cdac8739c4d338fb0afb770cf5495.jpg?x-oss-process=style/400X400",
// 					"name": "【保税发货】NYX 焕彩16色眼影盘 朱光色",
// 					"price": 100,
// 					"url": "/goodsDetail?skuId=1377137907063586817&goodsId=1377137906799345664"
// 				}, {
// 					"img": "https://lilishop-oss.oss-cn-beijing.aliyuncs.com/389b2ce90fd0425a8a9d988890ad46d2.jpg?x-oss-process=style/400X400",
// 					"name": "ARMANI阿玛尼 新款蓝标大·师 造型紧颜粉底液 03",
// 					"price": 666,
// 					"url": "/goodsDetail?skuId=1381789991541145600&goodsId=1377127936569638912"
// 				}, {
// 					"img": "https://lilishop-oss.oss-cn-beijing.aliyuncs.com/0ebd7f52cb9641d4a0f2596c5e862c35.jpg?x-oss-process=style/400X400",
// 					"name": "欧莱雅复颜视黄醇精粹抗皱护肤套装 水",
// 					"price": 299,
// 					"url": "/goodsDetail?skuId=1381793547266555904&goodsId=1377102418646401024"
// 				}, {
// 					"img": "https://lilishop-oss.oss-cn-beijing.aliyuncs.com/36e66e081a11449cbe03e9c2df884a9f.jpg?x-oss-process=style/400X400",
// 					"name": "妮维雅(NIVEA)男士水活多效洁面乳 保湿",
// 					"price": 23,
// 					"url": "/goodsDetail?skuId=1381795951156396032&goodsId=1377104395929387008"
// 				}, {
// 					"img": "https://lilishop-oss.oss-cn-beijing.aliyuncs.com/d1e7dcda155d454c8f7089298a9bcb82.jpg?x-oss-process=style/400X400",
// 					"name": "【新年礼】花西子x杜鹃定制东方佳人妆奁彩妆 礼物1",
// 					"price": 999,
// 					"url": "/goodsDetail?skuId=1381796022597976064&goodsId=1377106159533555712"
// 				}, {
// 					"img": "https://lilishop-oss.oss-cn-beijing.aliyuncs.com/432970f4d3d24692bd7b68299c260601.jpg?x-oss-process=style/400X400",
// 					"name": "雅诗兰黛（EsteeLauder） 持妆粉底液 01",
// 					"price": 333,
// 					"url": "/goodsDetail?skuId=1381796080479371264&goodsId=1377118965985181696"
// 				}, {
// 					"img": "https://lilishop-oss.oss-cn-beijing.aliyuncs.com/75b2a1a1f4d74470a9da19158ff805ac.jpg?x-oss-process=style/400X400",
// 					"name": "MAXFACTOR 蜜丝佛陀 三合一防晒粉底液  02",
// 					"price": 333,
// 					"url": "/goodsDetail?skuId=1381796144429924352&goodsId=1377121719424122880"
// 				}, {
// 					"img": "https://lilishop-oss.oss-cn-beijing.aliyuncs.com/ba6efdfae1fe4493a6160ca86114845e.jpg?x-oss-process=style/400X400",
// 					"name": "粉色安琪sweetpink公主腮红礼盒 01",
// 					"price": 29,
// 					"url": "/goodsDetail?skuId=1381796202034495488&goodsId=1377129270085681152"
// 				}, {
// 					"img": "https://lilishop-oss.oss-cn-beijing.aliyuncs.com/f4930e4df42c4d80af1ca2a2106e22ad.jpg?x-oss-process=style/400X400",
// 					"name": "红气垫 Armani阿玛尼 轻透精华气垫粉底液 02",
// 					"price": 400,
// 					"url": "/goodsDetail?skuId=1381796259039281152&goodsId=1377122967070179328"
// 				}],
// 				[{
// 					"img": "https://lilishop-oss.oss-cn-beijing.aliyuncs.com/a4c2b5073fd84d60bfe38d6a6c0044c9.jpeg?x-oss-process=style/400X400",
// 					"name": "一加 OnePlus 9  紫色",
// 					"price": 3799,
// 					"url": "/goodsDetail?skuId=1376373278989352960&goodsId=1376373278360207360"
// 				}, {
// 					"img": "https://lilishop-oss.oss-cn-beijing.aliyuncs.com/df6377650f94456087316c1c9a381952.jpeg?x-oss-process=style/400X400",
// 					"name": "一加 OnePlus 9  黑色",
// 					"price": 3899,
// 					"url": "/goodsDetail?skuId=1376373279131959296&goodsId=1376373278360207360"
// 				}, {
// 					"img": "https://lilishop-oss.oss-cn-beijing.aliyuncs.com/30b3030b9bb44e758146d8eca63a1242.jpeg?x-oss-process=style/400X400",
// 					"name": "vivo iQOO 7 黑色",
// 					"price": 4198,
// 					"url": "/goodsDetail?skuId=1376521744352804864&goodsId=1376521743522332672"
// 				}, {
// 					"img": "https://lilishop-oss.oss-cn-beijing.aliyuncs.com/d86a06718d88422baf7422cb0d8b71db.jpeg?x-oss-process=style/400X400",
// 					"name": "vivo iQOO 7 白色",
// 					"price": 4298,
// 					"url": "/goodsDetail?skuId=1376521744608657408&goodsId=1376521743522332672"
// 				}, {
// 					"img": "https://lilishop-oss.oss-cn-beijing.aliyuncs.com/b3dccb22364f42c9bec193d64f140abb.jpg?x-oss-process=style/400X400",
// 					"name": "Apple iPhone 12 黑色",
// 					"price": 4200,
// 					"url": "/goodsDetail?skuId=1376529926336806912&goodsId=1376529925690884096"
// 				}, {
// 					"img": "https://lilishop-oss.oss-cn-beijing.aliyuncs.com/af4e8d5341b1433c8d23d44dbf9bf37f.jpg?x-oss-process=style/400X400",
// 					"name": "Apple iPhone 12 白色",
// 					"price": 4100,
// 					"url": "/goodsDetail?skuId=1376529926533939200&goodsId=1376529925690884096"
// 				}, {
// 					"img": "https://lilishop-oss.oss-cn-beijing.aliyuncs.com/0544e5c117a348998d80061f7a900400.jpg?x-oss-process=style/400X400",
// 					"name": "佳能(Canon) EOS 200D II 2代数码单反相机 白色",
// 					"price": 4449,
// 					"url": "/goodsDetail?skuId=1376541893755666432&goodsId=1376541893319458816"
// 				}, {
// 					"img": "https://lilishop-oss.oss-cn-beijing.aliyuncs.com/299785007b884e6a823c212c839e092c.jpg?x-oss-process=style/400X400",
// 					"name": "佳能(Canon) EOS 200D II 2代数码单反相机 黑色",
// 					"price": 4459,
// 					"url": "/goodsDetail?skuId=1376541893952798720&goodsId=1376541893319458816"
// 				}, {
// 					"img": "https://lilishop-oss.oss-cn-beijing.aliyuncs.com/9064c20d62f24bfaa5d3854f72a83c6c.jpg?x-oss-process=style/400X400",
// 					"name": "小米 (MI)Redmi K40 Pro 黑色",
// 					"price": 2999,
// 					"url": "/goodsDetail?skuId=1376544591066431488&goodsId=1376544590403731456"
// 				}, {
// 					"img": "https://lilishop-oss.oss-cn-beijing.aliyuncs.com/b20243bc89a149a398b6d7ef9a097938.jpg?x-oss-process=style/400X400",
// 					"name": "小米 (MI)Redmi K40 Pro 白色",
// 					"price": 3999,
// 					"url": "/goodsDetail?skuId=1376544591276146688&goodsId=1376544590403731456"
// 				}],
// 				[{
// 					"img": "https://lilishop-oss.oss-cn-beijing.aliyuncs.com/e58eae43b3784a1bb1bdf13937442e2d.jpg?x-oss-process=style/400X400",
// 					"name": "荣耀Play4T Pro 黑色",
// 					"price": 2999,
// 					"url": "/goodsDetail?skuId=1376547794663243776&goodsId=1376547793954406400"
// 				}, {
// 					"img": "https://lilishop-oss.oss-cn-beijing.aliyuncs.com/a91ea16401974fc29364c8be9ca76e83.jpg?x-oss-process=style/400X400",
// 					"name": "荣耀Play4T Pro 绿色",
// 					"price": 2999,
// 					"url": "/goodsDetail?skuId=1376547794856181760&goodsId=1376547793954406400"
// 				}, {
// 					"img": "https://lilishop-oss.oss-cn-beijing.aliyuncs.com/745f6ef25634428a8b1972ce23c9c7b3.jpg?x-oss-process=style/400X400",
// 					"name": "小米（MI）Redmi K30 至尊纪念版 绿色",
// 					"price": 3000,
// 					"url": "/goodsDetail?skuId=1376554436532371456&goodsId=1376554435945168896"
// 				}, {
// 					"img": "https://lilishop-oss.oss-cn-beijing.aliyuncs.com/6fed4b19c53c4b88a5123301dede09c9.jpg?x-oss-process=style/400X400",
// 					"name": "小米（MI）Redmi K30 至尊纪念版 白色",
// 					"price": 4000,
// 					"url": "/goodsDetail?skuId=1376554436721115136&goodsId=1376554435945168896"
// 				}, {
// 					"img": "https://lilishop-oss.oss-cn-beijing.aliyuncs.com/cc724307f056420eb14c5bd35608a024.jpg?x-oss-process=style/400X400",
// 					"name": "一加 OnePlus 9 紫色",
// 					"price": 5000,
// 					"url": "/goodsDetail?skuId=1376556775628603392&goodsId=1376556775007846400"
// 				}, {
// 					"img": "https://lilishop-oss.oss-cn-beijing.aliyuncs.com/7a90d38c4a9f4c8f84f10e53bc204b84.jpg?x-oss-process=style/400X400",
// 					"name": "一加 OnePlus 9 蓝色",
// 					"price": 5000,
// 					"url": "/goodsDetail?skuId=1376556775825735680&goodsId=1376556775007846400"
// 				}, {
// 					"img": "https://lilishop-oss.oss-cn-beijing.aliyuncs.com/9ebe5bdb79c840ed9619b4fc72de21a9.png?x-oss-process=style/400X400",
// 					"name": "魅族12 蓝色",
// 					"price": 3999,
// 					"url": "/goodsDetail?skuId=1376559979577737216&goodsId=1376559979007311872"
// 				}, {
// 					"img": "https://lilishop-oss.oss-cn-beijing.aliyuncs.com/5fc6e64e189c4c378e72757af663ff3a.png?x-oss-process=style/400X400",
// 					"name": "魅族12 白色",
// 					"price": 4999,
// 					"url": "/goodsDetail?skuId=1376559979762286592&goodsId=1376559979007311872"
// 				}, {
// 					"img": "https://lilishop-oss.oss-cn-beijing.aliyuncs.com/230413f3a04b4dfeb4797211a760f0ce.jpg?x-oss-process=style/400X400",
// 					"name": "华为笔记本MateBook  银色",
// 					"price": 2999,
// 					"url": "/goodsDetail?skuId=1376727108025319424&goodsId=1376727107777855488"
// 				}, {
// 					"img": "https://lilishop-oss.oss-cn-beijing.aliyuncs.com/9f66c6e074f9405195eea1c5587da964.jpg?x-oss-process=style/400X400",
// 					"name": "三星Galaxy S21 Ultra ",
// 					"price": 7474,
// 					"url": "/goodsDetail?skuId=1376850145177501696&goodsId=1376850145118781440"
// 				}],
// 				[{
// 					"img": "https://lilishop-oss.oss-cn-beijing.aliyuncs.com/54dcb9cd0fea4f1f8243e12d49c28af9.png?x-oss-process=style/400X400",
// 					"name": "百草味 蜜饯 原味芒果干 一袋",
// 					"price": 15,
// 					"url": "/goodsDetail?skuId=1381791842915319808&goodsId=1376443041593688064"
// 				}, {
// 					"img": "https://lilishop-oss.oss-cn-beijing.aliyuncs.com/ce9a24a34bb34479b9239f07a9425746.jpg?x-oss-process=style/400X400",
// 					"name": "牛肉干 百草味",
// 					"price": 35,
// 					"url": "/goodsDetail?skuId=1381792695176921088&goodsId=1377074868700315648"
// 				}, {
// 					"img": "https://lilishop-oss.oss-cn-beijing.aliyuncs.com/fced3eededaf4018a26af0ebd660238c.jpg?x-oss-process=style/400X400",
// 					"name": "奥利奥夹心饼干 原味",
// 					"price": 35,
// 					"url": "/goodsDetail?skuId=1381792775162298368&goodsId=1377077664103268352"
// 				}, {
// 					"img": "https://lilishop-oss.oss-cn-beijing.aliyuncs.com/58411207ec5946c7950be9d6eccd136c.jpg?x-oss-process=style/400X400",
// 					"name": "奥利奥夹心饼干 巧克力",
// 					"price": 35,
// 					"url": "/goodsDetail?skuId=1381792775170686976&goodsId=1377077664103268352"
// 				}, {
// 					"img": "https://lilishop-oss.oss-cn-beijing.aliyuncs.com/5b87f8d1439b4dd2b1bd7f9c331eb91b.jpg?x-oss-process=style/400X400",
// 					"name": "母亲原味牛肉棒22g 牛肉干特产肉类 麻辣",
// 					"price": 8,
// 					"url": "/goodsDetail?skuId=1381793449228894208&goodsId=1377098934119301120"
// 				}, {
// 					"img": "https://lilishop-oss.oss-cn-beijing.aliyuncs.com/028c7081275d4c1ea1c7aac206162c44.jpg?x-oss-process=style/400X400",
// 					"name": "魔法士干脆面【整箱装-混合口味48袋】魔法师干吃方便面 麻辣牛排",
// 					"price": 2,
// 					"url": "/goodsDetail?skuId=1381793503364775936&goodsId=1377100803117940736"
// 				}, {
// 					"img": "https://lilishop-oss.oss-cn-beijing.aliyuncs.com/fe5b8167b0264c53836d08a6a7003cf0.jpeg?x-oss-process=style/400X400",
// 					"name": "雀巢(Nestle) 脆脆鲨 威化饼干 牛奶味",
// 					"price": 9.9,
// 					"url": "/goodsDetail?skuId=1381797095073120256&goodsId=1377805575856848896"
// 				}, {
// 					"img": "https://lilishop-oss.oss-cn-beijing.aliyuncs.com/6ce1382ba55f4284a86f893cfc79eed8.jpg?x-oss-process=style/400X400",
// 					"name": "雀巢（Nestle）咖啡 奶香味10条",
// 					"price": 39,
// 					"url": "/goodsDetail?skuId=1381791962713030656&goodsId=1377057500825649152"
// 				}, {
// 					"img": "https://lilishop-oss.oss-cn-beijing.aliyuncs.com/72927f793db7454d9109ab0581ace984.jpg?x-oss-process=style/400X400",
// 					"name": "杯口留香酸奶燕麦片 水果燕麦片",
// 					"price": 9,
// 					"url": "/goodsDetail?skuId=1381792469200404480&goodsId=1377070177157382144"
// 				}, {
// 					"img": "https://lilishop-oss.oss-cn-beijing.aliyuncs.com/b7c76242a9914e60a059b2f2dfee168b.jpg?x-oss-process=style/400X400",
// 					"name": "坚果 夏威夷果 奶油味",
// 					"price": 37,
// 					"url": "/goodsDetail?skuId=1381792548808294400&goodsId=1377071458592751616"
// 				}]
// 			],
// 			"navList": [{
// 				"title": "精选",
// 				"desc": "个性美妆"
// 			}, {
// 				"title": "智能先锋",
// 				"desc": "大电器城"
// 			}, {
// 				"title": "居家优品",
// 				"desc": "品质生活"
// 			}, {
// 				"title": "超市百货",
// 				"desc": "百货生鲜"
// 			}]
// 		},
// 		"key": "1612497066000_30831",
// 		"model": "notEnough_1612497066000_30831"
// 	}]
// }
          if (pageData) {
            pageData = JSON.parse(pageData);
            if (pageData.list[0].type === "topAdvert") {
              // topAdvert 为顶部广告 navList为导航栏
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
  width: 120px;
  height: auto;
  padding: 10px;
  background: #fff;
  margin-top: 60px;
  position: fixed;
  z-index: 100;
  box-shadow: 1px 1px 10px #999;
  .classification-title {
    width: 100%;
    height: 30px;
    line-height: 30px;
  }
  .model-item {
    width: 100px;
    height: 30px;
    background: #eee;
    margin-top: 10px;
    line-height: 30px;
    text-align: center;
    color: #999;
    &:hover {
      border: 1px dashed #409eff;
      color: #409eff;
      cursor: move;
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
  top: 100px;
}
</style>
