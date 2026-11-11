import { computed, onMounted, ref } from "vue";
import { getBaseSite } from "@/api/common.js";
import config from "@/config";

// 全局共享站点配置；应用生命周期内仅拉取一次，同页与切页均复用请求与结果。
const settings = ref(null);
let pendingRequest = null;

export function loadSiteSettings() {
  if (settings.value) {
    return Promise.resolve(settings.value);
  }
  if (!pendingRequest) {
    pendingRequest = getBaseSite()
      .then((res) => {
        if (res.success && res.result?.settingValue) {
          settings.value = JSON.parse(res.result.settingValue);
        }
        return settings.value;
      })
      .catch(() => settings.value)
      .finally(() => {
        pendingRequest = null;
      });
  }
  return pendingRequest;
}

export function useSiteSettings() {
  onMounted(loadSiteSettings);
  const siteName = computed(() => settings.value?.siteName || config.title);
  const companyName = computed(() => settings.value ? settings.value.companyName || "" : config.company?.name || "");
  const companyUrl = computed(() => settings.value ? settings.value.companyUrl || "" : config.company?.href || "");
  const website = computed(() => settings.value ? settings.value.website || "" : config.website || "");
  const icp = computed(() => settings.value ? settings.value.icp || "" : config.icpMessage || "");
  const copyrightOwner = computed(() => settings.value?.copyrightOwner?.trim() || siteName.value);
  return { settings, siteName, companyName, companyUrl, website, icp, copyrightOwner };
}
