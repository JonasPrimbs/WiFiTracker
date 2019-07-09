export default class AccessPoint {

  /**
   * Characteristic of access point.
   */
  private _characteristic: any;

  /**
   * Instance of physical device.
   */
  private _device: any;

  /**
   * If access point is listening on changes.
   */
  private _isListening: boolean = false;

  /**
   * Displayed name of access point.
   */
  private _name: string;

  /**
   * X position of access point on map.
   */
  private _x: number;

  /**
   * Y position of access point on map.
   */
  private _y: number;

  /**
   * Gets the instance of physical device.
   */
  public get device(): any {
    return this._device;
  }

  /**
   * Gets if access point is listening on changes.
   */
  public get isListening(): boolean {
    return this._isListening;
  }

  /**
   * Gets the displayed name.
   */
  public get name(): string {
    return this._name;
  }
  /**
   * Sets the displayed name.
   */
  public set name(value: string) {
    this._name = value;
  }

  /**
   * Gets the X position on map.
   */
  public get x(): number {
    return this._x;
  }
  /**
   * Sets the X position on map.
   * @param value New X position on map.
   */
  public set x(value: number) {
    this._x = value;
  }

  /**
   * Gets the Y position on map.
   */
  public get y(): number {
    return this._y;
  }
  /**
   * Sets the Y position on map.
   * @param value New Y position on map.
   */
  public set y(value: number) {
    this._y = value;
  }

  /**
   * Creates a new access point.
   * @param device Instance of physical device.
   * @param name Displayed name of access point.
   * @param characteristic Characteristic of access point.
   * @param x X position on map.
   * @param y Y position on map.
   */
  constructor(
    device: any,
    name: string,
    characteristic: any,
    x: number = 10,
    y: number = 10,
  ) {
    this._characteristic = characteristic;
    this._device = device;
    this._name = name;
    this._x = x;
    this._y = y;
  }

  /**
   * Starts listening on data changes.
   * @param callback Callback that handles received data.
   */
  public startListen(callback: (data: { ap: AccessPoint, value: any }) => void): void {
    // Set an handler for characteristic value changes.
    this._characteristic.oncharacteristicvaluechanged = (event: Event) => {
      const characteristic: any = event.target;
      const buffer = characteristic.value.buffer;

      // Get data as byte array from buffer.
      const data = new Uint8Array(buffer);

      // Convert byte array to string.
      let str = '';
      data.forEach((byte: number) => {
        str += String.fromCharCode(byte);
      });

      // Parse JSON-String to object and trigger callback with parsed object.
      try {
        const obj = JSON.parse(str);

        callback({
          ap: this,
          value: obj,
        });
      } catch (e) {
        if (e instanceof SyntaxError) {
          console.error('Syntax error when parsing access point data. Maybe data was not received completely: ', e);
        } else {
          console.error('Parsing access point data failed for unknown reason: ', e);
        }
      }
    };

    this._isListening = true;
  }

  /**
   * Stops listening on data changes.
   */
  public stopListen(): void {
    this._characteristic.oncharacteristicvaluechanged = null;
    this._isListening = false;
  }
}
