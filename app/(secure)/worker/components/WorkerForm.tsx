"use client";

import {
  Box,
  Button,
  MenuItem,
  TextField,
  FormControl,
  InputLabel,
  Select,
  SelectChangeEvent,
  Grid,
} from "@mui/material";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { WorkerFormData, WorkerProps } from "../types";
import { DatePicker } from "@mui/x-date-pickers";

export function WorkerForm({ defaultValues, departments = [] }: WorkerProps) {
  const [form, setForm] = useState<WorkerFormData>({
    name: defaultValues?.name ?? "",
    matriculation: defaultValues?.matriculation ?? "",
    role: defaultValues?.role ?? "",
    department: defaultValues?.department?._id ?? null,
    admissionDate: defaultValues?.admissionDate ?? new Date(),
    registry: defaultValues?.registry ?? "",
    justification: defaultValues?.justification ?? "",
  });
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const router = useRouter();

  const onSubmit = async (formData: WorkerFormData) => {
    setIsSubmitting(true);
    const method = defaultValues ? "PUT" : "POST";
    const url = defaultValues
      ? `${process.env.NEXT_PUBLIC_URL}/api/worker/${defaultValues._id}`
      : `${process.env.NEXT_PUBLIC_URL}/api/worker`;

    const res = await fetch(url, {
      method,
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(formData),
    });

    if (!res.ok) {
      throw new Error("Erro ao salvar servidor");
    }

    setIsSubmitting(false);
    router.push("/worker");
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };
  const handleSelectChange = (e: SelectChangeEvent<string>) => {
    setForm((prev) => ({
      ...prev,
      department: e.target.value ?? null,
    }));
  };

  const handleDateChange = (date: Date | null) => {
    if (date) {
      setForm((prev) => ({
        ...prev,
        admissionDate: date,
      }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(form);
  };

  return (
    <Grid container spacing={2} component={"form"} onSubmit={handleSubmit}>
      <Grid size={12}>
        <TextField
          fullWidth
          size="small"
          required
          name="name"
          label="Nome"
          value={form.name}
          onChange={handleChange}
        />
      </Grid>

      <Grid size={6}>
        <TextField
          size="small"
          fullWidth
          required
          name="matriculation"
          label="Matrícula"
          value={form.matriculation}
          onChange={handleChange}
        />
      </Grid>

      <Grid size={6}>
        <TextField
          size="small"
          fullWidth
          required
          name="registry"
          label="Registro"
          value={form.registry}
          onChange={handleChange}
        />
      </Grid>

      <Grid size={12}>
        <TextField
          size="small"
          fullWidth
          required
          name="role"
          label="Cargo"
          value={form.role}
          onChange={handleChange}
        />
      </Grid>

      <Grid size={12}>
        <DatePicker
          sx={{ width: 1 }}
          formatDensity="dense"
          label="Início"
          value={new Date(form.admissionDate)}
          onChange={handleDateChange}
          format="dd/MM/yyyy"
          slotProps={{ textField: { size: "small" } }}
        />
      </Grid>

      <Grid size={12} component={FormControl} fullWidth>
        <InputLabel>Departamento</InputLabel>
        <Select
          name="department"
          value={form.department ?? ""}
          label="Departamento"
          onChange={handleSelectChange}
          size="small"
        >
          {departments.map((dept) => (
            <MenuItem key={dept._id} value={dept._id}>
              {dept.name}
            </MenuItem>
          ))}
        </Select>
      </Grid>
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
          fullWidth
        >
          {isSubmitting ? "Salvando..." : "Salvar"}
        </Button>
      </Grid>
    </Grid>
  );
}
