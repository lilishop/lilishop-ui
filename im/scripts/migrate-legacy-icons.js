const fs = require("fs");
const path = require("path");

const root = path.join(__dirname, "../src");

const pairs = [
  [/<i class="el-icon-close"/g, '<legacy-el-icon name="el-icon-close"'],
  [/<i class="close-btn el-icon-close"/g, '<legacy-el-icon name="el-icon-close" class="close-btn"'],
  [/<i class="el-icon-loading"/g, '<legacy-el-icon name="el-icon-loading"'],
  [/<i class="el-icon-bottom"/g, '<legacy-el-icon name="el-icon-bottom"'],
  [/<i class="el-icon-chat-dot-round"/g, '<legacy-el-icon name="el-icon-chat-dot-round"'],
  [/<i class="el-icon-search"/g, '<legacy-el-icon name="el-icon-search"'],
  [/<i class="el-icon-top"/g, '<legacy-el-icon name="el-icon-top"'],
  [/<i class="el-icon-arrow-down"/g, '<legacy-el-icon name="el-icon-arrow-down"'],
  [/<i class="el-icon-time"/g, '<legacy-el-icon name="el-icon-time"'],
  [/<i class="el-icon-setting"/g, '<legacy-el-icon name="el-icon-setting"'],
  [/<i class="el-icon-circle-close"/g, '<legacy-el-icon name="el-icon-circle-close"'],
  [/<i class="el-icon-position"/g, '<legacy-el-icon name="el-icon-position"'],
  [/<i class="el-icon-delete"/g, '<legacy-el-icon name="el-icon-delete"'],
  [/<i class="el-icon-picture"/g, '<legacy-el-icon name="el-icon-picture"'],
  [/<i class="el-icon-caret-left"/g, '<legacy-el-icon name="el-icon-caret-left"'],
  [/<i class="el-icon-caret-right"/g, '<legacy-el-icon name="el-icon-caret-right"'],
  [/<i class="el-icon-plus"><\/i>/g, '<legacy-el-icon name="el-icon-plus" />'],
  [/<i class="el-icon-headset"/g, '<legacy-el-icon name="el-icon-headset"'],
  [/<i class="el-icon-picture-outline-round"/g, '<legacy-el-icon name="el-icon-picture-outline-round"'],
  [/<i class="el-icon-folder"/g, '<legacy-el-icon name="el-icon-folder"'],
  [/<i class="el-icon-folder-opened"/g, '<legacy-el-icon name="el-icon-folder-opened"'],
  [/<i class="el-icon-s-data"/g, '<legacy-el-icon name="el-icon-s-data"'],
  [/<i class="el-icon-chat-line-round"/g, '<legacy-el-icon name="el-icon-chat-line-round"'],
  [/<i class="el-icon-video-pause"/g, '<legacy-el-icon name="el-icon-video-pause"'],
  [/<i class="el-icon-video-play"/g, '<legacy-el-icon name="el-icon-video-play"'],
  [/<i class="el-icon-service"/g, '<legacy-el-icon name="el-icon-service"'],
  [/<p class="tools"><i class="el-icon-close"/g, '<p class="tools"><legacy-el-icon name="el-icon-close"'],
  [/<i class="el-icon-close close-btn"/g, '<legacy-el-icon name="el-icon-close" class="close-btn"'],
  [/<i class="el-icon-plus" \/> 加好友/g, '<legacy-el-icon name="el-icon-plus" /> 加好友'],
  [/<i class="el-icon-plus"><\/i> 添加选项/g, '<legacy-el-icon name="el-icon-plus" /> 添加选项'],
  [
    /<i @click="againSendMessage\(item\)" v-if="item.webSocketStatus" class="el-icon-refresh-left again main-color"><\/i>/g,
    '<legacy-el-icon name="el-icon-refresh-left" class="again main-color" @click="againSendMessage(item)" v-if="item.webSocketStatus" />',
  ],
  [
    /<i class="el-icon-success" :class="\{ selected: verifyMultiSelect\(item.id\) \}"\s*@click="triggerMultiSelect\(item.id\)" \/>/g,
    '<legacy-el-icon name="el-icon-success" :class="{ selected: verifyMultiSelect(item.id) }" @click="triggerMultiSelect(item.id)" />',
  ],
  [/icon="el-icon-microphone"/g, ":icon=\"$legacyIcon('el-icon-microphone')\""],
  [/icon="el-icon-video-pause"/g, ":icon=\"$legacyIcon('el-icon-video-pause')\""],
  [/icon="el-icon-video-play"/g, ":icon=\"$legacyIcon('el-icon-video-play')\""],
  [/icon="el-icon-upload"/g, ":icon=\"$legacyIcon('el-icon-upload')\""],
  [/icon="el-icon-refresh"/g, ":icon=\"$legacyIcon('el-icon-refresh')\""],
  [/icon="el-icon-refresh-left"/g, ":icon=\"$legacyIcon('el-icon-refresh-left')\""],
  [/icon="el-icon-refresh-right"/g, ":icon=\"$legacyIcon('el-icon-refresh-right')\""],
  [/prefix-icon="el-icon-search"/g, ":prefix-icon=\"$legacyIcon('el-icon-search')\""],
  [/size="mini"/g, 'size="small"'],
  [/size='mini'/g, "size='small'"],
  [/size="medium"/g, 'size="default"'],
];

function walk(dir, files = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, files);
    else if (full.endsWith(".vue")) files.push(full);
  }
  return files;
}

let changed = 0;
for (const file of walk(root)) {
  let content = fs.readFileSync(file, "utf8");
  let next = content;
  for (const [pattern, replacement] of pairs) {
    next = next.replace(pattern, replacement);
  }
  if (next !== content) {
    fs.writeFileSync(file, next);
    console.log("updated:", path.relative(root, file));
    changed++;
  }
}

console.log("files changed:", changed);
