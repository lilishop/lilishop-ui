<template>
  <div class="foot">
    <div class="information footer-bottom">
      <div class="icp">
        <li v-if="icp" class="footer-bottom">
          <a href="https://beian.miit.gov.cn/" target="_blank">
            {{ icp }}
          </a>
        </li>
      </div>
      <a v-if="companyName" class="company-link" :href="companyUrl || undefined" target="_blank">
        <img class="zhizhao" :src="zhizhaoImg" alt="" />
        {{ companyName }}
      </a>
    </div>

    <div class="copyright">
      <p>Copyright © {{ year }} {{ copyrightOwner }}</p>
    </div>
  </div>
</template>

<script setup>
import { useSiteSettings } from "@/composables/useSiteSettings";
import zhizhaoImg from "@/assets/images/zhizhao.jpg";

const year = new Date().getFullYear();
const { companyName, companyUrl, icp, copyrightOwner } = useSiteSettings();
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
