<script setup lang="ts">
import { useWebSocket } from "@vueuse/core";
import { watchEffect } from "vue";

defineOptions({
  name: "Welcome"
});

const { status, data, send, open, close } = useWebSocket(
  "ws://localhost:3000/socket"
);
watchEffect(() => {
  if (data) {
    console.log(data.value);
  }
});
</script>

<template>
  <div>
    <h1>教师端</h1>
    <el-button @click="send('我是前端')">点我发送websocket</el-button>
  </div>
</template>
