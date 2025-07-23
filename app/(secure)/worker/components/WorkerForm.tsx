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
    <form onSubmit={handleSubmit}>
      <TextField
        fullWidth
        required
        name="name"
        label="Nome"
        value={form.name}
        onChange={handleChange}
        sx={{ mb: 2 }}
      />

      <TextField
        fullWidth
        required
        name="matriculation"
        label="Matrícula"
        value={form.matriculation}
        onChange={handleChange}
        sx={{ mb: 2 }}
      />

      <TextField
        fullWidth
        required
        name="registry"
        label="Registro"
        value={form.registry}
        onChange={handleChange}
        sx={{ mb: 2 }}
      />

      <TextField
        fullWidth
        required
        name="role"
        label="Cargo"
        value={form.role}
        onChange={handleChange}
        sx={{ mb: 2 }}
      />

      <DatePicker
        sx={{ mb: 2 }}
        label="Início"
        value={new Date(form.admissionDate)}
        onChange={handleDateChange}
        format="dd/MM/yyyy"
      />

      <FormControl fullWidth sx={{ mb: 2 }}>
        <InputLabel>Departamento</InputLabel>
        <Select
          name="department"
          value={form.department ?? ""}
          label="Departamento"
          onChange={handleSelectChange}
        >
          {departments.map((dept) => (
            <MenuItem key={dept._id} value={dept._id}>
              {dept.name}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <Box display="flex" justifyContent="flex-end">
        <Button type="submit" variant="contained" disabled={isSubmitting}>
          {isSubmitting ? "Salvando..." : "Salvar"}
        </Button>
      </Box>
    </form>
  );
}
