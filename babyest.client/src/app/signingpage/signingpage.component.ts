import { HttpClient, HttpStatusCode, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Component } from '@angular/core';
import {FormsModule, NgForm} from '@angular/forms'
import { catchError, map, ObservableInput, tap, throwError } from 'rxjs';

class UserFormInput {
  constructor(public email: string, public password: string) { }
}

@Component({
  selector: 'app-signingpage',
  templateUrl: './signingpage.component.html',
  styleUrl: './signingpage.component.css',
  standalone: true,
  imports: [FormsModule]
})
export class SigningpageComponent {

  constructor(private http : HttpClient) {  }

  // login/register stuff
  user = new UserFormInput('', '');
  confirmPassword: string = "";

  httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json',
    })
  }

  headers1: HttpHeaders = new HttpHeaders({
    'Content-Type': 'application/json' });


  login (form: NgForm) {
    // The result is StatusCode with Text "Logged in" or "Incorrect credentials". We display the result text based on statuscode.
    this.http.post('/auth/login', JSON.stringify({ email: this.user.email, password: this.user.password }), { headers: this.headers1 })
      .subscribe({
        // success
        next: (data: any) => {
          this.errorMessage = data;
        },
        // error
        error: (err : any) => {
          this.errorMessage = err.error;
        }
      });

// this.http.post('/auth/login', JSON.stringify({email: this.user.email, password: this.user.password}), { headers: this.headers1})
// .pipe(map((data:any) => { this.errorMessage = "EROR" + data.toString(); }), 
// catchError((error) => { console.log("bruh"); console.log(error); return []}))
// .subscribe((data : any) => this.errorMessage = "DATA" + data.toString());
  }


  clearErrorMessage() {
    this.errorMessage = '';
  }


  private handleError(error: HttpErrorResponse) {
    // if (error.status === 0) {
    //   // A client-side or network error occurred. Handle it accordingly.
    //   console.error('An error occurred:', error.error);
    // } else {
    //   // The backend returned an unsuccessful response code.
    //   // The response body may contain clues as to what went wrong.
    //   console.error(
    //     `Backend returned code ${error.status}, body was: `, error.error);
    // }
    // // Return an observable with a user-facing error message.
    // return throwError(() => new Error('Something bad happened; please try again later.'));
    this.errorMessage = error.message;

  }

  register (form: NgForm) {
    this.http.post('/auth/register', JSON.stringify({email: this.user.email, password: this.user.password}), { headers: this.headers1, observe: 'response' })
    .subscribe(res => { console.log('Response status', res.status);
      this.errorMessage = "Register complete.";
      if(res.status != HttpStatusCode.Ok) 
      {
        this.errorMessage = res.status.toString();
      }
    });
  }

  errorMessage: string = "";

  // show/hide the login/register form and highlight it
  isRegistering: boolean = false;
  logbutclass: string = "";
  regbutclass: string = "notactive";
  changeRegistering (value: boolean) {
    this.isRegistering = value;
    if(this.isRegistering)
    {
      this.regbutclass = "";
      this.logbutclass = "notactive";
    }
    else
    {
      this.logbutclass = "";
      this.regbutclass = "notactive";
    }
  }

  

 
}

