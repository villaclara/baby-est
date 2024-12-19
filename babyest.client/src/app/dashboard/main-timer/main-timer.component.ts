import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { map, timer } from 'rxjs';
import { TimerCounterPipe } from '../../pipes/timer-counter-pipe.pipe';

@Component({
  selector: 'app-main-timer',
  standalone: true,
  imports: [CommonModule, TimerCounterPipe],
  templateUrl: './main-timer.component.html',
  styleUrl: './main-timer.component.css'
})

export class MainTimerComponent {

  @Input() timePassed = 0;
  
  timePass$ = timer(1, 1000).pipe(map(n => (this.timePassed + n) * 1000));
  // timePass$ = timer(1, 1000).subscribe(() => { this.timePassed += 1000; console.log(this.timePassed) });
  //a = timer(1, 1000).subscribe(() => this.timePassed +=1);
}
