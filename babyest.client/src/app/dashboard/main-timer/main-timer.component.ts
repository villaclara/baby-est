import { CommonModule, DatePipe } from '@angular/common';
import { Component, EventEmitter, Input, OnChanges, OnDestroy, OnInit, Output, SimpleChanges } from '@angular/core';
import { interval, map, Observable, Subject, takeUntil, timer } from 'rxjs';
import { TimerCounterPipe } from '../../pipes/timer-counter.pipe';
import { KidActivity } from '../../models/kid-activity';
import { KidService } from '../../services/KidService/kid.service';
import { ActivityNameTranslator } from '../../utils/activity-name-translator';
import { NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-main-timer',
  standalone: true,
  imports: [CommonModule, TimerCounterPipe, NgIf, FormsModule],
  templateUrl: './main-timer.component.html',
  styleUrl: './main-timer.component.css'
})

export class MainTimerComponent implements OnInit, OnChanges, OnDestroy {

  constructor(private kidService: KidService) { }
  
  ngOnDestroy(): void {
    this.timerDone$.unsubscribe();
  }


  isRunningTimer: boolean = false;
  startStopImageLink: string = this.isRunningTimer ? '../../../assets/img/stop_icon.png' : '../../../assets/img/play_icon.png';

  timerDone$: Subject<boolean> = new Subject<boolean>();
  timePassed: number = 0;
  timePass$ = timer(1, 1000).pipe(map(n => (this.timePassed + n) * 1000));
  // timePass$ = timer(1, 1000).subscribe(() => { this.timePassed += 1000; console.log(this.timePassed) });
  //a = timer(1, 1000).subscribe(() => this.timePassed +=1);

  currentActivityNameUA: string = 'Чіл';

  isEatingSelected: boolean = false;

  private translator : ActivityNameTranslator = new ActivityNameTranslator();

  @Output() newKidActivity: EventEmitter<KidActivity> = new EventEmitter<KidActivity>();

  @Input() currentActivity: KidActivity = { ActivityType: '', Id: 0, KidName: '', StartDate: undefined, EndDate: undefined, IsActiveNow: false };

  nowDate : string = '';

  // When the parent has set CurrentActivity property (in Http get) we want to display actual values of timer etc.
  ngOnChanges(changes: SimpleChanges): void {
   
    if (this.currentActivity.IsActiveNow == true) {
      let timeDiff = new Date().getTime() - new Date(this.currentActivity.StartDate!).getTime();
      this.timePassed = Math.floor(timeDiff / 1000);
      this.isRunningTimer = true;
      timer(1, 1000).pipe(takeUntil(this.timerDone$)).subscribe(() => this.timePassed += 1);
      this.startStopImageLink = '../../../assets/img/stop_icon.png';
      this.currentActivityNameUA = this.translator.changeCurrentActivityNameUA(this.currentActivity.ActivityType);

      // if ANY eating we set the IsEatingSelected to True
      this.isEatingSelected = this.currentActivity.ActivityType.toLowerCase() != 'sleeping'
        && this.currentActivity.ActivityType != ''
        ? true
        : false;
    }
  }

  ngOnInit(): void {
    // const dat = new Date();
    // let hours = dat.getHours() < 10 ? "0" + dat.getHours() : dat.getHours();
    // let minutes = dat.getMinutes() < 10 ? "0" + dat.getMinutes() : dat.getMinutes();
    // this.nowDate = hours + ":" + minutes;
    // console.log(this.nowDate);
  }

  startSelectEatingType(): void {
    this.isEatingSelected = !this.isEatingSelected;

    // Because we want to remove highlight from Sleeping (if it was selected before) as soon as we press 'Eating'.
    // Also we disable the 'Play' button if only pressed 'Eating' without specifying exact type.
    this.currentActivity.ActivityType = '';
  }

  selectActivity(actType: string): void {

    // Second click on Sleeping removing the highlight.
    if (this.currentActivity.ActivityType.toLowerCase() == 'sleeping' && actType.toLowerCase() == 'sleeping') {
      this.currentActivity.ActivityType = '';
    }
    // Normal behavior
    else {
      this.currentActivity.ActivityType = actType;
    }

    // Highlight proper activity type.
    this.isEatingSelected = this.currentActivity.ActivityType.toLowerCase() != 'sleeping'
      && this.currentActivity.ActivityType != ''
      ? true
      : false;

  }

  startActivity(): void {

    // When timer is stopped.
    // When we want to start activity and send the currentActivity to api.
    if (!this.isRunningTimer) {
      // Start the timer
      interval(1000).pipe(takeUntil(this.timerDone$)).subscribe(() => this.timePassed += 1);
      this.timePassed = 0;
      this.startStopImageLink = '../../../assets/img/stop_icon.png';
      this.isRunningTimer = true;

      // Set current Activity and Start tracking the activity
      this.nowDate = '';
      this.currentActivity.StartDate = new Date();
      this.currentActivity.IsActiveNow = true;
      this.currentActivityNameUA = this.translator.changeCurrentActivityNameUA(this.currentActivity.ActivityType);


      // Send the info to the parent to send to Api.
      // Parent decides wheter to add or update activity.
      this.newKidActivity.emit(this.currentActivity);
    }

    // When timer is running.
    // When we want to stop activity and send the FULL activity to api.
    else {
      // Stop the timer
      this.timerDone$.next(true);
      this.startStopImageLink = '../../../assets/img/play_icon.png';
      this.isRunningTimer = false;
      this.isEatingSelected = false;

      // Stop tracking current Activity. Set EndDate
      if(this.nowDate != '')
      {
        let y = new Date().getFullYear();
        let m = new Date().getMonth() < 9 ? "0" + (new Date().getMonth() + 1) : new Date().getMonth();
        let d = new Date().getDate() < 10 ? "0" + new Date().getDate() : new Date().getDate();
        let ddd = y + "-" + m + "-" + d + "T" + this.nowDate + ":00";
        this.currentActivity.EndDate = new Date(ddd);
      }
      else 
      {
        this.currentActivity.EndDate = new Date();
      }


      this.currentActivity.IsActiveNow = false;
      this.currentActivityNameUA = 'Чіл';
      this.timePassed = 0;

      console.log(`id- ${this.currentActivity.Id}`);
      // Send the info to the parent to send to Api.
      // Parent decides wheter to add or update activity.
      this.newKidActivity.emit(this.currentActivity);

      // Reset this.currentActivity
      // this.currentActivity = { 
      //   ActivityType : '', 
      //   Id : 0, 
      //   KidName : '', 
      //   EndDate : undefined, 
      //   StartDate : undefined, 
      //   IsActiveNow : false 
      // };

    }
  }

}
