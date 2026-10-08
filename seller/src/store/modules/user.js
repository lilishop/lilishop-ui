import Cookies from 'js-cookie';
import { removeStore } from '@/libs/storage';

// 退出登录时需要清除的会话/店铺数据
// 保留 uuid（设备标识）、setting（主题）、currNav、category（缓存）、saveLogin（记住登录状态）等无关键
const LOGOUT_KEYS = [
    'accessToken',
    'refreshToken',
    'menuData',
    'seller_expiration_time',
    'sellersiteName',
    'sellerlogoImg',
    'sellerIconImg'
];

const user = {
    state: {},
    mutations: {
        logout () {
            Cookies.remove('userInfoSeller');
            // 精确清除会话相关键，不再 localStorage.clear() 误删无关数据
            LOGOUT_KEYS.forEach(key => removeStore(key));
        }
    }
};

export default user;
