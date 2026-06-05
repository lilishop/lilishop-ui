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

  c = c.replace(
    /<template #default="(\{[^"]+\})" #([a-zA-Z0-9_-]+)>/g,
    '<template #$2="$1">'
  );

  c = c.replace(
    /<div([^>]*) #footer([^>]*)>/g,
    '<template #footer><div$1$2>'
  );
  c = c.replace(/<\/div>\s*(?=<\/el-dialog>)/g, "</div></template>");

  c = c.replace(/<span #append>/g, "<template #append><span>");
  c = c.replace(/<\/span><\/el-input/g, "</span></template></el-input");
  c = c.replace(/><span #append>/g, "><template #append><span>");

  c = c.replace(/<el-button #append/g, "<template #append><el-button");
  c = c.replace(
    /<\/el-button>(\s*<\/el-input>)/g,
    "</el-button></template>$1"
  );

  c = c.replace(/<template #desc\b/g, "<template #default");

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
console.log(`Fixed slots in ${count} files`);
