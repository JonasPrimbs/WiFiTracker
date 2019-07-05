<template>
  <v-stage ref="stage"
           :config="size"
           :draggable="true"
           @dragend="onMapDragend"
           @dragstart="onDragStart">
    <v-layer>
      <v-group v-for="ap in accessPoints" :key="ap.name">
        <AccessPointMapElement :accessPoint="ap"
                               :color="apColor"
                               :draggable="!lockAccessPoints"
                               :radius="apRadius"
                               @dragend="() => { onApDragend(ap); }"
                               @dragstart="onDragStart" />
      </v-group>
    </v-layer>
    <v-layer>
      <v-group v-for="ep in endPoints" :key="ep.addr">
        <EndPointMapElement v-if="ep.enabled"
                            :accessPointRelations="getAccessPointRelations(ep.addr)"
                            :accessPoints="accessPoints"
                            :color="epColor"
                            :endPoint="ep"
                            :radius="epRadius" />
      </v-group>
    </v-layer>
  </v-stage>
</template>

<script lang="ts">
import Stage from 'vue-konva';
import { Component, Prop, Vue } from 'vue-property-decorator';
import AccessPointMapElement from '../components/AccessPointMapElement.vue';
import EndPointMapElement from '../components/EndPointMapElement.vue';
import AccessEndPointRelation from '../tracker/accessEndPointRelation';
import AccessPoint from '../tracker/accessPoint';
import EndPoint from '../tracker/endPoint';

@Component({
  components: {
    AccessPointMapElement,
    EndPointMapElement,
  },
})
export default class TrackMap extends Vue {

  public $refs!: { stage: any };

  /**
   * Dictionary of relations between access points and end points.
   */
  @Prop({ default: {} })
  private accessEndPointRelations!: { [addr: string]: { [name: string]: AccessEndPointRelation } };

  /**
   * Dictionary of displayed access points.
   */
  @Prop({ default: 'accessPoints' })
  private accessPoints!: { [name: string]: AccessPoint };

  /**
   * Dictionary of displayed end points.
   */
  @Prop({ default: {} })
  private endPoints!: { [addr: string]: EndPoint };

  /**
   * If access points are locked.
   */
  @Prop({ default: true })
  private lockAccessPoints!: boolean;

  /**
   * Size of map.
   */
  @Prop({ default: { height: 100, width: 100 } })
  private size!: { height: number, width: number };

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
   * Gets the relations to access points by end point's MAC address.
   */
  private getAccessPointRelations(epAddr: string) {
    // Ensure that relation to requested end point exists.
    if (epAddr in this.accessEndPointRelations) {
      // Relation found -> Return it.
      return this.accessEndPointRelations[epAddr];
    } else {
      // No relation found -> Return empty.
      return {};
    }
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
    ap.updatePosition(newPos.x, newPos.y);
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
