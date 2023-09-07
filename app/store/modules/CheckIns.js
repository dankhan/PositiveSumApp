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

// Vue object so can use .$set
import Vue from 'vue';

// API Connectors
import CheckInAPI from '@/services/CheckInAPIService.js';

// File system access so we can persist store
import { knownFolders, File, path } from '@nativescript/core';

// The local file to persist data (under getDocumentsFolderPath())
const dbFileName = 'localstorage_checkins.db';

// Setup the default state
const getDefaultState = () => {
    return {
        // persons is an array of person objects, indexed by a personId property on the object (so we can access using array-like accessors)
        /*
        {
            "persons": {
                "42": {
                    "personId": 42,             // Id of the contact so we can index into the contacts store
                    "checkInId": 22,            // Id of the related checkIn object (looked up from API)
                    "last": <timestamp>,        // Unix timestamp for when the last checkin was sent to this person
                    "due": <timestamp>,         // Unix timestamp for when the next checkin is due
                    "notify": 1,                // The number of notifications for this person
                },
                "43" : { ... },
                etc.
            },

            // yourCheckIns is an array of person objects, indexed by a personId property on the object (so we can access using array-like accessors)
            "yourCheckIns": {
                "42": {
                    "personId": 42,             // Id of the contact so we can index into the contacts store
                    "checkInId": 23,            // Id of the related checkIn object (looked up from API)
                    "last": <timestamp>,        // Unix timestamp for when the last checkin was received from this person
                    "due": <timestamp>,         // Unix timestamp for when the next checkin is due
                    "notify": 1,                // The number of notifications for this person
                },
                "43" : { ... },
                etc.
            }
        */
        persons: {},
        yourCheckIns: {},

        // checkIns is a dictionary of checkIn objects - storage representation has different meaning depending upon the to and from parameters
        // if from.userid is present and == your userId it's a check-In from you to someone else, otherwise, it's from someone else to you

        /*
        "checkIns":
        {
            "1":{
                checkInId: "1",
                text: '👋',
                time: 1692158913,
                read: 1692158913,           // time this checkIn was read or empty if not yet read
                to: { personId: 1 },
                from: { userId: 42 },
                reply1: "2",                // Optional link to a reply - reference to another checkInId
                reply2: "3",                // Optional link to a second reply  - referenced to another checkInId
            },
            "2":
            {
                ...
            }
        }
        /*
        // case 1: You checking in with someone and viewing their reply
        {
            checkInId: 1,
            text: '👋',
            time: 1692158913,
            to: { personId: 1 },
            from: { userId: 42 },
            reply1: "2",
        },

        // case 2: You checking in with someone and viewing their reply to your reply
        {
            checkInId: 2,
            text: '👋',
            time: 1692158913,
            to: { personId: 1 },
            from: { userId: 42 },
            reply1: "2",
            reply2: "3",
        },

        // case 3: Someone checking in with you, and no replies yet
        {
            checkInId: 3,
            text: '👋',
            time: 1692158913,
            from: { personId: 1 },
            to: { userId: 42 },
        },

        // case 4: Someone checking in with you, and you have replied
        {
            checkInId: 4,
            text: '👋',
            time: 1692158913,
            from: { personId: 1 },
            to: { userId: 42 },
            reply1: "2",
        },

        // case 5: Someone checking in with you, and you have replied and they have replied back
        {
            checkInId: 5,
            text: '👋',
            time: 1692158913,
            from: { personId: 1 },
            to: { userId: 42 },
            reply1: "2",
            reply2: "3",
        },
        */
        checkIns: {},
        expiry: 1 * 60 * 60 * 24 * 90,     // number of seconds that a read checkIn is no longer shown in this list (default = 90 days)
    };
};

