/**
 * 小程序订单筛选及异步竞态回归，隔离网络验证旧响应不覆盖新页面。
 * @author Bulbasaur
 * @since 2026-11-09
 */
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { parse } = require('@vue/compiler-sfc');
const root = path.resolve(__dirname, '..');
const tick = () => new Promise(resolve => setImmediate(resolve));

/** 从实际 Vue 脚本加载逻辑，替换网络及 Vue 生命周期，不启动业务服务。 */
function script(file) {
  return parse(fs.readFileSync(path.join(root,file),'utf8')).descriptor.scriptSetup.content.replace(/^import .*;\r?$/gm,'');
}

/** 为并发请求提供可控完成顺序。 */
function deferred() {
  let resolve, reject;
  const promise = new Promise((yes,no) => {resolve=yes; reject=no;});
  return {promise,resolve,reject};
}

/** 保留表单值及计算属性的最小运行环境。 */
function primitives() {
  return { ref:value=>({value}), computed:fn=>({get value(){return fn();}}), defineOptions:()=>{}, defineExpose:()=>{}, onMounted:()=>{} };
}

test('专用列表固定支付范围、重置筛选，且旧列表和数量响应不能覆盖新结果', async()=>{
  const requests=[];
  const send=kind=>params=>{const wait=deferred();requests.push({kind,params:{...params},...wait});return wait.promise;};
  const context={...primitives(),defineProps:()=>({fixedClientType:'WECHAT_MP',fixedPaymentMethod:'WECHAT',wechatSync:true,allowExport:false}),useRoute:()=>({query:{clientType:'PC',paymentMethod:'WALLET'}}),watch:()=>{},wechatSyncOptions:[],API_Order:{getWechatOrderList:send('list'),getWechatOrderNum:send('count')}};
  vm.createContext(context);
  vm.runInContext(script('src/views/order/order/orderList.vue')+';globalThis.t={init,handleSearch,handleReset,changePage,orderStatusClick,searchForm,data,orderNumData,loading,loadError};',context);
  const t=context.t;
  t.init();
  t.searchForm.value.paymentMethod='WALLET';t.searchForm.value.wechatSyncStatus='FAILED';t.handleSearch();
  const newest=requests.filter(r=>r.kind==='list').at(-1);
  newest.resolve({success:true,result:{records:[{sn:'new'}],total:1}});
  requests.filter(r=>r.kind==='count').at(-1).resolve({success:true,result:{waitPayNum:5}});
  await tick();
  requests[0].resolve({success:true,result:{records:[{sn:'old'}],total:99}});
  requests[1].resolve({success:true,result:{waitPayNum:99}});
  await tick();
  assert.equal(t.data.value[0].sn,'new');assert.equal(t.orderNumData.value.waitPayNum,5);
  t.changePage(2);t.orderStatusClick('DELIVERED');t.handleReset();
  for(const r of requests){assert.equal(r.params.clientType,'WECHAT_MP');assert.equal(r.params.paymentMethod,'WECHAT');}
  assert.equal(t.searchForm.value.wechatSyncStatus,'');assert.equal(t.searchForm.value.paymentMethod,'WECHAT');
  requests.filter(r=>r.kind==='list').at(-1).reject(new Error('network'));
  await tick();assert.equal(t.loadError.value,true);assert.equal(t.data.value.length,0);assert.equal(t.loading.value,false);
});

test('普通订单仍使用原接口且允许其他支付方式，不强制附加上报条件', async()=>{
  let sent;
  const context={...primitives(),defineProps:()=>({fixedClientType:'',fixedPaymentMethod:'',wechatSync:false,allowExport:true}),useRoute:()=>({query:{}}),watch:()=>{},wechatSyncOptions:[],API_Order:{getOrderList:params=>{sent={...params};return Promise.resolve({success:true,result:{records:[],total:0}});},getOrderNum:()=>Promise.resolve({success:true,result:{}})}};
  vm.createContext(context);vm.runInContext(script('src/views/order/order/orderList.vue')+';globalThis.t={init,searchForm};',context);
  context.t.searchForm.value.paymentMethod='WALLET';context.t.init();await tick();
  assert.equal(sent.paymentMethod,'WALLET');assert.equal(sent.clientType,undefined);assert.equal(sent.wechatSyncStatus,undefined);
});

test('日志抽屉切换订单及关闭后，旧请求不会回填另一笔订单', async()=>{
  const props={modelValue:true,orderSn:'A'},requests=[];let changed;
  const context={...primitives(),defineProps:()=>props,defineEmits:()=>()=>{},watch:(source,callback)=>{changed=callback;callback();},getWechatOrderLogs:(sn,params)=>{const wait=deferred();requests.push({sn,...wait});return wait.promise;}};
  vm.createContext(context);vm.runInContext(script('src/views/order/wechat/SyncLogDrawer.vue')+';globalThis.t={records,loading,failed,load};',context);
  props.orderSn='B';changed();
  requests[1].resolve({success:true,result:{records:[{orderSn:'B'}],total:1}});await tick();
  requests[0].resolve({success:true,result:{records:[{orderSn:'A'}],total:1}});await tick();
  assert.equal(context.t.records.value[0].orderSn,'B');
  context.t.load();props.modelValue=false;changed();requests[2].resolve({success:true,result:{records:[{orderSn:'B'}],total:1}});await tick();
  assert.equal(context.t.records.value.length,0);assert.equal(context.t.loading.value,false);
});
