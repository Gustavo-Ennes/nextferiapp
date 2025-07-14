"use client";

import {
  Box,
  Button,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  SelectChangeEvent,
  TextField,
} from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { useEffect, useState } from "react";
import { VacationFormData, VacationProps, VacationType } from "../types";
import { workers } from "../../worker/mock";

export function VacationForm({
  defaultValues,
  onSubmit,
  isSubmitting = false,
}: VacationProps) {
  const [form, setForm] = useState<VacationFormData>({
    workerId: "",
    startDate: new Date(),
    type: "normal",
    duration: 15,
    period: "full",
    observation: "",
  });

  useEffect(() => {
    if (defaultValues) {
      setForm(defaultValues);
    }
  }, [defaultValues]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));

  const handleDateChange = (date: Date | null) => {
    if (date) {
      setForm((prev) => ({
        ...prev,
        startDate: date,
      }));
    }
  };

  const handleSelectChange = (e: SelectChangeEvent<string | number>) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleTypeChange = (value: VacationType) =>
    setForm((prev) => ({
      ...prev,
      type: value,
      duration: value === "normal" ? 15 : value === "license" ? 15 : 1,
      period: value === "dayOff" ? "full" : undefined,
    }));

  const handleWorkerChange = (value: string) =>
    setForm((prev) => ({
      ...prev,
      workerId: value,
    }));

  const durations = () => {
    if (form.type === "normal") return [15, 30];
    if (form.type === "license") return [15, 30, 45, 60, 75, 90];
    if (form.type === "dayOff") return [0.5, 1];
    return [];
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(form);
  };

  return (
    <form onSubmit={handleSubmit}>
      <FormControl fullWidth sx={{ mb: 2 }}>
        <InputLabel>Trabalhador</InputLabel>
        <Select
          name="type"
          value={form.workerId}
          label="Trabalhador"
          onChange={(e) => handleWorkerChange(e.target.value)}
        >
          {workers?.map((worker) => (
            <MenuItem key={worker._id} value={worker._id}>
              {worker.name}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <DatePicker
        sx={{ mb: 2 }}
        label="Início"
        value={form.startDate}
        onChange={handleDateChange}
        format="dd/MM/yyyy"
      />

      <FormControl fullWidth sx={{ mb: 2 }}>
        <InputLabel>Tipo de Folga</InputLabel>
        <Select
          name="type"
          value={form.type}
          label="Tipo de Folga"
          onChange={(e) => handleTypeChange(e.target.value as VacationType)}
        >
          <MenuItem value="normal">Férias</MenuItem>
          <MenuItem value="license">Licença-Prêmio</MenuItem>
          <MenuItem value="dayOff">Abonada</MenuItem>
        </Select>
      </FormControl>

      {form.type === "dayOff" && (
        <FormControl fullWidth sx={{ mb: 2 }}>
          <InputLabel>Período</InputLabel>
          <Select
            name="period"
            value={form.period}
            label="Período"
            onChange={handleSelectChange}
          >
            <MenuItem value="half">Meio Período</MenuItem>
            <MenuItem value="full">Dia Inteiro</MenuItem>
          </Select>
        </FormControl>
      )}

      {(form.type === "normal" || form.type === "license") && (
        <FormControl fullWidth sx={{ mb: 2 }}>
          <InputLabel>Duração</InputLabel>
          <Select
            name="duration"
            value={form.duration}
            label="Duração"
            onChange={handleSelectChange}
          >
            {durations().map((d) => (
              <MenuItem key={d} value={d}>
                {d} dias
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      )}

      {form.observation && (
        <TextField
          fullWidth
          name="observation"
          label="Observação"
          value={form.observation}
          onChange={handleInputChange}
          multiline
          rows={3}
          sx={{ mb: 2 }}
        />
      )}

      <Box display="flex" justifyContent="flex-end">
        <Button type="submit" variant="contained" disabled={isSubmitting}>
          {isSubmitting ? "Salvando..." : "Salvar"}
        </Button>
      </Box>
    </form>
  );
}
