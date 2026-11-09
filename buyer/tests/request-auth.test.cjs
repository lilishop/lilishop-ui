/**
 * 买家端请求认证回归：验证真实 Axios 拦截链、并发刷新和已提示异常边界。
 * @author Bulbasaur
 * @since 2026-11-09
 */
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const axios = require('axios');

/** 加载业务源码，替换浏览器与界面依赖；请求拦截和重试仍使用真实 Axios。 */
function harness({ expired = false, refresh = async () => ({ success: false }), adapter } = {}) {
  const values = new Map();
  const jwt = (exp) => 'header.' + Buffer.from(JSON.stringify({ exp })).toString('base64url') + '.sig';
  if (expired) values.set('accessToken', jwt(1));
  values.set('refreshToken', 'refresh-old');
  const Storage = { getItem: k => values.get(k), setItem: (k,v) => values.set(k,v), removeItem: k => values.delete(k) };
  const helperSource = fs.readFileSync(path.join(__dirname, '../src/utils/requestError.js'), 'utf8').replace(/export /g, '');
  const helper = new Function(helperSource + '; return { markHandledRequestError, isHandledRequestError, catchHandledRequestError, setupRequestErrorHandling };')();
  let prompts = 0, refreshCalls = 0, closes = 0, opens = 0;
  const messages = [], sent = [];
  let dismiss, promptOptions;
  const Modal = { confirm(options) { prompts++; promptOptions = options; return new Promise(resolve => { dismiss = resolve; }); } };
  const router = { currentRoute: { value: { path: '/home/MyOrder', query: { tag: 'ALL' } } }, push: async () => {} };
  const axiosProxy = { ...axios, create(options) { return axios.create({ ...options, adapter: async config => {
    sent.push(config);
    return adapter ? adapter(config, sent.length) : { data: { success: true }, status: 200, config, headers: {} };
  } }); } };
  const source = fs.readFileSync(path.join(__dirname, '../src/plugins/request.js'), 'utf8')
    .replace(/^import .*;\r?\n/gm, '').replace(/export default function request/, 'function request').replace(/export const /g, 'const ');
  const names = ['axios','markHandledRequestError','isHandledRequestError','ElLoading','Message','Modal','Storage','router','useAppStore','handleRefreshToken','uuidv4','require','process','BASE','window','setTimeout'];
  const request = new Function(...names, source + '; return request;')(
    axiosProxy, helper.markHandledRequestError, helper.isHandledRequestError,
    { service() { opens++; return { close() { closes++; } }; } }, { error: m => messages.push(m) }, Modal, Storage, router,
    () => ({ setCartNum() {} }), async () => { refreshCalls++; return refresh(jwt); }, () => 'uuid', require,
    { env: { NODE_ENV: 'development' } }, { API_DEV: { buyer: '/api' } }, { atob: v => Buffer.from(v,'base64').toString('binary') }, fn => fn()
  );
  return { request, values, helper, sent, messages, get prompts() { return prompts; }, get refreshCalls() { return refreshCalls; }, get opens() { return opens; }, get closes() { return closes; }, dismiss: () => dismiss(), get promptOptions() { return promptOptions; } };
}

/** 构造后端拒绝登录的 HTTP 响应。 */
function unauthorized(config) {
  throw new axios.AxiosError('unauthorized', 'ERR_BAD_REQUEST', config, null, { status: 401, data: {}, config });
}

test('并发过期请求只刷新一次，返回配置并各发送一次业务请求', async () => {
  const h = harness({ expired: true, refresh: async jwt => {
    await new Promise(resolve => setImmediate(resolve));
    return { success: true, result: { accessToken: jwt(4000000000), refreshToken: 'new-refresh' } };
  } });
  const results = await Promise.all([1,2,3].map(() => h.request({ url: '/orders', needToken: true })));
  assert.equal(h.refreshCalls, 1);
  assert.equal(h.sent.length, 3);
  assert.ok(results.every(r => r.success));
  assert.equal(h.prompts, 0);
});

