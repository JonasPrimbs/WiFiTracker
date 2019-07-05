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
  .app {
    display: flex;
    min-height: 100vh;
  }
</style>
