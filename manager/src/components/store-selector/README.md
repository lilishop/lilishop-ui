# 统一店铺选择器

作者：Bulbasaur；2026-11-05。

默认从右侧打开抽屉，支持搜索、分页、多选和已选回显。取消不提交，确认通过 `selected` 返回完整已选店铺数组。店铺类型、状态均为普通文字，无右侧预览区。

```vue
<StoreSelector ref="selector" @selected="onSelected" />
```

导入 `@/components/store-selector/index.vue`，通过 `selector.value.open(selectedRows)` 打开。`selectedRows` 为包含 `id` 的店铺对象数组；每次打开建立独立选择草稿。

| 参数 | 默认值 | 用途 |
| --- | --- | --- |
| multiple | true | false 时单选，返回数组最多一项 |
| embedded | false | true 时在父容器展示列表，并在选择时立即通知；适用于装修链接面板 |
| selectedWay | [] | 初始店铺数组；内嵌模式监听外部选择变化 |
| queryParams | {} | 店铺查询限制，例如 `{ storeDisable: 'OPEN' }` |
| title | 选择店铺 | 抽屉标题 |
| size | 1080px | 抽屉宽度，最大为视口宽度 |
| tableHeight | 自动 | 可选表格高度 |

已接入付费会员、装修链接单选、移动端装修店铺列表配置。查询复用 `getShopListData`（`/store/store`），不新增后端接口。

验证：在工作区根目录运行 `node scripts/test-store-selector.cjs`。
