<template lang='pug'>
.test-runner
  b-loading(:active='!!loadingText')
    .container.loading-text {{loadingText}}
      ul
        li.m-b-xs(v-for='(progress, url) of updateProgress')
          b-progress(:value='progress', type="is-info", size='is-medium', show-value) {{url}}

  div(v-if='testSet')
    .title {{testSet.label}}
    tester(:testSet="testSet", @result='showResult')
    b-modal(:active='!!testResult.length', trap-focus, :destroy-on-hide='true', :can-cancel='false')
      result-screen(:result='testResult')

</template>

<script lang="ts">

import { Vue, Component, Prop } from 'vue-property-decorator'
import { TestSet, TestEntry, loadTestSet, TestJson } from '@/testset'

import Tester from '@/components/Tester.vue'
import ResultScreen from '@/components/ResultScreen.vue'

export type TestHistoryData = 'A' | 'B'

type AppMode = 'runner' | 'editor' | null

@Component({
  components: {
    Tester,
    ResultScreen
  }
})
export default class extends Vue {
  @Prop({ required: true }) testJson!: TestJson
  loadingText = ''
  updateProgress = {} as {[url: string]: number}
  testSet: TestSet| null = null
  testResult: TestEntry[] = []

  async created (): Promise<void> {
    this.loadingText = '테스트 로딩중...'
    try {
      this.updateProgress = {}
      this.testSet = await loadTestSet(this.testJson, (url, progress) => {
        this.$set(this.updateProgress, url, progress)
      })
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
