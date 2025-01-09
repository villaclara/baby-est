import { HttpClient, HttpErrorResponse, HttpHeaders, HttpResponse, HttpStatusCode } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, map, Observable, throwError } from 'rxjs';
import { Parent } from '../../models/parent';
import { Router } from '@angular/router';
import { ErrorHandlerService } from '../ErrorHandler/error-handler.service';
@Injectable({
  providedIn: 'root'
})
export class ParentService {

  p: Parent = { Email: '', Id: 0, Kids: [] };

  baseUrl : string = 'api/parent';
  constructor(private http: HttpClient,
    private router: Router,
  private errorHandler : ErrorHandlerService) { }


   headers1: HttpHeaders = new HttpHeaders({
      'Content-Type': 'application/json'
    });

  getParentInfo(): Observable<Parent> {
    // return this.http.get<Parent>('/api/parent/kids').pipe(catchError(this.handleError));
    // return this.http.get<Parent>('/api/parent/kids');

    const url = this.baseUrl + '/kids';
    return this.http.get<Parent>(url).pipe(
      catchError((err) => this.errorHandler.handle(err))
    );
  }

  addNewParentToKid(kidId : number, newParentEmail : string) : Observable<any> { 
    const url = this.baseUrl + '/addparent';
    return this.http.post(url, JSON.stringify(
      { 
        kidId : kidId, 
        pEmail : newParentEmail
      }),
    { headers : this.headers1 }).pipe(
      catchError(err => this.errorHandler.handle(err))
    );
  }
}


