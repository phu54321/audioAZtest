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
      .title.is-3 1. 음원 파일을 선택하세요

      .file.has-name
        label.file-label
          input.file-input(type='file', name='audio', @change='onFileInput')
          span.file-cta
            b-icon.file-icon(icon='file-upload')
            .file-label 업로드
          span.file-name {{ fileName || '음원파일을 선택하세요' }}

  // 파이프라인 목록
  section.section
    .container
      .title.is-3 2. 비교할 대상 2개를 선택하세요
      b-field
        b-autocomplete(:keep-first='true', :open-on-focus='true', :data='pipelineList', field='name', placeholder='Select sound A', @select='option => selectPipeline(0, option)')
      b-field
        b-autocomplete(:keep-first='true', :open-on-focus='true', :data='pipelineList', field='name', placeholder='Select sound B', @select='option => selectPipeline(1, option)')
</template>

<script lang="ts">

import Vue from 'vue'
import HelloWorld from './components/HelloWorld.vue'
import { createWorker } from './ffmpeg'
import AudioPipelineList from './audioPipeline/list'
import { FFmpegAudioPipeline, applyAudioPipeline } from './audioPipeline'

export default Vue.extend({
  data () {
    return {
      isLoading: false,

      origWavData: null as Uint8Array | null,
      fileName: '',

      pipelines: [null, null] as (FFmpegAudioPipeline | null)[]
    }
  },
  computed: {
    pipelineList () {
      return AudioPipelineList
    },
    isPipelineSelected (): boolean {
      return !!(this.pipelines[0] && this.pipelines[1])
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
