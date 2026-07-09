<template>
  <div class="search">
    <el-card>
      <div class="operation padding-row">
        <el-button type="primary" @click="openAdd">添加客户等级</el-button>
      </div>

      <el-table v-loading="loading" border :data="data" class="mt_10" style="width: 100%">
        <el-table-column prop="gradeName" label="等级名称" width="130" show-overflow-tooltip />
        <el-table-column label="默认等级" width="95">
          <template #default="{ row }">
            <el-tag v-if="row" :type="row.isDefault === true ? 'success' : 'info'">
              {{ row.isDefault === true ? "是" : "否" }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="等级图标" width="100">
          <template #default="{ row }">
            <span v-if="row && !row.gradeImage">-</span>
            <img
              v-else-if="row"
              :src="row.gradeImage"
              alt="等级图标"
              style="width: 48px; height: 48px; object-fit: contain; border: 1px solid #dcdee2; border-radius: 4px; background: #fff"
            />
          </template>
        </el-table-column>
        <el-table-column label="等级背景图" width="120">
          <template #default="{ row }">
            <span v-if="row && !row.gradeBackground">-</span>
            <img
              v-else-if="row"
              :src="row.gradeBackground"
              alt="等级背景图"
              style="width: 64px; height: 40px; object-fit: cover; border: 1px solid #dcdee2; border-radius: 4px; background: #fff"
            />
          </template>
        </el-table-column>
        <el-table-column prop="requiredExperience" label="所需经验值" width="110" />
        <el-table-column prop="gradeSort" label="等级排序" width="95" />
        <el-table-column label="状态" width="118" align="center">
          <template #default="{ row }">
            <el-switch
              v-if="row"
              :model-value="row.gradeState === 'OPEN'"
              inline-prompt
              active-text="开启"
              inactive-text="关闭"
              :loading="!!row._gradeStateLoading"
              @change="(checked) => onGradeStateSwitch(row, checked)"
            />
          </template>
        </el-table-column>
        <el-table-column label="操作" width="130" align="center">
          <template #default="{ row }">
            <div v-if="row" class="ops" style="display: flex; justify-content: center">
              <a class="link-text" @click="openEdit(row)">编辑</a>
              <span class="op-split">|</span>
              <a class="link-text" @click="remove(row)">删除</a>
            </div>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <el-dialog v-model="addFlag" title="添加客户等级" width="720px" :z-index="950" :close-on-click-modal="false" destroy-on-close>
      <el-form ref="addForm" :model="formAdd" :rules="rules" label-width="110px">
        <el-form-item label="等级名称" prop="gradeName">
          <el-input v-model="formAdd.gradeName" maxlength="50" placeholder="请输入等级名称" />
        </el-form-item>
        <el-form-item label="是否默认" prop="isDefault">
          <el-radio-group v-model="formAdd.isDefault">
            <el-radio :value="true">是</el-radio>
            <el-radio :value="false">否</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="等级图标" prop="gradeImage">
          <upload-pic-input v-model="formAdd.gradeImage" />
        </el-form-item>
        <el-form-item label="等级背景图" prop="gradeBackground">
          <upload-pic-input v-model="formAdd.gradeBackground" />
        </el-form-item>
        <el-form-item label="字体颜色" prop="gradeFontColor">
          <el-input v-model="formAdd.gradeFontColor" maxlength="20" placeholder="如：#333333" />
        </el-form-item>
        <el-form-item label="所需经验值" prop="requiredExperience">
          <el-input-number v-model="formAdd.requiredExperience" :min="1" :precision="0" style="width: 220px" />
        </el-form-item>
        <el-form-item label="等级排序" prop="gradeSort">
          <el-input-number v-model="formAdd.gradeSort" :min="1" :max="9999" :precision="0" style="width: 220px" />
        </el-form-item>
        <el-form-item label="等级开关" prop="gradeState">
          <el-radio-group v-model="formAdd.gradeState">
            <el-radio value="OPEN">开启</el-radio>
            <el-radio value="CLOSE">关闭</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="关联权益" prop="benefitIds">
          <el-select
            :model-value="addBenefitOrder"
            multiple
            filterable
            placeholder="请选择客户权益"
            style="width: 100%"
            @change="onAddBenefitIdsChange"
          >
            <el-option
              v-for="b in benefitOptions"
              :key="b.id"
              :value="String(b.id)"
              :label="benefitOptionLabel(b)"
            />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="addFlag = false">取消</el-button>
        <el-button type="primary" :loading="submitAddLoading" @click="submitAdd">确定</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="editFlag" title="编辑客户等级" width="720px" :z-index="950" :close-on-click-modal="false" destroy-on-close>
      <el-form ref="editForm" :model="formEdit" :rules="rules" label-width="110px">
        <el-input v-model="formEdit.id" style="display: none" />
        <el-form-item label="等级名称" prop="gradeName">
          <el-input v-model="formEdit.gradeName" maxlength="50" placeholder="请输入等级名称" />
        </el-form-item>
        <el-form-item label="是否默认" prop="isDefault">
          <el-radio-group v-model="formEdit.isDefault">
            <el-radio :value="true">是</el-radio>
            <el-radio :value="false">否</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="等级图标" prop="gradeImage">
          <upload-pic-input v-model="formEdit.gradeImage" />
        </el-form-item>
        <el-form-item label="等级背景图" prop="gradeBackground">
          <upload-pic-input v-model="formEdit.gradeBackground" />
        </el-form-item>
        <el-form-item label="字体颜色" prop="gradeFontColor">
          <el-input v-model="formEdit.gradeFontColor" maxlength="20" placeholder="如：#333333" />
        </el-form-item>
        <el-form-item label="所需经验值" prop="requiredExperience">
          <el-input-number v-model="formEdit.requiredExperience" :min="1" :precision="0" style="width: 220px" />
        </el-form-item>
        <el-form-item label="等级排序" prop="gradeSort">
          <el-input-number v-model="formEdit.gradeSort" :min="1" :max="9999" :precision="0" style="width: 220px" />
        </el-form-item>
        <el-form-item label="等级开关" prop="gradeState">
          <el-radio-group v-model="formEdit.gradeState">
            <el-radio value="OPEN">开启</el-radio>
            <el-radio value="CLOSE">关闭</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="关联权益" prop="benefitIds">
          <el-select
            :model-value="editBenefitOrder"
            multiple
            filterable
            placeholder="请选择客户权益"
            style="width: 100%"
            @change="onEditBenefitIdsChange"
          >
            <el-option
              v-for="b in benefitOptions"
              :key="b.id"
              :value="String(b.id)"
              :label="benefitOptionLabel(b)"
            />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="editFlag = false">取消</el-button>
        <el-button type="primary" :loading="submitEditLoading" @click="submitEdit">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script>
import * as API_Member from "@/api/member.js";
import uploadPicInput from "@/components/lili/upload-pic-input";
import { ElMessage, ElMessageBox } from "element-plus";

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
      data: [],
      addFlag: false,
      editFlag: false,
      submitAddLoading: false,
      submitEditLoading: false,
      formAdd: buildDefaultForm(),
      formEdit: buildDefaultForm(),
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
            ElMessage.success("添加成功");
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
            ElMessage.success("修改成功");
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
      ElMessageBox.confirm(`确定${text}该客户等级？`, "提示", { type: "warning" }).then(() => {
        row._gradeStateLoading = true;
        return API_Member.updateMemberGradeState(row.id, nextState)
          .then((res) => {
            row._gradeStateLoading = false;
            if (res && res.success) {
              ElMessage.success(`${text}成功`);
              row.gradeState = nextState;
            } else {
              this.getData();
            }
          })
          .catch(() => {
            row._gradeStateLoading = false;
          });
      }).catch(() => {});
    },
    remove(row) {
      ElMessageBox.confirm("确定删除该客户等级？", "提示", { type: "warning" }).then(() => {
        API_Member.deleteMemberGrade(row.id).then((res) => {
          if (res && res.success) {
            ElMessage.success("删除成功");
            this.getData();
          } else if (res && res.message) {
            ElMessage.error(res.message);
          }
        });
      }).catch(() => {});
    },
  },
  mounted() {
    this.init();
  },
};
</script>
<style scoped>
.ops a {
  color: #2d8cf0;
  cursor: pointer;
  text-decoration: none;
}
.ops span {
  display: inline-block;
  margin: 0 8px;
  color: #dcdee2;
}
</style>
