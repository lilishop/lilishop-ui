<template>
  <div class="search">
    <Card>
      <Form ref="form" :model="form" :label-width="100" :rules="formValidate">
        <FormItem label="参数名称" prop="paramName">
          <Input v-model="form.paramName" clearable style="width: 520px" />
        </FormItem>
        <FormItem label="是否必填" prop="required">
          <RadioGroup v-model="form.required">
            <Radio :label="0">否</Radio>
            <Radio :label="1">是</Radio>
          </RadioGroup>
          <span style="margin-left: 10px; color: #999; font-size: 12px"
            >商品发布时参数是否必填</span
          >
        </FormItem>
        <FormItem label="是否索引" prop="isIndex">
          <RadioGroup v-model="form.isIndex">
            <Radio :label="0">否</Radio>
            <Radio :label="1">是</Radio>
          </RadioGroup>
          <span style="margin-left: 10px; color: #999; font-size: 12px"
            >开启索引后，用户将可以通过该参数筛选商品，索引开关不影响商详页的参数展示</span
          >
        </FormItem>
        <FormItem label="排序" prop="sort">
          <InputNumber :min="0" type="number" v-model="form.sort" style="width: 520px" />
        </FormItem>
        <FormItem label="参数值" prop="options">
          <Table :columns="optionColumns" :data="form.options" border size="small" style="width: 520px" />
          <div style="margin-top: 10px">
            <Button type="primary" @click="addOptionRow">新增</Button>
          </div>
        </FormItem>
        <FormItem label="关联分类">
          <Button type="default" @click="openCategoryModal">选择分类</Button>
          <span v-if="selectedCategoryNamesText" style="margin-left: 10px; color: #999; font-size: 12px"
            >{{ selectedCategoryNamesText }}</span
          >
          <span v-else style="margin-left: 10px; color: #999; font-size: 12px"
            >已选择{{ selectedCategoryIds.length }}个分类</span
          >
        </FormItem>
        <FormItem>
          <Button type="default" @click="back">返回</Button>
          <Button type="primary" :loading="submitLoading" @click="handleSubmit">保存</Button>
        </FormItem>
      </Form>
    </Card>

    <Modal
      :title="categoryModalTitle"
      v-model="categoryModalVisible"
      :mask-closable="false"
      :width="700"
    >
      <div style="position: relative; max-height: 520px; overflow: auto;">
        <Spin size="large" fix v-if="categoryTreeLoading"></Spin>
        <Tree
          :key="categoryTreeKey"
          :data="categoryTreeData"
          show-checkbox
          @on-check-change="onCategoryTreeCheckChange"
        ></Tree>
      </div>
      <div slot="footer">
        <Button type="text" @click="categoryModalVisible = false">取消</Button>
        <Button type="primary" style="margin-left: 8px" @click="categoryModalVisible = false">确定</Button>
      </div>
    </Modal>
  </div>
</template>

<script>
import {
  getCategoryTree,
  getGoodsParamsDetail,
  insertGoodsParams,
  updateGoodsParams,
} from "@/api/goods";
import { regular } from "@/utils";

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

