<template lang='pug'>
#app
  b-loading(:active='isLoading')
  section.hero.is-primary
    .hero-body
      .container
        .title
          b-icon.m-r-xs.m-t-xs(icon='ab-testing', size='is-medium')
          b-icon.m-r-md.m-t-xs(icon='volume-high', size='is-medium')
          span 오디오 블라인드 테스트 (w/ ffmpeg)

  // 음원 선택부
  section.section
    .container
      h1.title 1. 음원 파일을 선택하세요

      .file.has-name
        label.file-label
          input.file-input(type='file', name='audio', @change='onFileInput')
          span.file-cta
            b-icon.file-icon(icon='file-upload')
            .file-label Load
          span.file-name {{ fileName || 'Choose an input audio' }}

  // 음원
</template>

<script lang="ts">

import Vue from 'vue'
import HelloWorld from './components/HelloWorld.vue'
import { createWorker } from './ffmpeg'

export default Vue.extend({
  data () {
    return {
      isLoading: false,

      origWavData: null as Uint8Array | null,
      fileName: ''
    }
  },
  methods: {
    onFileInput (ev: Event) {
      const files = (ev.target as HTMLInputElement).files
      const file = files ? files[0] : null
      if (file) {
        const fileName = file.name
        this.isLoading = true

        // Read & convert to WAV
        const reader = new FileReader()
        reader.readAsArrayBuffer(file)
        reader.onload = async () => {
          try {
            const fileData = reader.result as ArrayBuffer
            const ext = fileName.slice(fileName.search('\\.') || fileName.length)

            const worker = await createWorker()
            await worker.writeText(`rawInput${ext}`, new Uint8Array(fileData))
            await worker.run(`-i rawInput${ext} input.wav`)
            const { data } = await worker.read('input.wav')
            worker.worker.terminate()

            this.origWavData = data
            this.fileName = fileName
          } catch (e) {
            // IMPORTANT!
            // To prevent RangeError at reateWorker.js you should manually modify
            // d = Uint8Array.from({...data, ~~~~~}); to d = Uint8Array.from(data);
            // at @ffmpeg/ffmpeg/src/createWorker.js
            this.$buefy.dialog.alert({
              title: '음원 로딩에 실패했습니다.',
              message: e.toString()
            })
          } finally {
            this.isLoading = false
          }
        }
      }
    }
  }
})
</script>

<style>
</style>
