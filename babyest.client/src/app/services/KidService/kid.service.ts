import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Kid } from '../../models/kid';
import { CurrentKidService } from '../CurrentKid/current-kid.service';
import { KidActivity } from '../../models/kid-activity';

@Injectable({
  providedIn: 'root'
})
export class KidService {

  constructor(private http: HttpClient, 
    private currentKidService : CurrentKidService
  ) {

   }

  getKidById(kidId: number) : Observable<Kid> {
    const url = 'api/kid/' + this.currentKidService.getCurrentKid();
    
    return this.http.get<Kid>(url);
  }

  getKidActivitiesById(kidId: number) : Observable<KidActivity[]> {
    let url = `api/kid/${kidId}/activity`;
    return this.http.get<KidActivity[]>(url);
  }

  getLastSleepById(kidId: number) : Observable<KidActivity> {
    let url : string = `api/kid/${kidId}/activity/last?actType=sleep`;
    return this.http.get<KidActivity>(url);
  }

  getLastEatingById(kidId: number) : Observable<KidActivity> {
    let url : string = `api/kid/${kidId}/activity/last?actType=eat`;
    return this.http.get<KidActivity>(url);
  }
}
