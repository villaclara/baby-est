import { Component, OnInit, Optional } from '@angular/core';
import { SingleActivityComponent } from '../../single-activity/single-activity.component';
import { KidService } from '../../services/KidService/kid.service';
import { KidActivity } from '../../models/kid-activity';
import { CurrentKidService } from '../../services/CurrentKid/current-kid.service';
import { NgFor, NgIf } from '@angular/common';
import { LoadingSpinnerComponent } from "../../loading-spinner/loading-spinner.component";
import { ActivityNameTranslator } from '../../utils/activity-name-translator';
import { FormsModule } from '@angular/forms';
import { DateConverter } from '../../utils/date-converter';
import { ErrorPageComponent } from '../../errorpage/error-page/error-page.component';
import { HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { animate, state, style, transition, trigger } from '@angular/animations';
import { StatsComponent } from '../stats/stats.component';
import { MonthlocalePipe } from '../../pipes/monthlocale.pipe';

@Component({
  selector: 'app-history',
  standalone: true,
  imports: [SingleActivityComponent, NgFor, NgIf, LoadingSpinnerComponent, FormsModule, ErrorPageComponent, StatsComponent, MonthlocalePipe],
  providers: [DateConverter],
  templateUrl: './history.component.html',
  styleUrl: './history.component.css',
  animations: [
    trigger('moveDown', [
      transition(':enter', [           // animation when the some condition (state) is met. ':enter' - when *ngIf= true
        style({                         // the style what is BEFORE
          'margin-top': '-10%',
          opacity: 0 // Starting position (off-screen)
        }),
        animate('100ms ease-in', style({ opacity: 1, 'margin-top': '0' }))]),
      transition(':leave', [
        style({                         // the style what is AFTER
          'margin-top': '0',
          opacity: 1
        }),
        animate('100ms ease-in', style({ opacity: 0, 'margin-top': '-10%' }))]),

    ]),
    trigger('moveDownNgIf', [
      transition(':enter', [           // animation when the some condition (state) is met. ':enter' - when *ngIf= true
        style({                         // the style what is BEFORE
          'margin-top': '-10%',
          // 'display' : 'none',
          opacity: 0 // Starting position (off-screen)
        }),
        animate('100ms ease-in', style({ opacity: 1, 'margin-top': '0' }))]),
      transition(':leave', [
        style({                         // the style what is AFTER
          // 'margin-top': '0',
          // 'display' : 'block',
          opacity: 1
        }),
        animate('100ms ease-in', style({ 'opacity': '0' }))]),
    ])
  ]
})
export class HistoryComponent implements OnInit {

  constructor(private kidService: KidService,
    private currentKidService: CurrentKidService,
    private dateConverter: DateConverter,
    private router: Router) {
    this.kidId = this.currentKidService.getCurrentKid();
  }

  isLoading: boolean = true;

  kidId: number = 0;
  translator: ActivityNameTranslator = new ActivityNameTranslator();
  activities: KidActivity[] = [];       // shown activities in ui

  backupActivities: KidActivity[] = []; // all activities received from api

  isEditingKid: boolean = false;
  activeEditingKidId: number = 0;

  selectedEditingAct: KidActivity = { Id: 0, ActivityType: '', EndDate: new Date(), StartDate: new Date(), IsActiveNow: false, KidName: '' };
  startDateString: string = '';
  endDateString: string = '';
  selectedActivityType: string = '';
  activityTypeLocalUA: string = '';

  shitActivityDates: Date[] = [];

  errorMessageForErrorComponent: string = '';

  isAddingNewActivity: boolean = false;

  todayDate: Date = new Date();

  currentTheme: string = 'lightTheme';

  totalSleepTimeNight: number = 0;
  totalSleepTimeFullDay: number = 0;

  ngOnInit(): void {
    const currentKidId = this.currentKidService.getCurrentKid();
    this.kidService.getKidActivitiesById(currentKidId).subscribe({
      next: (data: KidActivity[]) => {
        this.backupActivities = data;
        this.activities = this.backupActivities;

        this.calculateTimes();

        this.filterActsByHistoryType("today");

        this.isLoading = false;
      },
      error: (err: any) => {
        console.log(err.message);
        this.isLoading = false;
        this.errorMessageForErrorComponent = err;
      }
    });

    this.currentTheme = this.currentKidService.getTheme();
    this.currentKidService.themeChanged$.subscribe((newTheme) => this.currentTheme = newTheme);
  }

  editActivity(actId: number): void {

    // Close the editing mini-window on the 2nd click to the same activity.
    if (this.selectedEditingAct.Id == actId && this.isEditingKid == true) {
      this.isEditingKid = false;
      this.activeEditingKidId = 0;
    }
    else {
      this.selectedEditingAct = this.activities.find((el) => el.Id == actId)!;
      this.isEditingKid = true;
      this.isAddingNewActivity = false;

      // Set the values in input fields.
      this.startDateString = this.dateConverter.shitDateToISOString(this.selectedEditingAct.StartDate!);
      this.endDateString = this.dateConverter.shitDateToISOString(this.selectedEditingAct.EndDate!);
      this.activityTypeLocalUA = this.translator.changeCurrentActivityFullNameUA(this.selectedEditingAct.ActivityType);
      this.selectedActivityType = this.selectedEditingAct.ActivityType;

      this.activeEditingKidId = actId;

    }

  }


  toggleAddActivity(): void {
    this.isAddingNewActivity = !this.isAddingNewActivity;
    this.isEditingKid = false;

  }

  addActivity(): void {

    let addingAct: KidActivity = {
      Id: this.selectedEditingAct.Id,
      ActivityType: this.selectedActivityType,
      StartDate: new Date(this.startDateString),
      EndDate: new Date(this.endDateString),
      IsActiveNow: this.selectedEditingAct.IsActiveNow,
      KidName: this.selectedEditingAct.KidName
    };

    this.kidService.addActivityToKid(this.kidId, addingAct)
      .subscribe({
        next: () => {

          // just refresh the page after the Add was successfull
          this.router.navigateByUrl("/", { skipLocationChange: true }).then(
            () => this.router.navigateByUrl('/history'));
        },
        error: (err) => this.errorMessageForErrorComponent = err
      });
  }

  saveChangesActivity(): void {

    this.kidService.updateActivity(this.kidId,
      {
        Id: this.selectedEditingAct.Id,
        ActivityType: this.selectedActivityType,
        StartDate: new Date(this.startDateString),
        EndDate: new Date(this.endDateString),
        IsActiveNow: this.selectedEditingAct.IsActiveNow,
        KidName: this.selectedEditingAct.KidName
      }
    )
      .subscribe({
        next: () => {
          // After the input fields were changed we set them to the selected activity
          // To display updated values after it was saved.
          this.selectedEditingAct.ActivityType = this.selectedActivityType;
          this.selectedEditingAct.StartDate = new Date(this.startDateString);
          this.selectedEditingAct.EndDate = new Date(this.endDateString);

          this.isEditingKid = false;
          this.activeEditingKidId = 0;

          // change dates array
          const index = this.activities.indexOf(this.selectedEditingAct);
          if (index != -1) {
            this.shitActivityDates[index] = new Date(this.selectedEditingAct.StartDate);
          }
        },
        error: (err) => this.errorMessageForErrorComponent = err
      });
  }

  deleteActivity(): void {

    this.kidService.deleteActivity(this.kidId, this.selectedEditingAct.Id)
      .subscribe({
        next: () => {
          const index = this.activities.indexOf(this.selectedEditingAct);
          const indexSub = this.backupActivities.indexOf(this.selectedEditingAct);
          if (index == -1 || indexSub == -1) {
            return;
          }
          this.activities.splice(index, 1);
          this.backupActivities.splice(indexSub, 1);  // remove from backup array as well

          // update dates arrays
          this.shitActivityDates.splice(index, 1);
        },
        error: (err) => this.errorMessageForErrorComponent = err
      });
  }


  onHistoryTypeSelected(timespan: string): void {
    this.filterActsByHistoryType(timespan);
  }

  filterActsByHistoryType(timespan: string): void {
    if (timespan === 'today') {
      const tod = new Date();
      let yst = new Date(tod);
      yst.setDate(yst.getDate() - 1);
      this.activities = this.backupActivities.filter(el => new Date(el.StartDate!).toDateString() == tod.toDateString()
        || (new Date(el.StartDate!).toDateString() == yst.toDateString() && new Date(el.StartDate!).getHours() >= tod.getHours()));

      this.shitActivityDates = [];

      (this.activities).forEach(element => {
        this.shitActivityDates.push(new Date(element.StartDate!))
      });
    }

    else if (timespan === 'week') {
      const tod = new Date();
      let yst = new Date(tod);
      yst.setDate(yst.getDate() - 7);

      this.activities = this.backupActivities.filter(el => new Date(el.StartDate!).getTime() > yst.getTime());

      this.shitActivityDates = [];
      (this.activities).forEach(element => {
        this.shitActivityDates.push(new Date(element.StartDate!))
      });
    }

    else {
      this.activities = this.backupActivities;
      this.shitActivityDates = [];
      this.activities.forEach(el => this.shitActivityDates.push(new Date(el.StartDate!)));
    }
  }

  calculateTimes(): void {
    const tod = new Date();
    let yst = new Date(tod);
    yst.setDate(yst.getDate() - 1);

    // filter the activities to get only for today and yesterday (yesterday hours more than current)
    let acts = this.backupActivities.filter(el => new Date(el.StartDate!).toDateString() == tod.toDateString()
      || (new Date(el.StartDate!).toDateString() == yst.toDateString() && new Date(el.StartDate!).getHours() >= tod.getHours()));


    acts.forEach(element => {

      // Sleeping and not active
      if (element.ActivityType.toLowerCase() === 'sleeping' && !element.IsActiveNow) {

        // Sleep time Night -- yesterday > 20.00 && today <= 8 (startDate)
        if ((new Date(element.StartDate!).toDateString() == tod.toDateString() && new Date(element.StartDate!).getHours() <= 8)
          || (new Date(element.StartDate!).toDateString() == yst.toDateString() && new Date(element.StartDate!).getHours() >= 20)) {
          this.totalSleepTimeNight += Math.floor((new Date(element.EndDate!).getTime() - new Date(element.StartDate!).getTime()) / 1000);
        }

        // Sleep time Total doba
        this.totalSleepTimeFullDay += Math.floor((new Date(element.EndDate!).getTime() - new Date(element.StartDate!).getTime()) / 1000);
      }

      // Separate case when activity is active
      if (element.ActivityType.toLowerCase() === 'sleeping' && element.IsActiveNow) {
        this.totalSleepTimeNight += Math.floor((new Date().getTime() - new Date(element.StartDate!).getTime()) / 1000);
        this.totalSleepTimeFullDay += Math.floor((new Date().getTime() - new Date(element.StartDate!).getTime()) / 1000);
      }

    });

  }
}
