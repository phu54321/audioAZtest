<template lang='pug'>
.abtest
  .notification 둘 중 더 소리가 좋은걸 선택하세요.
  table.table.is-bordered.margin-center
    tr
      th
        a(href='#', @click='pickAudio(0)') 1번 선택
      th
        a(href='#', @click='pickAudio(1)') 2번 선택
    tr
      td.has-text-centered
        div(@click='playAudio(0)')
          b-icon(:icon='!audioA.paused ? "pause-circle-outline" : "play-circle-outline"', size='is-large')
      td.has-text-centered
        div(@click='playAudio(1)')
          b-icon(:icon='!audioB.paused ? "pause-circle-outline" : "play-circle-outline"', size='is-large')

  b-slider.m-b-lg(v-model='currentAudioProgress', :tooltip='false')

</template>

<script lang="ts">

import Vue from 'vue'

export default Vue.extend({
  props: {
    audioA: {
      type: HTMLAudioElement,
      required: true
    },
    audioB: {
      type: HTMLAudioElement,
      required: true
    }
  },

  data () {
    return {
      audioTimeUpdateTick: 0,
      recomputeTickInterval: null as any,

      // AB test related
      playingAudio: null as HTMLAudioElement | null
    }
  },
  computed: {
    audios (): HTMLAudioElement[] {
      return [this.audioA, this.audioB]
    },

    currentAudioTime (): number {
      this.audioTimeUpdateTick  // eslint-disable-line
      if (!this.playingAudio) return 0
      return this.playingAudio.currentTime
    },

    currentAudioProgress: {
      get (): number {
        this.audioTimeUpdateTick  // eslint-disable-line
        if (!this.playingAudio) return 0
        return (this.playingAudio.currentTime / this.playingAudio.duration * 100)
      },
      set (newValue: number) {
        if (!this.playingAudio) return
        if (Math.abs(this.currentAudioProgress - newValue) < 1e-6) return
        this.playingAudio.currentTime = this.playingAudio.duration * newValue / 100
      }
    }
  },
  beforeDestroy () {
    this.pauseAudio()
  },
  created () {
    this.recomputeTickInterval = setInterval(() => {
      this.audioTimeUpdateTick++
    }, 1 / 30)
  },
  destroyed () {
    clearInterval(this.recomputeTickInterval)
  },
  methods: {
    pauseAudio () {
      this.audioA.pause()
      this.audioA.currentTime = 0
      this.audioB.pause()
      this.audioB.currentTime = 0
    },

    playAudio (idx: number) {
      const currentAudioTime = this.playingAudio ? this.playingAudio.currentTime : 0
      this.pauseAudio()
      this.playingAudio = this.audios[idx]
      this.playingAudio.currentTime = currentAudioTime
      this.playingAudio.play()
    },

    pickAudio (idx: number) {
      this.pauseAudio()
      this.$emit('pick', idx)
    }
  }
})
</script>

<style>

.margin-center {
  margin: auto;
}

</style>
