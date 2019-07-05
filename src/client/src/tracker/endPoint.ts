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
   * Creates a new end point.
   * @param addr MAC address of end point.
   * @param enabled If end point is visible on map.
   */
  constructor(addr: string, enabled: boolean = true) {
    this._addr = addr;
    this._enabled = enabled;
  }

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
}
