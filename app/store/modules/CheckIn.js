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
        // User details
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
        return state.checkIn && state.checkin.groupList ? state.checkin.groupList : [];
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