import { VacationType } from "./(secure)/vacation/types";

export type Boss = {
  _id: string;
  name: string;
  role: string;
  isDirector: boolean;
  worker?: Worker;
  createdAt: Date;
  updatedAt: Date;
  isActive: boolean;
};

export type Department = {
  _id: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
  responsible: Boss;
};

export type Vacation = {
  _id: string;
  duration?: 0.5 | 1 | 15 | 30 | 45 | 60 | 75 | 90;
  daysQtd?: 0.5 | 1 | 15 | 30 | 45 | 60 | 75 | 90;
  type: VacationType;
  period?: "half" | "full"; // para dayOff
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

export type Worker = {
  _id: string;
  name: string;
  role: string;
  registry: string;
  matriculation: string;
  admissionDate: Date;
  department: Department;
  justification?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
};

export type Entity = Worker | Vacation | Department | Boss;
export type EntityType = "department" | "worker" | "vacation" | "boss";
