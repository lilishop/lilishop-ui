#!/usr/bin/env node
const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");

function walkDir(dir, files = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walkDir(full, files);
    else if (entry.name.endsWith(".vue")) files.push(full);
  }
  return files;
}

function fix(content) {
  let c = content;
  c = c.replace(/<\/span\s*\n\s*>/g, "</span>");
  c = c.replace(/<\/span\s+>/g, "</span>");
  c = c.replace(/<i-input/g, "<el-input");
  c = c.replace(/<\/i-input>/g, "</el-input>");
  c = c.replace(
    /<Icon([^>]*)\s+#prepend\s*\/>/g,
    "<template #prepend><Icon$1 /></template>"
  );
  c = c.replace(
    /<template #append><el-button([^>]*)>([\s\S]*?)<\/el-button>\s*<\/i-input>/g,
    "<template #append><el-button$1>$2</el-button></template></el-input>"
  );
  c = c.replace(
    /<template #append><el-button([^>]*)>([\s\S]*?)<\/el-button>\s*<\/el-input>/g,
    "<template #append><el-button$1>$2</el-button></template></el-input>"
  );
  return c;
}

let count = 0;
for (const file of walkDir(path.join(ROOT, "src"))) {
  const original = fs.readFileSync(file, "utf8");
  const fixed = fix(original);
  if (fixed !== original) {
    fs.writeFileSync(file, fixed);
    count++;
  }
}
console.log(`Fixed span/input tags in ${count} files`);
