import { startOfDaySP } from "@/app/utils";
import {
  Paper,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
} from "@mui/material";
import { ALL } from "../../utils";
import { toDate } from "date-fns";
import type { AverageHeaderProps } from "../../types";

export const AverageHeader = ({
  departments,
  selectedDept,
  selectedDate,
  onChange,
  dates,
}: AverageHeaderProps) => {
  return (
    <Paper sx={{ p: 2 }}>
      <Grid container spacing={2} alignItems="arround" justifyContent="center">
        <Grid size={12}>
          <Typography variant="h2">Consumo de Combustíveis</Typography>
        </Grid>

        <Grid size={{ md: 12, lg: 6 }}>
          <FormControl size="small" sx={{ mt: 1, minWidth: 240 }}>
            <InputLabel>Departamento</InputLabel>

            <Select
              value={selectedDept}
              label="Departamento"
              onChange={(e) => onChange(e.target.value, selectedDate)}
            >
              <MenuItem value="__ALL__">Todos</MenuItem>
              {departments.map((d) => (
                <MenuItem key={d.name} value={d._id}>
                  {d.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>

        <Grid size={{ md: 12, lg: 6 }} alignItems="end">
          <FormControl
            size="small"
            sx={{ mt: 1, minWidth: 240, float: "left" }}
          >
            <InputLabel>Semana</InputLabel>

            <Select
              value={selectedDate}
              label="Semana"
              onChange={(e) =>
                onChange(
                  selectedDept,
                  e.target.value !== ALL
                    ? startOfDaySP(toDate(e.target.value)).toISOString()
                    : ALL,
                )
              }
            >
              <MenuItem value="__ALL__">Todas</MenuItem>
              {dates.map((d, index) => (
                <MenuItem key={index} value={d.toISOString()}>
                  {d.toLocaleDateString()}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
      </Grid>
    </Paper>
  );
};
