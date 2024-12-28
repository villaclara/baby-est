import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'shortTimerCounter',
  standalone: true
})
export class ShortTimerCounterPipe implements PipeTransform {

  transform(value: number, ...args: unknown[]): string {
    
    let hours = 0;
    let minutes = 0;

    if (value >= 3600) {
    hours = Math.floor(value / 3600);      
    value -= 3600 * hours;      
  }

  if (value >= 60) {
    minutes = Math.floor(value / 60);
    value -= 60 * minutes;
  }

  else if(value > 0 && value < 60)
  {
    minutes += 1;
  }

  let minStr : string = minutes < 10 ? '0' + minutes.toString() : minutes.toString();
  let hourStr : string = hours < 10 ? '0' + hours.toString() : hours.toString();


  return `${hourStr} г : ${minStr} хв`;
  }

}
