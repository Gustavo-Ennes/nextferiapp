import { PieChart, BarChart, LineChart, ScatterChart } from "@mui/x-charts";
import { Grid, Paper, Typography } from "@mui/material";
import { ScatterTooltip } from "./ScatterTooltip";
import { format, toDate } from "date-fns";
import type { AverageChartProps } from "../types";

export const AverageCharts = ({
  pieData,
  fuelMix,
  selectedDepartment,
  vehicleScatterSeries,
  efficiencyScatter,
  litersTrend,
  topConsumptionVehicles,
  dates,
}: AverageChartProps) => {
  return (
    <Grid container spacing={2} justifyContent={"start"} alignItems={"start"}>
      <Grid size={12}>
        <Paper sx={{ py: 2, height: "100%" }}>
          <Typography variant="h5" pl={2} pb={2}>
            Distribuição{" "}
            {selectedDepartment === "__ALL__" ? "geral" : "do departamento"}
          </Typography>
          <PieChart
            height={300}
            series={[{ data: pieData, innerRadius: 50 }]}
          />
        </Paper>
      </Grid>

      <Grid size={12}>
        <Paper sx={{ py: 2, height: "100%" }}>
          <Typography variant="h5" pl={2} pb={2}>
            {selectedDepartment === "__ALL__"
              ? "Litros X Km's por departamento"
              : "Litros X Km's por veículo"}
          </Typography>
          <ScatterChart
            series={vehicleScatterSeries}
            xAxis={[{ label: "Litragem" }]}
            yAxis={[{ label: "Quilometragem" }]}
            slots={{
              tooltip: () => (
                <ScatterTooltip
                  series={vehicleScatterSeries}
                  labels={{
                    id: "Veículo",
                    x: "Litros",
                    y: "Quilometragem",
                  }}
                />
              ),
            }}
            slotProps={{ tooltip: { trigger: "item" } }}
          />
        </Paper>
      </Grid>

      {selectedDepartment === "__ALL__" && (
        <Grid size={12}>
          <Paper sx={{ py: 2, height: "100%" }}>
            <Typography variant="h5" pl={2} pb={2}>
              Distribuição de combustível por tipo
            </Typography>
            <PieChart
              height={300}
              series={[{ data: fuelMix, arcLabel: (item) => `${item.label}` }]}
            />
          </Paper>
        </Grid>
      )}

      <Grid size={12}>
        <Paper sx={{ py: 2, height: "100%" }}>
          <Typography variant="h5" pl={2} pb={2}>
            Veículos que mais consumiram
          </Typography>
          <BarChart
            layout="horizontal"
            dataset={topConsumptionVehicles as any[]}
            yAxis={[{ scaleType: "band", dataKey: "prefix" }]}
            series={[
              { dataKey: "totalLiters", label: "Litros" },
              { dataKey: "totalValue", label: "Custo (R$)" },
            ]}
            height={300}
            margin={{ left: 80, right: 24, top: 16, bottom: 40 }}
          />
        </Paper>
      </Grid>

      <Grid size={12}>
        <Paper sx={{ py: 2, height: "100%" }}>
          <Typography variant="h5" pl={2} pb={2}>
            Evolução semanal{" "}
            {selectedDepartment === "__ALL__" ? "geral" : "do departamento"}
          </Typography>
          <LineChart
            xAxis={[
              {
                scaleType: "band",
                data: dates.map((d) => format(toDate(d), "dd/MM/yyyy")),
              },
            ]}
            series={litersTrend.map((series) => ({
              label: series.label,
              data: series.data
                .sort(
                  (a, b) =>
                    new Date(a.date).getTime() - new Date(b.date).getTime(),
                )
                .map((p) => p.totalLiters),
            }))}
            height={300}
          />
        </Paper>
      </Grid>

      <Grid size={12}>
        <Paper sx={{ py: 2, height: "100%" }}>
          <Typography variant="h5" pl={2} pb={2}>
            Eficiência{" "}
            {selectedDepartment === "__ALL__" ? "geral" : "do departamento"}
          </Typography>

          <ScatterChart
            series={efficiencyScatter}
            xAxis={[{ label: "Km/L" }]}
            yAxis={[{ label: "R$ Km" }]}
            slots={{
              tooltip: () => (
                <ScatterTooltip
                  series={efficiencyScatter}
                  labels={{
                    id:
                      selectedDepartment === "__ALL__"
                        ? "Departamento"
                        : "Veículo",
                    x: "Km/L",
                    y: "R$ Km",
                  }}
                />
              ),
            }}
            slotProps={{
              tooltip: { trigger: "item" },
            }}
          />
        </Paper>
      </Grid>
    </Grid>
  );
};
