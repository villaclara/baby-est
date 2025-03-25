import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'monthlocale',
  standalone: true
})
export class MonthlocalePipe implements PipeTransform {

  transform(value: Date, args?: string): string {


    // return "Пт, 21 Березня"
    if(args === 'shortValues')
    {
      const formatter = new Intl.DateTimeFormat('uk-UA', { month: 'long', day: 'numeric', weekday: 'short' });
      const month1 = formatter.format(value);
      const m2 = month1.split(' ') // Split the string by spaces
      .map(word => word.charAt(0).toUpperCase() + word.slice(1)) // Capitalize the first letter
      .join(' '); // Join the words back together;
      return m2;
    }

    // return "20 березня 2025 р."
    else if(args === 'longValues')
    {
      const formatter = new Intl.DateTimeFormat('uk-UA', { dateStyle: 'long' });
      const month1 = formatter.format(value);
      return month1;
    }

    // return "четвер, 20 березня 2025 р. (середУ, неділЮ, суботУ ???????)"
    return new Intl.DateTimeFormat('uk-UA', { dateStyle: 'full' }).format(value);
  }

}
