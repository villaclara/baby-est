import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'monthlocale',
  standalone: true
})
export class MonthlocalePipe implements PipeTransform {

  transform(value: Date, args?: string): string {


    if(args === 'shortValues')
    {
      const formatter = new Intl.DateTimeFormat('uk-UA', { month: 'long', day: 'numeric', weekday: 'short' });
      const month1 = formatter.format(value);
      return month1;
    }

    else if(args === 'longValues')
    {
      const formatter = new Intl.DateTimeFormat('uk-UA', { dateStyle: 'long' });
      const month1 = formatter.format(value);
      return month1;
    }

    return new Intl.DateTimeFormat('uk-UA', {dateStyle: 'full'}).format(value);
  }

}
