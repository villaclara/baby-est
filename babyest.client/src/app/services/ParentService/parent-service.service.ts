import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { Parent } from '../../models/parent';

@Injectable({
  providedIn: 'root'
})
export class ParentServiceService {

  p : Parent = { Email:'', Id:0, Kids:[]}; 

  constructor(private http: HttpClient) { }

  getParentInfo() : Parent {
    this.http.get<Parent>('api/parent').subscribe(
      (data : Parent) => 
        { 
          this.p = data; 
        });

    return this.p;
  }
}
