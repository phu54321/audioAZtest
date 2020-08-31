<template lang='pug'>
.test-editor.has-text-justified
  h1.title [테스트 수정]

  .columns
    .column.is-three-quarters
      b-field(label="테스트 제목")
        b-input(v-model="testJson.label", placeholder='제목 없음')
    .column
      b-field(label="A-B 별 테스트할 횟수")
        b-numberinput(v-model="testJson.comparisonPerPair", :placeholder='1', :step='2')

  b-button.is-pulled-right.m-t-lg(@click='addEntry', data-tooltip='케이스 추가')
    b-icon(icon='plus')

  table.table.is-fullwidth.is-hoverable
    tr.thead
      th 케이스 이름
      th 사운드 파일 URL
      th 음량 (0-1)
      th 삭제
    tr(v-for='entry, idx of testJson.entries')
      td
        b-input(v-model="entry.label", placeholder='제목 없음')
      td
        b-input(v-model="entry.url", placeholder='https://')
      td
        b-slider(v-model="entry.volume", :min='0', :max='1', :step='0.01')
      td(data-tooltip='케이스 삭제')
        b-button(@click='removeEntry(idx)')
          b-icon(icon='close')

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
