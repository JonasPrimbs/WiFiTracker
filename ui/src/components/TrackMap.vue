<template>
  <v-stage
      ref="stage"
      :config="size"
      :draggable="true"
      @dragend="onMapDragend"
      @dragstart="onDragStart">
    <v-layer>
      <v-group v-for="ap in accessPoints" :key="ap.name">
        <AccessPointMapElement
            :accessPoint="ap"
            :color="apColor"
            :draggable="accessPointsDraggable"
            :radius="apRadius"
            @dragend="() => { onApDragend(ap); }"
            @dragstart="onDragStart" />
      </v-group>
    </v-layer>
    <v-layer>
      <v-group v-for="ep in endPoints" :key="ep.addr">
        <EndPointMapElement
            v-if="ep.enabled"
            :color="epColor"
            :endPoint="ep"
            :filterMac="filterMac"
            :radius="epRadius" />
      </v-group>
    </v-layer>
  </v-stage>
</template>

<script lang="ts">
import Stage from 'vue-konva';
import { Component, Prop, Vue, Watch } from 'vue-property-decorator';
import AccessPointMapElement from '../components/AccessPointMapElement.vue';
import EndPointMapElement from '../components/EndPointMapElement.vue';
import AccessPoint from '../tracker/accessPoint';
import EndPoint from '../tracker/endPoint';

@Component({
  components: {
    AccessPointMapElement,
    EndPointMapElement,
  },
})
export default class TrackMap extends Vue {

  public $refs!: {
    stage: any,
  };

  /**
   * List of all displayed access points.
   */
  @Prop({ default: [] })
  private accessPoints!: AccessPoint[];

  /**
   * If access points are draggable.
   */
  @Prop({ default: true })
  private accessPointsDraggable!: boolean;

  /**
   * Dictionary of displayed end points.
   */
  @Prop({ default: [] })
  private endPoints!: EndPoint[];

  /**
   * Method to filter mac addresses.
   */
  @Prop({ default: (value: string): string => value })
  private filterMac!: (value: string) => string;

  /**
   * Size of map.
   */
  @Prop({ default: { height: 100, width: 100 } })
  private size!: { height: number, width: number };

  /**
   * Internal data.
   */
  private data() {
    return {
      apColor: '#ff5252',
      apRadius: 10,
      dragStartPosition: {
        x: 0,
        y: 0,
      },
      epColor: '#448aff',
      epRadius: 5,
      mapOffset: {
        x: 0,
        y: 0,
      },
    };
  }

  /**
   * Handles end of access point dragging.
   */
  private onApDragend(ap: AccessPoint) {
    // Get new pointer position.
    const pointerPos = this.$refs.stage.getStage().pointerPos;

    // Calculate new position (current position + move direction).
    const newPos = {
      x: ap.x + pointerPos.x - this.$data.dragStartPosition.x,
      y: ap.y + pointerPos.y - this.$data.dragStartPosition.y,
    };

    // Update access point position.
    this.$store.dispatch('updateAccessPointPosition', { apName: ap.name, x: newPos.x, y: newPos.y });
  }

  /**
   * Handles start of dragging.
   */
  private onDragStart() {
    // Get new pointer position.
    const pointerPos = this.$refs.stage.getStage().pointerPos;

    // Save drag start position to calculate difference in future.
    this.$data.dragStartPosition = pointerPos;
  }

  /**
   * Handles end of map dragging.
   */
  private onMapDragend() {
    // Get new pointer position.
    const pointerPos = this.$refs.stage.getStage().pointerPos;

    // Calculate new offset (current offset + move direction).
    const newPos = {
      x: this.$data.mapOffset.x + pointerPos.x - this.$data.dragStartPosition.x,
      y: this.$data.mapOffset.y + pointerPos.y - this.$data.dragStartPosition.y,
    };

    // Update map offset.
    this.$data.mapOffset = newPos;
  }
}
</script>
