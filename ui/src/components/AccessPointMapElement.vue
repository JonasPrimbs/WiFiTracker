<template>
  <v-group>
    <v-circle :config="circleConfig" @dragend="onDragend" @mouseover="onMouseover" @mouseleave="onMouseleave" />
    <v-text :config="textConfig" :text="accessPoint.name" ref="text" v-if="hover" />
  </v-group>
</template>

<script lang="ts">
  import { Component, Prop, Vue } from 'vue-property-decorator';
  import AccessPoint from '../tracker/accessPoint';

  @Component
  export default class AccessPointElement extends Vue {

    /**
     * The access point to represent.
     */
    @Prop({ default: null })
    private accessPoint!: AccessPoint;

    /**
     * Color of the access point.
     */
    @Prop({ default: 'red' })
    private color!: string;

    /**
     * If access point is draggable.
     */
    @Prop({ default: false })
    private draggable!: boolean;

    /**
     * Radius of the access point.
     */
    @Prop({ default: 10 })
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
      const height = 20;
      const width = 100;

      return {
        align: 'center',
        fill: this.color,
        width,
        x: this.circleConfig.x - width * 0.5,
        y: this.circleConfig.y - this.circleConfig.radius * 1.5 - height,
      };
    }

    private data() {
      return {
        hover: false,
      };
    }

    /**
     * Handles end of circle drag.
     */
    private onDragend() {
      this.$emit('dragend');
    }

    /**
     * Handles start of mouse over.
     */
    private onMouseover() {
      this.$data.hover = true;
    }

    /**
     * Handles end of mouse over.
     */
    private onMouseleave() {
      this.$data.hover = false;
    }
  }
</script>