// Setup the store mutations
const mutations = {
    SET_ALL_CHECKINS: (state, checkIns) => {
        Object.assign(state, checkIns);
        persistStore(state);
    },

    SET_CHECKIN: (state, checkIn) => {
        // Create the key if it doesn't exist
        if (!Object.prototype.hasOwnProperty.call(state.checkIns, Number(checkIn.checkInId))) {
            Vue.set(state.checkIns, Number(checkIn.checkInId), {});
        }
        
        // Save the details
        Vue.set(state.checkIns, Number(checkIn.checkInId), checkIn);

        // Persist the storage
        persistStore(state);
    },

    RESET: state => {
        Object.assign(state, getDefaultState());
        persistStore(state);
    },
};

// Setup our getters
const getters = {
    all: state => {
        return state.checkIns ? state.checkIns : {};
    },

    // Lookup the checkIns by an array of checkInIds, or return all if empty
    checkIns: state => {
        return (checkInIdArr, returnAll = true) => {
            const expired = Math.floor(Date.now() / 1000) + state.expiry;
            return !checkInIdArr || !checkInIdArr.length ? (returnAll ? Object.values(state.checkIns) : []) : Object.values(state.checkIns).filter(c => checkInIdArr.includes(c.checkInId) && (!c.read || c.time < expired));
        }
    },

    // Check if there are some 'incoming' check-ins to this user where the checkIn.to.userId field === our userId
    hasYourCheckIns: (state, getters) => {
        return userId => Object.values(getters.checkIns()).some(c => c.to && c.to.userId && Number(c.to.userId) === Number(userId));
    },

    yourCheckIns: (state, getters) => {
        return userId => Object.values(getters.checkIns()).filter(c => c.to && c.to.userId && Number(c.to.userId) === Number(userId));
    },
    
    yourCheckInsNotifyCount: (state, getters) => {
        // We get a list of checkInIds which are sent to me, or a reply of something sent to me
        // We do this by returning the checkInId if no reply1 and reply2 fields, or by returning the reply1 and reply2 checkInIds if they are sent directly to me
        return userId => {
            const yourCheckIns = getters.yourCheckIns(userId);
            const checkInIds = yourCheckIns.map((c) => {
                if (c.reply2 && c.reply1) {
                    return [c.checkInId, c.reply1, c.reply2];
                } else if (c.reply1) {
                    return [c.checkInId, c.reply1];
                } else {
                    return c.checkInId;
                }
            })
            .flat()                                                                 // flatten any reply1s and reply2
            .filter((value, index, array) => array.indexOf(value) === index);       // remove duplicates checkInIds
            
            // We lookup all checkIns with these ids
            const checkIns = getters.checkIns(checkInIds, false);

            // We count each checkIn that is 'unread' (i.e. has no read property)
            return checkIns && checkIns.length ? checkIns.reduce((total,c) => total = total + (c.read && Number(c.read) > 0 ? 0 : 1), 0) : 0;
        }
    },

    /*yourCheckIns: state => {
        return state.yourCheckIns ? state.yourCheckIns : {};
    },

    yourCheckIn: state => {
        return (personId) => {
            if (personId && Object.prototype.hasOwnProperty.call(state.yourCheckIns, Number(personId))) {
                return state.yourCheckIns[personId];
            } else {
                return null;
            }
        }
    },

    yourCheckInsCount: state => {
        return Object.keys(state.yourCheckIns).length;
    },

    yourCheckInsNotifyCount: state => {
        // Reduce and sum the individual notify values
        return state.yourCheckIns ? Object.values(state.yourCheckIns).reduce((total,c) => total = total + Number(c.notify), 0) : 0;
    },

    persons: state => {
        return state.persons ? state.persons : {};
    },

    person: state => {
        return (personId) => {
            if (personId && Object.prototype.hasOwnProperty.call(state.persons, Number(personId))) {
                return state.persons[personId];
            } else {
                return null;
            }
        }
    },

    // Last check in date for a personId - looks at when you last checked in with them OR when they last checked in with you
    lastCheckIn: state => {
        return (personId) => {
            let youLast = 0;
            if (personId && Object.prototype.hasOwnProperty.call(state.persons, Number(personId))) {
                youLast = state.persons[personId].last ? state.persons[personId].last : 0;
            }

            let themLast = 0;
            if (personId && Object.prototype.hasOwnProperty.call(state.yourCheckIns, Number(personId))) {
                themLast = state.yourCheckIns[personId].last ? state.yourCheckIns[personId].last : 0;
            }

            return Math.max(youLast, themLast);
        }
    },*/
};

