#!/usr/bin/env node
const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..", "src");

function walk(dir, files = []) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const f = path.join(dir, e.name);
    if (e.isDirectory()) walk(f, files);
    else if (e.name.endsWith(".vue")) files.push(f);
  }
  return files;
}

let n = 0;
for (const file of walk(ROOT)) {
  let c = fs.readFileSync(file, "utf8");
  const next = c
    .replace(/<el-icon([^>]*?):click=/g, "<el-icon$1@click=")
    .replace(/:class="refresh"/g, 'class="refresh"')
    .replace(/:size="20" @click="show = false" :size="20"/g, ':size="20" @click="show = false"');
  if (next !== c) {
    fs.writeFileSync(file, next);
    n++;
  }
}
console.log(`Fixed el-icon click in ${n} files`);
