<template>
  <md-app class="home">
    <md-app-drawer :md-active.sync="menuVisible">
      <md-toolbar class="md-transparent" :md-elevation="1">
        <md-button class="md-icon-button" @click="menuVisible = !menuVisible">
          <md-icon>menu</md-icon>
        </md-button>
        <span class="md-title">WiFi Tracker</span>
      </md-toolbar>

      <md-tabs md-alignment="centered">
        <md-tab id="ep" md-label="End Points">
          <md-empty-state
              md-description="No End Points detected yet."
              md-icon="smartphone"
              md-label="No End Point found"
              v-if="endPoints.length === 0" />

          <md-list v-if="endPoints.length !== 0">
            <md-list-item v-for="ep in endPoints" :key="ep.addr">
              <md-icon>smartphone</md-icon>
              <span class="md-list-item-text">{{ ep.addr }}</span>
              <md-switch class="md-list-action" v-model="ep.enabled" />
            </md-list-item>
          </md-list>
        </md-tab>

        <md-tab id="ap" md-label="Access Points">
          <md-empty-state
              md-description="Click the + Button to add an Access Point."
              md-icon="portable_wifi_off"
              md-label="No Access Point connected"
              v-if="accessPoints.length === 0" />

          <md-list v-if="accessPoints.length !== 0">
            <md-list-item v-for="ap in accessPoints" :key="ap.name">
              <md-icon>wifi_tethering</md-icon>
              <span class="md-list-item-text">{{ ap.name }}</span>
              <md-button class="md-icon-button md-list-action" @click="deleteAP(ap)">
                <md-icon>delete</md-icon>
              </md-button>
            </md-list-item>
          </md-list>

          <md-button class="md-icon-button" @click="showAPDialog">
            <md-icon>add</md-icon>
          </md-button>
        </md-tab>

        <md-tab id="options" md-label="Options">
          <md-list>
            <md-list-item>
              <md-icon>lock</md-icon>
              <span class="md-list-item-text">Lock Access Point positions</span>
              <md-switch class="md-list-action" v-model="lockAccessPoints" />
            </md-list-item>
            <md-list-item>
              <md-button @click="clearEndPoints">Clear End Points</md-button>
            </md-list-item>
          </md-list>
        </md-tab>
      </md-tabs>
    </md-app-drawer>

    <md-app-content class="content">
      <md-button class="md-icon-button menu-btn" @click="menuVisible = !menuVisible">
        <md-icon>menu</md-icon>
      </md-button>

      <TrackMap
          :accessPoints="accessPoints"
          :accessPointsDraggable="!lockAccessPoints"
          :endPoints="endPoints"
          :size="{ height: windowHeight, width: windowWidth }" />

      <AddAccessPointDialog ref="apDialog" />

      <md-snackbar md-position="center" md-persistent :md-active.sync="showSnackbar">
        <span>{{ snackbarMessage }}</span>
        <md-button class="md-primary" @click="showSnackbar = false">
          <md-icon>close</md-icon>
        </md-button>
      </md-snackbar>
    </md-app-content>
  </md-app>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import AddAccessPointDialog from '../components/AddAccessPointDialog.vue';
import TrackMap from '../components/TrackMap.vue';
import AccessEndPointRelation from '../tracker/accessEndPointRelation';
import AccessPoint from '../tracker/accessPoint';
import EndPoint from '../tracker/endPoint';

@Component({
  components: {
    AddAccessPointDialog,
    TrackMap,
  },
})
export default class Home extends Vue {

  /**
   * Defines references.
   */
  public $refs!: {
    apDialog: AddAccessPointDialog,
  };

  /**
   * Gets a list of all access points.
   */
  private get accessPoints(): AccessPoint[] {
    return this.$store.getters.accessPoints;
  }

  /**
   * Gets a list of all end points.
   */
  private get endPoints(): EndPoint[] {
    return this.$store.getters.endPoints;
  }

  /**
   * Unsubscribes all events before destorying home component.
   */
  private beforeDestroy() {
    window.removeEventListener('resize', this.onWindowSizeChange);
  }

  /**
   * Removes all end points.
   */
  private clearEndPoints() {
    this.$store.dispatch('clearEndPoints');
  }

  /**
   * Gets the variable data.
   */
  private data() {
    return {
      lockAccessPoints: false,
      menuVisible: false,
      showSnackbar: false,
      snackbarMessage: null,
      windowHeight: document.documentElement.clientHeight,
      windowWidth: document.documentElement.clientWidth,
    };
  }

  /**
   * Deletes an access point.
   * @param ap Access point to delete.
   */
  private deleteAP(ap: AccessPoint) {
    this.$store.dispatch('deleteAccessPoint', ap).then(() => {
      this.showMessage(`Access Point "${ ap.name }" deleted`);
    });
  }

  /**
   * Subscribes all events.
   */
  private mounted() {
    this.$nextTick(function() {
      window.addEventListener('resize', this.onWindowSizeChange);
    });
  }

  /**
   * Handles changed window size.
   * @param event Window resize event.
   */
  private onWindowSizeChange(event: any) {
    this.$data.windowHeight = document.documentElement.clientHeight;
    this.$data.windowWidth = document.documentElement.clientWidth;
  }

  /**
   * Shows the access point dialog.
   */
  private showAPDialog(): void {
    this.$refs.apDialog.showDialog().then((ap: AccessPoint) => {
      this.showMessage('Access Point "' + ap.name + '" was added');
      this.$store.dispatch('addAccessPoint', ap).then(() => {
        this.showMessage(`Access Point "${ ap.name }" added`);
      });
    }).catch((error) => {
      console.error(error);
      this.showMessage('Device selection was cancelled');
    });
  }

  /**
   * Shows a message in the snack bar.
   * @param message Message to show.
   */
  private showMessage(message: string): void {
    // Set message to snackbar.
    this.$data.snackbarMessage = message;

    // Show snackbar.
    this.$data.showSnackbar = true;
  }
}
</script>

<style scoped lang="scss">
  .content {
    bottom: 0;
    left: 0;
    padding: 0;
    position: fixed;
    right: 0;
    top: 0;
  }
  .menu-btn {
    left: 1em;
    position: fixed;
    top: 1em;
  }
</style>
