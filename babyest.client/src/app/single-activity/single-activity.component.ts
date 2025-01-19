import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { KidActivity } from '../models/kid-activity';
import { DatePipe } from '@angular/common';
import { ActivityNameTranslator } from '../utils/activity-name-translator';
import { ShortTimerCounterPipe } from '../pipes/short-timer-counter.pipe';
import { NgIf } from '@angular/common';

@Component({
  selector: 'app-single-activity',
  standalone: true,
  imports: [DatePipe, ShortTimerCounterPipe, NgIf],
  templateUrl: './single-activity.component.html',
  styleUrl: './single-activity.component.css'
})
export class SingleActivityComponent implements OnInit {

  @Input() activity: KidActivity = { Id: 0, ActivityType: '', StartDate: new Date(), EndDate: new Date(), IsActiveNow: false, KidName: '' };
  @Input() isRichSingleActivity : boolean = false;
  
  activityTime: number = 0;
  activityNameUA: string = '';
  private translator: ActivityNameTranslator = new ActivityNameTranslator();

  ngOnInit(): void {
    this.activityNameUA = this.translator.changeCurrentActivityFullNameUA(this.activity.ActivityType);
    this.activityTime = Math.ceil(new Date(this.activity.EndDate!).getTime() - new Date(this.activity.StartDate!).getTime()) / 1000;
  }

}
