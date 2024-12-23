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

export class MainTimerComponent implements OnInit, OnChanges{

  constructor(private kidService : KidService) { }
  
  
  isRunningTimer : boolean = false;
  startStopImageLink: string = this.isRunningTimer ? '../../../assets/img/stop_icon.png' : '../../../assets/img/play_icon.png';

  timerDone$ : Subject<boolean> = new Subject<boolean>();
  timePassed : number = 0;    
  timePass$ = timer(1, 1000).pipe(map(n => (this.timePassed + n) * 1000));
  // timePass$ = timer(1, 1000).subscribe(() => { this.timePassed += 1000; console.log(this.timePassed) });
  //a = timer(1, 1000).subscribe(() => this.timePassed +=1);

  currentActivityName : string = '';

  isEatingSelected : boolean = false;


  @Output() newKidActivity : EventEmitter<KidActivity> = new EventEmitter<KidActivity>();
  
  @Input() currentActivity : KidActivity = { ActivityType : '', Id : 0, KidName : '', StartDate : undefined, EndDate : undefined, IsActiveNow : false };
 

  // When the parent has set CurrentActivity property (in Http get) we want to display actual values of timer etc.
  ngOnChanges(changes: SimpleChanges): void {
    if(this.currentActivity.IsActiveNow == true)
      {
        let timeDiff = new Date().getTime() - this.currentActivity.StartDate!.getTime();
        this.timePassed = Math.floor(timeDiff / 1000);
        this.isRunningTimer = true;
        timer(1, 1000).pipe(takeUntil(this.timerDone$)).subscribe(() => this.timePassed +=1);
        this.startStopImageLink = '../../../assets/img/stop_icon.png';  
        this.currentActivityName = this.currentActivity.ActivityType;
      }
  }

  ngOnInit(): void {
    
  }

  startSelectEatingType() : void {
    this.isEatingSelected = !this.isEatingSelected;
  }
  
  selectActivity(actType : string) : void {
    console.log(actType);
    this.currentActivity.ActivityType = actType;
  }

  startActivity() : void {

    // When timer is stopped.
    // When we want to start activity and send the currentActivity to api.
    if(!this.isRunningTimer)
    {
      // Start the timer
      interval(1000).pipe(takeUntil(this.timerDone$)).subscribe(() => this.timePassed +=1);
      this.timePassed = 0;
      this.startStopImageLink = '../../../assets/img/stop_icon.png';
      this.isRunningTimer = true;
      console.log(this.isRunningTimer);

      // Set current Activity and Start tracking the activity
      this.currentActivity.StartDate = new Date();
      this.currentActivity.IsActiveNow = true;
      console.log(this.currentActivity.StartDate);


      // Send the info to the parent to send to Api.
      // Parent decides wheter to add or update activity.
      this.newKidActivity.emit(this.currentActivity);
    }

    // When timer is running.
    // When we want to stop activity and send the FULL activity to api.
    else 
    {
      // Stop the timer
      this.timerDone$.next(true);
      this.startStopImageLink = '../../../assets/img/play_icon.png';
      this.isRunningTimer = false;


      // Stop tracking current Activity. Set EndDate
      this.currentActivity.EndDate = new Date();
      this.currentActivity.IsActiveNow = false;

      // Send the info to the parent to send to Api.
      // Parent decides wheter to add or update activity.
      this.newKidActivity.emit(this.currentActivity);

      // Reset this.currentActivity
      this.currentActivity = { 
        ActivityType : '', 
        Id : 0, 
        KidName : '', 
        EndDate : undefined, 
        StartDate : undefined, 
        IsActiveNow : false };

    }
  }
 

}
