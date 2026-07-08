<template>
  <div class="foot">
    <div class="information footer-bottom">
      <div class="icp">
        <li v-if="config.icpCard">
          <a
            :href="
              'https://tsm.miit.gov.cn/dxxzsp/xkz/xkzgl/resource/qiyesearch.jsp?num=' +
              config.icpCard +
              '&type=xuke'
            "
            target="_blank"
          >
            {{ config.icpCard }}
          </a>
        </li>
        <li v-if="config.icpMessage" class="footer-bottom">
          <a href="https://beian.miit.gov.cn/" target="_blank">
            {{ config.icpMessage }}
          </a>
        </li>
      </div>
      <a class="company-link" :href="config.company.href" target="_blank">
        <img class="zhizhao" :src="zhizhaoImg" alt="" />
        {{ config.company.name }}
      </a>
    </div>

    <div class="copyright">
      <p>Copyright © {{ year }} {{ config.title }}</p>
    </div>
  </div>
</template>

<script>
const config = require("@/config/index");

export default {
  data() {
    return {
      config,
      zhizhaoImg: require("@/assets/images/zhizhao.jpg"),
      year: new Date().getFullYear(),
    };
  },
};
</script>

<style lang="scss" scoped>
.foot {
  width: 100%;
  margin-top: 0;
  color: #000;
  font-size: 12px;
}

.information {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-wrap: wrap;
  gap: 8px 30px;
  margin-bottom: 8px;
}

.icp {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  justify-content: center;
  list-style: none;
  margin: 0;
  padding: 0;

  li {
    margin: 0 4px;
    list-style: none;
  }
}

.company-link {
  display: flex;
  align-items: center;
  color: #000;
  text-decoration: none;

  &:hover {
    opacity: 0.85;
  }
}

.zhizhao {
  width: 20px;
  height: 20px;
  margin-right: 4px;
  border-radius: 50%;
}

.copyright {
  text-align: center;

  p {
    margin: 0;
    font-size: 12px;
    line-height: 1.4;
    color: #000;
  }
}

a {
  color: #000;
  text-decoration: none;

  &:hover {
    opacity: 0.85;
  }
}
</style>
