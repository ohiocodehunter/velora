export function getPagination(query = {}, { defaultLimit = 12, maxLimit = 60 } = {}) {
  const page = Math.max(1, Number.parseInt(query.page, 10) || 1);
  const limit = Math.min(maxLimit, Math.max(1, Number.parseInt(query.limit, 10) || defaultLimit));
  return { page, limit, skip: (page - 1) * limit };
}

export function paginationMeta(total, { page, limit }) {
  const pages = Math.max(1, Math.ceil(total / limit));
  return {
    total,
    page,
    limit,
    pages,
    hasNext: page < pages,
    hasPrev: page > 1,
  };
}

export function parseSort(sort, allowed, fallback = '-createdAt') {
  if (!sort) return fallback;
  const value = String(sort);
  const field = value.startsWith('-') ? value.slice(1) : value;
  if (!allowed.includes(field)) return fallback;
  return value;
}

export function parseNumber(value) {
  if (value === undefined || value === '' || value === null) return undefined;
  const n = Number(value);
  return Number.isFinite(n) ? n : undefined;
}

export default { getPagination, paginationMeta, parseSort, parseNumber };
