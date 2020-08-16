<template lang='pug'>
.test-runner
  .title {{testSet.label}}
  tester(:testSet="testSet", @result='showResult')
  b-modal(:active='!!testResult.length', trap-focus, :destroy-on-hide='true', :can-cancel='false')
    result-screen(:result='testResult')

</template>

<script lang="ts">

import { Vue, Component, Prop } from 'vue-property-decorator'
import { TestSet, TestEntry } from '@/testset'

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
  @Prop({ required: true }) testSet!: TestSet
  testResult: TestEntry[] = []

  showResult (result: TestEntry[]): void {
    this.testResult = result
  }
}
</script>
