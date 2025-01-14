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
import { NgIf } from '@angular/common';
import { LoadingSpinnerComponent } from "../../loading-spinner/loading-spinner.component";

@Component({
  selector: 'app-dashboard-main',
  standalone: true,
  imports: [KidHeaderInfoComponent, MainTimerComponent, LastActivitiesComponent, NgClass, NgIf, LoadingSpinnerComponent],
  templateUrl: './dashboard-main.component.html',
  styleUrl: './dashboard-main.component.css'
})
export class DashboardMainComponent implements OnInit {

  kid: Kid = { Name: "KidTest", BirthDate: "2024-09-09", Parents: [], Activities: [] };

  lastSleepActivity: KidActivity = { ActivityType: "sleeping", Id: 0, KidName: "", StartDate: undefined, EndDate: undefined, IsActiveNow: false };
  lastEatActivity: KidActivity = { ActivityType: "eating", Id: 0, KidName: "", StartDate: undefined, EndDate: undefined, IsActiveNow: false };
  currentActivity: KidActivity = { ActivityType: "", Id: 0, KidName: "", StartDate: undefined, EndDate: undefined, IsActiveNow: false };
  activities: KidActivity[] = [];

  timeSinceLastSleep: number = 0;
  timeSinceLastEat: number = 0;

  kidAge: number = 0;
  kidId: number = 0;

  errorMessageDisplayed: string = '';
  isLoading: boolean = true;
  constructor(private kidService: KidService,
    private currentKidService: CurrentKidService,
    private router: Router
  ) {
    this.kidId = this.currentKidService.getCurrentKid();
  }


  ngOnInit(): void {

    // Get general info about Kid. Used in KidHeaderInfo Component
    this.kidService.getKidById(this.currentKidService.getCurrentKid())
      .subscribe(
        {
          next: (data: Kid) => {
            this.kid = data;

            const birth = Date.parse(this.kid.BirthDate);
            const timeinmilliseconds = new Date().getTime() - birth;
            const millisecondsInDay: number = 1000 * 60 * 60 * 24;

            this.kidAge = Math.floor(timeinmilliseconds / millisecondsInDay) + 1;
          },
          error: (err: Error) => {
            this.errorMessageDisplayed = err.message;
          }
        });


    // Get Last Eating of Kid. Used in KidHeaderInfo Component.
    this.kidService.getLastEatingByKidId(this.kidId)
      .subscribe(
        {
          next: (data: KidActivity) => {
            this.lastEatActivity = data;

            // Check if we have any ACTIVE activity and set the time since that activity to -1, so no timer will run in Kid-Header Component.
            // Also set the CurrentActivity property which is send to MainTimer Component to display ongoing timer.
            if (this.lastEatActivity.IsActiveNow == true) {
              this.currentActivity = this.lastEatActivity;
              this.timeSinceLastEat = -1;
            }
            else {
              this.timeSinceLastEat = Math.floor((new Date().getTime() - new Date(this.lastEatActivity.EndDate!).getTime()) / 1000);
            }
          },
          error: (err: Error) => {
            if (err.message === '404') {
              this.timeSinceLastEat = -1;

            }
            else {
              this.errorMessageDisplayed = err.message;
            }
          }
        });


    // Get Last Sleep Kid. Used in KidHeaderInfo Component.
    this.kidService.getLastSleepByKidId(this.kidId)
      .subscribe(
        {
          next: (data: KidActivity) => {
            this.lastSleepActivity = data;

            // Check if we have any ACTIVE activity and set the time since that activity to -1, so no timer will run in Kid-Header Component.
            // Also set the CurrentActivity property which is send to MainTimer Component to display ongoing timer.
            if (this.lastSleepActivity.IsActiveNow == true) {
              this.currentActivity = this.lastSleepActivity;
              this.timeSinceLastSleep = -1;
            }
            else {
              this.timeSinceLastSleep = Math.floor((new Date().getTime() - new Date(this.lastSleepActivity.EndDate!).getTime()) / 1000);
            }
          },
          error: (err: Error) => {
            if (err.message === '404') {
              this.timeSinceLastSleep = -1;

            }
            else {
              this.errorMessageDisplayed = err.message;
            }
          }
        });
      

    // Get last 6 activities to form a list of LastActivities. 
    this.kidService.getLastSomeValueKidActivitiesById(this.kidId, 6)
      .subscribe(
        {
          next: (data: KidActivity[]) => {

            // Fill the array depending on data length.
            if (data.length <= 0) {
              this.isLoading = false;
              return;
            }
            // if we have only one Active activity we do nothing, else we push into the array.
            else if (data.length == 1) {
              if (data[0].IsActiveNow != true) {
                this.activities.push(data[0]);
              }
            }
            // Put the two items into array.
            else if (data.length == 2) {
              let i = 0;

              for (let k = 0; k < data.length; k++) {

                // If the first activity is Active then skip it and reset the loop variable
                if (data[i].IsActiveNow == true) {
                  i++;
                  k--;
                  continue;
                }

                this.activities.push(data[i]);
                i++;
              }
            }
            // Default behavior if having more than 3 activities.
            else if (data.length > 3) {

              let i = 0;
              for (let k = 0; k < 3; k++) {

                // If the first activity is Active then skip it and reset the loop variable
                if (data[i].IsActiveNow == true) {
                  i++;
                  k--;
                  continue;
                }

                this.activities.push(data[i]);
                i++;
              }
            }

            this.isLoading = false;
            console.log(this.isLoading);

          },
          error: (err: Error) => {
            this.errorMessageDisplayed = err.message;
            this.isLoading = false;
          }
        });

  }


  // Send the new activity to the api
  sendNewKidActivity(activity: KidActivity): void {

    // Add new Activity to api. 
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
            this.errorMessageDisplayed = 'Помилка. Спробуй ще раз.';
          }
        });


    }
    // Update activity on Timer stop and push update to api. 
    // Also update required Input() props in child components.
    // Also update the last activities local list.
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

            // add to last activities list and delete the last one
            if (this.activities.length < 3) {
              this.activities.push(activity);
            }
            else {
              this.activities.unshift(activity);
              this.activities.pop();
            }
          },
          error: (error) => {
            console.log(error);
            this.errorMessageDisplayed = 'Помилка. Спробуй ще раз.';
          }
        });
    }
  }


}
