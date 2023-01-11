<template>
    <img :src="text" alt=""/>
</template>

<script>
    export default {
        props:{
            text:{
                type:null,
                default:''
            }
        }
    }
</script>

<style lang="scss" scoped>

</style>