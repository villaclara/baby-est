import { Component, OnDestroy, OnInit } from '@angular/core';
import { KidHeaderInfoComponent } from "../kid-header-info/kid-header-info.component";
import { MainTimerComponent } from "../main-timer/main-timer.component";
import { LastActivitiesComponent } from "../last-activities/last-activities.component";
import { KidService } from '../../services/KidService/kid.service';
import { CurrentKidService } from '../../services/CurrentKid/current-kid.service';
import { Kid } from '../../models/kid';
import { Router } from '@angular/router';
import { KidActivity } from '../../models/kid-activity';
import { NgClass, NgIf } from '@angular/common';
import { LoadingSpinnerComponent } from "../../compHelpers/loading-spinner/loading-spinner.component";
import { ErrorPageComponent } from "../../errorpage/error-page/error-page.component";
import { LoadingOverlayComponent } from '../../compHelpers/loading-overlay/loading-overlay.component';
import { DashboardActionsEventEmitterService } from '../../services/DashboardActionsEventEmitter/dashboard-actions-event-emitter.service';
import { NetworkService } from '../../services/NetworkService/network-service.service';
import { LocalStorageService } from '../../services/LocalStorage/local-storage.service';
import { Subject, takeUntil } from 'rxjs';
import { SyncStatus } from '../../models/sync-status';

@Component({
  selector: 'app-dashboard-main',
  standalone: true,
  imports: [KidHeaderInfoComponent,
    MainTimerComponent,
    LoadingOverlayComponent,
    LastActivitiesComponent,
    NgClass, NgIf,
    LoadingSpinnerComponent,
    ErrorPageComponent],
  templateUrl: './dashboard-main.component.html',
  styleUrl: './dashboard-main.component.css'
})
export class DashboardMainComponent implements OnInit, OnDestroy {

  kid: Kid = { Name: "KidTest", BirthDate: "2024-09-09", Parents: [], Activities: [] };

  lastSleepActivity: KidActivity = { ActivityType: "sleeping", Id: 0, KidName: "", StartDate: undefined, EndDate: undefined, IsActiveNow: false };
  lastEatActivity: KidActivity = { ActivityType: "eating", Id: 0, KidName: "", StartDate: undefined, EndDate: undefined, IsActiveNow: false };
  currentActivity: KidActivity = { ActivityType: "", Id: 0, KidName: "", StartDate: undefined, EndDate: undefined, IsActiveNow: false };
  activities: KidActivity[] = [];

  timeSinceLastSleep: number = -1;
  timeSinceLastEat: number = -1;

  kidAge: number = 0;
  kidId: number = 0;

  errorMessageDisplayed: string = '';
  isLoading: boolean = true;

  isHeaderInfoDisplay: boolean = false;
  isDisplayedMainSectionTimerLastActs: boolean = false;

  bgColorForActivityType: string = '';
  currentTheme: string = 'lightTheme';

  isRequestSentLoading: boolean = false;
  errorMessageForAction: string = '';

  isOnline: boolean = false;
  // used in OnDestroy to unsubscribe
  private destroy$ = new Subject<void>();

  // for binding to Visibility changed handler to be in separate method
  private visibilityChangeHandler: () => void;

  constructor(private kidService: KidService,
    private currentKidService: CurrentKidService,
    private router: Router,
    private actionEventsEmitter: DashboardActionsEventEmitterService,
    private networkService: NetworkService,
    private localStorageService: LocalStorageService) {
    this.kidId = this.currentKidService.getCurrentKid();
    // binding to actual handler
    this.visibilityChangeHandler = this.onVisibilityChanged.bind(this);
  }

