export type PaginationRepositoryReturn<T> = {
  data: T[];
  totalItems: number;
  totalPages: number;
};

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
};

export type BossFindOneRepositoryParam = {
  id: string;
  isActive?: boolean | null;
  isExternal?: boolean | null;
};
