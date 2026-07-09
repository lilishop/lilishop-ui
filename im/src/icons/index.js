import SvgIcon from "@/components/svg-icon";

export function registerIcons(app) {
  app.component("svg-icon", SvgIcon);

  const req = require.context("./svg", false, /\.svg$/);
  const requireAll = (requireContext) =>
    requireContext.keys().map(requireContext);
  requireAll(req);
}
