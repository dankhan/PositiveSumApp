/**
 * Vuex storage for check-in -related data storage
 *
 * Corresponding getters, mutators, and actions for modifying this local data store
 * 
 * @file   Vuex data store for check-in data
 * @author <dan.khan@gmail.com>
 * @since  1.0.0
 * @copyright (c) 2022 All rights reserved.
 * 
 */

// API Connectors
import CheckInAPI from '@/services/CheckInAPIService.js';

// Setup the default state
const getDefaultState = () => {
    return {
        // check-in details
        checkin: {
            userId: null,
            yourCheckIns: [],
            userList: [],
            groupList:[],
        },
    };
};

// Setup the store mutations
const mutations = {
    SET_LIST: (state, checkin) => {
        state.checkin = checkin;
    },

    SET_YOURCHECKINS: (state, yourCheckIns) => {
        state.checkin.yourCheckIns = yourCheckIns;
    },

    UPDATE_CHECKIN: (state, checkIn) => {
        //state.checkin.yourCheckIns = checkIn;
        // TODO: Update the local check-in list for this user
    },

    RESET: state => {
        // Reset the state
        Object.assign(state, getDefaultState());
    },
};

// Setup our getters
const getters = {
    get: state => {
        return state.checkin;
    },

    userId: state => {
        return state.checkin && state.checkin.userId ? state.checkin.userId : null;
    },

    yourCheckIns: state => {
        return state.checkin && state.checkin.yourCheckIns ? state.checkin.yourCheckIns : [];
    },

    userList: state => {
        return state.checkin && state.checkin.userList ? state.checkin.userList : [];
    },

    groupList: state => {
        return state.checkin && state.checkin.groupList ? state.checkin.groupList : [];
    },
};

// Setup our actions
const actions = {
    /*
     * function SetList()
     *
     * Set the state for a new user's list
     */
    SET_LIST: ({ commit }, { checkin }) => {
        commit('SET_LIST', checkin);
    },

    /*
     * function SetYourCheckIns()
     *
     * Set the yourCheckIns list for a user
     */
    SET_YOURCHECKINS: ({ commit }, { yourCheckIns }) => {
        commit('SET_YOURCHECKINS', yourCheckIns);
    },

    /*
     * function UPDATE_CHECKIN()
     *
     * Update the details about a single checkIn for a user
     */
    UPDATE_CHECKIN: ({ commit }, { checkIn }) => {
        commit('UPDATE_CHECKIN', checkIn);
    },

    refreshList: ({ commit }, { userId }) => {
        // Fetch the check-in details for this user from the API and cache results
        CheckInAPI.list(userId)
            .then( (response) => {
                if (!response || !response.checkIn) {
                    throw ('Problem fetching checkIn details for userId: ' + userId);
                }

                // Update the state
                commit('SET_LIST', response.checkIn);

                return Promise.resolve(response.checkIn);
            })
            .catch((e) => {
                return Promise.reject(e);
            }
        );
    }
};

export default {
    namespaced: true,
    state: getDefaultState(),
    mutations,
    getters,
    actions,
};