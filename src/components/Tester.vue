<template lang='pug'>
.container.has-text-centered.m-t-lg
  ABTestN(v-if='pair', :entry0='pair.left', :entry1='pair.right', :n='1', @pick='onPick')
</template>

<script lang="ts">

import { Vue, Component, Prop } from 'vue-property-decorator'
import { TestSet, TestEntry } from '@/testset'
import { mergeSortGenerator, MergeSortGenerator, SortPair } from '@/utils/asyncMergeSort'

import logging from '@/utils/logging'

import ABTestN from '@/components/ABTestN.vue'
import LogView from '@/components/LogView.vue'

/**
 * Shuffles array in place.
 * @param {Array} a items An array containing the items.
 */
function shuffle <T> (a: T[]) {
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    const x = a[i]
    a[i] = a[j]
    a[j] = x
  }
  return a
}

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
    const entries = this.testSet.entries
    shuffle(entries)

    const generator = mergeSortGenerator(entries)
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
