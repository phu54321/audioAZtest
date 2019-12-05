<template lang='pug'>
#app
  b-loading(:active='!!loadingText')
    .loading-icon
    .loading-text(v-if='loadingText') {{loadingText}}
  section.hero.is-primary
    .hero-body
      .container
        .title
          b-icon.m-r-xs.m-t-xs(icon='ab-testing', size='is-medium')
          b-icon.m-r-md.m-t-xs(icon='volume-high', size='is-medium')
          span 오디오 블라인드 테스트 (w/ ffmpeg)

  .container.has-text-centered.m-t-lg
    b-steps(v-model='activeStep', :has-navigation='false')
      b-step-item(label='Audio')
        .title 1. 음원 파일을 선택하세요
        .file.has-name.flex-centered
          label.file-label
            input.file-input(type='file', name='audio', @change='onFileInput')
            span.file-cta
              b-icon.file-icon(icon='file-upload')
              .file-label 업로드
            span.file-name {{ fileName || '음원파일을 선택하세요' }}

      b-step-item(label='Codec')
        .title 2. 비교할 코덱 2개를 선택하세요

        b-field
          b-select(v-model='pipelines[0]',  placeholder='비교소리 A', expanded)
            option(v-for='pipeline in pipelineList', :value='pipeline', :key='pipeline.name') {{ pipeline.name }}
        b-field
          b-select(v-model='pipelines[1]',  placeholder='비교소리 B', expanded)
            option(v-for='pipeline in pipelineList', :value='pipeline', :key='pipeline.name') {{ pipeline.name }}

        b-button(type='is-primary', :disabled='!isPipelineSelected', @click='prepareAudioTest') 테스트 시작

      b-step-item(label='Blind testing')
        .title 3. 둘 중 더 소리가 좋은걸 선택하세요.

        table.table.is-bordered.margin-center
          tr
            th
              a(href='#', @click='pickShuffledAudio(0)') 1번 선택
            th
              a(href='#', @click='pickShuffledAudio(1)') 2번 선택
          tr
            td.has-text-centered
              div(@click='playShuffledAudio(0)')
                b-icon(icon='play-circle-outline', size='is-large')
              b-tooltip(label='다운로드', direction='is-bottom')
                b-button.m-t-sm(@click='downloadShuffledAudio(0)')
                  b-icon(icon='download', size='is-small')
                  span 다운로드
            td.has-text-centered
              div(@click='playShuffledAudio(1)')
                b-icon(icon='play-circle-outline', size='is-large')
              b-tooltip(label='다운로드', direction='is-bottom')
                b-button.m-t-sm(@click='downloadShuffledAudio(1)')
                  b-icon(icon='download', size='is-small')
                  span 다운로드

        b-slider.m-b-lg(v-model='currentAudioProgress', :tooltip='false')

        .message
          .message-header 결과 요약
          .message-body.has-text-left
            p
              i 파일: {{fileName}}
            p(v-if='isPipelineSelected')
              b.m-r-xs 비교군 A:&nbsp;
              | {{pipelines[0].name}}
            p(v-if='isPipelineSelected')
              b.m-r-xs 비교군 B:&nbsp;
              | {{pipelines[1].name}}

            table.table.is-bordered.is-fullwidth.m-t-md
              th(:colspan='testHistoryGridColumnsPerRow') 테스트 결과
              tr(v-for='row in testHistoryGridRows')
                td.is-w10p.has-text-centered(
                  v-for='col in row',
                  :class='{"grid-bg-A": col === "A", "grid-bg-B": col === "B"}'
                ) {{col}}

</template>

<script lang="ts">

import Vue from 'vue'
import HelloWorld from './components/HelloWorld.vue'
import { createWorker } from './ffmpeg'
import AudioPipelineList from './audioPipeline/list'
import { FFmpegAudioPipeline, applyAudioPipeline } from './audioPipeline'
import { saveAs } from 'file-saver'

const STEP_AUDIO = 0
const STEP_PIPELINE = 1
const STEP_ABTEST = 2

type TestHistoryData = 'A' | 'B'

