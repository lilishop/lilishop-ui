import { managerApiUrl, getRequest, postRequest, putRequestWithNoForm } from '@/libs/axios';

// 获取定时任务列表
export const getTimedTaskList = () => {
  return getRequest(`${managerApiUrl}/manager/setting/timed-task`);
};

// 修改定时任务（Cron表达式、启用/暂停状态）
export const updateTimedTask = (params) => {
  return putRequestWithNoForm(`${managerApiUrl}/manager/setting/timed-task`, params);
};

// 手动触发定时任务
export const triggerTimedTask = (taskId) => {
  return postRequest(`${managerApiUrl}/manager/setting/timed-task/trigger/${taskId}`);
};
