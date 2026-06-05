import empty from "./empty/Main.vue";
import drawer from "./drawer/Main.vue";
import Header from "@/components/header/Header.vue";
import FixedTopPage from "@/components/advertising/FixedTop.vue";
import Footer from "@/components/footer/Footer.vue";
import Search from "@/components/Search.vue";
import card from "@/components/card/index.vue";
import cateNav from "@/components/nav/CateNav.vue";

export function registerGlobalComponents(app) {
  app.component("empty", empty);
  app.component("drawer", drawer);
  app.component("BaseHeader", Header);
  app.component("FixedTopPage", FixedTopPage);
  app.component("BaseFooter", Footer);
  app.component("Search", Search);
  app.component("card", card);
  app.component("cateNav", cateNav);
}
