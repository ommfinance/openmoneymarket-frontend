/*
*  This class wraps up an external error and provides user friendly message
*/
export class OmmError extends Error {
  error?: any;
  userFriendlyMessage: string;
  code: number;

  constructor(userFriendlyMessage: string = "Unknown error occurred! Try again later.", externalError?: any, code = 0) {
    super(userFriendlyMessage);
    this.name = 'OmmError';
    this.userFriendlyMessage = userFriendlyMessage;
    this.error = externalError;
    this.code = code;

    Object.setPrototypeOf(this, new.target.prototype); // restore prototype chain
  }
}
