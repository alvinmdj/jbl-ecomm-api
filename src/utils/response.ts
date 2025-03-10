import { Pagination } from "@/utils/pagination";

export function createAPIResponse<T>({
  data,
  pagination,
}: {
  data: T;
  pagination?: Pagination;
}) {
  return {
    data,
    meta: pagination,
  };
}
