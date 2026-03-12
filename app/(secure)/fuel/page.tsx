import { ResponsiveListPage } from "../components/ResponsiveListPage";
import type { RawSearchParams } from "../types";
import { FuelRepository } from "@/lib/repository/fuel/fuel";
import type { FuelDTO } from "@/dto/FuelDTO";

const FuelList = async ({
  searchParams,
}: {
  searchParams: Promise<RawSearchParams>;
}) => {
  const { page, contains } = await searchParams;

  const paginatedResponse = await FuelRepository.find({
    page: page ? (parseInt(page) ?? 1) : 1,
    ...(contains && { contains }),
  });

  return (
    <ResponsiveListPage<FuelDTO>
      paginatedResponse={paginatedResponse}
      routePrefix="fuel"
      contains={contains}
    />
  );
};

export default FuelList;
