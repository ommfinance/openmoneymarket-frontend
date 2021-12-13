import { Injectable } from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {InterestHistoryResult} from "../../models/InterestHistoryResult";
import {InterestHistoryRecord} from "../../models/InterestHistoryRecord";
import {environment} from "../../../environments/environment";

@Injectable({
  providedIn: 'root'
})
export class InterestHistoryService {

  constructor(private httpClient: HttpClient) { }

  public getInterestHistory(): Promise<InterestHistoryResult> {
    return this.httpClient.get<InterestHistoryResult>(environment.ommRestApi + "/interest-history").toPromise();
  }

  public getAverageInterests(interestHistoryRecord: InterestHistoryRecord[]): {supplyApy: number, borrowApr: number} {
    let supplyApySum = 0;
    let borrowAprSum = 0;
    let counter = 0;

    interestHistoryRecord.forEach(record => {
      counter++;
      supplyApySum += record.supplyApy;
      borrowAprSum += record.borrowApr;
    });

    return { supplyApy: supplyApySum / counter, borrowApr: borrowAprSum / counter};
  }
}
