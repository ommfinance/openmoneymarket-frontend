import {ErrorHandler, NgModule} from '@angular/core';
import { CommonModule } from '@angular/common';
import {HTTP_INTERCEPTORS} from "@angular/common/http";
import {GlobalErrorHandler} from "./global-error-handler";
import {HttpErrorInterceptor} from "./http-error-interceptor";



@NgModule({
  declarations: [],
  imports: [
    CommonModule
  ],

  // register the classes for the error interception here
  providers: [
    {
      // processes all errors
      provide: ErrorHandler,
      useClass: GlobalErrorHandler
    },
    {
      // interceptor for HTTP errors
      provide: HTTP_INTERCEPTORS,
      useClass: HttpErrorInterceptor,
      multi: true // multiple interceptors are possible
    }
  ]
})
export class ErrorHandlerModule { }
