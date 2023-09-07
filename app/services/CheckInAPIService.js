/**
 * API Middleware for Check-In- related API functions
 *
 * Contains transport-level functions to make API calls and process the responses,
 * Setting any relevant data in the Vuex stores, then passing back data back up to the UI for rendering
 * 
 * @file   API middleware for check-in -related functions
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
 * function list ()
 *
 * API call to get a list of check-ins, users, and groups for a specific user
 *
 */
const list = async (userId) => {
    // The end point to call and to use for hashing our secret key
    const endPoint = 'checkin/list';

    // Generate a signed API request using our shared secret key
    const signatureStr = endPoint + process.env.API_SIGNATURE_SHARED_SECRET + userId;
    const signature = MD5(signatureStr).toString();

    // Post to the user endpoint
    return Https.postRequest(endPoint, {
        body: {
            userId,
            signature,
        }
    }).then((response) => {
        // Check the returned response codes to determine if we had a http/server error (will raise exceptions)
        Https.checkResponseErrorCodes(response);
        
        // Update the newly fetched check-in data store
        const data = JSON.parse(response.content);
        const checkIns = data.checkIns;

        // Show debug output
        if (process.env.DEBUG_API) {
            console.info('Returned content from API', data);
        };

        store.dispatch('CheckIns/SET_ALL_CHECKINS', checkIns);

        // Return the data returned from the API so UI can access it
        return data;
    })
}

/*
 * function yourCheckIns ()
 *
 * API call to get a list of your check-ins for a specific user
 *
 */
const yourCheckIns = async (userId) => {
    // The end point to call and to use for hashing our secret key
    const endPoint = 'checkin/yourCheckIns';

    // Generate a signed API request using our shared secret key
    const signatureStr = endPoint + process.env.API_SIGNATURE_SHARED_SECRET + userId;
    const signature = MD5(signatureStr).toString();

    // Post to the user endpoint
    return Https.postRequest(endPoint, {
        body: {
            userId,
            signature,
        }
    }).then((response) => {
        // Check the returned response codes to determine if we had a http/server error (will raise exceptions)
        Https.checkResponseErrorCodes(response);
        
        // Update the newly fetched check-in data store
        const data = JSON.parse(response.content);
        const yourCheckIns = data.yourCheckIns;

        // Show debug output
        if (process.env.DEBUG_API) {
            console.info('Returned content from API', data);
        };

        store.dispatch('CheckIns/SET_ALL_YOUR_CHECKINS', { yourCheckIns });

        // Return the data returned from the API so UI can access it
        return data;
    })
}

/*
 * function reply ()
 *
 * API call to reply to a checkIn
 *
 */
const reply = async (userId, reply, checkInId) => {
    // The end point to call and to use for hashing our secret key
    const endPoint = 'checkin/reply';

    // Generate a signed API request using our shared secret key
    const signatureStr = endPoint + process.env.API_SIGNATURE_SHARED_SECRET + userId + checkInId;
    const signature = MD5(signatureStr).toString();

    // Post to the user endpoint
    return Https.postRequest(endPoint, {
        body: {
            userId,
            signature,
            reply,
            checkInId,
        }
    }).then(async (response) => {
        // Check the returned response codes to determine if we had a http/server error (will raise exceptions)
        Https.checkResponseErrorCodes(response);
        
        // Update the check-in with the new reply in the check-in store
        const data = JSON.parse(response.content);
        const checkIn = data.checkIn;

        // Show debug output
        if (process.env.DEBUG_API) {
            console.info('Returned content from API', data);
        };
        
        // Update the relevant stores with the returned data
        await store.dispatch('CheckIns/SET_CHECKIN', checkIn);

        // Return the data returned from the API so UI can access it
        return data;
    })
}

/*
 * function person ()
 *
 * API call to send a check-in with a person for a user
 *
 */
const person = async (userId, personId, text) => {
    // The end point to call and to use for hashing our secret key
    const endPoint = 'checkin/person';

    // Generate a signed API request using our shared secret key
    const signatureStr = endPoint + process.env.API_SIGNATURE_SHARED_SECRET + userId + personId + text;
    const signature = MD5(signatureStr).toString();

    // Post to the user endpoint
    return Https.postRequest(endPoint, {
        body: {
            userId,
            personId,
            text,
            signature,
        }
    }).then(async (response) => {
        // Check the returned response codes to determine if we had a http/server error (will raise exceptions)
        Https.checkResponseErrorCodes(response);
        
        // Update the newly fetched check-in data store
        const data = JSON.parse(response.content);
        const checkIn = data.checkIn;
        const due = data.due;

        // Show debug output
        if (process.env.DEBUG_API) {
            console.info('Returned content from API', data);
        };

        // Update the relevant stores with the returned data
        await store.dispatch('CheckIns/SET_CHECKIN', checkIn);

        // We update the contact to set the last check-in time and checkInId reference, and update their due date
        // We update this on a timer so any updates to UI show before the return list might get rerendered because the ordering may have changed
        setTimeout(async () => await store.dispatch('Contacts/UPDATE_CHECKIN', { due, checkIn }), 1000);

        // Return the data returned from the API so UI can access it
        return data;
    })
}

/*
 * function group()
 *
 * API call to send a check-in with a group for a user
 *
 */
const group = async (userId, groupId, text) => {
    // The end point to call and to use for hashing our secret key
    const endPoint = 'checkin/group';

    // Generate a signed API request using our shared secret key
    const signatureStr = endPoint + process.env.API_SIGNATURE_SHARED_SECRET + userId + groupId + text;
    const signature = MD5(signatureStr).toString();

    // Post to the user endpoint
    return Https.postRequest(endPoint, {
        body: {
            userId,
            groupId,
            text,
            signature,
        }
    }).then(async (response) => {
        // Check the returned response codes to determine if we had a http/server error (will raise exceptions)
        Https.checkResponseErrorCodes(response);
        
        // Update the newly fetched check-in data store
        const data = JSON.parse(response.content);
        const checkIns = data.checkIns;
        const checkInIds = [];
        
        // Show debug output
        if (process.env.DEBUG_API) {
            console.info('Returned content from API', data);
        };

        // Will return an array of check-in objects, loop over them
        checkIns.forEach(async (c) => {
            // Save the checkInIds
            checkInIds.push(c.checkIn.checkInId);

            // Update the check-in store with the new check-in data
            await store.dispatch('CheckIns/SET_CHECKIN', c.checkIn);

            // We update the contact to set the last check-in time and checkInId reference, and update their due date
            // We update this on a timer so any updates to UI show before the return list might get rerendered because the ordering may have changed
            setTimeout(async () => await store.dispatch('Contacts/UPDATE_CHECKIN', { due: c.due, checkIn: c.checkIn }), 1000);
        });

        // We update the group to set the last check-in time and update it's due date
        // We update this on a timer so any updates to UI show before the return list might get rerendered because the ordering may have changed
        const due = data.due;
        setTimeout(async () => await store.dispatch('Groups/UPDATE_CHECKIN', { due, checkInIds }), 1000);

        // Return the data returned from the API so UI can access it
        return data;
    })
}

// Export each API endpoint
export default {
    list,
    yourCheckIns,
    reply,
    person,
    group
};