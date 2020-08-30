<template lang='pug'>
#app
  section.hero.is-primary
    .hero-body
      .container
        .title
          b-icon.m-r-xs.m-t-xs(icon='ab-testing', size='is-medium')
          b-icon.m-r-md.m-t-xs(icon='volume-high', size='is-medium')
          span 오디오 블라인드 테스트

          span.has-tooltip-left.button-appmode.is-pulled-right(v-if='appMode == "runner"', @click='setMode("editor")', data-tooltip='블라인드 테스트 수정')
            b-icon(icon='pencil-outline', size='is-medium')
          span.has-tooltip-left.button-appmode.is-pulled-right(v-if='appMode == "editor"', @click='setMode("runner")', data-tooltip='블라인드 테스트 시작')
            b-icon(icon='play-outline', size='is-medium')

  .container.has-text-centered.m-t-lg.p-l-lg.p-r-lg
    test-runner(v-if='appMode == "runner"', :testJson='testJson')
    test-editor(v-else-if='appMode == "editor"', :testJson='testJson')

</template>

<script lang="ts">

import { Vue, Component, Watch } from 'vue-property-decorator'
import { TestEntry, TestJson } from './testset'

import TestRunner from '@/pages/TestRunner.vue'
import TestEditor from '@/pages/TestEditor.vue'

import { p64Encode, p64Decode } from '@/utils/p64'

import './style.scss'

type AppMode = 'runner' | 'editor'

function emptyTestJson (): TestJson {
  return {
    label: '',
    entries: []
  }
}

@Component({
  components: {
    TestRunner,
    TestEditor
  }
})
export default class extends Vue {
  testJson = emptyTestJson()

  testResult: TestEntry[] = []
  appMode: AppMode = 'editor'
  jsonUrl: string | null = null

  mounted (): void {
    if (location.hash) {
      this.testJson = JSON.parse(p64Decode(location.hash.substr(1)))
      if (/[?&]edit/.test(location.search)) {
        this.appMode = 'editor'
      } else {
        this.appMode = 'runner'
      }
    }
  }

  setMode (mode: AppMode): void {
    this.appMode = mode
  }

  @Watch('testJson', { deep: true })
  onTestJsonChange (s: TestJson): void {
    location.href = `#${p64Encode(JSON.stringify(s))}`
  }
}
</script>

<style>
.loading-text {
  position: absolute;
  transform: translateY(70px);
  color: #666;
  font-weight: bold;
}

.button-appmode {
  cursor: pointer;
}
</style>
