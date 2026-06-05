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
  const next = c.replace(/:size="(\d+)"\s+:size="\1"/g, ':size="$1"');
  if (next !== c) {
    fs.writeFileSync(file, next);
    n++;
    console.log(path.relative(ROOT, file));
  }
}
console.log(`Fixed duplicate :size in ${n} files`);
