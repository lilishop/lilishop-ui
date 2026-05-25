import { markRaw } from "vue";
import category from "./category.vue";
import shops from "./shops.vue";
import marketing from "./marketing.vue";
import pages from "./pages.vue";
import goods from "../goods-dialog.vue";
import other from "./other.vue";
import special from "./special.vue";

export default {
  pages: markRaw(pages),
  marketing: markRaw(marketing),
  shops: markRaw(shops),
  category: markRaw(category),
  goods: markRaw(goods),
  other: markRaw(other),
  special: markRaw(special),
};
