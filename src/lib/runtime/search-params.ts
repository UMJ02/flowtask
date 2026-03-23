export type SearchParamValue = string | string[] | undefined;
export type SearchParamsRecord = Record<string, SearchParamValue>;

export function getSearchParam(value: SearchParamValue): string | undefined {
  if (typeof value === "string") {
    const trimmed = value.trim();
    return trimmed.length ? trimmed : undefined;
  }

  if (Array.isArray(value)) {
    const first = value.find((item) => typeof item === "string" && item.trim().length > 0);
    return first?.trim();
  }

  return undefined;
}

export function normalizeTaskFilters(searchParams?: SearchParamsRecord | null) {
  return {
    q: getSearchParam(searchParams?.q),
    status: getSearchParam(searchParams?.status),
    department: getSearchParam(searchParams?.department),
    due: getSearchParam(searchParams?.due),
    view: getSearchParam(searchParams?.view),
  };
}

export function normalizeProjectFilters(searchParams?: SearchParamsRecord | null) {
  return {
    q: getSearchParam(searchParams?.q),
    status: getSearchParam(searchParams?.status),
    department: getSearchParam(searchParams?.department),
    mode: getSearchParam(searchParams?.mode),
    client: getSearchParam(searchParams?.client),
  };
}

export function normalizeClientSearch(searchParams?: SearchParamsRecord | null) {
  return getSearchParam(searchParams?.q) ?? "";
}

export function toQueryString(searchParams?: SearchParamsRecord | null) {
  const params = new URLSearchParams();

  for (const [key, rawValue] of Object.entries(searchParams ?? {})) {
    const value = getSearchParam(rawValue);
    if (!value) continue;
    params.set(key, value);
  }

  return params.toString();
}
