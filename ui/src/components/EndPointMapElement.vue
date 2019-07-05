<template>
  <v-group>
    <v-circle :config="circleConfig" @mouseover="onMouseover" @mouseleave="onMouseleave" />
    <v-text :config="textConfig" :text="endPoint.addr" ref="text" v-if="hover" />
  </v-group>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import AccessEndPointRelation from '../tracker/accessEndPointRelation';
import AccessPoint from '../tracker/accessPoint';
import EndPoint from '../tracker/endPoint';

@Component
export default class EndPointElement extends Vue {

  /**
   * Relations to access points.
   */
  @Prop({ default: {} })
  private accessPointRelations!: { [name: string]: AccessEndPointRelation };

  /**
   * Access points.
   */
  @Prop({ default: {} })
  private accessPoints!: { [name: string]: AccessPoint };

  /**
   * The end point to represent.
   */
  @Prop({ default: null })
  private endPoint!: EndPoint;

  /**
   * Color of the end point.
   */
  @Prop({ default: 'blue' })
  private color!: string;

  /**
   * Radius of the end point.
   */
  @Prop({ default: 5 })
  private radius!: number;

  /**
   * Configuration of circle.
   */
  private get circleConfig() {
    const position = this.trilateratePosition(this.accessPointRelations, this.accessPoints);

    return {
      fill: this.color,
      radius: this.radius,
      x: position.x,
      y: position.y,
    };
  }

  /**
   * Configuration of text.
   */
  private get textConfig() {
    const height = 20;
    const width = 150;

    return {
      align: 'center',
      fill: this.color,
      height,
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

  /**
   * Trilaterates the position using the relations to access points.
   * @param apRelations Relations to access points.
   */
  private trilateratePosition(
    apRelations: { [name: string]: AccessEndPointRelation },
    accessPoints: { [name: string]: AccessPoint }): { x: number, y: number } {
    // Create sum of RSSI values.
    let sum = 0;

    // Create list of (rssi, x, y) triple.
    const rssis = [];

    for (const apName in apRelations) {
      // Ensure that apName is an existing key.
      if (!apRelations.hasOwnProperty(apName)) {
        continue;
      }

      // Ensure that x and y position of access point is available
      if (!(apName in accessPoints)) {
        continue;
      }

      // Get access point by name.
      const ap = accessPoints[apName];

      // Get relation by access point's name.
      const rel = apRelations[apName];

      // Add values to tiple list
      rssis.push({
        rssi: 100 + rel.rssi,
        x: ap.x,
        y: ap.y,
      });

      // Add RSSI value to RSSI values.
      sum += 100 + rel.rssi;
    }

    // Generate temporary result.
    const result = {
      x: 0,
      y: 0,
    };

    // Add weighted positions of access point positions to result.
    rssis.forEach((i) => {
      const proportion = i.rssi / sum;
      result.x += i.x * proportion;
      result.y += i.y * proportion;
    });

    return result;
  }
}
</script>
