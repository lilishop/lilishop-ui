import _ from '../utils'

export default {
  mounted(el, binding) {
    const handleMouseDown = (e) => {
      const ctx = binding.instance
      if (!ctx) return

      const pointer = e.target.dataset.pointer

      if (!pointer) {
        return
      }

      e && e.stopPropagation()

      const zone = el.parentNode
      const setting = ctx.setting
      const currentIndex = ctx.index
      const container = _.getOffset(zone.parentNode)
      let itemInfo = {
        width: _.getOffset(zone).width || 0,
        height: _.getOffset(zone).height || 0,
        top: setting.topPer * container.height || 0,
        left: setting.leftPer * container.width || 0,
      }
      let preX = _.getPageX(e)
      let preY = _.getPageY(e)
      let flag

      ctx.handlehideZone(true)

      window.addEventListener('mousemove', handleChange, { passive: false })
      window.addEventListener('mouseup', handleMouseUp, { passive: false })

      function handleChange(e) {
        e && e.preventDefault()
        flag = true

        const moveX = _.getPageX(e) - preX
        const moveY = _.getPageY(e) - preY

        preX = _.getPageX(e)
        preY = _.getPageY(e)

        const styleInfo = _[pointer](itemInfo, moveX, moveY)
        itemInfo = _.dealEdgeValue(
          itemInfo,
          styleInfo,
          container,
          ctx.$parent.zones,
          currentIndex
        )

        Object.assign(zone.style, {
          top: `${itemInfo.top}px`,
          left: `${itemInfo.left}px`,
          width: `${itemInfo.width}px`,
          height: `${itemInfo.height}px`,
        })
      }

      function handleMouseUp() {
        if (flag) {
          flag = false
          const perInfo = {
            topPer: _.decimalPoint(itemInfo.top / container.height),
            leftPer: _.decimalPoint(itemInfo.left / container.width),
            widthPer: _.decimalPoint(itemInfo.width / container.width),
            heightPer: _.decimalPoint(itemInfo.height / container.height),
          }
          ctx.changeInfo(perInfo)

          Object.assign(zone.style, {
            top: `${itemInfo.top}px`,
            left: `${itemInfo.left}px`,
            width: `${itemInfo.width}px`,
            height: `${itemInfo.height}px`,
          })
        }
        ctx.handlehideZone(false)

        window.removeEventListener('mousemove', handleChange)
        window.removeEventListener('mouseup', handleMouseUp)
      }
    }

    el.__hotzoneResizeDestroy = () => el.removeEventListener('mousedown', handleMouseDown)
    el.addEventListener('mousedown', handleMouseDown, { passive: false })
  },
  beforeUnmount(el) {
    el.__hotzoneResizeDestroy?.()
  },
}
