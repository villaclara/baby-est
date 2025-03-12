import { Injectable, OnDestroy, OnInit } from '@angular/core';
import { KidService } from '../KidService/kid.service';
import { interval, Subscription } from 'rxjs';
import { CurrentKidService } from '../CurrentKid/current-kid.service';

@Injectable({
  providedIn: 'root'
})
export class ThemeCheckerService {

  private subscription!: Subscription;

  constructor(private currentKidService: CurrentKidService) {
  }



  startDoingAction(): void {
    console.log("oninit called");
    this.subscription = interval(300_000) // timeout now 5mins
      .subscribe(() => {

        if (localStorage.getItem('autoTheme') != '1') {
          console.log('1000');
          return;
        }

        // Check the day hours first as the value is  7 >= value > 21. 
        // In the night the value can be > 0 and < 21.
        if ((new Date().getHours() >= 7 && new Date().getHours() < 21) && this.currentKidService.getTheme() != 'lightTheme') {
          this.currentKidService.setTheme('lightTheme');
          console.log('3000');

        }

        else if (this.currentKidService.getTheme() != 'darkTheme') {
          this.currentKidService.setTheme('darkTheme');
          console.log('2000');

        }

      });
  }
}
