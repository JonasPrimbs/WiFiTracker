/**
 * WiFi Tracker Firmware
 *
 * Scans for WiFi probe requests to track nearby WiFi devices and sends a list of tracked MAC addresses to a connected
 * Bluetooth LE device.
 *
 * This file is part of the WiFi Tracker project of Jonas Primbs.
 * The full code of this project can be found in the official GitHub repository, see
 * <https://www.github.com/JonasPrimbs/WiFiTracker/>
 *
 * @file wifi-tracker-firmware.ino
 * @author Jonas Primbs
 * @contact mail@jonasprimbs.de
 */

#include <BLE2902.h>
#include <BLEDevice.h>
#include <BLEServer.h>
#include <BLEUtils.h>
#include <WiFi.h>
#include <Wire.h>
#include "esp_wifi.h"


// Baud rate for serial communication.
#define BAUD_RATE 115200

// UUIDs generated with https://www.uuidgenerator.net/version4
#define BLE_DEVICE_NAME "WiFi Tracker"
#define BLE_SERVICE_UUID "1c8be10d-66b7-4ed5-907f-e61915e4d4e9"
#define BLE_CHARACTERISTIC_UUID "dd4dc356-74ef-47d2-80ce-5ca331781979"
#define BLE_CHARACTERISTIC_PROPERTIES BLECharacteristic::PROPERTY_READ | BLECharacteristic::PROPERTY_WRITE | BLECharacteristic::PROPERTY_NOTIFY | BLECharacteristic::PROPERTY_INDICATE

// Time to scan each channel (in ms).
#define CHANNEL_TIME 200

// Number of highest WiFi Channel to scan (EU = 13, JP = 14, US = 11).
#define MAX_CHANNEL 13


// Maximum number of devices to store.
const unsigned int MAX_DEVICE_COUNT = 100;


// Filter to handle only necessary WiFi frames.
const wifi_promiscuous_filter_t filt = {
  .filter_mask = WIFI_PROMIS_FILTER_MASK_MGMT | WIFI_PROMIS_FILTER_MASK_DATA
};


// Structure to cast MAC addresses.
typedef struct {
  uint8_t mac[6];
} __attribute__((packed)) MacAddr;

// Structure to cast WiFi management headers.
typedef struct {
  int16_t fctl;
  int16_t duration;
  MacAddr da;
  MacAddr sa;
  MacAddr bssid;
  int16_t seqctl;
  unsigned char payload[];
} __attribute__((packed)) WifiMgmtHdr;

// Structure that defines tracked WiFi devices.
struct Device {
  char addr[17];
  int rssi;
  long timestamp;
};


// Indicates, if Bluetooth LE device is connected.
bool bleConnected = false;

// Currently scanned WiFi channel.
int currentChannel = 1;

// Buffer for tracked devices.
Device devices[MAX_DEVICE_COUNT];

// Number of tracked devices.
int deviceCount = 0;

// Indicates, if old Bluetooth LE device is connected.
bool oldBleConnected = false;

// Pointer to Bluetooth LE Advertiser.
BLEAdvertising* pAdvertising = NULL;

// Pointer to Bluetooth LE Characteristic that sends the device list.
BLECharacteristic* pCharacteristic = NULL;

// Pointer to Bluetooth LE Server instance.
BLEServer* pServer = NULL;

// Pointer to Bluetooth LE Service instance.
BLEService* pService = NULL;


/**
 * Class to handle Bluetooth LE Characteristic Callbacks.
 */
class MyCallbacks: public BLECharacteristicCallbacks {
  /**
   * Handles received data.
   * @param pCharacteristic Pointer to Bluetooth LE Characteristic that received data.
   */
  void onWrite(BLECharacteristic* pCharacteristic) {
    // Get received data as string.
    std::string value = pCharacteristic->getValue();

    // Ensure, that value is not empty.
    if (value.length() > 0) {
      // Print data to console.
      Serial.print("[DEBUG] Data received: ");
      for (int i = 0; i < value.length(); i++) {
        Serial.print(value[i]);
      }
      Serial.println();
    }
  }
};

/**
 * Class to handle Bluetooth LE Server Callbacks.
 */
