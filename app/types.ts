import type {
  VacationDuration,
  VacationPeriod,
  VacationType,
} from "./(secure)/vacation/types";

export type Boss = {
  _id: string;
  role: string;
  isDirector: boolean;
  worker: Worker;
  createdAt: string;
  updatedAt: string;
  isActive: boolean;
  isExternal?: boolean;
};

export type Department = {
  _id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  isActive: boolean;
  responsible: Boss;
};

export type Vacation = {
  _id: string;
  duration: VacationDuration;
  daysQtd?: VacationDuration;
  type: VacationType;
  period: VacationPeriod; // para dayOff
  startDate: Date;
  endDate: Date;
  returnDate?: Date;
  deferred: boolean;
  worker: Worker;
  createdAt: Date;
  updatedAt: Date;
  boss: Boss;
  observation?: string;
  cancelled?: boolean;
};

export interface OldVacation {
  _id: string;
  daysQtd: number;
  startDate: Date;
  worker: string;
  type: VacationType | "vacation";
  deferred: boolean;
  createdAt: Date;
  updatedAt: Date;
  boss: string;
  endDate: Date;
  observation?: string;
}

export type Worker = {
  _id: string;
  name: string;
  role: string;
  registry: string;
  matriculation: string;
  admissionDate: string;
  department: Department;
  justification?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  isExternal?: boolean;
};

export type Entity = Worker | Vacation | Department | Boss;
export type EntityType = "department" | "worker" | "vacation" | "boss";
