import {
  Business,
  DirectionsCar,
  LocalGasStation,
  WaterDrop,
  Straighten,
} from "@mui/icons-material";
import { Grid } from "@mui/material";
import {
  countAllCars,
  countAllFuelings,
  countAllLiters,
  countAllKms,
} from "../utils";
import type { TabData } from "@/lib/repository/weeklyFuellingSummary/types";
import { MaterialRequisitionCard } from "./MaterialRequisitionCard";
import { useMaterialRequisitionForm } from "@/context/MaterialRequisitionFormContext";

export const MaterialRequisitionHeader = ({
  tabsData,
}: {
  tabsData: TabData[];
}) => {
  const { selectedTabData } = useMaterialRequisitionForm();

  return (
    <Grid container justifyContent="center" alignItems="start" spacing={1}>
      <Grid>
        <MaterialRequisitionCard
          data={{ total: tabsData.length.toString() }}
          icon={<Business />}
          label="Departamentos"
          departmentName
        />
      </Grid>

      <Grid>
        <MaterialRequisitionCard
          icon={<DirectionsCar />}
          data={{
            total: countAllCars(tabsData).toString(),
            ...(selectedTabData && {
              selected: countAllCars([selectedTabData]).toString(),
            }),
          }}
          label={"Carros"}
        />
      </Grid>

      <Grid>
        <MaterialRequisitionCard
          icon={<LocalGasStation />}
          data={{
            total: countAllFuelings(tabsData).toString(),
            ...(selectedTabData && {
              selected: countAllFuelings([selectedTabData]).toString(),
            }),
          }}
          label={"Abastecimentos"}
        />
      </Grid>

      <Grid>
        <MaterialRequisitionCard
          icon={<WaterDrop />}
          data={{
            total: countAllLiters(tabsData).toString(),
            ...(selectedTabData && {
              selected: countAllLiters([selectedTabData]).toString(),
            }),
          }}
          label={"Litragem"}
        />
      </Grid>

      <Grid>
        <MaterialRequisitionCard
          icon={<Straighten />}
          data={{
            total: countAllKms(tabsData).toString(),
            ...(selectedTabData && {
              selected: countAllKms([selectedTabData]).toString(),
            }),
          }}
          label={"Km's rodados"}
        />
      </Grid>
    </Grid>
  );
};
