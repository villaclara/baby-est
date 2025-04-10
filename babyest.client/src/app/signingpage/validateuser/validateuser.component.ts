import { Component, EventEmitter, Output } from '@angular/core';
import { NgModel, FormsModule } from '@angular/forms';
import { VerifyUserModel } from '../../models/verify-user-model';
import { AuthService } from '../../services/AuthService/auth.service';

@Component({
  selector: 'app-validateuser',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './validateuser.component.html',
  styleUrl: './validateuser.component.css'
})
export class ValidateuserComponent {


  @Output() validationModelEmit: EventEmitter<VerifyUserModel> = new EventEmitter<VerifyUserModel>();

  constructor(private authService: AuthService) { }

  userModel: VerifyUserModel = new VerifyUserModel('', new Date());

  // just sends the data from form to the parent signingpage.component
  emitVerifyUser(): void {
    this.validationModelEmit.emit(this.userModel);
  }
}
