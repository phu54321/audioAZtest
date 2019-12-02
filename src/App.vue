<template lang='pug'>
#app
  nav.navbar.is-spaced
    .navbar-brand
      b-icon.m-r-xs.m-t-xs(icon='ab-testing', size='is-medium')
      b-icon.m-r-md.m-t-xs(icon='volume-high', size='is-medium')
      span.title Audio A-Z testing

  .container
    .file.has-name
      label.file-label
        input.file-input(type='file', name='audio', @change='onFileInput')
        span.file-cta
          b-icon.file-icon(icon='file-upload')
          .file-label Load
        span.file-name {{ file ? file.name : 'Choose an input audio' }}

</template>

<script lang="ts">
import Vue from 'vue'
import HelloWorld from './components/HelloWorld.vue'

export default Vue.extend({
  data () {
    return {
      file: null as File | null
    }
  },
  methods: {
    onFileInput (ev: Event) {
      const files = (ev.target as HTMLInputElement).files
      this.file = files ? files[0] : null
    }
  }
})
</script>

<style>
</style>
