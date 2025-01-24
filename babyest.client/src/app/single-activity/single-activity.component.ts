import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { KidActivity } from '../models/kid-activity';
import { DatePipe } from '@angular/common';
import { ActivityNameTranslator } from '../utils/activity-name-translator';
import { ShortTimerCounterPipe } from '../pipes/short-timer-counter.pipe';
import { NgIf, NgClass } from '@angular/common';

@Component({
  selector: 'app-single-activity',
  standalone: true,
  imports: [DatePipe, ShortTimerCounterPipe, NgIf, NgClass],
  templateUrl: './single-activity.component.html',
  styleUrl: './single-activity.component.css'
})
export class SingleActivityComponent implements OnInit {
  
  @Input() activity: KidActivity = { Id: 0, ActivityType: '', StartDate: new Date(), EndDate: new Date(), IsActiveNow: false, KidName: '' };
  @Input() isRichSingleActivity : boolean = false;
  
  @Output() selectedEditActivityEmit: EventEmitter<number> = new EventEmitter<number>();


  @Input() editingKidId : number = -1;

  activityTime: number = 0;
  activityNameUA: string = '';
  private translator: ActivityNameTranslator = new ActivityNameTranslator();
  
  isEditingPressed: boolean = false;
  currentSelectedId: number = 0;
  otherActsClosed: boolean = true;
  chevronSrc: string = this.isEditingPressed ? 'bi bi-chevron-up' : 'bi bi-chevron-down';

  get actTime() : number {
    if(this.activity.Id != 0)
    {
      return Math.ceil(new Date(this.activity.EndDate!).getTime() - new Date(this.activity.StartDate!).getTime()) / 1000;
    }
    return 0;
  }


  get actNameUA() : string {
    if (this.activity.Id != 0)
    {
      return this.translator.changeCurrentActivityFullNameUA(this.activity.ActivityType);
    }
    return '';
  }


  ngOnInit(): void {
    this.activityNameUA = this.translator.changeCurrentActivityFullNameUA(this.activity.ActivityType);
    this.activityTime = Math.ceil(new Date(this.activity.EndDate!).getTime() - new Date(this.activity.StartDate!).getTime()) / 1000;
    console.log("init starteim - " + this.activity.StartDate);
  }

  editActivity() : void {
    
    // this.otherActsClosed = false;

    // if(this.currentSelectedId != actId) {
    //   this.otherActsClosed = true;
    // }

    this.isEditingPressed = !this.isEditingPressed;
    this.chevronSrc = this.isEditingPressed ? 'bi bi-chevron-up' : 'bi bi-chevron-down';
    this.selectedEditActivityEmit.emit(this.activity.Id);
    // this.currentSelectedId = actId;
  }

}
