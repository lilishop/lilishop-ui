<template>
  <div class="wrapper">
    <card _Title="账号绑定"/>
    <div>
      <Row class="bindItem">
        <Col :span="2">

        </Col>
        <Col :span="16">
          <div class="setDivItem">
            绑定QQ
          </div>
          <div class="setDivItem theme">
           添加QQ号可以使用QQ登录
          </div>
        </Col>
        <Col :span="4">
          <Button>添加绑定</Button>
        </Col>
      </Row>
    </div>
  </div>
</template>

<script>
export default {
  name: 'AccountBind',
}
</script>

<style scoped lang="scss">
  .bindItem {
    border-bottom: 1px solid $border_color;
    padding: 16px 0;
    /deep/ .ivu-col {
      padding: 8px 0;
    }
  }
  .setDivItem {
    line-height: 1.75;
  }
  /deep/ .ivu-col-span-2, .ivu-col-span-4 {
    text-align: center;
    color: $theme_color;
  }
</style>
