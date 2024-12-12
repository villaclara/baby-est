import { Injectable } from '@angular/core';
import { UserFormData } from '../../models/user-form-data';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})


export class AuthServiceService {

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
}
