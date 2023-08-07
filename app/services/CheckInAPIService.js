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
        const checkin = data.checkin;
        store.dispatch('CheckIn/SET_LIST', { checkin });

        // Return the data returned from the API so UI can access it
        return data;
    })
}

// Export each API endpoint
export default {
    list,
};