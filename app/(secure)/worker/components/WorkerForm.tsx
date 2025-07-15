"use client";

import { Box, Button, MenuItem, TextField } from "@mui/material";
import { useEffect, useState } from "react";
import { WorkerFormData, WorkerProps } from "../types";
import { departments } from "../../../api/department/mock";

export function WorkerForm({
  defaultValues,
  onSubmit,
  isSubmitting = false,
}: WorkerProps) {
  const [form, setForm] = useState<WorkerFormData>({
    name: "",
    matriculation: "",
    role: "",
    department: null,
  });

  useEffect(() => {
    if (defaultValues) {
      setForm(defaultValues);
    }
  }, [defaultValues]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
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
        name="role"
        label="Cargo"
        value={form.role}
        onChange={handleChange}
        sx={{ mb: 2 }}
      />

      <TextField
        fullWidth
        required
        name="departmentId"
        label="Departamento"
        select
        value={form.department?._id ?? ""}
        onChange={handleChange}
        sx={{ mb: 2 }}
      >
        {/* Substitua pelos departamentos reais */}
        {departments.map((dept) => (
          <MenuItem key={dept._id} value={dept._id}>
            {dept.name}
          </MenuItem>
        ))}
      </TextField>

      <Box display="flex" justifyContent="flex-end">
        <Button type="submit" variant="contained" disabled={isSubmitting}>
          {isSubmitting ? "Salvando..." : "Salvar"}
        </Button>
      </Box>
    </form>
  );
}
