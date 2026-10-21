// 图片魔方各布局预览共用的样式字段（面板配置；老数据无字段时返回空对象，保持原样）
// 画布 375px ≈ 750rpx，预览按数值一半像素呈现
const px = (v) => `${(Number(v) || 0) / 2}px`;

export function cubeWrapperStyle(res) {
  if (!res || res.paddingTop === undefined) return {};
  const bg =
    !res.bgColor2 || res.bgColor1 === res.bgColor2
      ? res.bgColor1
      : `linear-gradient(180deg, ${res.bgColor1}, ${res.bgColor2})`;
  return {
    padding: `${px(res.paddingTop)} ${px(res.paddingX)} ${px(res.paddingBottom)}`,
    background: bg,
    borderRadius: px(res.borderRadius),
    marginBottom: px(res.pageGap),
    overflow: Number(res.borderRadius) > 0 ? "hidden" : "visible",
  };
}

export function cubeImgStyle(res) {
  if (!res || res.imgRadius === undefined) return {};
  return { borderRadius: px(res.imgRadius), overflow: "hidden" };
}

export function cubeGapStyle(res) {
  if (!res || res.contentGap === undefined) return {};
  return { gap: px(res.contentGap) };
}
