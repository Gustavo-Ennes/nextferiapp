"use client";

import {
  Box,
  Button,
  FormControl,
  Grid,
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
    router.push(`/vacation${type !== "normal" ? `/${type}` : ""}`);
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
      ...(name === "period" &&
        type === "dayOff" && { duration: value === "half" ? 0.5 : 1 }),
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
    <Grid container component={"form"} spacing={2} onSubmit={handleSubmit}>
      <Grid size={12} component={FormControl}>
        <InputLabel>Servidor</InputLabel>
        <Select
          name="type"
          value={form.worker ?? ""}
          label="Servidor"
          onChange={(e) => handleWorkerChange(e.target.value)}
          disabled={!!defaultValues}
          fullWidth
          size="small"
        >
          {workers?.map((worker) => (
            <MenuItem key={worker._id as Key} value={worker._id as string}>
              {worker.name}
            </MenuItem>
          ))}
        </Select>
      </Grid>

      <Grid size={6}>
        <DatePicker
          sx={{ width: 1 }}
          label="Início"
          value={new Date(form.startDate)}
          onChange={handleDateChange}
          format="dd/MM/yyyy"
          slotProps={{ textField: { size: "small" } }}
        />
      </Grid>

      <Grid size={6} component={FormControl}>
        <InputLabel>Tipo de Folga</InputLabel>
        <Select
          name="type"
          value={form.type}
          label="Tipo de Folga"
          onChange={(e) => handleTypeChange(e.target.value as VacationType)}
          disabled={!!defaultValues}
          fullWidth
          size="small"
        >
          <MenuItem value="normal">Férias</MenuItem>
          <MenuItem value="license">Licença-Prêmio</MenuItem>
          <MenuItem value="dayOff">Abonada</MenuItem>
        </Select>
      </Grid>

      {form.type === "dayOff" && (
        <Grid size={6} component={FormControl}>
          <InputLabel>Período</InputLabel>
          <Select
            name="period"
            value={form.period}
            label="Período"
            onChange={handleSelectChange}
            fullWidth
            size="small"
          >
            <MenuItem value="half">Meio Período</MenuItem>
            <MenuItem value="full">Dia Inteiro</MenuItem>
          </Select>
        </Grid>
      )}

      {(form.type === "normal" ||
        form.type === "vacation" ||
        form.type === "license") && (
        <Grid size={6} component={FormControl}>
          <InputLabel>Duração</InputLabel>
          <Select
            name="duration"
            value={form.duration}
            label="Duração"
            onChange={handleSelectChange}
            fullWidth
            size="small"
          >
            {durations().map((d) => (
              <MenuItem key={d} value={d}>
                {d} dias
              </MenuItem>
            ))}
          </Select>
        </Grid>
      )}

      <Grid size={6} component={FormControl}>
        <InputLabel>Aprovante</InputLabel>
        <Select
          name="boss"
          value={form.boss ?? ""}
          label="Aprovante"
          onChange={(e) => handleBossChange(e.target.value)}
          fullWidth
          size="small"
        >
          {bosses?.map((boss) => (
            <MenuItem key={boss._id as Key} value={boss._id as string}>
              {capitalizeName(boss?.worker?.name ?? boss?.name)}
            </MenuItem>
          ))}
        </Select>
      </Grid>

      {form.observation && (
        <Grid size={12}>
          <TextField
            size="small"
            name="observation"
            label="Observação"
            value={form.observation}
            onChange={handleInputChange}
            multiline
            fullWidth
            rows={3}
          />
        </Grid>
      )}

      <Grid
        component={Box}
        size={2}
        offset={10}
        alignItems={"center"}
        justifyContent={"right"}
      >
        <Button
          type="submit"
          variant="contained"
          disabled={isSubmitting}
          sx={{ width: 1 }}
        >
          {isSubmitting ? "Salvando..." : "Salvar"}
        </Button>
      </Grid>
    </Grid>
  );
}
