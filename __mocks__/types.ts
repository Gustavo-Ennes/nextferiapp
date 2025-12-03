import type {
  VacationPeriod,
  VacationType,
} from "@/app/(secure)/vacation/types";
import type { Types } from "mongoose";

export type RawWorker = {
  _id?: Types.ObjectId;
  name: string;
  role: string;
  registry: string;
  matriculation: string;
  admissionDate: string;
  department: Types.ObjectId;
  justification?: string;
  isActive: boolean;
  isExternal?: boolean;
};

export type RawDepartment = {
  _id?: Types.ObjectId;
  name: string;
  isActive: boolean;
  responsible?: Types.ObjectId;
};

export type RawBoss = {
  _id?: Types.ObjectId;
  role: string;
  isDirector: boolean;
  worker: Types.ObjectId;
  isActive: boolean;
  isExternal?: boolean;
};

export type RawVacation = {
  _id?: Types.ObjectId;
  duration: number;
  type: VacationType;
  period: VacationPeriod;
  startDate: string;
  endDate?: string;
  returnDate?: string;
  worker: Types.ObjectId;
  boss: Types.ObjectId;
  observation?: string;
  cancelled?: boolean;
};
