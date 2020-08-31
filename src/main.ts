import Vue from 'vue'
import App from './App.vue'

import Buefy from 'buefy'
import './bulma.scss'
import './spacing.scss'
import '@mdi/font/css/materialdesignicons.min.css'
import '@creativebulma/bulma-tooltip/dist/bulma-tooltip.min.css'

// eslint-disable-next-line @typescript-eslint/no-var-requires
const VueChatScroll = require('vue-chat-scroll')

Vue.use(Buefy)
Vue.use(VueChatScroll)

Vue.config.productionTip = false

new Vue({
  render: h => h(App)
}).$mount('#app')