export default {
  name: "parameterEdit",
  data() {
    return {
      submitLoading: false,
      modalType: 0,
      categoryModalVisible: false,
      categoryModalTitle: "关联分类",
      categoryTreeLoading: false,
      categoryTreeData: [],
      categoryTreeSource: [],
      categoryIdNameMap: {},
      categoryTreeKey: 0,
      selectedCategoryIds: [],
      form: {
        paramName: "",
        options: [{ value: "" }],
        required: 0,
        isIndex: 0,
        sort: 0,
      },
      optionColumns: [
        {
          title: "参数值",
          key: "value",
          minWidth: 420,
          render: (h, params) => {
            return h("Input", {
              props: {
                value: params.row.value,
                clearable: true,
              },
              on: {
                input: (val) => {
                  if (!Array.isArray(this.form.options)) this.form.options = [];
                  if (!this.form.options[params.index]) return;
                  this.form.options[params.index].value = val;
                },
                "on-blur": () => {
                  this.touchOptionsValidate();
                },
              },
            });
          },
        },
        {
          title: "操作",
          width: 90,
          align: "center",
          render: (h, params) => {
            return h(
              "Button",
              {
                props: {
                  type: "error",
                  size: "small",
                },
                on: {
                  click: () => this.removeOptionRow(params.index),
                },
              },
              "删除",
            );
          },
        },
      ],
      formValidate: {
        paramName: [regular.REQUIRED, regular.VARCHAR5],
        options: [{ required: true, validator: validateOptions, trigger: "change" }],
        required: [{ required: true, validator: validateRadioRequired("请选择是否必填"), trigger: "change" }],
        isIndex: [{ required: true, validator: validateRadioRequired("请选择是否索引"), trigger: "change" }],
        sort: [regular.REQUIRED, regular.INTEGER],
      },
    };
  },
  computed: {
    id() {
      return this.$route.query && this.$route.query.id ? String(this.$route.query.id) : "";
    },
    selectedCategoryNamesText() {
      if (!Array.isArray(this.categoryTreeSource) || this.categoryTreeSource.length === 0) return "";
      const selectedSet = new Set(toStringArray(this.selectedCategoryIds));
      const isSelected = (node) => {
        if (!node) return false;
        const id = node.id !== undefined && node.id !== null ? String(node.id) : "";
        if (id && selectedSet.has(id)) return true;
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
      this.categoryTreeSource.forEach((n) => collect(n, names));
      return names.join("，");
    },
  },
  watch: {
    "form.required"(val) {
      const n = normalize01(val, 0);
      if (val !== n) this.$set(this.form, "required", n);
    },
    "form.isIndex"(val) {
      const n = normalize01(val, 0);
      if (val !== n) this.$set(this.form, "isIndex", n);
    },
  },
  methods: {
    back() {
      this.$router.push({ name: "goods-parameter" });
    },
    touchOptionsValidate() {
      if (this.$refs.form && this.$refs.form.validateField) {
        this.$refs.form.validateField("options");
      }
    },
    addOptionRow() {
      if (!Array.isArray(this.form.options)) this.form.options = [];
      this.form.options.push({ value: "" });
      this.touchOptionsValidate();
    },
    removeOptionRow(index) {
      if (!Array.isArray(this.form.options)) this.form.options = [];
      this.form.options.splice(index, 1);
      this.touchOptionsValidate();
    },
    buildCategoryTreeNodes(list, selectedSet) {
      if (!Array.isArray(list) || list.length === 0) return [];
      return list.map((item) => {
        const children = this.buildCategoryTreeNodes(item.children || [], selectedSet);
        return {
          id: item.id,
          title: item.name,
          expand: true,
          checked: selectedSet.has(String(item.id)),
          children,
        };
      });
    },
    async loadDetail(parameterId) {
      if (!parameterId) return;
      const res = await getGoodsParamsDetail(parameterId).catch(() => null);
      if (!(res && res.success && res.result)) return;
      const dto = res.result;
      const opts = normalizeOptions(dto.options);
      this.form = {
        id: dto.id || parameterId,
        paramName: dto.paramName || "",
        options: opts.map((x) => ({ value: x })),
        required: normalize01(dto.required, 0),
        isIndex: normalize01(dto.isIndex, 0),
        sort: Number(dto.sort ?? 0) || 0,
      };
      const list = Array.isArray(dto.categoryParameterList) ? dto.categoryParameterList : [];
      this.selectedCategoryIds = toStringArray(list.map((x) => x && x.categoryId).filter(Boolean));
    },
    async openCategoryModal() {
      this.categoryModalVisible = true;
      this.categoryTreeLoading = true;
      this.categoryTreeKey += 1;
      try {
        const selectedSet = new Set(toStringArray(this.selectedCategoryIds));
        if (!Array.isArray(this.categoryTreeSource) || this.categoryTreeSource.length === 0) {
          const treeRes = await getCategoryTree();
          this.categoryTreeSource = treeRes && treeRes.success ? treeRes.result || [] : [];
          const map = {};
          buildCategoryIdNameMap(this.categoryTreeSource, map);
          this.categoryIdNameMap = map;
        }
        this.categoryTreeData = this.buildCategoryTreeNodes(this.categoryTreeSource || [], selectedSet);
      } finally {
        this.categoryTreeLoading = false;
      }
    },
    onCategoryTreeCheckChange(checkedNodes) {
      if (!Array.isArray(checkedNodes)) {
        this.selectedCategoryIds = [];
        return;
      }
      this.selectedCategoryIds = toStringArray(checkedNodes.map((node) => node && node.id).filter(Boolean));
    },
    initForm() {
      if (this.id) {
        this.modalType = 1;
        const cached = window.sessionStorage.getItem(cacheKey(this.id));
        if (cached) {
          try {
            const row = JSON.parse(cached);
            const opts = normalizeOptions(row.options);
            this.form = {
              id: row.id,
              paramName: row.paramName || "",
              options: opts.map((x) => ({ value: x })),
              required: normalize01(row.required, 0),
              isIndex: normalize01(row.isIndex, 0),
              sort: Number(row.sort ?? 0) || 0,
            };
          } catch (e) {
            this.modalType = 0;
          }
        }
        this.loadDetail(String(this.id));
      } else {
        this.modalType = 0;
        if (!Array.isArray(this.form.options) || this.form.options.length === 0) {
          this.form.options = [{ value: "" }];
        }
        this.selectedCategoryIds = [];
      }
    },
    handleSubmit() {
      this.$refs.form.validate((valid) => {
        if (!valid) return;
        this.submitLoading = true;
        const options = normalizeOptions(this.form.options);
        const categoryIds = toStringArray(this.selectedCategoryIds);
        const payload = {
          ...this.form,
          options: options.join(","),
          required: Number(this.form.required),
          isIndex: Number(this.form.isIndex),
          sort: Number(this.form.sort || 0),
          categoryParameterList: categoryIds.map((categoryId) => ({ categoryId })),
        };
        if (this.modalType === 0) {
          delete payload.id;
          insertGoodsParams(buildSpringFormPayload(payload))
            .then((res) => {
              if (!(res && res.success)) return;
              this.$Message.success("操作成功");
              this.back();
            })
            .finally(() => {
              this.submitLoading = false;
            });
        } else {
          updateGoodsParams(buildSpringFormPayload(payload))
            .then((res) => {
              if (!(res && res.success)) return;
              this.$Message.success("操作成功");
              this.back();
            })
            .finally(() => {
              this.submitLoading = false;
            });
        }
      });
    },
  },
  mounted() {
    getCategoryTree().then((res) => {
      if (res && res.success) {
        this.categoryTreeSource = res.result || [];
        const map = {};
        buildCategoryIdNameMap(this.categoryTreeSource, map);
        this.categoryIdNameMap = map;
      }
    });
    this.initForm();
  },
};
</script>

<style lang="scss"></style>
