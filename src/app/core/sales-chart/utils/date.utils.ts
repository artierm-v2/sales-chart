// src/app/utils/date.utils.ts
export class DateUtils {
  static formatDateToISO(dateString: string): string {
    return new Date(dateString).toISOString();
  }

  static formatDateForInput(dateString: string): string {
    return new Date(dateString).toISOString().split('T')[0];
  }

  static formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  static parseDate(dateString: string): Date {
    return new Date(dateString);
  }

  static getQuarter(date: Date): string {
    const year = date.getFullYear();
    const quarter = Math.floor(date.getMonth() / 3) + 1;
    return `${year}/Q${quarter}`;
  }

  static getMonth(date: Date): string {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    return `${year}-${month}`;
  }

  static getWeek(date: Date): string {
    const weekStart = new Date(date);
    weekStart.setDate(weekStart.getDate() - weekStart.getDay() + 1);
    return DateUtils.formatDate(weekStart);
  }

  static getDay(date: Date): string {
    return DateUtils.formatDate(date);
  }
}