test('刷新失败保持拒绝、只弹一次登录框并清理身份与加载', async () => {
  const h = harness({ expired: true });
  let successes = 0;
  const results = await Promise.allSettled([1,2,3].map(() => h.request({ url: '/orders', needToken: true, loading: true }).then(() => { successes++; })));
  assert.equal(successes, 0);
  assert.equal(h.sent.length, 0);
  assert.equal(h.prompts, 1);
  assert.equal(h.closes, h.opens);
  assert.equal(h.values.get('accessToken'), undefined);
  assert.ok(results.every(r => r.status === 'rejected' && h.helper.isHandledRequestError(r.reason)));
  assert.equal(h.messages.length, 0);
  h.dismiss();
  await new Promise(resolve => setImmediate(resolve));
  await assert.rejects(h.request({ url: '/orders', needToken: true, adapter: unauthorized }));
  assert.equal(h.prompts, 2);
  assert.equal(h.refreshCalls, 1);
});

test('401 重试上限防止刷新死循环，POST 请求体保持一致', async () => {
  const h = harness({ adapter: unauthorized, refresh: async jwt => ({ success: true, result: { accessToken: jwt(4000000000), refreshToken: 'new' } }) });
  await assert.rejects(h.request({ url: '/orders', method: 'post', data: { amount: 12 }, headers: { 'Content-Type': 'application/json' }, needToken: true, loading: true }), e => e.code === 'AUTH_EXPIRED');
  assert.equal(h.refreshCalls, 1);
  assert.equal(h.sent.length, 2);
  assert.equal(h.sent[0].data, '{"amount":12}');
  assert.equal(h.sent[1].data, h.sent[0].data);
  assert.equal(h.opens, h.closes);
  assert.equal(h.prompts, 1);
});

test('HTTP 200 内认证失败进入同一处理，刷新接口不递归', async () => {
  const h = harness({ adapter: async config => ({ config, status: 200, data: { code: 20004 }, headers: {} }) });
  await assert.rejects(h.request({ url: '/orders' }), e => e.code === 'AUTH_EXPIRED');
  const skipped = await h.request({ url: '/refresh', skipAuthHandler: true, skipMessage: true });
  assert.equal(skipped.code, 20004);
  assert.equal(h.refreshCalls, 1);
});

test('网络失败只提示一次，skipMessage 与程序错误不登记为已处理', async () => {
  const h = harness({ adapter: config => { throw new axios.AxiosError('timeout', 'ECONNABORTED', config); } });
  await assert.rejects(h.request({ url: '/orders' }), e => h.helper.isHandledRequestError(e));
  assert.deepEqual(h.messages, ['连接超时，请稍候再试！']);
  await assert.rejects(h.request({ url: '/refresh', skipMessage: true }), e => !h.helper.isHandledRequestError(e));
  const bug = new TypeError('bug');
  const b = harness({ adapter: () => { throw bug; } });
  await assert.rejects(b.request({ url: '/orders' }), e => e === bug);
});

test('全局兜底和开发遮罩仅过滤已提示错误，未知错误仍上报', () => {
  const h = harness();
  const handled = h.helper.markHandledRequestError(new Error('登录已过期'));
  const bug = new TypeError('bug');
  const listeners = {};
  const app = { config: {} };
  h.helper.setupRequestErrorHandling(app, { addEventListener: (name, fn) => { listeners[name] = fn; } });
  let prevented = 0;
  listeners.unhandledrejection({ reason: handled, preventDefault: () => prevented++ });
  listeners.unhandledrejection({ reason: bug, preventDefault: () => prevented++ });
  assert.equal(prevented, 1);
  assert.doesNotThrow(() => app.config.errorHandler(handled));
  assert.throws(() => app.config.errorHandler(bug), e => e === bug);
  assert.throws(() => h.helper.catchHandledRequestError(bug), e => e === bug);
  const filter = require('../vue.config.js').devServer.client.overlay.runtimeErrors;
  assert.equal(filter(handled), false);
  assert.equal(filter(bug), true);
});


