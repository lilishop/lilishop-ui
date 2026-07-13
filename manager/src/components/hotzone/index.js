import hotzone from './index.vue'

hotzone.install = (app) => {
  app.component(hotzone.name, hotzone)
}

export default hotzone
