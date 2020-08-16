<template lang='pug'>
.abtest
  table.table.is-bordered.margin-center
    tr
      th(@click='pickAudio(0)') 1번 선택
      th(@click='pickAudio(1)') 2번 선택
    tr
      td.has-text-centered
        div(@click='playAudio(0)')
          b-icon(:icon='!audioA.paused ? "pause-circle-outline" : "play-circle-outline"', size='is-large')
      td.has-text-centered
        div(@click='playAudio(1)')
          b-icon(:icon='!audioB.paused ? "pause-circle-outline" : "play-circle-outline"', size='is-large')

  b-slider.m-b-lg.m-l-lg.m-r-lg(v-model='currentAudioProgress', :tooltip='false')

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
      playingAudio: null as HTMLAudioElement | null,
      anchorTime: null as number | null
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
        this.anchorTime = this.playingAudio.currentTime = this.playingAudio.duration * newValue / 100
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
      this.pauseAudio()
      this.playingAudio = this.audios[idx]
      this.playingAudio.currentTime = this.anchorTime || 0
      this.playingAudio.play()
    },

    pickAudio (idx: number) {
      this.pauseAudio()
      this.anchorTime = null
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
