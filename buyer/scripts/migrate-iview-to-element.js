#!/usr/bin/env node
/**
 * Migrate buyer Vue files from iView to Element Plus.
 * Usage: node scripts/migrate-iview-to-element.js
 */
const fs = require("fs");
const path = require("path");

const BUYER_ROOT = path.join(__dirname, "..");
const MANAGER_ROOT = path.join(__dirname, "../../manager");

const MODEL_LIST = [
  ["Carousel.vue", "carousel.vue"],
  ["Carousel1.vue", "carousel1.vue"],
  ["Carousel2.vue", "carousel2.vue"],
  ["FirstPageAdvert.vue", "firstPageAdvert.vue"],
  ["NewGoodsSort.vue", "newGoodsSort.vue"],
  ["NotEnough.vue", "notEnough.vue"],
  ["Recommend.vue", "recommend.vue"],
  ["Seckill.vue", "seckill.vue"],
  ["forYour.vue", "forYour.vue"],
  ["goodsAndType.vue", "goodsAndType.vue"],
  ["mixModel.vue", "mixModel.vue"],
  ["oneRowThreeColumns.vue", "oneRowThreeColumns.vue"],
  ["onlyGoodsModel.vue", "onlyGoodsModel.vue"],
  ["mixs/mix-brand.vue", "mixs/mix-brand.vue"],
  ["mixs/mix-goods.vue", "mixs/mix-goods.vue"],
];

const DECORATE_COPY_MAP = [
  [
    "src/components/indexDecorate/ModelForm.vue",
    "src/views/page-decoration/modelForm.vue",
  ],
  [
    "src/components/indexDecorate/ModelFormItem.vue",
    "src/views/page-decoration/modelFormItem.vue",
  ],
];

MODEL_LIST.forEach(([buyerName, managerName]) => {
  DECORATE_COPY_MAP.push([
    `src/components/indexDecorate/modelList/${buyerName}`,
    `src/views/page-decoration/modelList/${managerName}`,
  ]);
});

const TARGET_DIRS = ["src/pages", "src/components"];

