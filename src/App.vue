<template lang='pug'>
#app.container
  nav.navbar.is-spaced
    .navbar-brand
      b-icon.m-r-xs.m-t-xs(icon='ab-testing', size='is-medium')
      b-icon.m-r-md.m-t-xs(icon='volume-high', size='is-medium')
      span.title Audio A-Z testing
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import HelloWorld from './components/HelloWorld.vue'

@Component({
  components: {
    HelloWorld
  }
})
export default class App extends Vue {}
</script>

<style>
</style>
