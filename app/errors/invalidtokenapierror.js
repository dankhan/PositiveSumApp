/**
 * Error object to represent an invalid token sent to the API
 *
 * Creates and returns a new error object
 * 
 * @file   Error object to represent an invalid token sent to the API
 * @author <dan.khan@gmail.com>
 * @since  1.0.0
 * @copyright (c) 2023 All rights reserved.
 * 
 */

 const InvalidTokenAPIError = function InvalidTokenAPIError (response = null, cause = null) {
  // Ensure the name of this error is the same as the class name
  this.name = 'InvalidTokenAPIError';
  
  // Save the response data in the error
  this.data = { response, cause };

  // If there's an error message specified in our response data, set this error message
  this.message = (response.content && response.content.error ? response.content.error : (response.content && response.content.message ? response.content.message : cause.message));

  // If there's a response reason specified in our response data, set this
  this.reason = (response.content && response.content.reason ? response.content.reason : 'INVALID_TOKEN');

  // Capture the stack trace
  this.stack = (new Error()).stack;
};

InvalidTokenAPIError.prototype = new Error();
InvalidTokenAPIError.prototype.constructor = InvalidTokenAPIError;

export default InvalidTokenAPIError;