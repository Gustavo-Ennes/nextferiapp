"use client";

import { Box, Grid, Typography, Chip, Badge } from "@mui/material";
import { capitalizeFirstLetter, getDaysUntilWorkerReturns } from "@/app/utils";
import { format } from "date-fns";
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
import { RoleIcon } from "./RoleIcons";

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
    workersByRole: Partial<Record<string, Worker[]>>;
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
    workersByRole,
  } = data;

  const activeWorkers = workers.filter(
    (worker) => worker.isActive === true
  ).length;
  const inactiveWorkers = workers.filter(
    (worker) => worker.isActive === false
  ).length;
  const externalWorkers = workers.filter(
    (worker) => worker.isExternal == true
  ).length;
  const internalWorkers = workers.filter(
    (worker) => worker.isExternal === false
  ).length;

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

  const returningTodayDetails = returningToday.length
    ? returningToday.map(({ worker }) => worker?.name)
    : ["Ninguém retornando hoje."];

  const workerDetails = [
    `${inactiveWorkers} servidores inativos ou desligados.`,
    `${internalWorkers} servidores internos.`,
    `${externalWorkers} servidores externos.`,
  ];

  const upcomingLeavesLines = upcomingLeaves?.map(({ worker, startDate }) => ({
    primary: worker?.name,
    secondary: `Saindo dia ${format(startDate, "dd/MM/yyyy")}`,
  }));

  const upcomingReturnsLines = upcomingReturns?.map(
    ({ worker, returnDate }) => ({
      primary: worker?.name,
      secondary: `Retornando dia ${format(returnDate as Date, "dd/MM/yyyy")}`,
    })
  );

  return (
    <Box>
      <TitleTypography other={{ textAlign: "center" }}>
        Departamento de Transporte
      </TitleTypography>
      <Typography textAlign={"center"} fontSize={22} mb={2} color="secondary">
        {today}
      </Typography>

      <Grid container spacing={3}>
        <Grid
          container
          size={12}
          spacing={1}
          justifyContent="center"
          alignItems="center"
        >
          {Object.keys(workersByRole)
            .sort((a, b) => a.localeCompare(b))
            .map((key) => (
              <Grid size="auto" key={`role-chip-${key}`}>
                <Badge
                  badgeContent={workersByRole[key]?.length ?? 0}
                  color="primary"
                >
                  <Chip
                    icon={<RoleIcon role={key} />}
                    label={`${capitalizeFirstLetter(key)}`}
                    variant="outlined"
                    color="primary"
                    size="small"
                  />
                </Badge>
              </Grid>
            ))}
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <NumberCard
            label="Servidores"
            quantity={activeWorkers}
            icon={<Person color="primary" />}
            details={workerDetails}
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
