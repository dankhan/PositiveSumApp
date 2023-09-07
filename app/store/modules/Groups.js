/**
 * Vuex storage for group-related data storage
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

// Vue object so can use .$set
import Vue from 'vue';

// API Connectors
import GroupAPI from '@/services/GroupAPIService.js';

// File system access so we can persist store
import { knownFolders, File, path } from '@nativescript/core';

// The local file to persist data (under getDocumentsFolderPath())
const dbFileName = 'localstorage_groups.db';

// Setup the default state
const getDefaultState = () => {
    return {
        // groups is a object of group objects (i.e. a dictionary), indexed by a groupId property on the object (so we can access using array-like accessors)
        /*
        {
            "groups": {
                "42": {
                    "groupId": 42,                  // Id of the group
                    "groupName": "My Group",        // Display name of the group
                    "frequency": "Fortnightly",     // Frequency display string - 'Daily', 'Weekly', 'Fortnightly', 'Monthly', 'Every 2 months', 'Every 3 months', 'Every 6 months'
                    "notify": 2,                    // The number of notifications for this group
                    "due": {
                        "checkIn": 1694042853,          // timestamp for when whole group id due next check in
                    },
                    last: {
                        "checkIn": {
                            checkInIds: [1,2,3,4],
                            time:  1694042853           // timestamp for when whole group was checked in last
                        }
                    }
                },
                "43" : { ... },
                etc.
            }
        }
        */
        groups: {},

        /*
        Store an array of personId => groupIds so we can quickly lookup which groups a person is in
        PersonIds reference a person stored in the contact store
        {
            personGroups: {}, 
                "42": ["1", "2", "3"],
                "43": ["3", "4", "5"]
        }
        */
       personGroups: {},

        /*
        Store an array of groupId => personId so we can quickly lookup which people are in a group
        PersonIds reference a person stored in the contact store
        {
            groupPersons: {}, 
                "1": ["42", "43"],
                "2": ["43"]
        }
        */
       groupPersons: {},
    };
};

// Setup the store mutations
const mutations = {
    SET_ALL_GROUPS: (state, groups) => {
        Object.assign(state, groups);

        // Persist the groups storage
        persistStore(state);
    },

    SET_ALL_PERSON_GROUPS: (state, personGroups) => {
        Object.assign(state.personGroups, personGroups);

        // Persist the groups storage
        persistStore(state);
    },

    SET_ALL_GROUP_PERSONS: (state, groupPersons) => {
        Object.assign(state.groupPersons, groupPersons);

        // Persist the groups storage
        persistStore(state);
    },

    SET_GROUP: (state, group) => {
        // Create the key if it doesn't exist
        if (!Object.prototype.hasOwnProperty.call(state.groups, Number(group.groupId))) {
            Vue.set(state.groups, Number(group.groupId), {});
        }

        // Save the details
        Vue.set(state.groups, Number(group.groupId), group);

        // Persist the groups storage
        persistStore(state);
    },

    /*SET_PERSONS: (state, { groupId, persons }) => {
        // Check if group exists
        if (!Object.prototype.hasOwnProperty.call(state.groups, Number(groupId))) {
            return false;
        }

        // If does exist, we replace the personIds property
        Vue.set(state.groups[groupId], "personIds", persons);

        // Persist the groups storage
        persistStore(state);
    },*/

    SET_PERSON_GROUPS: (state, { personId, groups }) => {
        // Create the key if it doesn't exist
        if (!Object.prototype.hasOwnProperty.call(state.personGroups, Number(personId))) {
            Vue.set(state.personGroups, Number(personId), []);
        }

        // Save the details
        Vue.set(state.personGroups, Number(personId), groups);

        // Persist the groups storage
        persistStore(state);
    },

    SET_GROUP_PERSONS: (state, { groupId, persons }) => {
        // Create the key if it doesn't exist
        if (!Object.prototype.hasOwnProperty.call(state.groupPersons, Number(groupId))) {
            Vue.set(state.groupPersons, Number(groupId), []);
        }

        // Save the details
        Vue.set(state.groupPersons, Number(groupId), persons);

        // Persist the groups storage
        persistStore(state);
    },

    UPDATE_CHECKIN: (state, { due, checkInIds }) => {
        const groupId = Number(due.groupId);

        // Check the group exists
        if (Object.prototype.hasOwnProperty.call(state.groups, groupId)) {
            // Create the "last" check-in key if it doesn't exist
            if (!Object.prototype.hasOwnProperty.call(state.groups[groupId], "last")) {
                Vue.set(state.groups[groupId], "last", { "checkIn": {}});
            } else if (!Object.prototype.hasOwnProperty.call(state.groups[groupId].last, "checkIn")) {
                Vue.set(state.groups[groupId].last, "checkIn", {});
            }

            // We update the last check-in id and time props
            Vue.set(state.groups[groupId].last, "checkIn", { checkInIds, time: due.last } );

            // Create the "due" check-in key if it doesn't exist
            if (!Object.prototype.hasOwnProperty.call(state.groups[groupId], "due")) {
                Vue.set(state.groups[groupId], "due", {});
            }

            // We update the new due date based on the time of this last check-in plus the frequency field
            Vue.set(state.groups[groupId], "due", { checkIn: due.time } );

            // Persist the storage
            persistStore(state);
        }
    },

    RESET: state => {
        // Reset the state
        Object.assign(state, getDefaultState());

        // Persist the groups storage
        persistStore(state);
    },
};

