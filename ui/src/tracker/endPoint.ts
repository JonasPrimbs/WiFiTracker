export default class EndPoint {

  /**
   * MAC address of end point.
   */
  private _addr: string;

  /**
   * If end point is visible on map.
   */
  private _enabled: boolean;

  /**
   * If position is unknown.
   */
  private _unknownPosition: boolean;

  /**
   * X position.
   */
  private _x: number;

  /**
   * Y position.
   */
  private _y: number;

  /**
   * Gets the MAC address of the end point.
   */
  public get addr(): string {
    return this._addr;
  }

  /**
   * Gets if the end point is visible on map.
   */
  public get enabled(): boolean {
    return this._enabled;
  }
  /**
   * Sets if the end point is visible on map.
   */
  public set enabled(value: boolean) {
    this._enabled = value;
  }

  /**
   * Gets if position is unknown.
   */
  public get unknownPosition(): boolean {
    return this._unknownPosition;
  }

  /**
   * Gets the X position.
   */
  public get x(): number {
    return this._x;
  }
  /**
   * Sets the Y position.
   * @param value New Y position.
   */
  public set x(value: number) {
    this._x = value;
  }

  /**
   * Gets the Y position.
   */
  public get y(): number {
    return this._y;
  }
  /**
   * Sets the Y position.
   * @param value New Y position.
   */
  public set y(value: number) {
    this._y = value;
  }

  /**
   * Creates a new end point.
   * @param addr MAC address of end point.
   * @param enabled If end point is visible on map.
   * @param x X position.
   * @param y Y position.
   */
  constructor(addr: string, enabled: boolean = true, x: number = 0, y: number = 0) {
    this._addr = addr;
    this._enabled = enabled;
    this._unknownPosition = true;
    this._x = 0;
    this._y = 0;
  }

  /**
   * Trilaterates the position using the relations to access points.
   * @param values Array of values to trilaterate position.
   * @param getAccessPoint Method, that gets an access point by name.
   */
  public trilateratePosition(values: Array<{ rssi: number, x: number, y: number }>): void {
    // Update if position known.
    this._unknownPosition = values.length <= 0;

    // Create sum of RSSI values.
    let sum = 0;
    let min = 100;
    let max = 0;

    // Calculate sum of RSSI values.
    values.forEach((val) => {
      sum += (val.rssi + 100);
      min = Math.min(min, (val.rssi + 100));
      max = Math.max(max, (val.rssi + 100));
    });

    // Generate temporary result.
    const result = { x: 0, y: 0 };

    // Add weighted positions of access point positions to result.
    values.forEach((i) => {
      const proportion = (i.rssi + 100) / sum;
      result.x += i.x * proportion;
      result.y += i.y * proportion;
    });

    // Update the x and y positions with new trilaterated positions.
    this._x = result.x;
    this._y = result.y;
  }
}
