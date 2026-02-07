import { isEmpty, prop, uniqBy } from "ramda";
import type { Response } from "../api/types";
import type { Entity } from "../types";
import type {
  CreateOrUpdateWeeklySummaryParam,
  FetchAllParam,
  SearchParams,
} from "./types";
import type { WeeklyFuellingSummaryDTO } from "@/dto/WeeklyFuellingSummaryDTO";

export const deleteWeeklySummary = async (id: string) => {
  const url = `/api/weeklyFuellingSummary/${id}`;
  const res = await fetch(url, {
    method: "delete",
    headers: {
      "Content-Type": "application/json",
    },
  });
  const { data: summary } = await res.json();

  return summary;
};

export const createOrUpdateWeeklySummary = async ({
  id,
  payload,
}: CreateOrUpdateWeeklySummaryParam) => {
  const url = `/api/weeklyFuellingSummary`;
  const res = await fetch(url, {
    method: "post",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ payload, id }),
  });
  const { data: summary } = await res.json();

  return summary;
};

export const fetchActualWeeklyFuellingSummary = async () => {
  const url = `/api/weeklyFuellingSummary/actual`;

  const { data }: Response<WeeklyFuellingSummaryDTO | null> = await (
    await fetch(url)
  ).json();

  return data;
};

// FD: Form Data
export const fetchAll = async <E extends Entity, FD>(
  params: FetchAllParam<E, FD>,
): Promise<E[]> => {
  const entities: E[] = [];
  const { repository, entityType, ...otherParams } = params;

  let pageNumber = otherParams?.page ?? 1;
  let hasNext = false;

  try {
    do {
      const { data: entityPageResults, hasNextPage } = await repository.find({
        ...otherParams,
        page: pageNumber++,
      });

      entities.push(...entityPageResults);
      hasNext = hasNextPage;
    } while (hasNext);
  } catch (err: unknown) {
    console.error(
      `Erro at fetching all for ${entityType}: ${(err as Error).message}.`,
    );
  }

  return uniqBy(prop("_id"), entities);
};

export const concatSearchParams = ({
  baseUrl,
  params,
}: {
  baseUrl: string;
  params?: SearchParams;
}): string => {
  if (params && !isEmpty(params)) {
    const url = "?".concat(
      Object.entries(params)
        .map(
          ([key, value]) =>
            `${key}=${
              key === "to" || key === "from"
                ? (value as Date).toISOString()
                : value
            }`,
        )
        .join("&"),
    );

    return baseUrl.concat(url);
  }
  return baseUrl;
};

export const limitText = (text: string): string =>
  text.length < 25 ? text : `${text.slice(0, 22)}...`;
