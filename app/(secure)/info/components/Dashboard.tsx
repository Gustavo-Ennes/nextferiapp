"use client";

import { Box, Grid, Typography, Chip, Badge } from "@mui/material";
import { capitalizeFirstLetter } from "@/app/utils";
import NumberCard from "./NumberCard";
import TextCard from "./TextCard";
import {
  BusAlert,
  Business,
  DirectionsBus,
  HourglassBottom,
  HourglassTop,
  Inventory,
  LocalGasStation,
  Person,
  PriorityHigh,
  Receipt,
} from "@mui/icons-material";
import { TitleTypography } from "../../components/TitleTypography";
import { RoleIcon } from "./RoleIcons";
import type { DashboardParam } from "../types";
import {
  getDepartmentDetails,
  getFuelLines,
  getPurchaseOrderLines,
  getVacationDetails,
  getWeeklyFuellingSummaryLines,
  getWorkerDetails,
  getWorkersByStatus,
} from "../utils";

function Dashboard({ data }: { data: DashboardParam }) {
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
    purchaseOrders,
    fuels,
    weeklyFuellingSummaries,
  } = data;

  const { activeWorkers } = getWorkersByStatus(workers);
  const {
    onVacationDetails,
    returningDetails,
    upcomingLeavesLines,
    upcomingReturnsLines,
  } = getVacationDetails({
    onVacationToday,
    returningToday,
    vacations,
    upcomingLeaves,
    upcomingReturns,
  });

  const workerDetails = getWorkerDetails(workers);
  const departmentDetails = getDepartmentDetails(departments);

  const purchaseOrderLines = getPurchaseOrderLines(purchaseOrders);
  const fuelLines = getFuelLines(fuels);
  const weeklyFuellingSummaryLines = getWeeklyFuellingSummaryLines(
    weeklyFuellingSummaries,
  );

  const purchaseOrderSectionIcon =
    purchaseOrders.invalid.length > 0 ? (
      <>
        <Inventory color="error" />
        <PriorityHigh color="error" />
      </>
    ) : purchaseOrders.partialInvalid.length > 0 ? (
      <Inventory color="warning" />
    ) : (
      <Inventory color="success" />
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
            details={departmentDetails}
          />
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <NumberCard
            label="Folgando hoje"
            quantity={onVacationToday.length}
            icon={<BusAlert color="primary" />}
            details={onVacationDetails}
          />
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <NumberCard
            label="Retornando hoje"
            quantity={returningToday.length}
            icon={<DirectionsBus color="primary" />}
            details={returningDetails}
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
          size={{ xs: 12, md: upcomingReturnsLines.length > 0 ? 6 : 12 }}
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
          size={{ xs: 12, md: upcomingLeavesLines.length > 0 ? 6 : 12 }}
          hidden={!upcomingReturnsLines}
        >
          <TextCard
            label="Próximos Retornos"
            icon={<HourglassBottom color="success" />}
            lines={upcomingReturnsLines}
          />
        </Grid>
      </Grid>

      <Grid container spacing={3} sx={{ mt: 4 }}>
        <Grid size={{ xs: 12, md: 6 }}>
          <TextCard
            label="Pedidos de combustíveis"
            icon={purchaseOrderSectionIcon}
            lines={purchaseOrderLines}
          />
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <TextCard
            label="Combustíveis"
            icon={<LocalGasStation color="primary" />}
            lines={fuelLines}
          />
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <TextCard
            label="Ciclos de notas"
            icon={<Receipt color="primary" />}
            lines={weeklyFuellingSummaryLines}
          />
        </Grid>
      </Grid>
    </Box>
  );
}

export { Dashboard };
