<template>
  <div class="search">
    <Card>
      <Row class="operation padding-row">
        <Button type="primary" @click="openAdd">添加客户等级</Button>
      </Row>
      <Table
        :loading="loading"
        border
        :columns="columns"
        :data="data"
        class="mt_10"
      ></Table>
    </Card>

    <Modal v-model="addFlag" title="添加客户等级" width="720" :z-index="950" :mask-closable="false">
      <Form ref="addForm" :model="formAdd" :rules="rules" :label-width="110">
        <FormItem label="等级名称" prop="gradeName">
          <Input v-model="formAdd.gradeName" maxlength="50" placeholder="请输入等级名称" />
        </FormItem>
        <FormItem label="是否默认" prop="isDefault">
          <RadioGroup v-model="formAdd.isDefault">
            <Radio :label="true">是</Radio>
            <Radio :label="false">否</Radio>
          </RadioGroup>
        </FormItem>
        <FormItem label="等级图标" prop="gradeImage">
          <upload-pic-input v-model="formAdd.gradeImage"></upload-pic-input>
        </FormItem>
        <FormItem label="等级背景图" prop="gradeBackground">
          <upload-pic-input v-model="formAdd.gradeBackground"></upload-pic-input>
        </FormItem>
        <FormItem label="字体颜色" prop="gradeFontColor">
          <Input v-model="formAdd.gradeFontColor" maxlength="20" placeholder="如：#333333" />
        </FormItem>
        <FormItem label="所需经验值" prop="requiredExperience">
          <InputNumber v-model="formAdd.requiredExperience" :min="1" :precision="0" style="width: 220px"></InputNumber>
        </FormItem>
        <FormItem label="等级排序" prop="gradeSort">
          <InputNumber v-model="formAdd.gradeSort" :min="1" :max="9999" :precision="0" style="width: 220px"></InputNumber>
        </FormItem>
        <FormItem label="等级开关" prop="gradeState">
          <RadioGroup v-model="formAdd.gradeState">
            <Radio label="OPEN">开启</Radio>
            <Radio label="CLOSE">关闭</Radio>
          </RadioGroup>
        </FormItem>
        <FormItem label="关联权益" prop="benefitIds">
          <Select
            :value="addBenefitOrder"
            multiple
            filterable
            placeholder="请选择客户权益"
            style="width: 100%"
            @on-change="onAddBenefitIdsChange"
          >
            <Option v-for="b in benefitOptions" :key="b.id" :value="String(b.id)">{{ benefitOptionLabel(b) }}</Option>
          </Select>
        </FormItem>
      </Form>
      <div slot="footer">
        <Button @click="addFlag = false">取消</Button>
        <Button type="primary" :loading="submitAddLoading" @click="submitAdd">确定</Button>
      </div>
    </Modal>

    <Modal v-model="editFlag" title="编辑客户等级" width="720" :z-index="950" :mask-closable="false">
      <Form ref="editForm" :model="formEdit" :rules="rules" :label-width="110">
        <Input v-model="formEdit.id" v-show="false" />
        <FormItem label="等级名称" prop="gradeName">
          <Input v-model="formEdit.gradeName" maxlength="50" placeholder="请输入等级名称" />
        </FormItem>
        <FormItem label="是否默认" prop="isDefault">
          <RadioGroup v-model="formEdit.isDefault">
            <Radio :label="true">是</Radio>
            <Radio :label="false">否</Radio>
          </RadioGroup>
        </FormItem>
        <FormItem label="等级图标" prop="gradeImage">
          <upload-pic-input v-model="formEdit.gradeImage"></upload-pic-input>
        </FormItem>
        <FormItem label="等级背景图" prop="gradeBackground">
          <upload-pic-input v-model="formEdit.gradeBackground"></upload-pic-input>
        </FormItem>
        <FormItem label="字体颜色" prop="gradeFontColor">
          <Input v-model="formEdit.gradeFontColor" maxlength="20" placeholder="如：#333333" />
        </FormItem>
        <FormItem label="所需经验值" prop="requiredExperience">
          <InputNumber v-model="formEdit.requiredExperience" :min="1" :precision="0" style="width: 220px"></InputNumber>
        </FormItem>
        <FormItem label="等级排序" prop="gradeSort">
          <InputNumber v-model="formEdit.gradeSort" :min="1" :max="9999" :precision="0" style="width: 220px"></InputNumber>
        </FormItem>
        <FormItem label="等级开关" prop="gradeState">
          <RadioGroup v-model="formEdit.gradeState">
            <Radio label="OPEN">开启</Radio>
            <Radio label="CLOSE">关闭</Radio>
          </RadioGroup>
        </FormItem>
        <FormItem label="关联权益" prop="benefitIds">
          <Select
            :value="editBenefitOrder"
            multiple
            filterable
            placeholder="请选择客户权益"
            style="width: 100%"
            @on-change="onEditBenefitIdsChange"
          >
            <Option v-for="b in benefitOptions" :key="b.id" :value="String(b.id)">{{ benefitOptionLabel(b) }}</Option>
          </Select>
        </FormItem>
      </Form>
      <div slot="footer">
        <Button @click="editFlag = false">取消</Button>
        <Button type="primary" :loading="submitEditLoading" @click="submitEdit">确定</Button>
      </div>
    </Modal>
  </div>
