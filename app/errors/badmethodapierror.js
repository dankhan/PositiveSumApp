/**
 * Error object to represent an api request that has been called with the wrong http method verb
 * Creates and returns a new error object
 * 
 * @file   Error object to represent an api request that has been called with the wrong http method verb
 * @author <dan.khan@gmail.com>
 * @since  1.0.0
 * @copyright (c) 2023 All rights reserved.
 * 
 */

 const BadMethodAPIError = function BadMethodAPIError (response = null, request = null, cause = null) {
  // Ensure the name of this error is the same as the class name
  this.name = 'BadMethodAPIError';
  
  // Save the response data in the error
  this.data = { response, request, cause };

  // If there's an error message specified in our response data, set this error message
  this.message = (response.data && response.data.error ? response.data.error : (response.data && response.data.message ? response.data.message : cause.message));

  // If there's a response reason specified in our response data, set this
  this.reason = (response.data && response.data.reason ? response.data.reason : 'AUTHENTICATION_ERROR');

  // Capture the stack trace
  this.stack = (new Error()).stack;
};

BadMethodAPIError.prototype = new Error();
BadMethodAPIError.prototype.constructor = BadMethodAPIError;

export default BadMethodAPIError;