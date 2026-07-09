#!/usr/bin/env node
/**
 * Migrate seller Vue files from iView to Element Plus.
 * Usage: node scripts/migrate-iview-to-element.js
 */
const fs = require("fs");
const path = require("path");

const SELLER_ROOT = path.join(__dirname, "..");
const MANAGER_ROOT = path.join(__dirname, "../../manager");

const SHOP_COPY_MAP = [
  ["src/views/shop/modelForm.vue", "src/views/page-decoration/modelForm.vue"],
  ["src/views/shop/modelFormItem.vue", "src/views/page-decoration/modelFormItem.vue"],
  ["src/views/shop/renovation.vue", "src/views/page-decoration/renovation.vue"],
  ["src/views/shop/floorList.vue", "src/views/page-decoration/floorList.vue"],
  ["src/views/shop/wap/index.vue", "src/views/page-decoration/wap/index.vue"],
  ["src/views/shop/wap/main.vue", "src/views/page-decoration/wap/main.vue"],
  ["src/views/shop/wap/decorate.vue", "src/views/page-decoration/wap/decorate.vue"],
  ["src/views/shop/wap/navbar.vue", "src/views/page-decoration/wap/navbar.vue"],
  ["src/views/shop/wap/wapList.vue", "src/views/page-decoration/wap/wapList.vue"],
  ["src/views/shop/wap/advertising.vue", "src/views/page-decoration/wap/advertising.vue"],
  ["src/views/shop/wap/alertAdvertising.vue", "src/views/page-decoration/wap/alertAdvertising.vue"],
];

const WAP_TEMPLATES = [
  "tpl_banner.vue", "tpl_flex_five.vue", "tpl_flex_four.vue", "tpl_flex_one.vue",
  "tpl_flex_three.vue", "tpl_flex_two.vue", "tpl_goods.vue", "tpl_group.vue",
  "tpl_integral.vue", "tpl_join_group.vue", "tpl_left_one_right_two.vue",
  "tpl_left_two_right_one.vue", "tpl_menu.vue", "tpl_search.vue", "tpl_spike.vue",
  "tpl_text_picture.vue", "tpl_title.vue", "tpl_top_one_bottom_two.vue",
  "tpl_top_two_bottom_one.vue", "tpl_view_list.vue",
];

const MODEL_LIST = [
  "carousel.vue", "carousel1.vue", "carousel2.vue", "firstPageAdvert.vue",
  "newGoodsSort.vue", "notEnough.vue", "recommend.vue", "seckill.vue",
];

WAP_TEMPLATES.forEach((f) => {
  SHOP_COPY_MAP.push([
    `src/views/shop/wap/template/${f}`,
    `src/views/page-decoration/wap/template/${f}`,
  ]);
});

MODEL_LIST.forEach((f) => {
  SHOP_COPY_MAP.push([
    `src/views/shop/modelList/${f}`,
    `src/views/page-decoration/modelList/${f}`,
  ]);
});

const TARGET_DIRS = [
  "src/views/order",
  "src/views/distribution",
  "src/views/statistics",
  "src/views/promotion",
  "src/views/goods",
  "src/views/shop",
  "src/views/sys",
  "src/views/member",
  "src/views/message",
];

function adaptSellerContent(content, sellerRelPath) {
  let c = content;

  // Seller-specific API/path adjustments for copied decoration files
  if (sellerRelPath.includes("shop/")) {
    c = c.replace(/@\/views\/page-decoration\//g, "@/views/shop/");
    c = c.replace(/admin-setting/g, "seller-setting");
    c = c.replace(/adminPCPageCache/g, "sellerPCPageCache");
    c = c.replace(/getStore\('adminPCPageCache'\)/g, "getStore('sellerPCPageCache')");
    c = c.replace(/setStore\('adminPCPageCache'/g, "setStore('sellerPCPageCache'");
    c = c.replace(/@\/api\/other\.js/g, "@/api/other.js");
  }

  return c;
}

function applyScriptTransforms(content) {
  let c = content;
  c = c.replace(/\$options\.filters\./g, "$filters.");
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
  c = c.replace(/@keydown\.enter\.native/g, "@keyup.enter");
  c = c.replace(/slot-scope="([^"]+)"/g, '#default="$1"');
  c = c.replace(/slot="([^"]+)"/g, '#$1');
  c = c.replace(/\|\s*unitPrice\(/g, "{{ $filters.unitPrice(");
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
    [/<Checkbox/g, "<el-checkbox"],
    [/<\/Checkbox>/g, "</el-checkbox>"],
    [/<Poptip/g, "<el-popover"],
    [/<\/Poptip>/g, "</el-popover>"],
    [/<Tooltip/g, "<el-tooltip"],
    [/<\/Tooltip>/g, "</el-tooltip>"],
    [/:label-width="(\d+)"/g, 'label-width="$1px"'],
    [/:mask-closable="false"/g, ':close-on-click-modal="false"'],
    [/:width="(\d+)"/g, 'width="$1"'],
    [/\bv-model="modalVisible"/g, 'v-model="modalVisible"'],
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
    } else if (entry.name.endsWith(".vue") && entry.name !== "readme.vue") {
      files.push(full);
    }
  }
  return files;
}

const copied = [];
const transformed = [];
const skipped = [];

// Copy decoration files from manager
for (const [sellerRel, managerRel] of SHOP_COPY_MAP) {
  const managerPath = path.join(MANAGER_ROOT, managerRel);
  const sellerPath = path.join(SELLER_ROOT, sellerRel);
  if (!fs.existsSync(managerPath)) {
    skipped.push({ file: sellerRel, reason: "manager counterpart missing" });
    continue;
  }
  let content = fs.readFileSync(managerPath, "utf8");
  content = adaptSellerContent(content, sellerRel);
  fs.mkdirSync(path.dirname(sellerPath), { recursive: true });
  fs.writeFileSync(sellerPath, content);
  copied.push(sellerRel);
}

// Transform remaining target files (skip already copied)
const copiedSet = new Set(copied);
for (const dir of TARGET_DIRS) {
  const absDir = path.join(SELLER_ROOT, dir);
  for (const filePath of walkDir(absDir)) {
    const rel = path.relative(SELLER_ROOT, filePath).replace(/\\/g, "/");
    if (copiedSet.has(rel)) continue;

    let content = fs.readFileSync(filePath, "utf8");
    const original = content;

    // Skip if already fully migrated (has el-table and no iView Table)
    const hasIView =
      /<(Card|Form|Form-item|FormItem|Table|Button|Modal|Page|Tabs|TabPane|Input|Select|Option|DatePicker|Row|Poptip)\b/.test(
        content
      );
    if (!hasIView) {
      skipped.push({ file: rel, reason: "already migrated or no iView" });
      continue;
    }

    content = applyTemplateTransforms(content);
    content = applyScriptTransforms(content);
    fs.writeFileSync(filePath, content);
    transformed.push(rel);
  }
}

console.log("=== Migration Summary ===");
console.log(`Copied from manager: ${copied.length}`);
console.log(`Script-transformed: ${transformed.length}`);
console.log(`Skipped: ${skipped.length}`);
console.log("\nCopied files:");
copied.forEach((f) => console.log("  " + f));
console.log("\nTransformed files:");
transformed.forEach((f) => console.log("  " + f));
console.log("\nSkipped:");
skipped.forEach(({ file, reason }) => console.log(`  ${file}: ${reason}`));
