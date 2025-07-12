"use client";

import {
  Box,
  Button,
  TextField,
} from "@mui/material";
import { useEffect, useState } from "react";
import { DepartmentFormData, DepartmentProps } from "../types";

export function DepartmentForm({
  defaultValues,
  onSubmit,
  isSubmitting = false,
}: DepartmentProps) {
  const [form, setForm] = useState<DepartmentFormData>({
    name: "",
    responsible: "",
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
        name="responsible"
        label="Responsável"
        value={form.responsible}
        onChange={handleChange}
        multiline
        rows={3}
        sx={{ mb: 2 }}
      />

      <Box display="flex" justifyContent="flex-end">
        <Button type="submit" variant="contained" disabled={isSubmitting}>
          {isSubmitting ? "Salvando..." : "Salvar"}
        </Button>
      </Box>
    </form>
  );
}