function adaptBuyerContent(content) {
  return content
    .replace(/@\/views\/page-decoration\//g, "@/components/indexDecorate/")
    .replace(/admin-setting/g, "buyer-setting")
    .replace(/adminPCPageCache/g, "buyerPCPageCache")
    .replace(/getStore\('adminPCPageCache'\)/g, "getStore('buyerPCPageCache')")
    .replace(/setStore\('adminPCPageCache'/g, "setStore('buyerPCPageCache'");
}

function applyScriptTransforms(content) {
  let c = content;
  c = c.replace(/\$options\.filters\./g, "$filters.");
  c = c.replace(/\|\s*unitPrice\(/g, "{{ $filters.unitPrice(");
  c = c.replace(/\|\s*unixToDate\(/g, "{{ $filters.unixToDate(");
  c = c.replace(/\bbeforeDestroy\b/g, "beforeUnmount");
  c = c.replace(/this\.\$set\(([^,]+),\s*([^,]+),\s*([^)]+)\)/g, "$1[$2] = $3");
  c = c.replace(/::v-deep/g, ":deep");
  c = c.replace(/\/deep\//g, ":deep");
  c = c.replace(/@on-change/g, "@change");
  c = c.replace(/@on-click/g, "@click");
  c = c.replace(/@on-ok/g, "@ok");
  c = c.replace(/@on-cancel/g, "@cancel");
  c = c.replace(/@on-clear/g, "@clear");
  c = c.replace(/@on-open-change/g, "@visible-change");
  c = c.replace(/@on-page-size-change/g, "@size-change");
  c = c.replace(/@on-select/g, "@select");
  c = c.replace(/@keydown\.enter\.native/g, "@keyup.enter");
  c = c.replace(/slot-scope="([^"]+)"/g, '#default="$1"');
  c = c.replace(/slot="([^"]+)"/g, '#$1');
  c = c.replace(/from ['"]view-design['"]/g, 'from "@/utils/message"');
  c = c.replace(/import\s*\{([^}]*)\}\s*from\s*['"]view-design['"]/g, 'import {$1} from "@/utils/message"');
  return c;
}

function applyTemplateTransforms(content) {
  let c = content;
  const replacements = [
    [/<\/?Card>/g, (m) => m.replace("Card", "el-card")],
    [/<Form-item/g, "<el-form-item"],
    [/<\/Form-item>/g, "</el-form-item>"],
    [/<FormItem/g, "<el-form-item"],
    [/<\/FormItem>/g, "</el-form-item>"],
    [/<Form(\s|>)/g, "<el-form$1"],
    [/<\/Form>/g, "</el-form>"],
    [/<InputNumber/g, "<el-input-number"],
    [/<\/InputNumber>/g, "</el-input-number>"],
    [/<Input(\s|>)/g, "<el-input$1"],
    [/<\/Input>/g, "</el-input>"],
    [/<Button(\s|>)/g, "<el-button$1"],
    [/<\/Button>/g, "</el-button>"],
    [/<Select(\s|>)/g, "<el-select$1"],
    [/<\/Select>/g, "</el-select>"],
    [/<Option(\s)/g, "<el-option "],
    [/<\/Option>/g, "</el-option>"],
    [/<DatePicker/g, "<el-date-picker"],
    [/<\/DatePicker>/g, "</el-date-picker>"],
    [/<TimePicker/g, "<el-time-picker"],
    [/<\/TimePicker>/g, "</el-time-picker>"],
    [/<Modal/g, "<el-dialog"],
    [/<\/Modal>/g, "</el-dialog>"],
    [/<Page(\s)/g, "<el-pagination "],
    [/<\/Page>/g, "</el-pagination>"],
    [/<Tabs(\s|>)/g, "<el-tabs$1"],
    [/<\/Tabs>/g, "</el-tabs>"],
    [/<TabPane/g, "<el-tab-pane"],
    [/<\/TabPane>/g, "</el-tab-pane>"],
    [/<Row(\s|>)/g, "<div$1"],
    [/<\/Row>/g, "</div>"],
    [/<Col(\s|>)/g, "<div$1"],
    [/<\/Col>/g, "</div>"],
    [/<Tag(\s|>)/g, "<el-tag$1"],
    [/<\/Tag>/g, "</el-tag>"],
    [/<Switch(\s|>)/g, "<el-switch$1"],
    [/<\/Switch>/g, "</el-switch>"],
    [/<RadioGroup/g, "<el-radio-group"],
    [/<\/RadioGroup>/g, "</el-radio-group>"],
    [/<Radio(\s)/g, "<el-radio "],
    [/<\/Radio>/g, "</el-radio>"],
    [/<CheckboxGroup/g, "<el-checkbox-group"],
    [/<\/CheckboxGroup>/g, "</el-checkbox-group>"],
    [/<Checkbox/g, "<el-checkbox"],
    [/<\/Checkbox>/g, "</el-checkbox>"],
    [/<Poptip/g, "<el-popover"],
    [/<\/Poptip>/g, "</el-popover>"],
    [/<Tooltip/g, "<el-tooltip"],
    [/<\/Tooltip>/g, "</el-tooltip>"],
    [/<Drawer/g, "<el-drawer"],
    [/<\/Drawer>/g, "</el-drawer>"],
    [/<Alert/g, "<el-alert"],
    [/<\/Alert>/g, "</el-alert>"],
    [/<Badge/g, "<el-badge"],
    [/<\/Badge>/g, "</el-badge>"],
    [/<Divider/g, "<el-divider"],
    [/<\/Divider>/g, "</el-divider>"],
    [/<Rate/g, "<el-rate"],
    [/<\/Rate>/g, "</el-rate>"],
    [/<Steps/g, "<el-steps"],
    [/<\/Steps>/g, "</el-steps>"],
    [/<Step(\s)/g, "<el-step "],
    [/<\/Step>/g, "</el-step>"],
    [/<Upload/g, "<el-upload"],
    [/<\/Upload>/g, "</el-upload>"],
    [/<Cascader/g, "<el-cascader"],
    [/<\/Cascader>/g, "</el-cascader>"],
    [/<Affix/g, "<el-affix"],
    [/<\/Affix>/g, "</el-affix>"],
    [/<Spin/g, "<el-skeleton"],
    [/<\/Spin>/g, "</el-skeleton>"],
    [/:label-width="(\d+)"/g, 'label-width="$1px"'],
    [/:mask-closable="false"/g, ':close-on-click-modal="false"'],
    [/:width="(\d+)"/g, 'width="$1"'],
    [/type="primary"/g, 'type="primary"'],
  ];
  for (const [pattern, replacement] of replacements) {
    c = c.replace(pattern, replacement);
  }
  return c;
}

function walkDir(dir, files = []) {
  if (!fs.existsSync(dir)) return files;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walkDir(full, files);
    } else if (entry.name.endsWith(".vue")) {
      files.push(full);
    }
  }
  return files;
}

const copied = [];
const transformed = [];
const skipped = [];

for (const [buyerRel, managerRel] of DECORATE_COPY_MAP) {
  const managerPath = path.join(MANAGER_ROOT, managerRel);
  const buyerPath = path.join(BUYER_ROOT, buyerRel);
  if (!fs.existsSync(managerPath)) {
    skipped.push({ file: buyerRel, reason: "manager counterpart missing" });
    continue;
  }
  let content = fs.readFileSync(managerPath, "utf8");
  content = adaptBuyerContent(content);
  fs.mkdirSync(path.dirname(buyerPath), { recursive: true });
  fs.writeFileSync(buyerPath, content);
  copied.push(buyerRel);
}

const copiedSet = new Set(copied);
for (const dir of TARGET_DIRS) {
  const absDir = path.join(BUYER_ROOT, dir);
  for (const filePath of walkDir(absDir)) {
    const rel = path.relative(BUYER_ROOT, filePath).replace(/\\/g, "/");
    if (copiedSet.has(rel)) continue;

    let content = fs.readFileSync(filePath, "utf8");
    const hasIView =
      /<(Card|Form|Form-item|FormItem|Table|Button|Modal|Page|Tabs|TabPane|Input|Select|Option|DatePicker|Row|Poptip|Drawer|Upload|Checkbox|Radio|Switch|Tag|Alert|Rate|Steps|Step|Spin|Affix|TimePicker|Cascader|Divider|Badge|InputNumber)\b/.test(
        content
      );
    if (!hasIView) {
      skipped.push({ file: rel, reason: "no iView components" });
      continue;
    }

    content = applyTemplateTransforms(content);
    content = applyScriptTransforms(content);
    fs.writeFileSync(filePath, content);
    transformed.push(rel);
  }
}

console.log("=== Buyer Migration Summary ===");
console.log(`Copied from manager: ${copied.length}`);
console.log(`Script-transformed: ${transformed.length}`);
console.log(`Skipped: ${skipped.length}`);
