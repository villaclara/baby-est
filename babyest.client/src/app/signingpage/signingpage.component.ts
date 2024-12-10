import { Component } from '@angular/core';
import {FormsModule, NgForm} from '@angular/forms'

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

  user = new UserFormInput('', '');


  isRegistering: boolean = true;

  confirmPassword: string = "";

  login (form: NgForm) {
    
  }

  register (form: NgForm) {
    
  }

  changeRegistering (value: boolean) {
    this.isRegistering = value;
  }
}

