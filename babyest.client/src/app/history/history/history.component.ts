import { Component, OnInit, Optional } from '@angular/core';
import { SingleActivityComponent } from '../../single-activity/single-activity.component';
import { KidService } from '../../services/KidService/kid.service';
import { KidActivity } from '../../models/kid-activity';
import { CurrentKidService } from '../../services/CurrentKid/current-kid.service';
import { NgFor, NgIf, NgClass } from '@angular/common';
import { LoadingSpinnerComponent } from "../../compHelpers/loading-spinner/loading-spinner.component";
import { ActivityNameTranslator } from '../../utils/activity-name-translator';
import { FormsModule } from '@angular/forms';
import { DateConverter } from '../../utils/date-converter';
import { ErrorPageComponent } from '../../errorpage/error-page/error-page.component';
import { HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { animate, state, style, transition, trigger } from '@angular/animations';
import { StatsComponent } from '../stats/stats.component';
import { MonthlocalePipe } from '../../pipes/monthlocale.pipe';
import { LoadingOverlayComponent } from "../../compHelpers/loading-overlay/loading-overlay.component";
import { SleepiTimeCalculator } from '../../utils/sleepi-time-calculator';

@Component({
  selector: 'app-history',
  standalone: true,
  imports: [SingleActivityComponent, NgFor, NgIf, NgClass,
    LoadingSpinnerComponent, FormsModule, ErrorPageComponent, StatsComponent, MonthlocalePipe, LoadingOverlayComponent],
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

  private sleepCalculator!: SleepiTimeCalculator;

  constructor(private kidService: KidService,
    private currentKidService: CurrentKidService,
    private dateConverter: DateConverter,
    private router: Router) {
    this.kidId = this.currentKidService.getCurrentKid();
  }

  isLoading: boolean = true;
  isRequestSentLoading: boolean = false;
  isFilterLoading: boolean = false;

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

  errorMessageForAction: string = '';

  isAddingNewActivity: boolean = false;

  todayDate: Date = new Date();

  currentTheme: string = 'lightTheme';

  totalSleepTimeNight: number = 0;
  totalSleepTimeFullDay: number = 0;
  avgSleepTimeNight: number = 0;
  avgSleepTimesFullday: number = 0;
  daySpanToCalcTimes: number = 31;
  fromDateToCalcTimes: Date = new Date();
  toDateToCalcTimes: Date = new Date();

  historyTypeSelected: string = 'today';

  isFilterDisplay: boolean = false;
  filterFromDateString: string = '';
  filterToDateString: string = 'filter';

  ngOnInit(): void {
    const currentKidId = this.currentKidService.getCurrentKid();

    this.kidService.getKidActivitiesWithParams(currentKidId, { forDays: 31 }).subscribe({
      next: (data: KidActivity[]) => {
        this.backupActivities = data;
        this.activities = this.backupActivities;

        this.sleepCalculator = new SleepiTimeCalculator(this.backupActivities.filter(el => el.ActivityType.toLowerCase() === 'sleeping'));

        this.filterActsByHistoryType("today");
        
        // this.calculateTimes();

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

    this.filterToDateString = this.dateConverter.toOnlyDateString(new Date());
    console.log(this.filterToDateString);
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

    this.isRequestSentLoading = true;
    this.kidService.addActivityToKid(this.kidId, addingAct)
      .subscribe({
        next: () => {

          setTimeout(() => {
            // just refresh the page after the Add was successfull
            this.router.navigateByUrl("/", { skipLocationChange: true }).then(
              () => this.router.navigateByUrl('/history'));
          }, 500);
        },
        error: (err) => {
          this.setErrorsForActionPerfomed();
        }
      });
  }

  saveChangesActivity(): void {

    this.isRequestSentLoading = true;
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

          setTimeout(() => {
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

            this.isRequestSentLoading = false;
          }, 500);

        },
        error: (err) => {
          this.setErrorsForActionPerfomed();
        }
      });
  }

  deleteActivity(): void {

    this.isRequestSentLoading = true;
    this.kidService.deleteActivity(this.kidId, this.selectedEditingAct.Id)
      .subscribe({
        next: () => {
          setTimeout(() => {
            const index = this.activities.indexOf(this.selectedEditingAct);
            const indexSub = this.backupActivities.indexOf(this.selectedEditingAct);
            if (index == -1 || indexSub == -1) {
              return;
            }
            this.activities.splice(index, 1);
            this.backupActivities.splice(indexSub, 1);  // remove from backup array as well

            // update dates arrays
            this.shitActivityDates.splice(index, 1);

            this.isRequestSentLoading = false;
          }, 500);

        },
        error: (err) => this.setErrorsForActionPerfomed()
      });
  }


  onHistoryTypeSelected(timespan: string): void {

    this.historyTypeSelected = timespan;

    if (timespan === 'filter') {
      this.showFilter();
      return;
    }
    this.isFilterDisplay = false;
    this.filterActsByHistoryType(timespan);
  }

  filterActsByHistoryType(timespan: string): void {
    this.activities = [];
    this.shitActivityDates = [];
    this.fromDateToCalcTimes = new Date();
    const d = new Date();
    d.setDate(this.fromDateToCalcTimes.getDate() - 31);
    this.toDateToCalcTimes = d;
    console.log("fromdatetocalctimes - " + this.fromDateToCalcTimes);
    if (timespan === 'today') {
      console.log('today selected');
      const tod = new Date();
      let yst = new Date(tod);
      yst.setDate(yst.getDate() - 1);
      this.activities = this.backupActivities.filter(el => new Date(el.StartDate!).toDateString() == tod.toDateString()
        || (new Date(el.StartDate!).toDateString() == yst.toDateString() && new Date(el.StartDate!).getHours() >= tod.getHours()));

      this.shitActivityDates = [];

      (this.activities).forEach(element => {
        this.shitActivityDates.push(new Date(element.StartDate!))
      });


      this.daySpanToCalcTimes = 31;
      this.sleepCalculator.setBackupActivities(this.backupActivities);
      this.calculateTimes();
      return;
    }

    this.isFilterLoading = true;
    setTimeout(() => {

      if (timespan === 'week') {
        console.log('week');
        const tod = new Date();
        let lastWeek = new Date(tod);
        lastWeek.setDate(lastWeek.getDate() - 7);
        this.activities = this.backupActivities.filter(el => new Date(el.StartDate!).getTime() > lastWeek.getTime());

        this.shitActivityDates = [];
        (this.activities).forEach(element => {
          this.shitActivityDates.push(new Date(element.StartDate!))
        });

        this.daySpanToCalcTimes = 7;
        const d = new Date();
        d.setDate(this.fromDateToCalcTimes.getDate() - 7);
        this.toDateToCalcTimes = d;
        this.sleepCalculator.setBackupActivities(this.backupActivities);
        this.calculateTimes();
      }

      else if (timespan === 'month') {
        console.log('month');
        const tod = new Date();
        let lastMonth = new Date(tod);
        lastMonth.setDate(lastMonth.getDate() - 31);

        this.activities = this.backupActivities.filter(el => new Date(el.StartDate!).getTime() > lastMonth.getTime());

        this.shitActivityDates = [];
        (this.activities).forEach(element => {
          this.shitActivityDates.push(new Date(element.StartDate!))
        });

        this.daySpanToCalcTimes = 31;
        this.sleepCalculator.setBackupActivities(this.backupActivities);
        this.calculateTimes();
      }

      else {
        console.log('else called');
        this.activities = this.backupActivities;
        this.shitActivityDates = [];
        this.activities.forEach(el => this.shitActivityDates.push(new Date(el.StartDate!)));
      }
      this.isFilterLoading = false;
    }, 300);


  }

  calculateTimes(skipTotal? : boolean): void {

    if(!skipTotal)
    {
      const a = this.sleepCalculator.calculateTotalTimes();
      this.totalSleepTimeFullDay = a.totalSleepDay;
      this.totalSleepTimeNight = a.totalSleepNight;
    }

    const b = this.sleepCalculator.calculateAverageTimes(this.daySpanToCalcTimes, this.fromDateToCalcTimes);
    this.avgSleepTimesFullday = b.avgSleepDay;
    this.avgSleepTimeNight = b.avgSleepNight;
  }

  setErrorsForActionPerfomed(): void {
    this.errorMessageForAction = 'Помилка при запиті. Спробуй ще раз';

    setTimeout(() => {
      // this.errorMessageForErrorComponent = err; 
      this.isRequestSentLoading = false;
      this.errorMessageForAction = '';
    }, 2500);
  }

  showFilter(): void {
    this.isFilterDisplay = true;
  }

  OKFilterButtonClik(): void {
    // if the value is not provided, we display full history
    if(this.filterFromDateString === '')
      {
        this.filterFromDateString = '2025-01-01';
      }
      
    const fromDate = new Date(this.filterFromDateString);
    const toDate = new Date(this.filterToDateString);

    function dateDiffInDays(a: Date, b: Date) {
      const _MS_PER_DAY = 1000 * 60 * 60 * 24;
      // Discard the time and time-zone information.
      const utc1 = Date.UTC(a.getFullYear(), a.getMonth(), a.getDate());
      const utc2 = Date.UTC(b.getFullYear(), b.getMonth(), b.getDate());
    
      return Math.floor((utc2 - utc1) / _MS_PER_DAY) + 1;
    }


    this.daySpanToCalcTimes = dateDiffInDays(fromDate, toDate);

    

    console.log(this.daySpanToCalcTimes);
    this.kidService.getKidActivitiesWithParams(this.kidId, 
      { 
        fromDate: this.filterFromDateString,
        toDate: this.filterToDateString })
        .subscribe({
          next: (data: KidActivity[]) => {
            this.sleepCalculator.setBackupActivities(data.filter(el => el.ActivityType.toLowerCase() === 'sleeping'));
            this.fromDateToCalcTimes = toDate;
            this.toDateToCalcTimes = fromDate;
            this.calculateTimes(true);  // pass true to skip total times calculation
            this.isFilterDisplay = false;

            this.activities = data;
            this.shitActivityDates = [];
            this.activities.forEach(el => this.shitActivityDates.push(new Date(el.StartDate!)));

          },
          error: (err: any) => {
            this.isFilterDisplay = false;

          }
        });

  }

  CancelFilterButtonClick(): void {
    // reset values 
    this.isFilterDisplay = false;
    this.filterToDateString = this.dateConverter.toOnlyDateString(new Date());
    this.filterFromDateString = '';
    this.historyTypeSelected = 'today';

    this.activities = [];
    this.shitActivityDates = [];

    // set the 'Today' radio button selected
    (document!.getElementById('todayHistory') as HTMLInputElement).checked = true;
    this.onHistoryTypeSelected('today');
  }
}
