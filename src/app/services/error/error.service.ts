import { Injectable } from '@angular/core';
import log from "loglevel";
import Timeout = NodeJS.Timeout;

@Injectable({
  providedIn: 'root'
})
export class ErrorService {
  /**
   * A @Service used to keep track of relevant errors, their statuses and is able to resolve them
   */

  // Map containing resolver for each error we want to resolve
  private errorMap: Map<ErrorCode, () => Promise<void>> = new Map<ErrorCode, () => Promise<void>>();

  private intervalTime = 60000; // 60 seconds
  private resolveInterval: any;

  constructor() {}

  registerErrorForResolve(code: ErrorCode, resolver: () => Promise<void>): void {
    log.debug(`Set error: ${code} for resolve with resolver = ${resolver.name}`);
    this.errorMap.set(code, resolver);

    if (this.errorMap.size === 1) {
      this.resolveInterval = setInterval(() => this.triggerErrorResolve(), this.intervalTime);
    }
  }

  deregisterError(code: ErrorCode): void {
    log.debug(`De-registering error: ${code}...`);
    this.errorMap.delete(code);

    if (this.errorMap.size === 0 && this.resolveInterval) {
      clearInterval(this.resolveInterval);
    }
  }

  triggerErrorResolve(): void {
    for (const [errorCode, resolveFunction] of this.errorMap.entries()) {
      log.debug(`Triggering resolve of ${errorCode}...`);
      resolveFunction();
    }
  }

  setInterval(): void {
    this.resolveInterval = setInterval(() => this.triggerErrorResolve(), this.intervalTime);
  }

}

export enum ErrorCode {
  USER_OMM_REWARDS,
  USER_OMM_TOKEN_BALANCE_DETAILS
}
