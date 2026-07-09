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
    /(<div[^>]*)\s+#content>/g,
    "<template #content><div$1>"
  );
  c = c.replace(
    /(<\/el-tooltip>)/g,
    (match, _m, offset, str) => {
      return match;
    }
  );

  c = c.replace(
    /(<div style="white-space:[^"]*"[^>]*>[\s\S]*?<\/div>)(\s*<\/el-tooltip>)/g,
    "$1</template>$2"
  );

  c = c.replace(/<\/div><\/template><\/el-dialog>/g, (m, offset, str) => {
    const before = str.slice(Math.max(0, offset - 200), offset);
    if (before.includes("#footer")) return m;
    return "</div></el-dialog>";
  });

  c = c.replace(/<i(\s[^>]*)\/>/g, "<i$1></i>");

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
console.log(`Fixed stray templates in ${count} files`);
