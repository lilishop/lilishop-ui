import { createRouter, createWebHistory } from "vue-router";
import NProgress from "nprogress";
import "nprogress/nprogress.css";
import Index from "@/pages/Index";
import config from "@/config";

const Login = () => import("@/pages/Login");
const SignUp = () => import("@/pages/SignUp");
const ForgetPassword = () => import("@/pages/ForgetPassword");
const GoodsList = () => import("@/pages/GoodsList");
const GoodsDetail = () => import("@/pages/GoodsDetail");
const PointGoodsDetail = () => import("@/pages/promotion/PointGoodsDetail");
const ShoppingCart = () => import("@/pages/ShoppingCart");
const Cart = () => import("@/pages/Cart");
const Pay = () => import("@/pages/payment/Pay");
const PayDone = () => import("@/pages/payment/PayDone");
const PayMent = () => import("@/pages/payment/PayMent");
const ThirdPay = () => import("@/pages/payment/ThirdPay");
const Coupon = () => import("@/pages/CouponCenter");
const seckill = () => import("@/pages/promotion/seckill");
const article = () => import("@/pages/article/index");
const articleDetail = () => import("@/pages/article/detail");
const PointMall = () => import("@/pages/promotion/PointMall");

const MyOrder = () => import("@/pages/home/orderCenter/MyOrder");
const OrderDetail = () => import("@/pages/home/orderCenter/OrderDetail");
const MyAddress = () => import("@/pages/home/orderCenter/MyAddress");
const AddAddress = () => import("@/pages/home/orderCenter/AddAddress");
const Complain = () => import("@/pages/home/orderCenter/Complain");
const AfterSale = () => import("@/pages/home/orderCenter/AfterSale");
const AfterSaleDetail = () => import("@/pages/home/orderCenter/AfterSaleDetail");
const ApplyAfterSale = () => import("@/pages/home/orderCenter/ApplyAfterSale");

const Profile = () => import("@/pages/home/memberCenter/Profile");
const AccountSafe = () => import("@/pages/home/memberCenter/AccountSafe");
const ModifyPwd = () => import("@/pages/home/memberCenter/ModifyPwd");
const Favorites = () => import("@/pages/home/memberCenter/Favorites");
const Distribution = () => import("@/pages/home/memberCenter/Distribution");
const CommentList = () => import("@/pages/home/memberCenter/CommentList");
const AddEval = () => import("@/pages/home/memberCenter/evaluation/AddEval");
const EvalDetail = () => import("@/pages/home/memberCenter/evaluation/EvalDetail");
const ComplainList = () => import("@/pages/home/memberCenter/ComplainList");
const ComplainDetail = () => import("@/pages/home/memberCenter/ComplainDetail");
const Point = () => import("@/pages/home/memberCenter/Point");
const MemberGrade = () => import("@/pages/home/memberCenter/MemberGrade");
const MsgList = () => import("@/pages/home/memberCenter/memberMsg/MsgList");
const MsgDetail = () => import("@/pages/home/memberCenter/memberMsg/MsgDetail");

const Coupons = () => import("@/pages/home/userCenter/Coupons");
const MyTracks = () => import("@/pages/home/userCenter/MyTracks");
const MoneyManagement = () => import("@/pages/home/userCenter/MoneyManagement");
const MyGiftCards = () => import("@/pages/home/userCenter/MyGiftCards");

const Home = () => import("@/pages/user/Home");
const Merchant = () => import("@/pages/Merchant");
const topic = () => import("@/pages/Topic");
const ShopEntry = () => import("@/pages/shopEntry/ShopEntry");

const { title } = config;

NProgress.configure({ showSpinner: false });

