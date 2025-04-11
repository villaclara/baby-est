import { Component } from '@angular/core';
import { SetPasswordModel } from '../../models/set-password-model';
import { FormsModule } from '@angular/forms';
import { VerifyUserModel } from '../../models/verify-user-model';
import { AuthService } from '../../services/AuthService/auth.service';
import { NgIf } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-changepassword',
  standalone: true,
  imports: [FormsModule, NgIf],
  templateUrl: './changepassword.component.html',
  styleUrl: './changepassword.component.css'
})
export class ChangepasswordComponent {
  setPasswordModel: SetPasswordModel = new SetPasswordModel(0, '', '');
  confirmPassword: string = '';

  verifyModel: VerifyUserModel = new VerifyUserModel('', new Date());
  
  verificationResponseMessage: string = '';
  passwordResetResponseMessage: string = '';
  secret: number = 0;
  isVerificationSuccess: boolean = false;

  constructor(private authService: AuthService,
    private router: Router
  ) { }

  // is called when received from validateuser.component
  verifyUserCall(): void {
    this.authService.tryVerifyUser(this.verifyModel)
      .subscribe({
        next: (data: number) =>
        {
          this.verificationResponseMessage = '';
          // save the received key
          this.secret = data;
          // show next component (set new password)
          this.isVerificationSuccess = true;
        },
        error: (err: any) =>
        {
          this.verificationResponseMessage = 'Помилка при верифікації. Перевірте введені дані.';
        }
      })
  }

  changePasswordCall(): void {
    var model = new SetPasswordModel(this.secret, this.verifyModel.email, this.setPasswordModel.password);
    this.authService.trySetPassword(model)
    .subscribe({
      next: (data: any) =>
      {
        this.passwordResetResponseMessage = 'Пароль змінено. Автоматичний вхід через 2 сек.';

        setTimeout(() => {
          this.router.navigateByUrl('/parent');
        }, (2000));
      },
      error: (err: any) => 
      {
        this.passwordResetResponseMessage = 'Помилка при зміні паролю. Спробуй ще раз.';
      }
    });
  }
}
