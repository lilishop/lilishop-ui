<template>
    <div class="not-enough">
        <div class="nav-bar setup-content">
            <ul class="nav-list">
                <li v-for="(item, index) in conData.options.navList" :class="currentIndex===index?'curr':''" @click="changeCurr(index)" :key="index">
                    <p>{{item.title}}</p>
                    <p>{{item.desc}}</p>
                </li>
            </ul>
            <div class="setup-box nav-setup-box">
                <div>
                    <el-button size="small" @click.stop="handleSelectModel">编辑</el-button>
                </div>
            </div>
        </div>
        <div class="content" v-if="showContent">
            <div v-for="(item, index) in conData.options.list[currentIndex]" :key="index" class="setup-content">
                <img class="goods-img" :src="item.img" :alt="item.name">
                <p>{{item.name}}</p>
                <p>
                    <span>{{ $filters.unitPrice(item.price, '￥') }}</span>
                </p>
                <div class="setup-box">
                    <div>
                        <el-button size="small" @click.stop="handleSelectGoods(item)">编辑</el-button>
                    </div>
                </div>
            </div>
        </div>
        <el-dialog
            v-model="showModal"
            title="装修"
            width="800"
            :close-on-click-modal="false"
            append-to-body
            destroy-on-close
            @close="handleCancelModal">
            <div class="modal-tab-bar" v-if="draftNavList.length">
                <el-button type="primary" size='small' @click="handleAddNav">添加分类</el-button>
                <table cellspacing="0">
                    <thead>
                        <tr>
                            <th width="250">主标题</th>
                            <th width="250">描述</th>
                            <th width="250">操作</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="(item, index) in draftNavList" :key="index">
                            <td><el-input v-model="item.title" /></td>
                            <td><el-input v-model="item.desc" /></td>
                            <td v-if="index!=0">
                                <el-button type="danger" size="small" @click="handleDelNav(index)">删除</el-button>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
            <template #footer>
                <el-button @click="handleCancelModal">取消</el-button>
                <el-button type="primary" @click="handleConfirmModal">确定</el-button>
            </template>
        </el-dialog>
        <el-dialog
            v-model="showGoodsModal"
            title="装修"
            width="600"
            :close-on-click-modal="false"
            append-to-body
            destroy-on-close
            @close="handleCancelGoodsModal">
            <div class="modal-top-advert">
                <div class="modal-form-item modal-form-preview" v-if="selected.img">
                    <img class="show-image goods-preview" :src="selected.img" alt />
                </div>
                <div class="modal-form-item" v-if="selected.name">
                    <span class="modal-label">商品名称：</span>
                    <span>{{ selected.name }}</span>
                </div>
                <div class="modal-form-item" v-if="selected.price">
                    <span class="modal-label">商品价格：</span>
                    <span>{{ $filters.unitPrice(selected.price, '￥') }}</span>
                </div>
                <div class="modal-form-item modal-form-actions">
                    <el-button size="small" type="primary" @click="handleOpenGoodsPicker">选择商品</el-button>
                </div>
            </div>
            <template #footer>
                <el-button @click="handleCancelGoodsModal">取消</el-button>
                <el-button type="primary" @click="handleConfirmGoodsModal">确定</el-button>
            </template>
        </el-dialog>
        <liliDialog
            ref="liliDialog"
            @selectedGoodsData="selectedGoodsData"
        ></liliDialog>
    </div>
</template>
<script setup>
import { nextTick, ref, watch } from "vue";

const props = defineProps({
    data:{
        type: Object,
        default: null
    }
});
const emit = defineEmits(['content']);

const currentIndex = ref(0);
const conData = ref(props.data);
const selected = ref({});
const editTarget = ref(null);
const showModal = ref(false);
const showGoodsModal = ref(false);
const showContent = ref(true);
const draftNavList = ref([]);
const draftGoodsList = ref([]);

const liliDialog = ref(null);

watch(() => props.data, (val) => {
    conData.value = val;
});
watch(conData, (val) => {
    emit('content', val);
});

