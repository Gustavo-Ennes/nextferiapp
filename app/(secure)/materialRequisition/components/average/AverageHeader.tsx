import {
  Paper,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";

export const AverageHeader = ({
  departments,
  selectedDept,
  onChange,
}: {
  departments: string[];
  selectedDept: string;
  onChange: (v: string) => void;
}) => {
  return (
    <Paper sx={{ p: 2 }}>
      <Typography variant="h2">Consumo de Combustíveis</Typography>

      <FormControl size="small" sx={{ mt: 1, minWidth: 240 }}>
        <InputLabel>Departamento</InputLabel>
        <Select
          value={selectedDept}
          label="Departamento"
          onChange={(e) => onChange(e.target.value)}
        >
          <MenuItem value="__ALL__">Todos</MenuItem>
          {departments.map((d) => (
            <MenuItem key={d} value={d}>
              {d}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </Paper>
  );
};
