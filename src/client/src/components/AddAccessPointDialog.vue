<template>
  <md-dialog :md-active.sync="show" @md-closed="handleCancel" @md-opened="requestDevice">
    <md-dialog-title>Add Access Point</md-dialog-title>
    <md-steppers :md-active-step.sync="currentStep" md-linear md-alternative @md-changed="onStepChanged">
      <md-step id="device" md-label="Device" md-description="Select Access Point" :md-done.sync="device" :md-error="deviceError">
        <md-progress-bar md-mode="indeterminate" v-if="selecting"></md-progress-bar>
        <h3>{{ state }}</h3>
        <md-button class="md-raised md-primary" @click="requestDevice">Request again</md-button>
      </md-step>
      <md-step id="edit" md-label="Edit" md-description="Edit Access Point" :md-done.sync="edit">
        <h3>Set a name for Access Point</h3>
        <div class="md-layout-item">
          <md-field>
            <label for="ap-name">Access Point name</label>
            <md-input name="ap-name" id="ap-name" autocomplete="ap-name" v-model="apName" />
          </md-field>
        </div>
        <md-button class="md-raised md-primary" @click="handleApply">Apply</md-button>
      </md-step>
    </md-steppers>
    <md-dialog-actions>
      <md-button class="md-primary" @click="handleCancel">Cancel</md-button>
    </md-dialog-actions>
  </md-dialog>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import AccessEndPointRelation from '../tracker/accessEndPointRelation';
import AccessPoint from '../tracker/accessPoint';

@Component
export default class AddAccessPointDialog extends Vue {

  /**
   * Shows the dialog and asynchronously retuns the access point to add.
   * @returns Promise that returns access point instance and given name.
   */
  public showDialog(): Promise<AccessPoint> {
    // Show the dialog.
    this.$data.show = true;

    // Return promise to return new access point.
    return new Promise((resolve, reject) => {
      // "Subscribe" apply method to resolve the new access point.
      this.onApply = (ap) => {
        resolve(ap);
      };

      // "Subscribe" cancel method to reject if canceled.
      this.onCancel = () => {
        reject();
      };
    });
  }

  /**
   * Connects a device.
   * @param device Bluetooth device to connect with.
   * @param serviceUuid Uuid of service to use.
   * @param characteristicUuid Uuid of characteristic.
   * @param callback Callback indicating progress.
   * @returns Promise that resolves the characteristic.
   */
  private connectDevice(
    device: any,
    serviceUuid: string,
    characteristicUuid: string,
    callback?: (message: string) => void,
  ): Promise<any> {
    return new Promise((resolve, reject) => {
      if (callback != null) {
        callback(`Connecting to device "${ device.name }"...`);
      }

      device.gatt.connect().then((server: any) => {
        if (callback != null) {
          callback('Getting service from device...');
        }

        server.getPrimaryService(serviceUuid).then((service: any) => {
          if (callback != null) {
            callback('Getting characteristics from service...');
          }

          service.getCharacteristic(characteristicUuid).then((characteristic: any) => {
            if (callback != null) {
              callback('Starting notifications...');
            }

            characteristic.startNotifications().then((char: any) => {
              if (callback != null) {
                callback('Notifications started');
              }

              resolve(char);
            }).catch((error: any) => {
              reject({
                error,
                message: 'Starting notifications failed',
              });
            });
          }).catch((error: any) => {
            reject({
              error,
              message: 'Getting characteristics failed',
            });
          });
        }).catch((error: any) => {
          reject({
            error,
            message: 'Getting service failed',
          });
        });
      }).catch((error: any) => {
        reject({
          error,
          message: 'Connecting device failed',
        });
      });
    });
  }

  /**
   * Gets UI relevant data.
   */
  private data() {
    return {
      apDevice: null,
      apName: null,
      currentStep: 'device',
      device: false,
      deviceError: null,
      edit: false,
      selecting: false,
      show: false,
      state: 'Select a tracking device',
    };
  }

  /**
   * Handles apply button click.
   */
  private handleApply(): void {
    // Generate result to return.
    const result = new AccessPoint(
      this.$data.apDevice,
      this.$data.apName,
      this.$data.characteristic,
    );

    // Reset the dialog.
    this.reset();

    // Apply dialog.
    this.onApply(result);
  }

  /**
   * Handles cancellation of dialog.
   */
  private handleCancel(): void {
    // Hide dialog.
    this.$data.show = false;

    // Cancel dialog.
    this.onCancel();
  }

  private onApply(result: AccessPoint): void {
    throw {
      message: 'This method should have been overridden',
    };
  }

  private onCancel(): void {
    throw {
      message: 'This method should have been overridden',
    };
  }

  /**
   * Handles step changes.
   * @param id Identity of new step.
   */
  private onStepChanged(id: string): void {
    switch (id) {
      case 'device':
        // Device selection step -> Request device.
        this.requestDevice();
        this.$data.device = false;
        this.$data.edit = false;
        break;

      case 'edit':
        // Edit selection step -> Ensure that device step was completed.
        if (this.$data.deviceError !== null) {
          this.$data.device = false;
          this.$data.edit = false;
          this.$data.currentStep = 'device';
        }
        break;

      default:
        // Unknown selection step -> Go to device selection step.
        this.$data.currentStep = 'device';
        break;
    }
  }

  /**
   * Requests bluetooth device selection of navigator.
   */
  private requestDevice(): void {
    // Ensure that browser supports WebBluetooth API.
    if (!('bluetooth' in navigator)) {
      this.$data.currentStep = 'device';
      this.$data.deviceError = 'Browser does not support WebBluetooth API';
      this.$data.edit = false;
      this.$data.selecting = false;
      return;
    }

    const primaryServiceUuid = '00002a05-0000-1000-8000-00805f9b34fb';
    const serviceUuid = '1c8be10d-66b7-4ed5-907f-e61915e4d4e9';
    const characteristicUuid = 'dd4dc356-74ef-47d2-80ce-5ca331781979';

    // Visualize that device selection is running.
    this.$data.selecting = true;

    // Request access to device.
    const bluetooth: any = navigator['bluetooth'];
    bluetooth.requestDevice({
      acceptAllDevices: true,
      optionalServices: [
        serviceUuid,
      ],
    }).then((device: any) => {
      this.connectDevice(device, serviceUuid, characteristicUuid, (state: string) => {
        this.$data.state = state;
      }).then((characteristic: any) => {
        // Apply values of connected device.
        this.$data.apDevice = device;
        this.$data.apName = this.$data.apName || device.name;
        this.$data.characteristic = characteristic;

        // Device is selected -> Go to next step.
        this.$data.device = true;
        this.$data.deviceError = null;
        this.$data.selecting = false;
        this.$data.currentStep = 'edit';
      }).catch((error: { message: string, error: any }) => {
        // Error connecting to device -> Show error.
        console.error('Error connecting to tracking device: ', error);
        this.$data.deviceError = error.message;
      });
    }).catch((error: any) => {
      // Device selection was canceled -> Show error.
      console.error('Error selecting tracking device: ', error);
      this.$data.deviceError = 'No tracking device selected';
      this.$data.edit = false;
      this.$data.selecting = false;
      this.$data.currentStep = 'device';
    });
  }

  /**
   * Resets the dialog values.
   */
  private reset(): void {
    this.$data.apDevice = null;
    this.$data.apName = null;
    this.$data.currentStep = 'device';
    this.$data.device = false;
    this.$data.deviceError = null;
    this.$data.edit = false;
    this.$data.selecting = false;
    this.$data.show = false;
    this.$data.state = 'Select a tracking device';
  }
}
</script>
