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
  
  // Displays edit button
  @Input() isRichSingleActivity : boolean = false;
  
  // emit the activityId to edit to the parent History
  @Output() selectedEditActivityEmit: EventEmitter<number> = new EventEmitter<number>();

  // Decides whether to display chevron-up or chevron-down
  // -1 -- not set
  // 0 -- chevron down
  // value - if value == activity.Id -- chevron up 
  @Input() editingKidId : number = -1;

  activityTime: number = 0;
  activityNameUA: string = '';
  private translator: ActivityNameTranslator = new ActivityNameTranslator();
  
  isEditingPressed: boolean = false;

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
  }

  editActivity() : void {
    this.isEditingPressed = !this.isEditingPressed;
    this.selectedEditActivityEmit.emit(this.activity.Id);
  }

}
