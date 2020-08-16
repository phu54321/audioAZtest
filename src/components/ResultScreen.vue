<template lang='pug'>
b-message(title='결과', type='is-info', :closable='false')
  .content
    b
      i 좋은 순에서 나쁜 순으로
    ol
      li(v-for='entry in result') {{entry.label}}

  log-view.log-view
</template>

<script lang="ts">

import { Vue, Prop, Component } from 'vue-property-decorator'
import { TestEntry } from '@/testset'
import LogView from '@/components/LogView.vue'

@Component({
  components: {
    LogView
  }
})
export default class extends Vue {
  @Prop({ required: true }) result!: TestEntry[]
}
</script>

<style scoped>

.log-view {
  height: 20em;
  background: #eee;
  margin: .3em;
}

</style>
