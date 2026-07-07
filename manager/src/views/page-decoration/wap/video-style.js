export const DEFAULT_VIDEO_STYLE = {
  bgType: "color",
  bgColorStart: "#F5F5F5",
  bgColorEnd: "#F5F5F5",
  bgGradientDir: "horizontal",
  bgRadius: 0,
  bottomBgColor: "#F5F5F5",
  bgImage: "",
  margin: 0,
  padding: 0,
  borderShow: false,
  borderStyle: "solid",
  borderWidth: 1,
  borderColor: "#e5e5e5",
  shadowShow: false,
  shadowColor: "rgba(0,0,0,0.1)",
  shadowX: 0,
  shadowY: 0,
  shadowBlur: 10,
  shadowSpread: 0,
};

export const ASPECT_RATIO_MAP = {
  "16:9": 56.25,
  "4:3": 75,
  "1:1": 100,
};

export function ensureVideoItem(item) {
  if (!item.aspectRatio) item.aspectRatio = "16:9";
  if (!item.style) {
    item.style = { ...DEFAULT_VIDEO_STYLE };
    return;
  }
  Object.keys(DEFAULT_VIDEO_STYLE).forEach((key) => {
    if (item.style[key] === undefined) {
      item.style[key] = DEFAULT_VIDEO_STYLE[key];
    }
  });
}

export function getVideoGradient(style) {
  const start = style.bgColorStart || "#F5F5F5";
  const end = style.bgColorEnd || start;
  const colors = `${start}, ${end}`;
  const dirMap = {
    horizontal: `linear-gradient(to right, ${colors})`,
    vertical: `linear-gradient(to bottom, ${colors})`,
    skewLeft: `linear-gradient(135deg, ${colors})`,
    skewRight: `linear-gradient(45deg, ${colors})`,
  };
  return dirMap[style.bgGradientDir] || dirMap.horizontal;
}

export function getVideoWrapperStyle(item) {
  ensureVideoItem(item);
  const style = item.style;
  const wrapper = {
    margin: `${style.margin || 0}px`,
    padding: `${style.padding || 0}px`,
    background: style.bottomBgColor || "#F5F5F5",
    boxSizing: "border-box",
  };
  return wrapper;
}

export function getVideoBoxStyle(item) {
  ensureVideoItem(item);
  const style = item.style;
  const box = {
    borderRadius: `${style.bgRadius || 0}px`,
    overflow: "hidden",
    position: "relative",
    width: "100%",
  };

  if (style.bgType === "image" && style.bgImage) {
    box.backgroundImage = `url(${style.bgImage})`;
    box.backgroundSize = "cover";
    box.backgroundPosition = "center";
  } else {
    box.background = getVideoGradient(style);
  }

  if (style.borderShow) {
    box.border = `${style.borderWidth || 1}px ${style.borderStyle || "solid"} ${
      style.borderColor || "#e5e5e5"
    }`;
  }

  if (style.shadowShow) {
    box.boxShadow = `${style.shadowX || 0}px ${style.shadowY || 0}px ${
      style.shadowBlur || 10
    }px ${style.shadowSpread || 0}px ${style.shadowColor || "rgba(0,0,0,0.1)"}`;
  }

  return box;
}

export function getAspectPadding(ratio) {
  return ASPECT_RATIO_MAP[ratio] || ASPECT_RATIO_MAP["16:9"];
}
