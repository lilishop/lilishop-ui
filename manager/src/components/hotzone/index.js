import hotzone from './index.vue'

hotzone.install = (Vue) => {
  Vue.component(hotzone.name, hotzone)
}

export default hotzone
