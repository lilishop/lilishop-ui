import Cookies from "js-cookie";
const psl = require("psl");

const isClient = typeof window !== "undefined";

function withCookieDomain(options = {}) {
  if (!isClient) {
    return options;
  }
  const pPsl = psl.parse(document.domain);
  let domain = pPsl.domain;
  if (/\d+\.\d+\.\d+\.\d+/.test(pPsl.input)) domain = pPsl.input;
  return { domain, ...options };
}

export default {
  setItem: (key, value, options = {}) => {
    Cookies.set(key, value, withCookieDomain(options));
  },
  getItem: key => {
    return Cookies.get(key);
  },
  removeItem: (key, options = {}) => {
    Cookies.remove(key, withCookieDomain(options));
  }
};
