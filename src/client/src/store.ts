import Vue from 'vue';
import Vuex from 'vuex';
import AccessEndPointRelation from './tracker/accessEndPointRelation';
import AccessPoint from './tracker/accessPoint';
import EndPoint from './tracker/endPoint';

Vue.use(Vuex);

const apDict: { [name: string]: AccessPoint } = { };
const apEpRels: { [epAddr: string]: { [apName: string]: AccessEndPointRelation } } = { };
const epDict: { [addr: string]: EndPoint } = { };

export default new Vuex.Store({

  mutations: {
    /**
     * Adds or updates the relation between an access point and an end point.
     * @param state Storage state.
     * @param rel Relation to add.
     */
    addAccessEndPointRelation(state, rel: AccessEndPointRelation) {
      // Search for relation to end point.
      if (rel.epAddr in state.accessEndPointRelations) {
        // Relation to end point found -> Search for relation to access point.
        const relations = state.accessEndPointRelations[rel.epAddr];

        if (rel.apName in relations) {
          // Relation to access point found -> Update relation.
          relations[rel.apName].update(rel.rssi, rel.timestamp);
        } else {
          // Relation to access point not found -> Add relation.
          relations[rel.apName] = rel;
        }
      } else {
        // Relation to end point not found -> Create relation.
        state.accessEndPointRelations[rel.epAddr] = {
          [rel.apName]: rel,
        };
      }
    },

    /**
     * Adds a new access point.
     * @param state Storage state.
     * @param ap Access point to add.
     */
    addAccessPoint(state, ap: AccessPoint) {
      // Add access point to dictionary of access points indexed by name, overriding older.
      state.accessPoints[ap.name] = ap;
      ap.startListen((data: any) => {
        const value = data.value;

        value.devices.forEach((ep: { addr: string, rssi: number, timestamp: number }) => {
          if (!(ep.addr in state.endPoints)) {
            state.endPoints[ep.addr] = new EndPoint(ep.addr);
          }

          if (ep.addr in state.accessEndPointRelations && data.ap.name in state.accessEndPointRelations[ep.addr]) {
            state.accessEndPointRelations[ep.addr][data.ap.name].update(ep.rssi, ep.timestamp);
          } else {
            const aepr = new AccessEndPointRelation(data.ap.name, ep.addr, ep.rssi, ep.timestamp);
            state.accessEndPointRelations[ep.addr] = {
              [data.ap.name]: aepr,
            };
          }
        });
      });
    },

    /**
     * Adds a new end point.
     * @param state Storage state.
     * @param ep End point to add.
     */
    addEndPoint(state, ep: EndPoint) {
      // Add end point to dictionary of end points indexed by MAC address, overriding older.
      state.endPoints[ep.addr] = ep;
    },

    /**
     * Deletes an access point.
     * @param state Storage state.
     * @param ap Access point to delete.
     */
    deleteAccessPoint(state, ap: AccessPoint) {
      ap.stopListen();
      delete state.accessPoints[ap.name];
    },

    /**
     * Updates the end point dictionary.
     * @param state Storage state.
     * @param eps Updated end point dictionary.
     */
    updateEndPoints(state, eps: { [addr: string]: EndPoint }) {
      state.endPoints = eps;
    },

    /**
     * Updates the access point dictionary.
     * @param state Storage state.
     * @param aps Updated access point dictionary.
     */
    updateAccessPoints(state, aps: { [name: string]: AccessPoint }) {
      state.accessPoints = aps;
    },
  },

  state: {
    /**
     * Dictionary that maps MAC addresses of end points to a dictionary that maps names of access points to the
     * relation between access point and end point.
     */
    accessEndPointRelations: apEpRels,

    /**
     * Dictionary that maps names of access points to their instance.
     */
    accessPoints: apDict,

    /**
     * Dictionary that maps MAC addresses of end points to their instance.
     */
    endPoints: epDict,
  },
});
