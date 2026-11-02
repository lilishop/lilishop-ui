<template>
  <div class="search">
    <el-card>
      <el-tabs v-model="activeTab" @tab-change="clickTab">
        <el-tab-pane label="词库管理" name="words">
          <div class="operation">
            <el-button type="primary" @click="add">添加</el-button>
            <el-button @click="delAll">批量删除</el-button>
          </div>

          <el-table
            ref="table"
            v-loading="loading"
            border
            :data="data"
            style="width: 100%"
            row-key="id"
            @selection-change="changeSelect"
          >
            <el-table-column type="selection" width="60" align="center" />
            <el-table-column prop="sensitiveWord" label="敏感词" min-width="120" />
            <el-table-column prop="createTime" label="创建时间" width="200" />
            <el-table-column prop="updateTime" label="更新时间" width="200" />
            <el-table-column prop="createBy" label="操作人" min-width="150" />
            <el-table-column label="操作" width="200" align="center" fixed="right">
              <template #default="{ row }">
                <template v-if="row">
                  <a class="link-text" @click="detail(row)">修改</a>
                  <span class="op-split">|</span>
                  <a class="link-text" @click="remove(row)">删除</a>
                </template>
              </template>
            </el-table-column>
          </el-table>

          <div class="mt_10" style="display: flex; justify-content: flex-end">
            <el-pagination
              v-model:current-page="searchForm.pageNumber"
              v-model:page-size="searchForm.pageSize"
              :page-sizes="[20, 50, 100]"
              :total="total"
              layout="total, sizes, prev, pager, next, jumper"
              size="small"
              @current-change="changePage"
              @size-change="changePageSize"
            />
          </div>
        </el-tab-pane>

        <el-tab-pane label="敏感词设置" name="switch">
          <div v-loading="settingLoading" class="switch-setting">
            <ul class="side-menu">
              <li
                :class="{ active: sideKey === 'func' }"
                @click="sideKey = 'func'"
              >
                功能开关
              </li>
              <li
                :class="{ active: sideKey === 'scene' }"
                @click="sideKey = 'scene'"
              >
                应用场景配置
              </li>
            </ul>
            <div class="setting-content">
              <template v-if="sideKey === 'func'">
                <div class="setting-row">
                  <span class="row-label">敏感词过滤:</span>
                  <el-switch v-model="settingForm.enabled" />
                </div>
                <div class="row-desc">关闭后，所有场景的敏感词过滤均不生效</div>
              </template>
              <template v-else>
                <div
                  v-for="group in sensitiveGroups"
                  :key="group.key"
                  class="scene-row"
                >
                  <div class="setting-row">
                    <span class="row-label">{{ group.name }}:</span>
                    <el-switch
                      :model-value="!settingForm.disabledGroups.includes(group.key)"
                      @update:model-value="toggleGroup(group.key, $event)"
                    />
                  </div>
                  <div class="row-desc">涉及:{{ group.desc }}</div>
                </div>
              </template>
            </div>
          </div>
          <div class="save-bar">
            <el-button
              type="primary"
              :loading="settingSaving"
              @click="saveSetting"
            >
              保存
            </el-button>
          </div>
        </el-tab-pane>
      </el-tabs>
    </el-card>

    <el-drawer
      v-model="modalVisible"
      :title="modalTitle"
      size="500px"
      append-to-body
      :close-on-click-modal="false"
      destroy-on-close
    >
      <el-form ref="formRef" :model="form" label-width="100px" :rules="formValidate">
        <el-form-item label="敏感词" prop="sensitiveWord">
          <el-input v-model="form.sensitiveWord" clearable style="width: 100%" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="modalVisible = false">取消</el-button>
        <el-button type="primary" :loading="submitLoading" @click="handleSubmit">提交</el-button>
      </template>
    </el-drawer>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from "vue";
import {
  getSensitiveWordsPage,
  delSensitive,
  insertSensitiveWords,
  updateSensitiveWords,
  getSetting,
  setSetting,
} from "@/api/index";
import { Message, Modal } from "@/utils/message";

