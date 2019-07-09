export default class AccessEndPointRelation {

  /**
   * Name of access point.
   */
  private _apName: string;

  /**
   * MAC address of end point.
   */
  private _epAddr: string;

  /**
   * Received Signal Strength Indication.
   */
  private _rssi: number;

  /**
   * Unix timestamp of last contact.
   */
  private _timestamp: number;

  /**
   * Gets the MAC address of the end point.
   */
  public get apName(): string {
    return this._apName;
  }

  /**
   * Gets the name of the access point.
   */
  public get epAddr(): string {
    return this._epAddr;
  }

  /**
   * Gets the Received Signal Strength Indication.
   */
  public get rssi(): number {
    return this._rssi;
  }
  /**
   * Sets the Received Signal Strength Indication.
   * @param value New Received Signal Strength Indication.
   */
  public set rssi(value: number) {
    this._rssi = value;
  }

  /**
   * Gets the unix timestamp of last contact.
   */
  public get timestamp(): number {
    return this._timestamp;
  }
  /**
   * Sets the unix timestamp of last contact.
   * @param value New unix timestamp of last contact.
   */
  public set timestamp(value: number) {
    this._timestamp = value;
  }

  /**
   * Creates a new relation between an access point and an end point.
   * @param apName Name of access point.
   * @param epAddr MAC address of end point.
   * @param rssi Received Signal Strength Indication.
   * @param timestamp Unix timestamp of last contact.
   */
  constructor(apName: string, epAddr: string, rssi: number, timestamp: number = Date.now()) {
    this._apName = apName;
    this._epAddr = epAddr;
    this._rssi = rssi;
    this._timestamp = timestamp;
  }
}
