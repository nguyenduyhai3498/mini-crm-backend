export class PaginationDto {
  page?: number = 1;
  limit?: number = 10;
}

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  totalPages: number;
}







