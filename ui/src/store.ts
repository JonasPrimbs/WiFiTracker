import Vue from 'vue';
import Vuex from 'vuex';
import AccessEndPointRelation from './tracker/accessEndPointRelation';
import AccessPoint from './tracker/accessPoint';
import EndPoint from './tracker/endPoint';

Vue.use(Vuex);

const aeprDict: { [apName: string]: { [epName: string]: number } } = {};
const aeprList: AccessEndPointRelation[] = [];
const apDict: { [name: string]: number } = {};
const apList: AccessPoint[] = [];
const epDict: { [addr: string]: number } = {};
const epList: EndPoint[] = [];
const eaprDict: { [epAddr: string]: { [apName: string]: number } } = {};

export default new Vuex.Store({
  actions: {
    /**
     * Adds a new access point.
     * @param context Context of store.
     * @param ap Access point to add.
     */
    addAccessPoint(context, ap: AccessPoint): Promise<void> {
      return new Promise((resolve, reject) => {
        // Add access point to list of access points.
        context.commit('addAccessPoint', ap);

        // Define, how access points notifications should be handled.
        ap.startListen((data: { ap: AccessPoint, value: any }) => {
          data.value.devices.forEach(async (ep: { addr: string, rssi: number }) => {
            if (ep.hasOwnProperty('addr')
             && ep.hasOwnProperty('rssi')
             && ep.addr.length === 17
             && ep.rssi <= 0
             && ep.rssi >= -100) {
              // Add end point if unknown.
              if (!(ep.addr in context.state._epDict)) {
                context.commit('addEndPoint', new EndPoint(ep.addr));
              }

              // Add or update relation between access point and endpoint.
              const aepr = new AccessEndPointRelation(data.ap.name, ep.addr, ep.rssi, Date.now());
              await context.dispatch('changeAccessEndPointRelation', aepr);
            }
          });
        });

        resolve();
      });
    },

    /**
     * Adds or updates a relation between an access point and an end point.
     * @param context Context of storage.
     * @param aepr Relation between access point and end point to add or update.
     */
    changeAccessEndPointRelation(context, aepr: AccessEndPointRelation): Promise<void> {
      return new Promise((resolve, reject) => {
        // Add or update the relation.
        // Check, if relations to end point exists.
        if (aepr.epAddr in context.state._eaprDict) {
          // Get relations to access points.
          const aprs = context.state._eaprDict[aepr.epAddr];

          // Check, if relation between access point and end point exists.
          if (aepr.apName in aprs) {
            // Update relation.
            context.commit('updateApEpRelation', aepr);
          } else {
            // Add access point relation to existing end point relation.
            context.commit('addApRelation', aepr);
          }
        } else {
          // Add new relation between access point and end point.
          context.commit('addApEpRelation', aepr);
        }

        // Recalculate the position of the access point.
        context.commit('updateEpPosition', aepr.epAddr);

        resolve();
      });
    },

    /**
     * Clears the list of end points and relations to them.
     * @param context Context of storage.
     */
    clearEndPoints(context): Promise<void> {
      return new Promise((resolve, reject) => {
        context.commit('clearEndPoints');
        context.commit('clearAccessEndPointRelations');
        resolve();
      });
    },

    /**
     * Deletes an access point.
     * @param context Context of store.
     * @param apName Name of Access point to delete.
     */
    deleteAccessPoint(context, apName: string): Promise<void> {
      return new Promise((resolve, reject) => {
        // Delete relation between access point and all of its end points.
        for (const epName  in context.state._eaprDict) {
          if (context.state._eaprDict.hasOwnProperty(epName)) {
            const epRel = context.state._eaprDict[epName];
            if (apName in epRel) {
              context.commit('deleteAccessEndPointRelation', { apName, epName });
            }
          }
        }

        // Delete access point from index and list.
        context.commit('deleteAccessPoint', apName);

        resolve();
      });
    },

    /**
     * Update the position of an access point.
     * @param context Context of store.
     * @param options Options relevant to updat eccess point position.
     */
    updateAccessPointPosition(context, options: { apName: string, x: number, y: number }): Promise<void> {
      return new Promise((resolve, reject) => {
        // Update position of access point.
        context.commit('updateApPosition', options);

        // Update positions of end points.
        const aprs = context.state._aeprDict[options.apName];
        for (const epAddr in aprs) {
          if (aprs.hasOwnProperty(epAddr)) {
            context.commit('updateEpPosition', epAddr);
          }
        }

        resolve();
      });
    },
  },

  mutations: {
    /**
     * ! FOR STORAGE INTERNAL USE ONLY !
     * Adds an access point to list and indexes it.
     * @param state Storage state.
     * @param ap Access point to add.
     */
    addAccessPoint(state, ap: AccessPoint): void {
      // Add access point list.
      const newLength = state._apList.push(ap);

      // Index the access point.
      state._apDict[ap.name] = newLength - 1;
    },

    /**
     * ! FOR STORAGE INTERNAL USE ONLY !
     * Adds a new relation between an access point and an end point.
     * @param state Storage state.
     * @param aepr Relation between access point and end point to add.
     */
    addApEpRelation(state, aepr: AccessEndPointRelation): void {
      // Add relation to list.
      const newLength = state._aeprList.push(aepr);

      // Get Index of new relation.
      const index = newLength - 1;

      // Add index ep-ap-dictionary.
      if (aepr.epAddr in state._eaprDict) {
        state._eaprDict[aepr.epAddr][aepr.apName] = index;
      } else {
        state._eaprDict[aepr.epAddr] = {
          [aepr.apName]: index,
        };
      }

      // Add index to ap-ep dictionary.
      if (aepr.apName in state._aeprDict) {
        state._aeprDict[aepr.apName][aepr.epAddr] = index;
      } else {
        state._aeprDict[aepr.apName] = {
          [aepr.epAddr]: index,
        };
      }
    },

    /**
     * ! FOR STORAGE INTERNAL USE ONLY !
     * Adds a relation between an access point and an end point to an existing end point relation.
     * @param state Storage state.
     * @param aepr Relation between access point and end point to add.
     */
    addApRelation(state, aepr: AccessEndPointRelation): void {
      // Add relation to list.
      const newLength = state._aeprList.push(aepr);

      // Get index of new relation in list.
      const index = newLength - 1;

      // Add relation between end point and access point to dictionary.
      state._eaprDict[aepr.epAddr][aepr.apName] = index;

      // Add relation between access point and end point to dictionary.
      if (aepr.apName in state._aeprDict) {
        state._aeprDict[aepr.apName][aepr.epAddr] = index;
      } else {
        state._aeprDict[aepr.apName] = {
          [aepr.epAddr]: index,
        };
      }
    },

    /**
     * ! FOR STORAGE INTERNAL USE ONLY !
     * Adds a new end point to list and indexes it.
     * @param state Storage state.
     * @param ep End point to add.
     */
    addEndPoint(state, ep: EndPoint): void {
      // Add end point to list.
      const newLength = state._epList.push(ep);

      // Index the end point.
      state._epDict[ep.addr] = newLength - 1;
    },

    /**
     * ! FOR STORAGE INTERNAL USE ONLY !
     * Clears list and dictionaries of relations between access points and end points.
     * @param state Storage state.
     */
    clearAccessEndPointRelations(state): void {
      state._aeprList = [];
      state._aeprDict = {};
      state._eaprDict = {};
    },

    /**
     * Clears list and dictionary of end points.
     * @param state Storage state.
     */
    clearEndPoints(state): void {
      state._epList = [];
      state._epDict = {};
    },

    /**
     * ! FOR STORAGE INTERNAL USE ONLY !
     * Deletes an access point.
     * @param state Storage state.
     * @param ap Name of access point to delete.
     */
    deleteAccessPoint(state, apName: string): void {
      const index = state._apDict[apName];
      delete state._apDict[index];
      // TODO: Remove access point from array and update dictionary.
      // state._accessPoints[index] = null;
    },

    /**
     * ! FOR STORAGE INTERNAL USE ONLY !
     * Updates the position of an access point.
     * @param state Storage state.
     * @param options Data required to update position of an access point.
     */
    updateApPosition(state, options: { apName: string, x: number, y: number }): void {
      const index = state._apDict[options.apName];
      const instance = state._apList[index];
      instance.x = options.x;
      instance.y = options.y;
    },

    /**
     * ! FOR STORAGE INTERNAL USE ONLY !
     * Updates the position of an end point.
     * @param state Storage state.
     * @param epAddr MAC address of end point to update.
     */
    updateEpPosition(state, epAddr: string): void {
      // Get end point whose position will be updated.
      const index = state._epDict[epAddr];
      const ep = state._epList[index];

      // Get dictionary with all access point relations.
      const aeprs = state._eaprDict[epAddr];

      // Create temporary list of trilateration relevant triples.
      const rssis: Array<{ rssi: number, x: number, y: number }> = [];

      const timeOffset = Date.now() - 10000;

      for (const apName in aeprs) {
        // Ensure, that apName is property of aeprs.
        if (!aeprs.hasOwnProperty(apName)) {
          continue;
        }

        // Get relation instance.
        const relationIndex = aeprs[apName];
        const relation = state._aeprList[relationIndex];

        // Filter all relations older than time offset.
        if (relation.timestamp < timeOffset) {
          continue;
        }

        // Get access point instance.
        const apIndex = state._apDict[relation.apName];
        const ap = state._apList[apIndex];

        // Create new triple and add it to temporary list.
        const rssi = {
          rssi: relation.rssi,
          x: ap.x,
          y: ap.y,
        };
        rssis.push(rssi);
      }

      // Trilaterate the position of the end point.
      ep.trilateratePosition(rssis);
    },

    /**
     * ! FOR STORAGE INTERNAL USE ONLY !
     * Updates an existing relation between an access point and an end point.
     * @param state Storage state.
     * @param aepr New relation between access point and end point.
     */
    updateApEpRelation(state, aepr: AccessEndPointRelation): void {
      // Get index of relation to update.
      const index = state._eaprDict[aepr.epAddr][aepr.apName];

      // Get instance of relation to update.
      const eapr = state._aeprList[index];

      // Update properties.
      eapr.rssi = aepr.rssi;
      eapr.timestamp = aepr.timestamp;
    },
  },

  state: {
    /**
     * ! FOR STORAGE INTERNAL USE ONLY !
     * Dictionary, that maps names of end points to a dictionary, that maps MAC addresses of end points to the
     * index of relation between access point and end point in state._aeprList.
     */
    _aeprDict: aeprDict,

    /**
     * ! FOR STORAGE INTERNAL USE ONLY !
     * List of relations between access points and end points.
     */
    _aeprList: aeprList,

    /**
     * ! FOR STORAGE INTERNAL USE ONLY !
     * Dictionary, that maps names of access points to index of instance in state._apList.
     */
    _apDict: apDict,

    /**
     * ! FOR STORAGE INTERNAL USE ONLY !
     * List of access points.
     */
    _apList: apList,

    /**
     * ! FOR STORAGE INTERNAL USE ONLY !
     * Dictionary, that maps MAC addresses of end points to a dictionary, that maps names of access points to the
     * index of relation between access point and end point in state._aeprList.
     */
    _eaprDict: eaprDict,

    /**
     * ! FOR STORAGE INTERNAL USE ONLY !
     * Dictionary, that maps MAC addresses of end points to index of instance in state._epList.
     */
    _epDict: epDict,

    /**
     * ! FOR STORAGE INTERNAL USE ONLY !
     * List of end points.
     */
    _epList: epList,
  },

  getters: {
    /**
     * Gets a list of all access points.
     * @param state Storage state.
     */
    accessPoints(state): AccessPoint[] {
      return state._apList;
    },

    /**
     * Gets a list of all end points.
     * @param state Storage state.
     */
    endPoints(state): EndPoint[] {
      return state._epList;
    },
  },
});
