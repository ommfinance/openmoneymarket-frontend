import {ErrorHandler, Injectable} from "@angular/core";
import {ErrorCodes} from "./error-codes";
import {OmmError} from "./OmmError";
import {DataLoaderService} from "../../services/data-loader/data-loader.service";

@Injectable()
export class GlobalErrorHandler implements ErrorHandler {

  private errorCodeToHandlerMap: Map<ErrorCodes, () => void> = new Map([
    [ErrorCodes.ALL_SCORE_ADDRESSES_NOT_LOADED, () => this.handleScoreAddressesNotLoaded()],
      [ErrorCodes.ALL_SCORE_ADDRESSES_NOT_LOADED, () => this.handleUserNotLoggedIn()],
  ]);

  constructor(private dataLoaderService: DataLoaderService) {}

  handleError(error: Error): void {
    if (error instanceof OmmError && this.errorCodeToHandlerMap.get(error.code)) {
      this.errorCodeToHandlerMap.get(error.code);
    } else {
      alert(error.message || "Undefined client error");
      console.error("Error from global error handler", error);
    }
  }

  private handleScoreAddressesNotLoaded(): void {
    this.dataLoaderService.loadAllScoreAddresses();
    alert("All score addresses not loaded. Try again in few moments");
  }

  private handleUserNotLoggedIn(): void {
    alert("User not logged in. Please log in and try again.");
    // TODO show log in dialog
  }
}
