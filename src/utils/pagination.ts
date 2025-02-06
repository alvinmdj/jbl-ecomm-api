export const DEFAULT_PAGE = 1;
export const DEFAULT_PAGE_SIZE = 8;

export type Pagination = {
  page: number;
  limit: number;
  totalRecords: number;
  totalPages: number;
};

export function calculateTotalPage(totalRecords: number, limit: number) {
  if (totalRecords === 0) return 0;

  const totalPages = Math.ceil(totalRecords / limit);

  return totalPages;
}
