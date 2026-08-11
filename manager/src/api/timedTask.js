import { managerApiUrl, getRequest, postRequest } from '@/libs/axios';

// 获取定时任务列表
export const getTimedTaskList = () => {
  return getRequest(`${managerApiUrl}/manager/setting/timed-task`);
};

// 手动触发定时任务
export const triggerTimedTask = (type) => {
  return postRequest(`${managerApiUrl}/manager/setting/timed-task/trigger/${type}`);
};
