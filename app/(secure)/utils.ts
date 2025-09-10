import { isEmpty } from "ramda";
import type { PaginatedResponse, Response } from "../api/types";
import type { Entity } from "../types";
import type { FetchManyParam, FetchOneParam, SearchParams } from "./types";

export const fetchOne = async <T extends Entity>({
  id,
  type,
  params,
}: FetchOneParam): Promise<T> => {
  const baseUrl = `${process.env.NEXT_PUBLIC_URL}/api/${type}/${id}`;
  const url = concatSearchParams({ baseUrl, params });

  const { data: entity }: Response<T> = await (await fetch(url)).json();

  return entity as T;
};

export const fetchPaginatedByPage = async <T extends Entity>({
  type,
  params,
}: FetchManyParam): Promise<PaginatedResponse<T>> => {
  const baseUrl = `${process.env.NEXT_PUBLIC_URL}/api/${type}`;
  const url = concatSearchParams({ baseUrl, params });

  const paginatedResponse: PaginatedResponse<T> = await (
    await fetch(url)
  ).json();

  return paginatedResponse;
};

export const fetchAllPaginated = async <T extends Entity>({
  type,
  params,
}: FetchManyParam): Promise<T[]> => {
  const entities: T[] = [];
  let pageNumber = params?.page ?? 1;
  let hasNext = false;

  try {
    do {
      const { data: entityPageResults, hasNextPage } =
        await fetchPaginatedByPage<T>({
          type,
          params: { ...params, page: pageNumber++ },
        });

      entities.push(...entityPageResults);
      hasNext = hasNextPage;
    } while (hasNext);
  } catch (err: unknown) {
    console.error(
      `Erro at fetching all paginated ${type}: ${(err as Error).message}.`
    );
  }

  return entities;
};

const concatSearchParams = ({
  baseUrl,
  params,
}: {
  baseUrl: string;
  params?: SearchParams;
}): string => {
  if (params && !isEmpty(params)) {
    const url = "?".concat(
      Object.entries(params)
        .map(([key, value]) => `${key}=${value}`)
        .join("&")
    );

    return baseUrl.concat(url);
  }
  return baseUrl;
};

export const limitText = (text: string): string =>
  text.length < 25 ? text : `${text.slice(0, 22)}...`;
