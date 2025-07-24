export interface Response<T> {
  data: T;
  error?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  error?: string;
  currentPage: number;
  totalPages: number;
  totalItems: number;
  limit: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}
