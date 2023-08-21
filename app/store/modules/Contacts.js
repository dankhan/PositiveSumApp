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
        // contacts is an array of person objects, indexed by a userId property on the object
        contacts: {},
    };
};

// Setup the store mutations
const mutations = {
    SET_ALL_CONTACTS: (state, contacts) => {
        Object.assign(state, contacts);
    },

    SET_CONTACT: async (state, contact) => {
        // Create the key if it doesn't exist
        if (!Object.prototype.hasOwnProperty.call(state.contacts, Number(contact.personId))) {
            Vue.set(state.contacts, Number(contact.personId), {});
        }

        // Save the details
        Vue.set(state.contacts, Number(contact.personId), contact);

        // Persist the contacts storage
        await persistStore(state);
    },

    RESET: async state => {
        // Reset the state
        Object.assign(state, getDefaultState());

        // Persist the contacts storage
        await persistStore(state);
    },
};

// Setup our getters
const getters = {
    get: state => {
        return state.contacts;
    },

    contact: state => {
        return (personId) => {
            if (personId && Object.prototype.hasOwnProperty.call(state.contacts, Number(personId))) {
                return state.contacts[personId];
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
    SET_CONTACT: ({ commit }, { contact }) => {
        commit('SET_CONTACT', contact);
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