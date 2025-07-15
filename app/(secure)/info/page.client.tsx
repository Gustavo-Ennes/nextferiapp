"use client";

import { Box, Grid, Typography } from "@mui/material";
import {
  getDaysUntilWorkerReturns,
} from "@/app/utils";
import { addSeconds, format } from "date-fns";
import NumberCard from "./components/NumberCard";
import TextCard from "./components/TextCard";
import {
  BusAlert,
  Business,
  DirectionsBus,
  HourglassBottom,
  HourglassTop,
  Person,
} from "@mui/icons-material";
import { Vacation, Worker, Department } from "@/app/types";

function DashboardHome({
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

  return (
    <Box>
      <Typography variant="h4" mb={2} textAlign="center">
        {today}
      </Typography>

      {/* Cards de estatísticas */}
      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 6 }}>
          <NumberCard
            label="Trabalhadores"
            quantity={workers.length}
            icon={<Person />}
          />
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <NumberCard
            label="Departamentos"
            quantity={departments.length}
            icon={<Business />}
          />
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <NumberCard
            label="Folgando hoje"
            quantity={onVacationToday.length}
            icon={<BusAlert />}
            details={onVacationToday?.map(
              (worker) =>
                `${worker?.name} - retorna em ${getDaysUntilWorkerReturns(
                  worker,
                  vacations
                )} dias\n`
            )}
          />
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <NumberCard
            label="Retornando hoje"
            quantity={returningToday.length}
            icon={<DirectionsBus />}
            details={returningToday?.map(({ worker }) => worker?.name)}
          />
        </Grid>
      </Grid>

      <Grid container spacing={3} sx={{ mt: 4 }}>
        {/* Saídas próximas */}
        <Grid size={{ xs: 12, md: 6 }}>
          <TextCard
            label="Próximas Saídas"
            icon={<HourglassTop />}
            lines={upcomingLeaves?.map(({ worker, startDate }) => ({
              primary: worker?.name,
              secondary: `Saindo dia ${format(startDate, "dd/MM/yyyy")}`,
            }))}
          />
        </Grid>

        {/* Retornos próximos */}
        <Grid size={{ xs: 12, md: 6 }}>
          <TextCard
            label="Próximos Retornos"
            icon={<HourglassBottom />}
            lines={upcomingReturns?.map(({ worker, endDate }) => ({
              primary: worker?.name,
              secondary: `Retornando dia ${format(
                addSeconds(endDate, 1),
                "dd/MM/yyyy"
              )}`,
            }))}
          />
        </Grid>
      </Grid>
    </Box>
  );
}

export { DashboardHome };
