import { HttpClient, HttpHeaders } from '@angular/common/http';
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
    private currentKidService : CurrentKidService) {

   }

    headers1: HttpHeaders = new HttpHeaders({
         'Content-Type': 'application/json' });

  getKidById(kidId: number) : Observable<Kid> {
    const url = 'api/kid/' + this.currentKidService.getCurrentKid();
    
    return this.http.get<Kid>(url);
  }

  getKidActivitiesById(kidId: number) : Observable<KidActivity[]> {
    let url = `api/kid/${kidId}/activity`;
    return this.http.get<KidActivity[]>(url);
  }

  getLastSleepByKidId(kidId: number) : Observable<KidActivity> {
    let url : string = `api/kid/${kidId}/activity/last?actType=sleep`;
    return this.http.get<KidActivity>(url);
  }

  getLastEatingByKidId(kidId: number) : Observable<KidActivity> {
    let url : string = `api/kid/${kidId}/activity/last?actType=eat`;
    return this.http.get<KidActivity>(url);
  }

  addActivityToKid(kidId: number, activity : KidActivity) : Observable<any> {
    let url = `api/kid/${kidId}/activity`;
    return this.http.post(url, JSON.stringify({ 
      id: 0, 
      activityType : activity.ActivityType, 
      startDate : activity.StartDate, 
      endDate : activity.EndDate, 
      isActiveNow : activity.IsActiveNow,
      kidName: activity.KidName }), 
    { headers: this.headers1 });
  }

  updateActivity(kidId: number, activity: KidActivity) : Observable<any> {
    let url = `api/kid/${kidId}/activity/${activity.Id}`;
    return this.http.put(url, JSON.stringify({ 
      id: 0, 
      activityType : activity.ActivityType, 
      startDate : activity.StartDate, 
      endDate : activity.EndDate,
      isActiveNow : activity.IsActiveNow, 
      kidName: activity.KidName }), 
    { headers: this.headers1 });
  }
}
