import { Injectable } from '@angular/core';
import { UserFormData } from '../../models/user-form-data';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { VerifyUserModel } from '../../models/verify-user-model';

@Injectable({
  providedIn: 'root'
})


export class AuthService {

  constructor(private http : HttpClient) {

   }


  headers1: HttpHeaders = new HttpHeaders({
      'Content-Type': 'application/json' });
  

   tryLogin(user : UserFormData) : Observable<any> {
    // The result is StatusCode with Text "Logged in" or "Incorrect credentials". We display the result text based on statuscode.
    return this.http.post('/auth/login', JSON.stringify({ email: user.email, password: user.password }), { headers: this.headers1 });
   }

   tryRegister(user: UserFormData) : Observable<any> {
    return this.http.post('/auth/register', JSON.stringify({ email: user.email, password: user.password }), { headers: this.headers1 });
   }

   tryLogout() : Observable<any> {
    return this.http.get('/auth/logout', { headers: this.headers1 });
   }

   tryValidateUser(userModel: VerifyUserModel): Observable<any> {
    return this.http.post('/auth/validateuser', 
      JSON.stringify({email: userModel.email, kidname: userModel.kidName, birth: userModel.kidBirth}),
      {headers: this.headers1}
      );
   }

   setPassword(secret: number, em: string, pwd: string): Observable<any> {
    return this.http.post('/auth/setpassword', 
      JSON.stringify({ secret: secret, email: em, password: pwd}),
      { headers: this.headers1 }
      );
   }
}
