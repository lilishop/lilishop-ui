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

  c = c.replace(/<el-pagination\b/g, "<Page");
  c = c.replace(/<\/el-pagination>/g, "</Page>");

  c = c.replace(
    /<Icon([^>]*)\s+#prepend\s*>\s*<\/Icon>/g,
    "<template #prepend><Icon$1></Icon></template>"
  );
  c = c.replace(
    /<Icon([^>]*)\s+#prepend\s*>\s*<\/Icon>/g,
    "<template #prepend><Icon$1></Icon></template>"
  );
  c = c.replace(
    /<template #prepend><Icon([^>]*)\s*\/>/g,
    "<template #prepend><Icon$1></Icon></template>"
  );

  c = c.replace(/@keyup\.enter\.native/g, "@keyup.enter");
  c = c.replace(/slot="append"/g, "#append");
  c = c.replace(/(<div[^>]*)\s+#append/g, "<template #append>$1");

  c = c.replace(/(<el-button[^>]*)\slong/g, '$1 style="width:100%"');
  c = c.replace(/@on-select/g, "@select");
  c = c.replace(/@on-click/g, "@click");

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
console.log(`Runtime compat fixes in ${count} files`);
