/**
 * Vuex storage for user-related data storage
 *
 * Corresponding getters, mutators, and actions for modifying this local data store
 * Note: Stores these persistently into a file so that they can be retrieved between app loads
 * 
 * @file   Vuex data store for check-in data
 * @author <dan.khan@gmail.com>
 * @since  1.0.0
 * @copyright (c) 2023 All rights reserved.
 * 
 */

// Setup the default state
const getDefaultState = () => {
    return {
        userId: null,
        name: '',
    };
};

// Setup the store mutations
const mutations = {
    SET_USER: async (state, user) => {
        Object.assign(state, user);
    },

    SET_USER_ID: async (state, userId) => {
        state.userId = userId;
    },

    SET_USER_NAME: async (state, name) => {
        state.name = name;
    },

    RESET: async state => {
        // Reset the state
        Object.assign(state, getDefaultState());
    },
};

// Setup our getters
const getters = {
    get: state => {
        return state;
    },

    userId: state => {
        return state.userId;
    },

    name: state => {
        return state.name;
    },
};

// Setup our actions
const actions = {
    /*
     * function SetUser()
     *
     * Set the state for a new user
     */
    SET_USER: ({ commit }, { user }) => {
        commit('SET_USER', user);
    },

    /*
     * function SetUserId()
     *
     * Set a new userId
     */
    SET_USER_ID: ({ commit }, { userId }) => {
        commit('SET_USER_ID', userId);
    },

    /*
     * function SetUserName()
     *
     * Set a new user name
     */
    SET_USER_NAME: ({ commit }, { name }) => {
        commit('SET_USER_NAME', name);
    },
};

export default {
    namespaced: true,
    state: getDefaultState(),
    mutations,
    getters,
    actions,
};