defineOptions({ name: "sensitive-words" });

const SETTING_KEY = "SENSITIVE_WORDS_SETTING";

const activeTab = ref("words");
const loading = ref(true);
const modalType = ref(0);
const modalVisible = ref(false);
const modalTitle = ref("");
const searchForm = reactive({
  pageNumber: 1,
  pageSize: 20,
  sort: "createTime",
  order: "desc",
  sensitiveWord: "",
});
const form = ref({
  sensitiveWord: "",
});
const formValidate = reactive({
  sensitiveWord: [
    {
      required: true,
      message: "请输入敏感词",
      trigger: "blur",
    },
  ],
});
const submitLoading = ref(false);
const selectList = ref([]);
const selectCount = ref(0);
const data = ref([]);
const total = ref(0);
// 补充声明：原代码未在 data 声明，直接挂载 this 上
let id = null;

const table = ref(null);
const formRef = ref(null);

// 开关设置
const sideKey = ref("func");
const settingLoading = ref(false);
const settingSaving = ref(false);
const settingLoaded = ref(false);
const settingForm = reactive({
  enabled: true,
  disabledGroups: [],
});
const sensitiveGroups = [
  { key: "MEMBER", name: "会员信息", desc: "用户昵称、收货地址信息" },
  { key: "EVALUATION", name: "产品评价", desc: "用户发布评论信息" },
  { key: "STORE", name: "商家", desc: "商家入驻信息" },
  { key: "GOODS", name: "产品信息", desc: "商品发布、商品修改、商品分类信息" },
  { key: "PROMOTION", name: "促销活动", desc: "活动名称、优惠券名称信息" },
  { key: "DECORATION", name: "装修模块", desc: "导航名称、装修楼层中的标题和子标题" },
  { key: "REASON", name: "原因管理", desc: "退款/退货/换货原因信息" },
  { key: "ARTICLE", name: "资讯管理", desc: "分类名称、文章标题、文章详情" },
];

