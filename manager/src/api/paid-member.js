import { getRequest, putRequestWithNoForm } from '@/libs/axios';
export const getPaidConfig = () => getRequest('/member/paid/config');
export const savePaidConfig = data => putRequestWithNoForm('/member/paid/config', data);
export const getPaidOrders = params => getRequest('/member/paid/orders', params);
export const getPaidResources = (type, ids) => getRequest('/member/paid/resources', { type, ids: ids.join(',') });
export const getPaidDiscountSkus = params => getRequest('/member/paid/discount-skus', params);