  // On destroy to remove listeners from dashboard on destroy
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    window.removeEventListener("visibilitychange", this.visibilityChangeHandler);
  }

  onVisibilityChanged(): void {
    if (document.visibilityState === "visible") {

      // this check prevents to LoadData() every time the App gets focus. 
      // Load data only if we are inside /main/kidId link.
      if (this.router.url === "/main/" + this.kidId) {

        // set the false to trigger re-display the sections
        this.isHeaderInfoDisplay = false;
        this.isDisplayedMainSectionTimerLastActs = false;

        // set the activities which is passed to components as default values
        this.unloadData();

        if (this.isOnline) {
          // load actual data for activities
          this.loadData();
        }
        else {
          this.loadLocalData();
        }
      }
    }
  }

  ngOnInit(): void {

    // Adds the listener for event window focus. To trigger refresh timer each time app gets focus.
    window.addEventListener("visibilitychange", this.visibilityChangeHandler);

    this.currentTheme = this.currentKidService.getTheme();
    this.currentKidService.themeChanged$.subscribe((newTheme) => this.currentTheme = newTheme);

    this.isOnline = this.networkService.currentNetworkStatus;

    let isTheDataLoaded: boolean = false;

    // REFRESH page when SYNC has been completed.
    // syncCompleted is tracked in HomeComponent.
    // On init Homecomponent we try to sync the pending activities - 
    // If we are offline then still we emit the syncCompletedWithResults subject.
    // THIS call will always be called when loading the component as we have BehaviorSubject 
    // and the value is emmited and we always call this on loading. Then no need to manually check below if online.
    this.localStorageService.syncCompletedWithResult$
      .pipe(takeUntil(this.destroy$))
      .subscribe(value => {
        // nothing has changed after sync
        if (!this.isOnline) {
          this.loadLocalData();
          return;
        }

        // refresh page after sync is completed
        this.isLoading = true;
        this.unloadData();
        this.loadData();
        isTheDataLoaded = true;
        this.isOnline = this.networkService.currentNetworkStatus;
      });

    // Load data if the Offline/Online
    this.networkService.onlineStatus$
      .pipe(takeUntil(this.destroy$))
      .subscribe(isOnline => {

        // if Back to online while being previous offline
        // need to refresh page when staying on Dashboard and going online -> offline -> online
        if (isOnline && !isTheDataLoaded) {
          // if nothing has changed when return to online 
          // if activities has changed we then reload data in this.localstorage.SyncCompletedWithResult subscription (above)
          if (this.localStorageService.currentSyncState === SyncStatus.Nothing) {
            this.isLoading = true;
            this.unloadData();
            this.loadData();
          }
        }
        this.isOnline = isOnline;
      });

    // if OFFLINE load only local data
    // this.isOnline = this.networkService.currentNetworkStatus;
    // if (!this.isOnline) {
    //   console.log("call load local data in offline from network service");
    //   this.loadLocalData();
    //   console.log("load data in netwrok status");
    //   return;
    // }

    isTheDataLoaded = false;
  }

  unloadData(): void {
    this.currentActivity = { ActivityType: "", Id: 0, KidName: "", StartDate: undefined, EndDate: undefined, IsActiveNow: false };
    this.lastEatActivity = { ActivityType: "", Id: 0, KidName: "", StartDate: undefined, EndDate: undefined, IsActiveNow: false };
    this.lastSleepActivity = { ActivityType: "", Id: 0, KidName: "", StartDate: undefined, EndDate: undefined, IsActiveNow: false };
    this.activities = [];
  }

  loadData(): void {

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

            // add actual values to local storage for offline access
            this.localStorageService.addKidHeaderInfoToLocalStorage(data);
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

            // add actual values to local storage for offline access
            this.localStorageService.addLastEatingToLocalStorage(data);
          },
          error: (err: Error) => {
            this.timeSinceLastEat = -1;
            this.isHeaderInfoDisplay = true;
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

            this.isHeaderInfoDisplay = true;
            // add actual values to local storage for offline access
            this.localStorageService.addLastSleepingToLocalStorage(data);
          },
          error: (err: Error) => {
            this.timeSinceLastSleep = -1;
            this.isHeaderInfoDisplay = true;
          }
        });


    // Get last 10 activities to form a list of LastActivities. 
    this.kidService.getLastSomeValueKidActivitiesById(this.kidId, 10)
      .subscribe(
        {
          next: (data: KidActivity[]) => {

            // Fill the array depending on data length.
            // add element to lastActivities list only if it is not active and length less than 3
            data.forEach(element => {
              if (element.IsActiveNow == false) {
                if (this.activities.length < 3) {
                  this.activities.push(element);
                }
              }
            });

            // add actual values to local storage for offline access
            this.localStorageService.addLastActivitiesToLocalStorage(data);

            // isLoading - component Initial load.
            // mainSectionTimerLastActs - when gaining focus.
            setTimeout(() => {
              this.isDisplayedMainSectionTimerLastActs = true;
              this.isLoading = false;
              console.log("loaded online data");
            }, 300);  // timeout is set to make smoother display as if the instant load the main section is like flickering
          },
          error: (err: Error) => {
            this.errorMessageDisplayed = err.message;
            this.isDisplayedMainSectionTimerLastActs = true;
            this.isLoading = false;
          }
        });
  }


  // Get data from local storage when offline
  private loadLocalData(): void {

    // Get kidName and age
    this.kid = this.localStorageService.getKidHeaderInfoFromLocalStorage();
    const birth = Date.parse(this.kid.BirthDate);
    const timeinmilliseconds = new Date().getTime() - birth;
    const millisecondsInDay: number = 1000 * 60 * 60 * 24;
    this.kidAge = Math.floor(timeinmilliseconds / millisecondsInDay) + 1;

    // Get local last sleeping and eating times

    // last eat
    this.lastEatActivity = this.localStorageService.getLastEatingFromLocalStorage();
    // Check if we have any ACTIVE activity and set the time since that activity to -1, so no timer will run in Kid-Header Component.
    // Also set the CurrentActivity property which is send to MainTimer Component to display ongoing timer.
    if (this.lastEatActivity.IsActiveNow == true) {
      this.currentActivity = this.lastEatActivity;
      this.timeSinceLastEat = -1;
    }
    else {
      this.timeSinceLastEat = Math.floor((new Date().getTime() - new Date(this.lastEatActivity.EndDate!).getTime()) / 1000);
    }

    // last sleep
    this.lastSleepActivity = this.localStorageService.getLastSleepingFromLocalStorage();
    // Check if we have any ACTIVE activity and set the time since that activity to -1, so no timer will run in Kid-Header Component.
    // Also set the CurrentActivity property which is send to MainTimer Component to display ongoing timer.
    if (this.lastSleepActivity.IsActiveNow == true) {
      this.currentActivity = this.lastSleepActivity;
      this.timeSinceLastSleep = -1;
    }
    else {
      this.timeSinceLastSleep = Math.floor((new Date().getTime() - new Date(this.lastSleepActivity.EndDate!).getTime()) / 1000);
    }
    this.isHeaderInfoDisplay = true;

    // Get local Main Timer
    // it is received during GetLastEat/GetLastSleep

    // Get local List of last activities
    const data = this.localStorageService.getLastActivitiesFromLocalStorage();

    // Fill the array depending on data length.
    // add element to lastActivities list only if it is not active and length less than 3
    data.forEach(element => {
      if (element.IsActiveNow == false) {
        if (this.activities.length < 3) {
          this.activities.push(element);
        }
      }
    });

    this.isHeaderInfoDisplay = true;

    // isLoading - component Initial load.
    // mainSectionTimerLastActs - when gaining focus.
    setTimeout(() => {
      this.isDisplayedMainSectionTimerLastActs = true;
      this.isLoading = false;
              console.log("loaded local data");

    }, 300);  // timeout is set to make smoother display as if the instant load the main section is like flickering

  }

  // Send the new activity to the api
  sendNewKidActivity(activity: KidActivity): void {

    this.isRequestSentLoading = true;

    // set ID to != 0 because in single-activity-comp cause check for some reason if the Id != 0 
    // and only then translate actType to UA
    activity.Id = activity.Id <= 0 ? -1 : activity.Id;

    // update LOCAL lastEat/lastSleep to display updated times in kid-header
    if (activity.ActivityType.toLocaleLowerCase() === 'sleeping') {
      this.localStorageService.addLastSleepingToLocalStorage(activity);
    }
    else {
      this.localStorageService.addLastEatingToLocalStorage(activity);
    }

    // Add to local storage only
    if (!this.isOnline) {

      // Add new Activity
      // Also update required  Input() props in child components.
      if (activity.EndDate == undefined) {
        activity.EndDate = new Date("1970-01-01");
        setTimeout(() => {
          this.isRequestSentLoading = false;

          // change time Since last activity to become '---' depending on current activityType.
          activity.ActivityType.toLowerCase() == 'sleeping'.toLowerCase() ?
            this.timeSinceLastSleep = -1 : this.timeSinceLastEat = -1;

          // add current activity
          this.localStorageService.addCurrentActivityToLocalStorage(activity);
          // add to pending
          this.localStorageService.addActToPendingActs(activity);

          // set success number to child Timer
          this.actionEventsEmitter.triggerAction(200);
        }, 300);
      }

      // Update activity on Timer stop
      // Also update required Input() props in child components.
      // Also update the last activities local list.
      else {
        setTimeout(() => {

          // add activity to pending acts
          // inside this method it checks whether to add new or update activity based on ID (-1 add, other update)
          this.localStorageService.addActToPendingActs(
            {
              Id: activity.Id <= 0 ? -1 : activity.Id,
              ActivityType: activity.ActivityType,
              EndDate: activity.EndDate,
              IsActiveNow: activity.IsActiveNow,
              KidName: activity.KidName,
              StartDate: activity.StartDate
            });

          this.isRequestSentLoading = false;
          // this.currentActivity.Id = data;

          // change time Since last activity to reset to 0 depending on updated (ended) activityType.
          activity.ActivityType.toLowerCase() == 'sleeping'.toLowerCase()
            ? this.timeSinceLastSleep = Math.floor((new Date().getTime() - new Date(activity.EndDate!).getTime()) / 1000)
            : this.timeSinceLastEat = Math.floor((new Date().getTime() - new Date(activity.EndDate!).getTime()) / 1000);

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

          // update local storage last actitivies
          const lastacts = this.activities.slice();
          this.localStorageService.addLastActivitiesToLocalStorage(lastacts);

          // send success number
          this.actionEventsEmitter.triggerAction(100);
        }, 300);
      }
    }


    // add to api - ONLINE
    else {

      // Add new Activity to api. 
      // Also update required  Input() props in child components.
      if (activity.EndDate == undefined) {
        activity.EndDate = new Date("1970-01-01");
        this.kidService.addActivityToKid(this.kidId, activity)
          .subscribe({
            next: (data: any) => {
              setTimeout(() => {

                this.isRequestSentLoading = false;

                this.currentActivity.Id = data;

                // change time Since last activity to become '---' depending on current activityType.
                activity.ActivityType.toLowerCase() == 'sleeping'.toLowerCase() ?
                  this.timeSinceLastSleep = -1 : this.timeSinceLastEat = -1;

                // set success number to child Timer
                this.actionEventsEmitter.triggerAction(200);
              }, 300);

            },
            error: (error) => {
              this.errorMessageForAction = 'Помилка при запиті. Спробуй ще раз';

              setTimeout(() => {
                // set error number and reset values
                this.isRequestSentLoading = false;
                this.errorMessageForAction = '';
                this.currentActivity.IsActiveNow = false;
                this.actionEventsEmitter.triggerAction(-200);
              }, 2500);  // here display the error message for 2.5 sec
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

              setTimeout(() => {
                this.isRequestSentLoading = false;
                this.currentActivity.Id = data;

                // change time Since last activity to reset to 0 depending on updated (ended) activityType.
                activity.ActivityType.toLowerCase() == 'sleeping'.toLowerCase()
                  ? this.timeSinceLastSleep = Math.floor((new Date().getTime() - new Date(activity.EndDate!).getTime()) / 1000)
                  : this.timeSinceLastEat = Math.floor((new Date().getTime() - new Date(activity.EndDate!).getTime()) / 1000);

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

                // send success number
                this.actionEventsEmitter.triggerAction(100);
              }, 300);

            },
            error: (error) => {
              this.errorMessageForAction = 'Помилка при запиті. Спробуй ще раз';

              setTimeout(() => {
                // send fail number to child TImer and reset values
                this.isRequestSentLoading = false;
                this.errorMessageForAction = '';
                this.actionEventsEmitter.triggerAction(-100);
                this.currentActivity.IsActiveNow = true;
              }, 2500); // display the error message for 2.5 sec and then hide it
            }
          });
      }
    }
  }

}
