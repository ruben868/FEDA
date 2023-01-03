export interface PeriodoModel {
  _id: string;

  start: Date;
  end: Date;
  startNum: number;
  endNum: number;

  weekNum: number;
  weekLabel: string;
  year: number;
  yearWeek: string;
  isActive: boolean;
}
