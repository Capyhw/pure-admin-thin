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
    <h1>Pure-Admin-Thin（非国际化版本）</h1>
    <el-button @click="send('我是前端')">点我发送websocket</el-button>
  </div>
</template>
