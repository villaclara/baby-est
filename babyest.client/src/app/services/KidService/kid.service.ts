import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, Observable } from 'rxjs';
import { Kid } from '../../models/kid';
import { CurrentKidService } from '../CurrentKid/current-kid.service';
import { KidActivity } from '../../models/kid-activity';
import { ErrorHandlerService } from '../ErrorHandler/error-handler.service';

@Injectable({
  providedIn: 'root'
})
export class KidService {

  constructor(private http: HttpClient,
    private currentKidService: CurrentKidService,
    private errorHandler: ErrorHandlerService) {

  }

  headers1: HttpHeaders = new HttpHeaders({
    'Content-Type': 'application/json'
  });

  getKidById(kidId: number): Observable<Kid> {
    const url = 'api/kid/' + kidId;

    return this.http.get<Kid>(url);
  }

  addKid(kid: Kid): Observable<any> {
    return this.http.post<Kid>(`api/kid`, JSON.stringify({
      Name: kid.Name,
      BirthDate: kid.BirthDate,
      Activities: [],
      Parents: []
    }),
      { headers: this.headers1 }).pipe(
        catchError(err => this.errorHandler.handle(err))
      );
  }

  updateKid(kid: Kid, kidId : number) : Observable<any> {
    const url = `api/kid/${kidId}`;
    return this.http.put<Kid>(url, JSON.stringify({
      Name : kid.Name,
      BirthDate : kid.BirthDate,
      Activities : [],
      Parents: []
    }),
    { 
      headers: this.headers1 
    }).pipe(
      catchError(err => this.errorHandler.handle(err))
    );
  }

  deleteKidById(kidId : number) : Observable<any> {
    const url = `api/kid/${kidId}`;
    return this.http.delete(url);
  }

  getKidActivitiesById(kidId: number): Observable<KidActivity[]> {
    let url = `api/kid/${kidId}/activity`;
    return this.http.get<KidActivity[]>(url).pipe(
      catchError(err => this.errorHandler.handle(err))
    );
  }

  getLastSleepByKidId(kidId: number): Observable<KidActivity> {
    let url: string = `api/kid/${kidId}/activity/last?actType=sleep`;
    return this.http.get<KidActivity>(url).pipe(
      catchError(err => this.errorHandler.handle(err))
    );
  }

  getLastEatingByKidId(kidId: number): Observable<KidActivity> {
    let url: string = `api/kid/${kidId}/activity/last?actType=eat`;
    return this.http.get<KidActivity>(url).pipe(
      catchError(err => this.errorHandler.handle(err))
    );
  }

  addActivityToKid(kidId: number, activity: KidActivity): Observable<any> {
    let url = `api/kid/${kidId}/activity`;
    return this.http.post(url, JSON.stringify({
      id: 0,
      activityType: activity.ActivityType,
      startDate: activity.StartDate,
      endDate: activity.EndDate,
      isActiveNow: activity.IsActiveNow,
      kidName: activity.KidName
    }),
      { headers: this.headers1 }).pipe(
        catchError(err => this.errorHandler.handle(err))
      );
  }

  updateActivity(kidId: number, activity: KidActivity): Observable<any> {
    let url = `api/kid/${kidId}/activity/${activity.Id}`;
    return this.http.put(url, JSON.stringify({
      id: activity.Id,
      activityType: activity.ActivityType,
      startDate: activity.StartDate,
      endDate: activity.EndDate,
      isActiveNow: activity.IsActiveNow,
      kidName: activity.KidName
    }),
      { headers: this.headers1 }).pipe(
        catchError(err => this.errorHandler.handle(err))
      );
  }
}
