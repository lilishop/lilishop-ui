<template>
  <div v-if="pageData">
    <Index :page-data="pageData" />
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import Index from './Index.vue'
import { getTopicData } from '@/api/index'

const route = useRoute()

const pageData = ref("")

async function init(id) {
  const res = await getTopicData(id)
  if (res.success) {
    // 直接复用首页就行
    if (res.result.pageData) {
      pageData.value = JSON.parse(res.result.pageData)
    }
  }
}

onMounted(() => {
  // 接收id进行查询
  const id = route.query.id
  init(id)
})
</script>

<style lang="scss" scoped></style>
