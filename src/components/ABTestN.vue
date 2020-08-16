<template lang='pug'>
.container.has-text-centered.m-t-lg
  ABTest(:audioA='shuffledAudios[0]', :audioB='shuffledAudios[1]', @pick='onPick')
</template>

<script lang="ts">

import { Vue, Component, Prop } from 'vue-property-decorator'
import { TestEntry } from '@/testset'

import logging from '@/utils/logging'

import ABTest from '@/components/ABTest.vue'

@Component({
  components: {
    ABTest
  }
})
export default class extends Vue {
  @Prop({ required: true }) entry0!: TestEntry
  @Prop({ required: true }) entry1!: TestEntry
  @Prop({ default: 3 }) n!: number

  shuffledAudios: HTMLAudioElement[] = []
  shuffledIndexes= [0, 0]
  winCount = [0, 0]

  created (): void {
    this.shuffleAudioAndPlay()
  }

  shuffleAudioAndPlay (): void {
    if (Math.random() >= 0.5) {
      this.shuffledAudios = [this.entry0.audio, this.entry1.audio]
      this.shuffledIndexes = [0, 1]
    } else {
      this.shuffledAudios = [this.entry1.audio, this.entry0.audio]
      this.shuffledIndexes = [1, 0]
    }
  }

  reset (): void {
    this.winCount = [0, 0]
  }

  onPick (idx: number): void {
    const entryIdx = this.shuffledIndexes[idx]
    const pickedEntry = (entryIdx === 0) ? this.entry0 : this.entry1
    Vue.set(this.winCount, entryIdx, this.winCount[entryIdx] + 1)
    logging.messages.push(`Picked ${pickedEntry.label}`)
    console.log(this.winCount, this.n, this.testCount)

    if (this.testCount === this.n) {
      this.onABTestComplete()
    } else {
      this.shuffleAudioAndPlay()
    }
  }

  get testCount (): number {
    return this.winCount[0] + this.winCount[1]
  }

  onABTestComplete (): void {
    if (this.winCount[0] > this.winCount[1]) {
      this.reset()
      logging.messages.push(` - ${this.entry0.label} > ${this.entry1.label}`)
      this.$emit('pick', 0)
    } else {
      this.reset()
      logging.messages.push(` - ${this.entry0.label} < ${this.entry1.label}`)
      this.$emit('pick', 1)
    }
  }
}
</script>

<style>
</style>
