/**
 * API Middleware for Group- related API functions
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
 * API call to get a group for a user
 *
 */
const get = async (userId, groupId, updateStore=true ) => {
    // The end point to call and to use for hashing our secret key
    const endPoint = 'group/get';

    // Generate a signed API request using our shared secret key
    const signatureStr = endPoint + process.env.API_SIGNATURE_SHARED_SECRET + userId + groupId;
    const signature = MD5(signatureStr).toString();

    // Post to the user endpoint
    return Https.postRequest(endPoint, {
        body: {
            userId,
            groupId,
            signature,
        }
    }).then(async (response) => {
        // Check the returned response codes to determine if we had a http/server error (will raise exceptions)
        Https.checkResponseErrorCodes(response);
        
        // Add/update the person to the store (only do if this isn't triggered from the store)
        const data = JSON.parse(response.content);
        const group = data.group;

        // Show debug output
        if (process.env.DEBUG_API) {
            console.info('Returned content from API', data);
        };

        if (updateStore) {
            await store.dispatch('Group/SET_GROUP', group);
        }

        // Return the data returned from the API so UI can access it
        return data;
    });
}

/*
 * function add()
 *
 * API call to add a new group for a user
 *
 */
const add = async (userId, groupName, frequency) => {
    // The end point to call and to use for hashing our secret key
    const endPoint = 'group/add';

    // Generate a signed API request using our shared secret key
    const signatureStr = endPoint + process.env.API_SIGNATURE_SHARED_SECRET + userId + groupName + frequency;
    const signature = MD5(signatureStr).toString();
    
    // Post to the user endpoint
    return Https.postRequest(endPoint, {
        body: {
            userId,
            groupName,
            frequency,
            signature
        }
    }).then(async (response) => {
        // Check the returned response codes to determine if we had a http/server error (will raise exceptions)
        Https.checkResponseErrorCodes(response);
        
        // Update the newly fetched check-in data store
        const data = JSON.parse(response.content);
        const group = data.group;

        // Show debug output
        if (process.env.DEBUG_API) {
            console.info('Returned content from API', data);
        };
        
        await store.dispatch('Groups/SET_GROUP', { group });

        // Return the data returned from the API so UI can access it
        return data;
    })
}

// Export each API endpoint
export default {
    add, get
};