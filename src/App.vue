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
          span 오디오 블라인드 테스트

  .container.has-text-centered.m-t-lg
    test-runner(v-if='appMode == "runner"', :testSet='testSet')
    div(v-else-if='appMode == "editor"')
      // TODO: add editor here

</template>

<script lang="ts">

import { Vue, Component } from 'vue-property-decorator'
import { loadTestSet, TestSet, TestEntry } from './testset'

import TestRunner from '@/pages/TestRunner.vue'

import './style.scss'

export type TestHistoryData = 'A' | 'B'

type AppMode = 'runner' | 'editor' | null

@Component({
  components: {
    TestRunner
  }
})
export default class extends Vue {
  loadingText = ''
  testSet: TestSet | null = null
  testResult: TestEntry[] = []
  appMode: AppMode = null
  jsonUrl: string | null = null

  mounted (): void {
    const parsed = location.hash ? location.hash.substr(1) : ''
    const jsonUrl = parsed || prompt('테스트 json 파일을 입력하세요')
    if (!jsonUrl) {
      alert('테스트 json이 필요합니다.')
      return
    }

    this.jsonUrl = jsonUrl
    try {
      this.loadTestSet(jsonUrl)
    } catch (e) {
      alert('테스트 파일을 읽을 수 없습니다.')
      throw e
    }
  }

  get permaLink (): string {
    const htmlUrl = window.location.href.split('?')[0].split('#')[0]
    if (!this.jsonUrl) return htmlUrl
    else return `${htmlUrl}#${encodeURIComponent(this.jsonUrl)}`
  }

  beforeDestroy (): void {
    this.freeTestSet()
  }

  async loadTestSet (jsonUrl: string): Promise<void> {
    this.loadingText = '테스트 로딩중...'
    try {
      this.testSet = await loadTestSet(jsonUrl)
      this.appMode = 'runner'
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
    this.testResult = result
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
