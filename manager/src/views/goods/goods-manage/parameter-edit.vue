<template>
  <div class="search">
    <el-card>
      <el-form ref="formRef" :model="form" label-width="100px" :rules="formValidate">
        <el-form-item label="参数名称" prop="paramName">
          <el-input v-model="form.paramName" clearable style="width: 520px" />
        </el-form-item>
        <el-form-item label="是否必填" prop="required">
          <el-radio-group v-model="form.required">
            <el-radio :value="0">否</el-radio>
            <el-radio :value="1">是</el-radio>
          </el-radio-group>
          <span style="margin-left: 10px; color: #999; font-size: 12px">商品发布时参数是否必填</span>
        </el-form-item>
        <el-form-item label="是否索引" prop="isIndex">
          <el-radio-group v-model="form.isIndex">
            <el-radio :value="0">否</el-radio>
            <el-radio :value="1">是</el-radio>
          </el-radio-group>
          <span style="margin-left: 10px; color: #999; font-size: 12px">
            开启索引后，用户将可以通过该参数筛选商品，索引开关不影响商详页的参数展示
          </span>
        </el-form-item>
        <el-form-item label="排序" prop="sort">
          <el-input-number :min="0" v-model="form.sort" style="width: 520px" />
        </el-form-item>
        <el-form-item label="参数值" prop="options">
          <div class="options-editor">
            <el-table :data="form.options" border size="small" style="width: 520px">
              <el-table-column label="参数值" min-width="420">
                <template #default="{ row, $index }">
                  <el-input
                    v-if="row"
                    v-model="form.options[$index].value"
                    clearable
                    @blur="touchOptionsValidate"
                  />
                </template>
              </el-table-column>
              <el-table-column label="操作" width="90" align="center">
                <template #default="{ row, $index }">
                  <a v-if="row" class="link-text" @click="removeOptionRow($index)">
                    删除
                  </a>
                </template>
              </el-table-column>
            </el-table>
            <div class="options-editor__actions">
              <el-button type="primary" @click="addOptionRow">新增</el-button>
            </div>
          </div>
        </el-form-item>
        <el-form-item label="关联分类" prop="categoryIds">
          <el-button @click="openCategoryModal">选择分类</el-button>
          <span v-if="selectedCategoryNamesText" style="margin-left: 10px; color: #999; font-size: 12px">
            {{ selectedCategoryNamesText }}</span>
          <span v-else style="margin-left: 10px; color: #999; font-size: 12px">
            已选择{{ (form.categoryIds || []).length }}个分类
          </span>
        </el-form-item>
        <el-form-item>
          <el-button @click="back">返回</el-button>
          <el-button type="primary" :loading="submitLoading" @click="handleSubmit">保存</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-dialog
      v-model="categoryModalVisible"
      :title="categoryModalTitle"
      width="700px"
      :close-on-click-modal="false"
    >
      <div v-loading="categoryTreeLoading" style="position: relative; max-height: 520px; overflow: auto">
        <el-tree
          ref="categoryTree"
          :key="categoryTreeKey"
          :data="categoryTreeData"
          :props="{ label: 'title', children: 'children' }"
          node-key="id"
          show-checkbox
          default-expand-all
          :default-checked-keys="selectedCategoryIds"
          @check="onCategoryTreeCheckChange"
        />
      </div>
      <template #footer>
        <el-button @click="categoryModalVisible = false">取消</el-button>
        <el-button type="primary" style="margin-left: 8px" @click="categoryModalVisible = false">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { computed, nextTick, onMounted, reactive, ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import {
  getCategoryTree,
  getGoodsParamsDetail,
  insertGoodsParams,
  updateGoodsParams,
} from "@/api/goods";
import { regular } from "@/utils";
import { ElMessage } from "element-plus";

defineOptions({ name: "parameterEdit" });

const route = useRoute();
const router = useRouter();

const getOptionText = (value) => {
  if (value && typeof value === "object") return value.value;
  return value;
};

const normalizeOptions = (value) => {
  const arr = Array.isArray(value)
    ? value
    : typeof value === "string"
      ? value.split(",")
      : [];
  const cleaned = arr
    .map((x) => String(getOptionText(x) ?? "").trim())
    .filter((x) => x.length > 0);
  return Array.from(new Set(cleaned));
};

const validateOptions = (rule, value, callback) => {
  const arr = Array.isArray(value)
    ? value
    : typeof value === "string"
      ? value.split(",")
      : [];
  const options = normalizeOptions(arr);
  if (options.length === 0) {
    callback(new Error("请填写参数值"));
    return;
  }
  const joined = options.join(",");
  if (!/^.{1,255}$/.test(joined)) {
    callback(new Error("超出最大长度限制"));
    return;
  }
  callback();
};

const normalize01 = (value, fallback = 0) => {
  const n = Number(value);
  if (n === 0 || n === 1) return n;
  return fallback;
};

const buildSpringFormPayload = (payload) => {
  const out = {};
  if (payload && payload.id !== undefined && payload.id !== null && String(payload.id)) {
    out.id = String(payload.id);
  }
  out.paramName = payload && payload.paramName !== undefined && payload.paramName !== null ? String(payload.paramName) : "";
  out.options = payload && payload.options !== undefined && payload.options !== null ? String(payload.options) : "";
  out.required = payload ? Number(payload.required) : 0;
  out.isIndex = payload ? Number(payload.isIndex) : 0;
  out.sort = payload ? Number(payload.sort) : 0;

  const categoryList = payload && Array.isArray(payload.categoryParameterList) ? payload.categoryParameterList : [];
  const categoryIds = categoryList
    .map((x) => (x && x.categoryId !== undefined && x.categoryId !== null ? String(x.categoryId) : ""))
    .filter((x) => x.length > 0);
  categoryIds.forEach((categoryId, index) => {
    out[`categoryParameterList[${index}].categoryId`] = categoryId;
  });
  return out;
};

const validateRadioRequired = (message) => (rule, value, callback) => {
  const n = normalize01(value, NaN);
  if (!(n === 0 || n === 1)) {
    callback(new Error(message));
    return;
  }
  callback();
};

const toStringArray = (arr) => {
  if (!Array.isArray(arr)) return [];
  return arr.map((x) => String(x)).filter((x) => x.length > 0);
};

const cacheKey = (id) => `goods-parameter-edit:${id}`;

const buildCategoryIdNameMap = (list, map) => {
  if (!Array.isArray(list) || list.length === 0) return;
  list.forEach((item) => {
    if (!item) return;
    const id = item.id !== undefined && item.id !== null ? String(item.id) : "";
    if (id) map[id] = item.name;
    buildCategoryIdNameMap(item.children || [], map);
  });
};

const buildFormState = (source, parameterId) => {
  const opts = normalizeOptions(source?.options);
  const options = opts.length > 0 ? opts.map((x) => ({ value: x })) : [{ value: "" }];
  const categoryList = Array.isArray(source?.categoryParameterList)
    ? source.categoryParameterList
    : [];
  const categoryIds = toStringArray(
    categoryList.map((x) => x && x.categoryId).filter(Boolean)
  );
  const formState = {
    paramName: source?.paramName || "",
    options,
    required: normalize01(source?.required, 0),
    isIndex: normalize01(source?.isIndex, 0),
    sort: Number(source?.sort ?? 0) || 0,
    categoryIds,
  };
  const id = source?.id || parameterId;
  if (id) formState.id = id;
  return formState;
};

const formRef = ref(null);
const categoryTree = ref(null);

const submitLoading = ref(false);
const modalType = ref(0);
const categoryModalVisible = ref(false);
const categoryModalTitle = ref("关联分类");
const categoryTreeLoading = ref(false);
const categoryTreeData = ref([]);
const categoryTreeSource = ref([]);
const categoryIdNameMap = ref({});
const categoryTreeKey = ref(0);
const selectedCategoryIds = ref([]);
const form = ref({
  paramName: "",
  options: [{ value: "" }],
  required: 0,
  isIndex: 0,
  sort: 0,
  categoryIds: [],
});
const formValidate = reactive({
  paramName: [regular.REQUIRED, regular.VARCHAR5],
  options: [{ required: true, validator: validateOptions, trigger: "change" }],
  required: [{ required: true, validator: validateRadioRequired("请选择是否必填"), trigger: "change" }],
  isIndex: [{ required: true, validator: validateRadioRequired("请选择是否索引"), trigger: "change" }],
  sort: [regular.REQUIRED, regular.INTEGER],
  categoryIds: [
    {
      type: "array",
      required: true,
      min: 1,
      message: "请选择关联分类",
      trigger: "change",
    },
  ],
});

const id = computed(() =>
  route.query && route.query.id ? String(route.query.id) : ""
);
const selectedCategoryNamesText = computed(() => {
  if (!Array.isArray(categoryTreeSource.value) || categoryTreeSource.value.length === 0) return "";
  const selectedSet = new Set(toStringArray(selectedCategoryIds.value));
  const isSelected = (node) => {
    if (!node) return false;
    const nodeId = node.id !== undefined && node.id !== null ? String(node.id) : "";
    if (nodeId && selectedSet.has(nodeId)) return true;
    const children = Array.isArray(node.children) ? node.children : [];
    if (children.length === 0) return false;
    return children.every(isSelected);
  };
  const collect = (node, out) => {
    if (!node) return;
    if (isSelected(node)) {
      if (node.name) out.push(node.name);
      return;
    }
    const children = Array.isArray(node.children) ? node.children : [];
    children.forEach((c) => collect(c, out));
  };
  const names = [];
  categoryTreeSource.value.forEach((n) => collect(n, names));
  return names.join("，");
});

watch(
  () => form.value.required,
  (val) => {
    const n = normalize01(val, 0);
    if (val !== n) form.value.required = n;
  }
);
watch(
  () => form.value.isIndex,
  (val) => {
    const n = normalize01(val, 0);
    if (val !== n) form.value.isIndex = n;
  }
);

function back() {
  router.push({ name: "goods-parameter" });
}
function syncCategoryIds(ids) {
  const categoryIds = toStringArray(ids);
  selectedCategoryIds.value = categoryIds;
  if (!form.value) form.value = {};
  form.value.categoryIds = categoryIds;
}
function touchOptionsValidate() {
  nextTick(() => {
    const formEl = formRef.value;
    if (formEl && typeof formEl.validateField === "function") {
      // validateField rejects on failure; catch to avoid dev-server [object Object] overlay
      formEl.validateField("options", () => {});
    }
  });
}
function addOptionRow() {
  if (!Array.isArray(form.value.options)) form.value.options = [];
  form.value.options.push({ value: "" });
}
function removeOptionRow(index) {
  if (!Array.isArray(form.value.options)) form.value.options = [];
  form.value.options.splice(index, 1);
  touchOptionsValidate();
}
function buildCategoryTreeNodes(list) {
  if (!Array.isArray(list) || list.length === 0) return [];
  return list.map((item) => ({
    id: item.id,
    title: item.name,
    children: buildCategoryTreeNodes(item.children || []),
  }));
}
async function loadDetail(parameterId) {
  if (!parameterId) return;
  const res = await getGoodsParamsDetail(parameterId).catch(() => null);
  if (!(res && res.success && res.result)) return;
  const dto = res.result;
  form.value = buildFormState(dto, parameterId);
  selectedCategoryIds.value = [...form.value.categoryIds];
}
async function openCategoryModal() {
  categoryModalVisible.value = true;
  categoryTreeLoading.value = true;
  categoryTreeKey.value += 1;
  try {
    if (!Array.isArray(categoryTreeSource.value) || categoryTreeSource.value.length === 0) {
      const treeRes = await getCategoryTree();
      categoryTreeSource.value = treeRes && treeRes.success ? treeRes.result || [] : [];
      const map = {};
      buildCategoryIdNameMap(categoryTreeSource.value, map);
      categoryIdNameMap.value = map;
    }
    categoryTreeData.value = buildCategoryTreeNodes(categoryTreeSource.value || []);
  } finally {
    categoryTreeLoading.value = false;
  }
}
function onCategoryTreeCheckChange(_data, checkedInfo) {
  syncCategoryIds(checkedInfo?.checkedKeys || []);
  nextTick(() => {
    const formEl = formRef.value;
    if (formEl && typeof formEl.validateField === "function") {
      formEl.validateField("categoryIds", () => {});
    }
  });
}
function initForm() {
  if (id.value) {
    modalType.value = 1;
    const cached = window.sessionStorage.getItem(cacheKey(id.value));
    if (cached) {
      try {
        const row = JSON.parse(cached);
        form.value = buildFormState(row, row.id);
        selectedCategoryIds.value = [...form.value.categoryIds];
      } catch (e) {
        modalType.value = 0;
      }
    }
    loadDetail(String(id.value));
  } else {
    modalType.value = 0;
    if (!Array.isArray(form.value.options) || form.value.options.length === 0) {
      form.value.options = [{ value: "" }];
    }
    syncCategoryIds([]);
  }
}
function handleSubmit() {
  formRef.value.validate((valid) => {
    if (!valid) return;
    submitLoading.value = true;
    const options = normalizeOptions(form.value.options);
    const categoryIds = toStringArray(form.value.categoryIds);
    const payload = {
      ...form.value,
      options: options.join(","),
      required: Number(form.value.required),
      isIndex: Number(form.value.isIndex),
      sort: Number(form.value.sort || 0),
      categoryParameterList: categoryIds.map((categoryId) => ({ categoryId })),
    };
    if (modalType.value === 0) {
      delete payload.id;
      insertGoodsParams(buildSpringFormPayload(payload))
        .then((res) => {
          if (!(res && res.success)) return;
          ElMessage.success("操作成功");
          back();
        })
        .finally(() => {
          submitLoading.value = false;
        });
    } else {
      updateGoodsParams(buildSpringFormPayload(payload))
        .then((res) => {
          if (!(res && res.success)) return;
          ElMessage.success("操作成功");
          back();
        })
        .finally(() => {
          submitLoading.value = false;
        });
    }
  });
}

onMounted(() => {
  getCategoryTree().then((res) => {
    if (res && res.success) {
      categoryTreeSource.value = res.result || [];
      const map = {};
      buildCategoryIdNameMap(categoryTreeSource.value, map);
      categoryIdNameMap.value = map;
    }
  });
  initForm();
});
</script>

<style lang="scss">
.options-editor {
  display: flex;
  flex-direction: column;
  width: 520px;
}

.options-editor__actions {
  margin-top: 10px;
}
</style>
