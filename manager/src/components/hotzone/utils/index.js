let _ = {
  MIN_LIMIT: 48, // Min size of zone
  DECIMAL_PLACES: 4 // Hotzone positioning decimal point limit number of digits
}

/**
 * Get a power result of 10 for the power of the constant
 * @return {Number}
 */
_.getMultiple = (decimalPlaces = _.DECIMAL_PLACES) => {
  return Math.pow(10, decimalPlaces)
}

/**
 * Limit decimal places
 * @param  {Number} num
 * @return {Number}
 */
_.decimalPoint = (val = 0) => { // 处理js小数点计算不精确问题，先放再缩小
  return Math.round(val * _.getMultiple()) / _.getMultiple() || 0
}

/**
 * Get element width and height
 * @param  {Object} elem
 * @return {Object}
 */
_.getOffset = (elem = {}) => ({
  width: elem.clientWidth || 0,
  height: elem.clientHeight || 0
})

/**
 * Get pageX
 * @param  {Object} e
 * @return {Number}
 */
_.getPageX = (e) => ('pageX' in e) ? e.pageX : e.touches[0].pageX

/**
 * Get pageY
 * @param  {Object} e
 * @return {Number}
 */
_.getPageY = (e) => ('pageY' in e) ? e.pageY : e.touches[0].pageY

/**
 * Gets the abscissa value of the mouse click relative to the target node
 * @param  {Object} e
 * @param  {Object} container
 * @return {Number}
 */
_.getDistanceX = (e, container) =>
  _.getPageX(e) - (container.getBoundingClientRect().left + window.pageXOffset)

/**
 * Gets the ordinate value of the mouse click relative to the target node
 * @param  {Object} e
 * @param  {Object} container
 * @return {Number}
 */
_.getDistanceY = (e, container) =>
  _.getPageY(e) - (container.getBoundingClientRect().top + window.pageYOffset)

// 检测区域是否有碰撞 true 有碰撞交集 ,false 无碰撞
_.handleEgdeCollisions = (rect1, rect2) => {
  const l1 = { left: rect1.left, top: rect1.top }
  const r1 = { left: rect1.left + rect1.width, top: rect1.top + rect1.height }
  const l2 = { left: rect2.left, top: rect2.top }
  const r2 = { left: rect2.left + rect2.width, top: rect2.top + rect2.height }
  return !(
    l1.left > r2.left ||
    l2.left > r1.left ||
    l1.top > r2.top ||
    l2.top > r1.top
  )
}
/**
 * Treatment of boundary conditions when changing the size of the hotzone 改变热区大小时边界条件的处理（如果要避免热区重叠，代码要加载这里）
 * @param {Object} itemInfo
 * @param {Object} styleInfo
 * @param {Object} container
 */
_.dealEdgeValue = (itemInfo, styleInfo, container, zones, currentIndex = zones.length - 1) => {
  
  if (Object.prototype.hasOwnProperty.call(styleInfo, "left") && styleInfo.left < 0) {
    styleInfo.left = 0
    styleInfo.width = itemInfo.width + itemInfo.left
  }

  if (Object.prototype.hasOwnProperty.call(styleInfo, "top") && styleInfo.top < 0) {
    styleInfo.top = 0
    styleInfo.height = itemInfo.height + itemInfo.top
  }

  if (!Object.prototype.hasOwnProperty.call(styleInfo, "left") && Object.prototype.hasOwnProperty.call(styleInfo, "width")) {
    if (itemInfo.left + styleInfo.width > container.width) {
      styleInfo.width = container.width - itemInfo.left
    }
  }

  if (!Object.prototype.hasOwnProperty.call(styleInfo, "top") && Object.prototype.hasOwnProperty.call(styleInfo, "height")) {
    if (itemInfo.top + styleInfo.height > container.height) {
      styleInfo.height = container.height - itemInfo.top
    }
  }
  // 与其他热区重叠，则修正 检测是否发生碰撞
  if (zones.length > 1) {
    let currentzones = JSON.parse(JSON.stringify(zones)).map((zone) => {
      return {
        left: (zone.leftPer || 0) * container.width,
        top: (zone.topPer || 0) * container.height,
        width: (zone.widthPer || 0) * container.width,
        height: (zone.heightPer || 0) * container.height
      }
    })
    let current = { ...itemInfo, ...styleInfo }
    for (let i = 0, len = currentzones.length; i < len; i++) {
      if (currentIndex !== i && _.handleEgdeCollisions(currentzones[i], current)) {
        return itemInfo
      }
    }
  }

  return Object.assign(itemInfo, styleInfo)
}

