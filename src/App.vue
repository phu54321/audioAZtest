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

  .container.has-text-centered.m-t-lg(v-if='testReady')
    .title 둘 중 더 소리가 좋은걸 선택하세요.

    ABTest(:audioA='currentShuffledAudio[0]', :audioB='currentShuffledAudio[1]', @pick='onPick')

    .message
      .message-header 결과 요약
      .message-body.has-text-left
        p
          i 파일: {{testSet.label}}
        p
          b.m-r-xs 비교군 A:&nbsp;
          | {{testSet.entries[0].label}}
        p
          b.m-r-xs 비교군 B:&nbsp;
          | {{testSet.entries[1].label}}

        table.table.is-bordered.is-fullwidth.m-t-md
          th(:colspan='testHistoryGridColumnsPerRow') 테스트 결과
          tr(v-for='row in testHistoryGridRows')
            td.is-w10p.has-text-centered(
              v-for='col in row',
              :class='{"grid-bg-A": col === "A", "grid-bg-B": col === "B"}'
            ) {{col}}

  log-view
</template>

<script lang="ts">

import Vue from 'vue'
import logging from '@/logging'
import { loadTestSet, TestSet } from './testset'

import ABTest from '@/components/ABTest.vue'
import LogView from '@/components/LogView.vue'

export type TestHistoryData = 'A' | 'B'

export default Vue.extend({
  components: {
    ABTest,
    LogView
  },
  computed: {
    messages (): string[] {
      return logging
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
    this.loadTestSet('/snd/test.json')
  },
  beforeDestroy () {
    this.freeTestSet()
  },
  data () {
    return {
      loadingText: '',

      // Audio selection related
      testSet: null as TestSet | null,
      testReady: false,

      // AB test related
      currentShuffledAudio: [] as HTMLAudioElement[],
      shuffledTestAIndex: 0,

      testHistory: [] as TestHistoryData[]
    }
  },
  methods: {
    async freeTestSet () {
      if (!this.testSet) return

      for (const { audio } of this.testSet.entries) {
        audio.pause()
        audio.remove()
      }
      this.testSet = null
      this.currentShuffledAudio = []
    },

    async loadTestSet (jsonUrl: string) {
      this.loadingText = '테스트 로딩중...'
      try {
        this.testSet = await loadTestSet(jsonUrl) // TODO: get input
        this.shuffleAudioAndPlay()
      } finally {
        this.loadingText = ''
      }
    },

    shuffleAudioAndPlay () {
      if (!this.testSet) throw new Error('testset not loaded')
      const [entryA, entryB] = this.testSet.entries

      this.resetAllAudio()

      if (Math.random() >= 0.5) {
        this.currentShuffledAudio = [entryA.audio, entryB.audio]
        this.shuffledTestAIndex = 0
      } else {
        this.currentShuffledAudio = [entryB.audio, entryA.audio]
        this.shuffledTestAIndex = 1
      }
      this.testReady = true
    },

    resetAllAudio () {
      if (!this.testSet) throw new Error('testset not loaded')
      this.testReady = false
      for (const { audio } of this.testSet.entries) {
        audio.pause()
        audio.currentTime = 0
      }
    },

    onPick (idx: number) {
      if (this.shuffledTestAIndex === idx) {
        this.testHistory.push('A')
      } else {
        this.testHistory.push('B')
      }

      this.shuffleAudioAndPlay()
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

.log-footer {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: 10em;
  background: #eee;
  padding: .5em .5em 0 .5em;
}

.log-box {
  max-height: 100%;
  overflow: scroll;
  font-size: .8em;
  font-family: monospace;
}
</style>
