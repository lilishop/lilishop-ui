#!/usr/bin/env node
/**
 * Copy migrated manager Vue files to seller, preserving seller API imports where they differ.
 */
const fs = require("fs");
const path = require("path");

const SELLER = path.join(__dirname, "..");
const MANAGER = path.join(__dirname, "../../manager");

const FILE_MAP = [
  ["src/views/distribution/distributionOrder.vue", "src/views/distribution/distributionOrder.vue"],
  ["src/views/distribution/distributionGoods.vue", "src/views/distribution/distributionGoods.vue"],
  ["src/views/statistics/order.vue", "src/views/statistics/order.vue"],
  ["src/views/statistics/goods.vue", "src/views/statistics/goods.vue"],
  ["src/views/statistics/traffic.vue", "src/views/statistics/traffic.vue"],
  ["src/views/statistics/order/orderDetail.vue", "src/views/statistics/order/orderDetail.vue"],
  ["src/views/statistics/order/refundOrder.vue", "src/views/statistics/order/refundOrder.vue"],
  ["src/views/promotion/coupon/coupon.vue", "src/views/promotions/coupon/coupon.vue"],
  ["src/views/promotion/coupon/coupon-publish.vue", "src/views/promotions/coupon/coupon-publish.vue"],
  ["src/views/promotion/coupon/coupon-receive.vue", "src/views/promotions/coupon/coupon-receive.vue"],
  ["src/views/promotion/full-discount/full-discount.vue", "src/views/promotions/full-discount/full-discount.vue"],
  ["src/views/promotion/full-discount/full-discount-add.vue", "src/views/promotions/full-discount/full-discount-detail.vue"],
  ["src/views/promotion/pintuan/pintuan.vue", "src/views/promotions/pintuan/pintuan.vue"],
  ["src/views/promotion/pintuan/pintuan-goods.vue", "src/views/promotions/pintuan/pintuan-goods.vue"],
  ["src/views/promotion/pintuan/pintuan-edit.vue", "src/views/promotions/pintuan/pintuan-goods.vue"],
  ["src/views/promotion/seckill/seckill.vue", "src/views/promotions/seckill/seckill.vue"],
  ["src/views/promotion/seckill/seckill-goods.vue", "src/views/promotions/seckill/seckill-goods.vue"],
  ["src/views/promotion/live/live.vue", "src/views/promotions/live/live.vue"],
  ["src/views/promotion/live/liveGoods.vue", "src/views/promotions/live/live-detail.vue"],
  ["src/views/goods/goods-seller/goods.vue", "src/views/goods/goods-info/goods.vue"],
  ["src/views/goods/goods-manage/category.vue", "src/views/goods/goods-manage/category.vue"],
  ["src/views/sys/oss-manage/ossManage.vue", "src/views/sys/oss-manage/ossManage.vue"],
  ["src/views/order/order/orderList.vue", "src/views/order/order/orderList.vue"],
  ["src/views/order/order/orderDetail.vue", "src/views/order/order/orderDetail.vue"],
  ["src/views/order/order/virtualOrderList.vue", "src/views/order/order/fictitiousOrderList.vue"],
  ["src/views/order/after-order/orderComplaint.vue", "src/views/order/after-order/orderComplaint.vue"],
  ["src/views/order/after-order/orderComplaintDetail.vue", "src/views/order/after-order/orderComplaintDetail.vue"],
  ["src/views/order/after-order/returnGoodsOrder.vue", "src/views/order/after-order/afterSaleOrder.vue"],
  ["src/views/order/after-order/returnMoneyOrder.vue", "src/views/order/after-order/afterSale.vue"],
  ["src/views/order/after-order/reurnGoodsOrderDetail.vue", "src/views/order/after-order/afterSaleOrderDetail.vue"],
  ["src/views/shop/ossManage.vue", "src/views/sys/oss-manage/ossManage.vue"],
];

function extractImports(content) {
  const imports = [];
  const re = /^import\s+.+from\s+["']@\/api\/[^"']+["'];?\s*$/gm;
  let m;
  while ((m = re.exec(content)) !== null) imports.push(m[0]);
  return imports;
}

