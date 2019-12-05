import Vue from 'vue'
import App from './App.vue'

import Buefy from 'buefy'
import 'buefy/dist/buefy.css'
import './spacing.scss'
import '@mdi/font/css/materialdesignicons.min.css'

const VueChatScroll = require('vue-chat-scroll')

Vue.use(Buefy)
Vue.use(VueChatScroll)

Vue.config.productionTip = false

new Vue({
  render: h => h(App)
}).$mount('#app')
