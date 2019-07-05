# WiFiTracker
A Web Application to use ESP32 as a WiFi Tracker

## Live Demo

Klick [here](https://wifi.primbs.dev/) to see a live demo (Google Chrome required for WebBluetooth API).

## Setup

### Setup Arduino IDE

Arduino IDE is required for compiling and uploading ESP32 Firmware to ESP32 Micro Controller.

Therefore, the Arduino Extension for ESP32 by Espressif is required. It can be installed navigating in Arduino IDE to *File > Preferences (Ctrl + Comma)* and adding the following line to Additional Boards Manager URLs:

```https://dl.espressif.com/dl/package_esp32_index.json```

After that, go to *Tools > Board > Boards Manager...*, search for "esp32" and install *esp32 by Espressif Systems*.

Now in *Tools > Board* select your ESP32 board (f.e. ESP32 Dev Module) and make sure you have selected the right COM port in *Tools > Port* (f.e. COM1).
