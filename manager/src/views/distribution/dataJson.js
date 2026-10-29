// 分销员状态列表
export const distributionStatusList= [
    {
        value:'APPLY',
        label:'申请中'
    },
    {
        value:'RETREAT',
        label:'已清退'
    },
    {
        value:'REFUSE',
        label:'审核拒绝'
    },
    {
        value:'PASS',
        label:'审核通过'
    },
]
// 分销佣金状态列表
export const cashStatusList = [
    {
        value:'APPLY',
        label:'待处理'
    },
    {
        value:'FAIL_AUDITING',
        label:'拒绝'
    },
    {
        value:'VIA_AUDITING',
        label:'通过'
    }
]
// 分销客户关系有效状态筛选
export const relationEffectiveList = [
    { value: true, label: '有效' },
    { value: false, label: '失效' },
]
export const hasDeadlineList = [
    { value: true, label: '是' },
    { value: false, label: '否' },
]
// 分销客户关系状态列表
export const relationStatusList = [
    { value: 'PENDING', label: '待支付转永久' },
    { value: 'TEMPORARY', label: '短期有效' },
    { value: 'PERMANENT', label: '永久有效' },
    { value: 'EXPIRED', label: '已到期' },
    { value: 'UNBOUND', label: '已解绑' },
    { value: 'SELF_BIND', label: '自绑定' },
]
export const customerRelationChangeTypeList = [
    { value: 'CREATE', label: '绑定' },
    { value: 'EXPIRE', label: '过期' },
    { value: 'ADMIN_REBIND', label: '换绑' },
    { value: 'ADMIN_UNBIND', label: '解绑' },
]
export const bindModeList = [
    { value: 'PERMANENT', label: '永久锁客' },
    { value: 'SHORT_TERM', label: '短期锁客' },
]
export const permanentBindModeList = [
    { value: 'SCAN_IMMEDIATE', label: '扫码立即永久' },
    { value: 'PAID_WITHIN_DAYS', label: '规定天数内支付转永久' },
]
export const bindSourceList = [
    { value: 'SCAN', label: '扫码绑定' },
    { value: 'ORDER', label: '订单触发' },
    { value: 'ADMIN', label: '后台操作' },
]
// 分销订单状态列表
export const orderStatusList = [
    {
        value:'WAIT_BILL',
        label:'待结算'
    },
    {
        value:'WAIT_CASH',
        label:'待提现'
    },
    {
        value:'COMPLETE_CASH',
        label:'提现完成'
    }
]

// 兼容别名导出
export const bindStatusList = relationStatusList;
export const bindChangeTypeList = customerRelationChangeTypeList;
