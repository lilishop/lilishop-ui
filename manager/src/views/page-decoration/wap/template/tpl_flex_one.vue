<template>
    <div
        class="layout"
        :style="{
            background: wrapperBg,
            padding: `${px(res.paddingTop ?? 0)} ${px(res.paddingX ?? 0)} ${px(res.paddingBottom ?? 0)}`,
            marginBottom: px(res.pageGap ?? 0),
            borderRadius: px(res.borderRadius ?? 0),
            overflow: (res.borderRadius ?? 0) > 0 ? 'hidden' : 'visible',
        }"
    >
        <div class="flex-one" :style="{ borderRadius: px(res.imgRadius ?? 0) }">
            <img :src="res.list[0].img" alt="">
        </div>
    </div>
</template>
<script setup>
import { computed } from 'vue'
const props = defineProps(['res'])
const px = (v) => `${(Number(v) || 0) / 2}px`
const wrapperBg = computed(() => {
    const r = props.res || {}
    if (r.bgColor1 !== undefined) {
        return !r.bgColor2 || r.bgColor1 === r.bgColor2
            ? r.bgColor1
            : `linear-gradient(180deg, ${r.bgColor1}, ${r.bgColor2})`
    }
    return r.bgColor ?? 'transparent'
})
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
