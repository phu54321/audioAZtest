<template lang='pug'>
ul.log-box(v-chat-scroll='{always: false}')
  li.log(v-for='message of messages') {{message}}
</template>

<script lang="ts">

import Vue from 'vue'
import logging from '@/utils/logging'

export default Vue.extend({
  computed: {
    messages (): string[] {
      return logging.messages
    }
  }
})
</script>

<style>

.log-box {
  overflow-y: scroll;
  word-wrap: normal;

  font-size: .8em;
  font-family: monospace;

  padding: .3em .5em;
}
</style>
