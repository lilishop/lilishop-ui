import { markRaw } from "vue";
import category from "./category.vue";
import pages from "./pages.vue";
import goods from "../goods-dialog.vue";
import other from "./other.vue";
import shops from "./shops.vue";

export default {
  category: markRaw(category),
  goods: markRaw(goods),
  other: markRaw(other),
  pages: markRaw(pages),
  shops: markRaw(shops),
};
