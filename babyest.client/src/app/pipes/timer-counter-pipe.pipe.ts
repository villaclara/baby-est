import { Pipe, PipeTransform } from '@angular/core';
import { Timespan } from '../models/timespan';
import { Observable } from 'rxjs';

@Pipe({
  name: 'timerCounterPipe',
  standalone: true
})
export class TimerCounterPipe implements PipeTransform {

  transform(value: number, ...args: unknown[]): string {
    
    let hours = 0;
    let minutes = 0;
    let seconds = 0;

    if (value >= 3600) {
    hours = Math.floor(value / 3600);      
    value -= 3600 * hours;      
  }

  if (value >= 60) {
    minutes = Math.floor(value / 60);
    value -= 60 * minutes;
  }

  seconds = value;
  let secStr : string = seconds < 10 ? '0' + seconds.toString() : seconds.toString();
  let minStr : string = minutes < 10 ? '0' + minutes.toString() : minutes.toString();
  let hourStr : string = hours < 10 ? '0' + hours.toString() : hours.toString();


  return `${hourStr} : ${minStr} : ${secStr}`;
  }

}
