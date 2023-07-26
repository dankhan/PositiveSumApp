/**
 * Error object to represent no response from an API request error
 *
 * Creates and returns a new error object
 * 
 * @file   Error object to represent no response from an API request error
 * @author <dan.khan@gmail.com>
 * @since  1.0.0
 * @copyright (c) 2023 All rights reserved.
 * 
 */

const NoResponseAPIError = function NoResponseAPIError (request = null, cause = null) {
  // Ensure the name of this error is the same as the class name
  this.name = 'NoResponseAPIError';
  
  // Save the response data in the error
  this.data = { request, cause };

  // If there's an error message specified in our response data, set this error message
  this.message = cause ? cause.message : '';

  // Capture the stack trace
  this.stack = (new Error()).stack;
};

NoResponseAPIError.prototype = new Error();
NoResponseAPIError.prototype.constructor = NoResponseAPIError;

export default NoResponseAPIError;