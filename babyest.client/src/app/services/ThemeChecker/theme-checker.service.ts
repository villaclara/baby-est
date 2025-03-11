import { Injectable, OnDestroy, OnInit } from '@angular/core';
import { KidService } from '../KidService/kid.service';
import { interval, Subscription } from 'rxjs';
import { CurrentKidService } from '../CurrentKid/current-kid.service';

@Injectable({
  providedIn: 'root'
})
export class ThemeCheckerService {

  private subscription!: Subscription;

  start: number = 0;
  constructor(private currentKidService: CurrentKidService) {
    console.log("number - " + this.start);
  }



  startDoingAction(): void {
    console.log("oninit called");
    this.subscription = interval(1_000)
      .subscribe(() => {
        
        if(localStorage.getItem('autoTheme') != '1') {
          console.log('1000');
          return;
          } 

        if (new Date().getHours() == 21 && this.currentKidService.getTheme() != 'darkTheme') {
          this.currentKidService.setTheme('darkTheme');
          console.log('2000');

        }

        else if (new Date().getHours() == 7 && this.currentKidService.getTheme() != 'lightTheme') {
          this.currentKidService.setTheme('lightTheme');
          console.log('3000');
        
        }
      });
  }
}
