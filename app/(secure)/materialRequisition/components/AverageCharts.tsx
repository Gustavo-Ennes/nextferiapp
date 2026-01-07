import { PieChart, BarChart } from "@mui/x-charts";
import { Grid, Paper, Typography } from "@mui/material";

export const AverageCharts = ({
  pieData,
  barWeekly,
  fuelEvolution,
}: {
  pieData: any[];
  barWeekly: any[];
  fuelEvolution: any[];
}) => {
  return (
    <Grid container spacing={2}>
      {pieData.length > 1 && (
        <Grid size={12}>
          <Paper sx={{ py: 2 }}>
            <Typography variant="h5" pl={2} pb={2}>
              Distribuição
            </Typography>
            <PieChart
              height={300}
              series={[{ data: pieData, innerRadius: 50 }]}
            />
          </Paper>
        </Grid>
      )}

      <Grid size={12}>
        <Paper sx={{ py: 2 }}>
          <Typography variant="h5" pl={2} pb={2}>
            Evolução semanal
          </Typography>
          <BarChart
            height={350}
            xAxis={[{ scaleType: "band", data: barWeekly.map((b) => b.week) }]}
            series={[{ data: barWeekly.map((b) => b.total) }]}
          />
        </Paper>
      </Grid>

      <Grid size={12}>
        <Paper sx={{ py: 2 }}>
          <Typography variant="h5" pl={2} pb={2}>
            Evolução por combustível
          </Typography>

          <BarChart
            height={350}
            xAxis={[{ scaleType: "band", data: barWeekly.map((b) => b.week) }]}
            series={fuelEvolution.map((f) => ({
              data: f.data,
              label: f.fuel.toUpperCase(),
            }))}
          />
        </Paper>
      </Grid>
    </Grid>
  );
};
