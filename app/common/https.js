/**
 * XML-RPC library
 *
 * Creates a singleton instance for the nativescript-community/https xml-rpc library
 * 
 * Note: Response data includes response.statusCode, response.headers, and response.content
 *
 * @file   XML-RPC library
 * @author <dan.khan@gmail.com>
 * @since  1.0.0
 * @copyright (c) 2022 All rights reserved.
 * 
 */

// Common imports
import * as Https from '@nativescript-community/https';
import * as fs from '@nativescript/core/file-system';

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

// Create new global instance of the xml-http request object
let sslPinningEnabled = false;

function baseUrl(url) {
  return process.env.BASE_URL_API + url;
}

function createRequest(url, options) {
  return Https.createRequest({
    url: baseUrl(url),
    method: 'GET',
    timeout: 10,
    ...options
  });
}

function createPostRequest(url, options) {
  return Https.createRequest({
    url: baseUrl(url),
    method: 'POST',
    timeout: 10,
    ...options
  });
}

function getRequest(url, options) {
  if (process.env.DEBUG_API) {
    console.info('Making GET API request to ' + url, options);
  }
  
  return Https.request({
      url: baseUrl(url),
      method: 'GET',
      timeout: 10,
      ...options
  });
}

function postRequest(url, options) {
  if (process.env.DEBUG_API) {
    console.info('Making POST API request to ' + url, options);
  }
  
  const result = Https.request({
      url: baseUrl(url),
      method: 'POST',
      timeout: 10,
      ...options
  });

  return result;
}

function enableSSLPinning() {
  const dir = fs.knownFolders.currentApp().getFolder('assets');
  const path = fs.path.join(dir.path, "certificates");
  const certificate = path.getFile(process.env.BASE_URL_API).path;
  Https.enableSSLPinning({
      host: process.env.API_SSL_CERTIFICATE_HOST,
      commonName: process.env.API_SSL_CERTIFICATE_COMMON_NAME,
      certificate
  });
  sslPinningEnabled = true;
}

function disableSSLPinning() {
  Https.disableSSLPinning();
  sslPinningEnabled = false;
}

function checkResponseErrorCodes(response) {
  if (response && response.statusCode) {
    // Request made and server responded
    if (response.statusCode === 405 && response.content.reason === 'BAD_METHOD') {
        throw new BadMethodAPIError(response);
    } else if (response.statusCode === 415) {
        throw new UnsupportedMediaAPIError(response);
    } else if (response.statusCode === 400 && response.content.reason === 'BAD_REQUEST') {
        throw new BadRequestAPIError(response);
    } else if (response.statusCode === 403 && response.content.reason === 'AUTHENTICATION_ERROR') {
        throw new AuthenticationAPIError(response);
    } else if (response.statusCode === 500 && response.content.reason === 'INTERNAL_SERVER_ERROR') {
        throw new InternalServerAPIError(response);
    } else if (response.statusCode >= 300) {
        // Some other non-success code
        throw new Error('Recieved http ' + response.statusCode);
    }
  }
}

function getResponseErrorMessage(error) {
  let retData = { errorMessage: '', connectError: false };

  if (error instanceof NoResponseAPIError ) {
    retData.errorMessage = 'We couldn\'t contact the server. Please check your Internet connection or try again later.';
    retData.connectError = true;
  } else if (error instanceof UnsupportedMediaAPIError) {
    retData.errorMessage = 'We encountered a server problem, please try again later';
  } else if (error instanceof BadMethodAPIError) {
    retData.errorMessage = 'We encountered a technical problem, please try again later';
  } else if (error instanceof BadRequestAPIError) {
    retData.errorMessage = 'We encountered a problem, please try again later';
  } else if (error instanceof AuthenticationAPIError) {
    retData.errorMessage = 'We encountered an authentication problem, please logout and try again';
  } else if (error instanceof InternalServerAPIError) {
    retData.errorMessage = 'We encountered a server problem, please try again later';
  } else {
    retData.errorMessage = 'There was a problem, please try again later';
  }

  return retData;
}

export { createRequest, createPostRequest, getRequest, postRequest, enableSSLPinning, disableSSLPinning, sslPinningEnabled, checkResponseErrorCodes, getResponseErrorMessage };