<template>
  <v-group>
    <v-circle
        :config="circleConfig"
        @dragend="$emit('dragend')"
        @dragstart="$emit('dragstart')"
        @mouseleave="$data.hover = false"
        @mouseover="$data.hover = true" />
    <v-text
        v-if="hover"
        :config="textConfig"
        :text="accessPoint.name" />
  </v-group>
</template>

<script lang="ts">
  import { Component, Prop, Vue } from 'vue-property-decorator';
  import AccessPoint from '../tracker/accessPoint';

  const DEFAULT_COLOR = 'red';
  const DEFAULT_DRAGGABLE = false;
  const DEFAULT_RADIUS = 10;
  const TEXT_HEIGHT = 20;
  const TEXT_WIDTH = 100;

  @Component
  export default class AccessPointElement extends Vue {
    /**
     * Access point to represent.
     */
    @Prop({ default: null })
    private accessPoint!: AccessPoint;

    /**
     * Color of the access point circle.
     */
    @Prop({ default: DEFAULT_COLOR })
    private color!: string;

    /**
     * If position of access point is draggable.
     */
    @Prop({ default: DEFAULT_DRAGGABLE })
    private draggable!: boolean;

    /**
     * Radius of the access point circle.
     */
    @Prop({ default: DEFAULT_RADIUS })
    private radius!: number;

    /**
     * Configuration of circle.
     */
    private get circleConfig() {
      return {
        draggable: this.draggable,
        fill: this.color,
        radius: this.radius,
        x: this.accessPoint.x,
        y: this.accessPoint.y,
      };
    }

    /**
     * Configuration of text.
     */
    private get textConfig() {
      return {
        align: 'center',
        fill: this.color,
        height: TEXT_HEIGHT,
        width: TEXT_WIDTH,
        x: this.accessPoint.x - TEXT_WIDTH * 0.5,
        y: this.accessPoint.y - this.radius * 1.5 - TEXT_HEIGHT,
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
