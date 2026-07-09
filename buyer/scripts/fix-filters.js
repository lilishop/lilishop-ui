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

function fixFilters(content) {
  let c = content;

  // Fix broken: {{ expr {{ $filters.unitPrice(args) }}
  c = c.replace(
    /\{\{\s*([^}{]+?)\s*\{\{\s*\$filters\.unitPrice\(([^)]*)\)\s*\}\}/g,
    "{{ $filters.unitPrice($1, $2) }}"
  );

  // Fix: {{ expr | unitPrice }} or {{ expr | unitPrice('￥') }}
  c = c.replace(
    /\{\{\s*([^}|]+?)\s*\|\s*unitPrice(?:\(([^)]*)\))?\s*\}\}/g,
    (_, expr, args) => {
      const e = expr.trim();
      return args !== undefined
        ? `{{ $filters.unitPrice(${e}, ${args}) }}`
        : `{{ $filters.unitPrice(${e}) }}`;
    }
  );

  // Fix inline without braces: expr | unitPrice("￥")
  c = c.replace(
    /(?<!\{\{)\s*([a-zA-Z0-9_.?()[\]'"\s]+?)\s*\|\s*unitPrice\(([^)]*)\)/g,
    (match, expr, args) => {
      if (match.includes("{{")) return match;
      return `{{ $filters.unitPrice(${expr.trim()}, ${args}) }}`;
    }
  );

  // Fix inline without args: expr | unitPrice
  c = c.replace(
    /(?<!\{\{)\s*([a-zA-Z0-9_.?()[\]'"\s]+?)\s*\|\s*unitPrice(?!\()/g,
    (match, expr) => {
      if (match.includes("{{") || match.includes("$filters")) return match;
      return `{{ $filters.unitPrice(${expr.trim()}) }}`;
    }
  );

  // Fix unixToDate filter
  c = c.replace(
    /\{\{\s*([^}|]+?)\s*\|\s*unixToDate(?:\(([^)]*)\))?\s*\}\}/g,
    (_, expr, args) => {
      const e = expr.trim();
      return args !== undefined
        ? `{{ $filters.unixToDate(${e}, ${args}) }}`
        : `{{ $filters.unixToDate(${e}) }}`;
    }
  );

  return c;
}

let count = 0;
for (const file of walkDir(path.join(ROOT, "src"))) {
  const original = fs.readFileSync(file, "utf8");
  const fixed = fixFilters(original);
  if (fixed !== original) {
    fs.writeFileSync(file, fixed);
    count++;
  }
}
console.log(`Fixed filters in ${count} files`);
