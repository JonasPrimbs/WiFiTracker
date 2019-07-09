<template>
  <v-group>
    <v-circle
        :config="circleConfig"
        @mouseleave="$data.hover = false"
        @mouseover="$data.hover = true" />
    <v-text
        v-if="hover"
        :config="textConfig"
        :text="endPoint.addr" />
  </v-group>
</template>

<script lang="ts">
  import { Component, Prop, Vue } from 'vue-property-decorator';
  import EndPoint from '../tracker/endPoint';

  const DEFAULT_COLOR = 'blue';
  const DEFAULT_RADIUS = 5;
  const TEXT_HEIGHT = 20;
  const TEXT_WIDTH = 150;

  @Component
  export default class EndPointElement extends Vue {
    /**
     * End point to represent.
     */
    @Prop({ default: null })
    private endPoint!: EndPoint;

    /**
     * Color of the end point circle.
     */
    @Prop({ default: DEFAULT_COLOR })
    private color!: string;

    /**
     * Radius of the end point circle.
     */
    @Prop({ default: DEFAULT_RADIUS })
    private radius!: number;

    /**
     * Configuration of circle.
     */
    private get circleConfig() {
      return {
        fill: this.endPoint.unknownPosition ? 'yellow' : this.color,
        radius: this.radius,
        x: this.endPoint.x,
        y: this.endPoint.y,
      };
    }

    /**
     * Configuration of text.
     */
    private get textConfig() {
      return {
        align: 'center',
        fill: this.endPoint.unknownPosition ? 'yellow' : this.color,
        height: TEXT_HEIGHT,
        width: TEXT_WIDTH,
        x: this.endPoint.x - TEXT_WIDTH * 0.5,
        y: this.endPoint.y - this.circleConfig.radius * 1.5 - TEXT_HEIGHT,
      };
    }

    /**
     * Internal data.
     */
    private data() {
      return {
        hover: false,
      };
    }
  }
</script>
