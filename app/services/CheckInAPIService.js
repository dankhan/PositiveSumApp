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

// Import our custom errors
import BadMethodAPIError from '@/errors/badmethodapierror';
import BadRequestAPIError from '@/errors/badrequestapierror';
import InternalServerAPIError from '@/errors/internalserverapierror';
import NoResponseAPIError from '@/errors/noresponseapierror';
import AuthenticationAPIError from '@/errors/authenticationapierror';
/*import AlreadyActionedAPIError from '@/errors/alreadyactionedapierror';
import InvalidTokenAPIError from '@/errors/invalidtokenapierror';
import ExpiredTokenAPIError from '@/errors/expiredtokenapierror';
import NotExistsAPIError from '@/errors/notexistsapierror';
import CredentialsRevokedAPIError from '@/errors/credentialsrevokedapierror';
*/
import UnsupportedMediaAPIError from '@/errors/unsupportedmediaapierror';

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
        // Update the newly fetched check-in data store
        const data = JSON.parse(response.content);
        const checkin = data.checkin;
        store.dispatch('CheckIn/SET_LIST', { checkin });

        // Return the data returned from the API so UI can access it
        return data;
    })
    .catch((error) => {
        if (error.response) {
            // Request made and server responded
            if (error.response.status === 405 && error.response.data.reason === 'BAD_METHOD') {
                throw new BadMethodAPIError(error.response, error.request. error);
            } else if (error.response.status === 415) {
                throw new UnsupportedMediaAPIError(error.response, error.request. error);
            } else if (error.response.status === 400 && error.response.data.reason === 'BAD_REQUEST') {
                throw new BadRequestAPIError(error.response, error.request. error);
            } else if (error.response.status === 403 && error.response.data.reason === 'AUTHENTICATION_ERROR') {
                throw new AuthenticationAPIError(error.response, error.request. error);
            } else if (error.response.status === 500 && error.response.data.reason === 'INTERNAL_SERVER_ERROR') {
                throw new InternalServerAPIError(error.response, error.request, error);
            } else {
                throw new Error(error);    
            }
        } else if (error.request) {
            // The request was made but no response was received
            throw new NoResponseAPIError(error.request, error);
        } else {
            // Something happened in setting up the request that triggered an Error
            throw new Error(error);
        }
    });
}

// Export each API endpoint
export default {
    list,
};