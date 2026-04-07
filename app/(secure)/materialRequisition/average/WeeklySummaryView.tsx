"use client";

import { Container, Grid, Paper, Typography } from "@mui/material";
import { useMemo, useState, useEffect } from "react";
import { AverageHeader } from "../components/average/AverageHeader";
import { AverageCharts } from "../components/average/AverageCharts";
import { AverageDepartmentTabs } from "../components/average/AverageDepartmentTabs";
import type { WeeklyFuellingSummaryDTO } from "@/dto/WeeklyFuellingSummaryDTO";
import { flatten, uniq } from "ramda";
import {
  getEfficiencyScatter,
  getFuelMix,
  getLitersTrend,
  getPieData,
  getTopVehiclesByConsumption,
  getVehicleCostVsLitersScatter,
} from "../utils";
import type { FuelDTO } from "@/dto/FuelDTO";
import type { DepartmentDTO } from "@/dto";
import type { FuelMixItem } from "../types";
import { toDate } from "date-fns";
import { startOfDaySP } from "@/app/utils";

const ALL = "__ALL__";

export function WeeklySummaryView({
  summaries = [],
}: {
  summaries: WeeklyFuellingSummaryDTO[];
  fuels: FuelDTO[];
}) {
  const [selectedDept, setSelectedDept] = useState<string>(ALL);
  const [selectedWeek, setSelectedWeek] = useState<string>(ALL);
  const [tabIndex, setTabIndex] = useState(0);

  const departments = useMemo(() => {
    const departments = summaries.map((s) =>
      s.departments.map((d) => d.department as DepartmentDTO),
    );
    return uniq(flatten(departments)).sort();
  }, [summaries]);

  const weeks = useMemo(() => {
    return summaries.map((s) => startOfDaySP(toDate(s.weekStart)));
  }, [summaries]);

  const allDepartmentsInfo = useMemo(() => {
    return summaries.map((s) => s.departments).flat();
  }, [summaries]);

  /** 🔁 sincroniza aba com select */
  useEffect(() => {
    const allIsSelected = selectedDept === ALL;
    const idx = allIsSelected
      ? 0
      : departments.findIndex((d) => d._id === selectedDept) + 1;

    if (idx >= 0) setTabIndex(idx);
  }, [selectedDept, departments]);

  /** 🔹 Última semana */
  const current = summaries.at(-1);

  const fuelMix: FuelMixItem[] = useMemo(() => {
    return getFuelMix({
      summaries,
      selectedDepartment: selectedDept,
      selectedWeek,
    });
  }, [summaries, selectedDept, selectedWeek]);

  const vehicleScatterData = useMemo(() => {
    return getVehicleCostVsLitersScatter({
      summaries,
      selectedDepartment: selectedDept,
      selectedWeek,
    });
  }, [summaries, selectedDept, selectedWeek]); // TODO verificar erro ao selecionar data e departamento

  const efficiencyScatter = useMemo(() => {
    return getEfficiencyScatter(summaries, selectedDept);
  }, [summaries, selectedDept]);

  const topConsumptionVehicles = useMemo(() => {
    return getTopVehiclesByConsumption({
      summaries,
      selectedDepartment: selectedDept,
      selectedWeek,
    });
  }, [summaries, selectedDept, selectedWeek]);

  const litersTrend = useMemo(() => {
    return getLitersTrend({
      summaries,
      selectedDepartment: selectedDept,
      selectedWeek,
    });
  }, [summaries, selectedDept]);

  /** 🔹 Pizza principal */
  const pieData = useMemo(() => {
    return getPieData({
      summaries,
      selectedDepartment: selectedDept,
      selectedWeek,
    });
  }, [current, selectedDept, selectedWeek]);

  /** 🔹 Valor total da semana, por filtros */
  const totalValue = useMemo(() => {
    const filterDepartments = allDepartmentsInfo.filter(
      (d) =>
        selectedDept === ALL ||
        (d.department as DepartmentDTO)._id === selectedDept,
    );

    return filterDepartments.reduce((deptSum, d) => {
      return deptSum + d.totalValue;
    }, 0);
  }, [current, selectedDept]);

  return (
    <Container>
      {summaries.length > 0 ? (
        <Grid container spacing={2}>
          <Grid size={12}>
            <AverageHeader
              weeks={weeks}
              selectedWeek={selectedWeek}
              departments={departments}
              selectedDept={selectedDept}
              onChange={(department: string, week: string) => {
                setSelectedDept(department);
                setSelectedWeek(week);
              }}
            />
          </Grid>
          {/* GRÁFICOS TOPO */}
          <Grid size={12}>
            <Paper sx={{ p: 2, mb: 1 }}>
              <Typography fontWeight={600}>
                Valor total {selectedDept === ALL ? "geral" : "do departamento"}
                :
              </Typography>
              <Typography variant="h5" color="primary">
                R$ {totalValue.toFixed(2)}
              </Typography>
            </Paper>

            <AverageCharts
              pieData={pieData}
              fuelMix={fuelMix}
              selectedDepartment={selectedDept}
              vehicleScatterSeries={vehicleScatterData}
              efficiencyScatter={efficiencyScatter}
              topConsumptionVehicles={topConsumptionVehicles}
              litersTrend={litersTrend}
              weeks={weeks.map((w) => w.toISOString())}
            />
          </Grid>
          {/* LISTAGEM */}
          <Grid size={12}>
            <AverageDepartmentTabs
              departments={departments}
              summaries={summaries}
              tabIndex={tabIndex}
              onChange={(newIndex: number) => setTabIndex(newIndex)}
            />
          </Grid>
        </Grid>
      ) : (
        <Paper sx={{ p: 3 }}>
          <Typography textAlign={"center"}>
            Não há resumos semanais a exibir.
          </Typography>
        </Paper>
      )}
      {/* HEADER */}
    </Container>
  );
}
