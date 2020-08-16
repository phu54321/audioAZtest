<template lang='pug'>
.container.has-text-centered.m-t-lg
  .title 둘 중 더 소리가 좋은걸 선택하세요.

  ABTest(:audioA='shuffledAudios[0]', :audioB='shuffledAudios[1]', @pick='onPick')
</template>

<script lang="ts">

import { Vue, Component, Prop } from 'vue-property-decorator'
import { TestSet } from '@/testset'

import logging from '@/logging'

import ABTest from '@/components/ABTest.vue'
import LogView from '@/components/LogView.vue'

@Component({
  components: {
    ABTest,
    LogView
  }
})
export default class extends Vue {
  @Prop({ required: true }) testSet!: TestSet
  shuffledAudios: HTMLAudioElement[] = []
  shuffledIndexes= [0, 0]

  created (): void {
    this.shuffleAudioAndPlay()
  }

  shuffleAudioAndPlay (): void {
    const [entryA, entryB] = this.testSet.entries

    this.resetAllAudio()

    if (Math.random() >= 0.5) {
      this.shuffledAudios = [entryA.audio, entryB.audio]
      this.shuffledIndexes = [0, 1]
    } else {
      this.shuffledAudios = [entryB.audio, entryA.audio]
      this.shuffledIndexes = [1, 0]
    }
  }

  resetAllAudio (): void {
    for (const { audio } of this.testSet.entries) {
      audio.pause()
      audio.currentTime = 0
    }
  }

  onPick (idx: number): void {
    const pickedEntry = this.testSet.entries[this.shuffledIndexes[idx]]
    logging.messages.push(`Picked ${pickedEntry.label}`)
    this.shuffleAudioAndPlay()
  }
}
</script>

<style>
</style>
