<template>
  <div class="list-action-bar" role="group" aria-label="列表操作">
    <div class="list-action-bar__primary"><slot /></div>
    <div v-if="$slots.right" class="list-action-bar__secondary"><slot name="right" /></div>
  </div>
</template>

<style lang="scss" scoped>
.list-action-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 12px;
  width: 100%;
  margin-bottom: 16px;

  &__primary,
  &__secondary {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 12px;
  }

  :deep(.el-button + .el-button) {
    margin-left: 0;
  }
}
</style>
