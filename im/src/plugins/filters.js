import * as Foundation from './Foundation.js';

/**
 * 金钱单位置换  2999 --> 2,999.00
 * @param val
 * @param unit
 * @param location
 * @returns {*}
 */
export function unitPrice (val, unit, location) {
  if (!val) val = 0;
  let price = Foundation.formatPrice(val);
  if (location === 'before') {
    return price.substr(0, price.length - 3);
  }
  if (location === 'after') {
    return price.substr(-2);
  }
  return (unit || '') + price;
}