"use client";

import { Box, Grid } from "@mui/material";
import { getDaysUntilWorkerReturns } from "@/app/utils";
import { addSeconds, format } from "date-fns";
import NumberCard from "./NumberCard";
import TextCard from "./TextCard";
import {
  BusAlert,
  Business,
  DirectionsBus,
  HourglassBottom,
  HourglassTop,
  Person,
} from "@mui/icons-material";
import type { Vacation, Worker, Department } from "@/app/types";
import { TitleTypography } from "../../components/TitleTypography";

function Dashboard({
  data,
}: {
  data: {
    vacations: Vacation[];
    departments: Department[];
    workers: Worker[];
    onVacationToday: Worker[];
    returningToday: Vacation[];
    upcomingLeaves: Vacation[];
    upcomingReturns: Vacation[];
  };
}) {
  const today = new Date().toLocaleDateString("pt-BR");
  const {
    vacations,
    departments,
    workers,
    onVacationToday,
    returningToday,
    upcomingLeaves,
    upcomingReturns,
  } = data;

  const onVacationTodayDetails = onVacationToday
    ? onVacationToday.map((worker) =>
        worker
          ? `${worker?.name} - retorna em ${getDaysUntilWorkerReturns(
              worker,
              vacations
            )} dias\n`
          : ""
      )
    : ["Ninguém folgando hoje."];

  const returningTodayDetails = returningToday
    ? returningToday.map(({ worker }) => worker?.name)
    : ["Ninguém retornando hoje."];

  const upcomingLeavesLines = upcomingLeaves?.map(({ worker, startDate }) => ({
    primary: worker?.name,
    secondary: `Saindo dia ${format(startDate, "dd/MM/yyyy")}`,
  }));

  const upcomingReturnsLines = upcomingReturns?.map(({ worker, endDate }) => ({
    primary: worker?.name,
    secondary: `Retornando dia ${format(addSeconds(endDate, 1), "dd/MM/yyyy")}`,
  }));

  return (
    <Box>
      <TitleTypography>{today}</TitleTypography>

      {/* Cards de estatísticas */}
      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 6 }}>
          <NumberCard
            label="Servidores"
            quantity={workers.length}
            icon={<Person color="primary" />}
          />
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <NumberCard
            label="Departamentos"
            quantity={departments.length}
            icon={<Business color="primary" />}
          />
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <NumberCard
            label="Folgando hoje"
            quantity={onVacationToday.length}
            icon={<BusAlert color="primary" />}
            details={onVacationTodayDetails}
          />
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <NumberCard
            label="Retornando hoje"
            quantity={returningToday.length}
            icon={<DirectionsBus color="primary" />}
            details={returningTodayDetails}
          />
        </Grid>
      </Grid>

      <Grid
        container
        spacing={3}
        sx={{ mt: 4 }}
        hidden={!upcomingLeavesLines && !upcomingReturnsLines}
      >
        {/* Saídas próximas */}
        <Grid
          size={{ xs: 12, md: upcomingReturnsLines.length ? 6 : 12 }}
          hidden={!upcomingLeavesLines}
        >
          <TextCard
            label="Próximas Saídas"
            icon={<HourglassTop color="warning" />}
            lines={upcomingLeavesLines}
          />
        </Grid>

        {/* Retornos próximos */}
        <Grid
          size={{ xs: 12, md: upcomingLeavesLines.length ? 6 : 12 }}
          hidden={!upcomingReturnsLines}
        >
          <TextCard
            label="Próximos Retornos"
            icon={<HourglassBottom color="success" />}
            lines={upcomingReturnsLines}
          />
        </Grid>
      </Grid>
    </Box>
  );
}

export { Dashboard };
