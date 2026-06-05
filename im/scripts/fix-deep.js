const fs = require("fs");
const path = require("path");

function walk(dir, files = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, files);
    else if (/\.(vue|less)$/.test(entry.name)) files.push(full);
  }
  return files;
}

const root = path.join(__dirname, "../src");
for (const file of walk(root)) {
  let content = fs.readFileSync(file, "utf8");
  const next = content.replace(/\/deep\/\s*([^\{]+)\{/g, ":deep($1) {");
  if (next !== content) {
    fs.writeFileSync(file, next);
    console.log("fixed:", file);
  }
}