// Setup our getters
const getters = {
    all: state => {
        return state.groups;
    },
    
    group: state => {
        return (groupId) => {
            if (groupId && Object.prototype.hasOwnProperty.call(state.groups, Number(groupId))) {
                return state.groups[groupId];
            } else {
                return null;
            }
        }
    },

    // Lookup the group by an array of groupIds, or return all if empty
    groups: state => {
        return (groupIdArr) => {
            return !groupIdArr || !groupIdArr.length ? state.groups : Object.values(state.groups).filter(g => groupIdArr.includes(g.groupId));
        }
    },

    // Lookup the groupIds for a personId
    personGroupsIds: state => {
        return (personId) => {
            if (personId && Object.prototype.hasOwnProperty.call(state.personGroups, Number(personId))) {
                return state.personGroups[personId];
            } else {
                return null;
            }
        }
    },
    
    // Lookup the referenced groups for a personId
    personGroups: (state, getters) => {
        return (personId) => {
            if (personId && Object.prototype.hasOwnProperty.call(state.personGroups, Number(personId))) {
                return getters.groups(state.personGroups[personId]);            // returns the looked up group objects, not just ids
            } else {
                return null;
            }
        }
    },

    // Lookup the personIds for a groupId
    groupPersonIds: state => {
        return (groupId) => {
            if (groupId && Object.prototype.hasOwnProperty.call(state.groupPersons, Number(groupId))) {
                return state.groupPersons[groupId];
            } else {
                return null;
            }
        }
    },

    // Lookup the referenced person objects for a groupId
    groupPersons: (state, getters, rootState, rootGetters) => {
        return (groupId) => {
            if (groupId && Object.prototype.hasOwnProperty.call(state.groupPersons, Number(groupId))) {
                return rootGetters['Contacts/persons'](state.groupPersons[groupId]);
            } else {
                return null;
            }
        }
    },
};

const persistStore = async (data) => {
    // Check if persisted storage exists
    try {
        const folderPath = knownFolders.documents().path;
        const filePath = path.join(folderPath, dbFileName);
        const fileObj = File.fromPath(filePath);

        await fileObj.writeText(JSON.stringify(data))
            .catch((error) => {
                console.error('Error writing default group persisted store ' + filePath + '; error: ' + error);
            })
            .finally(() => {
                return data;
            })
    } catch (error) {
        console.error('Problem persisting storage for ' + dbFileName, error);
    }
}

// Setup our actions
const actions = {
    /*
     * function SetAllGroups()
     *
     * Set the state for a new set of contacts
     */
    SET_ALL_GROUPS: ({ commit }, { groups }) => {
        commit('SET_ALL_GROUPS', groups);
    },

    /*
     * function SetGroup()
     *
     * Add or update a new group (will overwrite group details)
     */
    SET_GROUP: ({ commit }, { group }) => {
        commit('SET_GROUP', group);
    },

    /*
     * function UpdateCheckIn()
     *
     * Update the group's last check-in time and due date
     */
    UPDATE_CHECKIN: ({ commit }, data) => {
        commit('UPDATE_CHECKIN', data);
    },

    /*
     * function GetGroup()
     *
     * Gets details about a group by groupId, if doesn't exist, will check with the API
     */
    GET_GROUP: async ({ commit, getters }, { userId, groupId }) => {
        // Check the key exists and return that
        const group = getters.group(groupId);
        if (group) {
            return group;
        } else {
            // Fetch the user details for this user from the API and save results in persistent store
            await GroupAPI.get(userId, groupId, false)
                .then( (response) => {
                    if (!response || !response.group) {
                        throw ('Problem fetching group details for userId: ' + userId + '; groupId: ' + groupId);
                    }

                    // Add the new group to the store and persist store
                    commit('SET_GROUP', response.group);

                    return Promise.resolve(response.group);
                })
                .catch((e) => {
                    return Promise.reject(e);
                }
            );
        }
    },

    /*
     * function SetPersonGroups()
     *
     * Set the groups for a person
     */
    SET_PERSON_GROUPS: ({ commit }, personGroups) => {
        commit('SET_PERSON_GROUPS', personGroups);
    },

    /*
     * function SetGroupPersons()
     *
     * Set the persons for a group
     */
    SET_GROUP_PERSONS: ({ commit }, groupPersons) => {
        commit('SET_GROUP_PERSONS', groupPersons);
    },

    INIT: async ({ commit }) => {
        // Check if persisted storage exists
        try {
            const folderPath = knownFolders.documents().path;
            const filePath = path.join(folderPath, dbFileName);
            
            if (!File.exists(filePath)) {
                // We create an empty file with default state
                return await persistStore(getDefaultState());
            } else {
                // Read data from file
                let data;
                const fileObj = File.fromPath(filePath);
                await fileObj.readText()
                    .then(async (res)=> {
                        // We try to parse the file as JSON
                        data = JSON.parse(res);
                        if (process.env.DEBUG_STORE) {
                            console.info('Read groups info from file');
                        } 

                        // Set the list in scope
                        await commit('SET_ALL_GROUPS', data);
                    }).catch((error) => {
                        console.error('Error reading persisted store ' + filePath + '; error: ' + error);
                    });
            }
        } catch (error) {
            console.error('Problem reading persisted storage for ' + dbFileName, error);
        }
    },
};

export default {
    namespaced: true,
    state: getDefaultState(),
    mutations,
    getters,
    actions,
};