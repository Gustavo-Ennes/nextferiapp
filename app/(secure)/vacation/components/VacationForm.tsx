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
import { Key, useState } from "react";
import { useRouter } from "next/navigation";
import { VacationFormData, VacationProps, VacationType } from "../types";
import { capitalizeName } from "@/app/utils";

export function VacationForm({
  defaultValues,
  id,
  workers,
  bosses,
  type = "normal",
}: VacationProps) {
  const [form, setForm] = useState<VacationFormData>({
    worker: defaultValues?.worker?._id ?? null,
    boss: defaultValues?.boss?._id ?? null,
    startDate: defaultValues?.startDate
      ? new Date(defaultValues.startDate)
      : new Date(),
    type: defaultValues?.type || type,
    duration: (defaultValues?.duration || defaultValues?.daysQtd) ?? 15,
    period: defaultValues?.period ?? "full",
    observation: defaultValues?.observation ?? "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const onSubmit = async (formData: VacationFormData) => {
    setIsSubmitting(true);
    const method = id ? "PUT" : "POST";
    const url = id
      ? `${process.env.NEXT_PUBLIC_URL}/api/vacation/${id}`
      : `${process.env.NEXT_PUBLIC_URL}/api/vacation`;

    const res = await fetch(url, {
      method,
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(formData),
    });

    if (!res.ok) throw new Error("Erro ao salvar folga");

    setIsSubmitting(false);
    router.push("/vacation");
  };

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
      duration:
        value === "normal" || value === "vacation"
          ? 15
          : value === "license"
          ? 15
          : 1,
      period: value === "dayOff" ? "full" : undefined,
    }));

  const handleWorkerChange = (value: string) =>
    setForm((prev) => ({
      ...prev,
      worker: value,
    }));

  const handleBossChange = (value: string) =>
    setForm((prev) => ({
      ...prev,
      boss: value,
    }));

  const durations = () => {
    if (form.type === "normal" || form.type === "vacation") return [15, 30];
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
        <InputLabel>Servidor</InputLabel>
        <Select
          name="type"
          value={form.worker ?? ""}
          label="Servidor"
          onChange={(e) => handleWorkerChange(e.target.value)}
        >
          {workers?.map((worker) => (
            <MenuItem key={worker._id as Key} value={worker._id as string}>
              {worker.name}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <DatePicker
        sx={{ mb: 2 }}
        label="Início"
        value={new Date(form.startDate)}
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

      {(form.type === "normal" ||
        form.type === "vacation" ||
        form.type === "license") && (
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

      <FormControl fullWidth sx={{ mb: 2 }}>
        <InputLabel>Aprovante</InputLabel>
        <Select
          name="boss"
          value={form.boss ?? ""}
          label="Aprovante"
          onChange={(e) => handleBossChange(e.target.value)}
        >
          {bosses?.map((boss) => (
            <MenuItem key={boss._id as Key} value={boss._id as string}>
              {capitalizeName(boss?.worker?.name ?? boss?.name)}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

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
