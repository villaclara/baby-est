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

@Component({
  selector: 'app-history',
  standalone: true,
  imports: [SingleActivityComponent, NgFor, NgIf, LoadingSpinnerComponent, FormsModule, ErrorPageComponent, StatsComponent],
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
        animate('100ms ease-in', style({ opacity : 1, 'margin-top' : '0' }))]),
        transition(':leave', [
          style({                         // the style what is AFTER
            'margin-top': '0',
            opacity: 1
          }),
          animate('100ms ease-in', style({ opacity : 0, 'margin-top' : '-10%' }))]),
        
      ]),
      trigger('moveDownNgIf', [
        transition(':enter', [           // animation when the some condition (state) is met. ':enter' - when *ngIf= true
          style({                         // the style what is BEFORE
            'margin-top': '-10%',
            // 'display' : 'none',
            opacity: 0 // Starting position (off-screen)
          }),
          animate('100ms ease-in', style({  opacity : 1, 'margin-top' : '0' }))]),
        transition(':leave', [
          style({                         // the style what is AFTER
            // 'margin-top': '0',
            // 'display' : 'block',
            opacity: 1
          }),
          animate('100ms ease-in', style({ 'opacity' : '0' }))]),
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
  activities: KidActivity[] = [];

  isEditingKid: boolean = false;
  activeEditingKidId: number = 0;

  selectedEditingAct: KidActivity = { Id: 0, ActivityType: '', EndDate: new Date(), StartDate: new Date(), IsActiveNow: false, KidName: '' };
  startDateString: string = '';
  endDateString: string = '';
  selectedActivityType: string = '';
  activityTypeLocalUA: string = '';

  dates: string[] = [];
  shitActivityDates: Date[] = [];

  errorMessageForErrorComponent: string = '';

  isAddingNewActivity: boolean = false;

  currentTheme: string = 'lightTheme';

  ngOnInit(): void {
    const currentKidId = this.currentKidService.getCurrentKid();
    this.kidService.getKidActivitiesById(currentKidId).subscribe({
      next: (data: KidActivity[]) => {
        this.activities = data;

        (this.activities).forEach(element => {
          this.shitActivityDates.push(new Date(element.StartDate!));
          this.dates.push(new Date(element.StartDate!).toDateString())
        });
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


  toggleAddActivity() : void {
    this.isAddingNewActivity = !this.isAddingNewActivity;
    this.isEditingKid = false;

  }

  addActivity() : void {

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

        // let index = 0;
        // while(index < this.activities.length && new Date(this.activities[index].StartDate!).getTime() > new Date(this.startDateString).getTime())
        // {
        //   index++;
        // }

        // this.isAddingNewActivity = false;
        // this.selectedActivityType = '';
        // this.startDateString = '';
        // this.endDateString = '';
        
        // this.activities.splice(index, 0, addingAct);
        // this.shitActivityDates.push(new Date(addingAct.StartDate!));
        // this.dates.push(new Date(addingAct.StartDate!).toDateString())

        // this.isLoading = true;

        // setTimeout(() => {
        //   this.isLoading = false;
        // }, 1);


        this.router.navigateByUrl("/", {skipLocationChange : true}).then(
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
            this.dates[index] = new Date(this.selectedEditingAct.StartDate).toDateString();
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
          if (index == -1) {
            return;
          }
          this.activities.splice(index, 1);

          // update dates arrays
          this.dates.splice(index, 1);
          this.shitActivityDates.splice(index, 1);
        },
        error: (err) => this.errorMessageForErrorComponent = err
      });
  }

}
