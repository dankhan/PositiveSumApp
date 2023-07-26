/**
 * Error object to represent an api request that is already actioned
 *
 * Creates and returns a new error object
 * 
 * @file   Error object to represent an api request that is already actioned
 * @author <dan.khan@gmail.com>
 * @since  1.0.0
 * @copyright (c) 2023 All rights reserved.
 * 
 */

 const AlreadyActionedAPIError = function AlreadyActionedAPIError (response = null, request = null, cause = null) {
  // Ensure the name of this error is the same as the class name
  this.name = 'AlreadyActionedAPIError';
  
  // Save the response data in the error
  this.data = { response, request, cause };

  // If there's an error message specified in our response data, set this error message
  this.message = (response.data && response.data.error ? response.data.error : (response.data && response.data.message ? response.data.message : cause.message));

  // If there's a response reason specified in our response data, set this
  this.reason = (response.data && response.data.reason ? response.data.reason : 'ALREADY_ACTIONED');

  // Capture the stack trace
  this.stack = (new Error()).stack;
};

AlreadyActionedAPIError.prototype = new Error();
AlreadyActionedAPIError.prototype.constructor = AlreadyActionedAPIError;

export default AlreadyActionedAPIError;