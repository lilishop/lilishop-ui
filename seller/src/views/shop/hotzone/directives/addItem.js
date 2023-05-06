import _ from '../utils'

export default {
  bind: function (el, binding, vnode) {
    const MIN_LIMIT = _.MIN_LIMIT

    el.addEventListener('mousedown', handleMouseDown, { passive: false })

    function handleMouseDown(e) {
      // console.log('additem', e)
      e && e.preventDefault()

      let itemInfo = {
        top: _.getDistanceY(e, el),
        left: _.getDistanceX(e, el),
        width: 0,
        height: 0
      }
      let container = _.getOffset(el)

      // Only used once at the beginning of init
      let setting = {
        topPer: _.decimalPoint(itemInfo.top / container.height),
        leftPer: _.decimalPoint(itemInfo.left / container.width),
        widthPer: 0,
        heightPer: 0
      }
      let preX = _.getPageX(e)
      let preY = _.getPageY(e)

      vnode.context.addItem(setting)// 这里去添加并发送了add通知，不应该发送通知

      window.addEventListener('mousemove', handleChange, { passive: false })
      window.addEventListener('mouseup', handleMouseUp, { passive: false })

      function handleChange(e) {
        e && e.preventDefault()

        let moveX = _.getPageX(e) - preX
        let moveY = _.getPageY(e) - preY
        preX = _.getPageX(e)
        preY = _.getPageY(e)

        // Not consider the direction of movement first, consider only the lower right drag point
        let minLimit = 0
        // 添加热区时，判定鼠标释放时，满足（热区大于48*48时）条件时生效
        let styleInfo = _.dealBR(itemInfo, moveX, moveY, minLimit)

        // Boundary value processing 改变热区大小时边界条件的处理
        itemInfo = _.dealEdgeValue(itemInfo, styleInfo, container, vnode.context.zones)

        Object.assign(el.lastElementChild.style, {
          top: `${itemInfo.top}px`,
          left: `${itemInfo.left}px`,
          width: `${itemInfo.width}px`,
          height: `${itemInfo.height}px`
        })
      }

      function handleMouseUp() {
        let perInfo = {
          topPer: _.decimalPoint(itemInfo.top / container.height),
          leftPer: _.decimalPoint(itemInfo.left / container.width),
          widthPer: _.decimalPoint(itemInfo.width / container.width),
          heightPer: _.decimalPoint(itemInfo.height / container.height),
          img: "",
          link: "",
          type: "",
          title: ""
        }

        if (vnode.context.isOverRange()) {
          vnode.context.overRange() // 判断超出个数限制，给overRange钩子抛回调
        } else if (container.height < MIN_LIMIT && itemInfo.width > MIN_LIMIT) {
          vnode.context.changeItem(Object.assign(perInfo, {
            topPer: 0,
            heightPer: 1
          }), true)
        } else if (container.width < MIN_LIMIT && itemInfo.height > MIN_LIMIT) {
          vnode.context.changeItem(Object.assign(perInfo, {
            leftper: 0,
            widthPer: 1
          }), true)
        } else if (itemInfo.width > MIN_LIMIT && itemInfo.height > MIN_LIMIT) {
          vnode.context.changeItem(perInfo, true)
        } else {
          // 当添加区域超出范围或小于最小区域（48*48）时触发，删除当亲绘制的热区并发送erase事件通知
          vnode.context.eraseItem()
        }

        window.removeEventListener('mousemove', handleChange)
        window.removeEventListener('mouseup', handleMouseUp)
      }
    }

    el.$destroy = () => el.removeEventListener('mousedown', handleMouseDown)
  },
  unbind: function (el) {
    el.$destroy()
  }
}
