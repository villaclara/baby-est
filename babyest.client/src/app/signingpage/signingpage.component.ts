import { HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Component } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms'
import { catchError, map, ObservableInput, tap, throwError } from 'rxjs';
import { AuthService } from '../services/AuthService/auth.service';
import { UserFormData } from '../models/user-form-data';
import { Router } from '@angular/router';
import { NgIf } from '@angular/common';


@Component({
  selector: 'app-signingpage',
  templateUrl: './signingpage.component.html',
  styleUrl: './signingpage.component.css',
  standalone: true,
  imports: [FormsModule, NgIf]
})
export class SigningpageComponent {

  constructor(private authService: AuthService,
    private router: Router
  ) { }

  // login/register stuff
  user = new UserFormData('', '');
  confirmPassword: string = "";

  isActionLoading: boolean = false;

  login() {

    this.isActionLoading = true;
    // The result is StatusCode with Text "Logged in" or "Incorrect credentials". We display the result text based on statuscode.
    this.authService.tryLogin(new UserFormData(this.user.email, this.user.password))
      .subscribe({
        // success
        next: async (data: any) => {
          this.errorMessage = data;
          this.isActionLoading = false;
          await new Promise(f => setTimeout(f, 1000));
          this.router.navigateByUrl('');
        },
        // error
        error: (err: any) => {
          this.isActionLoading = false;
          this.errorMessage = err.error;
        }
      });

    // this.http.post('/auth/login', JSON.stringify({email: this.user.email, password: this.user.password}), { headers: this.headers1})
    // .pipe(map((data:any) => { this.errorMessage = "EROR" + data.toString(); }), 
    // catchError((error) => { console.log("bruh"); console.log(error); return []}))
    // .subscribe((data : any) => this.errorMessage = "DATA" + data.toString());
  }


  clearErrorMessage(): void {
    this.errorMessage = '';
  }

  register() {
    this.isActionLoading = true;
    // The result is StatusCode with Text "Logged in" or "Incorrect credentials". We display the result text based on statuscode.
    this.authService.tryRegister(this.user)
      .subscribe({
        // success
        next: (data: any) => {
          this.isActionLoading = false;
          this.errorMessage = data + "Please login.";
          this.isRegistering = false;
        },
        // error
        error: (err: any) => {
          this.isActionLoading = false;
          this.errorMessage = err.error;
        }
      });
  }

  errorMessage: string = "";

  // show/hide the login/register form and highlight it
  isRegistering: boolean = false;
  logbutclass: string = "";
  regbutclass: string = "notactive";
  changeRegistering(value: boolean) {
    this.isRegistering = value;
    if (this.isRegistering) {
      this.regbutclass = "";
      this.logbutclass = "notactive";
    }
    else {
      this.logbutclass = "";
      this.regbutclass = "notactive";
    }
  }

}

