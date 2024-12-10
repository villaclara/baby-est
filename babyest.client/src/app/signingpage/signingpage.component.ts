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


  isRegistering: boolean = false;
  logbutclass: string = "";
  regbutclass: string = "notactive";
  confirmPassword: string = "";

  login (form: NgForm) {
    
  }

  register (form: NgForm) {
    
  }

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

