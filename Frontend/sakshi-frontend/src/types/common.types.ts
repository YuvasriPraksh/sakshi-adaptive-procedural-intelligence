export interface ApiResponse<T> {
  data:    T;
  message: string;
  success: boolean;
}
export interface PaginatedResponse<T> {
  data:       T[];
  pagination: { page: number; pageSize: number; total: number; totalPages: number };
  message:    string;
  success:    boolean;
}
export interface ApiError {
  message:    string;
  code?:      string;
  statusCode: number;
  errors?:    Record<string, string[]>;
}

export type Nullable<T>  = T | null;
export type Optional<T>  = T | undefined;
export type Maybe<T>     = T | null | undefined;
export type ID           = string;
export type Timestamp    = string;

export interface SelectOption<T = string> {
  label:     string;
  value:     T;
  disabled?: boolean;
}

export type SortOrder = "asc" | "desc";
export interface SortConfig   { field: string; order: SortOrder; }
export interface FilterConfig { field: string; operator: "eq"|"ne"|"gt"|"gte"|"lt"|"lte"|"contains"|"in"; value: unknown; }
export type Theme = "light" | "dark" | "system";
