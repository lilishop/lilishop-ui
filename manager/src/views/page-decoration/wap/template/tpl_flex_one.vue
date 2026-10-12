<template>
    <div
        class="layout"
        :style="{
            background: res.bgColor ?? 'transparent',
            padding: `${res.paddingTop ?? 0}px ${res.paddingX ?? 0}px ${res.paddingBottom ?? 0}px`,
            marginBottom: (res.pageGap ?? 0) + 'px',
            borderRadius: (res.borderRadius ?? 0) + 'px',
            overflow: (res.borderRadius ?? 0) > 0 ? 'hidden' : 'visible',
        }"
    >
        <div class="flex-one" :style="{ borderRadius: (res.imgRadius ?? 0) + 'px' }">
            <img :src="res.list[0].img" alt="">
        </div>
    </div>
</template>
<script>
export default {
    props: ['res']
}
</script>
<style lang="scss" scoped>
@import './tpl.scss';
.flex-one{
    width: 100%;
    display: block;
    overflow: hidden;
    >img{
        width: 100%;
        height: 100%;
    }
}
</style>
