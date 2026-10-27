import type { FuelingBatchDTO, FuelDTO, DepartmentDTO } from "@/dto";

export type AreDepartmentsOkParams = {
  payload: FuelingBatchDTO;
  departments: DepartmentDTO[];
};

export type AreFuelsOkParams = {
  payload: FuelingBatchDTO;
  fuels: FuelDTO[];
};
