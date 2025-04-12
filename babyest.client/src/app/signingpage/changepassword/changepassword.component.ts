import { Component, EventEmitter, Output } from '@angular/core';
import { SetPasswordModel } from '../../models/set-password-model';
import { FormsModule } from '@angular/forms';
import { VerifyUserModel } from '../../models/verify-user-model';
import { AuthService } from '../../services/AuthService/auth.service';
import { NgIf } from '@angular/common';
import { Router } from '@angular/router';
import { animate, state, style, transition, trigger } from '@angular/animations';

@Component({
  selector: 'app-changepassword',
  standalone: true,
  imports: [FormsModule, NgIf],
  templateUrl: './changepassword.component.html',
  styleUrl: './changepassword.component.css',
  animations: [
    // Shift entire page content upward
    trigger('pageShift', [
      state('in', style({ 'margin-top': '0', opacity: 1 })),
      state('out', style({ 'margin-top': '-50vh', opacity: 0 })),
      transition('in => out', animate('400ms ease-in')),
      transition('out => in', animate('400ms ease-out')),
    ]),
    //   trigger('slideInOut', [
    //     transition(':enter', [
    //       style({ height: '0px', opacity: 0 }),
    //       animate('300ms ease-out', style({ height: '*', opacity: 1 }))
    //     ]),
    //     transition(':leave', [
    //       animate('300ms ease-in', style({ height: '0px', opacity: 0 }))
    //     ])
    //   ]
    // )
  ]
})

export class ChangepasswordComponent {
  setPasswordModel: SetPasswordModel = new SetPasswordModel(0, '', '');
  confirmPassword: string = '';

  verifyModel: VerifyUserModel = new VerifyUserModel('', new Date());

  verificationResponseMessage: string = '';
  passwordResetResponseMessage: string = '';
  secret: number = 0;

  isUnderVerification: boolean = false;
  isVerificationSuccess: boolean = false;

  isUnderPasswordChange: boolean = false;

  @Output() moveBackPressedEvent: EventEmitter<boolean> = new EventEmitter<boolean>();

  constructor(private authService: AuthService,
    private router: Router) { }


  // is called when received from validateuser.component
  verifyUserCall(): void {

    this.isUnderVerification = true;
    this.authService.tryVerifyUser(this.verifyModel)
      .subscribe({
        next: (data: number) => {
          setTimeout(() => {
            this.isUnderVerification = false;
            this.verificationResponseMessage = 'Верифікацію пройдено.';
            // save the received key
            this.secret = data;
          }, 500);

          setTimeout(() => {
            // show next component
            this.isVerificationSuccess = true;
          }, 1000);
        },
        error: (err: any) => {
          this.isUnderVerification = false;
          this.verificationResponseMessage = 'Помилка при верифікації. Перевірте введені дані.';
        }
      })
  }

  changePasswordCall(): void {
    var model = new SetPasswordModel(this.secret, this.verifyModel.email, this.setPasswordModel.password);
    this.isUnderPasswordChange = true;
    this.authService.trySetPassword(model)
      .subscribe({
        next: (data: any) => {
          setTimeout(() => {
            this.isUnderPasswordChange = false;
            this.passwordResetResponseMessage = 'Пароль змінено. Автоматичний вхід через 2 сек.';
          }, 500);

          setTimeout(() => {
            this.router.navigateByUrl('/parent');
          }, (2000));
        },
        error: (err: any) => {
          this.passwordResetResponseMessage = 'Помилка при зміні паролю. Спробуй ще раз.';
          this.isUnderPasswordChange = false;
        }
      });
  }

  returnBackPress() {
    this.moveBackPressedEvent.emit(true);
  }

  clearErrorMessage()
  {
    if(this.isVerificationSuccess)
    {
      this.passwordResetResponseMessage = '';
    }
    else 
    {
      this.verificationResponseMessage = '';
    }
  }

}