function adaptForSeller(content, sellerRel, sellerOriginal) {
  let c = content;

  // Restore seller API imports from original file
  if (sellerOriginal) {
    const sellerImports = extractImports(sellerOriginal);
    const managerImports = extractImports(content);
    for (const mi of managerImports) {
      const apiPath = mi.match(/from\s+["'](@\/api\/[^"']+)["']/);
      if (!apiPath) continue;
      const sellerMatch = sellerImports.find((si) => si.includes(apiPath[1]) || si.includes(path.basename(apiPath[1])));
      if (sellerMatch && sellerMatch !== mi) {
        c = c.replace(mi, sellerMatch);
      }
    }
    // Also restore seller-specific import paths that differ
    sellerImports.forEach((si) => {
      const from = si.match(/from\s+["']([^"']+)["']/);
      if (from && from[1].includes("@/api/")) {
        const apiName = from[1].split("/").pop();
        const managerImport = managerImports.find((mi) => mi.includes(apiName));
        if (!managerImport) {
          // seller-only import - append if missing
          if (!c.includes(si)) {
            const scriptIdx = c.indexOf("<script>");
            if (scriptIdx >= 0) {
              const insertAt = c.indexOf("\n", scriptIdx) + 1;
              c = c.slice(0, insertAt) + si + "\n" + c.slice(insertAt);
            }
          }
        }
      }
    });
  }

  // Seller path adjustments
  c = c.replace(/@\/views\/page-decoration\//g, "@/views/shop/");
  c = c.replace(/@\/components\/affix-time/g, "@/views/lili-components/affix-time");
  c = c.replace(/admin-setting/g, "seller-setting");
  c = c.replace(/adminPCPageCache/g, "sellerPCPageCache");
  c = c.replace(/userInfoManager/g, "userInfoSeller");
  c = c.replace(/JSON\.parse\(Cookies\.get\("userInfoManager"\)\)/g, 'JSON.parse(Cookies.get("userInfoSeller"))');

  // 从平台同步 ossManage 时，转换为商家版：去掉多角色 Tab、改用 sellerUrl 与 STORE 身份
  if (sellerRel.includes("oss-manage/ossManage") || sellerRel.includes("shop/ossManage")) {
    c = c.replace(
      /<el-card v-if="!isComponent" class="tabs-card">[\s\S]*?<\/el-card>\s*/,
      ""
    );
    c = c.replace(/managerApiUrl/g, "sellerUrl");
    c = c.replace(/\/manager\/common\/upload\/file/g, "/store/common/upload/file");
    c = c.replace(/activeRoleTab: "MANAGER"/g, 'activeRoleTab: "STORE"');
    c = c.replace(/userEnums: "MANAGER"/g, 'userEnums: "STORE"');
    c = c.replace(
      /return this\.activeRoleTab === "MANAGER";/g,
      'return this.activeRoleTab === "STORE";'
    );
    c = c.replace(
      /this\.activeRoleTab = "MANAGER";\s*\n\s*this\.searchForm\.userEnums = "MANAGER";/g,
      'this.activeRoleTab = "STORE";\n          this.searchForm.userEnums = "STORE";'
    );
    c = c.replace(
      /ElMessage\.warning\("仅管理员模块支持上传图片"\)/g,
      'ElMessage.warning("当前模块不支持上传")'
    );
    c = c.replace(
      /import \{managerApiUrl\} from "@\/libs\/axios";/,
      'import {sellerUrl} from "@/libs/axios";'
    );
  }

  return c;
}

const copied = [];
const missing = [];
const skipped = [];

for (const [sellerRel, managerRel] of FILE_MAP) {
  const managerPath = path.join(MANAGER, managerRel);
  const sellerPath = path.join(SELLER, sellerRel);

  if (!fs.existsSync(managerPath)) {
    missing.push({ seller: sellerRel, manager: managerRel });
    continue;
  }

  const sellerOriginal = fs.existsSync(sellerPath) ? fs.readFileSync(sellerPath, "utf8") : null;
  let content = fs.readFileSync(managerPath, "utf8");
  content = adaptForSeller(content, sellerRel, sellerOriginal);

  fs.mkdirSync(path.dirname(sellerPath), { recursive: true });
  fs.writeFileSync(sellerPath, content);
  copied.push(sellerRel);
}

console.log(`Copied ${copied.length} files from manager`);
if (missing.length) {
  console.log("Missing manager files:");
  missing.forEach((m) => console.log(`  ${m.seller} <- ${m.manager}`));
}
