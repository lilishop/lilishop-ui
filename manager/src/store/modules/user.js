import Cookies from 'js-cookie';
import util from '@/libs/util';

const user = {
    state: {},
    mutations: {
        logout () {
            util.clearDynamicRoutes();
            Cookies.remove('userInfoManager');
            localStorage.clear();
        }
    }
};

export default user;
