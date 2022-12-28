<template>
    <div>
        <div class="base" >
            <div> 
                <img :src="storeInfo.storeLogo" class="image"/>
            </div>
            <div style="margin-left: 13px">
                <div class="div-zoom">
                    {{ storeInfo.storeName }}
                    <el-tag type="danger" v-if=" storeInfo.selfOperated " size="mini">自营</el-tag>
                </div>
                <div>
                    联系方式: {{ storeInfo.memberName }}
                </div>
                <div>
                    <el-button class="store-button" type="danger" @click="linkToStore(storeInfo.id)" size="mini" plain >进入店铺</el-button>
                </div>
            </div>
        </div>
        <hr class="separate"/>
        <div class="separate">店铺评分: <span>{{ storeInfo.serviceScore }}</span></div>
        <div class="separate">服务评分: <span>{{ storeInfo.descriptionScore }}</span></div>
        <div class="separate">物流评分: <span>{{ storeInfo.deliveryScore }}</span></div>
    </div>
</template>

<script>
import { Tag,button } from 'element-ui'
export default {
    data() {
        return {
        }
    },
    components: {
        "el-tag": Tag,
        "el-button": button,
    },
    methods:{
    },
    props: {
        storeInfo: {
            type: Object,
            default: null,
        },
    },
}

</script>

<style scoped lang="less">
    .store-button{
        background-color: white;
        border-color: #F56C6C;
    }

    .base{
        margin-top: 5px;
        height: 120px;
        display: flex;

        div {
            margin-top: 8px;
        }

        .image{
            height: 100px; 
            margin-top: 3px; 
            width: 100px
        }
        
    }
    .separate{
        margin-top: 8px;
    }
</style>