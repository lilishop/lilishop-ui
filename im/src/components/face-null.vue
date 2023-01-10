<template>
    <img :src="'https://avatars.dicebear.com/api/initials/'+text+'.svg?fontSize=38'" alt=""/>
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