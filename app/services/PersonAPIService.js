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
//import store from '@/store/index';
import { MD5 } from 'crypto-es/lib/md5.js';

/*
 * function update ()
 *
 * API call to get update a person (contact) for a user
 *
 */
const update = async (userId, { name, email, dialCode, phone, countryCode, nationalNumber, frequency }) => {
    // The end point to call and to use for hashing our secret key
    const endPoint = 'person/update';

    // Generate a signed API request using our shared secret key
    const signatureStr = endPoint + process.env.API_SIGNATURE_SHARED_SECRET + userId +
        name ? name : '' + 
        email ? email : '' + 
        dialCode ? dialCode : '' + 
        phone ? phone : '' + 
        countryCode ? countryCode : '' + 
        nationalNumber ? nationalNumber : '' + 
        frequency ? frequency : '';
    const signature = MD5(signatureStr).toString();

    // Build the update object based on what we're updating - we only update single field at a time
    let data = null;
    data = name ? { name } : null;
    data = email ? { email } : null;
    data = frequency ? { frequency } : null;
    data = phone ? { dialCode, phone, countryCode, nationalNumber } : null;

    // Post to the user endpoint
    return Https.postRequest(endPoint, {
        body: {
            userId,
            signature,
            data
        }
    }).then((response) => {
        // Check the returned response codes to determine if we had a http/server error (will raise exceptions)
        Https.checkResponseErrorCodes(response);
        
        // Update the newly fetched check-in data store
        const data = JSON.parse(response.content);
        const person = data.person;
        //store.dispatch('Person/UPDATE', { person });          // TODO: update this user's details in the person store

        // Return the data returned from the API so UI can access it
        return data;
    })
}

/*
 * function update ()
 *
 * API call to remove a person from a group for a user
 *
 */
const removeGroup = async (userId, groupId) => {
    // The end point to call and to use for hashing our secret key
    const endPoint = 'person/removeGroup';

    // Generate a signed API request using our shared secret key
    const signatureStr = endPoint + process.env.API_SIGNATURE_SHARED_SECRET + userId + groupId;
    const signature = MD5(signatureStr).toString();

    // Post to the user endpoint
    return Https.postRequest(endPoint, {
        body: {
            userId,
            groupId,
            signature
        }
    }).then((response) => {
        // Check the returned response codes to determine if we had a http/server error (will raise exceptions)
        Https.checkResponseErrorCodes(response);
        
        // Extract JSON from the response
        const data = JSON.parse(response.content);

        // Update the newly fetched check-in data store
        //store.dispatch('Person/REMOVE_GROUP', { groupId });          // TODO: remove this group from the user in the person store
        
        // Return the data returned from the API so UI can access it
        return data;
    });
}

const addUserToGroup = async (userId, userToAddId, groupId) => {
    // The end point to call and to use for hashing our secret key
    const endPoint = 'person/addUserToGroup';

    // Generate a signed API request using our shared secret key
    const signatureStr = endPoint + process.env.API_SIGNATURE_SHARED_SECRET + userId + userToAddId + groupId;
    const signature = MD5(signatureStr).toString();

    // Post to the user endpoint
    return Https.postRequest(endPoint, {
        body: {
            userId,
            userToAddId,
            groupId,
            signature
        }
    }).then((response) => {
        // Check the returned response codes to determine if we had a http/server error (will raise exceptions)
        Https.checkResponseErrorCodes(response);
        
        // Extract JSON from the response
        const data = JSON.parse(response.content);

        // Remove the user from the local user groups store
        //store.dispatch('Person/REMOVE_GROUP', { groupId });          // TODO: remove this user from the group in the person store
        
        // Return the data returned from the API so UI can access it
        return data;
    });
}
// Export each API endpoint
export default {
    update,
    removeGroup,
    addUserToGroup,
};