import type { DepartmentFormData } from "@/app/(secure)/department/types";
import type { FuelingBatchDTO, FuelDTO, DepartmentDTO } from "@/dto";
import type { Repository } from "../types";

export type AreDepartmentsOkParams = {
  payload: FuelingBatchDTO;
  DepartmentRepository: Repository<DepartmentDTO, DepartmentFormData>;
};

export type AreFuelsOkParams = {
  payload: FuelingBatchDTO;
  fuels: FuelDTO[];
};
