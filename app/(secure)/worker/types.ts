import { Department, Worker } from "@/app/types";
import * as z from "zod";
import { WorkerValidator } from "./validator";

export type WorkerFormData = z.infer<typeof WorkerValidator>;

export interface WorkerProps {
  defaultValues?: Worker;
  departments: Department[];
}

export type WorkerFormProp =
  | "name"
  | "role"
  | "registry"
  | "matriculation"
  | "justification";

export type MinMaxStringMessageParam = {
  prop: WorkerFormProp;
  condition: "min" | "max";
};
