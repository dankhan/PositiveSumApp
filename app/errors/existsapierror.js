/**
 * Error object to represent an api request to create something that already exists
 *
 * Creates and returns a new error object
 * 
 * @file   Error object to represent an api request to create something that already exists
 * @author <dan.khan@gmail.com>
 * @since  1.0.0
 * @copyright (c) 2023 All rights reserved.
 * 
 */

 const ExistsAPIError = function ExistsAPIError (response = null, cause = null) {
  // Ensure the name of this error is the same as the class name
  this.name = 'ExistsAPIError';
  
  // Save the response data in the error
  this.data = { response, cause };

  // If there's an error message specified in our response data, set this error message
  this.message = (response.content && response.content.error ? response.content.error : (response.content && response.content.message ? response.content.message : cause.message));

  // If there's a response reason specified in our response data, set this
  this.reason = (response.content && response.content.reason ? response.content.reason : 'EXISTS');

  // Capture the stack trace
  this.stack = (new Error()).stack;
};

ExistsAPIError.prototype = new Error();
ExistsAPIError.prototype.constructor = ExistsAPIError;

export default ExistsAPIError;