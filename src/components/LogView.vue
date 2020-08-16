<template lang='pug'>
footer.log-footer
  ul.log-box(v-chat-scroll='{always: false}')
    li.log(v-for='message of messages') {{message}}
</template>

<script lang="ts">

import Vue from 'vue'
import logging from '@/logging'

export default Vue.extend({
  computed: {
    messages (): string[] {
      return logging.messages
    }
  }
})
</script>

<style>

.log-footer {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: 10em;
  background: #eee;
  padding: .5em .5em 0 .5em;
}

.log-box {
  height: 100%;
  overflow: auto;
  word-wrap: normal;

  font-size: .8em;
  font-family: monospace;
}
</style>
