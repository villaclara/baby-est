import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { interval, map, Observable, Subject, takeUntil, timer } from 'rxjs';
import { TimerCounterPipe } from '../../pipes/timer-counter.pipe';

@Component({
  selector: 'app-main-timer',
  standalone: true,
  imports: [CommonModule, TimerCounterPipe],
  templateUrl: './main-timer.component.html',
  styleUrl: './main-timer.component.css'
})

export class MainTimerComponent {

  isRunningTimer : boolean = false;

  timerDone$ : Subject<boolean> = new Subject<boolean>();
  timePassed : number = 0;    
  timePass$ = timer(1, 1000).pipe(map(n => (this.timePassed + n) * 1000));
  // timePass$ = timer(1, 1000).subscribe(() => { this.timePassed += 1000; console.log(this.timePassed) });
  //a = timer(1, 1000).subscribe(() => this.timePassed +=1);


  setTimerRunning() : void {
    this.isRunningTimer = !this.isRunningTimer;
    console.log(this.isRunningTimer);
    if(this.isRunningTimer)
    {
      interval(1000).pipe(takeUntil(this.timerDone$)).subscribe(() => this.timePassed +=1);
      this.timePassed = 0;
    }
    else 
    {
      this.timerDone$.next(true);
    }
  }
}
