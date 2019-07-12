# WiFi Tracker Firmware
The Firmware for ESP32 to track nearby WiFi devices.

## How it works
The ESP32 scans the WiFi channels for WiFi management frames. It checks if the frames are parts of WiFi probe requests.
Those probe requests are sent by WiFi devices to scan for known SSIDs nearby.

If such a WiFi probe request ist detected, the MAC address of the sender of the request will be logged and sent to a
connected Bluetooth LE client.

Therefore, the ESP32 is running a Bluetooth Low Energy (LE) Server which allows other devices to connect to the ESP32
and get notified if the ESP32 has detected a probe request.

To allow a trilateration of the tracked device, the ESP32 does not only send the MAC address of the tracked WiFi
device, but also the Received Signal Strength Indication (RSSI) value (in range of 0 to -100 dBm) and a timestamp
(relative to ESP32's starting time in milliseconds).

## Setup Arduino IDE
Arduino IDE is recommanded for compiling and uploading ESP32 Firmware to an ESP32 Micro Controller.

Therefore, the Arduino Extension for ESP32 by Espressif is required. It can be installed navigating in Arduino IDE to
*File > Preferences (Ctrl + Comma)* and adding the following line to Additional Boards Manager URLs:

```https://dl.espressif.com/dl/package_esp32_index.json```

After that, go to *Tools > Board > Boards Manager...*, search for "esp32" and install *esp32 by Espressif Systems*.

Now in *Tools > Board* select your ESP32 board (f.e. ESP32 Dev Module) and make sure you have selected the right COM
port in *Tools > Port* (f.e. COM1).

The firmware can now be uploaded to the ESP32 Micro Controller.

## Troubleshooting
If you are not getting `the sketch is too large...`, select *Tools > Board > Partition Scheme > No OTA (2MB APP/2MB SPIFFS)*, this may solve your problem.
