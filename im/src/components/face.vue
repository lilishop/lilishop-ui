<template>
    <img :src="text || 'https://avatars.dicebear.com/api/initials/'+name+'.svg?fontSize=38'" alt=""/>
</template>

<script setup>
    const props = defineProps({
        text: {
            type: null,
            default: ''
        },
        name: {
            type: null,
            default: ''
        },
    });
</script>

<style lang="scss" scoped>

</style>