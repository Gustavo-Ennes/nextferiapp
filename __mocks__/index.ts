import type { EntityType } from "@/app/types";
import { getBossMock } from "./boss";
import { getDepartmentMock } from "./department";
import { getVacationMock } from "./vacation";
import { getWorkerMock } from "./worker";

export const getMocked = (entityType: EntityType) => {
  switch (entityType) {
    case "boss":
      return getBossMock();
    case "department":
      return getDepartmentMock();
    case "vacation":
      return getVacationMock();
    case "worker":
      return getWorkerMock();
    default:
      console.warn(`There's no mock for entity type: ${entityType}`);
      return;
  }
};