/**
 * Handle different drag points, capital letters mean: T-top，L-left，C-center，R-right，B-bottom
 * @param  {Object} itemInfo
 * @param  {Number} moveX
 * @param  {Number} moveY
 * @return {Object}
 */
_.dealTL = (itemInfo, moveX, moveY, minLimit = _.MIN_LIMIT) => {
  let styleInfo = {}
  let width = itemInfo.width - moveX
  let height = itemInfo.height - moveY

  if (width >= Math.min(minLimit, itemInfo.width)) {
    Object.assign(styleInfo, {
      width,
      left: itemInfo.left + moveX
    })
  }

  if (height >= Math.min(minLimit, itemInfo.height)) {
    Object.assign(styleInfo, {
      height,
      top: itemInfo.top + moveY
    })
  }

  return styleInfo
}

_.dealTC = (itemInfo, moveX, moveY, minLimit = _.MIN_LIMIT) => {
  let styleInfo = {}
  let height = itemInfo.height - moveY

  if (height >= Math.min(minLimit, itemInfo.height)) {
    styleInfo = {
      height,
      top: itemInfo.top + moveY
    }
  }

  return styleInfo
}

_.dealTR = (itemInfo, moveX, moveY, minLimit = _.MIN_LIMIT) => {
  let styleInfo = {}
  let width = itemInfo.width + moveX
  let height = itemInfo.height - moveY

  if (width >= Math.min(minLimit, itemInfo.width)) {
    Object.assign(styleInfo, {
      width
    })
  }

  if (height >= Math.min(minLimit, itemInfo.height)) {
    Object.assign(styleInfo, {
      height,
      top: itemInfo.top + moveY
    })
  }

  return styleInfo
}

_.dealCL = (itemInfo, moveX, moveY, minLimit = _.MIN_LIMIT) => {
  let styleInfo = {}
  let width = itemInfo.width - moveX

  if (width >= Math.min(minLimit, itemInfo.width)) {
    Object.assign(styleInfo, {
      width,
      left: itemInfo.left + moveX
    })
  }

  return styleInfo
}

_.dealCR = (itemInfo, moveX, moveY, minLimit = _.MIN_LIMIT) => {
  let styleInfo = {}
  let width = itemInfo.width + moveX

  if (width >= Math.min(minLimit, itemInfo.width)) {
    Object.assign(styleInfo, {
      width
    })
  }

  return styleInfo
}

_.dealBL = (itemInfo, moveX, moveY, minLimit = _.MIN_LIMIT) => {
  let styleInfo = {}
  let width = itemInfo.width - moveX
  let height = itemInfo.height + moveY

  if (width >= Math.min(minLimit, itemInfo.width)) {
    Object.assign(styleInfo, {
      width,
      left: itemInfo.left + moveX
    })
  }

  if (height >= Math.min(minLimit, itemInfo.height)) {
    Object.assign(styleInfo, {
      height
    })
  }

  return styleInfo
}

_.dealBC = (itemInfo, moveX, moveY, minLimit = _.MIN_LIMIT) => {
  let styleInfo = {}
  let height = itemInfo.height + moveY

  if (height >= Math.min(minLimit, itemInfo.height)) {
    Object.assign(styleInfo, {
      height
    })
  }

  return styleInfo
}
// 添加热区时，判定鼠标释放点满足一下条件时生效
_.dealBR = (itemInfo, moveX, moveY, minLimit = _.MIN_LIMIT) => {
  let styleInfo = {}
  let width = itemInfo.width + moveX
  let height = itemInfo.height + moveY
  if (width >= Math.min(minLimit, itemInfo.width)) {
    // 改变后的宽度 >= min(之前宽度,内置的最小宽度标准)，即生效
    Object.assign(styleInfo, {
      width
    })
  }

  if (height >= Math.min(minLimit, itemInfo.height)) {
    // 改变后的高度 大于等于 Min（最小高度，之前高度）时，生效
    Object.assign(styleInfo, {
      height
    })
  }

  return styleInfo
}

export default _