class MyServerCallbacks: public BLEServerCallbacks {
  /**
   * Handles connected devices.
   * @param pServer Pointer to Bluetooth LE Server that has a new connection.
   */
  void onConnect(BLEServer* pServer) {
    bleConnected = true;
  };

  /**
   * Handles disconnected devices.
   * @param pServer Pointer to Bluetooth LE Server that has was disconnected.
   */
  void onDisconnect(BLEServer* pServer) {
    bleConnected = false;
  }
};


/**
 * Sets up the Bluetooth LE Server.
 */
void setupBLE() {
  Serial.println("[DEBUG] Setting up Bluetooth LE Server...");

  // Define visible device name.
  BLEDevice::init(BLE_DEVICE_NAME);

  // Set device as server.
  pServer = BLEDevice::createServer();
  pServer->setCallbacks(new MyServerCallbacks());

  // Create a service for server and define its Universally Unique Identifier.
  pService = pServer->createService(BLE_SERVICE_UUID);

  // Define service's characteristic.
  pCharacteristic = pService->createCharacteristic(BLE_CHARACTERISTIC_UUID, BLE_CHARACTERISTIC_PROPERTIES);

  // Set the value of characteristic.
  pCharacteristic->setCallbacks(new MyCallbacks());
  pCharacteristic->addDescriptor(new BLE2902());

  // Start the service.
  pService->start();

  // Send advertisements so that client devices can find this server.
  pAdvertising = pServer->getAdvertising();
  pAdvertising->start();

  Serial.println("[DEBUG] Bluetooth LE Server running with name '" + String(BLE_DEVICE_NAME) + "'.");
}

/**
 * Sends a string to a connected Bluetooth LE device.
 * @param body String to send.
 */
void printBLE(String body) {
  if (bleConnected) {
    Serial.println("[DEBUG] Sending message \"" + body + "\" to client...");

    std::string cstring = body.c_str();
    pCharacteristic->setValue(cstring);
    pCharacteristic->notify();

    Serial.println("[DEBUG] Message sent");
  } else {
    Serial.println("[DEBUG] Not connected");
  }
}

void bleUpdate() {
  // disconnecting
  if (!bleConnected && oldBleConnected) {
    delay(500); // give the bluetooth stack the chance to get things ready
    pServer->startAdvertising(); // restart advertising
    Serial.println("start advertising");
    oldBleConnected = bleConnected;
  }

  // connecting
  if (bleConnected && !oldBleConnected) {
    // do stuff here on connecting
    oldBleConnected = bleConnected;
  }
}

String deviceToJson(Device* device);

String deviceToJson(Device* device) {
  String addr(device->addr);
  String result = String("{ \"addr\": \"") + addr + String("\", \"rssi\": ") + String(device->rssi) + String(", \"timestamp\": ") + String(device->timestamp) + String(" }");
  return result;
}

/**
 * Extracts the source MAC address from the WiFi packet payload.
 * 
 * @param payload Pointer to payload of WiFi packet.
 * @return Source MAC address in format 567890ABCDEF
 */
void extractSrcAddr(const uint8_t* payload, char* dst) {
  String preMac;

  // Read MAC address from payload.
  for (int i = 8; i < 8+6+2; i++) {
    // Convert byte to HEX-string.
    String newByte = String(payload[i], HEX);

    // Fill up first HEX-digit if necessary.
    if (newByte.length() == 1) {
      newByte = "0" + newByte;
    }

    // Add HEX-representation of byte to pre MAC.
    preMac += newByte;
  }
  char mac[16];
  preMac.toCharArray(mac, preMac.length());
  // Clean up the mac address.
  int j = 0;
  for (int i = 4; i < 16; i++) {
    dst[j] = mac[i];
    j++;
    if (j == 2 || j == 5 || j == 8 || j == 11 || j == 14) {
      dst[j] = ':';
      j++;
    }
  }
}

/**
 * Adds a device to list of devices or updates its values.
 * 
 * @param addr MAC address of device to update.
 * @param rssi Received Signal Strength Indication of device to update.
 */
