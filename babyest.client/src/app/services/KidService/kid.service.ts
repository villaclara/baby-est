import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, Observable } from 'rxjs';
import { Kid } from '../../models/kid';
import { CurrentKidService } from '../CurrentKid/current-kid.service';
import { KidActivity } from '../../models/kid-activity';
import { ErrorHandlerService } from '../ErrorHandler/error-handler.service';
import { formatDate } from '@angular/common';

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


  getKidsForParent() : Observable<Kid[]> {
    const url = `api/kid`;
    return this.http.get<Kid[]>(url);
  }

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


  //
  // Activities region 

  getKidActivitiesById(kidId: number): Observable<KidActivity[]> {
    let url = `api/kid/${kidId}/activity`;
    return this.http.get<KidActivity[]>(url).pipe(
      catchError(err => this.errorHandler.handle(err))
    );
  }


  getLastSomeValueKidActivitiesById(kidId: number, actsCount: number): Observable<KidActivity[]> {
    let url = `api/kid/${kidId}/activity?last=${actsCount}`;
    return this.http.get<KidActivity[]>(url).pipe(
      catchError(err => this.errorHandler.handle(err))
    );
  }

  getForDaysKidActivitiesById(kidId: number, forDays: number): Observable<KidActivity[]> {
    let url = `api/kid/${kidId}/activity?forDays=${forDays}`;
    return this.http.get<KidActivity[]>(url).pipe(
      catchError(err => this.errorHandler.handle(err))
    );
  }

  getKidActivitiesWithParams(
    kidId: number, options: {
      lastDays?: number,
      forDays?: number,
      fromDate?: string,
      toDate?: string
    }): Observable<KidActivity[]> {
    let url = `api/kid/${kidId}/activity`;

    let params = this.createUrlWithQueryParams({ 
      last: options.lastDays,
      forDays: options.forDays,
      fromDate: options.fromDate,
      toDate: options.toDate
    });

    return this.http.get<KidActivity[]>(url, { params }).pipe(
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

  deleteActivity(kidId: number, activityId: number) : Observable<any> {
    let url = `api/kid/${kidId}/activity/${activityId}`;
    return this.http.delete(url).pipe(
      catchError(err => this.errorHandler.handle(err))
    );
  }


  // Create URL link with query params
  createUrlWithQueryParams(
    options: { 
      last?: number, 
      forDays?: number, 
      fromDate?: string, 
      toDate?: string 
    }): HttpParams
  {
    let params = new HttpParams();

    if(options.last)
    {
      params = params.set('last', options.last);
    }

    if(options.forDays)
    {
      params = params.set('forDays', options.forDays);
    }

    if(options.fromDate)
    {
      params = params.set('fromDate', options.fromDate);
    }

    if(options.toDate)
    {
      params = params.set('toDate', options.toDate);
    }

    return params;
  }
}