function cloneList(list) {
    return JSON.parse(JSON.stringify(list || []));
}
function cloneItem(item) {
    return JSON.parse(JSON.stringify(item || {}));
}
function changeCurr(index){
    currentIndex.value = index;
}
function handleSelectModel () {
    draftNavList.value = cloneList(conData.value.options.navList);
    draftGoodsList.value = cloneList(conData.value.options.list);
    showModal.value = true;
}
function handleSelectGoods(item) {
    editTarget.value = item;
    selected.value = cloneItem(item);
    showGoodsModal.value = true;
}
function handleOpenGoodsPicker() {
    liliDialog.value.open('goods', 'single');
    setTimeout(() => {
        liliDialog.value.goodsData = [selected.value];
    }, 500);
}
function selectedGoodsData(val){
    if (!val?.length) return;
    const goods = val[0];
    selected.value.img = goods.thumbnail;
    selected.value.price = goods.price;
    selected.value.name = goods.goodsName;
    selected.value.url = `/goodsDetail?skuId=${goods.id}&goodsId=${goods.goodsId}`;
}
function handleDelNav(index){
    draftNavList.value.splice(index,1);
    draftGoodsList.value.splice(index,1);
}
function handleAddNav(){
    draftNavList.value.push({ title:'', desc:'' });
    draftGoodsList.value.push([
        { img:'', name:'', price:0, url:'' },
        { img:'', name:'', price:0, url:'' },
        { img:'', name:'', price:0, url:'' },
        { img:'', name:'', price:0, url:'' },
        { img:'', name:'', price:0, url:'' },
        { img:'', name:'', price:0, url:'' },
        { img:'', name:'', price:0, url:'' },
        { img:'', name:'', price:0, url:'' },
        { img:'', name:'', price:0, url:'' },
        { img:'', name:'', price:0, url:'' },
    ]);
}
function handleCancelModal() {
    draftNavList.value = [];
    draftGoodsList.value = [];
    showModal.value = false;
}
function handleConfirmModal() {
    conData.value.options.navList = cloneList(draftNavList.value);
    conData.value.options.list = cloneList(draftGoodsList.value);
    draftNavList.value = [];
    draftGoodsList.value = [];
    showContent.value = false;
    nextTick(() => {
        showContent.value = true;
    });
    showModal.value = false;
}
function handleCancelGoodsModal() {
    editTarget.value = null;
    selected.value = {};
    showGoodsModal.value = false;
}
function handleConfirmGoodsModal() {
    if (editTarget.value) {
        Object.assign(editTarget.value, cloneItem(selected.value));
    }
    editTarget.value = null;
    selected.value = {};
    showGoodsModal.value = false;
}
</script>
<style lang="scss" scoped>
@import './setup-box.scss';
.not-enough {
    width: 100%;
}
.nav-bar{
    width: 100%;
    margin-bottom: 10px;
    background-color: rgb(218, 217, 217);
    height: 60px;
    position: relative;
}
.nav-setup-box {
    left: auto;
    right: 0;
    width: 100px;
}
.nav-list {
    display: flex;
    justify-content: center;
    align-items: center;
    width: 100%;
    height: 100%;
    margin: 0;
    padding: 0;
    li{
        padding: 0 30px;
        text-align: center;
        p:nth-child(1){
            font-size: 16px;
            border-radius: 50px;
            padding: 0 7px;
            margin: 0;
            line-height: 1.2;
        }

        p:nth-child(2){
            font-size: 14px;
            color: #999;
            margin: 2px 0 0;
            line-height: 1.2;
        }

        &:hover{
            p{
                color: $theme_color;
            }
            cursor: pointer;
        }
        border-right: 1px solid #eee;
        
    }
    li:last-of-type{
        border: none;
    }
    .curr{
        p:nth-child(1){
            background-color: $theme_color;
            color: #fff;
        }
        p:nth-child(2){
            color: $theme_color;
        }
    }
}

.content{
    display: grid;
    grid-template-columns: repeat(5, 1fr);
    gap: 10px;
    width: 100%;
    box-sizing: border-box;
    >div{
        padding: 10px;
        box-sizing: border-box;
        border: 1px solid #eee;
        min-width: 0;
        .goods-img {
            display: block;
            width: 100%;
            height: auto;
            aspect-ratio: 1;
            object-fit: cover;
        }
        p:nth-of-type(1){
            overflow: hidden;
            width: 100%;
            white-space: nowrap;
            text-overflow:ellipsis;
            margin: 10px 0 5px 0;
        }
        p:nth-of-type(2){
            color: $theme_color;
            font-size: 16px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            span:nth-child(2){
                text-decoration: line-through;
                font-size: 12px;
                color: #999;
            }
        }
    }
}
.goods-preview {
    width: 210px;
    height: 210px;
    object-fit: cover;
}
</style>
