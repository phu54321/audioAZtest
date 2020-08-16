<template lang='pug'>
.test-editor.has-text-justified
  b-field(label="케이스 제목")
    b-input(v-model="testJson.label", placeholder='제목 없음')

  table.table.is-fullwidth.is-hoverable
    tr.thead
      th 케이스 제목
      th 사운드 파일 URL
      th 음량 (0-1)
      th
    tr(v-for='entry, idx of testJson.entries')
      td
        b-input(v-model="entry.label", placeholder='제목 없음')
      td
        b-input(v-model="entry.url", placeholder='https://')
      td
        b-slider(v-model="entry.volume", :min='0', :max='1', :step='0.01')
      td(@click='removeEntry(idx)')
        b-icon(icon='close')

  b-button.is-pulled-right(@click='addEntry')
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
