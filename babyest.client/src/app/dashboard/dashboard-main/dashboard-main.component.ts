import { Component, OnInit } from '@angular/core';
import { KidHeaderInfoComponent } from "../kid-header-info/kid-header-info.component";
import { MainTimerComponent } from "../main-timer/main-timer.component";
import { LastActivitiesComponent } from "../last-activities/last-activities.component";
import { KidService } from '../../services/KidService/kid.service';
import { CurrentKidService } from '../../services/CurrentKid/current-kid.service';
import { Kid } from '../../models/kid';
import { Router } from '@angular/router';
import { KidActivity } from '../../models/kid-activity';
import { NgClass } from '@angular/common';

@Component({
  selector: 'app-dashboard-main',
  standalone: true,
  imports: [KidHeaderInfoComponent, MainTimerComponent, LastActivitiesComponent, NgClass],
  templateUrl: './dashboard-main.component.html',
  styleUrl: './dashboard-main.component.css'
})
export class DashboardMainComponent implements OnInit {

  kid: Kid = { Name: "KidTest", BirthDate: "2024-09-09", Parents: [], Activities: [] };

  lastSleepActivity: KidActivity = { ActivityType: "sleeping", Id: 0, KidName: "", StartDate: undefined, EndDate: undefined, IsActiveNow: false };
  lastEatActivity: KidActivity = { ActivityType: "eating", Id: 0, KidName: "", StartDate: undefined, EndDate: undefined, IsActiveNow: false };
  currentActivity: KidActivity = { ActivityType: "", Id: 0, KidName: "", StartDate: undefined, EndDate: undefined, IsActiveNow: false };

  timeSinceLastSleep: number = 0;
  timeSinceLastEat: number = 0;

  kidAge: number = 0;
  kidId: number = 0;

  errorMessage: string = '';

  constructor(private kidService: KidService,
    private currentKidService: CurrentKidService,
    private router: Router
  ) {
    this.kidId = this.currentKidService.getCurrentKid();
  }


  ngOnInit(): void {

    // Get general info about Kid. Used in KidHeaderInfo Component
    this.kidService.getKidById(this.currentKidService.getCurrentKid())
      .subscribe((data: any) => {
        // bypass the redirectUrl by CookieAuthenticaiton of WebApi
        if (data == "403") {
          this.router.navigateByUrl('signin');
        }
        else {

          this.kid = {
            Name: data.name,
            BirthDate: data.birthDate,
            Activities: [],
            Parents: []
          };

          const birth = Date.parse(this.kid.BirthDate);
          const timeinmilliseconds = new Date().getTime() - birth;
          const millisecondsInDay: number = 1000 * 60 * 60 * 24;

          this.kidAge = Math.floor(timeinmilliseconds / millisecondsInDay) + 1;
        }
      });


    // Get Last Eating of Kid. Used in KidHeaderInfo Component.
    this.kidService.getLastEatingByKidId(this.kidId)
      .subscribe((data: any) => {

        this.lastEatActivity = {
          StartDate: new Date(data.startDate),
          EndDate: new Date(data.endDate),
          KidName: data.kidName,
          ActivityType: data.activityType,
          Id: data.id,
          IsActiveNow: data.isActiveNow
        };

        // Check if we have any ACTIVE activity and set the time since that activity to -1, so no timer will run in Kid-Header Component.
        // Also set the CurrentActivity property which is send to MainTimer Component to display ongoing timer.

        if (this.lastEatActivity.IsActiveNow == true) {
          this.currentActivity = this.lastEatActivity;
          this.timeSinceLastEat = -1;
        }
        else {
          this.timeSinceLastEat = Math.floor((new Date().getTime() - this.lastEatActivity.EndDate!.getTime()) / 1000);
        }

        console.log(`lasteatact - this.act.enddate ${this.currentActivity.EndDate}`);
      });

    // Get Last Sleep Kid. Used in KidHeaderInfo Component.
    this.kidService.getLastSleepByKidId(this.kidId)
      .subscribe((data: any) => {

        this.lastSleepActivity = {
          StartDate: new Date(data.startDate),
          EndDate: new Date(data.endDate),
          KidName: data.kidName,
          ActivityType: data.activityType,
          Id: data.id,
          IsActiveNow: data.isActiveNow
        };

        // Check if we have any ACTIVE activity and set the time since that activity to -1, so no timer will run in Kid-Header Component.
        // Also set the CurrentActivity property which is send to MainTimer Component to display ongoing timer.

        if (this.lastSleepActivity.IsActiveNow == true) {
          this.currentActivity = this.lastSleepActivity;
          this.timeSinceLastSleep = -1;
        }
        else {
          this.timeSinceLastSleep = Math.floor((new Date().getTime() - this.lastSleepActivity.EndDate!.getTime()) / 1000);
        }

        console.log(`lastsleep - this.act.enddate ${this.currentActivity.EndDate}`);

      });



  }


  sendNewKidActivity(activity: KidActivity): void {

    console.log('dashboard - ' + activity.ActivityType + activity.StartDate + activity.EndDate + '....name - ' + activity.KidName);


    // Add new Activity. 
    // Also update required  Input() props in child components.
    if (activity.EndDate == undefined) {
      activity.EndDate = new Date("1970-01-01");
      this.kidService.addActivityToKid(this.kidId, activity)
        .subscribe({
          next: (data: any) => {
            this.currentActivity.Id = data;


            // change time Since last activity to become '---' depending on current activityType.
            activity.ActivityType.toLowerCase() == 'sleeping'.toLowerCase() ?
              this.timeSinceLastSleep = -1 : this.timeSinceLastEat = -1;
          },
          error: (error) => {
            console.log(error);
            this.errorMessage = 'Помилка. Спробуй ще раз.';
          }
        });


    }
    // Update activity on Timer stop.
    // Also update required Input() props in child components.
    else {
      this.kidService.updateActivity(this.kidId, activity)
        .subscribe({
          next: (data: any) => {
            this.currentActivity.Id = data;


            // change time Since last activity to reset to 0 depending on updated (ended) activityType.
            activity.ActivityType.toLowerCase() == 'sleeping'.toLowerCase() ?
              this.timeSinceLastSleep = 0 : this.timeSinceLastEat = 0;


            // reset the current Activity values
            this.currentActivity = {
              ActivityType: '',
              Id: 0,
              KidName: '',
              EndDate: undefined,
              StartDate: undefined,
              IsActiveNow: false
            };
          },
          error: (error) => {
            console.log(error);
            this.errorMessage = 'Помилка. Спробуй ще раз.';
          }
        });
    }
  }


}
