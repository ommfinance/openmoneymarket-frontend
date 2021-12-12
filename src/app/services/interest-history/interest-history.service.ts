import { Injectable } from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {InterestHistoryResult} from "../../models/InterestHistoryResult";

@Injectable({
  providedIn: 'root'
})
export class InterestHistoryService {

  constructor(private httpClient: HttpClient) { }

  public getInterestHistory(): Promise<InterestHistoryResult> {
    return this.httpClient.get<InterestHistoryResult>("http://localhost:3000/api/v1/interest-history").toPromise();
  }
}
