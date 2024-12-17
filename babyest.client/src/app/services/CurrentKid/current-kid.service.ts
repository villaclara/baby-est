import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, Subject, take } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CurrentKidService {

  private currentKid : number;

  private cur : Subject<number> = new Subject<number>();
  changeEmitted$ = this.cur.asObservable();

  constructor() {
    this.currentKid = 0;
   }

  setCurrentKid(id : number) : void {
    this.currentKid = id;
    localStorage.setItem('activekid', this.currentKid.toString());
    this.cur.next(this.currentKid);
  }

  getCurrentKid() : number {
    this.currentKid = +localStorage.getItem('activekid')!;
    return this.currentKid;
  }
}
