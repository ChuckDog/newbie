import * as moment from 'moment';

export function getSecondsUntilunixTimestamp(unixTimestamp: number): number {
  const unixNow = moment().unix();
  return unixTimestamp - unixNow;
}

export function convertUnixToDate(unixTimestamp: number): Date {
  return moment.unix(unixTimestamp).toDate();
}

export function currentPlusMinutes(minutes: number): Date {
  const currentTime = new Date();
  return new Date(currentTime.getTime() + minutes * 60000); // 1 min = 60000 ms
}

export function datePlusMinutes(date: Date, minutes: number): Date {
  return new Date(date.getTime() + minutes * 60000); // 1 min = 60000 ms
}

export function dateMinusMinutes(date: Date, minutes: number): Date {
  return new Date(date.getTime() - minutes * 60000); // 1 min = 60000 ms
}

export function datePlusYears(date: Date, years: number): Date {
  const year = date.getFullYear() + years;
  return new Date(date.setFullYear(year));
}

/**
 * Example: datePlusYearsForString('1990-01-01', 1) => '1991-01-01'
 */
export function datePlusYearsForString(dateStr: string, years: number): string {
  const date = new Date(dateStr);
  const year = date.getFullYear() + years;
  const newDate = new Date(date.setFullYear(year));
  return newDate.toISOString().split('T')[0];
}

export function dayOfWeek(year: number, month: number, day: number) {
  const date = new Date(year, month - 1, day);
  return date.getDay();
}

export function firstDayOfMonth(year: number, month: number) {
  return new Date(year, month - 1, 1);
}

export function lastDayOfMonth(year: number, month: number) {
  return new Date(year, month, 0);
}

/**
 * Get the number of week for a specific day in a month. It will return 1 to 6.
 */
export function weekOfMonth(year: number, month: number, day: number) {
  const date = new Date(year, month - 1, day);
  const dayOfWeek = date.getDay();
  const dayOfMonth = date.getDate();
  return Math.ceil((dayOfMonth + (dayOfWeek == 0 ? 0 : 6 - dayOfWeek)) / 7);
}

/**
 * Get the number of week for a specific day in a year. It will return 1 to 53.
 */
export function weekOfYear(year: number, month: number, day: number) {
  const date = new Date(year, month - 1, day);
  return parseInt(moment(date).format('W'));
}

/**
 * Example: September, 2023
 * generateMonthlyCalendar(2023, 9) =>
  [
    [ { year: 2023, month: 9, dayOfMonth: 1, dayOfWeek: 5 }, 
      { year: 2023, month: 9, dayOfMonth: 2, dayOfWeek: 6 } 
    ],
    [
      { year: 2023, month: 9, dayOfMonth: 3, dayOfWeek: 0 },
      { year: 2023, month: 9, dayOfMonth: 4, dayOfWeek: 1 },
      { year: 2023, month: 9, dayOfMonth: 5, dayOfWeek: 2 },
      { year: 2023, month: 9, dayOfMonth: 6, dayOfWeek: 3 },
      { year: 2023, month: 9, dayOfMonth: 7, dayOfWeek: 4 },
      { year: 2023, month: 9, dayOfMonth: 8, dayOfWeek: 5 },
      { year: 2023, month: 9, dayOfMonth: 9, dayOfWeek: 6 }
    ],
    ...
  ]
 */
export function daysOfMonth(year: number, month: number) {
  const numberOfDays = new Date(year, month, 0).getDate(); // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date/Date#syntax

  const daysOfMonth: {
    year: number;
    month: number;
    dayOfMonth: number;
    dayOfWeek: number;
    weekOfMonth: number;
    weekOfYear: number;
  }[][] = [[]];
  for (let day = 1, week = 0; day <= numberOfDays; day++) {
    const date = new Date(year, month - 1, day);
    const dayOfMonth = date.getDate();
    const dayOfWeek = date.getDay();

    // * Monday is the first day => if (dayOfWeek === 1 && day !== 1)
    // * Sunday is the first day => if (dayOfWeek === 0 && day !== 1)
    if (dayOfWeek === 1 && day !== 1) {
      week += 1;
      daysOfMonth[week] = [];
    }

    daysOfMonth[week].push({
      year,
      month,
      dayOfMonth,
      dayOfWeek,
      weekOfMonth: week + 1,
      weekOfYear: weekOfYear(year, month, dayOfMonth),
    });
  }
  return daysOfMonth;
}

export function daysOfWeek(
  year: number,
  month: number,
  weekOfMonth: number // 1~6
) {
  const numberOfDays = new Date(year, month, 0).getDate(); // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date/Date#syntax

  const daysOfWeek: {
    year: number;
    month: number;
    dayOfMonth: number;
    dayOfWeek: number;
    weekOfMonth: number;
    weekOfYear: number;
  }[] = [];
  for (let day = 1, week = 0; day <= numberOfDays; day++) {
    const date = new Date(year, month - 1, day);
    const dayOfMonth = date.getDate();
    const dayOfWeek = date.getDay();

    // * Monday is the first day => if (dayOfWeek === 1 && day !== 1)
    // * Sunday is the first day => if (dayOfWeek === 0 && day !== 1)
    if (dayOfWeek === 1 && day !== 1) {
      week += 1;
    }
    if (week === weekOfMonth - 1) {
      daysOfWeek.push({
        year,
        month,
        dayOfMonth,
        dayOfWeek,
        weekOfMonth: week + 1,
        weekOfYear: weekOfYear(year, month, dayOfMonth),
      });
    }
  }
  return daysOfWeek;
}
