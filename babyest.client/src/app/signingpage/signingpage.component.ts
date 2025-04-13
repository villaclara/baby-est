import { Component, ViewChild } from '@angular/core';
import { Form, FormsModule, NgForm } from '@angular/forms'
import { AuthService } from '../services/AuthService/auth.service';
import { UserFormData } from '../models/user-form-data';
import { Router } from '@angular/router';
import { NgIf } from '@angular/common';
import { ChangepasswordComponent } from "./changepassword/changepassword.component";
import { animate, state, style, transition, trigger } from '@angular/animations';


@Component({
  selector: 'app-signingpage',
  templateUrl: './signingpage.component.html',
  styleUrl: './signingpage.component.css',
  standalone: true,
  imports: [FormsModule, NgIf, ChangepasswordComponent],
  animations: [
    //  // Shift entire page content upward
    //  trigger('pageShift', [
    //   state('in', style({ transform: 'translateY(0)', opacity: 1})),
    //   state('out', style({ transform: 'translateY(-100%)', opacity: 0})),
    //   transition('in => out', animate('400ms ease-in')),
    //   transition('out => in', animate('400ms ease-out')),
    // ]),


     // Shift entire page content upward
     trigger('pageShift', [
      state('in', style({ 'margin-top': '0', opacity: 1})),
      state('out', style({ 'margin-top': '-120%', opacity: 0})),
      transition('in => out', animate('400ms ease-in')),
      transition('out => in', animate('400ms ease-out')),
    ]),



    // Slide child from bottom to center
    trigger('childSlideIn', [
      transition(':enter', [
        style({ transform: 'translateY(100%)' }),
        animate('500ms ease-out', style({ transform: 'translateY(0)'})),
      ]),
      transition(':leave', [
        animate('500ms ease-in', style({ transform: 'translateY(100%)'})),
      ]),
    ])
   
  ]
})
export class SigningpageComponent {

  constructor(private authService: AuthService,
    private router: Router
  ) { }

  // login/register stuff
  user = new UserFormData('', '');
  
  // for access the loginForm object in ts code. used in resetting valid.
  @ViewChild('loginForm') signForm!: NgForm;


  confirmPassword: string = "";
  
  isActionLoading: boolean = false;
  isPasswordResetValidationAsked: boolean = false;
  isChangePassword: boolean = false;

  passwordResetResponseMessage: string = '';

  private secret: number = 0;

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

    // reset all booleans to default when clicked on Login/Register
    this.isActionLoading = false;
    this.isChangePassword = false;
    this.isPasswordResetValidationAsked = false;
    this.clearErrorMessage();

    if (this.isRegistering) {
      this.regbutclass = "";
      this.logbutclass = "notactive";
    }
    else {
      this.logbutclass = "";
      this.regbutclass = "notactive";
    }
  }

  forgotPasswordClick(): void {
    this.isPasswordResetValidationAsked = true;
  }

  returnBackPressedInChild(isPressed: boolean)
  {
    if(isPressed)
    {
      console.log('rerutn back ispasswordreset = false');
      this.isPasswordResetValidationAsked = false;
      this.errorMessage = '';
      this.isRegistering = false;
      this.user.email = '';
      this.user.password = '';

      // reset form validation for LoginForm
      Object.values(this.signForm.controls).forEach(control => {
        control.markAsUntouched();
        control.markAsPristine();
        control.setErrors(null); // optional: clears all validation errors
      });
    }


  }

}

