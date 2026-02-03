import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'dateTime',
  standalone: true,
})
export class DateTimePipe implements PipeTransform {
  transform(value: string | Date | null): string {
    if (!value) return '';
    const date = new Date(value);
    return date.toLocaleString();
  }
}
