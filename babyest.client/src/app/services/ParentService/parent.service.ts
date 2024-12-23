import { HttpClient, HttpErrorResponse, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, map, Observable, throwError } from 'rxjs';
import { Parent } from '../../models/parent';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class ParentService {

  p : Parent = { Email:'', Id:0, Kids:[]}; 

  constructor(private http: HttpClient, 
    private router: Router
  ) { }

  getParentInfo() : Observable<Parent> {
    return this.http.get<Parent>('/api/parent/kids').pipe(catchError(this.handleError));
  }

  private handleError = () => {
    this.router.navigateByUrl('signin');
    return throwError(() => new Error("Unauthorized. Please login"));
  }
  // private handleError(error: HttpErrorResponse) {
  //   if (error.status === 0) {
  //     // A client-side or network error occurred. Handle it accordingly.
  //     console.error('An error occurred:', error.error);
  //   } else {
  //     // The backend returned an unsuccessful response code.
  //     // The response body may contain clues as to what went wrong.
  //     console.error(
  //       `Backend returned code ${error.status}, body was: `, error.error);
  //   }

  //   this.router.navigateByUrl('signin');
  //   // Return an observable with a user-facing error message.
  //   return throwError(() => new Error('Something bad happened; please try again later.'));
  // }
}
