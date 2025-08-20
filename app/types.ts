import {
  VacationDuration,
  VacationPeriod,
  VacationType,
} from "./(secure)/vacation/types";

export type Boss = {
  _id: string;
  name: string;
  role: string;
  isDirector: boolean;
  worker?: Worker;
  createdAt: string;
  updatedAt: string;
  isActive: boolean;
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
  startDate: string;
  endDate: string;
  returnDate?: string;
  deferred: boolean;
  worker: Worker;
  createdAt: string;
  updatedAt: string;
  boss: Boss;
  observation?: string;
  cancelled?: boolean;
};

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
};

export type Entity = Worker | Vacation | Department | Boss;
export type EntityType = "department" | "worker" | "vacation" | "boss";