function init() {
  getDataList();
}
function clickTab(name) {
  if (name === "switch" && !settingLoaded.value) {
    loadSetting();
  }
}
function loadSetting() {
  settingLoading.value = true;
  getSetting(SETTING_KEY)
    .then((res) => {
      let parsed = {};
      const raw = res ? res.result : null;
      if (typeof raw === "string") {
        try {
          parsed = JSON.parse(raw);
        } catch (e) {
          parsed = {};
        }
      } else if (raw && typeof raw === "object") {
        parsed = raw;
      }
      settingForm.enabled =
        parsed.enabled !== undefined ? Boolean(parsed.enabled) : true;
      settingForm.disabledGroups = Array.isArray(parsed.disabledGroups)
        ? parsed.disabledGroups
        : [];
    })
    .catch(() => {
      // 设置记录不存在时按默认值处理
      settingForm.enabled = true;
      settingForm.disabledGroups = [];
    })
    .finally(() => {
      settingLoading.value = false;
      settingLoaded.value = true;
    });
}
function toggleGroup(key, enabled) {
  const index = settingForm.disabledGroups.indexOf(key);
  if (enabled && index > -1) {
    settingForm.disabledGroups.splice(index, 1);
  } else if (!enabled && index === -1) {
    settingForm.disabledGroups.push(key);
  }
}
function saveSetting() {
  settingSaving.value = true;
  setSetting(SETTING_KEY, {
    enabled: settingForm.enabled,
    disabledGroups: settingForm.disabledGroups,
  })
    .then((res) => {
      if (res.success) {
        Message.success("保存成功");
      } else {
        Message.error(res.message || "保存失败");
      }
    })
    .finally(() => {
      settingSaving.value = false;
    });
}
function changePage(v) {
  searchForm.pageNumber = v;
  getDataList();
  clearSelectAll();
}
function changePageSize(v) {
  searchForm.pageNumber = 1;
  searchForm.pageSize = v;
  getDataList();
}
function handleSearch() {
  searchForm.pageNumber = 1;
  getDataList();
}
function clearSelectAll() {
  table.value?.clearSelection();
}
function changeSelect(e) {
  selectList.value = e;
  selectCount.value = e.length;
}
function getDataList() {
  loading.value = true;
  getSensitiveWordsPage(searchForm)
    .then((res) => {
      if (res.success) {
        data.value = res.result.records;
        total.value = res.result.total;
      }
    })
    .finally(() => {
      loading.value = false;
    });
}
function handleSubmit() {
  formRef.value.validate((valid) => {
    if (valid) {
      submitLoading.value = true;
      if (modalType.value == 0) {
        delete form.value.id;
        insertSensitiveWords(form.value).then((res) => {
          submitLoading.value = false;
          if (res.success) {
            Message.success("操作成功");
            getDataList();
            modalVisible.value = false;
          }
        });
      } else {
        updateSensitiveWords(id, form.value).then((res) => {
          submitLoading.value = false;
          if (res.success) {
            Message.success("操作成功");
            getDataList();
            modalVisible.value = false;
          }
        });
      }
    }
  });
}
function add() {
  modalType.value = 0;
  modalTitle.value = "添加";
  form.value = {};
  formRef.value?.resetFields();
  modalVisible.value = true;
}
function detail(v) {
  modalType.value = 1;
  id = v.id;
  modalTitle.value = "修改";
  modalVisible.value = true;
  form.value.sensitiveWord = v.sensitiveWord;
}
function remove(v) {
  Modal.confirm({
    title: "确认删除",
    content: "您确认要删除 " + v.sensitiveWord + " ?",
    loading: true,
    onOk: () => {
      delSensitive(v.id).then((res) => {
        Modal.remove();
        if (res.success) {
          Message.success("操作成功");
          getDataList();
        }
      });
    },
  });
}
function delAll() {
  if (selectCount.value <= 0) {
    Message.warning("您还未选择要删除的数据");
    return;
  }
  Modal.confirm({
    title: "确认删除",
    content: "您确认要删除所选的 " + selectCount.value + " 条数据?",
    loading: true,
    onOk: () => {
      let ids = "";
      selectList.value.forEach(function (e) {
        ids += e.id + ",";
      });
      ids = ids.substring(0, ids.length - 1);
      delSensitive(ids).then((res) => {
        Modal.remove();
        if (res.success) {
          Message.success("操作成功");
          clearSelectAll();
          getDataList();
        }
      });
    },
  });
}

onMounted(() => {
  init();
});
</script>

<style lang="scss" scoped>
.switch-setting {
  display: flex;
  min-height: 300px;
  border: 1px solid #e8eaec;
  border-radius: 4px;
}

.side-menu {
  width: 140px;
  flex-shrink: 0;
  margin: 0;
  padding: 8px 0;
  list-style: none;
  border-right: 1px solid #e8eaec;

  li {
    padding: 10px 16px;
    color: #2d8cf0;
    font-size: 13px;
    cursor: pointer;
    border-left: 2px solid transparent;

    &.active {
      color: #2d8cf0;
      font-weight: 600;
      background-color: #f0f8ff;
      border-left-color: #2d8cf0;
    }

    &:hover {
      background-color: #f5f7fa;
    }
  }
}

.setting-content {
  flex: 1;
  padding: 16px 24px;
}

.setting-row {
  display: flex;
  align-items: center;
}

.row-label {
  display: inline-block;
  min-width: 80px;
  margin-right: 12px;
  color: #515a6e;
  font-size: 13px;
}

.row-desc {
  margin: 8px 0 0 92px;
  color: #999;
  font-size: 12px;
}

.scene-row {
  padding: 12px 0;
  border-bottom: 1px solid #e8eaec;

  &:last-child {
    border-bottom: none;
  }

  .row-desc {
    margin-top: 4px;
  }
}

.save-bar {
  margin-top: 16px;
}
</style>
