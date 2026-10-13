<template>
  <div>
    <el-container class="container">
      <el-main class="no-padding main lum-scrollbar">
        <input
          type="file"
          ref="fileCustomEmoji"
          accept="image/*"
          style="display: none"
          @change="customUploadEmoji"
        />

        <div v-show="showEmoticonId == -1" class="emoticon">
          <div class="title">QQ表情</div>
          <div
            v-for="(elImg, text) in emoji.emojis"
            v-html="elImg"
            :key="text"
            class="emoticon-item"
            @click="clickEmoticon(text)"
          ></div>
          <div class="clear"></div>
          <div class="title">符号表情</div>
          <div
            v-for="(item, i) in emoji.symbol"
            :key="i"
            class="emoticon-item symbol"
            @click="clickEmoticon(item)"
          >
            {{ item }}
          </div>
          <div class="clear"></div>
        </div>

        <div
          v-for="item in emojiItem.slice(1)"
          v-show="item.emoticon_id == showEmoticonId"
          :key="item.emoticon_id"
          class="emoji-box"
        >
          <div
            v-if="item.emoticon_id == 0"
            class="emoji-item custom-emoji"
            @click="fileCustomEmoji.click()"
          >
            <legacy-el-icon name="el-icon-picture" />
            <span>自定义</span>
          </div>
          <div
            v-for="subitem in item.list"
            :key="subitem.src"
            class="emoji-item"
            @click="clickImageEmoticon(subitem)"
          >
            <el-image :src="subitem.src" fit="cover" />
          </div>
          <div class="clear"></div>
        </div>
      </el-main>
      <!-- <el-footer height="40px" class="no-padding footer">
        <div class="toolbar-items">
          <div
            v-show="emojiItem.length > 13"
            class="toolbar-item prev-page"
            @click="turnPage(1)"
          >
            <legacy-el-icon name="el-icon-caret-left" />
          </div>
          <div
            v-for="(item, index) in showItems"
            :key="index"
            class="toolbar-item"
            @click="triggerItem(item)"
          >
            <img :src="item.url" />
            <p class="title">{{ item.name }}</p>
          </div>
          <div
            v-show="emojiItem.length > 13 && showItems.length == 13"
            class="toolbar-item next-page"
            @click="turnPage(2)"
          >
            <legacy-el-icon name="el-icon-caret-right" />
          </div>
        </div>
      </el-footer> -->
    </el-container>

    <MeEditorSystemEmoticon
      v-if="systemEmojiBox"
      @close="systemEmojiBox = false"
    />
  </div>
</template>

<script setup>
import { computed, ref } from "vue";
import MeEditorSystemEmoticon from "@/components/editor/MeEditorSystemEmoticon";
import { emojiList as emoji } from "@/utils/emojis";
import { useEmoticonStore } from "@/stores/emoticon";

defineOptions({ name: "MeEditorEmoticon" });

const emit = defineEmits(["selected"]);

const emoticonStore = useEmoticonStore();

const fileCustomEmoji = ref(null);

// 系统表情包套弹出窗
const systemEmojiBox = ref(false);

const showEmoticonId = ref(-1);
const showTitle = ref("QQ表情/符号表情");

const page = ref(1);
const pageSize = ref(13);

const emojiItem = computed(() => emoticonStore.items);

const showItems = computed(() => {
  let start = (page.value - 1) * pageSize.value;
  let end = start + pageSize.value;
  return emojiItem.value.slice(start, end);
});

const pageTotal = computed(() => {
  return emojiItem.value.length / pageSize.value;
});

// 原 created 钩子
emoticonStore.LOAD_USER_EMOTICON();

// 表情包导航翻页
function turnPage(type) {
  if (type == 1) {
    if (page.value == 1) return false;
    page.value--;
  } else {
    if (page.value >= pageTotal.value) return false;
    page.value++;
  }
}

// 点击表情包导航
function triggerItem(item) {
  showEmoticonId.value = item.emoticon_id;
  showTitle.value = item.name;
}

// 选中表情
function clickEmoticon(emoji) {
  callback({
    type: 1,
    value: emoji,
  });
}

// 发送图片表情包
function clickImageEmoticon(item) {
  callback({
    type: 2,
    value: item.media_id,
  });
}

function callback(data) {
  emit("selected", data);
}

// 自定义上传表情
function customUploadEmoji(e) {
  if (e.target.files.length == 0) {
    return false;
  }

  emoticonStore.UPLOAD_USER_EMOTICON({
    file: e.target.files[0],
  });
}
</script>
<style lang="less" scoped>
.container {
  height: 300px;
  max-width: 500px;
  background-color: white;

  .header {
    line-height: 30px;
    font-size: 13px;
    font-weight: 400;
    padding-left: 5px;
    user-select: none;
    position: relative;
    border-bottom: 1px solid #fbf5f5;

    .addbtn {
      position: absolute;
      right: 10px;
      top: 1px;
      color: #409eff;
      cursor: pointer;
    }
  }

  .footer {
    background-color: #eff1f7;

    .toolbar-items {
      width: 100%;
      height: 40px;
      line-height: 40px;
      display: flex;
      flex-direction: row;
      align-items: center;

      .toolbar-item {
        height: 30px;
        width: 30px;
        margin: 0 2px;
        background-color: #fff;
        display: inline-block;
        cursor: pointer;
        display: flex;
        justify-content: center;
        align-items: center;
        position: relative;

        img {
          width: 20px;
          height: 20px;
        }

        .title {
          display: none;
          position: absolute;
          top: -25px;
          left: 0px;
          height: 20px;
          line-height: 20px;
          background: #353434;
          color: white;
          min-width: 30px;
          font-size: 10px;
          padding-left: 5px;
          padding-right: 5px;
          border-radius: 2px;
          white-space: pre;
          text-align: center;
        }

        &:hover .title {
          display: block;
        }
      }
    }
  }
}

.container .footer .toolbar-items .prev-page:active i,
.container .footer .toolbar-items .next-page:active i {
  transform: scale(1.2);
}

.emoji-box,
.emoticon {
  width: 100%;
}

.emoticon {
  .title {
    width: 50%;
    height: 25px;
    line-height: 25px;
    color: #ccc;
    font-weight: 400;
    padding-left: 3px;
    font-size: 12px;
  }

  .emoticon-item {
    width: 30px;
    height: 30px;
    margin: 2px;
    float: left;
    cursor: pointer;
    display: flex;
    justify-content: center;
    align-items: center;

    &:hover {
      transform: scale(1.3);
    }
  }

  .symbol {
    font-size: 22px;
  }
}

.emoji-box {
  .emoji-item {
    width: 67px;
    height: 67px;
    margin: 2px;
    background-color: #eff1f7;
    float: left;
    cursor: pointer;
    transition: ease-in 0.3s;
  }

  .custom-emoji {
    display: flex;
    justify-content: center;
    align-items: center;
    flex-direction: column;
    font-size: 10px;

    i {
      font-size: 30px;
      margin-bottom: 3px;
    }

    &:active {
      color: #409eff;
    }
  }
}

:deep(.el-image ) {
  width: 100%;
  height: 100%;
  transition: ease-in 0.3s;
}

.emoji-box .emoji-item:hover .el-image,
.emoji-box .emoji-item:hover {
  border-radius: 10px;
}
</style>
