import { Component, OnInit } from '@angular/core';
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

@Component({
  selector: 'app-history',
  standalone: true,
  imports: [SingleActivityComponent, NgFor, NgIf, LoadingSpinnerComponent, FormsModule, ErrorPageComponent],
  providers: [DateConverter],
  templateUrl: './history.component.html',
  styleUrl: './history.component.css'
})
export class HistoryComponent implements OnInit {

  constructor(private kidService: KidService,
    private currentKidService: CurrentKidService,
    private dateConverter: DateConverter) {
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
    })
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

      // Set the values in input fields.
      this.startDateString = this.dateConverter.shitDateToISOString(this.selectedEditingAct.StartDate!);
      this.endDateString = this.dateConverter.shitDateToISOString(this.selectedEditingAct.EndDate!);
      this.activityTypeLocalUA = this.translator.changeCurrentActivityFullNameUA(this.selectedEditingAct.ActivityType);
      this.selectedActivityType = this.selectedEditingAct.ActivityType;

      this.activeEditingKidId = actId;

    }
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
        error: (err) => console.log(err)
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
        error: (err) => console.log(err)
      });
  }

}
