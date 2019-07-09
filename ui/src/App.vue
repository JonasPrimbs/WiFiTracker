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
  @import url('//fonts.googleapis.com/css?family=Roboto:400,500,700,400italic|Material+Icons');
  .app {
    display: flex;
    min-height: 100vh;
  }
</style>