const persistStore = async (data) => {
    // Check if persisted storage exists
    try {
        const folderPath = knownFolders.documents().path;
        const filePath = path.join(folderPath, dbFileName);
        const fileObj = File.fromPath(filePath);

        await fileObj.writeText(JSON.stringify(data))
            .catch((error) => {
                console.error('Error writing default check-ins persisted store ' + filePath + '; error: ' + error);
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
    // Initialise the storage from the persisted store
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
                            console.info('Read checkins info from file');
                        }

                        // Set the list in scope
                        await commit('SET_ALL_CHECKINS', data);
                    }).catch((error) => {
                        console.error('Error reading persisted store ' + filePath + '; error: ' + error);
                    });
            }
        } catch (error) {
            console.error('Problem reading persisted storage for ' + dbFileName, error);
        }
    },
    
    // Set all the checkIns
    SET_ALL_CHECKINS: ({ commit }, checkIns) => {
        commit('SET_ALL_CHECKINS', checkIns);
    },

    // Set an individual checkIn
    SET_CHECKIN: ({ commit }, checkIn) => {
        // Update the check-in object
        commit('SET_CHECKIN', checkIn);
    },

    // Reset the state to default
    RESET: state => {
        // Reset the state
        Object.assign(state, getDefaultState());
    },

    /*
     * function SetYourCheckIns()
     *
     * Set the yourCheckIns list for a person
     */
    SET_ALL_YOUR_CHECKINS: ({ commit }, { yourCheckIns }) => {
        commit('SET_ALL_YOUR_CHECKINS', yourCheckIns);
    },

    /*
     * function SetYourCheckIn()
     *
     * Set an individual yourCheckIn for a person
     */
    SET_YOUR_CHECKIN: ({ commit }, { checkIn }) => {
        commit('SET_YOUR_CHECKIN', checkIn);
    },

    /*
     * function SetPersons()
     *
     * Set the persons list for a person
     */
    SET_ALL_PERSONS: ({ commit }, { persons }) => {
        commit('SET_ALL_PERSONS', persons);
    },
    
    /*
     * function SetYourCheckIn()
     *
     * Set an individual person checkin for a person
     */
    SET_PERSON_CHECKIN: ({ commit }, { checkIn }) => {
        commit('SET_PERSON_CHECKIN', checkIn);
    },

    /*
     * function updateYourCheckIn()
     *
     * Update the details about a single yourCheckIn for a person
     */
    UPDATE_YOUR_CHECKIN: ({ commit }, { person }) => {
        commit('UPDATE_YOUR_CHECKIN', person);
    },

    /*
     * function updateUserCheckIn()
     *
     * Update the details about a single checkin for a person
     */
    UPDATE_PERSON_CHECKIN: ({ commit }, { person }) => {
        commit('UPDATE_PERSON_CHECKIN', person);
    },

    GET_ALL: async ({ commit }, { personId }) => {
        // Fetch the check-in details for this person from the API and cache results
        await CheckInAPI.list(personId)
            .then( (response) => {
                if (!response || !response.checkIn) {
                    throw ('Problem fetching checkIn details for personId: ' + personId);
                }

                // Update the state
                commit('SET_ALL_CHECKINS', response.checkIn);

                return Promise.resolve(response.checkIn);
            })
            .catch((e) => {
                return Promise.reject(e);
            }
        );
    },
};

export default {
    namespaced: true,
    state: getDefaultState(),
    mutations,
    getters,
    actions,
};