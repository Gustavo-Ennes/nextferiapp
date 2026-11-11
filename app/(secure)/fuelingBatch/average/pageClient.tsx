"use client";

import { Container, Grid, Paper, Typography } from "@mui/material";
import { useMemo, useState } from "react";
import { AverageHeader } from "../components/average/AverageHeader";
import { AverageCharts } from "../components/average/AverageCharts";
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
import { AverageDepartmentAnalyticsCard } from "../components/average/AverageDepartmentAnalyticsCard";

export const FuelingBatchViewPage = ({
  fuelingBatches = [],
}: {
  fuelingBatches: FuelingBatchDTO[];
}) => {
  const [selectedDept, setSelectedDept] = useState<string>(ALL);
  const [selectedDate, setSelectedDate] = useState<string>(ALL);

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

  const selectedBatch = useMemo(() => {
    const batch = fuelingBatches.find((b) =>
      isSameDay(toDate(b.createdAt), toDate(selectedDate)),
    );
    return batch;
  }, [selectedDate]);

  const departments = useMemo(() => {
    const departments = fuelingBatches.map((b) =>
      b.departments.map((d) => d.department as DepartmentDTO),
    );

    return uniq(flatten(departments)).sort();
  }, [fuelingBatches]);

  const fuelingBatchesDates = useMemo(() => {
    return fuelingBatches.map((b) => startOfDaySP(toDate(b.createdAt)));
  }, [fuelingBatches]);

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

  /** 🔹 Valor total da semana ou todo, por filtros */
  const totalValue = useMemo(() => {
    if (selectedDept !== ALL) {
      return filteredBatches.reduce((fuelingBatchesSum, s: FuelingBatchDTO) => {
        const dept = s.departments.find(
          (d) => (d.department as DepartmentDTO)._id === selectedDept,
        );
        return fuelingBatchesSum + (dept?.totals?.totalValue || 0);
      }, 0);
    } else {
      return filteredBatches.reduce((fuelingBatchesSum, s: FuelingBatchDTO) => {
        return fuelingBatchesSum + s.totals.totalValue;
      }, 0);
    }
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
            <AverageDepartmentAnalyticsCard
              fuelingBatches={selectedBatch ? [selectedBatch] : fuelingBatches}
              selectedDepartmentId={selectedDept}
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
