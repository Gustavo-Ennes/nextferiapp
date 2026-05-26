import { ResponsiveListPage } from "../../components/ResponsiveListPage";
import type { RawSearchParams, SearchParams } from "../../types";
import { parseBool } from "../../components/utils";
import type { VacationDTO } from "@/dto";
import { VacationRepository } from "@/lib/repository/vacation/vacation";

const LicenseList = async ({
  searchParams,
}: {
  searchParams: Promise<RawSearchParams>;
}) => {
  const { page, contains, cancelled, past, now, future } = await searchParams;
  const cancelledBool = parseBool(cancelled);
  const pastBool = parseBool(past);
  const futureBool = parseBool(future);
  const nowBool = parseBool(now);

  const hasTimeParam =
    (pastBool !== null && pastBool !== undefined) ||
    (futureBool !== null && futureBool !== undefined) ||
    (nowBool !== null && nowBool !== undefined);

  const params: SearchParams = {
    type: "license",
    page: page ? (parseInt(page) ?? 1) : 1,
    ...(contains && { contains }),
    cancelled:
      cancelledBool !== null && cancelledBool !== undefined
        ? cancelledBool
        : false,
    time: hasTimeParam
      ? {
          past: pastBool ?? undefined,
          future: futureBool ?? undefined,
          now: nowBool ?? undefined,
        }
      : undefined,
  };

  const paginatedResponse = await VacationRepository.find(params);

  return (
    <ResponsiveListPage<VacationDTO>
      paginatedResponse={paginatedResponse}
      routePrefix="vacation"
      pageTitle="Licenças-Prêmio"
      vacationType="license"
      contains={contains}
    />
  );
};

export default LicenseList;
