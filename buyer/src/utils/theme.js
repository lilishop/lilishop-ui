/**
 * 平台主题色工具
 */
const DEFAULT_THEME = {
  themeColor: "#ff3c2a",
  lightColor: "#ff6b35",
  aiderLightColor: "#ff9f28",
};

const STORAGE_KEY = "theme_setting";
const EXPIRATION_KEY = "theme_setting_expiration_time";

export function getDefaultTheme() {
  return { ...DEFAULT_THEME };
}

function applyElementColorVars(style, prefix, color) {
  const key = `--el-color-${prefix}`;
  style.setProperty(key, color);
  style.setProperty(`${key}-light-3`, `color-mix(in srgb, ${color} 70%, white)`);
  style.setProperty(`${key}-light-5`, `color-mix(in srgb, ${color} 50%, white)`);
  style.setProperty(`${key}-light-7`, `color-mix(in srgb, ${color} 30%, white)`);
  style.setProperty(`${key}-light-8`, `color-mix(in srgb, ${color} 20%, white)`);
  style.setProperty(`${key}-light-9`, `color-mix(in srgb, ${color} 10%, white)`);
  style.setProperty(`${key}-dark-2`, `color-mix(in srgb, ${color} 80%, black)`);
}

export function applyThemeToDocument(theme) {
  if (typeof document === "undefined") return;
  const primary = theme.themeColor || DEFAULT_THEME.themeColor;
  const light = theme.lightColor || DEFAULT_THEME.lightColor;
  const aider = theme.aiderLightColor || DEFAULT_THEME.aiderLightColor;
  const root = document.documentElement.style;

  root.setProperty("--theme-color", primary);
  root.setProperty("--theme-light", light);
  root.setProperty("--theme-aider", aider);
  root.setProperty("--theme-tint-12", `color-mix(in srgb, ${primary} 12%, white)`);

  applyElementColorVars(root, "primary", primary);
  // 买家端大量按钮使用 type="danger"，统一映射到主题色
  applyElementColorVars(root, "danger", primary);
}

export function cacheTheme(theme) {
  const expirationTime = new Date().setHours(new Date().getHours() + 1);
  localStorage.setItem(EXPIRATION_KEY, String(expirationTime));
  localStorage.setItem(STORAGE_KEY, JSON.stringify(theme));
}

export function loadCachedTheme() {
  const expirationTime = localStorage.getItem(EXPIRATION_KEY);
  const cacheValid =
    expirationTime && new Date() <= new Date(Number(expirationTime));
  if (!cacheValid) return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function normalizeTheme(data = {}) {
  return {
    themeColor: data.themeColor || DEFAULT_THEME.themeColor,
    lightColor: data.lightColor || DEFAULT_THEME.lightColor,
    aiderLightColor: data.aiderLightColor || DEFAULT_THEME.aiderLightColor,
  };
}

export async function fetchAndApplyTheme(requestFn) {
  const cachedTheme = loadCachedTheme();
  if (cachedTheme) {
    applyThemeToDocument(normalizeTheme(cachedTheme));
  }

  try {
    const res = await requestFn();
    if (res?.success && res?.result?.settingValue) {
      const data = JSON.parse(res.result.settingValue);
      const normalized = normalizeTheme(data);
      applyThemeToDocument(normalized);
      cacheTheme(normalized);
      return normalized;
    }
  } catch (error) {
    console.warn(
      "[theme] 主题色加载失败，请确认 buyer-api 已启动且站点主题配置可用",
      error
    );
  }

  return cachedTheme ? normalizeTheme(cachedTheme) : normalizeTheme();
}
