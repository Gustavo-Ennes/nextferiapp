"use client";

import { Container, Grid, Paper, Typography } from "@mui/material";
import { format } from "date-fns";
import { useMemo, useState, useEffect } from "react";
import { AverageHeader } from "../components/average/AverageHeader";
import { AverageCharts } from "../components/average/AverageCharts";
import { AverageDepartmentTabs } from "../components/average/AverageDepartmentTabs";
import type { WeeklyFuellingSummaryDTO } from "@/dto/WeeklyFuellingSummaryDTO";
import { pluck, sum } from "ramda";
import { getWeeklyFuelsTotals } from "../utils";
import type { FuelPriceVersionDTO } from "@/dto/FuelPriceVersionDTO";
import type { FuelDTO } from "@/dto/FuelDTO";

const ALL = "__ALL__";

export function WeeklySummaryView({
  summaries = [],
  fuels,
}: {
  summaries: WeeklyFuellingSummaryDTO[];
  fuels: FuelDTO[];
}) {
  const departments = useMemo(() => {
    const set = new Set<string>();
    summaries.forEach((s) => s.departments.forEach((d) => set.add(d.name)));
    return Array.from(set);
  }, [summaries]);

  const [selectedDept, setSelectedDept] = useState<string>(ALL);
  const [tabIndex, setTabIndex] = useState(0);

  /** 🔁 sincroniza aba com select */
  useEffect(() => {
    if (selectedDept === ALL) return;
    const idx = departments.indexOf(selectedDept);
    if (idx >= 0) setTabIndex(idx);
  }, [selectedDept, departments]);

  /** 🔹 Última semana */
  const current = summaries.at(-1);

  /** 🔹 Pizza principal */
  const pieData = useMemo(() => {
    if (!current) return [];

    if (selectedDept === ALL) {
      return current.departments.map((d) => ({
        id: d.name,
        label: d.name,
        value: sum(pluck("totalLiters", d.vehicles)),
      }));
    }

    const dept = current.departments.find((d) => d.name === selectedDept);
    if (!dept) return [];
    const fuelTotals = getWeeklyFuelsTotals(current);

    return fuelTotals.map(({ _id, name, currentPriceVersion }) => ({
      id: _id,
      label: name.toUpperCase(),
      value: currentPriceVersion
        ? (currentPriceVersion as FuelPriceVersionDTO).price
        : -1,
    }));
  }, [current, selectedDept]);

  /** 🔹 Valor total da semana, por filtros */
  const totalValue = useMemo(() => {
    if (!current) return 0;

    const filterDepartments = current.departments.filter(
      (d) => selectedDept === ALL || d.name === selectedDept,
    );

    return filterDepartments.reduce((deptSum, d) => {
      return (
        deptSum +
        d.vehicles.reduce(
          (vehicleSum, v) => vehicleSum + (v.totalValue ?? 0),
          0,
        )
      );
    }, 0);
  }, [current, selectedDept]);

  /** 🔹 Evolução semanal total */
  const barWeekly = useMemo(() => {
    return summaries.map((s) => {
      let total = 0;
      let totalValueWeek = 0;

      s.departments.forEach((d) => {
        if (selectedDept === ALL || d.name === selectedDept) {
          total += sum(pluck("totalLiters", d.vehicles));
          totalValueWeek += sum(pluck("totalValue", d.vehicles)) ?? 0;
        }
      });

      return {
        week: format(new Date(s.weekStart), "dd/MM/yy"),
        total,
        totalValue: totalValueWeek,
      };
    });
  }, [summaries, selectedDept]);

  /** 🔹 Evolução por combustível */
  const fuelEvolution = useMemo(() => {
    return fuels.map((fuel) => ({
      fuel: fuel.name,
      data: summaries.map((s) => {
        let total = 0;
        s.departments.forEach((d) => {
          if (selectedDept === ALL || d.name === selectedDept) {
            total += sum(pluck("totalLiters", d.vehicles));
          }
        });
        return total;
      }),
    }));
  }, [summaries, selectedDept]);

  return (
    <Container>
      {summaries.length > 0 ? (
        <Grid container spacing={2}>
          <Grid size={12}>
            <AverageHeader
              departments={departments}
              selectedDept={selectedDept}
              onChange={(department: string) => {
                setSelectedDept(department);
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
              barWeekly={barWeekly}
              fuelEvolution={fuelEvolution}
              pieData={pieData}
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
