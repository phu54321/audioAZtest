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

  .container.has-text-centered.m-t-lg(v-if='testSet')
    tester(:testSet="testSet", @result='showResult')

  log-view
</template>

<script lang="ts">

import { Vue, Component } from 'vue-property-decorator'
import { loadTestSet, TestSet, TestEntry } from './testset'

import ABTest from '@/components/ABTest.vue'
import LogView from '@/components/LogView.vue'
import Tester from '@/components/Tester.vue'

import './style.scss'

export type TestHistoryData = 'A' | 'B'

@Component({
  components: {
    ABTest,
    LogView,
    Tester
  }
})
export default class extends Vue {
  loadingText = ''
  testSet: TestSet | null = null

  mounted (): void {
    this.loadTestSet('/snd/test.json')
  }

  beforeDestroy (): void {
    this.freeTestSet()
  }

  async loadTestSet (jsonUrl: string): Promise<void> {
    this.loadingText = '테스트 로딩중...'
    try {
      this.testSet = await loadTestSet(jsonUrl) // TODO: get input
    } finally {
      this.loadingText = ''
    }
  }

  freeTestSet (): void {
    if (!this.testSet) return

    for (const { audio } of this.testSet.entries) {
      audio.pause()
      audio.remove()
    }
    this.testSet = null
  }

  showResult (result: TestEntry[]): void {
    console.log(result)
  }
}
</script>

<style>
.loading-text {
  position: absolute;
  transform: translateY(70px);
  color: #666;
  font-weight: bold;
}
</style>
