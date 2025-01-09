import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, Subject, take } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CurrentKidService {

  private currentKid : number;

  kidChanged$ : Subject<number> = new Subject<number>();

  constructor() {
    this.currentKid = 0;
   }

  setCurrentKid(id : number) : void {
    this.currentKid = id;
    localStorage.setItem('activekid', this.currentKid.toString());
    this.kidChanged$.next(this.currentKid);
  }

  getCurrentKid() : number {
    this.currentKid = +localStorage.getItem('activekid')!;
    return this.currentKid;
  }
}
