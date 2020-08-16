<template lang='pug'>
.container.has-text-centered.m-t-lg
  ABTestN(:entry0='testSet.entries[0]', :entry1='testSet.entries[1]', @pick='onPick')
</template>

<script lang="ts">

import { Vue, Component, Prop } from 'vue-property-decorator'
import { TestSet } from '@/testset'

import logging from '@/logging'

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
  shuffledAudios: HTMLAudioElement[] = []
  shuffledIndexes= [0, 0]

  onPick (idx: number): void {
    const pickedEntry = this.testSet.entries[this.shuffledIndexes[idx]]
    logging.messages.push(`[abtestn] Picked ${pickedEntry.label}`)
  }
}
</script>

<style>
</style>
