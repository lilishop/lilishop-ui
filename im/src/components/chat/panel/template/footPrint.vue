<template>
    <div>
        最近浏览
        <dl>
            <dd v-for="(item, index) in list">
                <div class="base" @click="linkToGoods(item.goodsId,item.id)">
                    <div>
                        <img :src="item.thumbnail" class="image" />
                    </div>
                    <div style="margin-left: 13px">
                        <a>{{ item.goodsName }}</a>
                        <div>
                            <span style="color: red;">￥{{ item.price }}</span>
                        </div>
                    </div>
                </div>
            </dd>
        </dl>
    </div>
</template>

<script>
import { Tag, button } from 'element-ui'
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
        list: {
            type: Array,
            default: [],
        },
    },
}

</script>

<style scoped lang="less">
.store-button {
    background-color: white;
    border-color: #F56C6C;
}

.base {
    margin-top: 5px;
    height: 120px;
    display: flex;

    div {
        margin-top: 4px;
    }

    .image {
        height: 100px;
        margin-top: 3px;
        width: 100px
    }

}

.separate {
    margin-top: 8px;
}
</style>