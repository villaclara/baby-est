import { CommonModule, DatePipe } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
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

export class MainTimerComponent {

  constructor(private kidService : KidService) { }
  isRunningTimer : boolean = false;
  startStopImageLink: string = this.isRunningTimer ? '../../../assets/img/stop_icon.png' : '../../../assets/img/play_icon.png';

  timerDone$ : Subject<boolean> = new Subject<boolean>();
  timePassed : number = 0;    
  timePass$ = timer(1, 1000).pipe(map(n => (this.timePassed + n) * 1000));
  // timePass$ = timer(1, 1000).subscribe(() => { this.timePassed += 1000; console.log(this.timePassed) });
  //a = timer(1, 1000).subscribe(() => this.timePassed +=1);


  isEatingSelected : boolean = false;


  @Output() newKidActivity : EventEmitter<KidActivity> = new EventEmitter<KidActivity>();
  
  // Make this Input from api received. 
  currentActivity : KidActivity = {ActivityType : '', Id : 0, KidName : '', StartDate : undefined, EndDate : undefined };
 


  startSelectEatingType() : void {
    this.isEatingSelected = !this.isEatingSelected;
  }
  
  selectActivity(actType : string) : void {
    console.log(actType);
    this.currentActivity.ActivityType = actType;
  }

  startActivity() : void {

    if(!this.isRunningTimer)
    {
      // Start the timer
      interval(1000).pipe(takeUntil(this.timerDone$)).subscribe(() => this.timePassed +=1);
      this.timePassed = 0;
      this.startStopImageLink = '../../../assets/img/stop_icon.png'
      this.isRunningTimer = true;
      console.log(this.isRunningTimer);

      // Set current Activity and Start tracking the activity
      this.currentActivity.StartDate = new Date();
      console.log(this.currentActivity.StartDate);


      // Send the info to the parent to send to Api
      // ???????????
      this.newKidActivity.emit(this.currentActivity);
    }
    else 
    {
      // Stop the timer
      this.timerDone$.next(true);
      this.startStopImageLink = '../../../assets/img/play_icon.png';
      this.isRunningTimer = false;


      // Stop tracking current Activity. Set EndDate
      this.currentActivity.EndDate = new Date();

      // Send the info to the parent to send to Api
      this.newKidActivity.emit(this.currentActivity);

      // Reset this.currentActivity
      this.currentActivity = {ActivityType : '', Id : 0, KidName : '', EndDate : undefined, StartDate : undefined };

    }
  }
 

}
