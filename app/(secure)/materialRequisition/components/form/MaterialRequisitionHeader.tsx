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
} from "../../utils";
import { MaterialRequisitionCard } from "./MaterialRequisitionCard";
import { useMaterialRequisitionForm } from "@/context/MaterialRequisitionFormContext";
import type { WeeklyFuellingSummaryDTO } from "@/dto";
import { assoc } from "ramda";

export const MaterialRequisitionHeader = ({
  summary,
}: {
  summary: WeeklyFuellingSummaryDTO;
}) => {
  const { selectedDepartment } = useMaterialRequisitionForm();

  return (
    <Grid container justifyContent="center" alignItems="start" spacing={1}>
      <Grid>
        <MaterialRequisitionCard
          data={{ total: summary.departments.length.toString() }}
          icon={<Business />}
          label="Departamentos"
          departmentName
        />
      </Grid>

      <Grid>
        <MaterialRequisitionCard
          icon={<DirectionsCar />}
          data={{
            total: countAllCars(summary).toString(),
            ...(selectedDepartment && {
              selected: countAllCars(
                assoc("departments", [selectedDepartment], summary),
              ).toString(),
            }),
          }}
          label={"Carros"}
        />
      </Grid>

      <Grid>
        <MaterialRequisitionCard
          icon={<LocalGasStation />}
          data={{
            total: countAllFuelings(summary).toString(),
            ...(selectedDepartment && {
              selected: countAllFuelings(
                assoc("departments", [selectedDepartment], summary),
              ).toString(),
            }),
          }}
          label={"Abastecimentos"}
        />
      </Grid>

      <Grid>
        <MaterialRequisitionCard
          icon={<WaterDrop />}
          data={{
            total: countAllLiters(summary).toFixed(3),
            ...(selectedDepartment && {
              selected: countAllLiters(
                assoc("departments", [selectedDepartment], summary),
              ).toFixed(3),
            }),
          }}
          label={"Litragem"}
        />
      </Grid>

      <Grid>
        <MaterialRequisitionCard
          icon={<Straighten />}
          data={{
            total: countAllKms(summary).toFixed(1),
            ...(selectedDepartment && {
              selected: countAllKms(
                assoc("departments", [selectedDepartment], summary),
              ).toFixed(1),
            }),
          }}
          label={"Km's rodados"}
        />
      </Grid>
    </Grid>
  );
};
