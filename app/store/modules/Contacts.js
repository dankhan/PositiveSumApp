/**
 * Vuex storage for contact -related data storage
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
import PersonAPI from '@/services/PersonAPIService.js';

// File system access so we can persist store
import { knownFolders, File, path } from '@nativescript/core';

// The local file to persist data (under getDocumentsFolderPath())
const dbFileName = 'localstorage_contacts.db';

// Setup the default state
const getDefaultState = () => {
    return {
        // contacts is an array of person objects, indexed by a personId property on the object (so we can access using array-like accessors)
        /*
        {
            "contacts": {
                "42": {
                    "personId": 42
                    "name": "John Appleseed",
                    "email": "John-Appleseed@mac.com",
                    "dialCode": "+1",
                    "phone": "8885555512",
                    "countryCode": "us",
                    "frequency": 2,
                    "due": {
                        "checkIn": 1694042853,          // timestamp                    
                    },
                    last: {
                        "checkIn": {
                            checkInId: 1,
                            time:  1694042853           // timestamp,
                        }
                    }
                },
                "43" : { ... },
                etc.
            }
        */
        contacts: {},
    };
};

// Setup the store mutations
const mutations = {
    SET_ALL_CONTACTS: (state, contacts) => {
        Object.assign(state, contacts);

        // Persist the groups storage
        persistStore(state);
    },

    SET_CONTACT: (state, person) => {
        // Create the key if it doesn't exist
        if (!Object.prototype.hasOwnProperty.call(state.contacts, Number(person.personId))) {
            Vue.set(state.contacts, Number(person.personId), {});
        }

        // Save the details
        Vue.set(state.contacts, Number(person.personId), person);

        // Persist the contacts storage
        persistStore(state);
    },

    UPDATE_CHECKIN: (state, { due, checkIn }) => {
        const personId = Number(due.personId);

        // Check the person exists
        if (Object.prototype.hasOwnProperty.call(state.contacts, personId)) {
            // Create the "last" check-in key if it doesn't exist
            if (!Object.prototype.hasOwnProperty.call(state.contacts[personId], "last")) {
                Vue.set(state.contacts[personId], "last", { "checkIn": {}});
            } else if (!Object.prototype.hasOwnProperty.call(state.contacts[personId].last, "checkIn")) {
                Vue.set(state.contacts[personId].last, "checkIn", {});
            }

            // We update the last check-in id and time props
            Vue.set(state.contacts[personId].last, "checkIn", { checkInId: checkIn.checkInId, time: checkIn.time } );

            // Create the "due" check-in key if it doesn't exist
            if (!Object.prototype.hasOwnProperty.call(state.contacts[personId], "due")) {
                Vue.set(state.contacts[personId], "due", {});
            }

            // We update the new due date based on the time of this last check-in plus the frequency field
            Vue.set(state.contacts[personId], "due", { checkIn: due.time } );

            // Persist the contacts storage
            persistStore(state);
        }
    },

    RESET: state => {
        // Reset the state
        Object.assign(state, getDefaultState());

        // Persist the contacts storage
        persistStore(state);
    },
};

// Setup our getters
const getters = {
    // Get all contacts
    get: state => {
        return state.contacts;
    },

    // Lookup a person by personId
    person: state => {
        return (personId) => {
            if (personId && Object.prototype.hasOwnProperty.call(state.contacts, Number(personId))) {
                return state.contacts[personId];
            } else {
                return null;
            }
        }
    },

    // Lookup the persons by an array of personIds, or return all if empty
    persons: state => {
        return (personIdArr) => {
            return !personIdArr || !personIdArr.length ? state.contacts : Object.values(state.contacts).filter(p => personIdArr.includes(p.personId));
        }
    },
    
    // Lookup a person's name by personId
    personName: state => {
        return (personId) => {
            if (personId && Object.prototype.hasOwnProperty.call(state.contacts, Number(personId))) {
                return state.contacts[personId].name ? state.contacts[personId].name : '';
            } else {
                return null;
            }
        }
    },

    // Check if a person exists by email, and phone number and return their name if so
    exists: state => {
        return (email, dialCode, phone, excludePersonId=null) => {
            // Look up if any of these items are already in the contact store - return the name of the person it is currently assigned to
            if (state && state.contacts) {
                let found = false;
                Object.keys(state.contacts).forEach((x) => {
                    return found = state.contacts[x].email.toLowerCase() === email.toLowerCase() || (state.contacts[x].dialCode === dialCode && state.contacts[x].phone === phone) ? state.contacts[x] : found;
                });

                // Exclude a personId (e.g. ourself) from the search
                if (found && excludePersonId && found.personId === excludePersonId) return false;

                // We return the name field if found so UI can say who it belongs to
                return found ? found.name : false;
            } else {
                return false;
            }
        }
    },

    // Check the last check-in date for a person
    lastCheckIn: state => {
        return (personId) => {
            if (personId && Object.prototype.hasOwnProperty.call(state.contacts, Number(personId)) && 
                Object.prototype.hasOwnProperty.call(state.contacts[Number(personId)]["last"]["checkIn"]["time"])
            ) {
               return Object.prototype.hasOwnProperty.call(state.contacts[Number(personId)]["last"]["checkIn"]["time"]);
            } else {
                return 0;
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
                console.error('Error writing default contact persisted store ' + filePath + '; error: ' + error);
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
     * function SetAllContacts()
     *
     * Set the state for a new set of contacts
     */
    SET_ALL_CONTACTS: ({ commit }, { contacts }) => {
        commit('SET_ALL_CONTACTS', contacts);
    },

    /*
     * function SetContact()
     *
     * Add a new contact
     */
    SET_CONTACT: ({ commit }, { person }) => {
        commit('SET_CONTACT', person);
    },

    /*
     * function UpdateCheckIn()
     *
     * Update the contact's last check id and time
     */
    UPDATE_CHECKIN: ({ commit }, data) => {
        commit('UPDATE_CHECKIN', data);
    },

    /*
     * function GetContact()
     *
     * Gets details about a contact by userId, if doesn't exist, will check with the API
     */
    GET_CONTACT: async ({ commit, getters }, { userId, personId }) => {
        // Check the key exists and return that
        const contact = getters.contact(personId);
        if (contact) {
            return contact;
        } else {
            // Fetch the user details for this user from the API and save results in persistent store
            await PersonAPI.get(userId, personId, false)
                .then( (response) => {
                    if (!response || !response.person) {
                        throw ('Problem fetching person details for userId: ' + userId + '; personId: ' + personId);
                    }

                    // Add the new contact to the storeand persist store
                    commit('SET_CONTACT', response.person);

                    return Promise.resolve(response.person);
                })
                .catch((e) => {
                    return Promise.reject(e);
                }
            );
        }
    },

    INIT: async ({ commit }) => {
        // Check if persisted storage exists
        try {
            const folderPath = knownFolders.documents().path;
            const filePath = path.join(folderPath, dbFileName);
            
            if (!File.exists(filePath)) {
                // We create an empty file wiuth default state
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
                            console.info('Read contacts info from file');
                        }                        

                        // Set the contacts list in scope
                        await commit('SET_ALL_CONTACTS', data);
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