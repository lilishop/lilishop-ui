import { onMounted, reactive, ref } from "vue";

/**
 * 分页列表通用逻辑：loading / data / total / searchForm / 查询 / 重置 / 刷新。
 *
 * 用法：
 *   const { loading, data, total, searchForm, getDataList, handleSearch, resetSearch } =
 *     useTable(getXxxPage, { form: { name: "", status: "" } });
 *
 *   <el-table v-loading="loading" :data="data" />
 *   <el-pagination
 *     v-model:current-page="searchForm.pageNumber"
 *     v-model:page-size="searchForm.pageSize"
 *     :total="total"
 *     @current-change="getDataList"
 *     @size-change="getDataList"
 *   />
 *
 * @param {(params: object) => Promise<any>} fetcher  请求函数，入参为 searchForm
 * @param {object}   [options]
 * @param {object}   [options.form]        查询条件默认值（会与分页/排序默认值合并）
 * @param {number}   [options.pageSize=10] 默认每页条数
 * @param {string}   [options.sort]        默认排序字段
 * @param {string}   [options.order]       默认排序方向
 * @param {boolean}  [options.immediate=true] 挂载后是否自动查询
 * @param {(res: any) => ({records: any[], total: number}|null|undefined)} [options.resolve]
 *        从响应中取出 { records, total }；返回空表示请求失败（保持原数据）。
 *        默认：res.success 为真时取 res.result.records / res.result.total
 * @param {(params: object) => object} [options.beforeRequest] 请求前加工参数（返回新对象，不影响 searchForm）
 * @param {(res: any, parsed: {records: any[], total: number}) => void} [options.onSuccess]
 *        查询成功且数据已更新后回调（仅最后一次请求触发），可用于刷新状态计数等
 */
export function useTable(fetcher, options = {}) {
  const {
    form = {},
    pageSize = 10,
    sort,
    order,
    immediate = true,
    resolve = defaultResolve,
    beforeRequest,
    onSuccess,
  } = options;

  const loading = ref(false);
  const data = ref([]);
  const total = ref(0);

  const initialForm = { ...form };
  const searchForm = reactive({
    pageNumber: 1,
    pageSize,
    ...(sort ? { sort } : {}),
    ...(order ? { order } : {}),
    ...form,
  });

  // 只采纳最后一次请求的结果，避免快速切换页码/条件时旧响应覆盖新数据
  let requestId = 0;

  function getDataList() {
    const current = ++requestId;
    loading.value = true;
    const params = beforeRequest ? beforeRequest({ ...searchForm }) : searchForm;
    return Promise.resolve(fetcher(params))
      .then((res) => {
        if (current !== requestId) return res;
        const parsed = resolve(res);
        if (parsed) {
          data.value = parsed.records || [];
          total.value = parsed.total || 0;
          if (onSuccess) onSuccess(res, parsed);
        }
        return res;
      })
      .finally(() => {
        if (current === requestId) loading.value = false;
      });
  }

  /** 以当前条件从第 1 页重新查询 */
  function handleSearch() {
    searchForm.pageNumber = 1;
    return getDataList();
  }

  /** 恢复查询条件默认值（保留当前每页条数）并从第 1 页查询 */
  function resetSearch() {
    Object.assign(searchForm, initialForm);
    return handleSearch();
  }

  /** 保持当前页刷新（如删除/修改后） */
  function refresh() {
    return getDataList();
  }

  if (immediate) {
    onMounted(getDataList);
  }

  return {
    loading,
    data,
    total,
    searchForm,
    getDataList,
    handleSearch,
    resetSearch,
    refresh,
  };
}

function defaultResolve(res) {
  if (res && res.success && res.result) {
    return { records: res.result.records, total: res.result.total };
  }
  return null;
}
