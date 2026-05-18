"use client";

import { Container, Grid, Paper, Typography } from "@mui/material";
import { useMemo, useState, useEffect } from "react";
import { AverageHeader } from "../components/average/AverageHeader";
import { AverageCharts } from "../components/average/AverageCharts";
import { AverageDepartmentTabs } from "../components/average/AverageDepartmentTabs";
import type { WeeklyFuellingSummaryDTO } from "@/dto/WeeklyFuellingSummaryDTO";
import { flatten, uniq } from "ramda";
import {
  ALL,
  getEfficiencyScatter,
  getFuelMix,
  getLitersTrend,
  getPieData,
  getTopVehiclesByConsumption,
  getVehicleCostVsLitersScatter,
  toMonetary,
} from "../utils";
import type { DepartmentDTO } from "@/dto";
import type { FuelMixItem } from "../types";
import { isSameDay, toDate } from "date-fns";
import { startOfDaySP } from "@/app/utils";

export function WeeklySummaryView({
  summaries = [],
}: {
  summaries: WeeklyFuellingSummaryDTO[];
}) {
  const [selectedDept, setSelectedDept] = useState<string>(ALL);
  const [selectedWeek, setSelectedWeek] = useState<string>(ALL);
  const [tabIndex, setTabIndex] = useState(0);

  const filteredSummaries = useMemo(() => {
    let filteredSummaries = summaries;

    if (selectedDept !== ALL)
      filteredSummaries = filteredSummaries.filter((s) =>
        s.departments
          .map((d) => (d.department as DepartmentDTO)._id)
          .includes(selectedDept),
      );
    if (selectedWeek !== ALL)
      filteredSummaries = filteredSummaries.filter((s) =>
        isSameDay(toDate(s.weekStart), toDate(selectedWeek)),
      );

    return filteredSummaries.sort(
      (a, b) =>
        new Date(a.weekStart).getTime() - new Date(b.weekStart).getTime(),
    );
  }, [selectedDept, selectedWeek]);

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
    const departmentFilteredSummaries =
      selectedDept !== ALL
        ? filteredSummaries.filter((fs) =>
            fs.departments
              .map((d) => (d.department as DepartmentDTO)._id)
              .includes(selectedDept),
          )
        : filteredSummaries;

    return departmentFilteredSummaries;
  }, [filteredSummaries, selectedDept]);

  /** 🔁 sincroniza aba com select */
  useEffect(() => {
    const allIsSelected = selectedDept === ALL;
    const idx = allIsSelected
      ? 0
      : departments.findIndex((d) => d._id === selectedDept) + 1;

    if (idx >= 0) setTabIndex(idx);
  }, [selectedDept, departments]);

  const fuelMix: FuelMixItem[] = useMemo(() => {
    return getFuelMix({
      summaries: filteredSummaries,
      selectedDepartment: selectedDept,
    });
  }, [filteredSummaries]);

  const vehicleScatterData = useMemo(() => {
    return getVehicleCostVsLitersScatter({
      summaries: filteredSummaries,
      selectedDepartment: selectedDept,
    });
  }, [filteredSummaries]);

  const efficiencyScatter = useMemo(() => {
    return getEfficiencyScatter(filteredSummaries, selectedDept);
  }, [filteredSummaries]);

  const topConsumptionVehicles = useMemo(() => {
    return getTopVehiclesByConsumption({
      summaries: filteredSummaries,
      selectedDepartment: selectedDept,
    });
  }, [filteredSummaries]);

  const litersTrend = useMemo(() => {
    return getLitersTrend({
      summaries: filteredSummaries,
      selectedDepartment: selectedDept,
    });
  }, [filteredSummaries]);

  /** 🔹 Pizza principal */
  const pieData = useMemo(() => {
    return getPieData({
      summaries: filteredSummaries,
      selectedDepartment: selectedDept,
    });
  }, [filteredSummaries]);

  /** 🔹 Valor total da semana, por filtros */
  const totalValue = useMemo(() => {
    return allDepartmentsInfo.reduce(
      (summarySum, s: WeeklyFuellingSummaryDTO) => {
        return (
          summarySum +
          s.departments.reduce((deptSum, d) => {
            if (selectedDept === ALL) return deptSum + d.totalValue;

            return selectedDept === (d.department as DepartmentDTO)._id
              ? deptSum + d.totalValue
              : deptSum;
          }, 0)
        );
      },
      0,
    );
  }, [filteredSummaries, selectedDept]);

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
                {toMonetary(totalValue)}
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
