import type { SearchParams } from "@/app/(secure)/types";
import type { PaginatedResponse } from "@/app/api/types";

export type VacationFindOneRepositoryParam = {
  id: string;
  cancelled?: boolean | null;
};

export type UpdateRepositoryParam<T> = {
  id: string;
  payload: Partial<T>;
};

export type FindOneRepositoryParam = {
  id: string;
  isActive?: boolean | null;
  isExternal?: boolean | null;
  cancelled?: boolean | null;
  isDirector?: boolean | null;
};

export type BossFindOneRepositoryParam = {
  id: string;
  isActive?: boolean | null;
  isExternal?: boolean | null;
};

export type Repository<Entity, FormData> = {
  find: (params: SearchParams) => Promise<PaginatedResponse<Entity>>;
  findByReference?: (ref: string) => Promise<Entity | null>;
  findByFilter?: (
    filter: FormData | Partial<FormData>,
  ) => Promise<Entity | null>;
  create: (payload: FormData) => Promise<Entity>;
  findOne: (param: FindOneRepositoryParam) => Promise<Entity | null>;
  update: (param: UpdateRepositoryParam<FormData>) => Promise<Entity | null>;
  delete: (id: string) => Promise<Entity | null>;
  findWithoutPagination?: (params: SearchParams) => Promise<Entity[]>;
};