void updateDevice(char* addr, int rssi) {
  // Index of found device.
  int index = -1;

  // Search for device in list of devices by MAC address.
  for (int i = 0; i < deviceCount; i++) {
    if (strcmp(devices[i].addr, addr) == 0) {
      // Device found.
      devices[i].rssi = rssi;
      devices[i].timestamp = millis();
      index = i;
      break;
    }
  }

  if (index < 0) {
    // Device is new -> Add to array of devices.

    // Ensure that array of devices is not full.
    if (deviceCount >= MAX_DEVICE_COUNT) {
      Serial.println("[ALERT] Device overflow! List will be cleared and overridden!");
      deviceCount = 0;
    }

    for (int i = 0; i < 17; i++) {
      devices[deviceCount].addr[i] = addr[i];
    }
    devices[deviceCount].timestamp = 0;
    devices[deviceCount].rssi = rssi;

    Serial.println("[DEBUG] Device found: " + deviceToJson(&devices[deviceCount]));

    deviceCount++;
  } else {
    // Device is known -> Update its values.
    devices[index].rssi = rssi;
  }
}

/**
 * Handles sniffed packets.
 * 
 * @param buf  Data received. Type of data in buffer (wifi_promiscuous_pkt_t or wifi_pkt_rx_ctrl_t) indicated by ‘type’ parameter.
 * @param type promiscuous packet type.
 */
void sniffer(void* buf, wifi_promiscuous_pkt_type_t type) {
  // Ensure that buf is type of wifi_promiscuous_pkt_t.
  if (type == WIFI_PKT_MISC) {
    return;
  }

  // Cast buf to wifi_promiscuous_pkt_t.
  wifi_promiscuous_pkt_t *pkt = (wifi_promiscuous_pkt_t*)buf;

  // Get metadata header.
  wifi_pkt_rx_ctrl_t rx_ctrl = pkt->rx_ctrl;

  // Ensure that packet has payload.
  if (rx_ctrl.sig_len - sizeof(WifiMgmtHdr) < 0) {
    return;
  }

  // Get payload of WiFi management frame header.
  WifiMgmtHdr *wh = (WifiMgmtHdr*)pkt->payload;

  char addr[17];
  // Extract source MAC address from packet payload.
  extractSrcAddr(pkt->payload, addr);
  
  // Get Received Signal Strength Indication.
  int rssi = rx_ctrl.rssi;

  // Add the device to list of devices or update its values.
  updateDevice(addr, rssi);
}

String devicesToJson(String trimmer) {
  String result = String("[") + trimmer;
  for (int i = 0; i < deviceCount; i++) {
    String devStr = deviceToJson(&devices[i]);
    result += devStr;
    if (i < deviceCount - 1) {
      result += String(",");
    }
    result += trimmer;
  }
  result += String("]");
  return result;
}

void setupWiFi() {
  Serial.println("[DEBUG] Setting up WiFi...");

  // Setup WiFi in promisuous mode.
  wifi_init_config_t cfg = WIFI_INIT_CONFIG_DEFAULT();
  esp_wifi_init(&cfg);
  esp_wifi_set_storage(WIFI_STORAGE_RAM);
  esp_wifi_set_mode(WIFI_MODE_NULL);
  esp_wifi_start();
  esp_wifi_set_promiscuous(true);
  esp_wifi_set_promiscuous_filter(&filt);
  esp_wifi_set_promiscuous_rx_cb(&sniffer);
  esp_wifi_set_channel(currentChannel, WIFI_SECOND_CHAN_NONE);

  Serial.println("[DEBUG] WiFi is set up.");
}

/*
 * Initializes the controller.
 */
void setup() {
  Serial.begin(BAUD_RATE);

  setupBLE();
  setupWiFi();

  Serial.println("Running...");
}

void loop() {
  Serial.println("[DEBUG] Sniffing channel " + String(currentChannel));

  // Start listen to current channel.
  esp_wifi_set_channel(currentChannel, WIFI_SECOND_CHAN_NONE);

  // Wait until channel is sniffed.
  delay(CHANNEL_TIME);

  if (deviceCount > 0) {
    String message = String("{ \"time\": ") + String(millis()) + String(", \"devices\": ") + devicesToJson(" ") + String(" }");
    printBLE(message);
  }

  bleUpdate();

  deviceCount = 0;

  // Update the current channel.
  currentChannel = (currentChannel % MAX_CHANNEL) + 1;
}
