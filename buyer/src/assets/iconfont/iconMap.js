import back from "./back.png";
import carts from "./carts.png";
import collage from "./collage.png";
import feedback from "./feedback.png";
import notice from "./notice.png";
import notification from "./notification.png";
import shop from "./shop.png";
import story from "./story.png";
import support from "./support.png";
import user from "./user.png";

const iconMap = {
  back,
  carts,
  collage,
  feedback,
  notice,
  notification,
  shop,
  story,
  support,
  user,
};

export function getIconUrl(name) {
  return iconMap[name] || "";
}

export default iconMap;
