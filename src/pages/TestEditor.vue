<template lang='pug'>
nav.test-editor.panel
  p.panel-heading
    b-input(v-model="testJson.label", placeholder='테스트 제목')

  a.panel-block(v-for='entry, idx of testJson.entries')
    .entry-editor-body.has-text-justified
      b-button.is-pulled-right(@click='removeEntry(idx)')
        b-icon(icon='close')
      b-field.m-t-md(label="케이스 제목")
        b-input(v-model="entry.label", placeholder='제목 없음')
      b-field(label="사운드 파일 URL")
        b-input(v-model="entry.url", placeholder='https://')
      b-field(label="(필요 시) 재생할 음량%")
        b-slider(v-model="entry.volume", :min='0', :max='1', :step='0.01')

  b-button.m-t-sm.is-pulled-right(@click='addEntry')
    b-icon(icon='plus')

</template>

<script lang="ts">

import { Vue, Component, Prop } from 'vue-property-decorator'
import { TestJson } from '@/testset'

export type TestHistoryData = 'A' | 'B'

type AppMode = 'runner' | 'editor' | null

@Component
export default class extends Vue {
  @Prop({ required: true }) testJson!: TestJson

  addEntry (): void {
    this.testJson.entries.push({
      label: '',
      url: '',
      volume: 1
    })
  }

  removeEntry (idx: number): void {
    this.testJson.entries.splice(idx, 1)
  }
}
</script>

<style>

.entry-editor-body {
  width: 100%;
}

</style>
