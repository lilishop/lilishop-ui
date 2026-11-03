import { computed, onMounted, ref } from "vue";
import { getBaseSite } from "@/api/common.js";
import config from "@/config";

// 同页的页头、页脚共享请求；每次重新进入页面时刷新，避免旧缓存覆盖后台设置。
const settings = ref(null);
let pendingRequest;

export function loadSiteSettings() {
  if (!pendingRequest) {
    pendingRequest = getBaseSite()
      .then((res) => {
        if (res.success && res.result?.settingValue) {
          settings.value = JSON.parse(res.result.settingValue);
        }
        return settings.value;
      })
      .catch(() => settings.value)
      .finally(() => { pendingRequest = null; });
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
