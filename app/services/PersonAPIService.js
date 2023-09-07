/**
 * API Middleware for Person- related API functions
 *
 * Contains transport-level functions to make API calls and process the responses,
 * Setting any relevant data in the Vuex stores, then passing back data back up to the UI for rendering
 * 
 * @file   API middleware for person-related functions
 * @author <dan.khan@gmail.com>
 * @since  1.0.0
 * @copyright (c) 2022 All rights reserved.
 * 
 */

// Common includes used in this file
import * as Https from '@/common/https';
import store from '@/store/index';
import { MD5 } from 'crypto-es/lib/md5.js';

/*
 * function get ()
 *
 * API call to get update a person (contact) for a user
 *
 */
const get = async (userId, personId, updateStore=true ) => {
    // The end point to call and to use for hashing our secret key
    const endPoint = 'person/get';

    // Generate a signed API request using our shared secret key
    const signatureStr = endPoint + process.env.API_SIGNATURE_SHARED_SECRET + userId + personId;
    const signature = MD5(signatureStr).toString();

    // Post to the user endpoint
    return Https.postRequest(endPoint, {
        body: {
            userId,
            personId,
            signature,
        }
    }).then(async (response) => {
        // Check the returned response codes to determine if we had a http/server error (will raise exceptions)
        Https.checkResponseErrorCodes(response);
        
        // Add/update the person to the store (only do if this isn't triggered from the store)
        const data = JSON.parse(response.content);
        const person = data.person;
        if (updateStore) {
            await store.dispatch('Contacts/SET_CONTACT', person);
        }

        // Return the data returned from the API so UI can access it
        return data;
    });
}

/*
 * function add ()
 *
 * API call to add a person (contact) for a user
 *
 */
const add = async (userId, { name, email, dialCode, phone, countryCode, nationalNumber, frequency }) => {
    // The end point to call and to use for hashing our secret key
    const endPoint = 'person/add';

    // Generate a signed API request using our shared secret key
    const signatureStr = endPoint + process.env.API_SIGNATURE_SHARED_SECRET + userId + name + email + dialCode + phone + countryCode + nationalNumber + frequency;
    const signature = MD5(signatureStr).toString();

    let data = {
        name,
        email,
        dialCode,
        phone,
        countryCode,
        nationalNumber,
        frequency
    };

    // Post to the user endpoint
    return Https.postRequest(endPoint, {
        body: {
            userId,
            signature,
            data
        }
    }).then(async (response) => {
        // Check the returned response codes to determine if we had a http/server error (will raise exceptions)
        Https.checkResponseErrorCodes(response);
        
        // Update the newly fetched check-in data store
        const data = JSON.parse(response.content);

        // The API will return two things, the new person record, and the new checkin record, so they can add to the check in list
        const person = data.person;
        await store.dispatch('Contacts/SET_CONTACT', { person });

        const checkIn = data.checkIn;
        await store.dispatch('CheckIns/SET_PERSON_CHECKIN', { checkIn });

        // Return the data returned from the API so UI can access it
        return data;
    })
}

/*
 * function update ()
 *
 * API call to get update a person (contact) for a user
 *
 */
const update = async (userId, data) => {
    // The end point to call and to use for hashing our secret key
    const endPoint = 'person/update';

    // Generate a signed API request using our shared secret key
    const signatureStr = endPoint + process.env.API_SIGNATURE_SHARED_SECRET + userId + data;
    const signature = MD5(signatureStr).toString();

    // Post to the user endpoint
    return Https.postRequest(endPoint, {
        body: {
            userId,
            signature,
            data
        }
    }).then(async (response) => {
        // Check the returned response codes to determine if we had a http/server error (will raise exceptions)
        Https.checkResponseErrorCodes(response);
        
        // Update the newly fetched check-in data store
        const data = JSON.parse(response.content);
        const person = data.person;
        await store.dispatch('Contacts/SET_CONTACT', { person });

        // Return the data returned from the API so UI can access it
        return data;
    })
}

/*
 * function removeGroup ()
 *
 * API call to remove a person from a group for a user
 *
 */
const removeGroup = async (userId, groupId, personId) => {
    // The end point to call and to use for hashing our secret key
    const endPoint = 'person/removeGroup';

    // Generate a signed API request using our shared secret key
    const signatureStr = endPoint + process.env.API_SIGNATURE_SHARED_SECRET + userId + groupId + personId;
    const signature = MD5(signatureStr).toString();

    // Post to the user endpoint
    return Https.postRequest(endPoint, {
        body: {
            userId,
            groupId,
            personId,
            signature
        }
    }).then(async (response) => {
        // Check the returned response codes to determine if we had a http/server error (will raise exceptions)
        Https.checkResponseErrorCodes(response);
        
        // Extract JSON from the response
        const data = JSON.parse(response.content);
        const personId = data.personId;
        const groups = data.groups;
        const persons = data.persons;

        // Show debug output
        if (process.env.DEBUG_API) {
            console.info('Returned content from API', data);
        };

        // Update the contacts store
        // await store.dispatch('Contacts/SET_GROUPS', { personId, groups });
        
        // Update the checkins group store
        store.dispatch('CheckIns/SET_PERSON_GROUPS', { personId, groups });

        // Update the groups store
        store.dispatch('Groups/SET_PERSON_GROUPS', { personId, groups });
        store.dispatch('Groups/SET_GROUP_PERSONS', { groupId, persons });

        // Return the data returned from the API so UI can access it
        return data;
    });
}

const addGroup = async (userId, personId, groupId) => {
    // The end point to call and to use for hashing our secret key
    const endPoint = 'person/addGroup';

    // Generate a signed API request using our shared secret key
    const signatureStr = endPoint + process.env.API_SIGNATURE_SHARED_SECRET + userId + personId + groupId;
    const signature = MD5(signatureStr).toString();

    // Post to the user endpoint
    return Https.postRequest(endPoint, {
        body: {
            userId,
            personId,
            groupId,
            signature
        }
    }).then((response) => {
        // Check the returned response codes to determine if we had a http/server error (will raise exceptions)
        Https.checkResponseErrorCodes(response);
        
        // Extract JSON from the response
        const data = JSON.parse(response.content);
        const personId = data.personId;
        const groups = data.groups;
        const persons = data.persons;

        // Show debug output
        if (process.env.DEBUG_API) {
            console.info('Returned content from API', data);
        };

        // Update the contacts store
        // store.dispatch('Contacts/SET_GROUPS', { personId, groups });

        // Update the groups store
        store.dispatch('Groups/SET_PERSON_GROUPS', { personId, groups });
        store.dispatch('Groups/SET_GROUP_PERSONS', { groupId, persons });

        // Return the data returned from the API so UI can access it
        return data;
    });
}
// Export each API endpoint
export default {
    get,
    add,
    update,
    removeGroup,
    addGroup,
};