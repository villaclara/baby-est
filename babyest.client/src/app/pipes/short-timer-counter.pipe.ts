import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'shortTimerCounter',
  standalone: true
})
export class ShortTimerCounterPipe implements PipeTransform {

  transform(value: number, args?: string): string {
    
    let hours = 0;
    let minutes = 0;

    if (value >= 3600) {
    hours = Math.floor(value / 3600);      
    value -= 3600 * hours;      
  }
  
  if(value > 10 && value < 60)
  {
    minutes += 1;
  }
  else if (value >= 60) {
    minutes = Math.floor(value / 60);
    value -= 60 * minutes;
  }


  let minStr : string = minutes < 10 ? '0' + minutes.toString() : minutes.toString();
  let hourStr : string = hours < 10 ? '0' + hours.toString() : hours.toString();

  if(args === 'HH:mm')
  {
    return `${hourStr}г : ${minStr}хв`; 
  }

  return `${hourStr} : ${minStr}`;
  }

}