export default Vue.extend({
  beforeDestroy () {
    this.freeAudio()
  },
  data () {
    return {
      recomputeTick: 0,
      recomputeTickInterval: null as any,

      // Audio selection related
      loadingText: '',
      activeStep: STEP_AUDIO,
      origWavData: null as Uint8Array | null,
      fileName: '',

      // Pipeline related
      pipelines: [null, null] as (FFmpegAudioPipeline | null)[],
      convertedAudios: [] as HTMLAudioElement[],

      // AB test related
      currentTestId: -1,
      currentShuffledAudio: [] as HTMLAudioElement[],
      playingAudio: null as HTMLAudioElement | null,
      shuffledTestAIndex: 0,
      testHistory: [] as TestHistoryData[]
    }
  },
  computed: {
    currentAudioTime (): number {
      this.recomputeTick  // eslint-disable-line
      if (!this.playingAudio) return 0
      return this.playingAudio.currentTime
    },
    currentAudioProgress: {
      get (): number {
        this.recomputeTick  // eslint-disable-line
        if (!this.playingAudio) return 0
        return (this.playingAudio.currentTime / this.playingAudio.duration * 100)
      },
      set (newValue: number) {
        if (!this.playingAudio) return
        if (Math.abs(this.currentAudioProgress - newValue) < 1e-6) return
        this.playingAudio.currentTime = this.playingAudio.duration * newValue / 100
      }
    },
    pipelineList () {
      return AudioPipelineList
    },
    isPipelineSelected (): boolean {
      return !!(this.pipelines[0] && this.pipelines[1])
    },
    testHistoryGridColumnsPerRow () { return 10 },
    testHistoryGridRows (): string[][] {
      const result: string[][] = []
      const { testHistory, testHistoryGridColumnsPerRow } = this
      let i
      for (i = 0; i < testHistory.length; i += testHistoryGridColumnsPerRow) {
        result.push(testHistory.slice(i, i + testHistoryGridColumnsPerRow))
      }
      if (i !== testHistory.length) {
        const lastRow = result[result.length - 1]
        const oldLength = lastRow.length
        lastRow.length = testHistoryGridColumnsPerRow
        lastRow.fill('', oldLength, testHistoryGridColumnsPerRow)
      }
      return result
    },

    // Test related
    testACount (): number {
      return this.testHistory.filter(x => x === 'A').length
    },
    testBCount (): number {
      return this.testHistory.filter(x => x === 'B').length
    },
    testTotalCount (): number {
      return this.testACount + this.testBCount
    }
  },
  created () {
    this.recomputeTickInterval = setInterval(() => {
      this.recomputeTick++
    }, 1 / 30)
  },
  destroyed () {
    clearInterval(this.recomputeTickInterval)
  },
  methods: {
    async freeAudio () {
      for (const audio of this.convertedAudios) {
        audio.pause()
        audio.remove()
      }
      this.convertedAudios = []
      this.currentShuffledAudio = []
    },

    onFileInput (ev: Event) {
      const files = (ev.target as HTMLInputElement).files
      const file = files ? files[0] : null
      if (file) {
        const fileName = file.name
        this.loadingText = 'WAV로 파일 불러들이는 중...'

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
            this.activeStep = STEP_PIPELINE
          } catch (e) {
            // IMPORTANT!
            // To prevent RangeError at createWorker.js you should manually modify
            // d = Uint8Array.from({...data, ~~~~~}); to d = Uint8Array.from(data);
            // at @ffmpeg/ffmpeg/src/createWorker.js
            this.$buefy.dialog.alert({
              title: '음원 로딩에 실패했습니다.',
              message: e.toString()
            })
          } finally {
            this.loadingText = ''
          }
        }
      }
    },

    async prepareAudioTest () {
      this.loadingText = '오디오 변환중...'
      try {
        const promises = this.pipelines.map(async pipeline => applyAudioPipeline(pipeline!, this.origWavData!))
        const converted = await Promise.all(promises)

        this.convertedAudios = converted.map(wav => {
          const audio = new Audio()
          const blob = new Blob([wav], { type: 'audio/wav' })
          const url = window.URL.createObjectURL(blob)
          audio.src = url
          return audio
        })
        this.testHistory = []
        this.activeStep = STEP_ABTEST

        this.initAudioTest()
      } finally {
        this.loadingText = ''
      }
    },

    initAudioTest () {
      const [audioA, audioB] = this.convertedAudios

      this.stopAllAudio()

      if (Math.random() >= 0.5) {
        this.currentShuffledAudio = [audioA, audioB]
        this.shuffledTestAIndex = 0
      } else {
        this.currentShuffledAudio = [audioB, audioA]
        this.shuffledTestAIndex = 1
      }

      this.currentTestId = (Math.random() * 1000000) | 0
    },

    stopAllAudio () {
      for (const audio of this.convertedAudios) {
        audio.pause()
        audio.currentTime = 0
      }
    },

    playShuffledAudio (idx: number) {
      this.stopAllAudio()
      this.playingAudio = this.currentShuffledAudio[idx]
      this.playingAudio.play()
    },

    async downloadShuffledAudio (idx: number) {
      const url = this.currentShuffledAudio[idx].src
      const blob = await fetch(url).then(r => r.blob())
      saveAs(blob, `ABtest_${this.currentTestId}_${idx}.wav`)
    },

    pickShuffledAudio (idx: number) {
      if (this.shuffledTestAIndex === idx) {
        this.testHistory.push('A')
      } else {
        this.testHistory.push('B')
      }

      this.initAudioTest()
    }
  }
})
</script>

<style>
.flex-centered {
  justify-content: center !important;
}

.loading-text {
  position: absolute;
  transform: translateY(70px);
  color: #666;
  font-weight: bold;
}

.margin-center {
  margin: auto;
}

.is-w10p {
  width: 10%;
}

.grid-bg-A {
  background-color: #eeee00;
}

.grid-bg-B {
  background-color: #44ff00;
}

</style>
