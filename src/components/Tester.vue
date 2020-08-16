<template lang='pug'>
.container.has-text-centered.m-t-lg
  ABTestN(v-if='pair', :entry0='testSet.entries[0]', :entry1='testSet.entries[1]', @pick='onPick')
</template>

<script lang="ts">

import { Vue, Component, Prop } from 'vue-property-decorator'
import { TestSet, TestEntry } from '@/testset'
import { mergeSortGenerator, MergeSortGenerator, SortPair } from '@/utils/asyncMergeSort'

import logging from '@/utils/logging'

import ABTestN from '@/components/ABTestN.vue'
import LogView from '@/components/LogView.vue'

@Component({
  components: {
    ABTestN,
    LogView
  }
})
export default class extends Vue {
  @Prop({ required: true }) testSet!: TestSet
  private pair: SortPair<TestEntry> | undefined
  private generator!: MergeSortGenerator<TestEntry>

  created (): void {
    const generator = mergeSortGenerator(this.testSet.entries)
    this.generator = generator
    this.processIterator(generator.next())
  }

  processIterator (iter: IteratorResult<SortPair<TestEntry>, TestEntry[]>): void {
    if (iter.done) {
      this.pair = undefined

      const result = iter.value
      logging.messages.push('=============== Result ===============')
      for (let i = 0; i < result.length; i++) {
        logging.messages.push(` - ${i + 1}: ${result[i].label}`)
      }
      this.$emit('result', result)
    } else {
      const { left, right } = iter.value
      logging.messages.push(`Comparing ${left.label} to ${right.label}`)
      this.pair = iter.value
    }
  }

  onPick (idx: number): void {
    if (idx === 0) {
      this.processIterator(this.generator.next(-1))
    } else {
      this.processIterator(this.generator.next(1))
    }
  }
}
</script>

<style>
</style>
