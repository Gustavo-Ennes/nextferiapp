import { startOfDaySP } from "@/app/utils";
import type { DepartmentDTO } from "@/dto";
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

export const AverageHeader = ({
  departments,
  selectedDept,
  selectedWeek,
  onChange,
  weeks,
}: {
  departments: DepartmentDTO[];
  selectedDept: string;
  selectedWeek: string;
  onChange: (d: string, w: string) => void;
  weeks: Date[];
}) => {
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
              onChange={(e) => onChange(e.target.value, selectedWeek)}
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
              value={selectedWeek}
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
              {weeks.map((w, index) => (
                <MenuItem key={index} value={w.toISOString()}>
                  {w.toLocaleDateString()}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
      </Grid>
    </Paper>
  );
};
