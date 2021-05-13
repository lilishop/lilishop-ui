/**
 * Created by Andste on 2018/5/3.
 */

import Cookies from 'js-cookie';
const psl = require('psl');

export default {
  setItem: (key, value, options = {}) => {
    if (process.client) {
      const p_psl = psl.parse(document.domain);
      let domain = p_psl.domain;
      if (/\d+\.\d+\.\d+\.\d+/.test(p_psl.input)) domain = p_psl.input;
      options = { domain, ...options };
    }
    Cookies.set(key, value, options);
  },
  getItem: (key) => {
    return Cookies.get(key);
  },
  removeItem: (key, options = {}) => {
    if (process.client) {
      const p_psl = psl.parse(document.domain);
      let domain = p_psl.domain;
      if (/\d+\.\d+\.\d+\.\d+/.test(p_psl.input)) domain = p_psl.input;
      options = { domain, ...options };
    }
    Cookies.remove(key, options);
  }
};
