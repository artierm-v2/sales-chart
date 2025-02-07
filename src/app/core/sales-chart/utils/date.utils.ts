import { KeyValue } from "../../../features/sales-chart/interfaces/key-value.interface";

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

  static isItemInWeek(item: KeyValue, year: number, week: number): boolean {
    const itemDate = new Date(item.key);
    const itemYear = itemDate.getFullYear();
    const itemWeek = this.getWeekNumber(itemDate);

    return itemYear === year && itemWeek === week;
  }

  static isItemInDay(item: KeyValue, date: Date): boolean {
    const itemDate = new Date(item.key);
    return itemDate.getDate() === date.getDate() &&
      itemDate.getMonth() === date.getMonth() &&
      itemDate.getFullYear() === date.getFullYear();
  }

  static isItemInQuarter(data: KeyValue, year: number, quarter: number): boolean {
    const itemDate = new Date(data.key);
    const itemYear = itemDate.getFullYear();
    const itemQuarter = Math.floor(itemDate.getMonth() / 3) + 1;

    return itemYear === year && itemQuarter === quarter;
  }

  static isItemInMonth(data: KeyValue, year: number, month: number): boolean {
    const itemDate = new Date(data.key);
    return itemDate.getFullYear() === year &&
      itemDate.getMonth() === month;
  }

  private static getWeekNumber(date: Date): number {
    const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
    const pastDaysOfYear = (date.getTime() - firstDayOfYear.getTime()) / 86400000;

    const firstMonday = new Date(firstDayOfYear);
    if (firstDayOfYear.getDay() !== 1) {
      const daysToAdd = (1 - firstDayOfYear.getDay() + 7) % 7;
      firstMonday.setDate(firstMonday.getDate() + daysToAdd);
    }

    const daysSinceFirstMonday = (date.getTime() - firstMonday.getTime()) / 86400000;
    return Math.floor(daysSinceFirstMonday / 7) + 1;
  }
}
