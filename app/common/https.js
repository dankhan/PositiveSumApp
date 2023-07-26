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

function getRequest(url, options) {
  return Https.request({
      url: baseUrl(url),
      method: 'GET',
      timeout: 10,
      ...options
  });
}

function postRequest(url, options) {
  return Https.request({
      url: baseUrl(url),
      method: 'POST',
      timeout: 10,
      ...options
  });
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

export { createRequest, getRequest, postRequest, enableSSLPinning, disableSSLPinning, sslPinningEnabled };