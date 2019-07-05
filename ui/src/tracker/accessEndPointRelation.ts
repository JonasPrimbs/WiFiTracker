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
   * Creates a new relation between an access point and an end point.
   * @param apName Name of access point.
   * @param epAddr MAC address of end point.
   * @param rssi Received Signal Strength Indication.
   * @param timestamp Unix timestamp of last contact.
   */
  constructor(apName: string, epAddr: string, rssi: number, timestamp: number) {
    this._apName = apName;
    this._epAddr = epAddr;
    this._rssi = rssi;
    this._timestamp = timestamp;
  }

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
   * Gets the unix timestamp of last contact.
   */
  public get timestamp(): number {
    return this._timestamp;
  }

  /**
   * Updates the rssi and timestamp values.
   * @param rssi Received Signal Strength Indication.
   * @param timestamp Unix timestamp of last contact.
   */
  public update(rssi: number, timestamp: number) {
    this._rssi = rssi;
    this._timestamp = timestamp;
  }
}
