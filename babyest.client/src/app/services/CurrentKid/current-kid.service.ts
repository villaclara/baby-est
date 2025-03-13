import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, Subject, take } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CurrentKidService {

  private currentKid : number;

  kidChanged$ : Subject<number> = new Subject<number>();

  themeChanged$ : Subject<string> = new Subject<string>();


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

  getTheme() : string {
    let t = localStorage.getItem('theme');
    if(t == null)
    {
      this.setTheme('lightTheme');
      return 'lightTheme';
    }
    return t;
  }

  setTheme(newTheme: string) : void {
    localStorage.setItem('theme', newTheme);
    this.themeChanged$.next(newTheme);
  }

  getAutoTheme(): boolean {
    let a = localStorage.getItem('autoTheme');
    if(a == null) // no value in local storage - means first load and we auto on this.
    {
      this.setAutoTheme(true);
      return true;
    }
    return a === '1' ? true : false;
  }

  setAutoTheme(isTrue: boolean): void {
    localStorage.setItem('autoTheme', isTrue ? '1' : '0');
  }
}
