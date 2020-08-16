<template lang='pug'>
#app
  b-loading(:active='!!loadingText')
    .loading-icon
    .loading-text(v-if='loadingText') {{loadingText}}

  section.hero.is-primary
    .hero-body
      .container
        .title
          b-icon.m-r-xs.m-t-xs(icon='ab-testing', size='is-medium')
          b-icon.m-r-md.m-t-xs(icon='volume-high', size='is-medium')
          span 오디오 블라인드 테스트

  .container.has-text-centered.m-t-lg.m-l-lg.m-r-lg
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

type AppMode = 'runner' | 'editor' | null

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
  loadingText = ''
  testJson = emptyTestJson()

  testResult: TestEntry[] = []
  appMode: AppMode = 'editor'
  jsonUrl: string | null = null

  mounted (): void {
    if (location.hash) {
      this.testJson = JSON.parse(p64Decode(location.hash.substr(1)))
      this.appMode = 'runner'
    }
  }

  @Watch('testJson', { deep: true })
  onTestJsonChange (s: TestJson): void {
    location.href = `#${p64Encode(JSON.stringify(s))}`
  }

  showResult (result: TestEntry[]): void {
    this.testResult = result
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
</style>
