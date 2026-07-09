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

  c = c.replace(/<p #header>/g, "<template #header><p>");
  c = c.replace(
    /(<template #header><p>[\s\S]*?<\/p>)(\s*<div)/g,
    "$1</template>$2"
  );

  c = c.replace(
    /<template #footer><div([^>]*)>([\s\S]*?)<\/div><\/template><\/el-dialog>/g,
    "<template #footer><div$1>$2</div></template>\n    </el-dialog>"
  );

  c = c.replace(
    /<template #default\s*>([\s\S]*?)<\/template\s*>/g,
    (match, inner) => {
      if (match.includes("el-alert")) {
        return `<template #title>${inner}</template>`;
      }
      return match;
    }
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
console.log(`Fixed dialog slots in ${count} files`);
