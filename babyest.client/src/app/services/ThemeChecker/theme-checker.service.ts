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
    this.subscription = interval(300_000) // timeout now 5mins
      .subscribe(() => {

        if (localStorage.getItem('autoTheme') != '1') {
          return;
        }

        // Check the day hours first as the value is  7 >= value > 21. 
        // In the night the value can be > 0 and < 21.
        if ((new Date().getHours() >= 7 && new Date().getHours() < 21) && this.currentKidService.getTheme() != 'lightTheme') {
          this.currentKidService.setTheme('lightTheme');

        }

        /* check if the day and light theme is on then we do nothing. if not check this the dark theme will be set */
        else if((new Date().getHours() >= 7 && new Date().getHours() < 21) && this.currentKidService.getTheme() === 'lightTheme'){
          return;
        }

        else if (this.currentKidService.getTheme() != 'darkTheme') {
          this.currentKidService.setTheme('darkTheme');
        }

      });
  }
}