</template>

<script>
import * as API_Member from "@/api/member.js";
import uploadPicInput from "@/components/lili/upload-pic-input";

const buildDefaultForm = () => ({
  id: "",
  gradeName: "",
  isDefault: false,
  gradeImage: "",
  gradeBackground: "",
  gradeFontColor: "",
  requiredExperience: 1,
  gradeSort: 1,
  gradeState: "OPEN",
  benefitIds: "",
});

/** 权益多选：新勾选追加到末尾，取消勾选移除，保持已有顺序 */
function syncOrderedBenefitIds(prevOrder, selected) {
  const sel = Array.isArray(selected) ? selected.map((id) => String(id)) : [];
  const out = [];
  (prevOrder || []).forEach((id) => {
    const s = String(id);
    if (sel.includes(s)) out.push(s);
  });
  sel.forEach((s) => {
    if (!out.includes(s)) out.push(s);
  });
  return out;
}

export default {
  name: "memberGrade",
  components: {
    uploadPicInput,
  },
  data() {
    return {
      loading: true,
      columns: [
        {
          title: "等级名称",
          key: "gradeName",
          width: 130,
          tooltip: true,
        },
        {
          title: "默认等级",
          key: "isDefault",
          width: 95,
          render: (h, params) => {
            const yes = params.row.isDefault === true;
            return h(
              "Tag",
              {
                props: {
                  color: yes ? "success" : "default",
                },
              },
              yes ? "是" : "否"
            );
          },
        },
        {
          title: "等级图标",
          key: "gradeImage",
          width: 100,
          render: (h, params) => {
            if (!params.row.gradeImage) return h("span", "-");
            return h("img", {
              attrs: {
                src: params.row.gradeImage,
                alt: "等级图标",
              },
              style: {
                width: "48px",
                height: "48px",
                objectFit: "contain",
                border: "1px solid #dcdee2",
                borderRadius: "4px",
                background: "#fff",
              },
            });
          },
        },
        {
          title: "等级背景图",
          key: "gradeBackground",
          width: 120,
          render: (h, params) => {
            if (!params.row.gradeBackground) return h("span", "-");
            return h("img", {
              attrs: {
                src: params.row.gradeBackground,
                alt: "等级背景图",
              },
              style: {
                width: "64px",
                height: "40px",
                objectFit: "cover",
                border: "1px solid #dcdee2",
                borderRadius: "4px",
                background: "#fff",
              },
            });
          },
        },
        {
          title: "所需经验值",
          key: "requiredExperience",
          width: 110,
        },
        {
          title: "等级排序",
          key: "gradeSort",
          width: 95,
        },
        {
          title: "状态",
          key: "gradeState",
          width: 118,
          align: "center",
          render: (h, params) => {
            const row = params.row;
            return h("i-switch", {
              props: {
                value: row.gradeState === "OPEN",
                size: "large",
                loading: !!row._gradeStateLoading,
              },
              on: {
                "on-change": (checked) => {
                  this.onGradeStateSwitch(row, checked);
                },
              },
            }, [
              h("span", { slot: "open" }, "开启"),
              h("span", { slot: "close" }, "关闭"),
            ]);
          },
        },
        {
          title: "操作",
          key: "action",
          align: "center",
          width: 130,
          render: (h, params) => {
            const linkStyle = {
              color: "#2d8cf0",
              cursor: "pointer",
              textDecoration: "none",
            };
            const sep = h(
              "span",
              { style: { margin: "0 8px", color: "#dcdee2" } },
              "|"
            );
            return h(
              "div",
              { class: "ops", style: { display: "flex", justifyContent: "center" } },
              [
                h(
                  "a",
                  { style: linkStyle, on: { click: () => this.openEdit(params.row) } },
                  "编辑"
                ),
                sep,
                h(
                  "a",
                  { style: linkStyle, on: { click: () => this.remove(params.row) } },
                  "删除"
                ),
              ]
            );
          },
        },
      ],
      data: [],
      addFlag: false,
      editFlag: false,
      submitAddLoading: false,
      submitEditLoading: false,
      formAdd: buildDefaultForm(),
      formEdit: buildDefaultForm(),
      /** 关联权益 id 顺序（与 benefitIds 一致） */
      addBenefitOrder: [],
      editBenefitOrder: [],
      benefitOptions: [],
      benefitTypeOptions: [],
      benefitOptionsLoading: false,
      editDetailLoading: false,
      rules: {
        gradeName: [{ required: true, message: "请输入等级名称", trigger: "blur" }],
        gradeImage: [{ required: true, message: "请上传等级图标", trigger: "change" }],
        requiredExperience: [{ required: true, type: "number", message: "请输入所需经验值", trigger: "change" }],
        gradeSort: [{ required: true, type: "number", message: "请输入等级排序", trigger: "change" }],
        gradeState: [{ required: true, message: "请选择等级开关", trigger: "change" }],
      },
    };
  },
  methods: {
    benefitOptionLabel(b) {
      if (!b) return "";
      const name = b.benefitName || String(b.id);
      const opt = this.benefitTypeOptions.find((o) => o.value === b.benefitType);
      const typeText = opt ? opt.description : b.benefitType || "";
      return typeText ? `${name}（${typeText}）` : name;
    },
    onAddBenefitIdsChange(val) {
      this.addBenefitOrder = syncOrderedBenefitIds(this.addBenefitOrder, val);
    },
    onEditBenefitIdsChange(val) {
      this.editBenefitOrder = syncOrderedBenefitIds(this.editBenefitOrder, val);
    },
    loadBenefitTypes() {
      API_Member.getMemberBenefitTypes().then((res) => {
        if (res && res.success && Array.isArray(res.result)) {
          this.benefitTypeOptions = res.result;
        } else {
          this.benefitTypeOptions = [];
        }
      });
    },
    loadBenefitOptions() {
      this.benefitOptionsLoading = true;
      const pageSize = 500;
      const fetchPage = (pageNumber) =>
        API_Member.getMemberBenefitByPage({ pageNumber, pageSize, sort: "benefitSort", order: "asc" });
      return fetchPage(1)
        .then((res) => {
          if (!(res && res.success && res.result)) {
            this.benefitOptions = [];
            return;
          }
          const records = Array.isArray(res.result.records) ? res.result.records : [];
          const total = Number(res.result.total) || records.length;
          let all = records.slice();
          if (total > pageSize) {
            const pages = Math.ceil(total / pageSize);
            const rest = [];
            for (let p = 2; p <= pages; p++) {
              rest.push(fetchPage(p));
            }
            return Promise.all(rest).then((results) => {
              results.forEach((r) => {
                if (r && r.success && r.result && Array.isArray(r.result.records)) {
                  all = all.concat(r.result.records);
                }
              });
              this.benefitOptions = all;
            });
          }
          this.benefitOptions = all;
        })
        .catch(() => {
          this.benefitOptions = [];
        })
        .finally(() => {
          this.benefitOptionsLoading = false;
        });
    },
    parseBenefitIdsFromString(str) {
      return String(str || "")
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
    },
    fillEditFormFromGrade(grade, benefitsOrderedIds) {
      this.formEdit = {
        id: grade.id || "",
        gradeName: grade.gradeName || "",
        isDefault: grade.isDefault === true,
        gradeImage: grade.gradeImage || "",
        gradeBackground: grade.gradeBackground || "",
        gradeFontColor: grade.gradeFontColor || "",
        requiredExperience: Number(grade.requiredExperience) > 0 ? Number(grade.requiredExperience) : 1,
        gradeSort: Number(grade.gradeSort) > 0 ? Number(grade.gradeSort) : 1,
        gradeState: grade.gradeState || "OPEN",
        benefitIds: grade.benefitIds || "",
      };
      this.editBenefitOrder = (benefitsOrderedIds || []).map((id) => String(id));
    },
    init() {
      this.getData();
      this.loadBenefitTypes();
      this.loadBenefitOptions();
    },
    getData() {
      this.loading = true;
      API_Member.getMemberGradeByPage().then((res) => {
        this.loading = false;
        if (res && res.success) {
          this.data = Array.isArray(res.result) ? res.result : [];
        }
      });
    },
    openAdd() {
      this.addFlag = true;
      this.submitAddLoading = false;
      if (!this.benefitOptions.length && !this.benefitOptionsLoading) {
        this.loadBenefitOptions();
      }
      this.$nextTick(() => {
        if (this.$refs.addForm) this.$refs.addForm.resetFields();
        this.formAdd = buildDefaultForm();
        this.addBenefitOrder = [];
      });
    },
    submitAdd() {
      this.$refs.addForm.validate((valid) => {
        if (!valid) return;
        this.submitAddLoading = true;
        const { benefitIds: _omit, ...rest } = this.formAdd;
        const payload = {
          ...rest,
          benefitIds: (this.addBenefitOrder || []).join(","),
        };
        API_Member.addMemberGrade(payload).then((res) => {
          this.submitAddLoading = false;
          if (res && res.success) {
            this.$Message.success("添加成功");
            this.addFlag = false;
            this.getData();
          }
        });
      });
    },
    openEdit(row) {
      this.editFlag = true;
      this.submitEditLoading = false;
      this.editDetailLoading = true;
      if (!this.benefitOptions.length && !this.benefitOptionsLoading) {
        this.loadBenefitOptions();
      }
      this.$nextTick(() => {
        if (this.$refs.editForm) this.$refs.editForm.resetFields();
      });
      API_Member.getMemberGrade(row.id)
        .then((res) => {
          this.editDetailLoading = false;
          if (res && res.success && res.result) {
            const raw = res.result;
            const grade = raw.grade != null ? raw.grade : raw;
            const benefits = Array.isArray(raw.benefits) ? raw.benefits : [];
            const orderedIds = benefits.length
              ? benefits.map((b) => b.id).filter((id) => id != null && id !== "")
              : String(grade.benefitIds || "")
                  .split(",")
                  .map((s) => s.trim())
                  .filter(Boolean);
            this.fillEditFormFromGrade(grade, orderedIds);
          } else {
            this.fillEditFormFromGrade(row, this.parseBenefitIdsFromString(row.benefitIds));
          }
        })
        .catch(() => {
          this.editDetailLoading = false;
          this.fillEditFormFromGrade(row, this.parseBenefitIdsFromString(row.benefitIds));
        });
    },
    submitEdit() {
      this.$refs.editForm.validate((valid) => {
        if (!valid) return;
        this.submitEditLoading = true;
        const { id, benefitIds: _omit, ...rest } = this.formEdit;
        const payload = {
          ...rest,
          benefitIds: (this.editBenefitOrder || []).join(","),
        };
        API_Member.updateMemberGrade(id, payload).then((res) => {
          this.submitEditLoading = false;
          if (res && res.success) {
            this.$Message.success("修改成功");
            this.editFlag = false;
            this.getData();
          }
        });
      });
    },
    onGradeStateSwitch(row, checked) {
      const nextState = checked ? "OPEN" : "CLOSE";
      const prevState = row.gradeState;
      if (nextState === prevState) return;
      const text = checked ? "开启" : "关闭";
      this.$Modal.confirm({
        title: "提示",
        content: `<p>确定${text}该客户等级？</p>`,
        onOk: () => {
          this.$set(row, "_gradeStateLoading", true);
          return API_Member.updateMemberGradeState(row.id, nextState)
            .then((res) => {
              this.$set(row, "_gradeStateLoading", false);
              if (res && res.success) {
                this.$Message.success(`${text}成功`);
                this.$set(row, "gradeState", nextState);
              } else {
                this.getData();
              }
            })
            .catch(() => {
              this.$set(row, "_gradeStateLoading", false);
            });
        },
      });
    },
    remove(row) {
      this.$Modal.confirm({
        title: "提示",
        content: "<p>确定删除该客户等级？</p>",
        onOk: () => {
          API_Member.deleteMemberGrade(row.id).then((res) => {
            if (res && res.success) {
              this.$Message.success("删除成功");
              this.getData();
            } else if (res && res.message) {
              this.$Message.error(res.message);
            }
          });
        },
      });
    },
  },
  mounted() {
    this.init();
  },
};
</script>
