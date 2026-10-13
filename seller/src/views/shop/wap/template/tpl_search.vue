<template>
    <div class="layout">
        <div class="search">
            <el-icon><Search /></el-icon>{{res.list[0].title}}
        </div>
    </div>
</template>
<script setup>
import { Search } from "@element-plus/icons-vue";
defineProps(['res']);
</script>
<style lang="scss" scoped>
@import "./tpl.scss";
.search{
    height: 32px;
    border-radius: 5px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #ededed;
}
.layout{
    background: #fff;
}
</style>