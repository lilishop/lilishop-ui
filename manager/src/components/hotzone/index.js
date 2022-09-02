import hotzone from './components/Hotzone.vue'

hotzone.install = (Vue) => {
  Vue.component(hotzone.name, hotzone)
}

export default hotzone
