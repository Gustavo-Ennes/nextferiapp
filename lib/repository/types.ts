import type { VacationFormData } from "@/app/(secure)/vacation/types";
import type { Vacation } from "@/app/types";

export type VacationFindRepositoryReturn = {
  data: Vacation[];
  totalItems: number;
  totalPages: number;
};

export type VacationFindOneRepositoryParam = {
  id: string;
  cancelled?: boolean | null;
};

export type VacationUpdateRepositoryParam = {
  id: string;
  payload: Partial<VacationFormData>;
}
