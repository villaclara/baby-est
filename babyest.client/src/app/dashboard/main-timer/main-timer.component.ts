import { CommonModule, DatePipe } from '@angular/common';
import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { interval, map, Observable, Subject, takeUntil, timer } from 'rxjs';
import { TimerCounterPipe } from '../../pipes/timer-counter.pipe';
import { KidActivity } from '../../models/kid-activity';
import { KidService } from '../../services/KidService/kid.service';
import { Kid } from '../../models/kid';

@Component({
  selector: 'app-main-timer',
  standalone: true,
  imports: [CommonModule, TimerCounterPipe],
  templateUrl: './main-timer.component.html',
  styleUrl: './main-timer.component.css'
})

export class MainTimerComponent implements OnInit, OnChanges {

  constructor(private kidService: KidService) { }


  isRunningTimer: boolean = false;
  startStopImageLink: string = this.isRunningTimer ? '../../../assets/img/stop_icon.png' : '../../../assets/img/play_icon.png';

  timerDone$: Subject<boolean> = new Subject<boolean>();
  timePassed: number = 0;
  timePass$ = timer(1, 1000).pipe(map(n => (this.timePassed + n) * 1000));
  // timePass$ = timer(1, 1000).subscribe(() => { this.timePassed += 1000; console.log(this.timePassed) });
  //a = timer(1, 1000).subscribe(() => this.timePassed +=1);

  currentActivityName: string = 'Чіл';

  isEatingSelected: boolean = false;


  @Output() newKidActivity: EventEmitter<KidActivity> = new EventEmitter<KidActivity>();

  @Input() currentActivity: KidActivity = { ActivityType: '', Id: 0, KidName: '', StartDate: undefined, EndDate: undefined, IsActiveNow: false };


  // When the parent has set CurrentActivity property (in Http get) we want to display actual values of timer etc.
  ngOnChanges(changes: SimpleChanges): void {
    console.log(`onchanges - ${this.currentActivity.Id}`);
    console.log(this.currentActivity.EndDate);
    if (this.currentActivity.IsActiveNow == true) {
      let timeDiff = new Date().getTime() - this.currentActivity.StartDate!.getTime();
      this.timePassed = Math.floor(timeDiff / 1000);
      this.isRunningTimer = true;
      timer(1, 1000).pipe(takeUntil(this.timerDone$)).subscribe(() => this.timePassed += 1);
      this.startStopImageLink = '../../../assets/img/stop_icon.png';
      this.currentActivityName = this.changeCurrentActivityNameUA(this.currentActivity.ActivityType);

      // if ANY eating we set the IsEatingSelected to True
      this.isEatingSelected = this.currentActivity.ActivityType.toLowerCase() != 'sleeping'
        && this.currentActivity.ActivityType != ''
        ? true
        : false;
    }
  }

  ngOnInit(): void {

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
      console.log(this.isRunningTimer);

      // Set current Activity and Start tracking the activity
      this.currentActivity.StartDate = new Date();
      this.currentActivity.IsActiveNow = true;
      console.log(this.currentActivity.StartDate);
      console.log(this.currentActivity.EndDate);


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
      this.currentActivity.EndDate = new Date();
      this.currentActivity.IsActiveNow = false;
      this.currentActivityName = this.changeCurrentActivityNameUA(this.currentActivity.ActivityType);

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


  private changeCurrentActivityNameUA(newActivity : string) : string {
    switch(newActivity.toLowerCase()) {
      case ('sleeping') : {
        return 'Сон';
      }
      case ('') : {
        return 'Чіл';
      }
      default : {
        return 'Їда';
      }
    }
  }

}
