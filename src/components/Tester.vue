<template lang='pug'>
.container.has-text-centered.m-t-lg
  .notification 둘 중 더 소리가 좋은걸 선택하세요. (\#{{testNo}})
  ABTestN(v-if='currentComparison', :entry0='currentComparison.left', :entry1='currentComparison.right', :n='1', @pick='onPick')
</template>

<script lang="ts">

import { Vue, Component, Prop } from 'vue-property-decorator'
import { TestSet, TestEntry } from '@/testset'
import { shellSort } from '@/utils/asyncSort'

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

interface PendingComprision {
  left: TestEntry
  right: TestEntry
  resolve: (v: number) => void
}

@Component({
  components: {
    ABTestN,
    LogView
  }
})
export default class extends Vue {
  @Prop({ required: true }) testSet!: TestSet
  private pendingComparisons: PendingComprision[] = []
  private currentComparison: PendingComprision | null = null
  private testNo = 0

  created (): void {
    const entries = this.testSet.entries
    shuffle(entries)

    shellSort(entries, this.comparator).then(this.showResult)
  }

  comparator (left: TestEntry, right: TestEntry): Promise<number> {
    return new Promise(resolve => {
      this.pendingComparisons.push({ left, right, resolve })
      this.runComparisonIfNotRunning()
    })
  }

  showResult (result: TestEntry[]): void {
    logging.messages.push('=============== Result ===============')
    for (let i = 0; i < result.length; i++) {
      logging.messages.push(` - ${i + 1}: ${result[i].label}`)
    }
    this.$emit('result', result)
  }

  runComparisonIfNotRunning (): void {
    if (this.currentComparison) return

    const { pendingComparisons } = this
    if (pendingComparisons.length === 0) return

    this.testNo++

    const pickIndex = Math.random() * pendingComparisons.length | 0
    const comparisonEntry = pendingComparisons.splice(pickIndex, 1)[0]
    const { left, right } = comparisonEntry
    logging.messages.push(`[Test #${this.testNo}] Comparing ${left.label} to ${right.label}`)
    this.currentComparison = comparisonEntry
  }

  onPick (idx: number): void {
    if (!this.currentComparison) return
    const { resolve } = this.currentComparison
    this.currentComparison = null

    if (idx === 0) {
      resolve(-1)
    } else {
      resolve(1)
    }
    setImmediate(this.runComparisonIfNotRunning)
  }
}
</script>

<style>
</style>
