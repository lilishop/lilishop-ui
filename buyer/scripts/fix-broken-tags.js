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
  c = c.replace(/<\/Button>/g, "</el-button>");
  c = c.replace(/<\/Button\b/g, "</el-button");
  c = c.replace(/<\/Input>/g, "</el-input>");
  c = c.replace(/<\/Input\b/g, "</el-input");
  c = c.replace(/<\/Option>/g, "</el-option>");
  c = c.replace(/<\/Option\b/g, "</el-option");
  c = c.replace(/<\/Checkbox>/g, "</el-checkbox>");
  c = c.replace(/<\/Checkbox\b/g, "</el-checkbox");
  c = c.replace(/<\/Select>/g, "</el-select>");
  c = c.replace(/<\/Select\b/g, "</el-select");
  c = c.replace(/<\/Form>/g, "</el-form>");
  c = c.replace(/<\/Modal>/g, "</el-dialog>");
  c = c.replace(/@click\.native/g, "@click");
  c = c.replace(/@on-search/g, "@keyup.enter");
  c = c.replace(/\bsearch\b(?=\s+enter-button)/g, "");
  c = c.replace(/\benter-button\b/g, "");
  c = c.replace(/<BreadcrumbItem/g, "<el-breadcrumb-item");
  c = c.replace(/<\/BreadcrumbItem>/g, "</el-breadcrumb-item>");
  c = c.replace(/<Breadcrumb/g, "<el-breadcrumb");
  c = c.replace(/<\/Breadcrumb>/g, "</el-breadcrumb>");
  c = c.replace(/type="error"/g, 'type="danger"');
  c = c.replace(/<i-col/g, "<div");
  c = c.replace(/<\/i-col>/g, "</div>");
  c = c.replace(/\{\{([^}|]+)\s*\|\s*secrecyMobile\s*\}\}/g, "{{ $filters.secrecyMobile($1) }}");
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
console.log(`Fixed tags in ${count} files`);
