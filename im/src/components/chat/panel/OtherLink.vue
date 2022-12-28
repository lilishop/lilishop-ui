<template>
    <el-tabs v-model="activeName" @tab-click="handleClick" type="card">
        <el-tab-pane :label="toUser.storeFlag ? '想要咨询' : '他的足迹'" name="history">
            <div style="margin-left: 12px;" v-if="toUser.storeFlag">
                <GoodsLink :goodsDetail="goodsDetail" v-if="toUser.userId === goodsDetail.storeId"/>
                <FootPrint :list="footPrintList"/>
            </div>
            <div v-else>
                
            </div>
        </el-tab-pane>
        <el-tab-pane label="店铺信息" name="UserInfo" v-if="toUser.storeFlag">
            <div v-if="toUser.storeFlag">
                <StoreDetail :storeInfo="storeInfo"/>
            </div>
        </el-tab-pane>
    </el-tabs>
</template>

<script>
import { Tabs, TabPane } from 'element-ui'
import { ServeGetStoreDetail, ServeGetUserDetail, ServeGetFootPrint } from '@/api/user'
import { ServeGetGoodsDetail } from '@/api/goods'
import StoreDetail from "@/components/chat/panel/template/storeDetail.vue";
import FootPrint from "@/components/chat/panel/template/footPrint.vue";
import GoodsLink from "@/components/chat/panel/template/goodsLink.vue";
export default {
    components: {
        "el-tabs": Tabs,
        "el-tab-pane": TabPane,
        StoreDetail,
        FootPrint,
        GoodsLink
    },
    props: {
        toUser: {
            type: Object,
            default: null,
        },
        id: {
            type: String,
            default: '',
        },
        goodsParams: {
            type: Object,
            default: null,
        },
    },
    data() {
        return {
            activeName: 'history',
            storeInfo: {}, //店铺信息
            memberInfo: {}, //会员信息
            footPrintParams: {
                memberId: '',
                storeId: '',
            },
            goodsDetail: {},
            footPrintList: [],
        }
    },
    mounted() {
        console.log(this.id)
        console.log(this.toUser)
        if(this.toUser.storeFlag){
            this.getStoreDetail()
        }else{
            this.getMemberDetail()
        }
        this.getFootPrint()
        if(this.goodsParams){
            this.getGoodsDetail()
        }
    },
    methods: {
        getStoreDetail() {
            ServeGetStoreDetail(this.toUser.userId).then(res => {
                if (res.success) {
                    this.storeInfo = res.result
                }
            })
        },
        handleClick(){},
        getMemberDetail() {
            ServeGetUserDetail(this.toUser.userId).then(res => {
                if (res.success) {
                    this.memberInfo = res.result
                }
            })
        },
        getGoodsDetail(){
            ServeGetGoodsDetail(this.goodsParams).then(res => {
                if(res.success){
                    this.goodsDetail = res.result.data
                }
            })
        },
        getFootPrint(){
            if(this.toUser.storeFlag){
                this.footPrintParams.memberId = this.id
                this.footPrintParams.storeId = this.toUser.userId
            }else{
                this.footPrintParams.memberId = this.toUser.userId
                this.footPrintParams.storeId = this.id
            }
            console.log(this.footPrintParams)
            ServeGetFootPrint(this.footPrintParams).then(res => {
                res.result.records.forEach((item,index) => {
                   if(item.goodsId === this.goodsParams.goodsId){
                    res.result.records.splice(index,1)
                   }
                });
                this.footPrintList = res.result.records
            })
            //删除掉刚加入的商品
        },
    }
}

</script>

<style scoped lang="less">
/deep/ .el-tabs__nav {
    height: 60px;
    line-height: 60px;
}
/deep/ .el-tab-pane {
    margin-left: 12px;
}
</style>