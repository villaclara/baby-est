import { Component, OnInit } from '@angular/core';
import { SingleActivityComponent } from '../../single-activity/single-activity.component';
import { KidService } from '../../services/KidService/kid.service';
import { KidActivity } from '../../models/kid-activity';
import { CurrentKidService } from '../../services/CurrentKid/current-kid.service';
import { NgFor, NgIf } from '@angular/common';
import { LoadingSpinnerComponent } from "../../loading-spinner/loading-spinner.component";
import { ActivityNameTranslator } from '../../utils/activity-name-translator';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-history',
  standalone: true,
  imports: [SingleActivityComponent, NgFor, NgIf, LoadingSpinnerComponent, FormsModule],
  templateUrl: './history.component.html',
  styleUrl: './history.component.css'
})
export class HistoryComponent implements OnInit {
  
  constructor(private kidService : KidService,
    private currentKidService : CurrentKidService
  ) { }

  translator: ActivityNameTranslator = new ActivityNameTranslator();
  activities : KidActivity[] = [];

  isLoading: boolean = true;

  selectedEditingAct : KidActivity = {Id : 0, ActivityType : '', EndDate : new Date(), StartDate : new Date(), IsActiveNow : false, KidName : ''};

  isEditingKid : boolean = false;

  testDate : Date = new Date();


  startDateString: string = '';
  endDateString: string = '';
  activityTypeLocalUA: string = '';

  ngOnInit(): void {
    const currentKidId = this.currentKidService.getCurrentKid();
    this.kidService.getKidActivitiesById(currentKidId).subscribe({
      next: (data : KidActivity[]) => {
        this.activities = data;
        this.isLoading = false;
      },
      error: (err) => 
        {
          console.log(err.message);
          this.isLoading = false;
        }
    })
  }

  editActivity(actId : number) : void {

    console.log("received actid - " + actId);
    if(this.selectedEditingAct.Id == actId && this.isEditingKid == true)
    {
      this.isEditingKid = false;
    }
    else 
    {
      this.selectedEditingAct = this.activities.find((el) => el.Id == actId)!;
      this.isEditingKid = true;

      this.startDateString = this.selectedEditingAct.StartDate!.toString().slice(0, 16);
      this.endDateString = this.selectedEditingAct.EndDate!.toString().slice(0, 16);
      this.activityTypeLocalUA = this.translator.changeCurrentActivityFullNameUA(this.selectedEditingAct.ActivityType);

    }
  }

  
}
