#!/usr/bin/env node
/**
 * 将全局 <Page> 封装替换为原生 el-pagination
 */
const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..", "src");

function walkDir(dir, files = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walkDir(full, files);
    else if (entry.name.endsWith(".vue")) files.push(full);
  }
  return files;
}

function transformPage(content) {
  return content.replace(
    /<Page\b([^>]*?)(\/>|>(\s*)<\/Page>)/gs,
    (match, attrs, close) => {
      let a = attrs;
      const hasTotal = /\bshow-total\b/.test(a);
      const hasSizer = /\bshow-sizer\b/.test(a);
      const hasElevator = /\bshow-elevator\b/.test(a);

      a = a.replace(/\s+show-total\b/g, "");
      a = a.replace(/\s+show-sizer\b/g, "");
      a = a.replace(/\s+show-elevator\b/g, "");
      a = a.replace(/:current=/g, ":current-page=");
      a = a.replace(/:page-size-opts=/g, ":page-sizes=");
      a = a.replace(/@change=/g, "@current-change=");
      a = a.replace(/\ssize="small"/g, " small");

      const layoutParts = [];
      if (hasTotal) layoutParts.push("total");
      if (hasSizer) layoutParts.push("sizes");
      layoutParts.push("prev", "pager", "next");
      if (hasElevator) layoutParts.push("jumper");

      const layoutAttr = ` layout="${layoutParts.join(", ")}"`;

      if (close.startsWith("/>")) {
        return `<el-pagination${a}${layoutAttr} />`;
      }
      return `<el-pagination${a}${layoutAttr}></el-pagination>`;
    }
  );
}

let count = 0;
for (const file of walkDir(ROOT)) {
  const original = fs.readFileSync(file, "utf8");
  if (!/<Page\b/.test(original)) continue;
  const fixed = transformPage(original);
  if (fixed !== original) {
    fs.writeFileSync(file, fixed);
    count++;
    console.log(path.relative(ROOT, file));
  }
}
console.log(`Page → el-pagination in ${count} files`);
