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
        span.file-name {{ filename || 'Choose an input audio' }}

</template>

<script lang="ts">

import Vue from 'vue'
import HelloWorld from './components/HelloWorld.vue'
import { createWorker } from './ffmpeg'

export default Vue.extend({
  data () {
    return {
      fileData: null as Uint8Array | null,
      filename: ''
    }
  },
  methods: {
    onFileInput (ev: Event) {
      const files = (ev.target as HTMLInputElement).files
      const file = files ? files[0] : null
      if (file) {
        this.filename = file.name

        const reader = new FileReader()
        reader.readAsArrayBuffer(file)
        reader.onload = async () => {
          const fileData = new Uint8Array(reader.result as ArrayBuffer)
          this.fileData = fileData

          console.log('Creating worker')
          const worker = await createWorker()
          console.log('Writing to fs')
          await worker.write('test.avi', fileData)
          console.log('Reading to fs')
          const { data } = await worker.read('test.avi')
          console.log(data)
        }
      }
    }
  }
})
</script>

<style>
</style>
