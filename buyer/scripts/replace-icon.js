#!/usr/bin/env node
/**
 * 将静态 <Icon type="..." /> 替换为 <el-icon><Xxx /></el-icon>
 * 动态 :type / custom 属性保留，由人工或 resolveIcon 处理。
 */
const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..", "src");

const TYPE_TO_COMPONENT = {
  "md-checkmark": "Check",
  "md-close": "Close",
  "md-trash": "Delete",
  "md-add": "Plus",
  "md-arrow-dropdown": "ArrowDown",
  "md-arrow-dropup": "ArrowUp",
  "md-person": "User",
  "md-lock": "Lock",
  "md-phone-portrait": "Iphone",
  "md-key": "Key",
  "md-link": "Link",
  "md-refresh": "Refresh",
  "md-qr-scanner": "Iphone",
  "ios-arrow-down": "ArrowDown",
  "ios-arrow-up": "ArrowUp",
  "ios-arrow-forward": "ArrowRight",
  "ios-arrow-back": "ArrowLeft",
  "ios-arrow-round-down": "ArrowDown",
  "ios-arrow-round-forward": "ArrowRight",
  "ios-cart-outline": "ShoppingCart",
  "ios-camera": "Camera",
  "ios-eye-outline": "View",
  "ios-trash-outline": "Delete",
  "ios-alert-outline": "Warning",
  "ios-help-circle-outline": "Help",
  "ios-add-circle-outline": "Plus",
  "ios-information-circle": "InfoFilled",
  "ios-search": "Search",
  "ios-text-outline": "Document",
  "ios-alarm-outline": "AlarmClock",
  "ios-heart": "StarFilled",
  "md-close-circle": "CircleClose",
  edit: "Edit",
  "trash-a": "Delete",
  location: "Location",
};

function walkDir(dir, files = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory() && entry.name !== "compat") walkDir(full, files);
    else if (entry.name.endsWith(".vue")) files.push(full);
  }
  return files;
}

function parseAttrs(attrStr) {
  const attrs = {};
  const re = /(?::([\w-]+)|@([\w-]+)|([\w-]+))=(?:"([^"]*)"|'([^']*)')|(?::([\w-]+)|@([\w-]+)|([\w-]+))(?=\s|\/|>)/g;
  let m;
  while ((m = re.exec(attrStr)) !== null) {
    const name = m[1] || m[2] || m[3] || m[6] || m[7] || m[8];
    const value = m[4] ?? m[5] ?? true;
    attrs[name] = value;
  }
  return attrs;
}

function attrsToString(attrs, exclude = []) {
  return Object.entries(attrs)
    .filter(([k]) => !exclude.includes(k))
    .map(([k, v]) => {
      if (v === true) return k;
      if (k.startsWith("@")) return `${k}="${v}"`;
      return `:${k}="${v}"`;
    })
    .join(" ");
}

function transform(content, filePath) {
  if (filePath.includes("/compat/")) return content;
  let c = content;
  const used = new Set();

  c = c.replace(/<Icon\b([^>]*?)\/>/g, (match, attrStr) => {
    if (/\bcustom=/.test(attrStr) || /:type=/.test(attrStr)) return match;
    const attrs = parseAttrs(attrStr);
    const type = attrs.type;
    if (!type || !TYPE_TO_COMPONENT[type]) return match;
    const comp = TYPE_TO_COMPONENT[type];
    used.add(comp);
    const rest = attrsToString(attrs, ["type"]);
    const size = attrs.size ? ` :size="${attrs.size}"` : "";
    const open = rest ? `<el-icon ${rest}${size}>` : `<el-icon${size}>`;
    return `${open}<${comp} /></el-icon>`;
  });

  c = c.replace(/<Icon\b([^>]*?)><\/Icon>/g, (match, attrStr) => {
    if (/\bcustom=/.test(attrStr) || /:type=/.test(attrStr)) return match;
    const attrs = parseAttrs(attrStr);
    const type = attrs.type;
    if (!type || !TYPE_TO_COMPONENT[type]) return match;
    const comp = TYPE_TO_COMPONENT[type];
    used.add(comp);
    const rest = attrsToString(attrs, ["type"]);
    const size = attrs.size ? ` :size="${attrs.size}"` : "";
    const open = rest ? `<el-icon ${rest}${size}>` : `<el-icon${size}>`;
    return `${open}<${comp} /></el-icon>`;
  });

  if (used.size && !c.includes("@element-plus/icons-vue")) {
    const imports = [...used].sort().join(", ");
    c = c.replace(
      /(<script[^>]*>\s*\n)/,
      `$1import { ${imports} } from '@element-plus/icons-vue';\n`
    );
    c = c.replace(/export default \{/, (m) => {
      if (/components:\s*\{/.test(c)) {
        return m;
      }
      return `${m}\n  components: { ${imports} },`;
    });
    if (/components:\s*\{/.test(c) && !c.includes(`${[...used][0]},`)) {
      c = c.replace(/components:\s*\{([^}]*)\}/, (m, inner) => {
        const existing = inner.trim();
        const add = [...used].filter((n) => !inner.includes(n)).join(", ");
        if (!add) return m;
        const merged = existing ? `${existing}, ${add}` : add;
        return `components: { ${merged} }`;
      });
    }
  }

  return c;
}

let count = 0;
for (const file of walkDir(ROOT)) {
  const original = fs.readFileSync(file, "utf8");
  if (!/<Icon\b/.test(original)) continue;
  const fixed = transform(original, file);
  if (fixed !== original) {
    fs.writeFileSync(file, fixed);
    count++;
    console.log(path.relative(ROOT, file));
  }
}
console.log(`Icon replacements in ${count} files`);
