<template>
  <Home class="app" />
</template>

<script lang="ts">
  import Home from './views/Home.vue';

  export default {
    components: {
      Home,
    },
  };
</script>

<style lang="scss">
  body {
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", "Oxygen", "Ubuntu", "Helvetica Neue", Arial, sans-serif;
  }
  .app {
    display: flex;
    min-height: 100vh;
  }
</style>
