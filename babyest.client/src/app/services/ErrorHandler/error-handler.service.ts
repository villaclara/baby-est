import { HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ErrorHandlerService {

  constructor(private router: Router) { }

  public handle(error: HttpErrorResponse): Observable<never> {

    if (error.status === 401 || error.status === 403) {
      // Unathorized or Forbidden - redirect to signin page.
      console.error("status 401 in parent service");
      // this.router.navigateByUrl('signin');
      return throwError(() => new Error(error.status.toString()));
    }
    else {
      // if error.status === 0 (client-side or network error).
      // if error.status === 404 or 500 or whatever (internal error).
      console.error(`Backend returned code ${error.status}, body was: `, error.error);
      return throwError(() => new Error("Внутрішня помилка. Будь ласка, оновіть сторінку."));
    }
  }
}
