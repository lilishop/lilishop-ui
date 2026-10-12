<template>
  <div>
    <div class="vote-message">
      <div class="vote-from">
        <div class="vheader">
          <p>
            {{ answer_mode == 1 ? "[多选投票]" : "[单选投票]" }}
            <legacy-el-icon
              v-show="is_vote"
              class="pointer"
              :name="refresh ? 'el-icon-loading' : 'el-icon-refresh'"
              title="刷新投票结果"
              @click="loadRefresh"
            />
          </p>
          <p>{{ title }}</p>
        </div>

        <template v-if="is_vote">
          <div class="vbody">
            <div class="vote-view" v-for="(option, index) in options">
              <p class="vote-option">{{ option.value }}. {{ option.text }}</p>
              <p class="vote-census">
                {{ option.num }} 票 {{ option.progress }}%
              </p>
              <p class="vote-progress">
                <el-progress
                  :show-text="false"
                  :percentage="parseInt(option.progress)"
                />
              </p>
            </div>
          </div>
          <div class="vfooter vote-view">
            <p>应参与人数：{{ answer_num }} 人</p>
            <p>实际参与人数：{{ answered_num }} 人</p>
          </div>
        </template>
        <template v-else>
          <div class="vbody">
            <p class="option" v-for="(option, index) in options">
              <el-checkbox
                v-model="option.is_checked"
                @change="toSelect2(option)"
              />
              <span @click="toSelect(option, index)" style="margin-left: 10px">
                {{ option.value }} 、{{ option.text }}
              </span>
            </p>
          </div>
          <div class="vfooter">
            <el-button plain round @click="toVote">
              {{ isUserVote ? "立即投票" : "请选择进行投票" }}
            </el-button>
          </div>
        </template>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from "vue";
import { ServeConfirmVoteHandle } from "@/api/chat";
import { useUserStore } from "@/stores/user";

defineOptions({ name: "VoteMessage" });

const props = defineProps({
  vote: {
    type: Object,
    required: true,
  },
  record_id: {
    type: Number,
    required: true,
  },
});

const userStore = useUserStore();

const answer_mode = ref(0);
const title = ref("啊谁叫你打开你卡沙发那,那就是看、卡收纳是你");
const radio_value = ref("");
const options = ref([]);
const is_vote = ref(false);
const answer_num = ref(0);
const answered_num = ref(0);
const refresh = ref(false);

const isUserVote = computed(() => {
  return options.value.some((iten) => {
    return iten.is_checked;
  });
});

function loadRefresh() {
  refresh.value = true;

  setTimeout(() => {
    refresh.value = false;
  }, 500);
}

function updateStatistics(data) {
  let count = data.count;
  options.value.forEach((option) => {
    option.num = data.options[option.value];

    if (count > 0) {
      option.progress = (data.options[option.value] / count) * 100;
    }
  });
}

function toSelect(option, index) {
  if (answer_mode.value == 0) {
    options.value.forEach((option) => {
      option.is_checked = false;
    });
  }

  options.value[index].is_checked = !option.is_checked;
}

function toSelect2(option) {
  if (answer_mode.value == 0) {
    options.value.forEach((item) => {
      if (option.value == item.value) {
        item.is_checked = option.is_checked;
      } else {
        item.is_checked = false;
      }
    });
  }
}

function toVote() {
  if (isUserVote.value == false) {
    return false;
  }

  let items = [];
  options.value.forEach((item) => {
    if (item.is_checked) {
      items.push(item.value);
    }
  });

  ServeConfirmVoteHandle({
    record_id: props.record_id,
    options: items.join(","),
  }).then((res) => {
    if (res.code == 200) {
      is_vote.value = true;
      updateStatistics(res.data);
    }
  });
}

// 原 created() 生命周期逻辑
let user_id = userStore.id;
let { detail, statistics, vote_users } = props.vote;

answer_mode.value = detail.answer_mode;
answer_num.value = detail.answer_num;
answered_num.value = detail.answered_num;

detail.answer_option.forEach((item) => {
  options.value.push({
    value: item.key,
    text: item.value,
    is_checked: false,
    num: 0,
    progress: "00.0",
  });
});

is_vote.value = vote_users.some((value) => {
  return value == user_id;
});

updateStatistics(statistics);
</script>
<style lang="less" scoped>
.vote-message {
  width: 300px;
  min-height: 150px;
  border: 1px solid #eceff1;
  box-sizing: border-box;
  border-radius: 5px;
  overflow: hidden;

  .vote-from {
    width: 100%;

    .vheader {
      min-height: 50px;
      background: #4e83fd;
      padding: 8px;
      position: relative;
      p {
        margin: 3px 0;
        &:first-child {
          color: rgb(245, 237, 237);
          font-size: 13px;
          margin-bottom: 8px;
        }

        &:last-child {
          color: white;
        }
      }

      &::before {
        content: "投票";
        position: absolute;
        font-size: 60px;
        color: white;
        opacity: 0.1;
        top: -5px;
        right: 10px;
      }
    }

    .vbody {
      min-height: 80px;
      width: 100%;
      padding: 5px 15px;
      box-sizing: border-box;
      .option {
        margin: 14px 0px;
        font-size: 13px;
        span {
          cursor: pointer;
          user-select: none;
          line-height: 22px;
        }

        .el-radio {
          margin-right: 0;
          .el-radio__label {
            padding-left: 5px;
          }
        }
      }
      margin-bottom: 10px;
    }

    .vfooter {
      height: 55px;
      text-align: center;
      box-sizing: border-box;

      .el-button {
        width: 80%;
        font-weight: 400;
      }

      &.vote-view {
        display: flex;
        flex-direction: column;
        justify-content: flex-start;
        align-items: flex-start;
        padding-left: 15px;

        p {
          border-left: 2px solid #2196f3;
          padding-left: 5px;
        }
      }
    }
  }

  .vote-view {
    width: 100%;
    min-height: 30px;
    margin: 15px 0;
    box-sizing: border-box;

    > p {
      margin: 6px 0px;
      font-size: 13px;
    }

    .vote-option {
      min-height: 20px;
      line-height: 20px;
    }

    .vote-census {
      height: 20px;
      line-height: 20px;
    }
  }
}
</style>
