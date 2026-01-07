"use client";

import { Container, Grid, Paper, Typography } from "@mui/material";
import { format } from "date-fns";
import { useMemo, useState, useEffect } from "react";
import { AverageHeader } from "../components/AverageHeader";
import { AverageCharts } from "../components/AverageCharts";
import { AverageDepartmentTabs } from "../components/AverageDepartmentTabs";
import type { WeeklyFuellingSummaryDTO } from "@/dto/WeeklyFuellingSummaryDTO";

const ALL = "__ALL__";

export function WeeklySummaryView({
  summaries = [],
}: {
  summaries: WeeklyFuellingSummaryDTO[];
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
        value: Object.values(d.fuelTotals).reduce((a, b) => a + b, 0),
      }));
    }

    const dept = current.departments.find((d) => d.name === selectedDept);
    if (!dept) return [];

    return Object.entries(dept.fuelTotals).map(([fuel, val]) => ({
      id: fuel,
      label: fuel.toUpperCase(),
      value: val,
    }));
  }, [current, selectedDept]);

  /** 🔹 Evolução semanal total */
  const barWeekly = useMemo(() => {
    return summaries.map((s) => {
      let total = 0;

      s.departments.forEach((d) => {
        if (selectedDept === ALL || d.name === selectedDept) {
          total += Object.values(d.fuelTotals).reduce((a, b) => a + b, 0);
        }
      });

      return {
        week: format(new Date(s.weekStart), "dd/MM/yy"),
        total,
      };
    });
  }, [summaries, selectedDept]);

  /** 🔹 Evolução por combustível */
  const fuelEvolution = useMemo(() => {
    const fuels = ["gas", "s10", "s500", "arla"];

    return fuels.map((fuel) => ({
      fuel,
      data: summaries.map((s) => {
        let total = 0;
        s.departments.forEach((d) => {
          if (selectedDept === ALL || d.name === selectedDept) {
            total += d.fuelTotals[fuel as keyof typeof d.fuelTotals] ?? 0;
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