export const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: "/",
      name: "Index",
      component: Index,
    },
    {
      path: "/topic",
      name: "topic",
      component: topic,
    },
    {
      path: "/login",
      name: "login",
      component: Login,
      meta: { title: "登录" },
    },
    {
      path: "/SignUp",
      name: "SignUp",
      component: SignUp,
      meta: { title: "注册" },
    },
    {
      path: "/forgetPassword",
      name: "forgetPassword",
      component: ForgetPassword,
      meta: { title: "忘记密码" },
    },
    {
      path: "/goodsList",
      name: "GoodsList",
      component: GoodsList,
    },
    {
      path: "/goodsDetail",
      name: "GoodsDetail",
      component: GoodsDetail,
      meta: { title: "商品详情" },
    },
    {
      path: "/pointGoodsDetail",
      name: "PointGoodsDetail",
      component: PointGoodsDetail,
      meta: { title: "积分商品" },
    },
    {
      path: "/shoppingCart",
      name: "ShoppingCart",
      component: ShoppingCart,
    },
    {
      path: "/cart",
      name: "Cart",
      component: Cart,
      meta: { title: "购物车" },
    },
    {
      path: "/pay",
      name: "Pay",
      component: Pay,
      meta: { title: "订单结算" },
    },
    {
      path: "/payMent",
      name: "PayMent",
      component: PayMent,
    },
    {
      path: "/PointMall",
      name: "PointMall",
      component: PointMall,
      meta: { title: "积分商城" },
    },
    {
      path: "/qrpay",
      name: "qrpay",
      component: ThirdPay,
    },
    {
      path: "/payDone",
      name: "PayDone",
      component: PayDone,
    },
    {
      path: "/article",
      name: "article",
      component: article,
      meta: { title: "帮助中心" },
    },
    {
      path: "/article/detail",
      name: "articleDetail",
      component: articleDetail,
      meta: { title: "帮助中心" },
    },
    {
      path: "/shopEntry",
      name: "shopEntry",
      component: ShopEntry,
      meta: { title: "店铺入驻" },
    },
    {
      path: "/coupon",
      name: "coupon",
      component: Coupon,
      meta: { title: "领券中心" },
    },
    {
      path: "/seckill",
      name: "seckill",
      component: seckill,
      meta: { title: "限时秒杀" },
    },
    {
      path: "/home",
      component: Home,
      redirect: { name: "MyOrder" },
      children: [
        {
          path: "MyTracks",
          name: "MyTracks",
          component: MyTracks,
          meta: { title: "我的足迹" },
        },
        {
          path: "MoneyManagement",
          name: "MoneyManagement",
          component: MoneyManagement,
          meta: { title: "我的余额" },
        },
        {
          path: "MyGiftCards",
          name: "MyGiftCards",
          component: MyGiftCards,
          meta: { title: "我的礼品卡" },
        },
        {
          path: "Complain",
          name: "Complain",
          component: Complain,
        },
        {
          path: "Coupons",
          name: "Coupons",
          component: Coupons,
          meta: { title: "我的优惠券" },
        },
        {
          path: "CommentList",
          name: "CommentList",
          component: CommentList,
          mate: { title: "评价列表" },
        },
        {
          path: "AddEval",
          name: "AddEval",
          component: AddEval,
          mate: { title: "添加评价" },
        },
        {
          path: "EvalDetail",
          name: "EvalDetail",
          component: EvalDetail,
          mate: { title: "评价详情" },
        },
        {
          path: "ComplainList",
          name: "ComplainList",
          component: ComplainList,
        },
        {
          path: "ComplainDetail",
          name: "ComplainDetail",
          component: ComplainDetail,
        },
        {
          path: "AccountSafe",
          name: "AccountSafe",
          component: AccountSafe,
        },
        {
          path: "ModifyPwd",
          name: "ModifyPwd",
          component: ModifyPwd,
        },
        {
          path: "Favorites",
          name: "Favorites",
          component: Favorites,
          meta: { title: "我的收藏" },
        },
        {
          path: "Distribution",
          name: "Distribution",
          component: Distribution,
          meta: { title: "分销推荐" },
        },
        {
          path: "Point",
          name: "Point",
          component: Point,
          meta: { title: "我的积分" },
        },
        {
          path: "MemberGrade",
          name: "MemberGrade",
          component: MemberGrade,
          meta: { title: "我的等级" },
        },
        {
          path: "Profile",
          name: "Profile",
          component: Profile,
        },
        {
          path: "AfterSale",
          name: "AfterSale",
          component: AfterSale,
          meta: { title: "售后" },
        },
        {
          path: "ApplyAfterSale",
          name: "ApplyAfterSale",
          component: ApplyAfterSale,
          meta: { title: "申请售后" },
        },
        {
          path: "/home/MyAddress",
          name: "MyAddress",
          component: MyAddress,
          meta: { title: "收货地址" },
        },
        {
          path: "AddAddress",
          name: "AddAddress",
          component: AddAddress,
        },
        {
          path: "MsgList",
          name: "MsgList",
          component: MsgList,
          meta: { title: "我的消息" },
        },
        {
          path: "MsgDetail",
          name: "MsgDetail",
          component: MsgDetail,
          meta: { title: "我的消息" },
        },
        {
          path: "MyOrder",
          name: "MyOrder",
          component: MyOrder,
          meta: { title: "我的订单" },
        },
        {
          path: "OrderDetail",
          name: "OrderDetail",
          component: OrderDetail,
          meta: { title: "订单详情" },
        },
        {
          path: "AfterSaleDetail",
          name: "AfterSaleDetail",
          component: AfterSaleDetail,
          meta: { title: "售后详情" },
        },
      ],
    },
    {
      path: "/merchant",
      name: "Merchant",
      component: Merchant,
      meta: { title: "店铺" },
    },
  ],
});

router.beforeEach((to, from, next) => {
  NProgress.start();
  window.document.title = to.meta.title === undefined ? title : to.meta.title;
  next();
});

router.afterEach(() => {
  NProgress.done();
});

export default router;
