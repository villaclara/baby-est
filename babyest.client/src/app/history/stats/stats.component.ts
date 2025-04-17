import { Component, Input } from '@angular/core';
import { ShortTimerCounterPipe } from '../../pipes/short-timer-counter.pipe';
import { MonthlocalePipe } from '../../pipes/monthlocale.pipe';

@Component({
  selector: 'app-stats',
  standalone: true,
  imports: [ShortTimerCounterPipe],
  templateUrl: './stats.component.html',
  styleUrl: './stats.component.css'
})
export class StatsComponent {

  @Input() sleepTimeToday: number = 0;

  @Input() sleepTimeNight: number = 0;

  @Input() averageSleepNight: number = 0;

  @Input() averageSleepFullday: number = 0;

  someDate: number = new Date().getHours();


}
