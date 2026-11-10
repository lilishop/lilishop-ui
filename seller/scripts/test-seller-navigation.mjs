/**
 * 商家导航回归：覆盖权限裁剪、详情归属和跨分组检索，使用 Node 内置测试运行器。
 * @author Bulbasaur
 * @since 2026-11-08
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { flattenNavigation, findNavigationItem, searchNavigation } from '../src/libs/seller-navigation.js';

const component = () => {};
const menus = [
  { name: 'goods', title: '商品', children: [{ title: '商品管理', children: [
    { name: 'goods', title: '商品列表', component },
    { name: 'disabled', title: '不可用页面', component: null },
  ] }] },
  { name: 'order', title: '订单', children: [{ title: '订单管理', children: [
    { name: 'orderList', title: '商品订单', component },
  ] }] },
];
const items = flattenNavigation(menus);

test('搜索不补出未授权入口，也不展示无法加载的菜单', () => {
  assert.equal(searchNavigation(items, '优惠券').length, 0);
  assert.equal(searchNavigation(items, '不可用页面').length, 0);
});
test('详情页刷新可定位已授权业务入口', () => {
  assert.equal(findNavigationItem(items, 'goods-operation-edit')?.topName, 'goods');
  assert.equal(findNavigationItem(items, 'order-detail')?.name, 'orderList');
});
test('详情页对应入口被撤权后不能沿用旧账号菜单', () => {
  const restricted = flattenNavigation(menus.slice(0, 1));
  assert.equal(findNavigationItem(restricted, 'order-detail'), null);
  assert.equal(findNavigationItem([], 'goods-operation-edit'), null);
});
test('详情本身是授权菜单时优先使用精确入口', () => {
  const exact = { name: 'order-detail', topName: 'custom' };
  assert.equal(findNavigationItem([...items, exact], 'order-detail'), exact);
});
test('关键词同时匹配栏目及名称，避免同名商品功能混淆', () => {
  assert.deepEqual(searchNavigation(items, '  订单  商品 ').map(item => item.name), ['orderList']);
  assert.deepEqual(searchNavigation(items, '商品 列表').map(item => item.name), ['goods']);
});
test('搜索清空与空权限账号正确处理', () => {
  assert.equal(searchNavigation(items, '   ').length, 2);
  assert.deepEqual(searchNavigation(flattenNavigation([]), ''), []);
  assert.equal(findNavigationItem(items, 'unknown-detail'), null);
});
test('满减/满折/满赠详情页按 activityType 定位对应左侧菜单', () => {
  const promoMenus = [
    { name: 'promotion', title: '营销', children: [{ title: '店铺活动', children: [
      { name: 'full-discount', path: 'full-discount', title: '满减活动', component },
      { name: 'store-full-rate', path: 'full-rate', title: '满折活动', component },
      { name: 'store-full-gift', path: 'full-gift', title: '满赠活动', component },
    ] }] },
  ];
  const promoItems = flattenNavigation(promoMenus);
  assert.equal(findNavigationItem(promoItems, 'full-discount-detail', { activityType: 'FULL_GIFT' })?.name, 'store-full-gift');
  assert.equal(findNavigationItem(promoItems, 'full-discount-detail', { activityType: 'FULL_RATE' })?.name, 'store-full-rate');
  assert.equal(findNavigationItem(promoItems, 'full-discount-detail', { activityType: 'FULL_MINUS' })?.name, 'full-discount');
});
