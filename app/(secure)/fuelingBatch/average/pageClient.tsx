"use client";

import { Container, Grid, Paper, Typography } from "@mui/material";
import { useMemo, useState, useEffect } from "react";
import { AverageHeader } from "../components/average/AverageHeader";
import { AverageCharts } from "../components/average/AverageCharts";
import { AverageDepartmentTabs } from "../components/average/AverageDepartmentTabs";
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
import type { DepartmentDTO, FuelingBatchDTO } from "@/dto";
import type { FuelMixItem } from "../types";
import { isSameDay, toDate } from "date-fns";
import { startOfDaySP } from "@/app/utils";

export const FuelingBatchViewPage = ({
  fuelingBatches = [],
}: {
  fuelingBatches: FuelingBatchDTO[];
}) => {
  const [selectedDept, setSelectedDept] = useState<string>(ALL);
  const [selectedDate, setSelectedDate] = useState<string>(ALL);
  const [tabIndex, setTabIndex] = useState(0);

  const filteredBatches = useMemo(() => {
    let _filteredBatches = fuelingBatches;

    if (selectedDept !== ALL)
      _filteredBatches = _filteredBatches.filter((b) =>
        b.departments
          .map((d) => (d.department as DepartmentDTO)._id)
          .includes(selectedDept),
      );
    if (selectedDate !== ALL)
      _filteredBatches = _filteredBatches.filter((b) =>
        isSameDay(toDate(b.createdAt), toDate(selectedDate)),
      );

    return _filteredBatches.sort(
      (a, b) =>
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
    );
  }, [selectedDept, selectedDate]);

  const departments = useMemo(() => {
    const departments = fuelingBatches.map((b) =>
      b.departments.map((d) => d.department as DepartmentDTO),
    );

    return uniq(flatten(departments)).sort();
  }, [fuelingBatches]);

  const fuelingBatchesDates = useMemo(() => {
    return fuelingBatches.map((b) => startOfDaySP(toDate(b.createdAt)));
  }, [fuelingBatches]);

  const allDepartmentsInfo = useMemo(() => {
    const departmentFilteredBatches =
      selectedDept !== ALL
        ? filteredBatches.filter((fb) =>
            fb.departments
              .map((d) => (d.department as DepartmentDTO)._id)
              .includes(selectedDept),
          )
        : filteredBatches;

    return departmentFilteredBatches;
  }, [filteredBatches, selectedDept]);

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
      fuelingBatches: filteredBatches,
      selectedDepartment: selectedDept,
    });
  }, [filteredBatches]);

  const vehicleScatterData = useMemo(() => {
    return getVehicleCostVsLitersScatter({
      fuelingBatches: filteredBatches,
      selectedDepartment: selectedDept,
    });
  }, [filteredBatches]);

  const efficiencyScatter = useMemo(() => {
    return getEfficiencyScatter(filteredBatches, selectedDept);
  }, [filteredBatches]);

  const topConsumptionVehicles = useMemo(() => {
    return getTopVehiclesByConsumption({
      fuelingBatches: filteredBatches,
      selectedDepartment: selectedDept,
    });
  }, [filteredBatches]);

  const litersTrend = useMemo(() => {
    return getLitersTrend({
      fuelingBatches: filteredBatches,
      selectedDepartment: selectedDept,
    });
  }, [filteredBatches]);

  /** 🔹 Pizza principal */
  const pieData = useMemo(() => {
    return getPieData({
      fuelingBatches: filteredBatches,
      selectedDepartment: selectedDept,
    });
  }, [filteredBatches]);

  /** 🔹 Valor total da semana, por filtros */
  const totalValue = useMemo(() => {
    return allDepartmentsInfo.reduce(
      (fuelingBatchesSum, s: FuelingBatchDTO) => {
        return (
          fuelingBatchesSum +
          s.departments.reduce((deptSum, d) => {
            if (selectedDept === ALL) return deptSum + d.totals.totalValue;

            return selectedDept === (d.department as DepartmentDTO)._id
              ? deptSum + d.totals.totalValue
              : deptSum;
          }, 0)
        );
      },
      0,
    );
  }, [filteredBatches, selectedDept]);

  return (
    <Container>
      {filteredBatches.length > 0 ? (
        <Grid container spacing={2}>
          <Grid size={12}>
            <AverageHeader
              dates={fuelingBatchesDates}
              selectedDate={selectedDate}
              departments={departments}
              selectedDept={selectedDept}
              onChange={(department: string, date: string) => {
                setSelectedDept(department);
                setSelectedDate(date);
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
              dates={fuelingBatchesDates.map((d) => d.toISOString())}
            />
          </Grid>
          {/* LISTAGEM */}
          <Grid size={12}>
            <AverageDepartmentTabs
              departments={departments}
              fuelingBatches={fuelingBatches}
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
};
