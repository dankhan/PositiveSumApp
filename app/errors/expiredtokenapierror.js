/**
 * Error object to represent an expired access token API error
 *
 * Creates and returns a new error object
 * 
 * @file   Error object to represent an expired access token API error
 * @author <dan.khan@gmail.com>
 * @since  1.0.0
 * @copyright (c) 2023 All rights reserved.
 * 
 */

const ExpiredTokenAPIError = function ExpiredTokenAPIError (response = null, request = null, cause = null) {
  // Ensure the name of this error is the same as the class name
  this.name = 'ExpiredTokenAPIError';
  
  // Save the response data in the error
  this.data = { response, request, cause };

  // If there's an error message specified in our response data, set this error message
  this.message = (response.data && response.data.error ? response.data.error : (response.data && response.data.message ? response.data.message : cause.message));

  // If there's a response reason specified in our response data, set this
  this.reason = (response.data && response.data.reason ? response.data.reason : 'EXPIRED_TOKEN');

  // Capture the stack trace
  this.stack = (new Error()).stack;
};

ExpiredTokenAPIError.prototype = new Error();
ExpiredTokenAPIError.prototype.constructor = ExpiredTokenAPIError;

export default ExpiredTokenAPIError;