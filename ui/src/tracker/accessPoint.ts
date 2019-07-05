export default class AccessPoint {

  /**
   * Gets the characteristic.
   */
  public get characteristic(): any {
    return this._characteristic;
  }

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
   * Gets the X position on map.
   */
  public get x(): number {
    return this._x;
  }

  /**
   * Gets the Y position on map.
   */
  public get y(): number {
    return this._y;
  }

  /**
   * Characteristics of access point.
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
   * Creates a new access point.
   * @param device Instance of physical device.
   * @param name Displayed name of access point.
   * @param x X position on map.
   * @param y Y position on map.
   */
  constructor(
    device: any,
    name: string,
    characteristics: any,
    x: number = 10,
    y: number = 10,
  ) {
    this._characteristic = characteristics;
    this._device = device;
    this._name = name;
    this._x = x;
    this._y = y;
  }

  /**
   * Starts listening on data changes.
   * @param callback Handles received data.
   */
  public startListen(callback: (data: any) => void): void {
    if (this._isListening) {
      console.error('Allready listening.');
    }

    this.characteristicValueChangedCallback = (event: Event) => {
      const characteristic: any = event.target;
      const buffer = characteristic.value.buffer;
      const data = new Uint8Array(buffer);
      let str = '';
      data.forEach((byte: number) => {
        str += String.fromCharCode(byte);
      });
      const obj = JSON.parse(str);

      callback({
        ap: this,
        value: obj,
      });
    };

    this._isListening = true;
    this._characteristic.oncharacteristicvaluechanged = this.characteristicValueChangedCallback;
  }

  /**
   * Stops listening on data changes.
   */
  public stopListen(): void {
    if (this._characteristic != null) {
      this._characteristic.oncharacteristicvaluechanged = null;
    }
    this._isListening = false;
  }

  /**
   * Updates the position on map.
   * @param x X position on map.
   * @param y Y position on map.
   */
  public updatePosition(x: number, y: number): void {
    this._x = x;
    this._y = y;
  }

  /**
   * Handles characteristic changes.
   * @param event Event that indicates characteristic changes.
   */
  private characteristicValueChangedCallback(event: Event) {
    throw {
      message: 'Not listening',
    };
  }}