test('未登录不刷新 undefined，公开接口保持匿名可访问', async () => {
  const h = harness({ adapter: config => {
    if (config.needToken) return unauthorized(config);
    return { config, status: 200, data: { success: true }, headers: {} };
  } });
  h.values.delete('refreshToken');
  await assert.rejects(h.request({ url: '/orders', needToken: true }), e => e.code === 'AUTH_EXPIRED');
  const result = await h.request({ url: '/goods', optionalToken: true });
  assert.equal(result.success, true);
  assert.equal(h.refreshCalls, 0);
  assert.equal(h.prompts, 1);
});

test('HTTP 401 并发共用刷新，表单 POST 重试不重复编码', async () => {
  const h = harness({
    adapter: config => {
      if (!config.headers.accessToken) return unauthorized(config);
      return { config, status: 200, data: { success: true }, headers: {} };
    },
    refresh: async jwt => {
      await new Promise(resolve => setImmediate(resolve));
      return { success: true, result: { accessToken: jwt(4000000000), refreshToken: 'new' } };
    },
  });
  await Promise.all([1,2].map(() => h.request({ url: '/orders', method: 'post', data: { name: 'a b' }, needToken: true })));
  assert.equal(h.refreshCalls, 1);
  assert.equal(h.sent.length, 4);
  assert.ok(h.sent.every(c => c.data === 'name=a%20b'));
});


/** 从真实 Vue 页面提取查询函数，验证失败收尾与请求乱序，界面依赖用响应式状态桩替换。 */
function listHarness(file, apiName) {
  const { parse } = require('@vue/compiler-sfc');
  const parser = require('@babel/parser');
  const source = parse(fs.readFileSync(path.join(__dirname, '../src/pages/home', file), 'utf8')).descriptor.scriptSetup.content;
  const declaration = parser.parse(source, { sourceType: 'module' }).program.body.find(n => n.type === 'FunctionDeclaration' && n.id.name === 'getList');
  const state = { spinShow: { value: false }, queryFailed: { value: false }, orderList: { value: [] }, list: { value: [] }, total: { value: 0 } };
  const calls = [];
  const api = () => new Promise((resolve, reject) => calls.push({ resolve, reject }));
  const getList = new Function(...Object.keys(state), 'params', apiName, 'catchHandledRequestError',
    'let listRequestVersion = 0; ' + source.slice(declaration.start, declaration.end) + '; return getList;')(
      ...Object.values(state), { pageNumber: 1 }, api, () => {}
    );
  return { ...state, calls, getList };
}

for (const [file, api] of [['orderCenter/MyOrder.vue','getOrderList'], ['orderCenter/AfterSale.vue','afterSaleList'], ['userCenter/MyTracks.vue','tracksList']]) {
  test(file + ' 失败结束加载并可重试，旧查询不能覆盖新列表', async () => {
    const h = listHarness(file, api);
    h.getList();
    assert.equal(h.spinShow.value, true);
    h.calls[0].reject(new Error('network'));
    await new Promise(resolve => setImmediate(resolve));
    assert.equal(h.spinShow.value, false);
    assert.equal(h.queryFailed.value, true);
    h.getList();
    h.getList();
    h.calls[2].resolve({ success: true, result: { records: [{ id: 'new' }], total: 1 } });
    await new Promise(resolve => setImmediate(resolve));
    h.calls[1].resolve({ success: true, result: { records: [{ id: 'old' }], total: 20 } });
    await new Promise(resolve => setImmediate(resolve));
    assert.equal(h.spinShow.value, false);
    assert.equal(h.queryFailed.value, false);
    assert.equal(h.total.value, 1);
    const list = file.includes('MyTracks') ? h.list : h.orderList;
    assert.deepEqual(list.value, [{ id: 'new' }]);
  });
}
