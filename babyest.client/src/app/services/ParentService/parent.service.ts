import { HttpClient, HttpErrorResponse, HttpResponse, HttpStatusCode } from '@angular/common/http';
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

  constructor(private http: HttpClient,
    private router: Router,
  private errorHandler : ErrorHandlerService) { }

  getParentInfo(): Observable<Parent> {
    // return this.http.get<Parent>('/api/parent/kids').pipe(catchError(this.handleError));
    // return this.http.get<Parent>('/api/parent/kids');

    return this.http.get<Parent>('/api/parent/kids').pipe(
      catchError((err) => this.errorHandler.handle(err))
    );
  }
}


