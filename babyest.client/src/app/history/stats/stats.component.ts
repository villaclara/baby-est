import { Component, Input } from '@angular/core';
import { ShortTimerCounterPipe } from '../../pipes/short-timer-counter.pipe';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-stats',
  standalone: true,
  imports: [ShortTimerCounterPipe, DatePipe],
  templateUrl: './stats.component.html',
  styleUrl: './stats.component.css'
})
export class StatsComponent {

  @Input() sleepTimeToday: number = 0;

  @Input() sleepTimeNight: number = 0;

  @Input() averageSleepNight: number = 0;

  @Input() averageSleepFullday: number = 0;

  @Input() fromDate: Date = new Date();

  @Input() toDate: Date = new Date();

  someDate: number = new Date().getHours();


}
